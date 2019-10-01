using EveryAngle.OData.Proxy;
using EveryAngle.OData.Settings;
using NUnit.Framework;

namespace EveryAngle.OData.Tests.ProxyTests
{
    [TestFixture(Category = "Proxy")]
    public class EARestClientTests : UnitTestBase
    {
        #region private variables

        private IEARestClient _testingRestClient;

        #endregion

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
        public void Can_InitiateEARestClient()
        {
            _testingRestClient = new EARestClient();

            // initiate should be initialize from setting.json
            Assert.AreEqual(ODataSettings.Settings.Host, _testingRestClient.BaseUrl.OriginalString);
            Assert.AreEqual(ODataSettings.Settings.TimeOut, _testingRestClient.Timeout);
            Assert.AreEqual("EVERYANGLE.ODATA.SERVICE", _testingRestClient.UserAgent);
        }

        #endregion
    }
}
