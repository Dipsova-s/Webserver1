using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Helpers;
using System.Web.Mvc;

namespace EveryAngle.WebClient.Service.Security
{
    public class ValidationRequestService
    {
        public const string TokenHeaderId = "Request-Verification-Token";
        public const string TokenQueryStringId = "request_verification_token";
        public static Func<IValidationRequestContext> ValidatorFunction { get; set; }

        static ValidationRequestService()
        {
            ValidatorFunction = () => new ValidationRequestContext();
        }

        public static string GetToken()
        {
            string cookieToken = string.Empty, formToken = string.Empty;
            ValidatorFunction().GetTokens(null, out cookieToken, out formToken);
            return $"{cookieToken}:{formToken}";
        }

        public static void ValidateToken(HttpRequestMessage request)
        {
            if(request.Headers.TryGetValues(TokenHeaderId, out IEnumerable<string> requestToken))
            {
                ValidateToken(requestToken.FirstOrDefault());
            }
            
            else if(TryGetTokenFromQueryString(request, out string token))
            {
                ValidateToken(token);
            }

            else
            {
                throw new HttpException((int)HttpStatusCode.Forbidden,
                    "Missing CSRF token");
            }
            
        }

        public static void ValidateToken(string requestToken)
        {
            try
            {
                string cookieToken = string.Empty, formToken = string.Empty;

                string[] tokens = requestToken.Split(':');
                if (tokens.Length != 2)
                    throw new Exception("Can't parse CSRF token");

                cookieToken = tokens[0].Trim();
                formToken = tokens[1].Trim();

                ValidatorFunction().Validate(cookieToken, formToken);
            }
            catch (HttpAntiForgeryException ex)
            {
                throw new HttpException((int)HttpStatusCode.Forbidden,
                    "Invalid CSRF token", ex);
            }
            catch (Exception ex)
            {
                throw new HttpException((int)HttpStatusCode.Forbidden,
                    ex.Message, ex);
            }
        }

        private static bool TryGetTokenFromQueryString(HttpRequestMessage request, out string token)
        {
            var result = request.GetQueryNameValuePairs().FirstOrDefault(x => x.Key.Equals(TokenQueryStringId));
            token = result.Value;
            return result.Value != null;
        }

    }

    public class ValidationRequestContext : IValidationRequestContext
    {
        public void GetTokens(string oldCookieToken, out string newCookieToken, out string formToken)
        {
            AntiForgery.GetTokens(oldCookieToken, out newCookieToken, out formToken);
        }

        public void Validate(string cookieToken, string formToken)
        {
            AntiForgery.Validate(cookieToken, formToken);
        }
    }

    public interface IValidationRequestContext
    {
        void GetTokens(string oldCookieToken, out string newCookieToken, out string formToken);
        void Validate(string cookieToken, string formToken);
    }

}
