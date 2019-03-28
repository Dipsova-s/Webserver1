using System;
using NUnit.Framework;
using EveryAngle.ManagementConsole.Controllers;
using Moq;
using System.Web.Mvc;
using EveryAngle.Core.ViewModels.ModelServer;

namespace EveryAngle.ManagementConsole.Test.Controllers
{
    public class ModelServersControllerTests : UnitTestBase
    {
        #region setup/teardown
        [SetUp]
        public override void Setup()
        {
            base.Setup();
        }
        #endregion

        #region tests
        [TestCase(0, false)]
        [TestCase(5, true)]
        public void Can_DisableKillSapJobsButton(int busy, bool expectedResult)
        {
            modelService.Setup(x => x.GetModelServer(It.IsAny<string>())).Returns(new ModelServerViewModel
            {
                type = "Extractor",
                status = "Extracting",
                info = new Uri("http://test.com/extractor")
            });
            modelService.Setup(x => x.GetModelExtractor(It.IsAny<string>())).Returns(new ExtractorViewModel
            {
                task_details = new TaskDetailsViewModel
                {
                    extracting_tables = new TaskTableViewModel
                    {
                        summary = new TaskTableSummaryViewModel
                        {
                            busy = busy
                        }
                    }
                }
            });

            ModelServersController modelServersController = GetController();
            PartialViewResult result = modelServersController.GetAllModelServer("http://test.com/models", true) as PartialViewResult;
            ExtractorViewModel modelServerViewModel = result.Model as ExtractorViewModel;
            Assert.AreEqual(expectedResult, modelServerViewModel.IsBusy);
        }
        #endregion

        #region private
        private ModelServersController GetController()
        {
            return new ModelServersController(modelService.Object);
        }
        #endregion
    }
}
