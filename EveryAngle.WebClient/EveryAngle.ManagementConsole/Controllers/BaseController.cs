using EveryAngle.Shared.Helpers;
using EveryAngle.WebClient.Service.ErrorHandlers;
using EveryAngle.WebClient.Service.LogHandlers;
using EveryAngle.WebClient.Service.Security;
using EveryAngle.WebClient.Service.Security.Interfaces;
using System;
using System.Configuration;
using System.Globalization;
using System.Net;
using System.Threading;
using System.Web;
using System.Web.Mvc;
using EveryAngle.Logging;

namespace EveryAngle.ManagementConsole.Controllers
{
    [ValidateInput(false)]
    [LogExceptionHandler(Order = 2)]
    [CustomHandleError(Order = 1)]
    public class BaseController : Controller
    {
        public IValidationRequestService ValidationRequestService { get; }
        protected AuthorizationHelper AuthorizationHelper;
        internal delegate string GetLoginPathDelegate(bool forceToWc);
        internal GetLoginPathDelegate GetLoginPath;

        public BaseController()
        {
            if (AuthorizationHelper == null)
                AuthorizationHelper = AuthorizationHelper.Initialize();
            GetLoginPath = Shared.Helpers.UrlHelper.GetLoginPath;
            ValidationRequestService = WebClient.Service.Security.ValidationRequestService.Instance();
        }

        internal BaseController(AuthorizationHelper authorizationHelper) : this(authorizationHelper, WebClient.Service.Security.ValidationRequestService.Instance())
        {
        }

        internal BaseController(AuthorizationHelper authorizationHelper, IValidationRequestService validationRequestService)
        {
            AuthorizationHelper = authorizationHelper;
            ValidationRequestService = validationRequestService;
        }

        public int DefaultPageSize => AuthorizationHelper.SystemSettings.default_pagesize;

        public int MaxPageSize
        {
            get
            {
                try
                {
                    return AuthorizationHelper.SystemSettings.max_pagesize;
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
            if (!ValidateToken(filterContext))
            {
                return;
            }

            HandleActionExecution(filterContext);
            base.OnActionExecuting(filterContext);
        }

        internal bool ValidateToken(ActionExecutingContext filterContext)
        {
            try
            {
                ValidationRequestService.ValidateToken(filterContext.HttpContext.Request).Wait();
                return true;
            }
            catch (AggregateException ex) when ((ex.InnerException as HttpException)?.GetHttpCode() == (int) HttpStatusCode.Forbidden)
            {
                Log.SendWarning("No valid token found, redirecting to STS");
                filterContext.Result = new RedirectResult(GetLoginPath(false));
                return false;
            }
        }

        internal void HandleActionExecution(ActionExecutingContext filterContext)
        {
            if ((!AuthorizationHelper.HasCookie || !CanAccessSystem(AuthorizationHelper)) && GetLoginPath != null)
            {
#if DEVMODE
                AuthorizationHelper.DestroyAllSession();
                filterContext.Result = new RedirectResult("~/security/index?redirect=/home/index");
#else
                bool forceToWc = !CanAccessSystem(AuthorizationHelper);
                string loginUrl = GetLoginPath(forceToWc);
                filterContext.Result = new RedirectResult(loginUrl);
#endif
                return;
            }

            if (AuthorizationHelper.CurrentUser.Settings == null)
            {
                AuthorizationHelper.RefreshUserSettings();
            }

            SetCurrentLanguage();
        }

        private void SetCurrentLanguage()
        {
            var webLanguage = "en";
            Thread.CurrentThread.CurrentCulture = CultureInfo.CreateSpecificCulture(webLanguage);
            Thread.CurrentThread.CurrentUICulture = CultureInfo.CreateSpecificCulture(webLanguage);
        }

        private bool CanAccessSystem(AuthorizationHelper session)
        {
            // M4-28350: schedule_angles with licensed can access MC but only in Automation tasks > Tasks
            return session.Session.IsValidToManagementAccess()
                || (session.Session.IsValidToScheduleAngles() && session.Info.AngleAutomation);
        }

    }
}
