using EveryAngle.OData.DTO;
using EveryAngle.OData.DTO.Model;
using EveryAngle.OData.Settings;
using EveryAngle.OData.Utils.Constants;
using EveryAngle.OData.Utils.Logs;
using RestSharp;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Web;

namespace EveryAngle.OData.Proxy
{
    public class AppServerProxy : IAppServerProxy, IAppServerProxyPrivateAccess
    {
        #region private variables

        private readonly IEARestClient _client;
        private int _model = -1;
        private readonly HttpStatusCode[] _postAcceptedStatusCodes = new HttpStatusCode[] { HttpStatusCode.Created, HttpStatusCode.OK };

        #endregion

        #region constructor

        public AppServerProxy(IEARestClient restClient)
        {
            _client = restClient;
            SystemUser = new User(ODataSettings.Settings.User, ODataSettings.Settings.Password);

            if (!LoginUser(SystemUser))
                LogService.Error(string.Format("Login of system user failed [user:{0}]", ODataSettings.Settings.User));
        }

        #endregion

        #region public variables

        public User SystemUser { get; }

        #endregion

        #region public properties

        public virtual int Model
        {
            get
            {
                if (_model == -1)
                {
                    Models models = GetModels(SystemUser);
                    ModelInfo model = models?.models?.FirstOrDefault(modelItem => modelItem.id.Equals(ODataSettings.Settings.ModelId, StringComparison.OrdinalIgnoreCase));
                    string modelInternalId = model?.uri.Split('/').Last();
                    if (!string.IsNullOrEmpty(modelInternalId))
                    {
                        _model = int.Parse(modelInternalId);
                        LogService.Info(string.Format("Resolved: model '{0}' with an internal id '{1}'",
                            ODataSettings.Settings.ModelId,
                            modelInternalId));
                    }
                    else
                    {
                        LogService.Error(string.Format("Resolving failed: model '{0}' could not be found on '{1}'",
                            ODataSettings.Settings.ModelId,
                            ODataSettings.Settings.Host));
                    }
                }

                return _model;
            }
        }

        public object TokenCache { get; private set; }

        #endregion

        #region public methods

        public bool LoginUser(User user)
        {
            // Post a new session
            Session session = PostSession(user);
            
            if (session != null)
            {
                user.RegisterSecurityToken(session.security_token);
                ModelPrivilegeListViewModel pvls = Get<ModelPrivilegeListViewModel>(session.model_privileges, user);
                user.ModelPrivileges = pvls;
                // update the user to the cache 
                user.SaveToCache();
            }

            return session != null;
        }

        public virtual Angles GetAngles(int maxAngles, string anglesQuery, User user)
        {
            return GetAngles(0, maxAngles, anglesQuery, user);
        }

        public virtual Angles GetAngles(int offset, int limit, string anglesQuery, User user)
        {
            string fq = string.IsNullOrEmpty(anglesQuery)
                ? null
                : "&fq=" + anglesQuery;

            return Get<Angles>(string.Format("/models/{0}/angles?offset={1}&limit={2}{3}", Model, offset, limit, fq), user);
        }

        public virtual Angle GetAngle(string uri, User user)
        {
            return Get<Angle>(uri, user);
        }

        public virtual Display GetDisplay(string uri, User user)
        {
            return Get<Display>(uri, user);
        }

        public virtual bool TryGetCurrentInstance(User user, out string currentInstance)
        {
            currentInstance = GetCurrentInstance(user);
            return !string.IsNullOrEmpty(currentInstance);
        }

        public virtual string GetCurrentInstance(User user)
        {
            string url = string.Format("/models/{0}", Model);
            ModelInfo modelInfo = Get<ModelInfo>(url, user);
            string currentInstance = string.Empty;
            if (modelInfo != null)
            {
                currentInstance = modelInfo.current_instance;
                if (string.IsNullOrEmpty(modelInfo.current_instance))
                    LogService.Info(string.Format("Model [{0}] have no active current instance.", modelInfo.id));
            }

            return currentInstance;
        }

        public virtual Models GetModels(User user)
        {
            return Get<Models>("/models", user);
        }

        public virtual Fields GetModelFields(string currentInstance, IEnumerable<string> fields, User user)
        {
            return Get<Fields>(string.Format("{0}/fields?IDS={1}&limit={2}", currentInstance, string.Join(",", fields), fields.Count()), user);
        }

        public virtual QueryResult ExecuteAngleDisplay(User user, Display display)
        {
            // Create ExecuteAngle query
            QueryRequest query = new QueryRequest
            {
                query_definition = new List<QueryBlock>
                {
                    new QueryBlock { queryblock_type = "base_angle", base_angle = display.angle_uri },
                    new QueryBlock { queryblock_type = "base_display", base_display = display.uri }
                }
            };

            // Post the query
            QueryResult result = PostResult(user, query);

            // Wait until status is 'finished'
            while (result != null &&
                   !string.IsNullOrEmpty(result.uri) &&
                   result.status != "finished")
            {
                System.Threading.Thread.Sleep(500);
                result = GetResult(user, result.uri);
            }

            return result;
        }

        public virtual QueryResult GetResult(User user, string uri)
        {
            return Get<QueryResult>(uri, user);
        }

