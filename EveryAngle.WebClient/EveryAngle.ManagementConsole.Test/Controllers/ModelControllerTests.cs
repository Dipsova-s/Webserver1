using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Core.ViewModels.ModelServer;
using EveryAngle.ManagementConsole.Controllers;
using Moq;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace EveryAngle.ManagementConsole.Test.Controllers
{
    public class ModelControllerTests : UnitTestBase
    {
        #region private variables

        private ModelController _testingController;

        #endregion

        #region setup/teardown

        [SetUp]
        public override void Setup()
        {
            base.Setup();
        }

        #endregion

        #region tests

        [TestCase(false, false)]
        [TestCase(true, true)]
        public void Can_SetModelServerStatusCorrectly(bool expectedResult, bool isModelActive)
        {
            IList<ModelServerViewModel> modelServerViewModels = new List<ModelServerViewModel>
            {
                new ModelServerViewModel { id = "EA2_800" }
            };
            IList<AgentModelInfoViewModel> agentModelInfoViewModels = new List<AgentModelInfoViewModel>
            {
                new AgentModelInfoViewModel { id = "EA2_800", is_active = isModelActive }
            };

            _testingController = GetController();
            _testingController.SetModelServersActiveStatus(modelServerViewModels, agentModelInfoViewModels);
            Assert.AreEqual(expectedResult, modelServerViewModels.Single().IsActiveServer);
        }

        [TestCase(true, 1)]
        [TestCase(false, 0)]
        public void Can_AddSwitchWhenProcessingSetting(bool isModelserverSwitchable, int expectedResult)
        {
            ModelServerSettings modelServerSettings = new ModelServerSettings
            {
                SettingsGroup = new List<SettingGroup>(),
                SettingList = new List<Setting>()
            };

            ModelViewModel modelViewModel = new ModelViewModel
            {
                IsModelserverSwitchable = isModelserverSwitchable
            };

            _testingController = GetController();
            _testingController.AddSwitchWhenPostprocessingSetting(modelServerSettings, modelViewModel);

            Assert.AreEqual(modelServerSettings.SettingList.Count, expectedResult);
        }

        [TestCase]
        public void Should_ThrowExceptionIfNotPassValidation_When_DeleteModel_HasBeenCalled()
        {
            modelService.Setup(x => x.DeleteModel(It.IsAny<string>())).Throws<HttpException>();
            _testingController = GetController();
            Assert.That(() => _testingController.DeleteModel(string.Empty), Throws.TypeOf<HttpException>());
        }

        #endregion

        #region private

        private ModelController GetController()
        {
            return new ModelController(
                modelService.Object,
                modelAgentService.Object,
                componentService.Object,
                sessionHelper.Object
            );
        }

        #endregion
    }
}
