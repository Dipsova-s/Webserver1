﻿using EveryAngle.Logging;
using EveryAngle.Security.Certificates;
using EveryAngle.Shared.Globalization.Helpers;
using EveryAngle.WebClient.Service.LogHandlers;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using RestSharp;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Cryptography.X509Certificates;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Configuration;
using System.Web.Http;
using System.Web.Script.Serialization;

namespace EveryAngle.WebClient.Service.HttpHandlers
{
    public class RequestManager
    {
        private const string CSM_URI = "csm/componentservices";
        private RestClient client { get; set; }
        public RestClient Client
        {
            get
            {
                return client;
            }
        }

        private string uri { get; set; }
        private HttpStatusCode responseStatus { get; set; }

        public HttpStatusCode ResponseStatus
        {
            get { return responseStatus; }
        }

        private RequestManager(string uri)
        {
            this.uri = uri;
            if (client == null)
            {
                bool.TryParse(WebConfigurationManager.AppSettings["WebServiceBackendEnableSSL"], out bool isHttps);
                int timeout = int.Parse(WebConfigurationManager.AppSettings["RestClientTimeout"]);
                string appserverUrl = Shared.Helpers.UrlHelper.GetWebServerBackendUrl();
                string appserverPort = GetASPort(uri, isHttps);
                string webServerBackendUrlWithPort = string.Format("{0}:{1}", appserverUrl, appserverPort);

                client = new RestClient(webServerBackendUrlWithPort)
                {
                    Timeout = timeout
                };

                AttachClientCert(isHttps);
            }
        }

        private string GetASPort(string uri, bool isHttps)
        {
            string port = WebConfigurationManager.AppSettings["WebServiceBackendNOAPort"];
         
            if (IsCSMUri(uri) && isHttps)
            {
                //when websites are running on the ssl, all of the csm uri has to be comunicate over NOA+(csmPort) 
                int csmPort = 1;
                port = (int.Parse(port) + csmPort).ToString();
            }

            return port;
        }

        private bool IsCSMUri(string uri)
        {
            return !string.IsNullOrEmpty(uri) && uri.Equals(CSM_URI, StringComparison.InvariantCultureIgnoreCase);
        }

        private void AttachClientCert(bool isHttps)
        {
            //the request to csm must always included client cert
            if (IsCSMUri(uri) && isHttps)
            {
                string thumbprint = WebConfigurationManager.AppSettings["WebServiceCertificateThumbPrint"];
                X509Certificate certificate = CertificateUtils.GetCertificateFromStore(thumbprint);

                if (certificate == null)
                    throw new HttpException(422, $"Could not find the certificate {thumbprint} from the store.");

                client.ClientCertificates = new X509CertificateCollection();
                client.ClientCertificates.Add(certificate);
            }
        }

        #region "Public"

        public void InitializeRequestClient(RestClient restClient)
        {
            client = restClient;
        }


        public static RequestManager Initialize(string requestUrl)
        {
            return new RequestManager(requestUrl);
        }

        public static string GetProxyRequestUrl()
        {
            return GetProxyRequestUrl(null);
        }

        public static string GetProxyRequestUrl(HttpContext context)
        {
            HttpContext currentContext = context ?? HttpContext.Current;
            string url = currentContext.Request.RawUrl;
            string transparentProxyPath = ConfigurationManager.AppSettings["TransparentProxyPath"];

            int indexOfProxyPath = url.ToLowerInvariant().LastIndexOf(transparentProxyPath.ToLowerInvariant(), StringComparison.InvariantCulture);
            url = url.Substring(indexOfProxyPath + transparentProxyPath.Length, (url.Length - (indexOfProxyPath + transparentProxyPath.Length)));
            url = url.Replace(transparentProxyPath, "");

            return url;
        }

        public Task<JObject> GetAsync(bool thrownException)
        {
            string requestUrl = this.uri;
            requestUrl = VerifyURL(requestUrl);

            var request = new RestRequest(requestUrl, Method.GET);
            CloneRequestHeader(request);
            request.RequestFormat = DataFormat.Json;

            LogManager.WriteLogRequestContent(Method.GET, requestUrl, request);

            var completeResult = new TaskCompletionSource<JObject>();
            client.ExecuteAsync(request, response =>
            {
                try
                {
                    LogManager.WriteLogResponseContent(Method.GET, requestUrl, response);
                    VerifyResponseStatus(response);

                    completeResult.SetResult(JObject.Parse(response.Content));
                }
                catch (Exception error)
                {
                    Log.SendException("GetAsync", error);

                    var message = CloneResponseHeader(response);
                    HttpResponseException httpException = new HttpResponseException(message);
                    if (!thrownException)
                        completeResult.SetException(httpException);
                    else
                        throw httpException;
                }
            });

            return completeResult.Task;
        }

