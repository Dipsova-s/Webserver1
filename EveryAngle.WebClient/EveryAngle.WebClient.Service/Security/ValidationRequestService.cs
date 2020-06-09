using EveryAngle.WebClient.Service.Security.Interfaces;
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
    public class ValidationRequestService : IValidationRequestService
    {
        public const string TokenHeaderId = "Request-Verification-Token";
        public const string TokenQueryStringId = "request_verification_token";
        public Func<IValidationRequestContext> ValidatorFunction { get; set; }

        private ValidationRequestService()
        {
            ValidatorFunction = () => new ValidationRequestContext();
        }

        private static IValidationRequestService _instance;
        public static IValidationRequestService Instance()
        {
            return _instance ?? (_instance = new ValidationRequestService());
        }

        public string GetToken()
        {
            string cookieToken = string.Empty, formToken = string.Empty;
            ValidatorFunction().GetTokens(null, out cookieToken, out formToken);
            return $"{cookieToken}:{formToken}";
        }

        public void ValidateToken(HttpRequestMessage request)
        {
            if (request.Headers.TryGetValues(TokenHeaderId, out IEnumerable<string> requestToken))
            {
                ValidateToken(requestToken.FirstOrDefault());
            }

            else if (TryGetTokenFromQueryString(request, out string token))
            {
                ValidateToken(token);
            }

            else
            {
                throw new HttpException((int)HttpStatusCode.Forbidden,
                    "Missing CSRF token");
            }

        }

        public void ValidateToken(HttpRequestBase request)
        {
            var requestToken = request.Headers.GetValues(TokenHeaderId);

            if (requestToken != null)
            {
                ValidateToken(requestToken.FirstOrDefault());
            }
            else if (TryGetTokenFromQueryString(request, out string token))
            {
                ValidateToken(token);
            }
            else
            {
                throw new HttpException((int)HttpStatusCode.Forbidden,
                    "Missing CSRF token");
            }

        }

        private void ValidateToken(string requestToken)
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

        private bool TryGetTokenFromQueryString(HttpRequestMessage request, out string token)
        {
            var result = request.GetQueryNameValuePairs().FirstOrDefault(x => x.Key.Equals(TokenQueryStringId));
            token = result.Value;
            return result.Value != null;
        }

        private bool TryGetTokenFromQueryString(HttpRequestBase request, out string token)
        {
            var result = request.QueryString?.GetValues(TokenQueryStringId);
            token = result != null ? result[0] : null;
            return token != null;
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
