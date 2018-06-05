using EveryAngle.WebClient.Service.Security;
using System.Web;
using System.Web.Mvc;

namespace EveryAngle.ManagementConsole.Filters.ActionFilters
{
    public class IsUserLogedInAction : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            SessionHelper session = SessionHelper.Initialize();
            if (session.HasCookie && session.CurrentUser != null)
            {
                string redirectPath;
                if (HttpContext.Current.Request.Url.Query.Contains("?redirect="))
                {
                    redirectPath = HttpContext.Current.Request.Url.Query.Replace("?redirect=", "");
                }
                else
                {
                    redirectPath = "~/home/index";
                }
                filterContext.Result = new RedirectResult(redirectPath);
            }
            else
            {
#if DEVMODE
                // don't redirect in DEVMODE
#else
                filterContext.Result = new RedirectResult(HttpContext.Current.Request.ApplicationPath.ToLower().Replace("/admin", "") + "/?redirect=" + HttpContext.Current.Request.ApplicationPath.ToLower());
#endif
            }
        }
    }
}
