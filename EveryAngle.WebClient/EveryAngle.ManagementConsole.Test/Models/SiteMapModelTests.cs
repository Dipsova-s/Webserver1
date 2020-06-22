using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Core.ViewModels.SystemInformation;
using EveryAngle.Core.ViewModels.Users;
using EveryAngle.ManagementConsole.Models;
using Moq;
using NUnit.Framework;
using System;
using System.Collections.Generic;

namespace EveryAngle.ManagementConsole.Test.Models
{
    public class SiteMapModelTests : UnitTestBase
    {
        #region private variables

        private SiteMapModel _testingModel;
        private readonly Mock<SessionViewModel> _sessionViewmodel = new Mock<SessionViewModel>();


        #endregion

        #region setup/teardown

        [SetUp]
        public override void Setup()
        {
            base.Setup();
            // test model
            _testingModel = new SiteMapModel(sessionHelper.Object, modelService.Object);
        }

        #endregion

        #region tests

        [TestCase("EA2_800", false, false, typeof(ModelSiteMapSlaveViewModel))]
        [TestCase("EA2_800", true, false, typeof(ModelSiteMapBaseViewModel))]
        public void Can_GetModelSiteMapType(string modelId, bool hasModelServer, bool hasHanaServer, Type expectedSiteMapType)
        {
            // Prepare
            Type siteMapType = _testingModel.GetModelSiteMapType(modelId, hasModelServer, hasHanaServer);

            // Assert
            Assert.AreEqual(expectedSiteMapType, siteMapType);
        }
        [Test]
        public void Can_CreateSiteMap_When_Support_Automate_Task()
        {
            _sessionViewmodel.Setup(x => x.IsValidToManagementAccess()).Returns(true);
            _sessionViewmodel.Setup(x => x.IsValidToScheduleAngles()).Returns(true);
            sessionHelper.Setup(x => x.Session).Returns(_sessionViewmodel.Object);
            sessionHelper.Setup(x => x.Models).Returns(new List<ModelViewModel>());
            sessionHelper.Setup(x => x.Info).Returns(new SystemInformationViewModel() { features= new List<FeatureViewModel>() { new FeatureViewModel() { feature = "AngleAutomation", licensed = true } } });
            _testingModel.CreateSiteMap();
            var returnValue = _testingModel.GetSiteMaps();
            Assert.IsNotNull(returnValue);
        }
        #endregion
    }
}
