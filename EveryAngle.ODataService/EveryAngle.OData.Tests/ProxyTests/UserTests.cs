using EveryAngle.OData.Proxy;
using NUnit.Framework;

namespace EveryAngle.OData.Tests.ProxyTests
{
    [TestFixture(Category = "Proxy")]
    public class UserTests : UnitTestBase
    {
        #region tests

        [TestCase]
        public void Can_Create_User_With_Base64EncodedCredentials()
        {
            string credentials = "dGVzdGVyOm15cGFzc3dvcmQ=";
            User testUser = new User(credentials);

            // set username & password but token & model privileges
            Assert.AreEqual("tester", testUser.Username);
            Assert.AreEqual("mypassword", testUser.Password);
            Assert.IsNull(testUser.SecurityToken);

            // register token & save
            testUser.RegisterSecurityToken("mytoken");
            testUser.SaveToCache();

            // create from cache
            User testCachedUser = new User(credentials);

            // check cached user
            Assert.AreEqual("tester", testCachedUser.Username);
            Assert.AreEqual("mypassword", testCachedUser.Password);
            Assert.AreEqual("mytoken", testCachedUser.SecurityToken);
        }

        #endregion
    }
}
