using EveryAngle.WebClient.Service.ErrorHandlers;
using EveryAngle.WebClient.Service.LogHandlers;
using System.Web.Http;

namespace EveryAngle.WebClient.Web.Controllers
{
    [LogExceptionApiHandler]
    [CustomApiHandleError]
    public class BaseApiController : ApiController
    {
        public string Body
        {
            get
            {
                string body = string.Empty;
                if (ControllerContext.Request.Content != null)
                {
                    body = ControllerContext.Request.Content.ReadAsStringAsync().Result;
                }

                return body;
            }
        }
    }
}
