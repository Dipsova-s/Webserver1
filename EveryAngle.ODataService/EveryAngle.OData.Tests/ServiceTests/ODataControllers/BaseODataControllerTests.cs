using EveryAngle.OData.BusinessLogic.Interfaces;
using EveryAngle.OData.EAContext;
using EveryAngle.OData.ODataControllers;
using EveryAngle.OData.Service.ODataControllers;
using EveryAngle.OData.Service.Utils;
using Moq;
using NUnit.Framework;
using System;
using System.Collections.Specialized;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web;
using System.Web.Http.Controllers;
using System.Web.Http.OData;

namespace EveryAngle.OData.Tests.ServiceTests
{
    // only test for explicitly call functions
    [TestFixture(Category = "Service")]
    public class BaseODataControllerTests : UnitTestBase
    {
        #region private variables
        private TestBaseODataController _testController;
        #endregion

        #region setup/teardown

        [SetUp]
        public void Setup()
        {
            // setup
            _testController = new TestBaseODataController
            {
                Request = new HttpRequestMessage(HttpMethod.Get, new Uri("https://localhost/rows?offset=0&limit=30"))
            };
        }

        [TearDown]
        public void TearDown()
        {
            // tear down
        }

        #endregion

        #region tests

        [TestCase("test", true)]
        [TestCase(Context.Key_eaac, false)]
        public void Can_Context(string name, bool isNull)
        {
            _testController.Request.Properties[name] = new Context();

            if (isNull)
                Assert.IsNull(_testController.Context);
            else
                Assert.IsNotNull(_testController.Context);
        }

        [TestCase("", 1)]
        [TestCase("format=any", 1)]
        [TestCase("format=json", 0)]
        public void Can_Initialize(string queryString, int expected)
        {
            HttpRequest httpRequest = new HttpRequest("", "http://localhost/", queryString);
            HttpResponse httpResponse = new HttpResponse(new StringWriter());
            HttpContext.Current = new HttpContext(httpRequest, httpResponse);

            HttpControllerContext controllerContext = new HttpControllerContext(_testController.RequestContext, _testController.Request, new HttpControllerDescriptor(), _testController);
            _testController.Initialize(controllerContext);

            Assert.AreEqual(controllerContext.Request.Headers.Accept.Count, expected);
            if (expected > 0)
                Assert.IsTrue(controllerContext.Request.Headers.Accept.Contains(new MediaTypeWithQualityHeaderValue("application/atom+xml")));
        }

        #endregion
    }

    public class TestBaseODataController : BaseODataController
    {
        public new IContext Context => base.Context;

        public new void Initialize(HttpControllerContext controllerContext) => base.Initialize(controllerContext);
    }
}
