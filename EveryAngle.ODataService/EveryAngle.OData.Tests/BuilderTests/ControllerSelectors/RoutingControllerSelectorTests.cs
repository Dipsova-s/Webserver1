using EveryAngle.OData.Builder.ControllerSelectors;
using EveryAngle.OData.BusinessLogic.Interfaces;
using EveryAngle.OData.DTO;
using EveryAngle.OData.ODataControllers;
using Moq;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Controllers;
using System.Web.Http.Routing;

namespace EveryAngle.OData.Tests.BuilderTests
{
    // only test for explicitly call functions
    [TestFixture(Category = "Builder")]
    public class RoutingControllerSelectorTests : UnitTestBase
    {
        #region private variables 
        private readonly Mock<IMasterEdmModelBusinessLogic> _edmModelBusinessLogic = new Mock<IMasterEdmModelBusinessLogic>();
        private readonly Mock<HttpConfiguration> _configuration = new Mock<HttpConfiguration>();
        private IRoutingControllerSelector _routingControllerSelector;

        #endregion

        #region setup/teardown

        [SetUp]
        public void Setup()
        {
            // setup
            _routingControllerSelector = new RoutingControllerSelector(_edmModelBusinessLogic.Object, _configuration.Object);
        }

        [TearDown]
        public void TearDown()
        {
            // tear down
        }

        #endregion

        #region tests

        [TestCase]
        public void Can_CreateDisplayDescriptor()
        {
            Display display = new Display();
            Type routingControllerType = typeof(RowsController);
            HttpControllerDescriptor descriptor = _routingControllerSelector.CreateDisplayDescriptor("name", display, routingControllerType);

            Assert.AreEqual(display, descriptor.Properties["display"]);
        }

        [TestCase]
        [ExpectedException(typeof(ArgumentNullException))]
        public void Cannot_CreateDisplayDescriptor_When_Name_Is_Null()
        {
            Display display = new Display();
            Type routingControllerType = typeof(RowsController);
            HttpControllerDescriptor descriptor = _routingControllerSelector.CreateDisplayDescriptor(null, display, routingControllerType);
        }

        [TestCase]
        [ExpectedException(typeof(ArgumentNullException))]
        public void Cannot_CreateDisplayDescriptor_When_Display_Is_Null()
        {
            Type routingControllerType = typeof(RowsController);
            HttpControllerDescriptor descriptor = _routingControllerSelector.CreateDisplayDescriptor("", null, routingControllerType);
        }

        [TestCase]
        public void Can_SelectController()
        {
            HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Get, new Uri("https://localhost/rows?offset=0&limit=30"));
            Mock<IHttpRouteData> httpRouteData = new Mock<IHttpRouteData>();
            Dictionary<string, object> routeData = new Dictionary<string, object>();
            routeData.Add("controller", "rows");
            httpRouteData.Setup(x => x.Values).Returns(routeData);
            request.SetRouteData(httpRouteData.Object);

            HttpControllerDescriptor mockHttpControllerDescriptor = new HttpControllerDescriptor();

            _edmModelBusinessLogic.Setup(x => x.GetAngleDisplayDescriptor(It.IsAny<string>(), out mockHttpControllerDescriptor)).Returns(true);


            RoutingControllerSelector routingControllerSelector = new RoutingControllerSelector(_edmModelBusinessLogic.Object, _configuration.Object);
            HttpControllerDescriptor descriptor = routingControllerSelector.SelectController(request);

            Assert.AreEqual(mockHttpControllerDescriptor, descriptor);
        }
        #endregion
    }
}
