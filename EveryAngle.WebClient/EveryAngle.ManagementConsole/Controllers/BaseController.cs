using EveryAngle.Shared.Helpers;
using EveryAngle.WebClient.Service.ErrorHandlers;
using EveryAngle.WebClient.Service.LogHandlers;
using EveryAngle.WebClient.Service.Security;
using EveryAngle.WebClient.Service.Security.Interfaces;
using System;
using System.Configuration;
using System.Globalization;
using System.Threading;
using System.Web.Mvc;

namespace EveryAngle.ManagementConsole.Controllers
{
    [ValidateInput(false)]
    [LogExceptionHandler(Order = 2)]
    [CustomHandleError(Order = 1)]
    public class BaseController : Controller
    {
        public IValidationRequestService ValidationRequestService { get; private set; }
        protected SessionHelper SessionHelper;
        internal delegate string GetLoginPathDelegate(bool forceToWc);
        internal GetLoginPathDelegate GetLoginPath;

        public BaseController()
        {
            if (SessionHelper == null)
                SessionHelper = SessionHelper.Initialize();
            GetLoginPath = Shared.Helpers.UrlHelper.GetLoginPath;
            ValidationRequestService = WebClient.Service.Security.ValidationRequestService.Instance();
        }

        internal BaseController(SessionHelper sessionHelper) : this(sessionHelper, WebClient.Service.Security.ValidationRequestService.Instance())
        {
        }

        internal BaseController(SessionHelper sessionHelper, IValidationRequestService validationRequestService)
        {
            SessionHelper = sessionHelper;
            ValidationRequestService = validationRequestService;
        }

        public int DefaultPageSize => SessionHelper.SystemSettings.default_pagesize;

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
            ValidateToken(filterContext);
            HandleActionExecution(filterContext);
            base.OnActionExecuting(filterContext);
        }

        internal void ValidateToken(ActionExecutingContext filterContext)
        {
            ValidationRequestService.ValidateToken(filterContext.HttpContext.Request).Wait();
        }

        internal void HandleActionExecution(ActionExecutingContext filterContext)
        {
            if ((!SessionHelper.HasCookie || !CanAccessSystem(SessionHelper)) && GetLoginPath != null)
            {
#if DEVMODE
                SessionHelper.DestroyAllSession();
                filterContext.Result = new RedirectResult("~/security/index?redirect=/home/index");
#else
                bool forceToWc = !CanAccessSystem(SessionHelper);
                string loginUrl = GetLoginPath(forceToWc);
                filterContext.Result = new RedirectResult(loginUrl);
#endif
                return;
            }

            if (SessionHelper.CurrentUser.Settings == null)
            {
                SessionHelper.RefreshUserSettings();
            }

            SetCurrentLanguage();
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
