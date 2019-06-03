using NUnit.Framework;
using EveryAngle.WebClient.Service.Security;
using Moq;
using System.Net.Http;
using System;
using System.Web;

namespace EveryAngle.WebClient.Web.CS.Tests.SecurityTests
{
    [TestFixture]
    public class ValidationRequestServiceTests
    {
        private string cookieToken = "cookieToken", formToken = "formToken";
        private Mock<IValidationRequestContext> _validatorHelperMock;
        [SetUp]
        public void Initialize()
        {
            _validatorHelperMock = new Mock<IValidationRequestContext>();
            _validatorHelperMock.Setup(x => x.GetTokens(It.IsAny<string>(), out cookieToken, out formToken));
            _validatorHelperMock.Setup(x => x.Validate(It.IsAny<string>(), It.IsAny<string>()));
            ValidationRequestService.ValidatorFunction = () => _validatorHelperMock.Object;
        }

        [Test]
        public void Should_GetToken_When_Called()
        {
            string token = ValidationRequestService.GetToken();
            Assert.IsNotNull($"{cookieToken}:${formToken}");
        }
        
        [Test]
        public void Should_ValidateTokenFromHeaderWithHttpRequestMessage_When_Called()
        {
            var req = new HttpRequestMessage();
            req.Headers.TryAddWithoutValidation(ValidationRequestService.TokenHeaderId, $"{cookieToken}:{formToken}");
            ValidationRequestService.ValidateToken(req);
            _validatorHelperMock.Verify(x => x.Validate(It.IsAny<string>(), It.IsAny<string>()),Times.Once);
        }

        [Test]
        public void Should_ValidateTokenFromQueryStringWithHttpRequestMessage_When_Called()
        {
            var req = new HttpRequestMessage();
            req.RequestUri = new Uri($"http://www.everyangle.org/api/proxy/items_export/1/file?request_verification_token={cookieToken}:{formToken}");
            ValidationRequestService.ValidateToken(req);
            _validatorHelperMock.Verify(x => x.Validate(It.IsAny<string>(), It.IsAny<string>()), Times.Once);
        }

        [Test]
        public void Should_ThrowHttpExceptionWithHttpRequestMessage_When_HasNoValidationToken()
        {
            var req = new HttpRequestMessage();
            Assert.Throws<HttpException>(()=> ValidationRequestService.ValidateToken(req));
        }

    }

}
