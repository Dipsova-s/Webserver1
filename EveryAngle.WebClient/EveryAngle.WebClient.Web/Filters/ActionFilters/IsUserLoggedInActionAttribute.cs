using System.Diagnostics.CodeAnalysis;
using System.Globalization;
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
                AuthorizationHelper session = AuthorizationHelper.Initialize();
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
