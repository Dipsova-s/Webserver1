using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Globalization;
using System.Linq;
using System.Web;
using EveryAngle.Core.ViewModels.Directory;
using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Core.ViewModels.ModelServer;
using EveryAngle.Core.ViewModels.SystemInformation;
using EveryAngle.Core.ViewModels.SystemSettings;
using EveryAngle.Core.ViewModels.Users;
using EveryAngle.Logging;
using EveryAngle.WebClient.Service.ApiServices;
using EveryAngle.WebClient.Service.Extensions;
using EveryAngle.WebClient.Service.HttpHandlers;
using Microsoft.Owin.Security;

namespace EveryAngle.WebClient.Service.Security
{
    public class AuthorizationHelper
    {
        #region variables

        private bool hasCookie = false;

        public virtual bool HasCookie
        {
            get { return hasCookie; }
        }

        #endregion

        #region constructor

        [ExcludeFromCodeCoverage]
        protected AuthorizationHelper()
        {
        }

        #endregion

        #region public functions

        [ExcludeFromCodeCoverage]
        public static AuthorizationHelper Initialize()
        {
            var helper = new AuthorizationHelper();
            helper.CheckSession();
            return helper;
        }

        public virtual VersionViewModel Version
        {
            get
            {
                if (HttpContext.Current.Session["MCSession_Version"] == null)
                {
                    HttpContext.Current.Session["MCSession_Version"] = new DirectoryService().GetVersion();
                }
                return HttpContext.Current.Session["MCSession_Version"] as VersionViewModel;
            }
        }

        public virtual SessionViewModel Session
        {
            get
            {
                if (HttpContext.Current.Session["MCSession_Session"] == null)
                {
                    SessionService sessionService = new SessionService();
                    HttpContext.Current.Session["MCSession_Session"] = sessionService.GetSession(this.Version.SessionUri.ToString());
                }
                return HttpContext.Current.Session["MCSession_Session"] as SessionViewModel;
            }
        }

        public virtual SystemInformationViewModel Info
        {
            get
            {
                var infoService = new SystemInformationService();
                var info = infoService.GetSystemInformation(this.Version.GetEntryByName("system_information").UriAsString);
                return info;
            }
        }

        public virtual List<ModelViewModel> Models
        {
            get
            {
                ReloadModels();

                return HttpContext.Current.Session["ModelViewModelList"] as List<ModelViewModel>;
            }
        }

        public virtual SystemSettingViewModel SystemSettings
        {
            get
            {
                if (HttpContext.Current.Session["SystemSettingViewModel"] == null)
                {
                    string systemSettingsUri = Version.GetEntryByName("system_settings").Uri.ToString();
                    GlobalSettingService globalSettingService = new GlobalSettingService();
                    HttpContext.Current.Session["SystemSettingViewModel"] = globalSettingService.GetSystemSettings(systemSettingsUri);
                }
                return HttpContext.Current.Session["SystemSettingViewModel"] as SystemSettingViewModel;
            }
        }

        public virtual ModelViewModel GetModel(string modelUri)
        {
            return Models.FirstOrDefault(x => x.Uri.ToString().Equals(modelUri.ToLower(CultureInfo.InvariantCulture), StringComparison.OrdinalIgnoreCase));
        }

        public virtual ModelViewModel GetModelFromSession(string modelUri)
        {
            List<ModelViewModel> sessionModels = HttpContext.Current.Session["ModelViewModelList"] as List<ModelViewModel>;
            if (sessionModels == null)
            {
                return GetModel(modelUri);
            }
            return sessionModels.FirstOrDefault(x => x.Uri.ToString().Equals(modelUri.ToLower(), StringComparison.OrdinalIgnoreCase));
        }

        public virtual UserViewModel CurrentUser
        {
            get
            {
                try
                {
                    if (HttpContext.Current.Session["MCSession_User"] == null)
                    {
                        string userUri = Version.UserUri.ToString();
                        UserService userService = new UserService();
                        HttpContext.Current.Session["MCSession_User"] = userService.GetUser(userUri);
                    }
                    return HttpContext.Current.Session["MCSession_User"] as UserViewModel;
                }
                catch
                {
                    return null;
                }
            }
        }

        [ExcludeFromCodeCoverage] // Cannot unit tests because user service makes a request to AppServer and can't be injected
        public virtual UserSettingsViewModel GetUserSettings()
        {
            UserService userService = new UserService();
            if (CurrentUser != null)
            {
                return userService.GetUserSetting(CurrentUser.UserSettings.ToString());
            }

            return null;
        }

        public virtual UserViewModel RefreshUserInfo()
        {
            HttpContext.Current.Session["UserSettingsViewModel"] = null;
            HttpContext.Current.Session["UserViewModel"] = null;

            UserViewModel user = CurrentUser;
            UserSettingsViewModel settings = GetUserSettings();
            settings.LoadClientSettings();
            user.Settings = settings;

            HttpContext.Current.Session["UserSettingsViewModel"] = settings;
            HttpContext.Current.Session["UserViewModel"] = user;

            return user;
        }