        public virtual DataRows GetResultData(User user, QueryResult result, Display display, int? skip, int? top)
        {
            string queryString = string.Format("offset={0}&limit={1}", skip ?? 0, top ?? ODataSettings.Settings.PageSize);
            DataRows data = Get<DataRows>(result.data_rows + "?" + queryString, user);

            return data;
        }

        #endregion

        #region private methods

        public T Get<T>(string resourceUrl, User user) where T : new()
        {
            var response = _Get<T>(resourceUrl, user);

            // Re-login when the security token or session has expired
            // 440 session timeout is custom status returned by AS
            if (CheckUnauthorizedUser(response.StatusCode, user))
            {
                response = _Get<T>(resourceUrl, user);
            }

            // in case of AS returns 422-Unprocessable entity or Forbidden return with default object's value
            return GetResponse(response);
        }

        public T Post<T>(string resourceUrl, object obj, User user, bool redirect = false) where T : new()
        {
            IRestResponse<T> response = _Post<T>(resourceUrl, obj, user, redirect);

            // Re-login when the security token or session has expired
            // 440 session timeout is custom status returned by AS
            if (CheckUnauthorizedUser(response.StatusCode, user))
            {
                response = _Post<T>(resourceUrl, obj, user, redirect);
            }

            // in case of AS returns 422-Unprocessable entity or Forbidden return with object's default value
            return GetResponse(response);
        }

        private bool CheckUnauthorizedUser(HttpStatusCode statusCode, User user)
        {
            bool isUnAuthorized = statusCode == HttpStatusCode.Unauthorized || statusCode == (HttpStatusCode)440;
            return isUnAuthorized && LoginUser(user);
        }

        private T GetResponse<T>(IRestResponse<T> response)
        {
            return IsValidResponseStatus(response)
                ? response.Data
                : default(T);
        }

        private IRestResponse<T> _Post<T>(string resourceUrl, object obj, User user, bool? redirect = true) where T : new()
        {
            IRestRequest request = NewRestRequest(resourceUrl, user?.SecurityToken, Method.POST);

            request.AddJsonBody(obj);

            request.AddQueryParameter("redirect", redirect.ToString());

            return ExecuteRequest<T>(_client, request, user);
        }

        private IRestResponse<T> _Get<T>(string resourceUrl, User user) where T : new()
        {
            IRestRequest request = NewRestRequest(resourceUrl, user?.SecurityToken, Method.GET);

            return ExecuteRequest<T>(_client, request, user);
        }

        public IRestRequest NewRestRequest(string resourceUrl, string securityToken, Method method)
        {
            IRestRequest request = new RestRequest(resourceUrl, method);

            request.AddHeader("Accept", "application/json");
            request.Parameters.Clear();

            if (securityToken != null)
                request.AddParameter(CookieName.EASECTOKEN, securityToken, ParameterType.Cookie);

            return request;
        }

        private IRestResponse<T> ExecuteRequest<T>(IEARestClient client, IRestRequest request, User user) where T : new()
        {
            Stopwatch stopwatch = new Stopwatch();
            stopwatch.Start();
            IRestResponse<T> response = client.Execute<T>(request);
            stopwatch.Stop();

            LogService.Info(string.Format("[{0}] {1}({2}) [{3} {4}] {5:N0}ms {6:N2}KB", request.Method, request.Resource, user?.Username, (int)response.StatusCode, response.StatusCode, stopwatch.ElapsedMilliseconds, response.Content.Length / 1024.0));
            return response;
        }

        private QueryResult PostResult(User user, QueryRequest query)
        {
            return Post<QueryResult>("/results", query, user);
        }

        private Session PostSession(User user)
        {
            Object reqObject = new
            {
                user = user.Username,
                password = user.Password,
            };

            IRestResponse<Session> response = _Post<Session>("/sessions", reqObject, user);

            return _postAcceptedStatusCodes.Contains(response.StatusCode)
                ? response.Data
                : null;
        }

        private bool IsValidResponseStatus<T>(IRestResponse<T> response)
        {
            int responseCode = (int)response.StatusCode;

            AssertMayAccessOdata(response);

            if (responseCode == 422 || responseCode >= 500)
            {
                LogService.Info(string.Format(
                    "Application Server returned [Status: {0} {1}], [Content: {2}]",
                    (int)response.StatusCode, response.StatusCode.ToString(), response.Content));
                return false;
            }

            // if return code is '0' which means AS is not established, not trusted by certificate or it tries to connect to nowhere
            if (responseCode == 0)
            {
                LogService.Info(string.Format(
                    "Application Server returned [Status: {0} {1}, uri {2}], [Error message: {3}, {4}], please try check your destination's connection.",
                    (int)response.StatusCode, response.StatusCode.ToString(),
                    response.Request.Resource, response.ErrorException.Source,
                    response.ErrorMessage));
                return false;
            }

            return true;
        }
        private void AssertMayAccessOdata(IRestResponse response)
        {
            if (response.StatusCode.Equals(HttpStatusCode.Forbidden))
            {
                throw new HttpException(response.StatusCode.GetHashCode(), response.Content);
            }
        }
        #endregion
    }
}
