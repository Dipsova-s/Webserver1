using EveryAngle.Logging;
using System;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Http.Filters;

namespace EveryAngle.WebClient.Service.LogHandlers
{
    public class LogExceptionApiHandler : ExceptionFilterAttribute
    {
        private LogSourceType sourceType = Directory.GetFiles(HttpContext.Current.Request.MapPath("~/bin")).FirstOrDefault(f => f.Contains("EveryAngle.WebClient.Web.dll")) != null ? LogSourceType.WebClient : LogSourceType.ManagementConsole;

        public override void OnException(HttpActionExecutedContext actionExecutedContext)
        {
            Exception ex = actionExecutedContext.Exception;
          
            string errorMessage = actionExecutedContext.Exception.InnerException == null ? actionExecutedContext.Exception.Message : actionExecutedContext.Exception.InnerException.Message;
            Log.SendException(errorMessage, ex);
            base.OnException(actionExecutedContext);

        }
    }
}
