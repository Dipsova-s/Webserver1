using System;
using System.Configuration;
using System.Diagnostics.CodeAnalysis;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Mvc;
using EveryAngle.WebClient.Service.Extensions;
using EveryAngle.WebClient.Service.Security.Interfaces;
using IdentityModel.Client;
using Newtonsoft.Json;

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
            _handler = new JwtSecurityTokenHandler();
        }

        private static IValidationRequestService _instance;
        private readonly JwtSecurityTokenHandler _handler;

        public static IValidationRequestService Instance()
        {
            return _instance ?? (_instance = new ValidationRequestService());
        }

        [ExcludeFromCodeCoverage] // Cannot mock the owin context as there is no extension method to set the owin context
        public string GetToken()
        {
            var cookieTokenTask = HttpContext.Current.Request.GetOwinContext().AuthenticateAsyncFromCookies();
            var token = cookieTokenTask.Result?.GetAccessToken();

            return token;
        }

        public void ValidateToken(HttpRequestMessage request)
        {
            var cookieTokenTask = request.GetOwinContext().AuthenticateAsyncFromCookies();
            var token = cookieTokenTask.Result?.GetAccessToken();
            var requestToken = token != null ? _handler.ReadJwtToken(token) : null;

            if (requestToken != null)
            {
                ValidateToken(requestToken, token);
            }
            else
            {
                throw new HttpException((int)HttpStatusCode.Forbidden, "Missing CSRF token");
            }
        }

        [ExcludeFromCodeCoverage] // Cannot mock the owin context as there is no extension method to set the owin context on a request base
        public void ValidateToken(HttpRequestBase request)
        {
            var cookieTokenTask = request.GetOwinContext().AuthenticateAsyncFromCookies();
            var token = cookieTokenTask.Result?.GetAccessToken();
            var requestToken = token != null ? _handler.ReadJwtToken(token) : null;

            if (requestToken != null)
            {
                ValidateToken(requestToken, token);
            }
            else
            {
                throw new HttpException((int)HttpStatusCode.Forbidden, "Missing CSRF token");
            }
        }

        private void ValidateToken(JwtSecurityToken requestToken, string token)
        {
            try
            {
                ValidatorFunction().Validate(requestToken, token);
            }
            catch (HttpAntiForgeryException ex)
            {
                throw new HttpException((int)HttpStatusCode.Unauthorized, "Invalid CSRF token", ex);
            }
            catch (Exception ex)
            {
                throw new HttpException((int)HttpStatusCode.Forbidden, ex.Message, ex);
            }
        }

        [ExcludeFromCodeCoverage]
        private class ValidationRequestContext : IValidationRequestContext
        {
            private const string AuthoritySettingName = "Authority";
            private const string ClientSecret = "api-secret";
            private const string ApplicationServerClientId = "application_server";

            public void Validate(JwtSecurityToken cookieToken, string token)
            {
                if (!(cookieToken.ValidTo.ToLocalTime() > DateTime.Now && cookieToken.Issuer.Equals("https://sts.everyangle.com") && TokenIsValid(token)))
                {
                    throw new HttpAntiForgeryException("Token has expired or the token issuer isn't trusted.");
                }
            }

            private bool TokenIsValid(string securityToken)
            {
                var discoveryResponse = GetDiscoveryDocument();
                if (discoveryResponse == null)
                {
                    return false;
                }

                var result = RequestTokenValidation(discoveryResponse.IntrospectionEndpoint, ClientSecret, securityToken);

                return !result.IsError && result.IsActive;
            }

            /// <summary>
            /// Retrieves the discovery document, and caches the result.
            /// </summary>
            private static DiscoveryDocumentResponse GetDiscoveryDocument()
            {
                var discoveryClient = new HttpClient();
                var discoveryDocumentRequest = new DiscoveryDocumentRequest
                {
                    Address = ConfigurationManager.AppSettings[AuthoritySettingName],
                    Policy =
                    {
                        ValidateIssuerName = false
                    }
                };
                var discoveryResponse = discoveryClient.GetDiscoveryDocumentAsync(discoveryDocumentRequest).Result;
                return discoveryResponse.IsError ? null : discoveryResponse;
            }

            // Using the Application Server client because the Web_Server client needs to be authorized to validate tokens
            private static TokenIntrospectionResponse RequestTokenValidation(string address, string clientSecret, string token)
            {
                var client = new HttpClient();
                var introspectionRequest = new TokenIntrospectionRequest
                {
                    Address = address,
                    ClientId = ApplicationServerClientId,
                    ClientSecret = clientSecret,
                    Token = token
                };

                return client.IntrospectTokenAsync(introspectionRequest).Result;
            }
        }
    }

    public interface IValidationRequestContext
    {
        void Validate(JwtSecurityToken cookieToken, string token);
    }

}
