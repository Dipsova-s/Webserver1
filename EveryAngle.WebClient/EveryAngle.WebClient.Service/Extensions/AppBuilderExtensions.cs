using System;
using System.Configuration;
using System.Diagnostics.CodeAnalysis;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNet.Identity;
using Microsoft.IdentityModel.Logging;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.Cookies;
using Microsoft.Owin.Security.OpenIdConnect;
using Owin;

namespace EveryAngle.WebClient.Service.Extensions
{
    [ExcludeFromCodeCoverage]
    public static class AppBuilderExtensions
    {
        private const string Scope = "openid profile application_server";
        private const string CookieName = "STSEASECTOKEN";
        private const string AuthenticationType = "Cookies";
        private const string ClientSecret = "api-secret";
        private const string IdTokenClaimTypeName = "id_token";
        private const string NameClaimType = "full_name";
        private const string AuthoritySettingName = "Authority";

        public static void SetupAuthenticationProviders(this IAppBuilder app, string clientId, string redirectUri, string postLogoutRedirectUriPath)
        {
            // Remove trailing slash (if any)
            if (redirectUri.EndsWith("/"))
            {
                redirectUri = redirectUri.Substring(0, redirectUri.Length - 1);
            }

            var postLogoutRedirectUri = $"{redirectUri}{postLogoutRedirectUriPath}";

            app.UseExternalSignInCookie(DefaultAuthenticationTypes.ExternalCookie);

            app.SetDefaultSignInAsAuthenticationType(CookieAuthenticationDefaults.AuthenticationType);
            app.UseCookieAuthentication(new CookieAuthenticationOptions
            {
                CookieName = CookieName,
                AuthenticationType = AuthenticationType,
                ExpireTimeSpan = TimeSpan.FromHours(1)
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

                ResponseType = OpenIdConnectResponseType.Code,
                Notifications = new OpenIdConnectAuthenticationNotifications
                {
                    SecurityTokenValidated = n =>
                    {
                        var id = n.AuthenticationTicket.Identity;

                        id.AddClaim(new Claim(IdTokenClaimTypeName, n.ProtocolMessage.IdToken));
                        n.AuthenticationTicket = new AuthenticationTicket(
                            id,
                            n.AuthenticationTicket.Properties);

                        // Store a temporary cookie to let the search page know that a new login was initiated.
                        n.Response.Cookies.Append("NewLogin", "true");

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
    }
}
