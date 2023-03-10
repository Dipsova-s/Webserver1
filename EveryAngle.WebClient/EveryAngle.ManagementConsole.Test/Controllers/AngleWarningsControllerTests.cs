using EveryAngle.Core.ViewModels;
using EveryAngle.Core.ViewModels.BusinessProcesses;
using EveryAngle.Core.ViewModels.Cycle;
using EveryAngle.Core.ViewModels.FieldCategory;
using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Core.ViewModels.Users;
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
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;
using static EveryAngle.ManagementConsole.Controllers.AngleWarningsController;

namespace EveryAngle.ManagementConsole.Test.Controllers
{
    public class AngleWarningsControllerTests : UnitTestBase
    {
        #region private variables

        private AngleWarningsController _testingController;
        private readonly Mock<SessionViewModel> _sessionViewmodel = new Mock<SessionViewModel>();

        #endregion

        #region setup/teardown

        [SetUp]
        public override void Setup()
        {
            // call base
            base.Setup();

            // global service
            globalSettingService.Setup(x => x.GetFieldCategories(It.IsAny<string>())).Returns(new ListViewModel<FieldCategoryViewModel> {  Data = new List<FieldCategoryViewModel>() });
            globalSettingService.Setup(x => x.GetBusinessProcesses(It.IsAny<string>())).Returns(new List<BusinessProcessViewModel>());

            // model service
            TaskViewModel taskViewmodel = new TaskViewModel { id = "test_task" };
            modelService.Setup(x => x.GetFollowups(It.IsAny<string>())).Returns(new List<FollowupViewModel>
            {
                new FollowupViewModel { id = "test_followup" }
            });
            modelService.Setup(x => x.CreateTask(It.IsAny<string>(), It.IsAny<string>())).Returns(taskViewmodel);
            modelService.Setup(x => x.GetTask(It.IsAny<string>())).Returns(taskViewmodel);
            modelService.Setup(x => x.GetTaskHistories(It.IsAny<string>())).Returns(new ListViewModel<TaskHistoryViewModel>
            {
                Data = new List<TaskHistoryViewModel>
                {
                    new TaskHistoryViewModel { id = "1", correlation_id = "EXIST" },
                    new TaskHistoryViewModel { id = "2", correlation_id = "" },
                    new TaskHistoryViewModel { id = "3", correlation_id = null }
                }
            });

            JObject angleWarning1st = new JObject();
            string serializeSummary = JsonConvert.SerializeObject(new AngleWarningsSummaryViewModel());
            angleWarning1st.Add("data", JToken.FromObject(new List<AngleWarningFirstLevelViewmodel>()));
            angleWarning1st.Add("summary", JToken.FromObject(serializeSummary));
            modelService.Setup(x => x.GetAngleWarningFirstLevel(It.IsAny<string>())).Returns(angleWarning1st);

            JObject angleWarning2nd = new JObject();
            string serializeSolution = JsonConvert.SerializeObject(new List<AngleWarningsSolutionsViewModel>());
            angleWarning2nd.Add("data", JToken.FromObject(new List<AngleWarningSecondLevelViewmodel>()));
            angleWarning2nd.Add("solutions", JToken.FromObject(serializeSolution));
            modelService.Setup(x => x.GetAngleWarningSecondLevel(It.IsAny<string>())).Returns(angleWarning2nd);

            JObject angleWarning3rd = new JObject();
            angleWarning3rd.Add("data", JToken.FromObject(new List<AngleWarningThirdLevelViewmodel>()));
            modelService.Setup(x => x.GetAngleWarningThirdLevel(It.IsAny<string>())).Returns(angleWarning3rd);

            Mock<IAngleWarningsAutoSolver> autoWarningsSolver = new Mock<IAngleWarningsAutoSolver>();
            autoWarningsSolver.Setup(x => x.ExecuteAngleWarningsUsingInputFile("EA_80")).Returns("{test}");
            autoWarningsSolver.Setup(x => x.ExecuteAngleWarningsUsingInputFile("ReturnEmpty")).Returns("");

            int hasAutomationTasks;
            autoWarningsSolver.Setup(x => x.GetNumberOfSolvableFieldsViaInputFile(It.IsAny<AngleWarningsDataSourceResult>(), out hasAutomationTasks)).Returns(88);
            
            // assign to controller
            _testingController = new AngleWarningsController(modelService.Object, globalSettingService.Object, autoWarningsSolver.Object, angleWarningsFileManager.Object, sessionHelper.Object);
            _testingController.ControllerContext = new ControllerContext(contextBase.Object, new RouteData(), _testingController);
        }

