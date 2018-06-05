using EveryAngle.Logging;
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
        private RestClient _client { get; set; }
        public RestClient Client
        {
            get
            {
                return _client;
            }
        }

        private List<string> requestUrlList { get; set; }
        private HttpStatusCode responseStatus { get; set; }

        public HttpStatusCode ResponseStatus
        {
            get { return responseStatus; }
        }

        private RequestManager(List<string> requestUrlList)
        {
            if (_client == null)
            {
                string webServerBackendUrl = Shared.Helpers.UrlHelper.GetWebServerBackendUrl();
                string webServiceBackendNOAPort = WebConfigurationManager.AppSettings["WebServiceBackendNOAPort"];
                int restClientTimeout = int.Parse(WebConfigurationManager.AppSettings["RestClientTimeout"]);

                string webServerBackendUrlWithPort = string.Format("{0}:{1}", webServerBackendUrl, webServiceBackendNOAPort);
                _client = new RestClient(webServerBackendUrlWithPort)
                {
                    Timeout = restClientTimeout
                };
            }

            this.requestUrlList = requestUrlList;
        }

        #region "Public"

        public void InitializeRequestClient(RestClient restClient)
        {
            _client = restClient;
        }

        public static RequestManager Initialize(List<string> requestUrlList)
        {
            return new RequestManager(requestUrlList);
        }

        public static RequestManager Initialize(string requestUrl)
        {
            return new RequestManager(new List<string> { requestUrl });
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
            string requestUrl = requestUrlList[0];
            requestUrl = VerifyURL(requestUrl);

            var request = new RestRequest(requestUrl, Method.GET);
            CloneRequestHeader(request);
            request.RequestFormat = DataFormat.Json;

            LogManager.WriteLogRequestContent(Method.GET, requestUrl, request);

            var completeResult = new TaskCompletionSource<JObject>();
            _client.ExecuteAsync(request, response =>
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
            string requestUrl = requestUrlList[0];
            requestUrl = VerifyURL(requestUrl);

            var request = new RestRequest(requestUrl, Method.DELETE);
            CloneRequestHeader(request, context.Request);
            request.RequestFormat = DataFormat.Json;

            LogManager.WriteLogRequestContent(Method.DELETE, requestUrl, request);

            var completeResult = new TaskCompletionSource<JObject>();
            _client.ExecuteAsync(request, response =>
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
            string requestUrl = requestUrlList[0];
            requestUrl = VerifyURL(requestUrl);
            var request = new RestRequest(requestUrl, Method.POST);
            CloneRequestHeader(request);
            request.RequestFormat = DataFormat.Json;

            AddContentToBodyRequest(Method.POST, content, request);

            LogManager.WriteLogRequestContent(Method.POST, requestUrl, request);
            var response = _client.Execute(request);
            LogManager.WriteLogResponseContent(Method.POST, requestUrl, response);

            VerifyResponseStatus(response);

            return response.RawBytes;
        }

        public JObject PostBinary(byte[] packageFile, string fileName)
        {
            string requestUrl = requestUrlList[0];
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
            var response = _client.Execute(request);
            LogManager.WriteLogResponseContent(Method.POST, requestUrl, response);

            VerifyResponseStatus(response);

            return null;
        }

        public JObject Run(Method method, string content, DataFormat requestFormat)
        {
            return Execute(requestFormat, requestUrlList[0], method, content);
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

        public List<JObject> Runs(Method method, List<string> contentList, DataFormat requestFormat)
        {
            List<string> newContentList = contentList ?? new List<string>();

            List<JObject> resultObjectList = new List<JObject>();
            int index = 0;

            foreach (var requestUrl in requestUrlList)
            {
                string content = "";
                if (newContentList.Count > 0)
                {
                    content = newContentList[index];
                }

                var jsonResult = Execute(requestFormat, requestUrl, method, content);
                resultObjectList.Add(jsonResult);

                index++;
            }
            return resultObjectList;
        }
        public List<JObject> Runs(Method method, List<string> contentList)
        {
            return Runs(method, contentList, DataFormat.Json);
        }
        public List<JObject> Runs(Method method)
        {
            return Runs(method, null, DataFormat.Json);
        }
        public List<JObject> Runs()
        {
            return Runs(Method.GET, null, DataFormat.Json);
        }

        public List<JObject> GetParallel(DataFormat requestFormat)
        {
            List<JObject> resultObjectList = new List<JObject>();
            try
            {
                Parallel.ForEach(requestUrlList, (requestUrl) =>
                {
                    var jsonResult = Execute(requestFormat, requestUrl, Method.GET);
                    resultObjectList.Add(jsonResult);
                });
            }
            catch (AggregateException ae)
            {
                throw ae;
            }

            return resultObjectList;
        }
        public List<JObject> GetParallel()
        {
            return GetParallel(DataFormat.Json);
        }

        public byte[] GetBinary()
        {
            string requestUrl = requestUrlList[0];
            requestUrl = VerifyURL(requestUrl);

            var request = new RestRequest(requestUrl, Method.GET);
            CloneRequestHeader(request);
            request.RequestFormat = DataFormat.Json;

            LogManager.WriteLogRequestContent(Method.GET, requestUrl, request);
            var response = _client.Execute(request);
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
            string requestUrl = requestUrlList[0];
            requestUrl = VerifyURL(requestUrl);

            var request = new RestRequest(requestUrl, Method.GET);
            CloneRequestHeader(request);
            request.RequestFormat = DataFormat.Json;

            LogManager.WriteLogRequestContent(Method.GET, requestUrl, request);
            var response = _client.Execute(request);
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
            JObject jsonResult = new JObject();

            string newRequestUrl = VerifyURL(requestUrl);

            RestRequest request = new RestRequest(newRequestUrl, method);
            CloneRequestHeader(request);
            request.RequestFormat = requestFormat;

            AddContentToBodyRequest(method, content, request);

            LogManager.WriteLogRequestContent(method, newRequestUrl, request);
            var response = _client.Execute(request);
            LogManager.WriteLogResponseContent(method, newRequestUrl, response);

            VerifyResponseStatus(response);

            if (!string.IsNullOrEmpty(response.Content))
            {
                jsonResult = JObject.Parse(response.Content);
            }

            return jsonResult;
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