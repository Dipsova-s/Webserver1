using EveryAngle.Core.ViewModels.Model;
using EveryAngle.ManagementConsole.Controllers;
using EveryAngle.ManagementConsole.Helpers;
using EveryAngle.ManagementConsole.Helpers.AngleWarnings;
using Moq;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Web.Mvc;

namespace EveryAngle.ManagementConsole.Test.AngleWarningsInput
{
    public class AngleWarningsAutoSolverTests : UnitTestBase
    {
        [TestCase]
        public void AWT_GetNrOfSolvableFieldsViaInputFile_NoInputFile_ShouldReturn_0()
        {
            Mock<IAngleWarningsContentInputter> contentInputter = new Mock<IAngleWarningsContentInputter>();
            contentInputter.Setup(x => x.TryReadInputList()).Returns(false);

            AngleWarningsAutoSolver autoSolver = new AngleWarningsAutoSolver(modelService.Object, contentInputter.Object);
            autoSolver.Initialize(sessionHelper.Object);

            Assert.AreEqual(0, autoSolver.GetNumberOfSolvableFieldsViaInputFile(null, out int hasAutomationTasks));
        }

        [TestCase]
        public void AWT_GetNumberOfSolvableFieldsViaInputFile__ShouldSucceed()
        {
            ItemSolver itemSolver = new ItemSolver
            {
                Fix = WarningFix.ReplaceClass
            };

            Mock<IAngleWarningsContentInputter> contentInputter = new Mock<IAngleWarningsContentInputter>();
            contentInputter.Setup(x => x.TryReadInputList()).Returns(true);
            contentInputter.Setup(x => x.GetSolveItem(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>())).Returns(itemSolver);

            modelService.Setup(x => x.GetAngleWarningFirstLevel(It.IsAny<string>())).Returns(AngleWarningsTestsHelper.GetFirstLevelWarningsJObject(2));
            modelService.Setup(x => x.GetAngleWarningSecondLevel(It.IsAny<string>())).Returns(AngleWarningsTestsHelper.GetSecondLevelWarningsJObject(2));

            AngleWarningsAutoSolver autoSolver = new AngleWarningsAutoSolver(modelService.Object, contentInputter.Object);
            autoSolver.Initialize(sessionHelper.Object);

            FileHelper fileHelper = new FileHelper();
            AngleWarningsFileManager angleWarningsFileManager = new AngleWarningsFileManager(fileHelper);

            AngleWarningsController testingController;
            testingController = new AngleWarningsController(modelService.Object, globalSettingService.Object, autoSolver, angleWarningsFileManager, sessionHelper.Object);

            AngleWarningsController.AngleWarningsDataSourceResult viewmodel = AngleWarningsTestsHelper.GetAngleWarningsDataSourceResult(testingController);

            modelService.SetReturnsDefault(true);
            Assert.AreEqual(28, autoSolver.GetNumberOfSolvableFieldsViaInputFile(viewmodel, out int hasAutomationTasks));
            modelService.SetReturnsDefault(false);
        }

        [TestCase]
        public void GetNumberOfSolvableFieldsViaInputFile_RemoveColumn_ShouldSucceed()
        {
            ItemSolver itemSolver = new ItemSolver
            {
                Fix = WarningFix.RemoveColumn
            };

            Mock<IAngleWarningsContentInputter> contentInputter = new Mock<IAngleWarningsContentInputter>();
            contentInputter.Setup(x => x.TryReadInputList()).Returns(true);
            contentInputter.Setup(x => x.GetSolveItem(It.IsAny<string>(), "WorkOrder", "SomeFieldToBeDeleted", null)).Returns(itemSolver);

            modelService.Setup(x => x.GetAngleWarningFirstLevel(It.IsAny<string>())).Returns(AngleWarningsTestsHelper.GetFirstLevelWarningsJObject(2));
            modelService.Setup(x => x.GetAngleWarningSecondLevel(It.IsAny<string>())).Returns(AngleWarningsTestsHelper.GetSecondLevelWarningsJObject(2));

            AngleWarningsAutoSolver autoSolver = new AngleWarningsAutoSolver(modelService.Object, contentInputter.Object);
            autoSolver.Initialize(sessionHelper.Object);

            FileHelper fileHelper = new FileHelper();
            AngleWarningsFileManager angleWarningsFileManager = new AngleWarningsFileManager(fileHelper);

            AngleWarningsController testingController;
            testingController = new AngleWarningsController(modelService.Object, globalSettingService.Object, autoSolver, angleWarningsFileManager, sessionHelper.Object);

            AngleWarningsController.AngleWarningsDataSourceResult viewmodel = AngleWarningsTestsHelper.GetAngleWarningsDataSourceResult(testingController);

            modelService.SetReturnsDefault(true);
            Assert.AreEqual(7, autoSolver.GetNumberOfSolvableFieldsViaInputFile(viewmodel, out int hasAutomationTasks));
            modelService.SetReturnsDefault(false);
        }

