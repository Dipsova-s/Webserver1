using System.Web.Http;
using System.Net.Http;
using EveryAngle.WebClient.Service.HttpHandlers;
using System.Web;
using EveryAngle.WebClient.Service.ErrorHandlers;
using EveryAngle.WebClient.Service.LogHandlers;
using System.Net;
using System.Linq;
using System.Diagnostics.CodeAnalysis;
using System;
using Newtonsoft.Json.Linq;

namespace EveryAngle.WebClient.Web.Controllers
{
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
                
                var isEncrypted = requestUrl.StartsWith("api/gateway/connections");
                if(isEncrypted)
                {
                    var stringResult = requestManager.RunEncrypted();
                    return HttpResponseMessageBuilder.GetHttpResponseMessageAsString(this, stringResult, requestManager.ResponseStatus.GetHashCode());
                }

                var jsonResult = requestManager.Run();
                return HttpResponseMessageBuilder.GetHttpResponseMessage(this, jsonResult, requestManager.ResponseStatus.GetHashCode());
            }
            catch (Exception ex)
            {
                var statusCode = HttpStatusCode.InternalServerError;
                if (ex.GetType() == typeof(HttpException))
                {
                    var httpException = ex as HttpException;
                    int exceptionCode = httpException.GetHttpCode();
                    statusCode = (HttpStatusCode)exceptionCode;
                }
                JObject errorResponse = null;
                try
                {
                    errorResponse = JObject.Parse(ex.Message);
                }
                catch
                {
                    errorResponse = new JObject()
                    {
                        ["Reason"] = statusCode.ToString(),
                        ["Message"] = ex.Message
                    };
                }                

                return HttpResponseMessageBuilder.GetHttpResponseMessage(this, errorResponse, statusCode.GetHashCode());
            }
        }
    }
}