        public Task<JObject> GetAsync()
        {
            return GetAsync(false);
        }

        public Task<JObject> DeleteAsync(HttpContext context, bool thrownException)
        {
            string requestUrl = this.uri;
            requestUrl = VerifyURL(requestUrl);

            var request = new RestRequest(requestUrl, Method.DELETE);
            CloneRequestHeader(request, context.Request);
            request.RequestFormat = DataFormat.Json;

            LogManager.WriteLogRequestContent(Method.DELETE, requestUrl, request);

            var completeResult = new TaskCompletionSource<JObject>();
            client.ExecuteAsync(request, response =>
            {
                try
                {
                    LogManager.WriteLogResponseContent(Method.DELETE, requestUrl, response);
                    VerifyResponseStatus(response);
                }
                catch (Exception error)
                {
                    Log.SendException(string.Format("DeleteAsync: {0}", requestUrl), error);

                    var message = CloneResponseHeader(response);
                    HttpResponseException httpException = new HttpResponseException(message);
                    if (!thrownException)
                        completeResult.SetException(httpException);
                    else
                        throw httpException;
                }
            });

            return completeResult.Task;
        }

        public Task<JObject> DeleteAsync()
        {
            return DeleteAsync(HttpContext.Current, true);
        }

        public byte[] PostBinary(string content)
        {
            string requestUrl = this.uri;
            requestUrl = VerifyURL(requestUrl);
            var request = new RestRequest(requestUrl, Method.POST);
            CloneRequestHeader(request);
            request.RequestFormat = DataFormat.Json;

            AddContentToBodyRequest(Method.POST, content, request);

            LogManager.WriteLogRequestContent(Method.POST, requestUrl, request);
            var response = client.Execute(request);
            LogManager.WriteLogResponseContent(Method.POST, requestUrl, response);

            VerifyResponseStatus(response);

            return response.RawBytes;
        }

        public JObject PostBinary(byte[] packageFile, string fileName)
        {
            string requestUrl = this.uri;
            requestUrl = VerifyURL(requestUrl);
            var request = new RestRequest(requestUrl, Method.POST);
            CloneRequestHeader(request);
            request.RequestFormat = DataFormat.Json;

            AddContentToBodyRequest(Method.POST, "", request);
            if (packageFile != null)
            {
                request.Files.Add(FileParameter.Create(fileName, packageFile, fileName, "application/zip"));
            }

            LogManager.WriteLogRequestContent(Method.POST, requestUrl, request);
            var response = client.Execute(request);
            LogManager.WriteLogResponseContent(Method.POST, requestUrl, response);

            VerifyResponseStatus(response);

            return null;
        }

        public JObject Run(Method method, string content, DataFormat requestFormat)
        {
            return Execute(requestFormat, uri, method, content);
        }
        public JObject Run(Method method, string content)
        {
            return Run(method, content, DataFormat.Json);
        }
        public JObject Run(Method method)
        {
            return Run(method, string.Empty, DataFormat.Json);
        }
        public JObject Run()
        {
            return Run(Method.GET, string.Empty, DataFormat.Json);
        }

        public JArray RunArray(Method method)
        {
            return RunArray(method, string.Empty, DataFormat.Json);
        }
        public JArray RunArray(Method method, string content, DataFormat requestFormat)
        {
            return ExecuteArray(requestFormat, uri, method, content);
        }

        public byte[] GetBinary()
        {
            string requestUrl = this.uri;
            requestUrl = VerifyURL(requestUrl);

            var request = new RestRequest(requestUrl, Method.GET);
            CloneRequestHeader(request);
            request.RequestFormat = DataFormat.Json;

            LogManager.WriteLogRequestContent(Method.GET, requestUrl, request);
            var response = client.Execute(request);
            LogManager.WriteLogResponseContent(Method.GET, requestUrl, response);

            VerifyResponseStatus(response);

            if (response.StatusCode != HttpStatusCode.OK && response.StatusCode != HttpStatusCode.Created)
            {
                dynamic errorResponse = JsonConvert.DeserializeObject<dynamic>(response.Content);
                string errorMessage = errorResponse.message.Value;
                throw new HttpException(response.StatusCode.GetHashCode(), errorMessage);
            }

            return response.RawBytes;
        }
        public byte[] GetBinary(ref string contentDisposition)
        {
            string requestUrl = this.uri;
            requestUrl = VerifyURL(requestUrl);

            var request = new RestRequest(requestUrl, Method.GET);
            CloneRequestHeader(request);
            request.RequestFormat = DataFormat.Json;

            LogManager.WriteLogRequestContent(Method.GET, requestUrl, request);
            var response = client.Execute(request);
            LogManager.WriteLogResponseContent(Method.GET, requestUrl, response);

            VerifyResponseStatus(response);

            contentDisposition = GetDownloadFileContentDisposition(response);

            if (response.StatusCode != HttpStatusCode.OK && response.StatusCode != HttpStatusCode.Created)
            {
                dynamic errorResponse = JsonConvert.DeserializeObject<dynamic>(response.Content);
                string errorMessage = errorResponse.message.Value;
                throw new HttpException(response.StatusCode.GetHashCode(), errorMessage);
            }

            return response.RawBytes;
        }

