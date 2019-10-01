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
    internal static class EAExceptionHandler
    {
        public static HttpResponseMessage CreateErrorResponse(HttpRequestMessage requestMessage, HttpStatusCode statusCode, string reason, string message)
        {
            ODataError odataError = new ODataError();
            odataError.ErrorCode = ((int)statusCode).ToString();
            odataError.Message = message;
            odataError.MessageLanguage = "en";

            HttpResponseMessage response = requestMessage.CreateErrorResponse(statusCode, odataError);
            return response;
        }
    }
}