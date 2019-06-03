using EveryAngle.Core.ViewModels.Users;
using EveryAngle.WebClient.Service.ErrorHandlers;
using EveryAngle.WebClient.Service.LogHandlers;
using EveryAngle.WebClient.Service.Security;
using EveryAngle.WebClient.Web.Helpers;
using System.Globalization;
using System.Net;
using System.Threading;
using System.Web.Configuration;
using System.Web.Mvc;
using System.Linq;
using System;

namespace EveryAngle.WebClient.Web.Controllers
{
    [LogExceptionHandler(Order = 2)]
    [CustomHandleError(Order = 1)]
    public class BaseController : Controller
    {
        protected override void OnActionExecuted(ActionExecutedContext filterContext)
        {
            if (filterContext.Exception == null)
                return;

            // Avoid 'action parameter missing' exceptions by simply returning an error response
            if (filterContext.Exception.TargetSite.DeclaringType == typeof(ActionDescriptor) &&
                filterContext.Exception.TargetSite.Name == "ExtractParameterFromDictionary")
            {
                filterContext.ExceptionHandled = true;
                filterContext.Result = new HttpStatusCodeResult((int)HttpStatusCode.BadRequest);
            }

            base.OnActionExecuted(filterContext);
        }

        protected override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            string webLanguage = string.Empty;

            UserViewModel user = null;
            UserSettingsViewModel settings = null;

            try
            {
                if (Session["UserSettingsViewModel"] == null || Session["UserViewModel"] == null)
                {
                    // refresh user info if no session
                    user = SessionHelper.Initialize().RefreshUserInfo();
                    settings = user.Settings;
                }
                else
                {
                    user = Session["UserViewModel"] as UserViewModel;
                    settings = Session["UserSettingsViewModel"] as UserSettingsViewModel;

                    if (IsLanguageChanged(Request.Url, settings.default_language))
                    {
                        // refresh user info if langauge changed
                        SessionHelper.Initialize().RefreshUserInfo();
                        settings = user.Settings;
                    }
                }

                CheckAuthorization(user, filterContext);

                if (settings != null && !string.IsNullOrEmpty(settings.default_language))
                {
                    webLanguage = settings.default_language;
                }
            }
            catch { }

            // set default
            if (webLanguage.Length != 2)
            {
                webLanguage = "en";
            }

            // set culture
            if (Thread.CurrentThread.CurrentUICulture.TwoLetterISOLanguageName != webLanguage
                || Thread.CurrentThread.CurrentCulture.TwoLetterISOLanguageName != webLanguage)
            {
                try
                {
                    Thread.CurrentThread.CurrentUICulture = CultureInfo.CreateSpecificCulture(webLanguage);
                    Thread.CurrentThread.CurrentCulture = CultureInfo.CreateSpecificCulture(webLanguage);
                }
                catch
                {
                    Thread.CurrentThread.CurrentUICulture = CultureInfo.CreateSpecificCulture("en");
                    Thread.CurrentThread.CurrentCulture = CultureInfo.CreateSpecificCulture("en");
                }
            }

            LocalizationHelper.SetCultureFormatBy(settings);

            base.OnActionExecuting(filterContext);
        }

        private void CheckAuthorization(UserViewModel user, ActionExecutingContext filterContext)
        {
            bool canAccessWC = user.ModelPrivileges.Any(f => f.Privileges.access_data_via_webclient == true);
            bool canAccessMC = user.SystemPrivileges.has_management_access == true;

            if (!canAccessWC && !filterContext.HttpContext.Request.IsAjaxRequest()
                && !filterContext.IsChildAction)
            {
                if (canAccessMC)
                {
                    string mcUrl = Url.Content("~/").ToLower() + EveryAngle.Shared.Helpers.WebConfigHelper.GetAppSettingByKey("ManagementConsoleUrl").ToLower();
                    filterContext.Result = new RedirectResult(mcUrl);
                }
                else
                {
                    SessionHelper.Initialize().Logout();
                    filterContext.Result = new RedirectResult(EveryAngle.Shared.Helpers.UrlHelper.GetLoginPath());
                }
            }
        }

        /// <summary>
        /// Check changing langauge with url
        /// </summary>
        /// <param name="uri"></param>
        /// <param name="language"></param>
        /// <returns></returns>
        private bool IsLanguageChanged(Uri uri, string language)
        {
            // if query contains "lang=", e.g. /resources/index?lang=en
            if (uri.Query.Contains("lang="))
                return !uri.Query.Contains("lang=" + language);

            // if a common url, e.g. /en/search/searchpage
            return !uri.Segments[uri.Segments.Length - 3].Replace("/", "").Equals(language, StringComparison.OrdinalIgnoreCase);
        }
    }

    public class ChildActionOutputCacheAttribute : OutputCacheAttribute
    {
        public ChildActionOutputCacheAttribute(string cacheProfile)
        {
            var settings = (OutputCacheSettingsSection)WebConfigurationManager.GetSection("system.web/caching/outputCacheSettings");
            var profile = settings.OutputCacheProfiles[cacheProfile];
            Duration = profile.Duration;
            VaryByParam = profile.VaryByParam;
            VaryByCustom = profile.VaryByCustom;
        }
    }
}
