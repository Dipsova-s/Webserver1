using System;
using System.Globalization;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using EveryAngle.Core.ViewModels.Users;
using EveryAngle.ManagementConsole.Controllers;
using EveryAngle.WebClient.Service.Security;
using EveryAngle.WebClient.Service.Security.Interfaces;
using Moq;
using NUnit.Framework;

namespace EveryAngle.ManagementConsole.Test.Controllers
{
    [TestFixture]
    public class BaseControllerTests
    {
        private Mock<SessionHelper> _sessionHelperMock;
        private Mock<ValidationRequestService> _validationRequestService;
        private BaseController _baseController;

        [SetUp]
        public void SetUp()
        {
            _sessionHelperMock = new Mock<SessionHelper>();
            _validationRequestService = new Mock<ValidationRequestService>();
            _baseController = new BaseController(_sessionHelperMock.Object, _validationRequestService.Object);
        }

        [Test]
        public void HandleActionExecution_ForcesRedirectToWebClient_WhenNotAuthenticatedAndNoSystemAccess()
        {
            // Arrange
            _sessionHelperMock.SetupGet(x => x.HasCookie).Returns(false);
            _sessionHelperMock.Setup(x => x.Session.IsValidToManagementAccess()).Returns(false);
            _sessionHelperMock.Setup(x => x.Session.IsValidToScheduleAngles()).Returns(true);
            _sessionHelperMock.Setup(x => x.Info.AngleAutomation).Returns(false);
            bool? wasForced = null;
            var loginPath = "some_url";
            _baseController.GetLoginPath = forceToWc =>
            {
                wasForced = forceToWc;
                return loginPath;
            };
            var actionContext = new ActionExecutingContext();

            // Act
            _baseController.HandleActionExecution(actionContext);

            // Assert
            var result = actionContext.Result as RedirectResult;
            Assert.NotNull(result, "Expected result to be of type Redirect.");
            Assert.AreEqual(loginPath, result.Url, "Expected redirect url to be correct.");
            Assert.NotNull(wasForced, "Expected boolean to have been set.");
            Assert.True(Convert.ToBoolean(wasForced), "Expected redirect to WebClient to have been forced.");
        }

        [Test]
        public void HandleActionExecution_DoesNotForceRedirectToWebClient_WhenNotAuthenticatedButSystemAccess()
        {
            // Arrange
            _sessionHelperMock.SetupGet(x => x.HasCookie).Returns(false);
            _sessionHelperMock.Setup(x => x.Session.IsValidToManagementAccess()).Returns(true);
            bool? wasForced = null;
            var loginPath = "some_url";
            _baseController.GetLoginPath = forceToWc =>
            {
                wasForced = forceToWc;
                return loginPath;
            };
            var actionContext = new ActionExecutingContext();

            // Act
            _baseController.HandleActionExecution(actionContext);

            // Assert
            var result = actionContext.Result as RedirectResult;
            Assert.NotNull(result, "Expected result to be of type Redirect.");
            Assert.AreEqual(loginPath, result.Url, "Expected redirect url to be correct.");
            Assert.NotNull(wasForced, "Expected boolean to have been set.");
            Assert.False(Convert.ToBoolean(wasForced), "Expected redirect to WebClient to not have been forced.");
        }

        [Test]
        public void HandleActionExecution_RefreshesUserSettings_WhenUserSettingsAreNull()
        {
            // Arrange
            _sessionHelperMock.SetupGet(x => x.HasCookie).Returns(true);
            _sessionHelperMock.Setup(x => x.Session.IsValidToManagementAccess()).Returns(true);
            _sessionHelperMock.Setup(x => x.CurrentUser.Settings).Returns<UserSettingsViewModel>(null);
            _sessionHelperMock.Setup(x => x.RefreshUserSettings());
            var actionContext = new ActionExecutingContext();

            // Act
            _baseController.HandleActionExecution(actionContext);

            // Assert
            _sessionHelperMock.Verify(x => x.RefreshUserSettings());
        }

