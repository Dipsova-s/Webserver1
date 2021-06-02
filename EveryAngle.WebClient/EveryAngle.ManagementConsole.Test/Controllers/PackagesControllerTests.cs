using EveryAngle.Core.ViewModels.EAPackage;
using EveryAngle.ManagementConsole.Controllers;
using NUnit.Framework;
using System.Web.Mvc;
using Moq;
using EveryAngle.Core.ViewModels.Model;
using System.Collections.Generic;
using System.Linq;
using EveryAngle.Core.ViewModels.Cycle;
using Newtonsoft.Json;
using System;

namespace EveryAngle.ManagementConsole.Test.Controllers
{
    public class PackagesControllerTests : UnitTestBase
    {
        #region private variables

        private PackagesController _testingController;

        #endregion

        #region setup/teardown

        [SetUp]
        public override void Setup()
        {
            // call base
            base.Setup();

            _testingController = new PackagesController(
                globalSettingService.Object,
                modelService.Object,
                packageService.Object,
                facetService.Object,
                sessionHelper.Object);
        }

        #endregion

        #region tests

        [TestCase("FacetViewModel_NoCount", 0, 0, 0)]
        [TestCase("FacetViewModel_HasCount", 3, 3, 1)]
        public void Can_GetPackageSummary(string testResourceName, int totalPrivate, int totalPublished, int totalValidated)
        {
            // arrange
            string itemIds = "facet_angle facet_template";
            List<FacetViewModel> facetViewModel = GetMockViewModel<List<FacetViewModel>>(testResourceName);
            facetService.Setup(x => x.Get(It.IsAny<string>())).Returns(facetViewModel);

            // act
            JsonResult result = _testingController.GetPackageSummary(itemIds, It.IsAny<string>()) as JsonResult;
            ExportSummaryFacetViewModel expectedResult = result.Data as ExportSummaryFacetViewModel;

            // asserts
            Assert.AreEqual(totalPrivate, expectedResult.TotalPrivate);
            Assert.AreEqual(totalPublished, expectedResult.TotalPublished);
            Assert.AreEqual(totalValidated, expectedResult.TotalValidated);
        }

        [TestCase]
        public void Can_GetPackageTaskViewModel()
        {
            modelService.Setup(x => x.GetModelPackage(It.IsAny<string>())).Returns(new PackageViewModel("ManagementConsole", "2018.1")
            {
                Id = "EA2_800",
                Name = "EA2_800",
                Uri = new System.Uri("http://everyangle.com"),
                source_version = "2018.1",
                source = "ManagementConsole"
            });

            ActivePackageQueryViewModel activePackageQueryViewModel = new ActivePackageQueryViewModel
            {
                IsActive = true,
                ModelId = "EA2_800",
                PackageUri = "http://everyangle.com",
                IncludeLabelCategories = true,
                IncludePrivateItems = true,
                AnglesConflictResolution = "overwrite",
                LabelCategoriesConflictResolution = "overwrite"
            };

            TaskViewModel result = _testingController.GetPackageTaskViewModel(activePackageQueryViewModel);
            List<Argument> arguments = result.actions.Select(x => x.arguments).First();
            string argumentsAsString = JsonConvert.SerializeObject(arguments);

            Assert.IsTrue(argumentsAsString.Contains("EA2_800"));
            Assert.IsTrue(argumentsAsString.Contains("everyangle.com"));
            Assert.IsTrue(argumentsAsString.Contains("true"));
            Assert.IsTrue(argumentsAsString.Contains("overwrite"));
        }

        [TestCase]
        public void ManageMultiplePackage()
        {
            //arrange.
            PackageViewModel viewModel = new PackageViewModel("ManagementConsole", "2021.1")
            {
                active = true,
                Uri = new Uri("/test", UriKind.Relative),
                packageFileUri = new Uri("/test2", UriKind.Relative),
                Id = "id",
                correlation_id = "correlation_id",
                Name = "name",
                Description = "description",
                Version = "version",
                status = "status",
                Enabled = true,
                CreatedDate = 11111,
                InstalledDate = 22222,
                Languages = new List<string> { "en", "nl" },
                Contents = new List<string> { "content1", "content2" },
                is_ea_package = true,
                source = "source",
                activated_models = new List<string> { "model1", "model2" },
                ActivatedModels = "model1",
                Filename = "filename",
                active_version = "active_version",
                activated = new Core.ViewModels.Users.UserDateViewModel { },
                deactivated = new Core.ViewModels.Users.UserDateViewModel { },
                error_message = "error_message",
                IsSelected = false
            };

            List<ActivePackageQueryViewModel> viewModels = new List<ActivePackageQueryViewModel>() {
                new ActivePackageQueryViewModel
                {
                    IsActive = true,
                    ModelId = "EA2_800",
                    PackageUri = "http://everyangle.com/package/1",
                    IncludeLabelCategories = true,
                    IncludePrivateItems = true,
                    AnglesConflictResolution = "overwrite",
                    LabelCategoriesConflictResolution = "overwrite"
                }
            };

            modelService.Setup(m => m.GetModelPackage(viewModels[0].PackageUri)).Returns(viewModel);

            //act.
            _testingController.ManageMultiplePackage(viewModels);

            //assert.
            modelService.Verify(m => m.CreateTask(It.IsAny<string>(), It.IsAny<string>()), Times.Once);
            modelService.Verify(m => m.GetModelPackage(viewModels[0].PackageUri), Times.Once);
        }

        #endregion

    }
}
