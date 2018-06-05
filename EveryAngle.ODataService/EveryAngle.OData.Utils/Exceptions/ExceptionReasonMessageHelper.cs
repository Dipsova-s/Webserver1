using System;
using System.Collections.Generic;
using System.Net;
using System.Web.Http;

namespace EveryAngle.OData.Utils
{
    // Copy from AS ExceptionReasonMessageHelper, this should be implement on share components 
    public static class ExceptionReasonMessageHelper
    {
        private static readonly Dictionary<Type, string> _exceptionReasonMessageMapper = new Dictionary<Type, string>
        {
            { typeof(HttpResponseException)                 , "Failed to create a normal response, see message for more info" },
            { typeof(ArgumentException)                     , "Unprocessable Entity" },
            { typeof(WebException)                          , "Bad requested" },
        };

        public static int SupportCount { get { return _exceptionReasonMessageMapper.Count; } }

        public static string GetReasonMessage(Exception exception)
        {
            Type t = exception.GetType();
            return _exceptionReasonMessageMapper.ContainsKey(t) ? _exceptionReasonMessageMapper[t] : null;
        }
    }
}
