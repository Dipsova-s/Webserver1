using EveryAngle.OData.Service.Attributes;
using NUnit.Framework;
using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web.Http;
using System.Web.Http.Controllers;

namespace EveryAngle.OData.Tests.ServiceTests
{
    // only test for explicitly call functions
    [TestFixture(Category = "Service")]
    public class ValidateModelAttributeTests : UnitTestBase
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
        [TestCase(true)]
        [TestCase(false)]
        public void Can_OnActionExecuted(bool isValid)
        {
            HttpActionContext context = GetHttpActionContext();
            if (!isValid)
                context.ModelState.AddModelError("key", new Exception());

            ValidateModelAttribute validateModelAttribute = new ValidateModelAttribute();
            validateModelAttribute.OnActionExecuting(context);

            if (!isValid)
            {
                Assert.IsFalse(context.Response.IsSuccessStatusCode);
                Assert.AreEqual("Bad Request", context.Response.ReasonPhrase);
            }
            else
            {
                Assert.IsNull(context.Response);
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
