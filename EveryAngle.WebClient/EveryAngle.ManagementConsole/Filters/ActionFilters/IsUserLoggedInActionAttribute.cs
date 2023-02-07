using System.Diagnostics.CodeAnalysis;
using System.Globalization;
using System.Web;
using System.Web.Mvc;
using EveryAngle.WebClient.Service.Security;

namespace EveryAngle.ManagementConsole.Filters.ActionFilters
{
    [ExcludeFromCodeCoverage] // No existing unit tests
    public class IsUserLoggedInActionAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            SessionHelper session = SessionHelper.Initialize();
            if (session.HasCookie && session.CurrentUser != null)
            {
                string redirectPath = HttpContext.Current.Request.Url.Query.Contains("?redirect=") ? HttpContext.Current.Request.Url.Query.Replace("?redirect=", "") : "~/home/index";
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
#if DEVMODE
                // don't redirect in DEVMODE
#else
                filterContext.Result = new RedirectResult(HttpContext.Current.Request.ApplicationPath.ToLower(CultureInfo.InvariantCulture).Replace("/admin", "") + "/?redirect=" + HttpContext.Current.Request.ApplicationPath.ToLower(CultureInfo.InvariantCulture));
#endif
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
