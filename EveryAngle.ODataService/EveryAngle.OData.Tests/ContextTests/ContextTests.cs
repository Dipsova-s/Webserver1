using EveryAngle.OData.DTO;
using EveryAngle.OData.EAContext;
using EveryAngle.OData.Proxy;
using NUnit.Framework;
using System.Net.Http;

namespace EveryAngle.OData.Tests.ContextTests
{
    [TestFixture(Category = "Context")]
    public class ContextTests : UnitTestBase
    {
        #region private variables

        private IContext _testingContext;

        #endregion

        #region setup/teardown

        [SetUp]
        public void Setup()
        {
            _testingContext = new Context();
        }

        [TearDown]
        public void TearDown()
        {
            // re-init to clear all mock data
            _testingContext = new Context();
        }

        #endregion

        #region tests

        [TestCase]
        public void Can_GetImplicitUser()
        {
            Assert.IsNotNull(_testingContext.User);
        }

        [TestCase]
        public void CanNot_GetClientIpAddressWithEmptyUser()
        {
            Assert.IsNullOrEmpty(_testingContext.ClientIp);
        }

        [TestCase]
        public void Can_SetClientIpAddressExplicitly()
        {
            string clientIp = "127.0.0.1";
            _testingContext.ClientIp = clientIp;
            Assert.AreEqual(clientIp, _testingContext.ClientIp);
        }

        [TestCase]
        public void Can_GetContextTagExplicitly()
        {
            Assert.AreEqual("eaac", Context.Key_eaac);
        }

        [TestCase]
        public void Can_InitiateContextExplicitlyWithUserAndRequestMessage()
        {
            HttpRequestMessage requestMessage = new HttpRequestMessage();
            User user = new User("test_username", "1234");
            IContext testingContext = new Context(requestMessage, user);

            Assert.AreEqual(user.Username, testingContext.User.Username);
            Assert.AreEqual(user.Password, testingContext.User.Password);
        }

        #endregion
    }
}
