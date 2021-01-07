using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Http;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using EveryAngle.WebClient.Service.Security;
using EveryAngle.WebClient.Service.Security.Interfaces;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Owin;
using Microsoft.Owin.Security;
using Moq;
using NUnit.Framework;

namespace EveryAngle.WebClient.Web.CS.Tests.SecurityTests
{
    [TestFixture]
    public class ValidationRequestServiceTests
    {
        private IValidationRequestService _service;
        private Mock<IValidationRequestContext> _validatorHelperMock;
        private Mock<IOwinContext> _owinContextMock;

        [SetUp]
        public void Initialize()
        {
            _owinContextMock = new Mock<IOwinContext>(MockBehavior.Strict);
            Mock<IAuthenticationManager> authenticationManager = new Mock<IAuthenticationManager>(MockBehavior.Strict);
            var handler = new JwtSecurityTokenHandler();
            var descriptor = new SecurityTokenDescriptor
            {
                Audience = "Everyone",
                Expires = DateTime.Now.AddHours(2),
                IssuedAt = DateTime.Now,
                Issuer = "https://sts.everyangle.com",
                Subject = new ClaimsIdentity()
            };
            var token = handler.CreateEncodedJwt(descriptor);
            AuthenticateResult r = new AuthenticateResult(null, new AuthenticationProperties(new Dictionary<string, string> { { "access_token", token } }), new AuthenticationDescription());
            authenticationManager.Setup(x => x.AuthenticateAsync("Cookies")).Returns(() => Task.FromResult(r));
            _owinContextMock.Setup(x => x.Authentication).Returns(authenticationManager.Object);
            _service = ValidationRequestService.Instance();

            _validatorHelperMock = new Mock<IValidationRequestContext>();
            _validatorHelperMock.Setup(x => x.Validate(It.IsAny<JwtSecurityToken>(), token));
            _service.ValidatorFunction = () => _validatorHelperMock.Object;
        }

        [Test]
        public void Should_ThrowHttpExceptionWithHttpRequestMessage_When_HasNoValidationToken()
        {
            var localOwinContextMock = new Mock<IOwinContext>(MockBehavior.Strict);
            Mock<IAuthenticationManager> authenticationManager = new Mock<IAuthenticationManager>(MockBehavior.Strict);
            AuthenticateResult r = new AuthenticateResult(null, new AuthenticationProperties(new Dictionary<string, string> { { "access_token", null } }), new AuthenticationDescription());
            authenticationManager.Setup(x => x.AuthenticateAsync("Cookies")).Returns(() => Task.FromResult(r));
            localOwinContextMock.Setup(x => x.Authentication).Returns(authenticationManager.Object);
            var req = new HttpRequestMessage();
            req.SetOwinContext(localOwinContextMock.Object);
            Assert.Throws<HttpException>(() => _service.ValidateToken(req));

            localOwinContextMock.VerifyAll();
        }

        [Test]
        public void Should_ThrowHttpExceptionWithHttpRequestMessage_When_ValidationMethodThrowsHttpAntiForgeryException()
        {
            var localOwinContextMock = new Mock<IOwinContext>(MockBehavior.Strict);
            Mock<IAuthenticationManager> authenticationManager = new Mock<IAuthenticationManager>(MockBehavior.Strict);
            var handler = new JwtSecurityTokenHandler();
            var descriptor = new SecurityTokenDescriptor
            {
                Audience = "Everyone",
                Expires = DateTime.Now.AddHours(2),
                IssuedAt = DateTime.Now,
                Issuer = "https://sts2.everyangle.com",
                Subject = new ClaimsIdentity()
            };
            var token = handler.CreateEncodedJwt(descriptor);
            AuthenticateResult r = new AuthenticateResult(null, new AuthenticationProperties(new Dictionary<string, string> { { "access_token", token } }), new AuthenticationDescription());
            authenticationManager.Setup(x => x.AuthenticateAsync("Cookies")).Returns(() => Task.FromResult(r));
            localOwinContextMock.Setup(x => x.Authentication).Returns(authenticationManager.Object);
            var req = new HttpRequestMessage();
            req.SetOwinContext(localOwinContextMock.Object);
            _validatorHelperMock.Setup(x => x.Validate(It.IsAny<JwtSecurityToken>(), token))
                .Throws(new HttpAntiForgeryException("Issuer is incorrect"));
            Assert.Throws<HttpException>(() => _service.ValidateToken(req));

            localOwinContextMock.VerifyAll();
        }

        [Test]
        public void Should_ThrowHttpExceptionWithHttpRequestMessage_When_ValidationMethodThrowsException()
        {
            var localOwinContextMock = new Mock<IOwinContext>(MockBehavior.Strict);
            Mock<IAuthenticationManager> authenticationManager = new Mock<IAuthenticationManager>(MockBehavior.Strict);
            var handler = new JwtSecurityTokenHandler();
            var descriptor = new SecurityTokenDescriptor
            {
                Audience = "Everyone",
                Expires = DateTime.Now.AddHours(2),
                IssuedAt = DateTime.Now,
                Issuer = "https://sts2.everyangle.com",
                Subject = new ClaimsIdentity()
            };
            var token = handler.CreateEncodedJwt(descriptor);
            AuthenticateResult r = new AuthenticateResult(null, new AuthenticationProperties(new Dictionary<string, string> { { "access_token", token } }), new AuthenticationDescription());
            authenticationManager.Setup(x => x.AuthenticateAsync("Cookies")).Returns(() => Task.FromResult(r));
            localOwinContextMock.Setup(x => x.Authentication).Returns(authenticationManager.Object);
            var req = new HttpRequestMessage();
            req.SetOwinContext(localOwinContextMock.Object);
            _validatorHelperMock.Setup(x => x.Validate(It.IsAny<JwtSecurityToken>(), token))
                .Throws(new Exception("Issuer is incorrect"));
            Assert.Throws<HttpException>(() => _service.ValidateToken(req));

            localOwinContextMock.VerifyAll();
        }
    }

}