        [TestCase(WarningFix.ReplaceJump)]
        [TestCase(WarningFix.ReplaceField)]
        [TestCase(WarningFix.ReplaceClass)]
        public void AWT_GetNumberOfSolvableFieldsViaInputFile__EntityExistsShouldReturnFalse(WarningFix warningFix)
        {
            Mock<IAngleWarningsContentInputter> contentInputter = new Mock<IAngleWarningsContentInputter>();
            contentInputter.Setup(x => x.TryReadInputList()).Returns(true);

            modelService.Setup(x => x.GetAngleWarningFirstLevel(It.IsAny<string>())).Returns(AngleWarningsTestsHelper.GetFirstLevelWarningsJObject(1));
            modelService.Setup(x => x.GetAngleWarningSecondLevel(It.IsAny<string>())).Returns(AngleWarningsTestsHelper.GetSecondLevelWarningsJObject(1));

            AngleWarningsAutoSolver autoSolver = new AngleWarningsAutoSolver(modelService.Object, contentInputter.Object);
            autoSolver.Initialize(sessionHelper.Object);

            FileHelper fileHelper = new FileHelper();
            AngleWarningsFileManager angleWarningsFileManager = new AngleWarningsFileManager(fileHelper);

            AngleWarningsController testingController;
            testingController = new AngleWarningsController(modelService.Object, globalSettingService.Object, autoSolver, angleWarningsFileManager, sessionHelper.Object);

            AngleWarningsController.AngleWarningsDataSourceResult viewmodel = AngleWarningsTestsHelper.GetAngleWarningsDataSourceResult(testingController);

            ItemSolver itemSolver = new ItemSolver();
            itemSolver.Fix = warningFix;
            contentInputter.Setup(x => x.GetSolveItem(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>())).Returns(itemSolver);

            Assert.AreEqual(0, autoSolver.GetNumberOfSolvableFieldsViaInputFile(viewmodel, out int hasAutomationTasks));
        }

        [TestCase]
        public void AWT_GetAreSomePartOfAutomationsTasks_ShouldReturn_False()
        {
            Mock<IAngleWarningsContentInputter> contentInputter = new Mock<IAngleWarningsContentInputter>();
            contentInputter.Setup(x => x.TryReadInputList()).Returns(false);

            AngleWarningsAutoSolver autoSolver = new AngleWarningsAutoSolver(modelService.Object, contentInputter.Object);
            autoSolver.Initialize(sessionHelper.Object);

            Assert.IsFalse(autoSolver.AreSomeAnglesPartOfAutomationTasks());
        }

        [TestCase]
        public void AWT_GetLevel3Warnings_ShouldSucceed()
        {
            Mock<IAngleWarningsContentInputter> contentInputter = new Mock<IAngleWarningsContentInputter>();

            AngleWarningsAutoSolver autoSolver = new AngleWarningsAutoSolver(modelService.Object, contentInputter.Object);
            autoSolver.Initialize(sessionHelper.Object);

            AngleWarningSecondLevelViewmodel secondLevel;
            secondLevel = new AngleWarningSecondLevelViewmodel
            {
                Count = 1,
                Field = "FieldA",
                Object = "ObjectA",
                Uri = "uri"
            };

            JObject angleWarningsLevel3 = AngleWarningsTestsHelper.GetThirdLevelWarningsJObject(1);

            modelService.Setup(x => x.GetAngleWarningThirdLevel(It.IsAny<string>())).Returns(angleWarningsLevel3);

            List<AngleWarningThirdLevelViewmodel> listLevel3 = autoSolver.GetLevel3Warnings(secondLevel);

            Assert.AreEqual("angleId1", listLevel3[0].AngleId);
        }
        
        [TestCase]
        public void AWT_WithInvalidFileOrNoModelId_ShouldFail()
        {
            Mock<IAngleWarningsContentInputter> contentInputter = new Mock<IAngleWarningsContentInputter>();
            contentInputter.Setup(x => x.TryReadInputList()).Returns(false);

            AngleWarningsAutoSolver autoSolver = new AngleWarningsAutoSolver(modelService.Object, contentInputter.Object);
            autoSolver.Initialize(sessionHelper.Object);

            Assert.That(() => autoSolver.ExecuteAngleWarningsUsingInputFile("EA2_800"), Throws.TypeOf<Exception>());
            Assert.That(() => autoSolver.ExecuteAngleWarningsUsingInputFile(""), Throws.TypeOf<ArgumentException>());
        }

