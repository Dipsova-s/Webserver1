using EveryAngle.Core.ViewModels.Users;
using EveryAngle.Shared.Helpers;
using EveryAngle.WebClient.Service.LogHandlers;
using EveryAngle.WebClient.Service.Security;
using EveryAngle.WebClient.Web.Filters.ActionFilters;
using EveryAngle.WebClient.Web.Helpers;
using System.Web.Mvc;

namespace EveryAngle.WebClient.Web.Controllers
{
    public class UserController : Controller
    {
        [IsUserLogedInAction()]
        public ActionResult Login(bool popup = false)
        {
            if (popup)
            {
                return PartialView(@"~/Views/User/PartialViews/UserLoginBodyPage.cshtml");
            }
            else if (string.IsNullOrEmpty(Request.Url.Query) && !Request.Url.ToString().EndsWith("/"))
            {
                // url must endwiths "/", if not the redirect
                return Redirect(Request.Url.ToString() + "/");
            }
            else
            {
                string mcClearSessionUrl;
#if DEVMODE
                mcClearSessionUrl = "''";
#else
                mcClearSessionUrl = "(mcUrl + 'Security/DestroyAllSession').toLowerCase()";
#endif
                ViewBag.ClearSessionUrl = mcClearSessionUrl;
                ViewBag.ClientIP = EveryAngle.Shared.EmbeddedViews.Util.GetIPAddress();
                return View(@"~/Views/Security/Login.cshtml");
            }
        }

        public ActionResult GetLoginPage()
        {
            ViewBag.PostAction = "about:blank";
            ViewBag.FileVersion = AssemblyInfoHelper.GetFileVersion();
            return PartialView("~/Views/User/LoginPage.cshtml");
        }

        [LogExceptionHandler]
        [AcceptVerbs(HttpVerbs.Put)]
        public void UpdateUserSetting()
        {
            // Clear domain element
            Session["DomainElements"] = null;

            UserViewModel userInfo = SessionHelper.Initialize().RefreshUserInfo();
            LocalizationHelper.SetCultureFormatBy(userInfo.Settings);
        }

        public ActionResult Logout()
        {
            SessionHelper.Initialize().Logout();
            return new RedirectResult(HttpContext.Request.ApplicationPath.ToLower());
        }

        public void DestroyAllSession()
        {
            try
            {
                SessionHelper.Initialize().DestroyAllSession();
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
