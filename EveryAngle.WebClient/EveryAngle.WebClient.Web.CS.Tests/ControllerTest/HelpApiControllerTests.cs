using EveryAngle.WebClient.Web.Controllers.Apis;
using EveryAngle.WebClient.Web.CSTests.TestBase;
using NUnit.Framework;
using System.Net;
using System.Net.Http;

namespace EveryAngle.WebClient.Web.CSTests.ControllerTest
{
    [TestFixture]
    public class HelpApiControllerTests : UnitTestBase
    {
        private readonly HelpApiController controller = new HelpApiController();

        [TestFixtureSetUp]
        public void Initialize() 
        {
            
        }

        [Test]
        public void Can_Get_Model_Model_Parameter_With_No_Uri()
        {
            HttpResponseMessage response = controller.GetModelParameter(string.Empty);
            Assert.AreEqual(response.StatusCode, HttpStatusCode.OK, string.Format("Http status code should be '200' instead of '{0}'", response.StatusCode));
            Assert.IsNotNull(response.Content, "Response's content should not be null");
        }

        [Test]
        [Ignore]
        public void Can_Get_Model_Model_Parameter_Uri()
        {
            // This test have to discuss about IoC to inject the 'new' object as a mock object.
            HttpResponseMessage response = controller.GetModelParameter("/test_uri");
            Assert.AreEqual(response.StatusCode, HttpStatusCode.OK, string.Format("Http status code should be '200' instead of '{0}'", response.StatusCode));
            Assert.IsNotNull(response.Content, "Response's content should not be null");
        }
    }
}
