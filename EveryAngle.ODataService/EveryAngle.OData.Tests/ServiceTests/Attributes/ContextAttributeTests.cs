using EveryAngle.OData.EAContext;
using EveryAngle.OData.Service.Attributes;
using NUnit.Framework;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web.Http.Controllers;

namespace EveryAngle.OData.Tests.ServiceTests
{
    // only test for explicitly call functions
    [TestFixture(Category = "Service")]
    public class ContextAttributeTests : UnitTestBase
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
        public void Can_OnActionExecuted()
        {
            HttpActionContext context = GetHttpActionContext();

            ContextAttribute contextAttribute = new ContextAttribute();
            contextAttribute.OnActionExecuting(context);

            Assert.IsNotNull(context.Request.Properties[Context.Key_eaac]);
        }

        [TestCase]
        public void Can_AddEAContext()
        {
            HttpActionContext context = GetHttpActionContext();

            ContextAttribute.AddEAContext(context);

            Assert.IsNotNull(context.Request.Properties[Context.Key_eaac]);
        }
        #endregion

        #region private method
        private HttpActionContext GetHttpActionContext()
        {
            var context = new HttpActionContext();
            var headerValue = new AuthenticationHeaderValue("Basic", "ZWFhZG1pbjpQQHNzdzByZA==");
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
