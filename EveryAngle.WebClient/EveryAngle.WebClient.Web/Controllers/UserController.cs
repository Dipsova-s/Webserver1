using System.Diagnostics.CodeAnalysis;
using System.Web.Mvc;
using EveryAngle.Core.ViewModels.Users;
using EveryAngle.WebClient.Service.LogHandlers;
using EveryAngle.WebClient.Service.Security;
using EveryAngle.WebClient.Web.Filters.ActionFilters;
using EveryAngle.WebClient.Web.Helpers;

namespace EveryAngle.WebClient.Web.Controllers
{
    [ExcludeFromCodeCoverage] // Cannot fake the user settings as it requires a static class RequestManager
    public class UserController : Controller
    {
        [CustomAuthorize]
        [IsUserLoggedInAction]
        public ActionResult Login()
        {
            AuthorizationHelper session = AuthorizationHelper.Initialize();
            string currentUserLanguage = "en";
            UserSettingsViewModel setting = session.GetUserSettings();
            if (setting != null && !string.IsNullOrEmpty(setting.default_language) && !string.IsNullOrEmpty(setting.default_language.Trim()))
            {
                currentUserLanguage = setting.default_language;
            }
            return Redirect($"~/{currentUserLanguage}/search/searchPage");
        }

        [LogExceptionHandler]
        [AcceptVerbs(HttpVerbs.Put)]

        public void UpdateUserSetting()
        {
            // Clear domain element
            Session["DomainElements"] = null;

            UserViewModel userInfo = AuthorizationHelper.Initialize().RefreshUserInfo();
            LocalizationHelper.SetCultureFormatBy(userInfo.Settings);
        }

        public ActionResult Forbidden()
        {
            return View();
        }

        public ActionResult Logout()
        {
            AuthorizationHelper.Initialize().Logout();
            return Redirect("~/");
        }

        public void DestroyAllSession()
        {
            try
            {
                AuthorizationHelper.Initialize().DestroyAllSession();
            }
            catch
            {
                // do nothing
            }
        }

        public void LoginProcess()
        {
            // this method use for trigger browser to ask for remember password
        }
    }


}
