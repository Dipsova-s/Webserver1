using EveryAngle.OData.Service.Controllers;
using NUnit.Framework;

namespace EveryAngle.OData.Tests.ServiceTests
{
    // only test for explicitly call functions
    [TestFixture(Category = "Service")]
    public class MonitoringControllerTests : UnitTestBase
    {
        #region private variables
        private MonitoringController _testController;
        #endregion

        #region setup/teardown

        [SetUp]
        public void Setup()
        {
            // setup
            _testController = new MonitoringController();
        }

        [TearDown]
        public void TearDown()
        {
            // tear down
        }

        #endregion

        #region tests
        
        [TestCase]
        public void Can_Get_Index()
        {
            _testController.Index();

            Assert.AreEqual(_testController.ViewBag.Title, "OData's Monitoring");
        }

        #endregion
    }
}
