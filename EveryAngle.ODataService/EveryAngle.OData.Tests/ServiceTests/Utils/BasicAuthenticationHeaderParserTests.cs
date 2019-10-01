using EveryAngle.OData.Service.Utils;
using NUnit.Framework;
using System.Collections.Specialized;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web.Http.Controllers;

namespace EveryAngle.OData.Tests.ServiceTests
{
    // only test for explicitly call functions
    [TestFixture(Category = "Service")]
    public class BasicAuthenticationHeaderParserTests : UnitTestBase
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
        public void Can_ConvertHttpRequestHeadersToNameValueCollection()
        {
            var context = GetHttpActionContext("Basic", "ZWFhZG1pbjpQQHNzdzByZA==");

            var headersNameValueCollection = BasicAuthenticationHeaderParser.ConvertHttpRequestHeadersToNameValueCollection(context.Request.Headers);

            Assert.AreEqual(1, headersNameValueCollection.Count);
            Assert.AreEqual("Authorization", headersNameValueCollection.GetKey(0));
            Assert.AreEqual("Basic ZWFhZG1pbjpQQHNzdzByZA==", headersNameValueCollection["Authorization"]);
        }

        [TestCase]
        public void Can_GetBasicAuthenticationBase64EncodedCredentials()
        {
            var context = GetHttpActionContext("Basic", "ZWFhZG1pbjpQQHNzdzByZA==");

            string basicAuthHeaderValueString = BasicAuthenticationHeaderParser.GetBasicAuthenticationBase64EncodedCredentials(context.Request.Headers);
            Assert.AreEqual("ZWFhZG1pbjpQQHNzdzByZA==", basicAuthHeaderValueString);
        }

        [TestCase("", null)]
        [TestCase("wrong authentication header", null)]
        [TestCase("Basic ZWFhZG1pbjpQQHNzdzByZA==", "ZWFhZG1pbjpQQHNzdzByZA==")]
        public void Can_GetBasicAuthenticationBase64EncodedCredentials(string authenticationHeaderValuesString, string expectedValue)
        {
            NameValueCollection headerCollection = new NameValueCollection();
            headerCollection.Add("Authorization", authenticationHeaderValuesString);

            string base64EncodedCredentials = BasicAuthenticationHeaderParser.GetBasicAuthenticationBase64EncodedCredentials(headerCollection);
            Assert.AreEqual(expectedValue, base64EncodedCredentials);
        }

        #endregion

        #region private method
        private HttpActionContext GetHttpActionContext(string scheme, string parameter)
        {
            var context = new HttpActionContext();
            var headerValue = new AuthenticationHeaderValue(scheme, parameter);
            var request = new HttpRequestMessage();
            request.Headers.Authorization = headerValue;
            var controllerContext = new HttpControllerContext();
            controllerContext.Request = request;
            context.ControllerContext = controllerContext;

            return context;
        }
        #endregion
    }
}
