using EveryAngle.OData.BusinessLogic.Interfaces;
using EveryAngle.OData.ODataControllers;
using Moq;
using NUnit.Framework;
using System;
using System.Net.Http;
using System.Web.Http.Controllers;
using System.Web.Http.OData;

namespace EveryAngle.OData.Tests.ServiceTests
{
    // only test for explicitly call functions
    [TestFixture(Category = "Service")]
    public class RowsControllerTests : UnitTestBase
    {
        #region private variables
        private RowsController _testController;
        private Mock<IRowsEdmBusinessLogic> _rowsEdmBusinessLogic;
        #endregion

        #region setup/teardown

        [SetUp]
        public void Setup()
        {
            // setup
            _rowsEdmBusinessLogic = new Mock<IRowsEdmBusinessLogic>();
            _rowsEdmBusinessLogic.Setup(x => x.GetRowsEntityCollection(null, null, null, null)).Returns<EdmEntityObjectCollection>(null);

            HttpControllerDescriptor controllerDescriptor = new HttpControllerDescriptor();
            controllerDescriptor.Properties["display"] = null;
            _testController = new RowsController(_rowsEdmBusinessLogic.Object)
            {
                Request = new HttpRequestMessage(HttpMethod.Get, new Uri("https://localhost/rows?offset=0&limit=30")),
                RequestContext = new HttpRequestContext()
            };
            _testController.ControllerContext = new HttpControllerContext(_testController.RequestContext, _testController.Request, controllerDescriptor, _testController);
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
            EdmEntityObjectCollection result = _testController.Get();

            Assert.IsNull(result);
        }

        #endregion
    }
}