        #endregion

        #region tests

        [TestCase("/models/1", "EA2_800", true)]
        [TestCase("/models/2", "EA3_800", false)]
        public void Can_GetAngleWarnings(string modelUri, string modelId, bool isValidToAccessWebClient)
        {
            // prepare
            _sessionViewmodel.Setup(x => x.IsValidToAccessWebClient(It.IsAny<string>())).Returns(isValidToAccessWebClient);
            sessionHelper.Setup(x => x.Session).Returns(_sessionViewmodel.Object);

            UserViewModel userViewModel = GetMockViewModel<UserViewModel>();
            userViewModel.Settings = GetMockViewModel<UserSettingsViewModel>();
            sessionHelper.Setup(x => x.CurrentUser).Returns(userViewModel);

            List<string> csvData = new List<string>();
            csvData.Add("Field__A,Field__B");
            csvData.Add("Field__C,Field__D");
            angleWarningsFileManager.Setup(x => x.ReadContentInputExcelFileFromDisk()).Returns(csvData);

            Mock<IAngleWarningsContentInputter> contentInputter = new Mock<IAngleWarningsContentInputter>();
            contentInputter.Setup(x => x.TryReadInputList()).Returns(false);

            AngleWarningsAutoSolver autoSolver = new AngleWarningsAutoSolver(modelService.Object, contentInputter.Object);
            autoSolver.Initialize(sessionHelper.Object);
            
            // execute
            _testingController = new AngleWarningsController(modelService.Object, globalSettingService.Object, autoSolver, angleWarningsFileManager.Object, sessionHelper.Object);
            ActionResult result = _testingController.GetAngleWarnings(modelUri, modelId);

            // assert
            Assert.IsNotNull(result);
            Assert.IsNotNull(_testingController.ViewBag.TasksUri);
            Assert.IsNotNull(_testingController.ViewBag.TaskHistoryUri);
            Assert.IsNotNull(_testingController.ViewBag.ModelUri);
            Assert.IsNotNull(_testingController.ViewBag.ModelId);
            Assert.IsNotNull(_testingController.ViewBag.UserId);
            Assert.IsNotNull(_testingController.ViewBag.FieldsUri);
            Assert.IsNotNull(_testingController.ViewBag.DefaultPagesize);
            Assert.IsNotNull(_testingController.ViewBag.MaxPageSize);
            Assert.IsNotNull(_testingController.ViewBag.DefaultPagesize);
            Assert.IsNotNull(_testingController.ViewBag.MaxDomainElementsForSearch);
            Assert.IsNotNull(_testingController.ViewBag.CanAccessViaWebClient);
            Assert.IsNotNull(_testingController.ViewBag.ClientSettings);

            Assert.IsNotNull(_testingController.ViewData["fieldCategories"]);
            Assert.IsNotNull(_testingController.ViewData["BusinessProcesses"]);
            Assert.IsNotNull(_testingController.ViewData["ModelData"]);
        }

        [TestCase("/jump_temp/1")]
        [TestCase("/jump_temp/2?id=IDSTRING")]
        [TestCase("/jump_temp/2?id=IDSTRING&q=QSTRING")]
        public void Can_GetAllJumps(string jumpUri)
        {
            // execute
            JsonResult result = _testingController.GetAllJumps(jumpUri) as JsonResult;
            List<FollowupViewModel> viewmodels = result.Data as List<FollowupViewModel>;

            // assert
            Assert.IsNotNull(result);
            Assert.AreEqual(JsonRequestBehavior.AllowGet, result.JsonRequestBehavior);
            Assert.IsNotNull(viewmodels);
        }

        [TestCase("MOCK_DATA")]
        public void Can_ExecuteAngleWarnings(string taskData)
        {
            // execute
            JsonResult result = _testingController.ExecuteAngleWarnings(taskData) as JsonResult;
            TaskViewModel viewmodels = result.Data as TaskViewModel;

            // assert
            Assert.IsNotNull(result);
            Assert.AreEqual(JsonRequestBehavior.AllowGet, result.JsonRequestBehavior);
            Assert.IsNotNull(viewmodels);
        }

