using EveryAngle.Core.ViewModels.Cycle;
using EveryAngle.Core.ViewModels.DataStore;
using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Core.ViewModels.SystemSettings;
using EveryAngle.Core.ViewModels.Users;
using EveryAngle.ManagementConsole.Controllers;
using EveryAngle.WebClient.Domain.Constants;
using Moq;
using NUnit.Framework;
using System.Collections.Generic;
using System.Linq;

namespace EveryAngle.ManagementConsole.Test.Controllers
{
    public class AutomationTasksControllerTests : UnitTestBase
    {
        #region private variables

        private AutomationTasksController _testingController;

        #endregion

        #region setup/teardown

        [SetUp]
        public override void Setup()
        {
            // call base
            base.Setup();

            // session helper
            sessionHelper.SetupGet(x => x.Session).Returns(GetMockViewModel<SessionViewModel>());

            _testingController = new AutomationTasksController(modelService.Object, taskService.Object, automationTaskService.Object, systemScriptService.Object, sessionHelper.Object);
        }

        #endregion

        #region tests

        [TestCase]
        public void Can_GetAllTasks()
        {
            // execute
            _testingController.GetAllTasks();

            // assert
            Assert.IsTrue(_testingController.ViewBag.TasksUri.Contains("/tasks"));
            Assert.IsTrue(_testingController.ViewBag.TaskHistoryUri.Contains("/eventlog"));
        }

        [TestCase("/tasks/1")]
        public void Can_GetTasksGrid(string tasksUri)
        {
            // execute
            _testingController.GetTasksGrid(tasksUri);

            // assert
            Assert.AreEqual(tasksUri, _testingController.ViewBag.TasksUri);
            Assert.AreEqual("true", _testingController.ViewBag.ManageSystemPrivilege);
            Assert.AreEqual("false", _testingController.ViewBag.CanScheduleAngles);

            Assert.AreEqual(
                sessionHelper.Object.CurrentUser.Id.Replace("\\", "\\\\"),
                _testingController.ViewBag.UserId);
        }

        [TestCase]
        public void Can_GetDataStoresUri_With_OffsetLimitQuery()
        {
            int mockPageSize = 789;
            string expectedLimit = string.Format("limit={0}", mockPageSize);

            // setup
            sessionHelper.SetupGet(x => x.SystemSettings).Returns(new SystemSettingViewModel { max_pagesize = mockPageSize });

            // execute
            string dataStoresUri = _testingController.GetDataStoresUri();

            // assert 
            Assert.That(dataStoresUri.Contains(expectedLimit));
        }

        [TestCase]
        public void Can_CopyTask()
        {
            string taskUri = "TASK_URI";
            string taskName = "TASK_NAME";

            modelService.Setup(x => x.GetTask(It.IsAny<string>())).Returns(new TaskViewModel
            {
                actions = new List<TaskAction>
                {
                    new TaskAction { arguments = new List<Core.ViewModels.Cycle.Argument>() } 
                }
            });
            taskService.Setup(x => x.CreateTask(It.IsAny<string>(), It.IsAny<TaskViewModel>()))
                .Returns(new TaskViewModel
                {
                    Uri = new System.Uri("http://www.ea.com")
                });

            _testingController.CopyTask(taskUri, taskName);

            modelService.Verify(x =>
                x.GetTask(taskUri));
            taskService.Verify(x =>
                x.CreateTask(It.IsAny<string>(), It.Is<TaskViewModel>(vm => vm.name == taskName)));
        }

        [TestCase]
        public void Can_VerifyModelPriviledge()
        {
            string taskUri = "TASK_URI";

            modelService.Setup(x => x.GetTask(It.IsAny<string>())).Returns(new TaskViewModel
            {
                actions = new List<TaskAction>
                {
                    new TaskAction { arguments = new List<Core.ViewModels.Cycle.Argument>() }
                }
            });
            taskService.Setup(x => x.CreateTask(It.IsAny<string>(), It.IsAny<TaskViewModel>()))
                .Returns(new TaskViewModel
                {
                    Uri = new System.Uri("http://www.ea.com")
                });

            _testingController.VerifyModelPriviledge(taskUri);

            modelService.Verify(x =>
                x.GetTask(taskUri));
        }

        [TestCase("password", "")]
        [TestCase("", "")]
        public void Should_ClearConnectionPasswordField_When_HasValue(string passwordValue, string expectedValue)
        {
            Mock<DataStoresViewModel> mockDataStore = new Mock<DataStoresViewModel>();
            Mock<ModelServerSettings> mockConnectionSettings = new Mock<ModelServerSettings>();
            List<Setting> settings = new List<Setting>
            {
                new Setting
                {
                    Id = DatastoreSettingConstant.ConnectionPasswordId,
                    Value = passwordValue
                }
            };
            mockConnectionSettings.SetupGet(x => x.SettingList).Returns(settings);
            mockDataStore.SetupGet(x => x.connection_settings).Returns(mockConnectionSettings.Object);
            _testingController.ClearConnectionPasswordValue(mockDataStore.Object);

            Assert.IsTrue(
                ((string)mockDataStore.Object.connection_settings.SettingList.FirstOrDefault(x => x.Id == DatastoreSettingConstant.ConnectionPasswordId).Value) == expectedValue);
        }

        #endregion
    }

}