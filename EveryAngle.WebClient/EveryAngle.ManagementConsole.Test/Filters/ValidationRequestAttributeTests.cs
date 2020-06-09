using EveryAngle.WebClient.Service.Security.Interfaces;
using EveryAngle.WebClient.Web.Filters.ActionFilters;
using Moq;
using NUnit.Framework;
using System.Web;
using System.Web.Mvc;

namespace EveryAngle.ManagementConsole.Test.Filters
{
    [TestFixture]
    public class ValidationRequestAttributeTests
    {
        private ValidationRequestAttribute _filter;
        private Mock<IValidationRequestService> _service;

        [SetUp]
        public void SetUp()
        {
            _service = new Mock<IValidationRequestService>();
            _filter = new ValidationRequestAttribute(false, _service.Object);
        }

        [Test]
        public void Constructor_Should_SetIsSkippableToBeFalse_WheninstantiateWithoutIsSkippable()
        {
            _filter = new ValidationRequestAttribute();
            Assert.NotNull(_filter.Service);
            Assert.IsFalse(_filter.IsSkippable);
        }

        [Test]
        public void Constructor_Should_CreateValidationRequestService_WheninstantiateWithIsSkippable()
        {
            bool isSkippable = true;

            _filter = new ValidationRequestAttribute(isSkippable);
            Assert.NotNull(_filter.Service);
            Assert.AreEqual(isSkippable, _filter.IsSkippable);
        }

        [Test]
        public void OnActionExecuting_Should_ValidateToken_WhenIsSkippableIsFalse()
        {
            _service.Setup(x => x.ValidateToken(It.IsAny<HttpRequestBase>()))
                .Verifiable();

            _filter.OnActionExecuting(CreateFilterContext());

            _service.Verify(x => x.ValidateToken(It.IsAny<HttpRequestBase>()), Times.Once);
        }

        [Test]
        public void OnActionExecuting_Should_NotCallValidateToken_WhenIsSkippableIsTrue()
        {
            _service.Setup(x => x.ValidateToken(It.IsAny<HttpRequestBase>()))
                .Verifiable();

            Mock<ActionExecutingContext> filterContext = new Mock<ActionExecutingContext>();

            _filter = new ValidationRequestAttribute(true, _service.Object);
            _filter.OnActionExecuting(filterContext.Object);

            _service.Verify(x => x.ValidateToken(It.IsAny<HttpRequestBase>()), Times.Never);
        }

        private ActionExecutingContext CreateFilterContext()
        {
            Mock<ActionExecutingContext> filterContext = new Mock<ActionExecutingContext>();
            filterContext.SetupGet(x => x.HttpContext).Returns(() =>
            {
                Mock<HttpContextBase> httpContext = new Mock<HttpContextBase>();
                httpContext.SetupGet(x => x.Request).Returns(() =>
                {
                    Mock<HttpRequestBase> request = new Mock<HttpRequestBase>();
                    return request.Object;
                });

                return httpContext.Object;
            });

            return filterContext.Object;
        }

    }
}