        public virtual void RefreshUserSettings()
        {
            UserSettingsViewModel settings = GetUserSettings();
            CurrentUser.Settings = settings;
            HttpContext.Current.Session["UserSettingsViewModel"] = settings;
        }

        public virtual void ReloadModels()
        {
            ModelService modelService = new ModelService();
            List<ModelViewModel> models = modelService.GetSessionModels(Version.GetEntryByName("models").Uri.ToString() + "?caching=false");
            HttpContext.Current.Session["ModelViewModelList"] = models;
        }

        public virtual void ReloadSystemSetting(SystemSettingViewModel savedSystemSettings = null)
        {
            SystemSettingViewModel systemSettings;
            if (savedSystemSettings == null)
            {
                GlobalSettingService globalSettingService = new GlobalSettingService();
                systemSettings = globalSettingService.GetSystemSettings(Version.GetEntryByName("system_settings").Uri.ToString());
            }
            else
            {
                systemSettings = savedSystemSettings;
            }
            HttpContext.Current.Session["SystemSettingViewModel"] = systemSettings;
        }

        public virtual ModelViewModel GetModelById(string modelId)
        {
            return this.Models.FirstOrDefault(filter => filter.id.ToString().Equals(modelId, StringComparison.OrdinalIgnoreCase));
        }

        public virtual string GetSystemLicenseUri()
        {
            return this.Version.GetEntryByName("system_license").Uri.ToString();
        }

        public virtual string GetModelServersUri()
        {
            return this.Version.GetEntryByName("model_servers").Uri.ToString();
        }

        public virtual SystemLicenseViewModel GetModelLicense(string licenseUri)
        {
            try
            {
                GlobalSettingService globalSettingService = new GlobalSettingService();
                return globalSettingService.GetLicense(licenseUri);
            }
            catch
            {
                return null;
            }
        }

        public virtual string GetModelLicenseDate(string modelId, SystemLicenseViewModel modelLicenses)
        {
            if (modelLicenses != null && modelLicenses.model_licenses != null)
            {
                var modelLicensesCount = modelLicenses.model_licenses.Count;
                for (var i = 0; i < modelLicensesCount; i++)
                {
                    var model_licensesItem = modelLicenses.model_licenses[i];
                    if (model_licensesItem.model_id.Equals(modelId))
                    {
                        return model_licensesItem.expires.ToString();
                    }
                }
            }
            return null;
        }

        public virtual List<ModelServerViewModel> GetModelServers(List<ModelViewModel> modelList)
        {
            ModelService modelService = new ModelService();
            var modelServers = new List<ModelServerViewModel>();
            for (var i = 0; i < modelList.Count; i++)
            {
                var result = modelService.GetModelServers(modelList[i].ServerUri.ToString());
                if (result.Header.Total > 0)
                {
                    modelServers.AddRange(result.Data);
                }
            }
            return modelServers;
        }

        public virtual void DestroyAllSession()
        {
            HttpContext.Current.Session?.Clear();
        }


        [ExcludeFromCodeCoverage]
        public virtual void Logout()
        {
            Logout(false);
        }

        [ExcludeFromCodeCoverage]
        public virtual void Logout(bool causedByUnauthorized)
        {
            DestroyAllSession();
            try
            {
                // Session is likely already deleted so do not need to clean up session in this case
                if (!causedByUnauthorized)
                {
                    var jsonResult = RequestManager.Initialize("/session").Run();
                    RequestManager.Initialize(jsonResult.SelectToken("uri").ToString()).Run(RestSharp.Method.DELETE);
                }

                var result = HttpContext.Current.Request.GetOwinContext().AuthenticateAsyncFromCookies();
                var token = result.Result?.GetAccessToken();
                if (!string.IsNullOrWhiteSpace(token))
                {
                    var authTypes = HttpContext.Current.Request.GetOwinContext()
                        .Authentication.GetAuthenticationTypes()
                        .Select(o => o.AuthenticationType).ToArray();

                    HttpContext.Current.Request.GetOwinContext().Authentication.SignOut(new AuthenticationProperties(), authTypes);
                }
            }
            catch (Exception ex)
            {
                Log.SendException("Logout", ex);
            }
        }

        #endregion

        #region private functions

        /// <summary>
        /// Check Auth access token
        /// </summary>

        [ExcludeFromCodeCoverage]
        private void CheckSession()
        {
            var result = HttpContext.Current.Request.GetOwinContext().AuthenticateAsyncFromCookies();
            var token = result.Result?.GetAccessToken();

            if (string.IsNullOrWhiteSpace(token))
            {
                hasCookie = false;
                DestroyAllSession();
            }
            else
            {
                if (HttpContext.Current.Session != null)
                {
                    hasCookie = true;
                }
                else
                {
                    hasCookie = false;
                }
            }
        }

        #endregion
    }
}