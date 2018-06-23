﻿using EveryAngle.Core.ViewModels.Model;
using EveryAngle.ManagementConsole.Models;
using NUnit.Framework;
using System;

namespace EveryAngle.ManagementConsole.Test.Models
{
    public class SiteMapModelTests : UnitTestBase
    {
        #region private variables

        private SiteMapModel _testingModel;

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
        [TestCase("EA4IT", false, true, typeof(ModelSiteMapEA4ITViewModel))]
        [TestCase("EA2_800", false, true, typeof(ModelSiteMapHanaServerViewModel))]
        [TestCase("EA2_800", true, false, typeof(ModelSiteMapBaseViewModel))]
        public void Can_GetModelSiteMapType(string modelId, bool hasModelServer, bool hasHanaServer, Type expectedSiteMapType)
        {
            Type siteMapType = _testingModel.GetModelSiteMapType(modelId, hasModelServer, hasHanaServer);

            // Assert 2 menu should be visible
            Assert.AreEqual(expectedSiteMapType, siteMapType);
        }

        #endregion
    }
}
