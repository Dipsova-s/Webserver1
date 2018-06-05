using EveryAngle.OData.Utils;
using EveryAngle.OData.Utils.Exceptions;
using EveryAngle.OData.ViewModel;
using Microsoft.Data.OData;
using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Web.Http.OData.Extensions;

namespace EveryAngle.OData.Service.Handlers
{
    // Copy from AS EAExceptionHandler, this should be implement on share components 
    internal class EAExceptionHandler
    {
        public static HttpResponseMessage CreateResponse(HttpRequestMessage requestMessage, Exception exception)
        {
            string reasonMessage = ExceptionReasonMessageHelper.GetReasonMessage(exception);

            return CreateResponse(requestMessage, exception, reasonMessage);
        }
        public static HttpResponseMessage CreateResponse(HttpRequestMessage requestMessage, Exception exception, string reason)
        {
            HttpStatusCode statusCode = ExceptionCodeHelper.GetExceptionCode(exception);
            return CreateResponse(requestMessage, statusCode, reason, exception.Message, null);
        }

        public static HttpResponseMessage CreateResponse(HttpRequestMessage requestMessage, HttpStatusCode statusCode)
        {
            return CreateResponse(requestMessage, statusCode, string.Empty, string.Empty, null);
        }
        public static HttpResponseMessage CreateResponse(HttpRequestMessage requestMessage, HttpStatusCode statusCode, string reason, string message)
        {
            return CreateResponse(requestMessage, statusCode, reason, message, null);
        }
        public static HttpResponseMessage CreateErrorResponse(HttpRequestMessage requestMessage, HttpStatusCode statusCode, string reason, string message)
        {
            ODataError odataError = new ODataError();
            odataError.ErrorCode = ((int)statusCode).ToString();
            odataError.Message = message;
            odataError.MessageLanguage = "en";

            HttpResponseMessage response = requestMessage.CreateErrorResponse(statusCode, odataError);
            return response;
        }

        private static HttpResponseMessage CreateResponse(HttpRequestMessage requestmessage, HttpStatusCode statusCode, string returnReason, string returnMessage, Dictionary<string, string> headers, int? eaErrorCode = null)
        {
            HttpResponseMessage response = requestmessage.CreateResponse(statusCode, new ResponseStatusViewModel(returnReason, returnMessage));
            response.Headers.Add("ContentType", "application/vnd.everyangle.ErrorMessage+json");

            if (headers == null)
                return response;

            foreach (KeyValuePair<string, string> kve in headers)
            {
                response.Headers.Add(kve.Key, kve.Value);
            }

            return response;
        }
    }
}