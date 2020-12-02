using System.Collections.Generic;
using System.Security.Principal;
using EveryAngle.WebClient.Service.Extensions;
using Microsoft.Owin.Security;
using Moq;
using NUnit.Framework;

namespace EveryAngle.WebClient.Web.CS.Tests.Extensions
{
    [TestFixture]
    public class AuthenticateResultExtensionsTests
    {
        private Mock<IIdentity> _identityMock;

        [SetUp]
        public void Setup()
        {
            _identityMock = new Mock<IIdentity>(MockBehavior.Strict);
            _identityMock.Setup(x => x.AuthenticationType).Returns("Cookie");
            _identityMock.Setup(x => x.Name).Returns("TestUser");
        }

        [TearDown]
        public void TearDown()
        {
            _identityMock.VerifyAll();
        }

        [Test]
        public void GetAccessToken_ReturnsNull_WhenAccessTokenIsNotPresent()
        {
            var props = new AuthenticationProperties(new Dictionary<string, string> { { "access_token", null } });
            var authenticationResult = new AuthenticateResult(_identityMock.Object, props, new AuthenticationDescription());
            var token = authenticationResult.GetAccessToken();

            Assert.Null(token, "Expected no token");
        }

        [Test]
        public void GetAccessToken_ReturnsToken_WhenAccessTokenIsPresent()
        {
            var tokenValue = "some access token";
            var props = new AuthenticationProperties(new Dictionary<string, string> { { "access_token", tokenValue } });
            var authenticationResult = new AuthenticateResult(_identityMock.Object, props, new AuthenticationDescription());
            var token = authenticationResult.GetAccessToken();

            Assert.NotNull(token, "Expected a token");
            Assert.AreEqual(tokenValue, token, "Expected value to be correct");
        }
    }
}
