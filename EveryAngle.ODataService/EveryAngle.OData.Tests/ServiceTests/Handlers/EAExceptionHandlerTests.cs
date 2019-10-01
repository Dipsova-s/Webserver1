using EveryAngle.OData.Service.Handlers;
using NUnit.Framework;
using System.Net.Http;
using System.Web.Http;

namespace EveryAngle.OData.Tests.ServiceTests
{
    // only test for explicitly call functions
    [TestFixture(Category = "Service")]
    public class EAExceptionHandlerTests : UnitTestBase
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
        public void Can_CreateErrorResponse()
        {
            var config = new HttpConfiguration();
            var requestMessage = new HttpRequestMessage();
            requestMessage.SetConfiguration(config);

            var response = EAExceptionHandler.CreateErrorResponse(requestMessage, System.Net.HttpStatusCode.ExpectationFailed, "error reason", "error message");

            Assert.IsFalse(response.IsSuccessStatusCode);
            Assert.AreEqual("Expectation Failed", response.ReasonPhrase);
        }
        #endregion
    }
}
