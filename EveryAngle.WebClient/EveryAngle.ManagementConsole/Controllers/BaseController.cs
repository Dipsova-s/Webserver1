using EveryAngle.Shared.Helpers;
using EveryAngle.WebClient.Service.ErrorHandlers;
using EveryAngle.WebClient.Service.LogHandlers;
using EveryAngle.WebClient.Service.Security;
using EveryAngle.WebClient.Web.Filters.ActionFilters;
using System;
using System.Configuration;
using System.Globalization;
using System.Threading;
using System.Web.Mvc;

namespace EveryAngle.ManagementConsole.Controllers
{
    [ValidateInput(false)]
    [ValidationRequest]
    [LogExceptionHandler(Order = 2)]
    [CustomHandleError(Order = 1)]
    public class BaseController : Controller
    {
        protected SessionHelper SessionHelper;

        public BaseController()
        {
            if (SessionHelper == null)
                SessionHelper = SessionHelper.Initialize();
        }

        public int DefaultPageSize
        {
            get
            {
                return SessionHelper.SystemSettings.default_pagesize;
            }
        }

        public int MaxPageSize
        {
            get
            {
                try
                {
                    return SessionHelper.SystemSettings.max_pagesize;
                }
                catch (Exception)
                {
                    return 0;
                }

            }
        }

        public string OffsetLimitQuery
        {
            get
            {
                return UtilitiesHelper.GetOffsetLimitQueryString(1, MaxPageSize);
            }
        }

        public int DefaultCommentPageSize
        {
            get { return Convert.ToInt32(ConfigurationManager.AppSettings["DefaultCommentPageSize"]); }
        }

        protected override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            SessionHelper session = SessionHelper.Initialize();
            if (!session.HasCookie || !CanAccessSystem(session))
            {
#if DEVMODE
                session.DestroyAllSession();
                session.SetCookieToExpired();
                filterContext.Result = new RedirectResult("~/security/index?redirect=/home/index");
#else
                bool forceToWC = !CanAccessSystem(session);
                string loginUrl = EveryAngle.Shared.Helpers.UrlHelper.GetLoginPath(forceToWC);
                filterContext.Result = new RedirectResult(loginUrl);
#endif
                return;
            }

            if (session.CurrentUser.Settings == null)
            {
                session.RefreshUserSettings();
            }

            SetCurrentLanguage();
            base.OnActionExecuting(filterContext);
        }

        private void SetCurrentLanguage()
        {
            var webLanguage = "en";
            Thread.CurrentThread.CurrentCulture = CultureInfo.CreateSpecificCulture(webLanguage);
            Thread.CurrentThread.CurrentUICulture = CultureInfo.CreateSpecificCulture(webLanguage);
        }

        private bool CanAccessSystem(SessionHelper session)
        {
            // M4-28350: schedule_angles with licensed can access MC but only in Automation tasks > Tasks
            return session.Session.IsValidToManagementAccess()
                || (session.Session.IsValidToScheduleAngles() && session.Info.AngleAutomation);
        }

    }
}
