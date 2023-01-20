using System;
using System.Collections.Generic;
using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels;
using EveryAngle.Core.ViewModels.Directory;
using EveryAngle.Core.ViewModels.Label;
using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Core.ViewModels.ModelServer;
using EveryAngle.Core.ViewModels.Users;
using EveryAngle.ManagementConsole.Controllers;
using EveryAngle.Shared.Helpers;
using EveryAngle.WebClient.Service.Security;
using Moq;
using NUnit.Framework;

namespace EveryAngle.ManagementConsole.Test.Controllers
{
    [TestFixture]
    public class RoleControllerTests
    {
        private Mock<IModelService> _modelServiceMock;
        private Mock<ILabelService> _labelServiceMock;
        private Mock<IUserService> _userServiceMock;
        private Mock<ITaskService> _taskServiceMock;
        private Mock<AuthorizationHelper> _sessionHelperMock;
        private RoleController _roleController;

        [SetUp]
        public void SetUp()
        {
            _modelServiceMock = new Mock<IModelService>();
            _labelServiceMock = new Mock<ILabelService>(MockBehavior.Strict);
            _userServiceMock = new Mock<IUserService>(MockBehavior.Strict);
            _taskServiceMock = new Mock<ITaskService>(MockBehavior.Strict);
            _sessionHelperMock = new Mock<AuthorizationHelper>();
            _roleController = new RoleController(
                _modelServiceMock.Object,
                _labelServiceMock.Object,
                _userServiceMock.Object,
                _taskServiceMock.Object,
                _sessionHelperMock.Object);
        }

        [TearDown]
        public void TearDown()
        {
            _labelServiceMock.VerifyAll();
            _userServiceMock.VerifyAll();
            _taskServiceMock.VerifyAll();
        }

        [Test]
        public void GetAllRolesPage_ReturnsRolesPage()
        {
            // Arrange
            var providersUri = "some_url";
            var fullProvidersUri = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + providersUri);
            var modelUri = "some_model_url";
            var fullModelUri = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + modelUri);
            var version = new VersionViewModel
            {
                Entries = new List<Entry> {new Entry {Name = "authentication_providers", Uri = new Uri(providersUri, UriKind.Relative) }}
            };
            _sessionHelperMock.SetupGet(x => x.Version).Returns(version);
            var providers = new List<SystemAuthenticationProviderViewModel>();
            _userServiceMock.Setup(x => x.GetSystemAuthenticationProviders(fullProvidersUri.ToString())).Returns(providers);
            var model = new ModelViewModel { id = "model_id", short_name = "short_name", Uri = new Uri(modelUri, UriKind.Relative) };
            _roleController.TempData.Add("ModelViewModelData", model);
            _sessionHelperMock.Setup(x => x.Info.ODataService).Returns(true);
            _sessionHelperMock.Setup(x => x.SystemSettings.default_pagesize).Returns(1);

            // Act
            var result = _roleController.GetAllRolesPage(fullModelUri.ToString());

            // Assert
            Assert.NotNull(result, "Expected a page to be returned.");
            Assert.AreEqual(providers, _roleController.ViewBag.AuthenticationProviders, "Expected authentication providers to be correct.");
            Assert.AreEqual(model.id, _roleController.ViewBag.ModelId, "Expected model id to be correct.");
            Assert.AreEqual(fullModelUri.ToString(), _roleController.ViewBag.ModelUri, "Expected model uri to be correct.");
            Assert.AreEqual(model.short_name, _roleController.ViewBag.ModelName, "Expected model name to be correct.");
            Assert.True(_roleController.ViewBag.SupportOData, "Expected oData support to be true.");
        }

        [Test]
        public void EditRole_ReturnsRolePage()
        {
            // Arrange
            var providersUri = "some_url";
            var modelUri = "some_model_url";
            var fullModelUri = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + modelUri);
            var serverUri = "some_server_url";
            var fullServerUri = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + serverUri);
            var fieldsUri = "some_fields_url";
            var version = new VersionViewModel
            {
                Entries = new List<Entry> { new Entry { Name = "authentication_providers", Uri = new Uri(providersUri, UriKind.Relative) } }
            };
            _sessionHelperMock.SetupGet(x => x.Version).Returns(version);
            var model = new ModelViewModel
            {
                id = "model_id", 
                short_name = "short_name", 
                Uri = new Uri(modelUri, UriKind.Relative), 
                ServerUri = new Uri(serverUri, UriKind.Relative),
                FieldsUri = new Uri(fieldsUri, UriKind.Relative)
            };
            _roleController.TempData.Add("ModelViewModelData", model);
            _modelServiceMock.Setup(x => x.GetModelServers(fullServerUri.ToString()).Data)
                .Returns(new List<ModelServerViewModel>());
            _sessionHelperMock.Setup(x => x.Info.ODataService).Returns(true);
            _sessionHelperMock.Setup(x => x.SystemSettings.default_pagesize).Returns(1);
            _sessionHelperMock.Setup(x => x.CurrentUser.Settings.client_settings).Returns(string.Empty);

            // Act
            var result = _roleController.EditRole(fullModelUri.ToString(), string.Empty);

            // Assert
            Assert.NotNull(result, "Expected a page to be returned.");
        }

        [Test]
        public void GetLabelDropdown_ReturnsResult()
        {
            // Arrange
            var providersUri = "some_url";
            var version = new VersionViewModel
            {
                Entries = new List<Entry> { new Entry { Name = "authentication_providers", Uri = new Uri(providersUri, UriKind.Relative) } }
            };
            _sessionHelperMock.SetupGet(x => x.Version).Returns(version);
            var labelData = new ListViewModel<LabelViewModel> { Data = new List<LabelViewModel>() };

            // Act
            var result = _roleController.GetLabelDropdown(labelData);

            // Assert
            Assert.NotNull(result, "Expected result to have been given.");
        }

        [Test]
        public void CopyRole_ReturnsResult()
        {
            // Arrange
            var rolesUri = "some_url";
            var fullRolesUri = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + rolesUri);
            var version = new VersionViewModel
            {
                Entries = new List<Entry> { new Entry { Name = "system_roles", Uri = new Uri(rolesUri, UriKind.Relative) } }
            };
            _sessionHelperMock.SetupGet(x => x.Version).Returns(version);
            var roleData = "some data";
            _modelServiceMock.Setup(x => x.CreateRole(fullRolesUri.ToString(), roleData)).Returns(new SystemRoleViewModel());

            // Act
            var result = _roleController.CopyRole(roleData);

            // Assert
            Assert.NotNull(result, "Expected result to have been given.");
        }

        [Test]
        public void CheckCopyRole_ReturnsResult()
        {
            // Arrange
            var destinationModelUri = "some_model_url";
            var roleUri = "some_role_url";
            var model = new ModelViewModel
            {
                id = "model_id"
            };
            _sessionHelperMock.Setup(x => x.GetModel(destinationModelUri)).Returns(model);
            _modelServiceMock.Setup(x => x.GetRole(destinationModelUri, roleUri, null, null, null))
                .Returns(new SystemRoleViewModel());

            // Act
            var result = _roleController.CheckCopyRole(destinationModelUri, destinationModelUri, roleUri, "role name");

            // Assert
            Assert.NotNull(result, "Expected result to have been given.");
        }
    }
}
