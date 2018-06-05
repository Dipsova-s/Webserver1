using EveryAngle.Core.ViewModels.Users;
using EveryAngle.WebClient.Service.Security;
using System.Globalization;
using System.Threading;
using System.Web;
using System.Web.Mvc;

namespace EveryAngle.WebClient.Web.Filters.ActionFilters
{
    public class IsUserLogedInAction : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            try
            {
                SessionHelper session = SessionHelper.Initialize();
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
                        string currentUserLanguage = "en";
                        UserSettingsViewModel setting = session.GetUserSettings();
                        if (setting != null && !string.IsNullOrEmpty(setting.default_language) && !string.IsNullOrEmpty(setting.default_language.Trim()))
                        {
                            currentUserLanguage = setting.default_language;
                        }
                        redirectPath = "~/" + currentUserLanguage + "/search/searchPage";
                    }
                    filterContext.Result = new RedirectResult(redirectPath);
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



    }
}
