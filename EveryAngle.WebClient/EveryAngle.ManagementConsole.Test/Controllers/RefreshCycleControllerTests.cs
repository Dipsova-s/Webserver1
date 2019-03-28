using EveryAngle.Core.ViewModels;
using EveryAngle.Core.ViewModels.ModelServer;
using EveryAngle.ManagementConsole.Controllers;
using EveryAngle.WebClient.Domain.Enums;
using Moq;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;

namespace EveryAngle.ManagementConsole.Test.Controllers
{
    public class RefreshCycleControllerTests : UnitTestBase
    {
        #region private variables

        private RefreshCycleController _testingController;

        #endregion

        #region setup/teardown

        [SetUp]
        public override void Setup()
        {
            // call base
            base.Setup();

            _testingController = new RefreshCycleController(modelService.Object, taskService.Object);
        }

        #endregion

        #region tests

        [TestCase("no_extractor", "")]
        [TestCase("extractor_any", "")]
        [TestCase("extractor_started", "http://th-eatst01.everyangle.org:30500/models/1/servers/1")]
        public void Can_CheckExtractor(string testUrl, string expected)
        {
            // prepare
            Dictionary<string, List<ModelServerViewModel>> testData = new Dictionary<string, List<ModelServerViewModel>>
            {
                {
                    "no_extractor",
                    new List<ModelServerViewModel>()
                },
                {
                    "extractor_started",
                    new List<ModelServerViewModel>
                    {
                        new ModelServerViewModel
                        {
                            type = ModelAgentType.Extractor.ToString(),
                            status = "extracting",
                            Uri = new Uri("models/1/servers/1", UriKind.Relative)
                        }
                    }
                },
                {
                    "extractor_any",
                    new List<ModelServerViewModel>
                    {
                        new ModelServerViewModel
                        {
                            type = ModelAgentType.Extractor.ToString(),
                            status = "any",
                            Uri = new Uri("models/1/servers/1", UriKind.Relative)
                        }
                    }
                }
            };
            modelService
                .Setup(x => x.GetModelServers(It.IsAny<string>()))
                .Returns(new ListViewModel<ModelServerViewModel> { Data = testData[testUrl] });

            // execute
            JsonResult result = _testingController.CheckExtractor(string.Empty) as JsonResult;
            JObject data = JObject.FromObject(result.Data);

            // assert
            Assert.AreEqual(expected, data.GetValue("ExtractorUri").ToString());
        }

        #endregion
    }
}
