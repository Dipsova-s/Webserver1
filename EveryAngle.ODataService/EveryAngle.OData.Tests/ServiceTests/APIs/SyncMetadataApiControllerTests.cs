using EveryAngle.OData.BackgroundWorkers;
using EveryAngle.OData.BusinessLogic.Interfaces;
using EveryAngle.OData.EAContext;
using EveryAngle.OData.Proxy;
using EveryAngle.OData.Service.APIs;
using EveryAngle.OData.ViewModel.Metadata;
using Moq;
using NUnit.Framework;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Controllers;
using System.Web.Http.Hosting;

namespace EveryAngle.OData.Tests.ServiceTests
{
    // only test for explicitly call functions
    [TestFixture(Category = "Service")]
    public class SyncMetadataApiControllerTests : UnitTestBase
    {
        #region private variables
        private Mock<IMasterEdmModelBusinessLogic> _edmBusinessLogic = new Mock<IMasterEdmModelBusinessLogic>();
        private SyncMetadataApiController _testController;
        #endregion

        #region setup/teardown

        [SetUp]
        public void Setup()
        {
            // setup
            _edmBusinessLogic.Setup(x => x.IsAppServerAvailable(It.IsAny<User>(), It.IsAny<bool>())).Returns(false);

            HttpRequestMessage request = new HttpRequestMessage();
            request.Properties[HttpPropertyKeys.HttpConfigurationKey] = new HttpConfiguration();
            request.Properties[Context.Key_eaac] = new Context();
            _testController = new SyncMetadataApiController(_edmBusinessLogic.Object)
            {
                Request = request,
            };

            HttpControllerContext controllerContext = new HttpControllerContext(_testController.RequestContext, _testController.Request, new HttpControllerDescriptor(), _testController);
            _testController.ActionContext = new HttpActionContext { ControllerContext = controllerContext };
        }

        [TearDown]
        public void TearDown()
        {
            // tear down
        }

        #endregion

        #region tests
        
        [TestCase]
        public void Can_Get()
        {
            HttpResponseMessage response = _testController.Get();
            response.TryGetContentValue(out dynamic content);
            bool available = content.GetType().GetProperty("available").GetValue(content, null);
            bool is_running = content.GetType().GetProperty("is_running").GetValue(content, null);

            Assert.IsFalse(available);
            Assert.IsFalse(is_running);
        }

        [TestCase]
        public void Can_Post_Skip()
        {
            HttpResponseMessage response = _testController.Post(null);
            Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
        }

        [TestCase]
        public void Can_Post_Conflict()
        {
            SyncMetadataProcess.IsRunning = true;
            HttpResponseMessage response = _testController.Post(new MetadataProcessViewModel { sync = true });
            Assert.AreEqual(HttpStatusCode.Conflict, response.StatusCode);
        }

        #endregion
    }
}