        [TestCase]
        public void AWT_Test_Warnings_With_MultipleTargets()
        {
            Mock<IAngleWarningsContentInputter> contentInputter = new Mock<IAngleWarningsContentInputter>();
            contentInputter.Setup(x => x.TryReadInputList()).Returns(true);

            ItemSolver contentInput1 = new ItemSolver(WarningFix.ReplaceField, "R2020", "Purchase", "Order__FieldA", "Order__FieldB");

            contentInputter.Setup(x => x.GetSolveItem("unsupported_display_field", "Purchase", "Order__FieldA", null)).Returns(contentInput1);

            modelService.Setup(x => x.GetAngleWarningFirstLevel(It.IsAny<string>())).Returns(AngleWarningsTestsHelper.GetFirstLevelWarningsJObject(1));
            modelService.Setup(x => x.GetAngleWarningSecondLevel(It.IsAny<string>())).Returns(AngleWarningsTestsHelper.GetSecondLevelWarningsJObject(11));
            modelService.Setup(x => x.GetAngleWarningThirdLevel(It.IsAny<string>())).Returns(AngleWarningsTestsHelper.GetThirdLevelWarningsJObject(2));

            modelService.SetReturnsDefault(true);

            AngleWarningsAutoSolver autoSolver = new AngleWarningsAutoSolver(modelService.Object, contentInputter.Object);
            autoSolver.Initialize(sessionHelper.Object);

            FileHelper fileHelper = new FileHelper();
            AngleWarningsFileManager angleWarningsFileManager = new AngleWarningsFileManager(fileHelper);

            AngleWarningsController testingController;
            testingController = new AngleWarningsController(modelService.Object, globalSettingService.Object, autoSolver, angleWarningsFileManager, sessionHelper.Object);
            AngleWarningsController.AngleWarningsDataSourceResult viewmodel = AngleWarningsTestsHelper.GetAngleWarningsDataSourceResult(testingController);

            JObject actualJObject = JObject.Parse(autoSolver.ExecuteAngleWarningsUsingInputFile("EA2_800"));
            JObject ExceptectedJObject = JObject.Parse(AngleWarningsTestsHelper.GetExpectedJsonForMultipleTargetTest());

            modelService.SetReturnsDefault(false);
            Assert.IsTrue(JObject.DeepEquals(ExceptectedJObject, actualJObject));
        }

