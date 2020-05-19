using EveryAngle.Core.ViewModels.EAPackage;
using EveryAngle.Core.ViewModels.Users;
using NUnit.Framework;
using System;
using System.Collections.Generic;

namespace EveryAngle.Core.ViewModels.Tests
{
    public class PackageViewModelTest : UnitTestBase
    {
        [TestCase]
        public void PackageViewModel_TEST()
        {
            //arrange
            PackageViewModel viewModel = new PackageViewModel
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
                activated = new UserDateViewModel { },
                deactivated = new UserDateViewModel { },
                error_message = "error_message",
            };

            //assert type
            Assert.AreEqual(viewModel.active.GetType(), typeof(bool));
            Assert.AreEqual(viewModel.Uri.GetType(), typeof(Uri));
            Assert.AreEqual(viewModel.packageFileUri.GetType(), typeof(Uri));
            Assert.AreEqual(viewModel.Id.GetType(), typeof(string));
            Assert.AreEqual(viewModel.correlation_id.GetType(), typeof(string));
            Assert.AreEqual(viewModel.Name.GetType(), typeof(string));
            Assert.AreEqual(viewModel.Description.GetType(), typeof(string));
            Assert.AreEqual(viewModel.Version.GetType(), typeof(string));
            Assert.AreEqual(viewModel.status.GetType(), typeof(string));
            Assert.AreEqual(viewModel.Enabled.GetType(), typeof(bool));
            Assert.AreEqual(viewModel.CreatedDate.GetType(), typeof(long));
            Assert.AreEqual(viewModel.InstalledDate.GetType(), typeof(long));
            Assert.AreEqual(viewModel.Languages.GetType(), typeof(List<string>));
            Assert.AreEqual(viewModel.Contents.GetType(), typeof(List<string>));
            Assert.AreEqual(viewModel.is_ea_package.GetType(), typeof(bool));
            Assert.AreEqual(viewModel.source.GetType(), typeof(string));
            Assert.AreEqual(viewModel.activated_models.GetType(), typeof(List<string>));
            Assert.AreEqual(viewModel.ActivatedModels.GetType(), typeof(string));
            Assert.AreEqual(viewModel.Filename.GetType(), typeof(string));
            Assert.AreEqual(viewModel.active_version.GetType(), typeof(string));
            Assert.AreEqual(viewModel.activated.GetType(), typeof(UserDateViewModel));
            Assert.AreEqual(viewModel.deactivated.GetType(), typeof(UserDateViewModel));
            Assert.AreEqual(viewModel.error_message.GetType(), typeof(string));
            Assert.AreEqual(viewModel.RePlaceActivatedModels.GetType(), typeof(string));
            Assert.AreEqual(viewModel.ReLanguagesList.GetType(), typeof(string));
            Assert.AreEqual(viewModel.ReContentsList.GetType(), typeof(string));
        }

        [TestCase]
        public void PackageViewModel_TestStatus_TEST()
        {
            //arrange
            PackageViewModel viewModel = new PackageViewModel
            {
                status = "ActivationFailed",
            };

            //assert type
            Assert.AreEqual(viewModel.status.GetType(), typeof(string));
            Assert.AreEqual(viewModel.StatusName.GetType(), typeof(string));
            Assert.AreEqual("Activation failed", viewModel.StatusName);
        }

        [TestCase("ManagementConsole", "", false)]
        [TestCase("WebClient", "2018.1", false)]
        [TestCase("ManagementConsole", "2018.1", true)]
        public void PackageViewModelType_TEST(string source, string sourceVersion, bool expectedResult)
        {
            //arrange
            PackageViewModel viewModel = new PackageViewModel("ManagementConsole", "2018.1")
            {
                source = source,
                source_version = sourceVersion
            };

            //assert result
            Assert.AreEqual(expectedResult, viewModel.IsUpgradePackage);
        }
    }
}
