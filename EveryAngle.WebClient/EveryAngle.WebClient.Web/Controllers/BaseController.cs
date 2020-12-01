using System;
using System.Diagnostics.CodeAnalysis;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Threading;
using System.Web;
using System.Web.Configuration;
using System.Web.Mvc;
using EveryAngle.Core.ViewModels.Users;
using EveryAngle.WebClient.Service;
using EveryAngle.WebClient.Service.ErrorHandlers;
using EveryAngle.WebClient.Service.Extensions;
using EveryAngle.WebClient.Service.LogHandlers;
using EveryAngle.WebClient.Service.Security;
using EveryAngle.WebClient.Web.Helpers;

namespace EveryAngle.WebClient.Web.Controllers
{
    [LogExceptionHandler(Order = 2)]
    [CustomHandleError(Order = 1)]
    [ExcludeFromCodeCoverage] // Use of static classes prohibits the creation of unit tests for these overrides
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

            UserSettingsViewModel settings = null;

            try
            {
                if (IsAuthenticated(filterContext))
                {
                    UserViewModel user;
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
                            // refresh user info if language changed
                            SessionHelper.Initialize().RefreshUserInfo();
                            settings = user.Settings;
                        }
                    }

                    CheckAuthorization(user, filterContext);
                }

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

        private static bool IsAuthenticated(ActionExecutingContext filterContext)
        {
            var result = filterContext.HttpContext.Request.GetOwinContext().AuthenticateAsyncFromCookies();
            var token = result.Result?.GetAccessToken();

            if (!string.IsNullOrWhiteSpace(token) && SessionHelper.Initialize().CurrentUser != null)
            {
                return true;
            }

            SessionHelper.Initialize().DestroyAllSession();
            filterContext.Result = new RedirectResult(EveryAngle.Shared.Helpers.UrlHelper.GetLoginPath());

            return false;
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
                    string mcUrl = Url.Content("~/").ToLower(CultureInfo.InvariantCulture) + EveryAngle.Shared.Helpers.WebConfigHelper
                        .GetAppSettingByKey("ManagementConsoleUrl").ToLower(CultureInfo.InvariantCulture);
                    filterContext.Result = new RedirectResult(mcUrl);
                }
                else
                {
                    filterContext.Result = RedirectToAction("Forbidden", "User");
                }
            }
        }

        /// <summary>Determines whether language changed is changed.</summary>
        /// <param name="uri">The URI.</param>
        /// <param name="language">The language.</param>
        /// <returns>
        ///   <c>true</c> if [is language changed]; otherwise, <c>false</c>.
        /// </returns>
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
