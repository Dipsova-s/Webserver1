using System;
using System.Collections.Generic;
using System.Configuration;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using EveryAngle.WebClient.Service.Security;
using EveryAngle.WebClient.Service.Security.Interfaces;
using IdentityModel.Client;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Owin;
using Microsoft.Owin.Security;
using Moq;
using Moq.Language.Flow;
using Moq.Protected;
using Newtonsoft.Json;
using NUnit.Framework;

namespace EveryAngle.WebClient.Web.CS.Tests.SecurityTests
{
    [TestFixture]
    public class ValidationRequestServiceTests
    {
        [Test]
        public void ValidateToken_ShouldThrowHttpException_WhenRequestTokenIsNull()
        {
            // Arrange
            Mock<IAuthenticationManager> authenticationManager = new Mock<IAuthenticationManager>(MockBehavior.Strict);
            var handler = new JwtSecurityTokenHandler();
            var descriptor = new SecurityTokenDescriptor
            {
                Audience = "Everyone",
                Expires = DateTime.UtcNow.AddHours(2),
                IssuedAt = DateTime.UtcNow,
                Issuer = "https://sts.everyangle.com",
                Subject = new ClaimsIdentity()
            };
            var token = handler.CreateEncodedJwt(descriptor);

            var localOwinContextMock = new Mock<IOwinContext>(MockBehavior.Strict);

            AuthenticateResult r = new AuthenticateResult(null, new AuthenticationProperties(new Dictionary<string, string> { { "access_token", null } }), new AuthenticationDescription());
            authenticationManager.Setup(x => x.AuthenticateAsync("Cookies")).Returns(() => Task.FromResult(r));
            localOwinContextMock.Setup(x => x.Authentication).Returns(authenticationManager.Object);
            var req = new HttpRequestMessage();
            req.SetOwinContext(localOwinContextMock.Object);

            // SUT
            var service = ValidationRequestService.Instance();

            // Act & Assert
            Assert.Throws<HttpException>(async () => await service.ValidateToken(req));
        }

        [Test]
        public void ValidateToken_ShouldThrowHttpException_WhenRequestTokenIdentityIsNull()
        {
            // Arrange
            Mock<IAuthenticationManager> authenticationManager = new Mock<IAuthenticationManager>(MockBehavior.Strict);
            var handler = new JwtSecurityTokenHandler();
            var descriptor = new SecurityTokenDescriptor
            {
                Audience = "Everyone",
                Expires = DateTime.UtcNow.AddHours(2),
                IssuedAt = DateTime.UtcNow,
                Issuer = "https://sts.everyangle.com",
                Subject = null
            };
            var token = handler.CreateEncodedJwt(descriptor);

            var localOwinContextMock = new Mock<IOwinContext>(MockBehavior.Strict);

            AuthenticateResult r = new AuthenticateResult(null, new AuthenticationProperties(new Dictionary<string, string> { { "access_token", token } }), new AuthenticationDescription());
            authenticationManager.Setup(x => x.AuthenticateAsync("Cookies")).Returns(() => Task.FromResult(r));
            localOwinContextMock.Setup(x => x.Authentication).Returns(authenticationManager.Object);
            var req = new HttpRequestMessage();
            req.SetOwinContext(localOwinContextMock.Object);

            // SUT
            var service = ValidationRequestService.Instance();

            // Act & Assert
            Assert.Throws<HttpException>(async () => await service.ValidateToken(req));
        }

        [Test]
        public void ValidateToken_ShouldNotCallHttpClients_WhenAccessTokenIsNotExpired()
        {
            // Arrange
            Mock<IAuthenticationManager> authenticationManager = new Mock<IAuthenticationManager>(MockBehavior.Strict);
            var handler = new JwtSecurityTokenHandler();
            var claimsIdentity = new ClaimsIdentity();
            var descriptor = new SecurityTokenDescriptor
            {
                Audience = "Everyone",
                Expires = DateTime.UtcNow.AddHours(2),
                IssuedAt = DateTime.UtcNow,
                Issuer = "https://sts.everyangle.com",
                Subject = claimsIdentity
            };
            var token = handler.CreateEncodedJwt(descriptor);
            claimsIdentity.AddClaim(new Claim("access_token", token));
            claimsIdentity.AddClaim(new Claim("access_token_expires_at", DateTime.UtcNow.AddHours(2).ToString("o")));

            var localOwinContextMock = new Mock<IOwinContext>(MockBehavior.Strict);

            AuthenticateResult r = new AuthenticateResult(claimsIdentity, new AuthenticationProperties(), new AuthenticationDescription());
            authenticationManager.Setup(x => x.AuthenticateAsync("Cookies")).Returns(() => Task.FromResult(r));
            localOwinContextMock.Setup(x => x.Authentication).Returns(authenticationManager.Object);
            var req = new HttpRequestMessage();
            req.SetOwinContext(localOwinContextMock.Object);

            var mockDescoveryClient = new Mock<HttpClient>(MockBehavior.Strict);
            var mockRefreshTokenClient = new Mock<HttpClient>(MockBehavior.Strict);

            // SUT
#pragma warning disable CS0618 // Type or member is obsolete - Needed for this unit test
            var service = new ValidationRequestService(mockDescoveryClient.Object, mockRefreshTokenClient.Object);
#pragma warning restore CS0618 // Type or member is obsolete

            // Act
            Assert.DoesNotThrow(async () => await service.ValidateToken(req));

            // Assert
            mockDescoveryClient.VerifyAll();
            mockRefreshTokenClient.VerifyAll();
        }

