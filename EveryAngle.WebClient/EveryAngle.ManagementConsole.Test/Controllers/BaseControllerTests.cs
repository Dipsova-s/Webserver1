using System;
using System.Globalization;
using System.Threading;
using System.Web.Mvc;
using EveryAngle.Core.ViewModels.Users;
using EveryAngle.ManagementConsole.Controllers;
using EveryAngle.WebClient.Service.Security;
using Moq;
using NUnit.Framework;

namespace EveryAngle.ManagementConsole.Test.Controllers
{
    [TestFixture]
    public class BaseControllerTests
    {
        private Mock<SessionHelper> _sessionHelperMock;
        private BaseController _baseController;

        [SetUp]
        public void SetUp()
        {
            _sessionHelperMock = new Mock<SessionHelper>();
            _baseController = new BaseController(_sessionHelperMock.Object);
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
    }
}