        [TestCase]
        public void AWT_CompleteAutoSolverRun()
        {
            Mock<IAngleWarningsContentInputter> contentInputter = new Mock<IAngleWarningsContentInputter>();
            contentInputter.Setup(x => x.TryReadInputList()).Returns(true);

            ItemSolver solveItem1 = new ItemSolver(WarningFix.ReplaceField, "R2020", "Order", "FieldA", "FieldB");
            ItemSolver solveItem2 = new ItemSolver(WarningFix.ReplaceClass, "R2020", "InternalOrder", "InternalOrder", "WorkOrder");
            ItemSolver solveItem3 = new ItemSolver(WarningFix.ReplaceField, "R2020", "Batch", "FieldB", "FieldC");
            ItemSolver solveItem4 = new ItemSolver(WarningFix.ReplaceJump, "R2020", "InternalOrder", "InternalOrder", "WorkOrder");
            ItemSolver solveItem5 = new ItemSolver(WarningFix.ReplaceField, "R2020", "BillingDocumentItem", "Test_ref_Payer", "Payer__Description");
            ItemSolver solveItem6 = new ItemSolver(WarningFix.RemoveColumn, "R2020", "WorkOrder", "SomeFieldToBeDeleted", "");

            contentInputter.Setup(x => x.GetSolveItem("unsupported_display_field", "Order", "FieldA", null)).Returns(solveItem1);
            contentInputter.Setup(x => x.GetSolveItem("unsupported_start_object", "InternalOrder", null, null)).Returns(solveItem2);
            contentInputter.Setup(x => x.GetSolveItem("unsupported_sorting_field", "Batch", "FieldB", null)).Returns(solveItem3);
            contentInputter.Setup(x => x.GetSolveItem("unsupported_filter_field", "Batch", "FieldB", null)).Returns(solveItem3);
            contentInputter.Setup(x => x.GetSolveItem("unsupported_grouping_field", "Batch", "FieldB", null)).Returns(solveItem3);
            contentInputter.Setup(x => x.GetSolveItem("unsupported_aggregration_field", "Batch", "FieldB", null)).Returns(solveItem3);
            contentInputter.Setup(x => x.GetSolveItem("unsupported_jump", "PurchaseOrderScheduleLine", null, "InternalOrder")).Returns(solveItem4);
            contentInputter.Setup(x => x.GetSolveItem("unsupported_display_field", "BillingDocumentItem", "Test_ref_Payer__Description", null)).Returns(solveItem5);
            contentInputter.Setup(x => x.GetSolveItem("unsupported_display_field", "WorkOrder", "SomeFieldToBeDeleted", null)).Returns(solveItem6);

            modelService.Setup(x => x.GetAngleWarningFirstLevel(It.IsAny<string>())).Returns(AngleWarningsTestsHelper.GetFirstLevelWarningsJObject(2));

            modelService.SetReturnsDefault(true);

            modelService.Setup(x => x.GetAngleWarningSecondLevel("http://TH-EATST01.everyangle.org:30500/model/test/1&offset=0&limit=300")).Returns(AngleWarningsTestsHelper.GetSecondLevelWarningsJObject(2));
            modelService.Setup(x => x.GetAngleWarningSecondLevel("http://TH-EATST01.everyangle.org:30500/model/test/2&offset=0&limit=300")).Returns(AngleWarningsTestsHelper.GetSecondLevelWarningsJObject(3));
            modelService.Setup(x => x.GetAngleWarningSecondLevel("http://TH-EATST01.everyangle.org:30500/model/test/3&offset=0&limit=300")).Returns(AngleWarningsTestsHelper.GetSecondLevelWarningsJObject(4));
            modelService.Setup(x => x.GetAngleWarningSecondLevel("http://TH-EATST01.everyangle.org:30500/model/test/4&offset=0&limit=300")).Returns(AngleWarningsTestsHelper.GetSecondLevelWarningsJObject(4));
            modelService.Setup(x => x.GetAngleWarningSecondLevel("http://TH-EATST01.everyangle.org:30500/model/test/5&offset=0&limit=300")).Returns(AngleWarningsTestsHelper.GetSecondLevelWarningsJObject(4));
            modelService.Setup(x => x.GetAngleWarningSecondLevel("http://TH-EATST01.everyangle.org:30500/model/test/6&offset=0&limit=300")).Returns(AngleWarningsTestsHelper.GetSecondLevelWarningsJObject(4));
            modelService.Setup(x => x.GetAngleWarningSecondLevel("http://TH-EATST01.everyangle.org:30500/model/test/7&offset=0&limit=300")).Returns(AngleWarningsTestsHelper.GetSecondLevelWarningsJObject(5));

            modelService.Setup(x => x.GetAngleWarningThirdLevel("http://TH-EATST01.everyangle.org:30500/&offset=0&limit=300")).Returns(AngleWarningsTestsHelper.GetThirdLevelWarningsJObject(1));
            modelService.Setup(x => x.GetAngleWarningThirdLevel("http://TH-EATST01.everyangle.org:30500/unsupported_start_object&offset=0&limit=300")).Returns(AngleWarningsTestsHelper.GetThirdLevelWarningsJObject(3));

            AngleWarningsAutoSolver autoSolver = new AngleWarningsAutoSolver(modelService.Object, contentInputter.Object);
            autoSolver.Initialize(sessionHelper.Object);

            FileHelper fileHelper = new FileHelper();
            AngleWarningsFileManager angleWarningsFileManager = new AngleWarningsFileManager(fileHelper);

            AngleWarningsController testingController;
            testingController = new AngleWarningsController(modelService.Object, globalSettingService.Object, autoSolver, angleWarningsFileManager, sessionHelper.Object);

            AngleWarningsController.AngleWarningsDataSourceResult viewmodel = AngleWarningsTestsHelper.GetAngleWarningsDataSourceResult(testingController);

            string json = autoSolver.ExecuteAngleWarningsUsingInputFile("EA2_800");

            modelService.SetReturnsDefault(false);

            JObject actualJObject = JObject.Parse(json);
            JObject ExceptectedJObject = JObject.Parse(AngleWarningsTestsHelper.GetExpectedJsonForCompleteRun());

            Assert.IsTrue(JObject.DeepEquals(ExceptectedJObject, actualJObject));
        }
    }
}
