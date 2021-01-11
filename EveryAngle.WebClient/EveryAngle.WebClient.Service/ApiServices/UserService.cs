using System.Collections.Generic;
using System.Linq;
using System.Web;
using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels;
using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Core.ViewModels.Privilege;
using EveryAngle.Core.ViewModels.Users;
using EveryAngle.Shared.Helpers;
using EveryAngle.Utilities;
using EveryAngle.WebClient.Service.HttpHandlers;
using Newtonsoft.Json;
using RestSharp;
using EveryAngle.WebClient.Service.Security;
using Newtonsoft.Json.Linq;
using System.Threading.Tasks;

namespace EveryAngle.WebClient.Service.ApiServices
{
    public class UserService : IUserService
    {
        public string WebServiceUri { get; set; }

        public ListViewModel<UserViewModel> GetUsers(string uri)
        {
            var requestManager = RequestManager.Initialize(uri);
            var jsonResult = requestManager.Run();
            var users = new ListViewModel<UserViewModel>();
            var enableUsers =
                JsonConvert.DeserializeObject<List<UserViewModel>>(jsonResult.SelectToken("users").ToString(),
                    new UnixDateTimeConverter());
            users.Data = enableUsers != null ? enableUsers.ToList() : null;
            users.Header = JsonConvert.DeserializeObject<HeaderViewModel>(jsonResult.SelectToken("header").ToString());
            return users;
        }

        public UserViewModel GetUser(string uri)
        {
            var requestManager = RequestManager.Initialize(uri);

            var jsonResult = requestManager.Run();
            if (jsonResult != null)
            {
                var result = JsonConvert.DeserializeObject<UserViewModel>(jsonResult.ToString(),
                    new UnixDateTimeConverter());
                if (result != null)
                {
                    //next step get user privileges
                    if (SessionHelper.Initialize().Session.ModelPrivileges != null)
                    {
                        result.ModelPrivileges = SessionHelper.Initialize().Session.ModelPrivileges;
                    }
                    else
                    {
                        var systemSettings = SessionHelper.Initialize().SystemSettings;
                        requestManager = RequestManager.Initialize(
                                result.ModelPrivilegesUri + "?" +
                                UtilitiesHelper.GetOffsetLimitQueryString(1, systemSettings.max_pagesize));
                        jsonResult = requestManager.Run();
                        //next step get user privileges
                        if (jsonResult.SelectToken("model_privileges") != null)
                        {
                            result.ModelPrivileges =
                                JsonConvert.DeserializeObject<List<ModelPrivilegeViewModel>>(
                                    jsonResult.SelectToken("model_privileges").ToString(), new UnixDateTimeConverter());
                        }
                    }
                }
                return result;
            }
            return null;
        }

        public List<ModelPrivilegeViewModel> GetUserModelPrivilege(string modelPrivilegesUri)
        {
            var requestManager = RequestManager.Initialize(modelPrivilegesUri);
            var jsonResult = requestManager.Run();
            return JsonConvert.DeserializeObject<List<ModelPrivilegeViewModel>>(jsonResult.SelectToken("model_privileges").ToString());
        }

        public ModelAuthorizationsViewModel GetModelAuthorizations(string uri)
        {
            var requestManager = RequestManager.Initialize(uri);
            var jsonResult = requestManager.Run();
            var result = JsonConvert.DeserializeObject<ModelAuthorizationsViewModel>(jsonResult.ToString());
            return result;
        }

        public AuthenticationProviderUserViewModel GetUserAuthentication(string uri)
        {
            var requestManager = RequestManager.Initialize(uri);
            var jsonResult = requestManager.Run();
            var result = JsonConvert.DeserializeObject<AuthenticationProviderUserViewModel>(jsonResult.ToString());
            return result;
        }

        public ListViewModel<AuthenticationProviderUserViewModel> GetUnableUsers(string uri)
        {
            var requestManager = RequestManager.Initialize(uri);
            var jsonResult = requestManager.Run();
            var users = new ListViewModel<AuthenticationProviderUserViewModel>();
            var unableUsers =
                JsonConvert.DeserializeObject<List<AuthenticationProviderUserViewModel>>(
                    jsonResult.SelectToken("users").ToString());
            users.Data = unableUsers != null ? unableUsers.ToList() : null;
            users.Header = JsonConvert.DeserializeObject<HeaderViewModel>(jsonResult.SelectToken("header").ToString());
            return users;
        }