        [TestCase]
        public void Can_ExecuteAngleWarningsUsingInputFile()
        {
            Assert.That(() => _testingController.ExecuteAngleWarningsUsingInputFile("ReturnEmpty"), Throws.TypeOf<Exception>());

            JsonResult result = _testingController.ExecuteAngleWarningsUsingInputFile("EA2_800") as JsonResult;
            TaskViewModel viewmodels = result.Data as TaskViewModel;
            
            Assert.IsNotNull(result);
            Assert.AreEqual(JsonRequestBehavior.AllowGet, result.JsonRequestBehavior);
            Assert.IsNotNull(viewmodels);
        }
       
        [TestCase("/tasks/1")]
        [TestCase("/tasks/2")]
        public void Can_CheckExecuteAngleWarnings(string uri)
        {
            // execute
            JsonResult result = _testingController.CheckExecuteAngleWarnings(uri) as JsonResult;
            TaskViewModel viewmodels = result.Data as TaskViewModel;

            // assert
            Assert.IsNotNull(result);
            Assert.AreEqual(JsonRequestBehavior.AllowGet, result.JsonRequestBehavior);
            Assert.IsNotNull(viewmodels);
        }

        [TestCase("/eventlog/1")]
        [TestCase("/eventlog/2")]
        public void Can_GetAngleWarningTaskHistorys(string detailUri)
        {
            // execute
            JsonResult result = _testingController.GetAngleWarningTaskHistory(detailUri) as JsonResult;
            TaskHistoryViewModel viewmodels = result.Data as TaskHistoryViewModel;

            // assert
            Assert.IsNotNull(result);
            Assert.AreEqual(JsonRequestBehavior.AllowGet, result.JsonRequestBehavior);
            Assert.IsNotNull(viewmodels);
            Assert.AreEqual("1", viewmodels.id);
            Assert.AreEqual("EXIST", viewmodels.correlation_id);
        }

        [Test]
        public void Can_AreSomeAutoSolveAnglesPartOfAutomationTasks()
        {
            // execute
            int result = _testingController.AreSomeAutoSolveAnglesPartOfAutomationTasks();

            // assert
            Assert.IsNotNull(result);
        }

        [TestCase("/tasks/1")]
        public void Can_DeleteAngleWarningTask(string uri)
        {
            // execute
            System.Action action = new System.Action(() => { _testingController.DeleteAngleWarningTask(uri); });

            // assert, just invoke our function, and it should working without exception
            Assert.DoesNotThrow(action.Invoke);
        }

        [TestCase("/angle_warnings/1")]
        [TestCase("/angle_warnings/2?q=TEST")]
        [TestCase("/angle_warnings/3?q=TEST&id=2")]
        public void Can_GetAllThirdLevel(string uri)
        {
            // execute
            JsonResult result = _testingController.GetAllThirdLevel(uri) as JsonResult;
            List<AngleWarningThirdLevelViewmodel> viewmodels = result.Data as List<AngleWarningThirdLevelViewmodel>;

            // assert
            Assert.IsNotNull(result);
            Assert.AreEqual(JsonRequestBehavior.AllowGet, result.JsonRequestBehavior);
            Assert.IsNotNull(viewmodels);
        }

        [TestCase("models/1", "1")]
        [TestCase("models/2", "2")]
        [TestCase("models/3", "3")]
        public void Can_ReadAngleWarnings(string modelUri, string level)
        {
            // prepare
            NameValueCollection valueCollection = new NameValueCollection();
            valueCollection.Add("id", level);
            valueCollection.Add("level", level);
            valueCollection.Add("uri", "/uri/x");
            valueCollection.Add("include_angles", "true");
            valueCollection.Add("include_public", "true");
            valueCollection.Add("include_private", "true");
            valueCollection.Add("include_validated", "true");
            valueCollection.Add("created_by", "test_user");
            valueCollection.Add("include_templates", "false");

            FormCollection formCollection = new FormCollection(valueCollection);

            // execute
            JsonResult result = _testingController.ReadAngleWarnings(null, modelUri, formCollection) as JsonResult;
            AngleWarningsController.AngleWarningsDataSourceResult viewmodels = result.Data as AngleWarningsController.AngleWarningsDataSourceResult;

            // assert
            Assert.IsNotNull(result.Data);
            Assert.AreEqual(JsonRequestBehavior.AllowGet, result.JsonRequestBehavior);
            Assert.IsNotNull(viewmodels);
        }

