using System.Web.Http;
using System.Net.Http;
using EveryAngle.WebClient.Service.HttpHandlers;
using System.Web;
using EveryAngle.WebClient.Service.ErrorHandlers;
using EveryAngle.WebClient.Service.LogHandlers;
using System.Net;
using System.Linq;
using System.Diagnostics.CodeAnalysis;

namespace EveryAngle.WebClient.Web.Controllers
{
    [CustomApiHandleCompactError]
    [LogExceptionApiHandler]
    [ExcludeFromCodeCoverage] // Cannot mock DirectProxyRequestManager
    public class DirectProxyController : ApiController
    {
        private readonly string[] allowedApis = { "api/gateway" };

        public HttpResponseMessage Get()
        {
            try
            {
                var requestUrl = DirectProxyRequestManager.GetProxyRequestUrl();
                if (!allowedApis.Any(x => requestUrl.StartsWith(x)))
                {
                    throw new HttpException((int)HttpStatusCode.Forbidden, $"Url '{requestUrl}' not allowed");
                }
                var requestManager = DirectProxyRequestManager.Initialize($"/{requestUrl}");
                var jsonResult = requestManager.Run();
                return HttpResponseMessageBuilder.GetHttpResponseMessageAsString(this, jsonResult, requestManager.ResponseStatus.GetHashCode());
            }
            catch (HttpException ex)
            {
                throw new HttpException(ex.GetHttpCode(), ex.Message);  
            }
        }
    }
}