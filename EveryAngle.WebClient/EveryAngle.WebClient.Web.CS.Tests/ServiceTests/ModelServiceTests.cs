using EveryAngle.WebClient.Web.CSTests.TestBase;
using NUnit.Framework;
using System.Collections.Generic;
using System.Net;

namespace EveryAngle.WebClient.Web.CSTests.ServiceTests
{
    [TestFixture]
    public class ModelServiceTests : UnitTestBase
    {
        [Test]
        public void Can_Execute_GetModelServer()
        {
            var modelServer = _modelService.GetModelServer(_testingUri);
            Assert.IsNotNull(modelServer);
        }

        [Test]
        public void Can_Execute_GetModelExtractor()
        {
            var extractor = _modelService.GetModelExtractor(_testingUri);
            Assert.IsNotNull(extractor);
        }

        [Test]
        public void Can_Execute_GetModelServers()
        {
            // create returning response
            var content = new { model_servers = new List<string>(), header = string.Empty };

            // setup new response
            SetupRestClient(SetupRestResponse(HttpStatusCode.OK, content));

            var modelServer = _modelService.GetModelServers(_testingUri);
            Assert.IsNotNull(modelServer);
        }

        [Test]
        public void Can_Execute_GetEventLog()
        {
            // create returning response
            var content = new { events = new List<string>(), header = string.Empty };

            // setup new response
            SetupRestClient(SetupRestResponse(HttpStatusCode.OK, content));

            var eventLog = _modelService.GetEventLog(_testingUri);
            Assert.IsNotNull(eventLog);
        }

        [Test]
        public void Can_Execute_GetEventsTable()
        {
            // create returning response
            var content = new { model_servers = new List<string>(), header = string.Empty };

            // setup new response
            SetupRestClient(SetupRestResponse(HttpStatusCode.OK, content));

            var eventTable = _modelService.GetEventsTable(_testingUri, 1, 100);
            Assert.IsNotNull(eventTable);
        }

        [Test]
        public void Can_Execute_GetAvailabelRolesTable()
        {
            // create returning response
            var content = new { roles = new List<string>(), header = string.Empty };

            // setup new response
            SetupRestClient(SetupRestResponse(HttpStatusCode.OK, content));

            var roleTable = _modelService.GetAvailabelRolesTable(_testingUri);
            Assert.IsNotNull(roleTable);
        }
    }
}
