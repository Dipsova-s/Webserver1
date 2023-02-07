using System.Diagnostics.CodeAnalysis;
using System.Globalization;
using System.Security.Policy;
using System.Threading;
using System.Web;
using System.Web.Mvc;
using EveryAngle.Core.ViewModels.Users;
using EveryAngle.WebClient.Service.Security;

namespace EveryAngle.WebClient.Web.Filters.ActionFilters
{
    [ExcludeFromCodeCoverage]
    public class IsUserLoggedInActionAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            try
            {
                SessionHelper session = SessionHelper.Initialize();
                string currentUserLanguage = "en";
                if (session.HasCookie && session.CurrentUser != null)
                {
                    session.DestroyAllSession();

                    string redirectPath;
                    if (HttpContext.Current.Request.Url.Query.Contains("?redirect="))
                    {
                        redirectPath = HttpContext.Current.Request.Url.Query.Replace("?redirect=", "");
                    }
                    else
                    {
                        UserSettingsViewModel setting = session.GetUserSettings();
                        if (setting != null && !string.IsNullOrEmpty(setting.default_language) && !string.IsNullOrEmpty(setting.default_language.Trim()))
                        {
                            currentUserLanguage = setting.default_language;
                        }
                        redirectPath = "~/" + currentUserLanguage + "/search/searchPage";
                    }
                    if (IsLocalUrl(redirectPath))
                    {
                        filterContext.Result = new RedirectResult(redirectPath);
                    }
                    else
                    {
                        filterContext.Result = new HttpStatusCodeResult(400, "Invalid request");
                    }
                }
                else
                {
                    Thread.CurrentThread.CurrentUICulture = CultureInfo.CreateSpecificCulture("en");
                    Thread.CurrentThread.CurrentCulture = CultureInfo.CreateSpecificCulture("en");
                }
            }
            catch
            {
                //do nothing
            }

        }
        private bool IsLocalUrl(string url)
        {
            if (string.IsNullOrEmpty(url))
            {
                return false;
            }
            else
            {
                return ((url[0] == '/' && (url.Length == 1 ||
                        (url[1] != '/' && url[1] != '\\'))) ||   // "/" or "/foo" but not "//" or "/\"
                        (url.Length > 1 &&
                         url[0] == '~' && url[1] == '/'));   // "~/" or "~/foo"
            }
        }
    }
}