        [Test]
        public async Task ValidateToken_ShouldCallHttpClients_WhenAccessTokenIsExpired()
        {
            // Arrange
            Mock<IAuthenticationManager> authenticationManager = new Mock<IAuthenticationManager>(MockBehavior.Strict);
            var handler = new JwtSecurityTokenHandler();
            var claimsIdentity = new ClaimsIdentity();
            var descriptor = new SecurityTokenDescriptor
            {
                Audience = "Everyone",
                Expires = DateTime.UtcNow.AddHours(2),
                IssuedAt = DateTime.UtcNow,
                Issuer = "https://sts.everyangle.com",
                Subject = claimsIdentity
            };
            var token = handler.CreateEncodedJwt(descriptor);
            claimsIdentity.AddClaim(new Claim("access_token", token));
            claimsIdentity.AddClaim(new Claim("id_token", token));
            claimsIdentity.AddClaim(new Claim("access_token_expires_at", DateTime.UtcNow.AddMinutes(-1).ToString("o")));
            claimsIdentity.AddClaim(new Claim("refresh_token", "some_refresh_token"));

            var localOwinContextMock = new Mock<IOwinContext>(MockBehavior.Strict);

            AuthenticateResult r = new AuthenticateResult(claimsIdentity, new AuthenticationProperties(), new AuthenticationDescription());
            authenticationManager.Setup(x => x.AuthenticateAsync("Cookies")).Returns(() => Task.FromResult(r));
            ClaimsIdentity callBackClaimIdentity = null;
            authenticationManager.Setup(x => x.SignIn(It.IsAny<ClaimsIdentity>())).Callback((ClaimsIdentity[] x) => { callBackClaimIdentity = x[0]; });
            localOwinContextMock.Setup(x => x.Authentication).Returns(authenticationManager.Object);
            var req = new HttpRequestMessage();
            req.SetOwinContext(localOwinContextMock.Object);
            var mockDescoveryClient = new HttpClient(GetMockHandler(GetDiscoveryJson()).Object);
            var mockRefreshTokenClient = new HttpClient(GetMockHandler(GetTokenJson()).Object);

            ConfigurationManager.AppSettings["Authority"] = "https://some_authority_url";

            // SUT
#pragma warning disable CS0618 // Type or member is obsolete - Needed for this unit test
            var service = new ValidationRequestService(mockDescoveryClient, mockRefreshTokenClient);
#pragma warning restore CS0618 // Type or member is obsolete

            // Act
            await service.ValidateToken(req);

            // Assert
            authenticationManager.VerifyAll();
            localOwinContextMock.VerifyAll();
            Assert.NotNull(callBackClaimIdentity, "Expected call back identity to have been called");

            var updatedAccessToken = callBackClaimIdentity.FindFirst("access_token");
            Assert.AreEqual("access_token", updatedAccessToken.Value, "Expected new access token to have been passed");

            var updatedRefreshToken = callBackClaimIdentity.FindFirst("refresh_token");
            Assert.AreEqual("refresh_token", updatedRefreshToken.Value, "Expected new refresh token to have been passed");
        }

        private Mock<HttpMessageHandler> GetMockHandler(string content)
        {
            var handlerMock = new Mock<HttpMessageHandler>(MockBehavior.Strict);
            handlerMock
                .Protected()
               // Setup the PROTECTED method to mock
               .Setup<Task<HttpResponseMessage>>(
                  "SendAsync",
                  ItExpr.IsAny<HttpRequestMessage>(),
                  ItExpr.IsAny<CancellationToken>()
               )
               // prepare the expected response of the mocked http call
               .ReturnsAsync(new HttpResponseMessage()
               {
                   StatusCode = HttpStatusCode.OK,
                   Content = new StringContent(content),
               })
               .Verifiable();

            return handlerMock;
        }

        private string GetDiscoveryJson()
        {
            return @"{
'issuer': 'https://some_authority_url',
'jwks_uri': 'https://some_authority_url/.well-known/jwks',
'authorization_endpoint': 'https://some_authority_url/connect/authorize',
'token_endpoint': 'https://some_authority_url/connect/token',
'userinfo_endpoint': 'https://some_authority_url/connect/userinfo',
'end_session_endpoint': 'https://some_authority_url/connect/endsession',
'check_session_iframe': 'https://some_authority_url/connect/checksession',
'revocation_endpoint': 'https://some_authority_url/connect/revocation',
'introspection_endpoint': 'https://some_authority_url/connect/introspect',
'frontchannel_logout_supported': true,
'frontchannel_logout_session_supported': true,
'scopes_supported': [ 'openid', 'profile', 'email', 'address', 'phone', 'offline_access', 'api' ],
'claims_supported': [ 'sub', 'name', 'family_name', 'given_name', 'middle_name', 'nickname', 'preferred_username', 'profile', 'picture', 'website', 'gender', 'birthdate', 'zoneinfo', 'locale', 'updated_at', 'email', 'email_verified', 'address', 'phone_number', 'phone_number_verified' ],
'response_types_supported': [ 'code', 'token', 'id_token', 'id_token token', 'code id_token', 'code token', 'code id_token token' ],
'response_modes_supported': [ 'form_post', 'query', 'fragment' ],
'grant_types_supported': [ 'authorization_code', 'client_credentials', 'password', 'refresh_token', 'implicit' ],
'subject_types_supported': [ 'public' ],
'id_token_signing_alg_values_supported': [ 'RS256' ],
'code_challenge_methods_supported': [ 'plain', 'S256' ],
'token_endpoint_auth_methods_supported': [ 'client_secret_post', 'client_secret_basic' ]
}";
        }

        private string GetTokenJson()
        {
            return @"{
'access_token': 'access_token',
'expires_in': 3600,
'token_type': 'Bearer',
'refresh_token': 'refresh_token',
'custom':  'custom'
}";
        }
    }
}
