using System;
using System.Collections.Generic;
using System.Net;

namespace EveryAngle.OData.Utils.Exceptions
{
    // Copy from AS ExceptionCodeHelper, this should be implement on share components 
    public static class ExceptionCodeHelper
    {
        private static readonly Dictionary<Type, HttpStatusCode> _exceptionCodeMapper = new Dictionary<Type, HttpStatusCode>
        {
            { typeof(Exception)                         , HttpStatusCode.InternalServerError },
            { typeof(InvalidOperationException)         , HttpStatusCode.InternalServerError },
            { typeof(ArgumentNullException)             , HttpStatusCode.NotFound },
            { typeof(NotSupportedException)             , HttpStatusCode.MethodNotAllowed },
            { typeof(KeyNotFoundException)              , HttpStatusCode.UnsupportedMediaType },
            { typeof(ArgumentException)                 , (HttpStatusCode)422 },
            { typeof(WebException)                      , (HttpStatusCode)422 },
        };

        public static int SupportCount { get { return _exceptionCodeMapper.Count; } }

        public static HttpStatusCode GetExceptionCode(Exception exception)
        {
            Type t = exception.GetType();
            return _exceptionCodeMapper.ContainsKey(t) ? _exceptionCodeMapper[t] : HttpStatusCode.InternalServerError;
        }
    }
}