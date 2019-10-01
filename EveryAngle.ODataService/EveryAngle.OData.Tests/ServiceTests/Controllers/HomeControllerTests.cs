using EveryAngle.OData.Controllers;
using NUnit.Framework;

namespace EveryAngle.OData.Tests.ServiceTests
{
    // only test for explicitly call functions
    [TestFixture(Category = "Service")]
    public class HomeControllerTests : UnitTestBase
    {
        #region private variables
        private HomeController _testController;
        #endregion

        #region setup/teardown

        [SetUp]
        public void Setup()
        {
            // setup
            _testController = new HomeController();
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

            Assert.AreEqual(_testController.ViewBag.Title, "Home Page");
        }

        [TestCase]
        public void Can_Get_ODataEntry()
        {
            _testController.ODataEntry();

            Assert.AreEqual(_testController.ViewBag.Title, "OData's Entry");
        }

        #endregion
    }
}
