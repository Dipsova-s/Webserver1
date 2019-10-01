using EveryAngle.OData.BusinessLogic.Interfaces;
using EveryAngle.OData.DTO;
using EveryAngle.OData.Repository;
using EveryAngle.OData.Service.APIs;
using Moq;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.Http.Controllers;
using System.Web.Http.Hosting;

namespace EveryAngle.OData.Tests.ServiceTests
{
    // only test for explicitly call functions
    [TestFixture(Category = "Service")]
    public class AppEntryApiControllerTests : UnitTestBase
    {
        #region private variables
        private Mock<IMasterEdmModelBusinessLogic> _edmBusinessLogic = new Mock<IMasterEdmModelBusinessLogic>();
        private AppEntryApiController _testController;
        #endregion

        #region setup/teardown

        [SetUp]
        public void Setup()
        {
            // setup
            _edmBusinessLogic.Setup(x => x.CountAvailableAngles()).Returns(88);
            HttpRequestMessage request = new HttpRequestMessage();
            request.Properties[HttpPropertyKeys.HttpConfigurationKey] = new HttpConfiguration();
            _testController = new AppEntryApiController(_edmBusinessLogic.Object)
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

        [TestCase(null)]
        [TestCase("test")]
        public void Can_Get_NoQuery(string query)
        {
            HttpContext.Current = GetHttpContext(query);
            AssertResponse(0, 0);
        }

        [TestCase("{take:30,filter:{filters:[{name:\"name\",value:\"name1\"}]}}", 88, 1)]
        [TestCase("{take:30,filter:{filters:[{name:\"name\",value:\"not exist\"}]}}", 88, 0)]
        [TestCase("{take:30,sort:[{dir:\"desc\"}]}", 88, 2)]
        [TestCase("{take:30,sort:[{dir:\"asc\"}]}", 88, 2)]
        public void Can_Get_NoId(string query, int expectedPageSize, int expectedResult)
        {
            HttpContext.Current = GetHttpContext(query);
            _edmBusinessLogic.Setup(x => x.GetAvailableAngles()).Returns(new List<Angle>
            {
                new Angle { name ="Angle Name1", displays_summary = new List<DisplaysSummary>() },
                new Angle { name ="Angle Name2", displays_summary = new List<DisplaysSummary>() }
            });

            AssertResponse(expectedPageSize, expectedResult);
        }

        [TestCase(true, 88, 1)]
        [TestCase(false, 88, 0)]
        public void Can_Get_HasId(bool found, int expectedPageSize, int expectedResult)
        {
            HttpContext.Current = GetHttpContext("{id:1}");
            _edmBusinessLogic
                .Setup(x => x.TryGetAngle(It.IsAny<AngleCompositeKey>(), out It.Ref<Angle>.IsAny))
                .Returns(new MockTryGetAngle((AngleCompositeKey key, out Angle outAngle) =>
                {
                    outAngle = new Angle
                    {
                        name = "angle1",
                        display_definitions = new List<Display>()
                    };
                    Display display = new Display
                    {
                        angle_id = "1",
                        display_type = "list",
                        uri = "/models/1/angles/1/displays/1",
                        name = "display1"
                    };
                    display.SetAngle(outAngle);
                    outAngle.display_definitions.Add(display);
                    return found;
                }));

            AssertResponse(expectedPageSize, expectedResult);
        }

        #endregion

        #region private method

        delegate bool MockTryGetAngle(AngleCompositeKey key, out Angle outAngle);
        
        private HttpContext GetHttpContext(string queryString)
        {
            return new HttpContext(
                new HttpRequest("", "http://localhost", queryString),
                new HttpResponse(new StringWriter())
                );
        }

        private void AssertResponse(int expectedPageSize, int expectedResult)
        {
            HttpResponseMessage response = _testController.Get();
            response.TryGetContentValue(out dynamic content);
            int pageSize = content.GetType().GetProperty("page_size").GetValue(content, null);
            int resultCount = content.GetType().GetProperty("result").GetValue(content, null).Count;

            Assert.AreEqual(expectedPageSize, pageSize);
            Assert.AreEqual(expectedResult, resultCount);
        }

        #endregion
    }
}
