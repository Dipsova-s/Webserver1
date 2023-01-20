using System;
using System.Collections.Generic;
using System.Web.Mvc;
using EveryAngle.Core.ViewModels;
using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Core.ViewModels.SystemLanguages;
using EveryAngle.ManagementConsole.Controllers;
using Kendo.Mvc.UI;
using Moq;
using NUnit.Framework;

namespace EveryAngle.ManagementConsole.Test.Controllers
{
    public class ActiveLanguageControllerTests : UnitTestBase
    {
        #region private variables

        private ActiveLanguageController _testingController;
        private ListViewModel<SystemLanguageViewModel> _systemLanguages;

        #endregion

        #region setup/teardown

        [SetUp]
        public override void Setup()
        {
            // call base
            base.Setup();

            _systemLanguages = new ListViewModel<SystemLanguageViewModel>();
        }

        #endregion

        #region tests

        [TestCase]
        public void Can_InitiateConstructor()
        {
            // execute
            Action action = new Action(() =>
            {
                _testingController = new ActiveLanguageController(modelService.Object, labelService.Object, globalSettingService.Object);
                _testingController = new ActiveLanguageController(modelService.Object, labelService.Object, globalSettingService.Object, authorizationHelper.Object);
            });

            // assert
            Assert.DoesNotThrow(action.Invoke);
        }

        [TestCase("EA2_800", "/models/1")]
        [TestCase("EA3_800", "/models/2")]
        public void Can_GetModelLanguages(string modelId, string modelUri)
        {
            // prepare
            List<string> activeLangs = new List<string> { "nl", "de", "en" };
            modelService.Setup(x => x.GetModel(It.IsAny<string>())).Returns(new ModelViewModel { id = modelId, active_languages = activeLangs });
            _testingController = new ActiveLanguageController(modelService.Object, labelService.Object, globalSettingService.Object, authorizationHelper.Object);

            // execute
            _testingController.GetModelLanguages(modelUri);

            // assert
            Assert.AreEqual(modelId, _testingController.ViewBag.ModelId);
            Assert.AreEqual(modelUri, _testingController.ViewBag.ModelUri);
            Assert.AreEqual(activeLangs, _testingController.ViewData["ModelLanguages"]);
        }

        [TestCase("en", "nl")]
        [TestCase("de", "nl")]
        [TestCase("th", "nl")]
        public void Can_ReadLanguages(string langId, string additionalLangId)
        {
            // prepare
            _systemLanguages.Data = new List<SystemLanguageViewModel>
                                        {
                                            new SystemLanguageViewModel { Id = langId },
                                            new SystemLanguageViewModel { Id = additionalLangId }
                                        };

            globalSettingService.Setup(x => x.GetSystemLanguages(It.IsAny<string>())).Returns(_systemLanguages);
            _testingController = new ActiveLanguageController(modelService.Object, labelService.Object, globalSettingService.Object, authorizationHelper.Object);

            // execute
            JsonResult result = _testingController.ReadLanguages(null) as JsonResult;
            DataSourceResult dataSourceResult = result.Data as DataSourceResult;
            List<SystemLanguageViewModel> viewmodels = dataSourceResult.Data as List<SystemLanguageViewModel>;

            // assert
            Assert.IsNotNull(result);
            Assert.IsNotNull(dataSourceResult);
            Assert.IsNotNull(viewmodels);
            Assert.AreEqual(2, viewmodels.Count);
            Assert.AreEqual(2, viewmodels.Capacity);
        }

        [TestCase]
        public void Can_SaveActiveLanguages()
        {
            // just execute, nothing no logic when execute SaveActiveLanguages, void returned
            _testingController = new ActiveLanguageController(modelService.Object, labelService.Object, globalSettingService.Object, authorizationHelper.Object);
            Action action = new Action(() => { _testingController.SaveActiveLanguages("", ""); });

            // assert, just invoke our function, and it should working without exception
            Assert.DoesNotThrow(action.Invoke);
        }

        #endregion
    }
}
