using EveryAngle.OData.DTO;
using EveryAngle.OData.Utils.Logs;
using RestSharp;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net;

namespace EveryAngle.OData.Utils
{
    public class AppServerProxy
    {
        #region private variables

        private RestClient _client;
        private string _token = null;

        #endregion

        #region constructor

        public AppServerProxy()
        {
            _client = new RestClient(ODataSettings.Settings.Host);
            _client.Timeout = ODataSettings.Settings.TimeOut;
            _client.UserAgent = "EVERYANGLE.ODATA.SERVICE";
        }

        #endregion

        #region public functions

        public virtual T Get<T>(string resourceUrl, string token) where T : new()
        {
            var response = _Get<T>(resourceUrl, token);

            // Re-login when the global token has expired
            if (response.StatusCode == HttpStatusCode.Unauthorized && string.IsNullOrEmpty(token))
            {
                _token = LoginBackgroundUser();
                response = _Get<T>(resourceUrl, _token);
            }

            // in case of AS returns 422-Unprocessable entity or Forbidden return with default object's value
            if (!IsValidResponseStatus(response))
                return default(T);

            return response.Data;
        }

        public virtual T Post<T>(string resourceUrl, object obj, string token) where T : new()
        {
            return Post<T>(resourceUrl, obj, token, false);
        }

        public virtual T Post<T>(string resourceUrl, object obj, string token, bool? redirect = true) where T : new()
        {
            IRestResponse<T> response = _Post<T>(resourceUrl, obj, token, redirect);

            // Re-login when the global token has expired
            if (response.StatusCode == HttpStatusCode.Unauthorized && token == null)
            {
                _token = LoginBackgroundUser();
                response = _Post<T>(resourceUrl, obj, _token, redirect);
            }

            // in case of AS returns 422-Unprocessable entity or Forbidden return with default object's value
            if (!IsValidResponseStatus(response))
                return default(T);

            return response.Data;
        }

        public virtual string LoginBackgroundUser()
        {
            return PostSession(ODataSettings.Settings.User, ODataSettings.Settings.Password).security_token;
        }

        public virtual Session LoginUser(string user, string password)
        {
            return PostSession(user, password);
        }

        public virtual Angles GetModelAngles(int model, int maxAngles, string anglesQuery, string token)
        {
            string fq = string.IsNullOrEmpty(anglesQuery)
                ? null
                : "&fq=" + anglesQuery;

            return Get<Angles>(string.Format("/models/{0}/angles?limit={1}{2}", model, maxAngles, fq), token);
        }

        public virtual Angle GetAngle(string uri, string token)
        {
            return Get<Angle>(uri, token);
        }

        public virtual Display GetDisplay(string uri, string token)
        {
            return Get<Display>(uri, token); ;
        }

        public virtual bool TryGetCurrentInstance(int model, out string currentInstance)
        {
            currentInstance = GetCurrentInstance(model, string.Empty);
            return !string.IsNullOrEmpty(currentInstance);
        }

        public virtual string GetCurrentInstance(int model, string token)
        {
            string url = string.Format("/models/{0}", model);
            ModelInfo modelInfo = Get<ModelInfo>(url, token);
            string currentInstance = string.Empty;
            if (modelInfo != null)
                currentInstance = modelInfo.current_instance;

            return currentInstance;
        }

        public virtual Fields GetModelFields(string currentInstance, IEnumerable<string> fields, string token)
        {
            return Get<Fields>(string.Format("{0}/fields?IDS={1}&limit={2}", currentInstance, string.Join(",", fields), fields.Count()), token);
        }

        public virtual Fields GetModelFields(string currentInstance, int limit, string token)
        {
            return Get<Fields>(string.Format("{0}/fields?limit={1}", currentInstance, limit), token);
        }

        public virtual Fields GetModelFields(string currentInstance, int limit, int offset, string token)
        {
            return Get<Fields>(string.Format("{0}/fields?limit={1}&offset={2}", currentInstance, limit, offset), token);
        }

        public virtual QueryResult GetResult(string uri, string token)
        {
            return Get<QueryResult>(uri, token);
        }

        public virtual QueryResult PostResult(QueryRequest query, string token)
        {
            return Post<QueryResult>("/results", query, token);
        }

        public virtual QueryResult ExecuteAngleDisplay(Display display, string token)
        {
            // Create ExecuteAngle query
            QueryRequest query = new QueryRequest()
            {
                query_definition = new List<QueryBlock>
                {
                    new QueryBlock() { queryblock_type = "base_angle", base_angle = display.angle_uri },
                    new QueryBlock() { queryblock_type = "base_display", base_display = display.uri }
                }
            };

            // Post the query
            QueryResult result = PostResult(query, token);

            // Wait until status is 'finished'
            while (result != null && result.status != "finished")
            {
                System.Threading.Thread.Sleep(500);
                result = GetResult(result.uri, token);
            }

            return result;
        }

        public virtual DataRows GetResultData(QueryResult result, Display display, int? skip, int? top, string token)
        {
            string queryString = string.Format("offset={0}&limit={1}", skip ?? 0, top ?? ODataSettings.Settings.PageSize);
            DataRows data = Get<DataRows>(result.data_rows + "?" + queryString, token);

            return data;
        }

        #endregion

        #region private functions

        private bool IsValidResponseStatus<T>(IRestResponse<T> response)
        {
            int responseCode = (int)response.StatusCode;
            if (responseCode == 422 || responseCode == 403)
                return false;

            if (responseCode >= 400)
                throw new WebException(response.Content, (WebExceptionStatus)response.StatusCode);

            return true;
        }

        private Session PostSession(string user, string pass)
        {
            Object reqObject = new
            {
                user = user,
                password = pass,
            };

            Session session = Post<Session>("/sessions", reqObject, null);

            _token = session.security_token;

            return session;
        }

        private IRestResponse<T> _Post<T>(string resourceUrl, object obj, string token, bool? redirect = true) where T : new()
        {
            var request = NewRestRequest(resourceUrl, token, Method.POST);

            request.AddJsonBody(obj);

            request.AddQueryParameter("redirect", redirect.ToString());

            return ExecuteRequest<T>(_client, request);
        }

        private IRestResponse<T> _Get<T>(string resourceUrl, string token) where T : new()
        {
            IRestRequest request = NewRestRequest(resourceUrl, token, Method.GET);

            return ExecuteRequest<T>(_client, request);
        }

        private IRestRequest NewRestRequest(string resourceUrl, string token, Method method)
        {
            IRestRequest request = new RestRequest(resourceUrl, method);

            request.AddHeader("Accept", "application/json");
            request.Parameters.Clear();
            string currentToken = token ?? _token;
            if (currentToken != null)
                request.AddParameter("EASECTOKEN", currentToken, ParameterType.Cookie);

            return request;
        }

        private IRestResponse<T> ExecuteRequest<T>(IRestClient client, IRestRequest request) where T : new()
        {
            var stopwatch = Stopwatch.StartNew();
            var response = client.Execute<T>(request);
            LogService.Info(string.Format("{0,4} {1} [{2} {3}] {4:N0}ms {5:N2}KB", request.Method, request.Resource, (int)response.StatusCode, response.StatusCode, stopwatch.ElapsedMilliseconds, response.Content.Length / 1024.0));
            return response;
        }

        #endregion
    }
}