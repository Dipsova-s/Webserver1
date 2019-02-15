using Newtonsoft.Json.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;


namespace EveryAngle.WebClient.Service.HttpHandlers
{
    public class HttpResponseMessageBuilder
    {
        public static HttpResponseMessage GetHttpResponseMessage(ApiController controller, JObject jsonResult)
        {
            HttpStatusCode statusCode = HttpContext.Current.Response.StatusCode != 0 ? (HttpStatusCode)HttpContext.Current.Response.StatusCode : HttpStatusCode.RequestTimeout;
            return controller.Request.CreateResponse(statusCode, jsonResult);
        }

        public static HttpResponseMessage GetHttpResponseMessage(ApiController controller, JObject jsonResult,int statusCode)
        {
            return controller.Request.CreateResponse((HttpStatusCode)statusCode, jsonResult);
        }

        public static HttpResponseMessage GetHttpResponseMessageFromArray(ApiController controller, JArray jsonResult)
        {
            HttpStatusCode statusCode = HttpContext.Current.Response.StatusCode != 0 ? (HttpStatusCode)HttpContext.Current.Response.StatusCode : HttpStatusCode.RequestTimeout;
            return controller.Request.CreateResponse(statusCode, jsonResult);
        }

        public static HttpResponseMessage GetHttpResponseMessage(ApiController controller, JObject jsonResult, HttpStatusCode status, bool addCookie)
        {
            HttpResponseMessage responseMessage = controller.Request.CreateResponse(status, jsonResult);
            return responseMessage;

        }

        public static HttpResponseMessage GetHttpResponseMessage(ApiController controller, JArray jsonResult, int statusCode)
        {
            return controller.Request.CreateResponse((HttpStatusCode)statusCode, jsonResult);
        }
    }
}
