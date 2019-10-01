using EveryAngle.OData.Service.Attributes;
using NUnit.Framework;
using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web;
using System.Web.Http;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;

namespace EveryAngle.OData.Tests.ServiceTests
{
    // only test for explicitly call functions
    [TestFixture(Category = "Service")]
    public class ExceptionHandlingAttributeTests : UnitTestBase
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
        [TestCase("WebException", "web exception")]
        [TestCase("HttpException", "{'reason':'Known reason', 'message': 'http exception'}")]
        [TestCase("Exception", "xxxx")]
        [TestCase("", "")]
        public void Can_OnActionExecuted(string exception, string message)
        {
            HttpActionExecutedContext actionExecutedContext = new HttpActionExecutedContext(GetHttpActionContext(), new Exception());

            if (exception.Equals("WebException", StringComparison.InvariantCultureIgnoreCase))
                actionExecutedContext.Exception = new WebException(message);
            else if (exception.Equals("HttpException", StringComparison.InvariantCultureIgnoreCase))
                actionExecutedContext.Exception = new HttpException(message);
            else if (exception.Equals("Exception", StringComparison.InvariantCultureIgnoreCase))
                actionExecutedContext.Exception = new Exception(message);
            else
                actionExecutedContext.Exception = null;

            ExceptionHandlingAttribute exceptionHandlingAttribute = new ExceptionHandlingAttribute();
            exceptionHandlingAttribute.OnActionExecuted(actionExecutedContext);

            if (exception.Equals("WebException", StringComparison.InvariantCultureIgnoreCase) ||
                exception.Equals("HttpException", StringComparison.InvariantCultureIgnoreCase))
            {
                Assert.IsFalse(actionExecutedContext.Response.IsSuccessStatusCode);
                Assert.AreEqual("Internal Server Error", actionExecutedContext.Response.ReasonPhrase);
            }
            else
            { 
                Assert.IsNull(actionExecutedContext.Response);
            }
        }
        #endregion

        #region private method
        private HttpActionContext GetHttpActionContext()
        {
            var config = new HttpConfiguration();
            var context = new HttpActionContext();
            var headerValue = new AuthenticationHeaderValue("Basic", "ZWFhZG1pbjpQQHNzdzByZA==");
            var request = new HttpRequestMessage();
            request.Headers.Authorization = headerValue;
            request.SetConfiguration(config);
            var controllerContext = new HttpControllerContext();
            controllerContext.Request = request;
            context.ControllerContext = controllerContext;

            return context;
        }
        #endregion
    }
}
