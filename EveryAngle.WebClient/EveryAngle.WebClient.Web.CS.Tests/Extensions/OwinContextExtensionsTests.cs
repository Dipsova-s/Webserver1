using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Security.Principal;
using System.Text;
using System.Threading.Tasks;
using EveryAngle.WebClient.Service.Extensions;
using Microsoft.Owin;
using Microsoft.Owin.Security;
using Moq;
using Moq.Language.Flow;
using NUnit.Framework;

namespace EveryAngle.WebClient.Web.CS.Tests.Extensions
{
    [TestFixture]
    public class OwinContextExtensionsTests
    {
        private Mock<IIdentity> _identityMock;

        // System under test
        private Mock<IOwinContext> _context;

        [SetUp]
        public void Setup()
        {
            _identityMock = new Mock<IIdentity>(MockBehavior.Strict);
            _identityMock.Setup(x => x.AuthenticationType).Returns("Cookie");
            _identityMock.Setup(x => x.Name).Returns("TestUser");
            _context = new Mock<IOwinContext>(MockBehavior.Strict);
        }

        [TearDown]
        public void TearDown()
        {
            _identityMock.VerifyAll();
            _context.VerifyAll();
        }

        [Test]
        public void AuthenticateAsyncFromCookies_CallsAuthenticateAsync_WhenCalled()
        {
            // Arrange
            Mock<IAuthenticationManager> managerMock = new Mock<IAuthenticationManager>(MockBehavior.Strict);
            var props = new AuthenticationProperties(new Dictionary<string, string> { { "access_token", null } });
            var authenticationResult = new AuthenticateResult(_identityMock.Object, props, new AuthenticationDescription());
            managerMock.Setup(x => x.AuthenticateAsync("Cookies")).ReturnsAsync(authenticationResult);
            _context.Setup(x => x.Authentication).Returns(managerMock.Object);

            // Act & Assert - See tear down
            _context.Object.AuthenticateAsyncFromCookies();

        }
    }
}
