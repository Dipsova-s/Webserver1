using EveryAngle.Logging;
using EveryAngle.Shared.Helpers;
using Newtonsoft.Json.Linq;
using System.Web;
using System.Web.Mvc;

namespace EveryAngle.WebClient.Service.LogHandlers
{
    public class LogExceptionHandler : HandleErrorAttribute
    {
        public override void OnException(ExceptionContext filterContext)
        {
            WriteLog(filterContext);
            base.OnException(filterContext);
        }

        //ONLY log the exception no need to other thing
        private void WriteLog(ExceptionContext filterContext)
        {
            HttpException errorException = new HttpException(null, filterContext.Exception);
            string errorMessage = errorException.InnerException == null ? errorException.Message : errorException.InnerException.Message;
            if (UtilitiesHelper.IsValidJson(errorMessage))
            {
                dynamic errorObject = JObject.Parse(errorMessage);
                errorMessage = errorObject.message.ToString();
            }
            Log.SendException(errorMessage, errorException);
        }
    
    }
}
