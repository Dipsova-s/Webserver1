using EveryAngle.Core.ViewModels.Directory;
using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Core.ViewModels.ModelServer;
using EveryAngle.Core.ViewModels.SystemInformation;
using EveryAngle.Core.ViewModels.SystemSettings;
using EveryAngle.Core.ViewModels.Users;
using EveryAngle.Logging;
using EveryAngle.WebClient.Service.ApiServices;
using EveryAngle.WebClient.Service.HttpHandlers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace EveryAngle.WebClient.Service.Security
{
    public class SessionHelper
    {
        #region variables

        private bool hasCookie = false;

        public virtual bool HasCookie
        {
            get { return hasCookie; }
        }

        #endregion

        #region constructor

        protected SessionHelper()
        {
            CheckSession();
        }

        #endregion

        #region public functions

        public static SessionHelper Initialize()
        {
            return new SessionHelper();
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
            return this.Models.FirstOrDefault(x => x.Uri.ToString().Equals(modelUri.ToLower(), StringComparison.OrdinalIgnoreCase));
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

        public virtual UserSettingsViewModel GetUserSettings()
        {
            UserService userService = new UserService();
            return userService.GetUserSetting(this.CurrentUser.UserSettings.ToString());
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
            HttpContext.Current.Session.Clear();
        }

        public virtual void SetCookieToExpired()
        {
            HttpCookie authCookie =
                 HttpContext.Current.Request.Cookies["EASECTOKEN"];
            if (authCookie != null)
            {
                HttpContext.Current.Response.Cookies["EASECTOKEN"].Expires = DateTime.Now.AddYears(-1);
            }
        }

        public virtual void Logout()
        {
            DestroyAllSession();
            try
            {
                var jsonResult = RequestManager.Initialize("/session").Run();
                RequestManager.Initialize(jsonResult.SelectToken("uri").ToString()).Run(RestSharp.Method.DELETE);
            }
            catch (Exception ex)
            {
                Log.SendException("Logout", ex);
            }
        }

        #endregion

        #region private functions

        /// <summary>
        /// Check EASECTOKEN
        /// </summary>
        private void CheckSession()
        {
            hasCookie = true;
            HttpCookie eaTokenCookie = GetEATokenCookie();
            string currentToken = Convert.ToString(HttpContext.Current.Session["EASECTOKEN"]);
            if (eaTokenCookie == null)
            {
                Log.SendInfo("Session cleared: EASECTOKEN cookie does not exists.");
                hasCookie = false;
                DestroyAllSession();
            }
            else if (string.IsNullOrEmpty(currentToken))
            {
                Log.SendInfo("Session cleared: EASECTOKEN session does not exists.");
                DestroyAllSession();
            }
            else if (eaTokenCookie.Value != currentToken)
            {
                Log.SendInfo("Session cleared: {0} != {1}", eaTokenCookie.Value, currentToken);
                DestroyAllSession();
            }

            // set EASECTOKEN to session
            HttpContext.Current.Session["EASECTOKEN"] = eaTokenCookie == null ? null : eaTokenCookie.Value;
        }

        /// <summary>
        /// Get EASECOTKEN cookie
        /// </summary>
        /// <returns></returns>
        private HttpCookie GetEATokenCookie()
        {
            List<HttpCookie> eaTokenCookies = new List<HttpCookie>();
            HttpCookieCollection allCookies = HttpContext.Current.Request.Cookies;
            for (int i = 0; i < allCookies.Count; i++)
            {
                if (allCookies[i].Name.Equals("EASECTOKEN", StringComparison.InvariantCulture))
                    eaTokenCookies.Add(allCookies[i]);
            }

            // send warning if many cookies
            if (eaTokenCookies.Count > 1)
            {
                string cookiesInfo = string.Join(Environment.NewLine, eaTokenCookies.Select(s =>
                    string.Format("  {0}, Expires:{1:yyyy-MM-dd HH:mm:ss}, Path:{2}", s.Value, s.Expires, s.Path)));
                Log.SendWarning("There are {0} EASECTOKEN in system:{1}{2}", eaTokenCookies.Count, Environment.NewLine, cookiesInfo);
            }

            // use the lastest one
            return eaTokenCookies.LastOrDefault();
        }

        #endregion
    }
}