using EveryAngle.OData.Service.Handlers;
using Microsoft.Data.Edm;
using Moq;
using NUnit.Framework;
using System.Web.Http.OData.Routing;

namespace EveryAngle.OData.Tests.ServiceTests
{
    // only test for explicitly call functions
    [TestFixture(Category = "Service")]
    public class ODataCustomPathHandlerTests : UnitTestBase
    {
        #region setup/teardown

        [SetUp]
        public void Setup()
        {
            // setup
        }

        [TearDown]
        public void TearDown()
        {
            // tear down
        }

        #endregion

        #region tests

        [TestCase]
        public void Can_Parse()
        {
            ODataCustomPathHandler oDataCustomPathHandler = new ODataCustomPathHandler();
            Mock<IEdmModel> model = new Mock<IEdmModel>();

            ODataPath oDataPath = oDataCustomPathHandler.Parse(model.Object, "");

            Assert.IsNotNull(oDataPath);
        }
        #endregion
    }
}
