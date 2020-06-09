using NUnit.Framework;
using EveryAngle.WebClient.Service.Security;
using Moq;
using System.Net.Http;
using System;
using System.Web;
using System.Collections.Specialized;
using EveryAngle.WebClient.Service.Security.Interfaces;

namespace EveryAngle.WebClient.Web.CS.Tests.SecurityTests
{
    [TestFixture]
    public class ValidationRequestServiceTests
    {
        private IValidationRequestService _service;
        private string cookieToken = "cookieToken", formToken = "formToken";
        private Mock<IValidationRequestContext> _validatorHelperMock;
        [SetUp]
        public void Initialize()
        {
            _service = ValidationRequestService.Instance();

            _validatorHelperMock = new Mock<IValidationRequestContext>();
            _validatorHelperMock.Setup(x => x.GetTokens(It.IsAny<string>(), out cookieToken, out formToken));
            _validatorHelperMock.Setup(x => x.Validate(It.IsAny<string>(), It.IsAny<string>()));
            _service.ValidatorFunction = () => _validatorHelperMock.Object;
        }

        [Test]
        public void Should_GetToken_When_Called()
        {
            string token = _service.GetToken();
            Assert.IsNotNull($"{cookieToken}:${formToken}");
        }

        [Test]
        public void Should_ValidateTokenFromHeaderWithHttpRequestMessage_When_Called()
        {
            var req = new HttpRequestMessage();
            req.Headers.TryAddWithoutValidation(ValidationRequestService.TokenHeaderId, $"{cookieToken}:{formToken}");
            _service.ValidateToken(req);
            _validatorHelperMock.Verify(x => x.Validate(It.IsAny<string>(), It.IsAny<string>()), Times.Once);
        }

        [Test]
        public void Should_ValidateTokenFromQueryStringWithHttpRequestMessage_When_Called()
        {
            var req = new HttpRequestMessage();
            req.RequestUri = new Uri($"http://www.everyangle.org/api/proxy/items_export/1/file?request_verification_token={cookieToken}:{formToken}");
            _service.ValidateToken(req);
            _validatorHelperMock.Verify(x => x.Validate(It.IsAny<string>(), It.IsAny<string>()), Times.Once);
        }

        [Test]
        public void Should_ThrowHttpExceptionWithHttpRequestMessage_When_HasNoValidationToken()
        {
            var req = new HttpRequestMessage();
            Assert.Throws<HttpException>(() => _service.ValidateToken(req));
        }

        #region ValidateToken (HttpRequestBase)

        [Test]
        public void ValidateToken_Should_ThrowHttpException_When_RequestTokenIsMissing()
        {
            Mock<HttpRequestBase> request = new Mock<HttpRequestBase>();
            request.SetupGet(x => x.Headers).Returns(new NameValueCollection());

            HttpException exception = Assert.Throws<HttpException>(() => _service.ValidateToken(request.Object));
            Assert.AreEqual("Missing CSRF token", exception.Message);
        }

        [Test]
        public void ValidateToken_Should_ValidateRequestToken_When_RequestTokenIsProvided()
        {
            Mock<HttpRequestBase> request = new Mock<HttpRequestBase>();
            request.SetupGet(x => x.Headers).Returns(() =>
            {
                Mock<NameValueCollection> headers = new Mock<NameValueCollection>();
                headers
                    .Setup(x => x.GetValues("Request-Verification-Token"))
                    .Returns(new string[] { "token:token" });
                return headers.Object;
            });

            _service.ValidateToken(request.Object);

        }

        #endregion
    }

}