        public string GetFileDownloadName(string contentDisposition)
        {
            string[] wordList = new string[] { "filename*=UTF-8''", "filename=" };
            string fileDownloadName = contentDisposition.Split(';').FirstOrDefault(x => x.ToLower().Contains("filename"));
            foreach (string word in wordList)
            {
                fileDownloadName = fileDownloadName.Replace(word, string.Empty);
            }
            return fileDownloadName.Trim();
        }

        #endregion

        #region "Private"

        private JObject Execute(DataFormat requestFormat, string requestUrl, Method method, string content)
        {
            string responseContent = ExecuteForContent(requestFormat, requestUrl, method, content);
            return !string.IsNullOrEmpty(responseContent) ? JObject.Parse(responseContent) : new JObject();
        }

        private JArray ExecuteArray(DataFormat requestFormat, string requestUrl, Method method, string content)
        {
            string responseContent = ExecuteForContent(requestFormat, requestUrl, method, content);
            return !string.IsNullOrEmpty(responseContent) ? JArray.Parse(responseContent) : new JArray();
        }

        private string ExecuteForContent(DataFormat requestFormat, string requestUrl, Method method, string content)
        {
            string newRequestUrl = VerifyURL(requestUrl);

            RestRequest request = new RestRequest(newRequestUrl, method);
            CloneRequestHeader(request);
            request.RequestFormat = requestFormat;

            AddContentToBodyRequest(method, content, request);

            LogManager.WriteLogRequestContent(method, newRequestUrl, request);
            var response = client.Execute(request);
            LogManager.WriteLogResponseContent(method, newRequestUrl, response);
            VerifyResponseStatus(response);

            return response?.Content;

        }

        private JObject Execute(DataFormat requestFormat, string requestUrl, Method method)
        {
            return Execute(requestFormat, requestUrl, method, string.Empty);
        }

        private string VerifyURL(string requestUrl)
        {
            if (requestUrl.Contains("http"))
            {
                Uri myUri = new Uri(requestUrl);
                return myUri.PathAndQuery;
            }
            return requestUrl;
        }

        private void VerifyResponseStatus(IRestResponse response)
        {
            responseStatus = response.StatusCode;
            if ((response.StatusCode.GetHashCode() > 300) || (response.StatusCode.GetHashCode() < 200))
            {
                if (response.StatusCode.GetHashCode() == 0)
                {
                    throw new HttpException(503, "Unable to connect to the remote server");
                }
                else
                {
                    throw new HttpException(response.StatusCode.GetHashCode(), response.Content);
                }
            }
            else
            {
                CloneResponseHeader(response);
            }
        }

        private void CloneRequestHeader(RestRequest request, HttpRequest requestContext)
        {
            request.AddHeader("Accept-Encoding", "gzip,deflate");

            foreach (var key in requestContext.Headers.AllKeys)
            {
                SkipRequestHeadersKey(request, requestContext, key);
            }
            request.AddHeader("Accept-Language", "");

            HttpCookieCollection allCookies = requestContext.Cookies;
            for (int i = 0; i < allCookies.Count; i++)
            {
                System.Web.HttpCookie newCookie = allCookies[i];
                request.AddCookie(newCookie.Name, newCookie.Value);
            }
        }

        private void CloneRequestHeader(RestRequest request)
        {
            CloneRequestHeader(request, HttpContext.Current.Request);
        }

