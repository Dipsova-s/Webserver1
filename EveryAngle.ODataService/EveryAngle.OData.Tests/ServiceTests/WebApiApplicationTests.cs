using NUnit.Framework;
using System.Web.Mvc;
using System.Web.Routing;

namespace EveryAngle.OData.Tests.ServiceTests
{
    // only test for explicitly call functions
    [TestFixture(Category = "Service")]
    public class WebApiApplicationTests : UnitTestBase
    {
        #region setup/teardown

        [SetUp]
        public void Setup()
        {
            // setup
            GlobalFilters.Filters.Clear();
            RouteTable.Routes.Clear();
        }

        [TearDown]
        public void TearDown()
        {
            // tear down
        }

        #endregion

        #region tests
        
        [TestCase]
        public void Can_Application_Start()
        {
            TestWebApiApplication webApiApplication = new TestWebApiApplication();
            webApiApplication.Application_Start();

            Assert.IsTrue(GlobalFilters.Filters.Count > 0);
            Assert.IsTrue(RouteTable.Routes.Count > 0);
        }

        #endregion
        
        public class TestWebApiApplication : WebApiApplication
        {
            public new void Application_Start() => base.Application_Start();
        }
    }
}
