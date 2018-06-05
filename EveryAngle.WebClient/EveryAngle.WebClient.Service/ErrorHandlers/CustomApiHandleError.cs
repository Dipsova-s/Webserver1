using EveryAngle.Shared.Helpers;
using EveryAngle.WebClient.Service.Security;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web;
using System.Web.Http;
using System.Web.Http.Filters;
using System.Web.Mvc;

namespace EveryAngle.WebClient.Service.ErrorHandlers
{
    public class CustomApiHandleError : ExceptionFilterAttribute
    {
        public override void OnException(HttpActionExecutedContext actionExecutedContext)
        {
            ErrorHandler(actionExecutedContext);
        }

        private void ErrorHandler(HttpActionExecutedContext actionExecutedContext)
        {
            Exception ex = actionExecutedContext.Exception;
            int statusCode = ex is HttpException ? ((HttpException)(ex)).GetHttpCode() == 0 ? (int)System.Net.HttpStatusCode.RequestTimeout : ((HttpException)(ex)).GetHttpCode() : 500;
            JObject message = new JObject();

            if (UtilitiesHelper.IsValidJson(ex.Message))
            {
                message = JObject.Parse(ex.Message);
            }
            else
            {
                message = new JObject(new JProperty("reason", ((System.Net.HttpStatusCode)statusCode).ToString()), new JProperty("message", ex.Message));
            }

            var resp = new HttpResponseMessage(((System.Net.HttpStatusCode)statusCode))
            {
                Content = new StringContent(JsonConvert.SerializeObject(message))
            };

            resp.Content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
            throw new HttpResponseException(resp);
        }


    }

}