        private static HttpResponseMessage CloneResponseHeader(IRestResponse response)
        {
            HttpResponseMessage message = new HttpResponseMessage(response.StatusCode)
            {
                Content = new StringContent(response.Content)
            };

            foreach (Parameter responseHeader in response.Headers)
            {
                message.Content.Headers.TryAddWithoutValidation(responseHeader.Name, responseHeader.Value.ToString());

                if (HttpContext.Current != null &&
                    HttpContext.Current.Response.Headers[responseHeader.Name] == null &&
                    !responseHeader.Name.Equals("content-disposition", StringComparison.InvariantCultureIgnoreCase) &&
                    !responseHeader.Name.Equals("content-length", StringComparison.InvariantCultureIgnoreCase))
                {
                    HttpContext.Current.Response.Headers.Set(responseHeader.Name, responseHeader.Value.ToString());
                }
            }

            if (HttpContext.Current != null)
            {
                HttpContext.Current.Request.Cookies.Clear();
                HttpContext.Current.Response.Cookies.Clear();
            }

            foreach (RestResponseCookie cookie in response.Cookies)
            {
                System.Web.HttpCookie newCookie = new System.Web.HttpCookie(cookie.Name, cookie.Value);
                if (HttpContext.Current != null)
                {
                    string cookiePath = string.Empty;
                    string adminUrl = EveryAngle.Shared.Helpers.WebConfigHelper.GetAppSettingByKey("ManagementConsoleUrl");
                    if (!string.IsNullOrEmpty(adminUrl))
                    {
                        adminUrl = adminUrl.Replace("/", "");
                        string appPath = HttpContext.Current.Request.ApplicationPath.ToLower().Replace("/", "");
                        if (!adminUrl.Equals(appPath, StringComparison.OrdinalIgnoreCase))
                        {
                            cookiePath = Regex.Match(HttpContext.Current.Request.ApplicationPath.ToLower() + '/', @"^/[^/]+/").Value;
                        }
                    }

                    newCookie.Path = string.IsNullOrEmpty(cookiePath) ? "/" : cookiePath;
                    newCookie.Expires = cookie.Expires;

                    HttpContext.Current.Response.Cookies.Set(newCookie);
                }
            }


            /* M4-32522: clean EASECTOKEN
             * - EASECTOKEN will be duplicated in request
             * After you add a cookie by using the HttpResponse.Cookies collection,
             * the cookie is immediately available in the HttpRequest.Cookies collection,
             * even if the response has not been sent to the client.
             * ref: https://msdn.microsoft.com/en-us/library/system.web.httprequest.cookies(v=vs.110).aspx
            */
            string tokenName = "EASECTOKEN";
            if (HttpContext.Current != null && HttpContext.Current.Request.Cookies[tokenName] != null)
            {
                // use the last EASECTOKEN
                for (int i = HttpContext.Current.Request.Cookies.Count - 1; i >= 0; i--)
                {
                    if (HttpContext.Current.Request.Cookies[i].Name == tokenName)
                    {
                        var token = HttpContext.Current.Request.Cookies[i];
                        HttpContext.Current.Request.Cookies.Remove(tokenName);
                        HttpContext.Current.Request.Cookies.Add(token);
                        break;
                    }
                }
            }

            return message;
        }

        private static bool ValidateJSON(string s)
        {
            try
            {
                JToken.Parse(s);
                return true;
            }
            catch
            {
                return false;
            }
        }

        private static void AddContentToBodyRequest(Method method, string content, RestRequest request)
        {
            if ((method != Method.GET) && (content != ""))
            {
                if (!ValidateJSON(content))
                {
                    request.AddParameter("text/json", content, ParameterType.RequestBody);
                }
                else
                {
                    var serializer = new JavaScriptSerializer();
                    if (content.Length > serializer.MaxJsonLength)
                        throw new HttpException(
                            HttpStatusCode.BadRequest.GetHashCode(),
                            ResourceHelper.GetLocalization("JSONLengthExceeded", Thread.CurrentThread.CurrentUICulture.TwoLetterISOLanguageName));

                    request.AddBody(serializer.Deserialize<dynamic>(content));
                }
            }
        }

        private static void SkipRequestHeadersKey(RestRequest request, HttpRequest requestContext, string key)
        {
            // check header key does not in the list
            // check header key in the request form
            string[] skipHeaders = new string[] { "Connection", "Host", "Accept-Language" };
            if (!skipHeaders.Contains(key) && requestContext.Form[key] != null)
            {
                request.AddHeader(key, requestContext.Form[key]);
            }
        }

        private string GetDownloadFileContentDisposition(IRestResponse response)
        {
            IList<Parameter> headers = response.Headers;
            Parameter contentDisposition = headers
                .FirstOrDefault(x => x.Name.Equals("content-disposition", StringComparison.InvariantCultureIgnoreCase));
            return contentDisposition != null ? contentDisposition.Value.ToString() : string.Empty;
        }

        #endregion

    }
}