        [Test]
        public void HandleActionExecution_SetsCurrentLanguageToEnglish()
        {
            // Arrange
            _sessionHelperMock.SetupGet(x => x.HasCookie).Returns(true);
            _sessionHelperMock.Setup(x => x.Session.IsValidToManagementAccess()).Returns(true);
            _sessionHelperMock.Setup(x => x.CurrentUser.Settings).Returns(new UserSettingsViewModel());
            var tempLanguage = "fr";
            var resultLanguage = "en";
            Thread.CurrentThread.CurrentCulture = CultureInfo.CreateSpecificCulture(tempLanguage);
            Thread.CurrentThread.CurrentUICulture = CultureInfo.CreateSpecificCulture(tempLanguage);
            var actionContext = new ActionExecutingContext();

            // Act
            _baseController.HandleActionExecution(actionContext);

            // Assert
            Assert.AreEqual(resultLanguage, Thread.CurrentThread.CurrentCulture.TwoLetterISOLanguageName, "Expected current culture to be correct.");
            Assert.AreEqual(resultLanguage, Thread.CurrentThread.CurrentUICulture.TwoLetterISOLanguageName, "Expected current UI culture to be correct.");
        }

        [Test]
        public void ValidateToken_CallsService_WhenCalled()
        {
            // Arrange
            var actionContext = new ActionExecutingContext();
            var httpContextMock = new Mock<HttpContextBase>();
            var httpRequestMock = new Mock<HttpRequestBase>();
            httpContextMock.Setup(x => x.Request).Returns(httpRequestMock.Object);
            actionContext.HttpContext = httpContextMock.Object;
            _validationRequestService.Setup(x => x.ValidateToken(It.IsAny<HttpRequestBase>())).Returns(Task.CompletedTask).Verifiable();

            // Act
            var result = _baseController.ValidateToken(actionContext);

            // Assert
            _validationRequestService.Verify(x => x.ValidateToken(It.IsAny<HttpRequestBase>()), Times.Once);
            Assert.IsTrue(result, "Expected ValidateToken to return true");
        }

        [Test]
        public void OnActionExecuting_RedirectsToSts_WhenServiceThrows()
        {
            // Arrange
            var actionContext = new ActionExecutingContext();
            var httpContextMock = new Mock<HttpContextBase>();
            var httpRequestMock = new Mock<HttpRequestBase>();
            httpContextMock.Setup(x => x.Request).Returns(httpRequestMock.Object);
            actionContext.HttpContext = httpContextMock.Object;
            var exception = new HttpException((int) HttpStatusCode.Forbidden, "Missing CSRF token");
            _validationRequestService.Setup(x => x.ValidateToken(It.IsAny<HttpRequestBase>())).Returns(Task.Run(() => throw exception)).Verifiable();
            var baseController = new BaseControllerTestClass(_sessionHelperMock.Object, _validationRequestService.Object);

            var loginPath = "some_url";
            bool forcedToWebClient = true;
            baseController.GetLoginPath = forceToWc =>
            {
                forcedToWebClient = forceToWc;
                return loginPath;
            };

            // Act
            baseController.CallOnActionExecuting(actionContext);

            // Assert
            _validationRequestService.Verify(x => x.ValidateToken(It.IsAny<HttpRequestBase>()), Times.Once);
            var redirect = actionContext.Result as RedirectResult;
            Assert.NotNull(redirect, "Expected ValidateToken to return a RedirectResult");
            Assert.AreEqual(loginPath, redirect.Url, "Expected correct redirect url");
            Assert.IsFalse(forcedToWebClient, "User shouldn't be forced to the WebClient");
        }

        private class BaseControllerTestClass : BaseController
        {
            public BaseControllerTestClass(SessionHelper sessionHelper, IValidationRequestService validationRequestService)
                : base(sessionHelper, validationRequestService)
            {
            }

            public void CallOnActionExecuting(ActionExecutingContext filterContext)
            {
                OnActionExecuting(filterContext);
            }
        }
    }
}
