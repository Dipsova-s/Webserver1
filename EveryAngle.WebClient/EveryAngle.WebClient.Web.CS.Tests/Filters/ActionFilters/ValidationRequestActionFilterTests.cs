using EveryAngle.WebClient.Service.Security.Interfaces;
using EveryAngle.WebClient.Web.Filters.ActionFilters;
using Moq;
using NUnit.Framework;
using System.Net.Http;
using System.Web.Http.Controllers;

namespace EveryAngle.WebClient.Web.CS.Tests.Filters.ActionFilters
{
    [TestFixture]
    public class ValidationRequestActionFilterTests
    {
        private ValidationRequestActionFilter _filter;
        private Mock<IValidationRequestService> _service;

        [SetUp]
        public void SetUp()
        {
            _service = new Mock<IValidationRequestService>();
            _filter = new ValidationRequestActionFilter(_service.Object);
        }

        [Test]
        public void Constructor_Should_CreateValidationRequestService_WhenCreateObjectWithoutService()
        {
            _filter = new ValidationRequestActionFilter();
            Assert.NotNull(_filter.Service);
        }

        [Test]
        public void OnActionExecuting_Should_ValidateToken_WhenBeCalled()
        {
            _service.Setup(x => x.ValidateToken(It.IsAny<HttpRequestMessage>()))
                .Verifiable();

            Mock<HttpActionContext> actionContext = new Mock<HttpActionContext>();

            _filter.OnActionExecuting(actionContext.Object);

            _service.Verify(x => x.ValidateToken(It.IsAny<HttpRequestMessage>()), Times.Once);
        }
    }
}
