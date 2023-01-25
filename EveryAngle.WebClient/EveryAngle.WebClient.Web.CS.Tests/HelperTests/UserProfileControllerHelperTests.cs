using EveryAngle.WebClient.Web.CSTests.TestBase;
using EveryAngle.WebClient.Web.Helpers;
using Newtonsoft.Json.Linq;
using NUnit.Framework;

namespace EveryAngle.WebClient.Web.CSTests.ControllerTest
{
    [TestFixture]
    public class UserProfileControllerHelperTests : UnitTestBase
    {
        [Test]
        public void Can_GetToken_With_ClientIP()
        {
            // mock
            string body = "{\"authorization\":\"test\"}";

            // action
            JObject token = UserProfileControllerHelper.GetTokenWithClientIp(body, "10.10.10.10");

            // assert
            Assert.AreEqual("test", token.SelectToken("authorization").ToString());
            Assert.AreEqual("10.10.10.10", token.SelectToken("client_ip").ToString());
        }
    }
}