        [Test]
        public void Should_Call_UploadAngleWarningFile()
        {
            var file = new Mock<HttpPostedFileBase>();
            bool isInvalid = true;
            file.Setup(x => x.FileName).Returns("TestFile.xlsx");
            file.Setup(x => x.ContentLength).Returns(5);
            _testingController.UploadAngleWarningFile(It.IsAny<FormCollection>(), file.Object);
            angleWarningsFileManager.Verify(m => m.UploadAngleWarningsFile(file.Object, out isInvalid), Times.Once);
        }

        [Test]
        public void UploadAngleWarningFile_Should_Fail_When_File_Empty()
        {
            var file = new Mock<HttpPostedFileBase>();
            file.Setup(x => x.FileName).Returns("TestFile.xlsx");
            file.Setup(x => x.ContentLength).Returns(0);
            var returnValue = _testingController.UploadAngleWarningFile(It.IsAny<FormCollection>(), file.Object);
            Assert.IsNotNull(returnValue);
            Assert.IsTrue(((ContentResult)returnValue).Content.Contains("\"success\":false"));
        }

        [Test]
        public void UploadAngleWarningFile_Should_Fail_With_Exception_Thrown_For_Webclient_Service()
        {
            var file = new Mock<HttpPostedFileBase>();
            bool isInvalid = false;
            file.Setup(x => x.ContentLength).Throws(new HttpException("Exception thrown") { Source = "EveryAngle.WebClient.Service" });

            angleWarningsFileManager.Setup(x => x.UploadAngleWarningsFile(file.Object, out isInvalid));
            var returnValue = _testingController.UploadAngleWarningFile(It.IsAny<FormCollection>(), file.Object);
            Assert.IsNotNull(returnValue);
            Assert.IsTrue(((ContentResult)returnValue).Content.Contains("\"success\":false"));
        }

        [Test]
        public void UploadAngleWarningFile_Should_Fail_With_Exception_Thrown_For_Other_Service()
        {
            var file = new Mock<HttpPostedFileBase>();
            bool isInvalid = false;
            file.Setup(x => x.ContentLength).Throws(new HttpException("Exception thrown") { Source = "TestSource" });
            angleWarningsFileManager.Setup(x => x.UploadAngleWarningsFile(file.Object, out isInvalid));
            var returnValue = _testingController.UploadAngleWarningFile(It.IsAny<FormCollection>(), file.Object);
            Assert.IsNotNull(returnValue);
            Assert.IsTrue(((ContentResult)returnValue).Content.Contains("\"success\":false"));
        }

        [Test]
        public void UploadAngleWarningFile_InvalidFileName_ThrowsArgumentException()
        {
            // Arrange
            var formCollection = new FormCollection();
            var fileMock = new Mock<HttpPostedFileBase>();
            fileMock.SetupGet(x => x.ContentLength).Returns(100);
            fileMock.SetupGet(f => f.FileName).Returns("..\\invalidFileName.txt");
            bool isInvalid = false;
            angleWarningsFileManager.Setup(x => x.UploadAngleWarningsFile(fileMock.Object, out isInvalid)).Throws(new ArgumentException("Invalid argument") { Source = fileMock.Object.FileName});
            // Act
            var returnValue = _testingController.UploadAngleWarningFile(formCollection, fileMock.Object);
            Assert.IsNotNull(returnValue);
            Assert.IsTrue(((ContentResult)returnValue).Content.Contains("message\":\"Invalid argument"));
        }


        [Test]
        public void Should_Call_DownloadAngleWarningFile()
        {
            angleWarningsFileManager.Setup(x => x.DownloadAngleWarningsFile(It.IsAny<string>()))
                .Returns(new FileViewModel { FileName = "test.xlsx", FileBytes = new byte[0] });
            _testingController.GetAngleWarningFile(It.IsAny<string>());
            angleWarningsFileManager.Verify(m => m.DownloadAngleWarningsFile(It.IsAny<string>()), Times.Once);
        }

        #endregion
    }
}
