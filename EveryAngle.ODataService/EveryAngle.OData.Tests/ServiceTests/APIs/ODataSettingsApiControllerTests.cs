using EveryAngle.OData.BusinessLogic.Interfaces;
using EveryAngle.OData.DTO;
using EveryAngle.OData.Repository;
using EveryAngle.OData.Service.APIs;
using EveryAngle.OData.ViewModel.Settings;
using Moq;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.Http.Controllers;
using System.Web.Http.Hosting;

namespace EveryAngle.OData.Tests.ServiceTests
{
    // only test for explicitly call functions
    [TestFixture(Category = "Service")]
    public class ODataSettingsApiControllerTests : UnitTestBase
    {
        #region private variables
        private ODataSettingsApiController _testController;
        #endregion

        #region setup/teardown

        [SetUp]
        public void Setup()
        {
            // setup
            HttpRequestMessage request = new HttpRequestMessage();
            request.Properties[HttpPropertyKeys.HttpConfigurationKey] = new HttpConfiguration();
            _testController = new ODataSettingsApiController()
            {
                Request = request,
            };

            HttpControllerContext controllerContext = new HttpControllerContext(_testController.RequestContext, _testController.Request, new HttpControllerDescriptor(), _testController);
            _testController.ActionContext = new HttpActionContext { ControllerContext = controllerContext };
        }

        [TearDown]
        public void TearDown()
        {
            // tear down
        }

        #endregion

        #region tests

        [TestCase]
        public void Can_Get()
        {
            HttpResponseMessage response = _testController.Get();
            response.TryGetContentValue(out ODataSettingsViewModel settings);

            Assert.IsNotNull(settings);
        }

        [TestCase("invalid")]
        [TestCase("{}")]
        public void Can_Put(string content)
        {
            _testController.Request.Content = new StringContent(content);
            HttpResponseMessage response = _testController.Put();
            response.TryGetContentValue(out ODataSettingsViewModel settings);

            Assert.IsNotNull(settings);
        }

        #endregion
    }
}
