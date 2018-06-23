using EveryAngle.Core.ViewModels.Model;
using EveryAngle.ManagementConsole.Controllers;
using Moq;
using NUnit.Framework;
using System.Collections.Generic;

namespace EveryAngle.ManagementConsole.Test.Controllers
{
    public class ModelControllerTest : UnitTestBase
    {
        #region setup/teardown
        [SetUp]
        public override void Setup()
        {
            base.Setup();
        }
        #endregion

        #region tests
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

            GetController().AddSwitchWhenPostprocessingSetting(modelServerSettings, modelViewModel);

            Assert.AreEqual(modelServerSettings.SettingList.Count, expectedResult);
        }
        #endregion

        #region private
        private ModelController GetController()
        {
            return new ModelController(
                    modelService.Object,
                    labelService.Object,
                    globalSettingService.Object,
                    systemInformationService.Object,
                    sessionService.Object
                );
        }
        #endregion
    }
}
