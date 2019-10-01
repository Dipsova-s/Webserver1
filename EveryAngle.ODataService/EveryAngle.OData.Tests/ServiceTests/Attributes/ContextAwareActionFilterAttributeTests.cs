using EveryAngle.OData.EAContext;
using EveryAngle.OData.Service.Attributes;
using NUnit.Framework;
using System;
using System.Diagnostics;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.ServiceModel.Channels;
using System.Web;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;

namespace EveryAngle.OData.Tests.ServiceTests
{
    // only test for explicitly call functions
    [TestFixture(Category = "Service")]
    public class ContextAwareActionFilterAttributeTests : UnitTestBase
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
        [TestCase(Context.Key_eaac)]
        [TestCase("newkey")]
        public void Can_GetContext_By_HttpActionExecutedContext(string key)
        {
            HttpActionExecutedContext actionExecutedContext = new HttpActionExecutedContext(GetHttpActionContext(key), new Exception());

            IContext context = ContextAwareActionFilterAttribute.GetContext(actionExecutedContext);

            Assert.IsNotNull(context);
        }

        [TestCase(Context.Key_eaac)]
        [TestCase("newkey")]
        public void Can_GetContext_By_HttpActionContext(string key)
        {
            IContext context = ContextAwareActionFilterAttribute.GetContext(GetHttpActionContext(key));

            Assert.IsNotNull(context);
        }

        [TestCase(true, false)]
        [TestCase(false, true)]
        [TestCase(false, false)]
        public void Can_GetContentSize(bool isResponseNull, bool isContentNull)
        {
            float contentSize =
                isResponseNull ? ContextAwareActionFilterAttribute.GetContentSize(null) 
                : ContextAwareActionFilterAttribute.GetContentSize(GetHttpActionContext(Context.Key_eaac, isContentNull).Response);

            if (isResponseNull)
            {
                Assert.AreEqual(0.0f, contentSize);
            }
            else
            {
                if (isContentNull)
                    Assert.AreEqual(0.0f, contentSize);
                else
                    Assert.AreEqual(0.01171875f, contentSize);
            }
                
        }

        [TestCase]
        public void Can_StartPerformanceMeasurement()
        {
            HttpActionContext httpActionContext = GetHttpActionContext(Context.Key_eaac);
            ContextAwareActionFilterAttribute.StartPerformanceMeasurement(httpActionContext.Request);

            Assert.IsNotNull(httpActionContext.Request.Properties["PerformanceFilter.Value"]);
        }

        [TestCase]
        public void Can_StopPerformanceMeasurement()
        {
            HttpActionContext httpActionContext = GetHttpActionContext(Context.Key_eaac);
            httpActionContext.Request.Properties.Add("PerformanceFilter.Value", new Stopwatch());
            int elapseTime = ContextAwareActionFilterAttribute.StopPerformanceMeasurement(httpActionContext.Request);

            Assert.AreEqual(0, elapseTime);
        }

        [TestCase("MS_HttpContext", null)]
        [TestCase("System.ServiceModel.Channels.RemoteEndpointMessageProperty", "localhost")]
        public void Can_GetClientIp(string key, string expected)
        {
            HttpActionContext httpActionContext = GetHttpActionContext(Context.Key_eaac);
            if(key.Equals("MS_HttpContext", System.StringComparison.InvariantCultureIgnoreCase))
                httpActionContext.Request.Properties.Add(key, new HttpContextWrapper(GetHttpContext()));
            else
                httpActionContext.Request.Properties.Add(key, new RemoteEndpointMessageProperty("localhost", 8080));

            string clientIp = ContextAwareActionFilterAttribute.GetClientIp(httpActionContext.Request);

            Assert.AreEqual(expected, clientIp);
        }

        #endregion

        #region private method
        private HttpActionContext GetHttpActionContext(string key, bool isContentNull = false)
        {
            var context = new HttpActionContext();
            var headerValue = new AuthenticationHeaderValue("Basic", "ZWFhZG1pbjpQQHNzdzByZA==");
            var request = new HttpRequestMessage();
            var response = new HttpResponseMessage();

            if(!isContentNull)
                response.Content = new StringContent("test content");

            request.Headers.Authorization = headerValue;
            request.Properties.Add(key, new Context());
            var controllerContext = new HttpControllerContext();
            controllerContext.Request = request;
            context.ControllerContext = controllerContext;
            context.Response = response;

            return context;
        }

        private static HttpContext GetHttpContext()
        {
            HttpRequest httpRequest = new HttpRequest("", "http://localhost/", "");
            HttpResponse httpResponse = new HttpResponse(new StringWriter());
            HttpContext context = new HttpContext(httpRequest, httpResponse);
            return context;
        }
        #endregion
    }
}
