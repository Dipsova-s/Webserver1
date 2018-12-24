using EveryAngle.Core.ViewModels;
using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Core.ViewModels.ModelServer;
using EveryAngle.ManagementConsole.Controllers;
using Moq;
using Newtonsoft.Json;
using NUnit.Framework;
using System;
using System.Collections.Generic;
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

            IEnumerable<ComponentViewModel> components = new List<ComponentViewModel>
            {
                new ComponentViewModel { RegistrationId = Guid.NewGuid() },
                new ComponentViewModel { RegistrationId = Guid.NewGuid(), ModelId = "EA2_800" },
                new ComponentViewModel { RegistrationId = Guid.NewGuid() },
                new ComponentViewModel { RegistrationId = Guid.NewGuid(), ModelId = "EA2_900" },
                new ComponentViewModel { RegistrationId = Guid.NewGuid() },
                new ComponentViewModel { RegistrationId = Guid.NewGuid(), ModelId = "EA2_800" },
            };

            componentService.Setup(x => x.GetItems()).Returns(components);
        }

        #endregion

        #region GetComponentInfo
        [TestCase]
        public void GetComponentInfo_Should_ReturnJsonDataWithIsCurrentInstanceIsTrue_When_CurrentInstanceModelSameAsModelServerInstance()
        {
            ModelViewModel model = new ModelViewModel
            {
                ServerUri = new Uri(_serverUri),
                current_instance = new Uri("http://NL-WEBMB01.everyangle.org:62029/models/1/instances/1")
            };
            sessionHelper.Setup(x => x.GetModelById(It.IsAny<string>())).Returns(model);

            ListViewModel<ModelServerViewModel> modelServers = new ListViewModel<ModelServerViewModel>
            {
                Data = new List<ModelServerViewModel>
                {
                    new ModelServerViewModel
                    {
                        server_uri = _serverUri,
                        Uri = new Uri("http://NL-WEBMB01.everyangle.org:62029/models/1/servers/2"),
                        instance = new Uri("http://NL-WEBMB01.everyangle.org:62029/models/1/instances/1")
                    }
                }
            };
            modelService.Setup(x => x.GetModelServers(It.IsAny<string>())).Returns(modelServers);

            ComponentController controller = new ComponentController(
                componentService.Object, modelService.Object, sessionHelper.Object);

            JsonResult jsonResult = controller.GetComponentInfo("MODEL_ID", _serverUri);

            string json = JsonConvert.SerializeObject(jsonResult.Data);
            ComponentInfoResult result = JsonConvert.DeserializeObject<ComponentInfoResult>(json);

            Assert.AreEqual(true, result.isCurrentInstance);
            Assert.AreEqual(modelServers.Data[0].Uri, result.modelServerUri);
        }

        [TestCase]
        public void GetComponentInfo_Should_ReturnJsonDataWithIsCurrentInstanceIsFalse_When_CurrentInstanceModelIsDifferentModelServerInstance()
        {
            ModelViewModel model = new ModelViewModel
            {
                ServerUri = new Uri(_serverUri),
                current_instance = new Uri("http://NL-WEBMB01.everyangle.org:62029/models/1/instances/1")
            };
            sessionHelper.Setup(x => x.GetModelById(It.IsAny<string>())).Returns(model);

            ListViewModel<ModelServerViewModel> modelServers = new ListViewModel<ModelServerViewModel>
            {
                Data = new List<ModelServerViewModel>
                {
                    new ModelServerViewModel
                    {
                        server_uri = _serverUri,
                        Uri = new Uri("http://NL-WEBMB01.everyangle.org:62029/models/1/servers/2"),
                        instance = new Uri("http://NL-WEBMB01.everyangle.org:62029/models/1/instances/2")
                    }
                }
            };
            modelService.Setup(x => x.GetModelServers(It.IsAny<string>())).Returns(modelServers);

            ComponentController controller = new ComponentController(
                componentService.Object, modelService.Object, sessionHelper.Object);

            JsonResult jsonResult = controller.GetComponentInfo("MODEL_ID", _serverUri);

            string json = JsonConvert.SerializeObject(jsonResult.Data);
            ComponentInfoResult result = JsonConvert.DeserializeObject<ComponentInfoResult>(json);

            Assert.AreEqual(false, result.isCurrentInstance);
            Assert.AreEqual(modelServers.Data[0].Uri, result.modelServerUri);
        }

        #endregion

        #region GetComponents
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
