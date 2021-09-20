using System;
using System.Configuration;
using System.Diagnostics.CodeAnalysis;
using System.Globalization;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;
using EveryAngle.WebClient.Service.Security;
using Microsoft.AspNet.Identity;
using Microsoft.IdentityModel.Logging;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Owin;
using Microsoft.Owin.Cors;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.Cookies;
using Microsoft.Owin.Security.OpenIdConnect;
using Owin;

namespace EveryAngle.WebClient.Service.Extensions
{

    /// <summary>
    /// This class contains an extention method so that it can be share by the MC and WC.
    ///
    /// Any changes in the class will only effect the intial login process, as it's the only controller with the [Authorize] attribute.
    /// This will remain the case until all of the controllers can be changed to support the [Authorize] attribute flow.
    /// For information on the refresh token process <see cref="ValidationRequestService"/>
    /// </summary>
    [ExcludeFromCodeCoverage]
    public static class AppBuilderExtensions
    {
        private const string Scope = "openid profile application_server offline_access";
        private const string SecurityCookieName = "STSTOKEN";
        private const string AuthenticationType = "Cookies";
        private const string ClientSecret = "api-secret";
        private const string AuthoritySettingName = "Authority";
        private const string NameClaimType = "full_name";
        private const string IdTokenClaimTypeName = "id_token";
        private const string RefreshTokenClaimTypeName = "refresh_token";
        private const string AccessTokenClaimName = "access_token";
        private const string AccessTokenExpiresAtClaimName = "access_token_expires_at";
        private const string CookieNameForNewLogins = "NewLogin";
        private const int DefaultAccessTokenExpireInSeconds = 3600;

        public static void SetupAuthenticationProviders(this IAppBuilder app, string clientId, string redirectUri, string postLogoutRedirectUriPath)
        {
            // Remove trailing slash (if any)
            if (redirectUri.EndsWith("/"))
            {
                redirectUri = redirectUri.Substring(0, redirectUri.Length - 1);
            }

            var postLogoutRedirectUri = $"{redirectUri}{postLogoutRedirectUriPath}";

            app.UseCors(CorsOptions.AllowAll);

            app.UseExternalSignInCookie(DefaultAuthenticationTypes.ExternalCookie);

            app.SetDefaultSignInAsAuthenticationType(CookieAuthenticationDefaults.AuthenticationType);
            app.UseCookieAuthentication(new CookieAuthenticationOptions
            {
                Provider = new CustomCookieAuthenticationProvider(),
                CookieName = SecurityCookieName,
                AuthenticationType = AuthenticationType,
                SlidingExpiration = true
            });

            IdentityModelEventSource.ShowPII = true;

            app.UseOpenIdConnectAuthentication(new OpenIdConnectAuthenticationOptions
            {
                ClientId = clientId,
                Authority = ConfigurationManager.AppSettings[AuthoritySettingName],
                RedirectUri = $"{redirectUri}/auth/verify",
                PostLogoutRedirectUri = postLogoutRedirectUri,
                Scope = Scope,

                AuthenticationType = OpenIdConnectGrantTypes.AuthorizationCode,

                TokenValidationParameters = new TokenValidationParameters { NameClaimType = NameClaimType },

                UseTokenLifetime = false,

                SaveTokens = true,
                RedeemCode = true,
                ClientSecret = ClientSecret,

                ProtocolValidator = new CustomOpenIdConnectProtocolValidator(),

                ResponseType = OpenIdConnectResponseType.Code,
                Notifications = new OpenIdConnectAuthenticationNotifications
                {
                    SecurityTokenValidated = n =>
                    {
                        var id = n.AuthenticationTicket.Identity;

                        n.AuthenticationTicket.Identity.AddClaim(new Claim(AccessTokenClaimName, n.ProtocolMessage.AccessToken));
                        var accessTokenExpiresInParsed = double.TryParse(n.ProtocolMessage.ExpiresIn, out var accessTokenExpiresIn);
                        var accessTokenExpirationDate = DateTime.UtcNow.AddSeconds(accessTokenExpiresInParsed ? accessTokenExpiresIn : DefaultAccessTokenExpireInSeconds); // Default to hour if parse failed
                        n.AuthenticationTicket.Identity.AddClaim(new Claim(AccessTokenExpiresAtClaimName, accessTokenExpirationDate.ToString("o")));
                        id.AddClaim(new Claim(IdTokenClaimTypeName, n.ProtocolMessage.IdToken));
                        id.AddClaim(new Claim(RefreshTokenClaimTypeName, n.ProtocolMessage.RefreshToken));
                        n.AuthenticationTicket = new AuthenticationTicket(
                            id,
                            n.AuthenticationTicket.Properties);

                        // Store a temporary cookie to let the search page know that a new login was initiated.
                        n.Response.Cookies.Append(CookieNameForNewLogins, "true", new CookieOptions { Path = HttpContext.Current.GetCookiePath() });

                        return Task.CompletedTask;
                    },
                    RedirectToIdentityProvider = n =>
                    {
                        if (n.ProtocolMessage.RequestType == OpenIdConnectRequestType.Logout)
                        {
                            var idTokenHint = n.OwinContext.Authentication.User.FindFirst(IdTokenClaimTypeName)?.Value;
                            if (string.IsNullOrWhiteSpace(idTokenHint))
                            {
                                var cookie = n.OwinContext.AuthenticateAsyncFromCookies();
                                idTokenHint = cookie.Result?.GetAccessToken();
                            }

                            n.ProtocolMessage.IdTokenHint = idTokenHint;
                            n.ProtocolMessage.PostLogoutRedirectUri = postLogoutRedirectUri;
                        }

                        return Task.CompletedTask;
                    }
                }
            });
        }

        private class CustomOpenIdConnectProtocolValidator : OpenIdConnectProtocolValidator
        {
            public CustomOpenIdConnectProtocolValidator()
            {
                NonceLifetime = new TimeSpan(0, 0, 1, 0, 0);
                RequireAcr = false;
                RequireAmr = false;
                RequireAuthTime = false;
                RequireAzp = false;
                RequireNonce = true;
                RequireState = true;
                RequireStateValidation = false;
                RequireSub = true;
                RequireTimeStampInNonce = true;
            }

            protected override void ValidateNonce(OpenIdConnectProtocolValidationContext validationContext)
            {
                // Validate nonce if it is not null
                if (validationContext.Nonce != null)
                {
                    base.ValidateNonce(validationContext);
                }
            }
        }
    }
}
