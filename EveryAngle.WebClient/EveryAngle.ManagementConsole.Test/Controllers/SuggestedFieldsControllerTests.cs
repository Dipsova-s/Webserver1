
using System;
using System.Collections.Generic;
using System.Web.Mvc;
using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels;
using EveryAngle.Core.ViewModels.Cycle;
using EveryAngle.Core.ViewModels.Directory;
using EveryAngle.Core.ViewModels.FieldCategory;
using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Core.ViewModels.SystemSettings;
using EveryAngle.Core.ViewModels.Users;
using EveryAngle.ManagementConsole.Controllers;
using Moq;
using NUnit.Framework;

namespace EveryAngle.ManagementConsole.Test.Controllers
{
    public class SuggestedFieldsControllerTests : UnitTestBase
    {
        private Mock<IGlobalSettingService> _globalSettingService;
        private Mock<IModelService> _modelService;
        private SuggestedFieldsController _controller;

        [SetUp]
        public override void Setup()
        {
            // call base
            base.Setup();

            _globalSettingService = new Mock<IGlobalSettingService>();
            _modelService = new Mock<IModelService>();
            _controller = new SuggestedFieldsController(_modelService.Object, _globalSettingService.Object, sessionHelper.Object);
        }

        [Test]
        public void SuggestedFields_ReturnsView()
        {
            // Arrange
            var modelUri = "models/1";
            var model = new ModelViewModel
            {
                id = "1",
                FieldsUri = new Uri("/fields", UriKind.Relative),
                suggested_fields_summary = new Uri("/suggested_fields_summary ", UriKind.Relative)
            };
            var systemSettings = new SystemSettingViewModel
            {
                max_domainelements_for_search = 42
            };
            var userSettings = new UserSettingsViewModel
            {
                client_settings = "client settings"
            };

            sessionHelper.Setup(x => x.GetModel(modelUri)).Returns(model);
            sessionHelper.SetupGet(x => x.SystemSettings).Returns(systemSettings);
            sessionHelper.SetupGet(x => x.CurrentUser).Returns(new UserViewModel { Settings = userSettings });
            sessionHelper.SetupGet(x => x.Version).Returns(new VersionViewModel
            {
                Entries = new List<Entry>
                {
                    new Entry{ Name = "field_categories", Uri = new Uri("/field_categories", UriKind.Relative) },
                    new Entry{ Name = "eventlog", Uri = new Uri("/eventlog", UriKind.Relative) },
                    new Entry{ Name = "business_processes", Uri = new Uri("/business_processes", UriKind.Relative) }
                }
            });

            _globalSettingService.Setup(x => x.GetEventLogs(It.IsAny<string>()))
                .Returns(new ListViewModel<TaskHistoryViewModel>());
            _globalSettingService.Setup(x => x.GetFieldCategories(It.IsAny<string>()))
                .Returns(new ListViewModel<FieldCategoryViewModel>());

            _modelService.Setup(x => x.GetSuggestedFieldsSummary(It.IsAny<string>())).Returns(new SuggestedFieldsSummaryViewModel());

            // Act
            var result = _controller.SuggestedFields(modelUri);

            // Assert
            Assert.IsInstanceOf<PartialViewResult>(result, "Excpected a partial view to be returned'");
            Assert.AreEqual(modelUri, _controller.ViewBag.ModelUri, "Expected correct ModelUri in viewbag");
            Assert.AreEqual(model.id, _controller.ViewBag.ModelId, "Expected correct ModelId in viewbag");
            Assert.AreEqual(model.FieldsUri.ToString(), _controller.ViewBag.FieldsUri, "Expected correct FieldsUri in viewbag");
            Assert.AreEqual(systemSettings.max_domainelements_for_search, _controller.ViewBag.MaxDomainElementsForSearch, "Expected correct MaxDomainElementsForSearch in viewbag");
            Assert.AreEqual(userSettings.client_settings, _controller.ViewBag.ClientSettings, "Expected correct ClientSettings in viewbag");
        }
    }
}
