using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.Http.Filters;

namespace EveryAngle.WebClient.Service.ErrorHandlers
{
    public class CustomApiHandleCompactErrorAttribute : ExceptionFilterAttribute
    {
        public override void OnException(HttpActionExecutedContext actionExecutedContext)
        {
            var request = actionExecutedContext.Request;
            var response = request.CreateErrorResponse(HttpStatusCode.InternalServerError, actionExecutedContext.Exception.Message);
            var content = (ObjectContent<HttpError>)response.Content;

            var errorValues = (HttpError)content.Value;

            if (actionExecutedContext.Exception.GetType() == typeof(HttpException))
            {
                var httpException = actionExecutedContext.Exception as HttpException;
                int exceptionCode = httpException.GetHttpCode();
                errorValues["Reason"] = ((HttpStatusCode)exceptionCode).ToString();                
            }
            else
            {
                errorValues["Reason"] = "Unknown";
            }

            actionExecutedContext.Response = response;
        }
    }
}
