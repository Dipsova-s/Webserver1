using Newtonsoft.Json;
using System.Net;
using System.Text;
using System.Web.Mvc;

namespace EveryAngle.ManagementConsole.Helpers
{
    public class JsonHelper
    {
        public static JsonResult GetJsonResult(
            bool isSuccess,
            int? statusCode,
            object parameters,
            string errorMessageFromSystem,
            MessageType customErrorMessage)
        {
            return GetJsonResult(isSuccess, statusCode, parameters, errorMessageFromSystem, customErrorMessage, false);
        }

        public static JsonResult GetJsonResult(
            bool isSuccess,
            int? statusCode,
            object parameters,
            string errorMessageFromSystem,
            MessageType customErrorMessage,
            bool session_needs_update)
        {
            return new JsonResult
            {
                Data = new
                {
                    success = isSuccess,
                    message = errorMessageFromSystem == null ? 
                              ManagementConsoleEnumHelper.GetMessage(customErrorMessage) : 
                              errorMessageFromSystem,
                    status = statusCode.HasValue ? statusCode : null,
                    parameters,
                    session_needs_update
                },
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        public static ContentResult GetJsonStringResult(
            bool isSuccess,
            int? statusCode,
            string errorMessageFromSystem,
            MessageType customErrorMessage,
            object parameters)
        {
            JsonResult result = GetJsonResult(isSuccess, statusCode, parameters, errorMessageFromSystem, customErrorMessage);
            ContentResult content = new ContentResult();
            content.ContentType = "text/plain";
            content.ContentEncoding = Encoding.UTF8;
            content.Content = JsonConvert.SerializeObject(result.Data);
            return content;
        }
    }

    public class JsonErrorResult : JsonResult
    {
        private readonly HttpStatusCode _statusCode;

        public JsonErrorResult(HttpStatusCode statusCode)
        {
            _statusCode = statusCode;
        }

        public override void ExecuteResult(ControllerContext context)
        {
            context.HttpContext.Response.StatusCode = (int)_statusCode;
            base.ExecuteResult(context);
        }
    }
}
