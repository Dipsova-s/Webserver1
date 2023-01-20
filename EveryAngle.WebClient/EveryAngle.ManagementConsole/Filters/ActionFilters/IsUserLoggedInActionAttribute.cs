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
            AuthorizationHelper session = AuthorizationHelper.Initialize();
            if (session.HasCookie && session.CurrentUser != null)
            {
                string redirectPath = HttpContext.Current.Request.Url.Query.Contains("?redirect=") ? HttpContext.Current.Request.Url.Query.Replace("?redirect=", "") : "~/home/index";
                filterContext.Result = new RedirectResult(redirectPath);
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
    }
}
