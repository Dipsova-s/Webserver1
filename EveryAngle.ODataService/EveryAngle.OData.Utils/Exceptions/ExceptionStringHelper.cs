using System.Collections.Generic;
using System.Net;

namespace EveryAngle.OData.Utils.Exceptions
{
    public static class ExceptionStringHelper
    {
        private static readonly Dictionary<string, HttpStatusCode> _exceptionStringeMapper = new Dictionary<string, HttpStatusCode>
        {
            { "InternalServerError",            HttpStatusCode.InternalServerError },
            { "MethodNotAllowed",               HttpStatusCode.MethodNotAllowed },
            { "UnsupportedMediaType",           HttpStatusCode.UnsupportedMediaType },
            { "BadRequest",                     HttpStatusCode.BadRequest },
            { "Forbidden",                      HttpStatusCode.Forbidden },
            { "NotFound",                       HttpStatusCode.NotFound },
            { "UnprocessableEntity",            (HttpStatusCode)422 }
        };

        public static int SupportCount { get { return _exceptionStringeMapper.Count; } }

        public static HttpStatusCode AsHttpStatusCode(this string reason)
        {
            return _exceptionStringeMapper.ContainsKey(reason) ? _exceptionStringeMapper[reason] : HttpStatusCode.InternalServerError;
        }
    }
}
