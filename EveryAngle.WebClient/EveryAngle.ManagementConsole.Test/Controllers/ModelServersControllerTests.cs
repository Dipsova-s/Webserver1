using System;
using NUnit.Framework;
using EveryAngle.ManagementConsole.Controllers;
using Moq;
using System.Web.Mvc;
using EveryAngle.Core.ViewModels.ModelServer;
using Kendo.Mvc.UI;
using System.Collections.Generic;

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
        
        [TestCase(true, 4)]
        [TestCase(false, 1)]
        public void Should_GetAllModelServerReport_When_ItHasBeenUsed(bool hasReportUri, int totalReportTreeView)
        {
            ModelServerViewModel modelServerViewModel = new ModelServerViewModel();

            if (hasReportUri)
                modelServerViewModel.reports = new Uri("https://nl-cqasb03.everyangle.org:9080/models/1/servers/2/reports");

            modelService.Setup(x => x.GetModelServer(It.IsAny<string>())).Returns(modelServerViewModel);

            modelService.Setup(x => x.GetReports(It.IsAny<string>())).Returns(new Core.ViewModels.ListViewModel<ModelServerReportViewModel>
            {
                Data = new List<ModelServerReportViewModel>
                {
                    new ModelServerReportViewModel
                    {
                        id = "General"
                    },
                    new ModelServerReportViewModel
                    {
                        id = "Class"
                    },
                    new ModelServerReportViewModel
                    {
                        id = "Enum"
                    }
                }
            });

            var viewResult = GetController().GetAllModelServerReport(It.IsAny<string>(), It.IsAny<bool>()) as PartialViewResult;
            var resultModel = viewResult.Model as IList<TreeViewItemModel>;

            Assert.AreEqual(totalReportTreeView, resultModel.Count);
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
