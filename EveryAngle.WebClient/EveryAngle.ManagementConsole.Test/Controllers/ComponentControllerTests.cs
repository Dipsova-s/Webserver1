using EveryAngle.Core.ViewModels;
using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Core.ViewModels.ModelServer;
using EveryAngle.ManagementConsole.Controllers;
using EveryAngle.WebClient.Domain.Enums;
using Moq;
using Newtonsoft.Json;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;

namespace EveryAngle.ManagementConsole.Test.Controllers
{
    public class ComponentControllerTests : UnitTestBase
    {
        #region private variables

        private readonly string _serverUri = "http://NL-WEBMB01.everyangle.org:62029";

        #endregion


        #region setup/teardown

        [SetUp]
        public override void Setup()
        {
            base.Setup();

            List<ComponentViewModel> components = GetMockViewModel<List<ComponentViewModel>>();

            componentService.Setup(x => x.GetItems()).Returns(components);
        }

        #endregion

        #region GetComponents
        [TestCase]
        public void GetComponent_Should_ReturnJsonDataWithIsCurrentInstanceIsTrue_When_CurrentInstanceModelSameAsModelServerInstance()
        {
            ModelViewModel model = new ModelViewModel
            {
                id = "EA2_800",
                ServerUri = new Uri(_serverUri),
                current_instance = new Uri("http://NL-WEBMB01.everyangle.org:62029/models/1/instances/1")
            };

            sessionHelper.Setup(x => x.Models).Returns(new List<ModelViewModel> { model });

            List<ModelServerViewModel> modelServers = new List<ModelServerViewModel>
            {
                new ModelServerViewModel
                {
                    server_uri = _serverUri,
                    Uri = new Uri("http://NL-WEBMB01.everyangle.org:62029/models/1/servers/2"),
                    instance = new Uri("http://NL-WEBMB01.everyangle.org:62029/models/1/instances/1")
                }
            };

            sessionHelper.Setup(x => x.GetModelServers(It.IsAny<List<ModelViewModel>>())).Returns(modelServers);

            ComponentController controller = new ComponentController(
                componentService.Object, modelService.Object, sessionHelper.Object);

            JsonResult jsonResult = controller.GetComponents();

            string json = JsonConvert.SerializeObject(jsonResult.Data);
            ComponentsResult result = JsonConvert.DeserializeObject<ComponentsResult>(json);
            ComponentViewModel component = result.Data.FirstOrDefault(x => x.Type.Equals(ComponentServiceManagerType.ClassicModelQueryService));

            Assert.AreEqual(true, component.ModelServer.IsCurrentInstance);
            Assert.AreEqual(modelServers[0].Uri, component.ModelServer.Uri);
        }

        [TestCase]
        public void GetComponent_Should_ReturnJsonDataWithIsCurrentInstanceIsFalse_When_CurrentInstanceModelIsDifferentModelServerInstance()
        {
            ModelViewModel model = new ModelViewModel
            {
                id = "EA2_800",
                ServerUri = new Uri(_serverUri),
                current_instance = new Uri("http://NL-WEBMB01.everyangle.org:62029/models/1/instances/1")
            };

            sessionHelper.Setup(x => x.Models).Returns(new List<ModelViewModel> { model });

            List<ModelServerViewModel> modelServers = new List<ModelServerViewModel>
            {
                new ModelServerViewModel
                {
                    server_uri = _serverUri,
                    Uri = new Uri("http://NL-WEBMB01.everyangle.org:62029/models/1/servers/2"),
                    instance = new Uri("http://NL-WEBMB01.everyangle.org:62029/models/1/instances/2")
                }
            };

            sessionHelper.Setup(x => x.GetModelServers(It.IsAny<List<ModelViewModel>>())).Returns(modelServers);

            ComponentController controller = new ComponentController(
                componentService.Object, modelService.Object, sessionHelper.Object);

            JsonResult jsonResult = controller.GetComponents();

            string json = JsonConvert.SerializeObject(jsonResult.Data);
            ComponentsResult result = JsonConvert.DeserializeObject<ComponentsResult>(json);
            ComponentViewModel component = result.Data.FirstOrDefault(x => x.Type.Equals(ComponentServiceManagerType.ClassicModelQueryService));

            Assert.AreEqual(false, component.ModelServer.IsCurrentInstance);
            Assert.AreEqual(modelServers[0].Uri, component.ModelServer.Uri);
        }

        [TestCase]
        public void GetComponents_Should_ReturnComponents_When_Called()
        {
            ComponentController controller = new ComponentController(
               componentService.Object, modelService.Object, sessionHelper.Object);
            JsonResult jsonResult = controller.GetComponents();

            string json = JsonConvert.SerializeObject(jsonResult.Data);
            ComponentsResult result = JsonConvert.DeserializeObject<ComponentsResult>(json);

            Assert.AreEqual(6, result.Total);
        }
        #endregion
    }

    public class ComponentInfoResult
    {
        public Uri modelServerUri { get; set; }
        public bool isCurrentInstance { get; set; }
    }

    public class ComponentsResult
    {
        public IEnumerable<ComponentViewModel> Data { get; set; }
        public int Total { get; set; }
    }
}
