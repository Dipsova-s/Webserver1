using EveryAngle.OData.Service.Utils;
using NUnit.Framework;
using System.Collections.Specialized;

namespace EveryAngle.OData.Tests.ServiceTests
{
    // only test for explicitly call functions
    [TestFixture(Category = "Service")]
    public class BasicAuthenticationHeaderParserWrapperTests : UnitTestBase
    {
        private IBasicAuthenticationHeaderParserWrapper _basicAuthenticationHeaderParserWrapper;
        #region setup/teardown

        [SetUp]
        public void Setup()
        {
            // setup
            _basicAuthenticationHeaderParserWrapper = new BasicAuthenticationHeaderParserWrapper();
        }

        [TearDown]
        public void TearDown()
        {
            // tear down
        }

        #endregion

        #region tests

        [TestCase("", null)]
        [TestCase("wrong authentication header", null)]
        [TestCase("Basic ZWFhZG1pbjpQQHNzdzByZA==", "ZWFhZG1pbjpQQHNzdzByZA==")]
        public void Can_WrapperGetBasicAuthenticationBase64EncodedCredentials(string authenticationHeaderValuesString, string expectedValue)
        {
            NameValueCollection headerCollection = new NameValueCollection();
            headerCollection.Add("Authorization", authenticationHeaderValuesString);

            string base64EncodedCredentials = _basicAuthenticationHeaderParserWrapper.GetBasicAuthenticationBase64EncodedCredentials(headerCollection);
            Assert.AreEqual(expectedValue, base64EncodedCredentials);
        }
        #endregion
    }
}
