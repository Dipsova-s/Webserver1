using EveryAngle.Core.ViewModels.Model;
using NUnit.Framework;
using System;

namespace EveryAngle.Core.ViewModels.Tests
{
    public class ModelSiteMapViewModelTest : UnitTestBase
    {
        [SetUp]
        public override void Setup()
        {
            base.Setup();
        }

        #region tests

        [Test]
        public void ModelSiteMapBaseViewModel_WithUrl()
        {
            ModelSiteMapBaseViewModel testViewModel = GetTestViewModelWithUrl(typeof(ModelSiteMapBaseViewModel));

            // assert
            Assert.AreEqual(true, testViewModel.CanManageCommunications);
            Assert.AreEqual(true, testViewModel.CanManageExtractor);
            Assert.AreEqual(true, testViewModel.CanViewModelServers);
            Assert.AreEqual(true, testViewModel.CanManageRefreshTasks);
            Assert.AreEqual(true, testViewModel.CanManageAngleWarnings);
            Assert.AreEqual(true, testViewModel.CanManageContentParameters);
            Assert.AreEqual(true, testViewModel.CanManageLabelCategories);
            Assert.AreEqual(true, testViewModel.CanManageLanguages);
            Assert.AreEqual(true, testViewModel.CanManageModules);
            Assert.AreEqual(true, testViewModel.CanManagePackages);
            Assert.AreEqual(true, testViewModel.CanManageSuggestedFields);
            Assert.AreEqual(true, testViewModel.CanManageDownloadTables);
            Assert.AreEqual(true, testViewModel.CanManageRoles);
        }

        [Test]
        public void ModelSiteMapBaseViewModel_WithoutUrl()
        {
            ModelSiteMapBaseViewModel testViewModel = GetTestViewModelWithoutUrl(typeof(ModelSiteMapBaseViewModel));

            // assert
            Assert.AreEqual(true, testViewModel.CanManageCommunications);
            Assert.AreEqual(false, testViewModel.CanManageExtractor);
            Assert.AreEqual(true, testViewModel.CanViewModelServers);
            Assert.AreEqual(false, testViewModel.CanManageRefreshTasks);
            Assert.AreEqual(true, testViewModel.CanManageAngleWarnings);
            Assert.AreEqual(false, testViewModel.CanManageContentParameters);
            Assert.AreEqual(true, testViewModel.CanManageLabelCategories);
            Assert.AreEqual(false, testViewModel.CanManageLanguages);
            Assert.AreEqual(false, testViewModel.CanManageModules);
            Assert.AreEqual(true, testViewModel.CanManagePackages);
            Assert.AreEqual(true, testViewModel.CanManageSuggestedFields);
            Assert.AreEqual(false, testViewModel.CanManageDownloadTables);
            Assert.AreEqual(true, testViewModel.CanManageRoles);
        }

        [Test]
        public void ModelSiteMapSlaveViewModel_WithUrl()
        {
            ModelSiteMapBaseViewModel testViewModel = GetTestViewModelWithUrl(typeof(ModelSiteMapSlaveViewModel));

            // assert
            Assert.AreEqual(true, testViewModel.CanManageCommunications);
            Assert.AreEqual(true, testViewModel.CanManageExtractor);
            Assert.AreEqual(false, testViewModel.CanViewModelServers);
            Assert.AreEqual(true, testViewModel.CanManageRefreshTasks);
            Assert.AreEqual(false, testViewModel.CanManageAngleWarnings);
            Assert.AreEqual(false, testViewModel.CanManageContentParameters);
            Assert.AreEqual(false, testViewModel.CanManageLabelCategories);
            Assert.AreEqual(true, testViewModel.CanManageLanguages);
            Assert.AreEqual(true, testViewModel.CanManageModules);
            Assert.AreEqual(false, testViewModel.CanManagePackages);
            Assert.AreEqual(false, testViewModel.CanManageSuggestedFields);
            Assert.AreEqual(true, testViewModel.CanManageDownloadTables);
            Assert.AreEqual(true, testViewModel.CanManageRoles);
        }

        [Test]
        public void ModelSiteMapSlaveViewModel_WithoutUrl()
        {
            ModelSiteMapBaseViewModel testViewModel = GetTestViewModelWithoutUrl(typeof(ModelSiteMapSlaveViewModel));

            // assert
            Assert.AreEqual(true, testViewModel.CanManageCommunications);
            Assert.AreEqual(false, testViewModel.CanManageExtractor);
            Assert.AreEqual(false, testViewModel.CanViewModelServers);
            Assert.AreEqual(false, testViewModel.CanManageRefreshTasks);
            Assert.AreEqual(false, testViewModel.CanManageAngleWarnings);
            Assert.AreEqual(false, testViewModel.CanManageContentParameters);
            Assert.AreEqual(false, testViewModel.CanManageLabelCategories);
            Assert.AreEqual(false, testViewModel.CanManageLanguages);
            Assert.AreEqual(false, testViewModel.CanManageModules);
            Assert.AreEqual(false, testViewModel.CanManagePackages);
            Assert.AreEqual(false, testViewModel.CanManageSuggestedFields);
            Assert.AreEqual(false, testViewModel.CanManageDownloadTables);
            Assert.AreEqual(true, testViewModel.CanManageRoles);
        }

        #endregion

        #region private

        private ModelSiteMapBaseViewModel GetTestViewModelWithUrl(Type type)
        {
            ModelSiteMapBaseViewModel viewModel = GetTestViewModelWithoutUrl(type);
            viewModel.DownloadSettings = "url";
            viewModel.ModelInfo = "url";
            viewModel.RefreshTasks = "url";
            viewModel.ModelServerSettings = "url";
            viewModel.Languages = "url";
            viewModel.Modules = "url";
            viewModel.DownloadTables = "url";
            return viewModel;
        }

        private ModelSiteMapBaseViewModel GetTestViewModelWithoutUrl(Type type)
        {
            ModelSiteMapBaseViewModel viewModel = (ModelSiteMapBaseViewModel)Activator.CreateInstance(type);
            return viewModel;
        }

        #endregion
    }
}
