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
using Kendo.Mvc.UI;
using System.ComponentModel;
using Kendo.Mvc;
using EveryAngle.Core.ViewModels.Privilege;
using EveryAngle.Core.ViewModels.Directory;

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
                authorizationHelper.Object);
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
                IncludeExternalId = true,
                AnglesConflictResolution = "overwrite",
                LabelCategoriesConflictResolution = "overwrite",
                SourceModel = "EA4IT"
            };

            TaskViewModel result = _testingController.GetPackageTaskViewModel(activePackageQueryViewModel);
            List<Argument> arguments = result.actions.Select(x => x.arguments).First();
            string argumentsAsString = JsonConvert.SerializeObject(arguments);

            Assert.IsTrue(argumentsAsString.Contains("EA2_800"));
            Assert.IsTrue(argumentsAsString.Contains("everyangle.com"));
            Assert.IsTrue(argumentsAsString.Contains("true"));
            Assert.IsTrue(argumentsAsString.Contains("overwrite"));
            Assert.IsTrue(argumentsAsString.Contains("EA4IT"));
        }

        [TestCase]
        public void Can_GetPackageTaskViewModelForMultipleModel()
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
                IncludeExternalId = true,
                MappingObj = @"[{""sourceModel"":""EA2_800"",""modelId"":""EA4IT"",""packageUri"":""http://everyangle.com""}]",
                AnglesConflictResolution = "overwrite",
                LabelCategoriesConflictResolution = "overwrite"
            };

            TaskViewModel result = _testingController.GetTaskViewModelForMultipleModel(activePackageQueryViewModel);
            List<Argument> arguments = result.actions.Select(x => x.arguments).First();
            string argumentsAsString = JsonConvert.SerializeObject(arguments);

            Assert.IsTrue(argumentsAsString.Contains("EA2_800"));
            Assert.IsTrue(argumentsAsString.Contains("everyangle.com"));
            Assert.IsTrue(argumentsAsString.Contains("true"));
            Assert.IsTrue(argumentsAsString.Contains("overwrite"));
            Assert.IsTrue(argumentsAsString.Contains("EA4IT"));
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
                    IncludeExternalId = true,
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

        [Test]
        public void ReadPackages_should_return_Json()
        {
            SortDescriptor sortDescriptor = new SortDescriptor { Member = "id", SortDirection = ListSortDirection.Ascending };

            modelService.Setup(x => x.GetModelPackages(It.IsAny<string>())).Returns(new Core.ViewModels.ListViewModel<PackageViewModel>());

            var result = _testingController.ReadPackages(new DataSourceRequest
            {
                Page = 1,
                PageSize = 30,
                Sorts = new List<SortDescriptor> { sortDescriptor }
            }, string.Empty, string.Empty, "active");

            // assert 
            Assert.That(result, Is.InstanceOf<JsonResult>());
        }

        [Test]
        public void RenderTemplateAnglesPage_should_return_PartialView()
        {
            Core.ViewModels.Users.SessionViewModel sessionViewModel = GetMockViewModel<Core.ViewModels.Users.SessionViewModel>();
            sessionViewModel.ModelPrivileges = new List<ModelPrivilegeViewModel>
            {
                new ModelPrivilegeViewModel
                {
                    model = new Uri("/models/1", UriKind.Relative),
                    Privileges = new PrivilegesForModelViewModel
                    {
                        manage_model = true
                    }
                }
            };
            authorizationHelper.SetupGet(x => x.Session).Returns(sessionViewModel);
            authorizationHelper.SetupGet(x => x.Models).Returns(new List<ModelViewModel>
            {
                new ModelViewModel
                {
                    id = "EA2_800",
                    Uri = new Uri("/models/1", UriKind.Relative)
                }
            });
            var result = _testingController.RenderTemplateAnglesPage(string.Empty, string.Empty);

            // assert 
            Assert.That(result, Is.InstanceOf<PartialViewResult>());
        }

        [Test]
        public void GetFilterTemplateAngles_should_return_PartialView()
        {
            var result = _testingController.GetFilterTemplateAngles(string.Empty, "active");

            // assert 
            Assert.That(result, Is.InstanceOf<PartialViewResult>());
        }

        [Test]
        public void ManagePackage()
        {
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
            ActivePackageQueryViewModel activePackageQueryViewModel = new ActivePackageQueryViewModel
            {
                IsActive = true,
                PackageUri = "http://everyangle.com",
                IncludeLabelCategories = true,
                IncludePrivateItems = true,
                IncludeExternalId = true,
                MappingObj = @"[{""sourceModel"":""EA2_800"",""modelId"":""EA4IT"",""packageUri"":""http://everyangle.com""}]",
                AnglesConflictResolution = "overwrite",
                LabelCategoriesConflictResolution = "overwrite"
            };
            modelService.Setup(m => m.GetModelPackage(activePackageQueryViewModel.PackageUri)).Returns(viewModel);
            _testingController.ManagePackage(activePackageQueryViewModel);

            //assert.
            modelService.Verify(m => m.CreateTask(It.IsAny<string>(), It.IsAny<string>()), Times.AtLeastOnce);
            modelService.Verify(m => m.GetModelPackage(activePackageQueryViewModel.PackageUri), Times.AtLeastOnce);
        }
        #endregion

    }
}