        public List<AuthenticationProviderUserViewModel> GetAuthenticationProviderUser(string uri)
        {
            var requestManager = RequestManager.Initialize(uri);
            var jsonResult = requestManager.Run();
            return JsonConvert.DeserializeObject<List<AuthenticationProviderUserViewModel>>(
                    jsonResult.SelectToken("users").ToString());
        }

        public void UpdateAuthentication(string authenticationProviderUri, string authenticationProviderData)
        {
            var requestManager = RequestManager.Initialize(authenticationProviderUri);
            requestManager.Run(Method.PUT, authenticationProviderData);
        }

        public IEnumerable<SystemAuthenticationProviderViewModel> GetSystemAuthenticationProviders(string uri)
        {
            var systemSettings = SessionHelper.Initialize().SystemSettings;
            string query = UtilitiesHelper.GetOffsetLimitQueryString(1, systemSettings.max_pagesize);
            var requestManager = RequestManager.Initialize($"{uri}?{query}");
            var jsonResult = requestManager.Run();
            return JsonConvert.DeserializeObject<IEnumerable<SystemAuthenticationProviderViewModel>>(
                    jsonResult.SelectToken("authentication_providers").ToString());
        }

        public UserSettingsViewModel GetUserSetting(string uri)
        {
            var requestManager = RequestManager.Initialize(uri);
            var jsonResult = requestManager.Run();
            var model = JsonConvert.DeserializeObject<UserSettingsViewModel>(jsonResult.ToString(),
                new UnixDateTimeConverter());
            return model;
        }

        public void UpdateUserSetting(string uri, string userSettingData)
        {
            var requestManager = RequestManager.Initialize(uri);
            requestManager.Run(Method.PUT, userSettingData);
        }

        public void DeleteUser(string uri)
        {
            var requestManager = RequestManager.Initialize(uri);
            requestManager.Run(Method.DELETE);
        }

        public List<SystemRoleViewModel> GetSystemRoles(string systemRoleUri)
        {
            var requestManager = RequestManager.Initialize(systemRoleUri);
            var jsonResult = requestManager.Run();
            var model =
                JsonConvert.DeserializeObject<List<SystemRoleViewModel>>(jsonResult.SelectToken("roles").ToString());
            return model;
        }

        public SystemRoleViewModel GetRole(string roleUri)
        {
            var requestManager = RequestManager.Initialize(roleUri);
            var jsonResult = requestManager.Run();
            var result = JsonConvert.DeserializeObject<SystemRoleViewModel>(jsonResult.ToString(),
                new UnixDateTimeConverter());
            return result;
        }

        public ConsolidatedRoleViewModel GetConsolidatedRole(string consolidatedRoleUri)
        {
            var requestManager = RequestManager.Initialize(consolidatedRoleUri);
            var jsonResult = requestManager.Run();
            var result = JsonConvert.DeserializeObject<ConsolidatedRoleViewModel>(jsonResult.ToString());
            return result;
        }

        public string UpdateUserRole(string userRoleUri, string jsonData)
        {
            var requestManager = RequestManager.Initialize(userRoleUri);
            var jsonResult = requestManager.Run(Method.PUT, jsonData);

            return jsonResult.ToString();
        }

        public string UpdateUser(string userUri, string jsonData)
        {
            var requestManager = RequestManager.Initialize(userUri);
            var jsonResult = requestManager.Run(Method.PUT, jsonData);

            return jsonResult.ToString();
        }

        public void DeleteSession(string userUri)
        {
            var requestManager = RequestManager.Initialize(userUri);
            requestManager.Run(Method.PUT, "{'is_active':false}");

            #region Fixed: M4-11291: QA rejection => can't log out from MC

            HttpContext.Current.Session["VersionViewModel"] = null;

            #endregion
        }

        public void UpdateDebugLogging(string sessionUri, bool isDebugLogging)
        {
            var requestManager = RequestManager.Initialize(sessionUri);
            string body = isDebugLogging ? "{'debug_logging':true}" : "{'debug_logging':false}";
            requestManager.Run(Method.PUT, body);
        }

        public List<AuthenticatedUserViewModel> GetUserAuthenticated(string uri)
        {
            var requestManager = RequestManager.Initialize(uri);
            var jsonResult = requestManager.Run();
            var models =
                JsonConvert.DeserializeObject<List<AuthenticatedUserViewModel>>(
                    jsonResult.SelectToken("authenticated_users").ToString(), new UnixDateTimeConverter());
            return models;
        }
    }
}
