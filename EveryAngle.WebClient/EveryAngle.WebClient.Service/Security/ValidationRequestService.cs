using System;
using System.Configuration;
using System.Diagnostics.CodeAnalysis;
using System.Globalization;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;
using EveryAngle.WebClient.Service.Extensions;
using EveryAngle.WebClient.Service.Security.Interfaces;
using IdentityModel.Client;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.Owin;

namespace EveryAngle.WebClient.Service.Security
{
    public class ValidationRequestService : IValidationRequestService, IDisposable
    {
        public const string TokenHeaderId = "Request-Verification-Token";
        public const string TokenQueryStringId = "request_verification_token";
        private const string AuthoritySettingName = "Authority";
        private const string ClientSecret = "api-secret";
        private const string IdTokenClaimTypeName = "id_token";
        private const string RefreshTokenClaimTypeName = "refresh_token";
        private const string AccessTokenClaimName = "access_token";
        private const string AccessTokenExpiresAtClaimName = "access_token_expires_at";
        private const string WebServerClientId = "web_server";

        private ValidationRequestService()
        {
            _handler = new JwtSecurityTokenHandler();
            _discoveryClient = new HttpClient();
            _refreshTokenClient = new HttpClient();
        }

        // For testing
        public ValidationRequestService(HttpClient discoveryClient, HttpClient refreshTokenClient)
        {
            _handler = new JwtSecurityTokenHandler();
            _discoveryClient = discoveryClient;
            _refreshTokenClient = refreshTokenClient;
        }

        private static IValidationRequestService _instance;
        private readonly JwtSecurityTokenHandler _handler;
        private readonly HttpClient _discoveryClient;
        private readonly HttpClient _refreshTokenClient;

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

        public async Task ValidateToken(HttpRequestMessage request)
        {
            var cookieTokenTask = request.GetOwinContext().AuthenticateAsyncFromCookies();
            var token = cookieTokenTask.Result?.GetAccessToken();
            var requestToken = token != null ? _handler.ReadJwtToken(token) : null;

            if (requestToken != null && cookieTokenTask.Result?.Identity != null)
            {
                await EnsureValidAccessToken(request.GetOwinContext(), cookieTokenTask.Result?.Identity).ConfigureAwait(false);
            }
            else
            {
                throw new HttpException((int)HttpStatusCode.Forbidden, "Missing CSRF token");
            }
        }

        [ExcludeFromCodeCoverage] // Cannot mock the owin context as there is no extension method to set the owin context on a request base
        public async Task ValidateToken(HttpRequestBase request)
        {
            var cookieTokenTask = request.GetOwinContext().AuthenticateAsyncFromCookies();
            var token = cookieTokenTask.Result?.GetAccessToken();
            var requestToken = token != null ? _handler.ReadJwtToken(token) : null;

            if (requestToken != null && cookieTokenTask.Result?.Identity != null)
            {
                await EnsureValidAccessToken(request.GetOwinContext(), cookieTokenTask.Result?.Identity).ConfigureAwait(false);
            }
            else
            {
                throw new HttpException((int)HttpStatusCode.Forbidden, "Missing CSRF token");
            }
        }

        private async Task EnsureValidAccessToken(IOwinContext owinContext, ClaimsIdentity claimsIdentity)
        {
            var minimumValidityLeft = new TimeSpan(0, 1, 0);
            var accessTokenClaim = claimsIdentity.FindFirst(AccessTokenClaimName);
            var accessTokenExpirationClaim = claimsIdentity.FindFirst(AccessTokenExpiresAtClaimName);
            var accessTokenExpirationDate = DateTime.Parse(accessTokenExpirationClaim.Value, null, DateTimeStyles.RoundtripKind);
            if ((accessTokenExpirationDate - DateTime.UtcNow) < minimumValidityLeft)
            {
                // if the access token is expired or about to expire, get a new one
                var refreshTokenClaim = claimsIdentity.FindFirst(RefreshTokenClaimTypeName);

                var tokenResult = await GetRefreshedToken(refreshTokenClaim.Value).ConfigureAwait(false);
                if (tokenResult != null && !tokenResult.IsError)
                {
                    if (!string.IsNullOrEmpty(tokenResult.RefreshToken))
                    {
                        // if we've got a new refresh token, replace the old one
                        claimsIdentity.RemoveClaim(refreshTokenClaim);
                        claimsIdentity.AddClaim(new Claim(RefreshTokenClaimTypeName, tokenResult.RefreshToken));
                    }
                    claimsIdentity.RemoveClaim(accessTokenClaim);
                    claimsIdentity.AddClaim(new Claim(AccessTokenClaimName, tokenResult.AccessToken));
                    var idTokenClaim = claimsIdentity.FindFirst(IdTokenClaimTypeName);
                    claimsIdentity.RemoveClaim(idTokenClaim);
                    claimsIdentity.AddClaim(new Claim(IdTokenClaimTypeName, tokenResult.AccessToken));
                    claimsIdentity.RemoveClaim(accessTokenExpirationClaim);
                    var newAccessTokenExpirationDate = DateTime.UtcNow.AddSeconds(tokenResult.ExpiresIn);
                    claimsIdentity.AddClaim(new Claim(AccessTokenExpiresAtClaimName, newAccessTokenExpirationDate.ToString("o")));

                    // replace the current identity with the new one this generates a new session cookie
                    owinContext.Authentication.SignIn(claimsIdentity);
                }
                else
                {
                    // Log could not refresh access token need to sign in again
                }
            }
        }

        /// <summary>
        /// Gets the refreshed token.
        /// </summary>
        /// <param name="refreshToken">The refresh token.</param>
        /// <returns></returns>
        private async Task<TokenResponse> GetRefreshedToken(string refreshToken)
        {
            var discoveryResponse = GetDiscoveryDocument();
            if (discoveryResponse == null)
            {
                return null;
            }

            var tokenRequest = new RefreshTokenRequest
            {
                Address = discoveryResponse.TokenEndpoint,
                ClientId = WebServerClientId,
                ClientSecret = ClientSecret,
                GrantType = OpenIdConnectGrantTypes.RefreshToken,
                RefreshToken = refreshToken
            };

            try
            {
                return await _refreshTokenClient.RequestRefreshTokenAsync(tokenRequest).ConfigureAwait(false);
            }
            catch (Exception)
            {
                // Error getting refresh token retry on next attempt
                return null;
            }
        }

        /// <summary>
        /// Retrieves the discovery document, and caches the result.
        /// </summary>
        private DiscoveryDocumentResponse GetDiscoveryDocument()
        {
            var discoveryDocumentRequest = new DiscoveryDocumentRequest
            {
                Address = ConfigurationManager.AppSettings[AuthoritySettingName],
                Policy =
                    {
                        ValidateIssuerName = false
                    }
            };
            var discoveryResponse = _discoveryClient.GetDiscoveryDocumentAsync(discoveryDocumentRequest).Result;
            return discoveryResponse.IsError ? null : discoveryResponse;
        }

        public void Dispose()
        {
            _discoveryClient.Dispose();
            _refreshTokenClient.Dispose();
        }
    }
}
