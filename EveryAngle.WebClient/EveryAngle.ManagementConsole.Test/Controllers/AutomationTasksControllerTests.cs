using EveryAngle.Core.ViewModels;
using EveryAngle.Core.ViewModels.Cycle;
using EveryAngle.Core.ViewModels.DataStore;
using EveryAngle.Core.ViewModels.Directory;
using EveryAngle.Core.ViewModels.Item;
using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Core.ViewModels.Privilege;
using EveryAngle.Core.ViewModels.SystemSettings;
using EveryAngle.Core.ViewModels.Users;
using EveryAngle.ManagementConsole.Controllers;
using EveryAngle.WebClient.Domain.Constants;
using Moq;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

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
            SessionViewModel sessionViewModel = GetMockViewModel<SessionViewModel>();
            sessionViewModel.ModelPrivileges = new List<ModelPrivilegeViewModel>
            {
                new ModelPrivilegeViewModel
                {
                    model = new Uri("/models/1", UriKind.Relative),
                    Privileges = new PrivilegesForModelViewModel
                    {
                        manage_model = true
                    }
                }
            };
            sessionHelper.SetupGet(x => x.Session).Returns(sessionViewModel);
            sessionHelper.SetupGet(x => x.Version).Returns(new VersionViewModel
            {
                Version = "1",
                Entries = new List<Entry> {
                    new Entry { Name = "tasks", Uri = new Uri("/tasks", UriKind.Relative) },
                    new Entry { Name = "system_scripts", Uri = new Uri("/system_scripts",UriKind.Relative) },
                    new Entry { Name = "eventlog", Uri = new Uri("/eventlog", UriKind.Relative) },
                    new Entry { Name = "system_datastores", Uri = new Uri("/system_datastores", UriKind.Relative) },
                    new Entry { Name = "system_datastore_plugins", Uri = new Uri("/system_datastore_plugins", UriKind.Relative) }
                }
            });

            sessionHelper.SetupGet(x => x.Models).Returns(new List<ModelViewModel>
            {
                new ModelViewModel
                {
                    id = "EA2_800",
                    Uri = new Uri("/models/1", UriKind.Relative)
                }
            });

            List<FileTemplatesViewModel> fileViewModels = GetMockViewModel<List<FileTemplatesViewModel>>("FileViewModel");
            excelTemplateService.Setup(x => x.Get()).Returns(fileViewModels);

            _testingController = new AutomationTasksController(
                modelService.Object,
                taskService.Object,
                automationTaskService.Object,
                excelTemplateService.Object,
                systemScriptService.Object,
                itemService.Object,
                sessionHelper.Object);
        }

        #endregion

        #region tests

        [TestCase]
        public void Can_CreateAutomationTasksController()
        {
            // execute and assert
            Assert.That(() => new AutomationTasksController(
                modelService.Object,
                taskService.Object,
                automationTaskService.Object,
                excelTemplateService.Object,
                systemScriptService.Object,
                itemService.Object), Throws.Nothing);
        }

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

        [TestCase("csv", true)]
        [TestCase("msexcel", true)]
        public void Can_GetDatastore(string pluginname, Boolean isdefault)
        {
            DataStoresViewModel data = new DataStoresViewModel
            {
                datastore_plugin = pluginname,
                is_default = isdefault,
                Uri = new Uri("/system/datastores", UriKind.Relative),
                data_settings = new ModelServerSettings
                {
                    SettingList = new List<Setting>
                        {
                            new Setting
                            {
                                Id = pluginname.Equals("msexcel") ? "template_file" : null
                            }
                        }
                }
            };

            // setup
            automationTaskService.Setup(x => x.GetDatastore(It.IsAny<string>())).Returns(data);

            // execute
            var result = _testingController.GetDatastore("uri");

            // assert 
            Assert.That(result, Is.InstanceOf<PartialViewResult>());
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
                    Uri = new Uri("http://www.ea.com")
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
                    Uri = new Uri("http://www.ea.com")
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

        [Test]
        [ExpectedException(typeof(HttpException))]
        public void VerifyPriviledge_ThrowsHttpException_WhenModelPrivilegeHasNoManageModel()
        {
            // mock
            SessionViewModel sessionViewModel = GetMockViewModel<SessionViewModel>();
            sessionViewModel.ModelPrivileges = new List<ModelPrivilegeViewModel>
            {
                new ModelPrivilegeViewModel
                {
                    model = new Uri("/models/1", UriKind.Relative),
                    Privileges = new PrivilegesForModelViewModel
                    {
                        manage_model = false
                    }
                }
            };
            sessionHelper.SetupGet(x => x.Session).Returns(sessionViewModel);

            TaskViewModel task = new TaskViewModel
            {
                actions = new List<TaskAction>
                {
                    new TaskAction
                    {
                        arguments = new List<Core.ViewModels.Cycle.Argument>
                        {
                            new Core.ViewModels.Cycle.Argument
                            {
                                name = "model",
                                value = "EA2_800"
                            }
                        }
                    }
                }
            };

            // action
            _testingController.VerifyPriviledge(task);
        }

        [TestCase]
        public void Can_CallItemService()
        {
            // mock
            List<ItemViewModel> items = new List<ItemViewModel>
            {
                new ItemViewModel
                {
                    id = "angle123",
                    name = "angle name",
                    Model = new Uri("/models/1", UriKind.Relative),
                    uri = "/models/1/angles/2",
                    displays = new List<ItemDisplayViewModel>
                    {
                        new ItemDisplayViewModel
                        {
                            id = "display123",
                            name = "display name"
                        }
                    }
                }
            };

            itemService.Setup(x => x.Get(It.IsAny<string>())).Returns(items);

            List<string> angleList = new List<string> { "angle123", "angle456", "angle789", "angle123" };
            List<string> modelList = new List<string> { "EA2_800", "IT4IT", "EA2_800" };

            // execute
            List<ItemViewModel> result = _testingController.CallItemService(angleList, modelList);

            // assert
            itemService.Verify(x => x.Get(
                "fq=facetcat_itemtype:(facet_angle facet_template) AND facetcat_models:(EA2_800 IT4IT)&include_facets=false&offset=0&limit=30&caching=false&viewmode=basic&ids=angle123,angle456,angle789"
                ), Times.Once);

            Assert.AreEqual("angle123", result[0].id);
            Assert.AreEqual("angle name", result[0].name);
            Assert.AreEqual("http://th-eatst01.everyangle.org:30500//models/1", result[0].Model.ToString());
            Assert.AreEqual("/models/1/angles/2", result[0].uri.ToString());
            Assert.AreEqual("display123", result[0].displays[0].id);
            Assert.AreEqual("display name", result[0].displays[0].name.ToString());
        }

        [TestCase]
        public void Can_MapAngleDisplayToTaskAction()
        {
            // mock
            List<TaskAction> taskActions = new List<TaskAction>
            {
                new TaskAction
                {
                    arguments = new List<Core.ViewModels.Cycle.Argument>
                    {
                        new Core.ViewModels.Cycle.Argument
                        {
                            name = "angle_id",
                            value = "angle123"
                        },
                        new Core.ViewModels.Cycle.Argument
                        {
                            name = "display_id",
                            value = "display123"
                        },
                        new Core.ViewModels.Cycle.Argument
                        {
                            name = "model",
                            value = "EA2_800"
                        }
                    }
                }
            };
            List<ItemViewModel> items = new List<ItemViewModel>
            {
                new ItemViewModel
                {
                    id = "angle123",
                    name = "angle name",
                    Model = new Uri("/models/1", UriKind.Relative),
                    uri = "/models/1/angles/2",
                    displays = new List<ItemDisplayViewModel>
                    {
                        new ItemDisplayViewModel
                        {
                            id = "display123",
                            name = "display name"
                        }
                    }
                }
            };

            Assert.IsNullOrEmpty(taskActions[0].AngleName);
            Assert.IsNullOrEmpty(taskActions[0].AngleUri);
            Assert.IsNullOrEmpty(taskActions[0].DisplayName);

            // execute
            _testingController.MapAngleDisplayToTaskAction(taskActions, items);

            // assert
            Assert.AreEqual("angle name", taskActions[0].AngleName);
            Assert.AreEqual("/models/1/angles/2", taskActions[0].AngleUri);
            Assert.AreEqual("display name", taskActions[0].DisplayName);
        }

        [TestCase("csv", true)]
        [TestCase("msexcel", true)]
        public void Can_EditDefaultDatastore(string pluginname, Boolean isdefault)
        {
            // setup
            List<DataStoresViewModel> dataStore = new List<DataStoresViewModel>
            {
                new DataStoresViewModel
                {
                    datastore_plugin = pluginname,
                    is_default =isdefault,
                    Uri=new Uri("/system/datastores/6", UriKind.Relative)
                }
            };
            var datastores = new ListViewModel<DataStoresViewModel>();
            datastores.Data = dataStore;
            List<DataStorePluginsViewModel> plugins = new List<DataStorePluginsViewModel>
            {
                new DataStorePluginsViewModel
                {
                    id=pluginname,
                    name=pluginname,
                    supports_append=true,
                    description=pluginname,
                    Uri=new Uri("/system/datastores/6", UriKind.Relative)
                }
            };
            DataStoresViewModel data = new DataStoresViewModel
            {
                datastore_plugin = pluginname,
                is_default = isdefault,
                Uri = new Uri("/system/datastores", UriKind.Relative),
                data_settings = new ModelServerSettings
                {
                    SettingList = new List<Setting>
                        {
                            new Setting
                            {
                                Id = pluginname.Equals("msexcel") ? "template_file" : null
                            }
                        }
                }
            };
            var plugin = new ListViewModel<DataStorePluginsViewModel>();
            plugin.Data = plugins;
            automationTaskService.Setup(x => x.GetDatastore(It.IsAny<string>())).Returns(data);
            automationTaskService.Setup(x => x.GetDatastores(It.IsAny<string>())).Returns(datastores);
            automationTaskService.Setup(x => x.GetDatastorePlugins(It.IsAny<string>())).Returns(plugin);

            // execute
            var result = _testingController.EditDefaultDatastore(pluginname, true);

            //Assert
            Assert.AreEqual(_testingController.ViewBag.DatastorePlugin, pluginname);
            Assert.AreEqual(_testingController.ViewBag.DatastoreDetails, dataStore);
        }

        [TestCase("csv", true)]
        [TestCase("msexcel", true)]
        public void Can_EditDefaultDatastoreCallback(string pluginname, Boolean isdefault)
        {
            //Setup
            List<DataStorePluginsViewModel> plugins = new List<DataStorePluginsViewModel>
            {
                new DataStorePluginsViewModel
                {
                    id=pluginname,
                    name=pluginname,
                    supports_append=true,
                    description=pluginname,
                    Uri=new Uri("/system/datastores/6", UriKind.Relative)
                },
                new DataStorePluginsViewModel
                {
                    id="csv",
                    name="csv",
                    supports_append=true,
                    description=pluginname,
                    Uri=new Uri("/system/datastores/6", UriKind.Relative)
                }
            };
            DataStoresViewModel data = new DataStoresViewModel
            {
                datastore_plugin = pluginname,
                is_default = isdefault,
                Uri = new Uri("/system/datastores", UriKind.Relative),
                data_settings = new ModelServerSettings
                {
                    SettingList = new List<Setting>
                        {
                            new Setting
                            {
                                Id = pluginname.Equals("msexcel") ? "template_file" : null
                            }
                        }
                }
            };
            var plugin = new ListViewModel<DataStorePluginsViewModel>();
            plugin.Data = plugins;
            automationTaskService.Setup(x => x.GetDatastore(It.IsAny<string>())).Returns(data);
            automationTaskService.Setup(x => x.GetDatastorePlugins(It.IsAny<string>())).Returns(plugin);

            //Execute
            JsonResult result = _testingController.EditDefaultDatastoreCallback(data.Uri.ToString(), "", pluginname) as JsonResult;

            //Aseert
            Assert.AreEqual(result.Data, data);
        }

        [TestCase("csv", true)]
        [TestCase("msexcel", true)]
        public void Can_EditDatastore(string pluginname, Boolean isdefault)
        {
            //setup
            List<DataStoresViewModel> dataStore = new List<DataStoresViewModel>
            {
                new DataStoresViewModel
                {
                    datastore_plugin = pluginname,
                    is_default = isdefault,
                    Uri=new Uri("/system/datastores/6", UriKind.Relative)
                }
            };
            var datastores = new ListViewModel<DataStoresViewModel>();
            datastores.Data = dataStore;
            List<DataStorePluginsViewModel> plugins = new List<DataStorePluginsViewModel>
            {
                new DataStorePluginsViewModel
                {
                    id=pluginname,
                    name=pluginname,
                    supports_append=true,
                    description=pluginname,
                    Uri=new Uri("/system/datastores/6", UriKind.Relative)
                }
            };
            DataStoresViewModel data = new DataStoresViewModel
            {
                datastore_plugin = pluginname,
                is_default = isdefault,
                Uri = new Uri("/system/datastores", UriKind.Relative),
                data_settings = new ModelServerSettings
                {
                    SettingList = new List<Setting>
                        {
                            new Setting
                            {
                                Id = pluginname.Equals("msexcel") ? "template_file" : null
                            }
                        }
                }
            };
            var plugin = new ListViewModel<DataStorePluginsViewModel>();
            plugin.Data = plugins;
            automationTaskService.Setup(x => x.GetDatastore(It.IsAny<string>())).Returns(data);
            automationTaskService.Setup(x => x.GetDatastores(It.IsAny<string>())).Returns(datastores);
            automationTaskService.Setup(x => x.GetDatastorePlugins(It.IsAny<string>())).Returns(plugin);

            //Execute
            var result = _testingController.EditDatastore(data.Uri.ToString(), "", pluginname);
        }

        [TestCase]
        public void Can_CheckExecutionTask()
        {
            modelService.ResetCalls();
            string taskUri = "TASK_URI";
            modelService.Setup(x => x.GetTaskHistories(It.IsAny<string>())).Returns(new ListViewModel<TaskHistoryViewModel>
            {
                Data = new List<TaskHistoryViewModel>() { new TaskHistoryViewModel { result = "finished" } }
            });

            // execute
            _testingController.CheckExecutionTask(taskUri);

            // assert
            modelService.Verify(f => f.GetTaskHistories(It.IsAny<string>()), Times.Once);
        }

        [TestCase]
        public void Can_GetHistory()
        {
            modelService.ResetCalls();
            string taskUri = "TASK_URI";
            modelService.Setup(x => x.GetTaskHistories(It.IsAny<string>())).Returns(new ListViewModel<TaskHistoryViewModel>
            {
                Data = new List<TaskHistoryViewModel>() { new TaskHistoryViewModel { result = "finished" } }
            });

            // execute
            _testingController.GetHistory(taskUri);

            // assert
            modelService.Verify(f => f.GetTaskHistories(It.IsAny<string>()), Times.Once);

        }

        [TestCase]
        public void Can_ExecuteTaskAction()
        {
            string task = "{}";
            modelService.Setup(x => x.CreateTask(It.IsAny<string>(), It.IsAny<string>())).Returns(new TaskViewModel());

            // execute
            _testingController.ExecuteTaskAction(task);

            // assert
            modelService.Verify(f => f.CreateTask(It.IsAny<string>(), It.IsAny<string>()), Times.Once);

        }

        [TestCase]
        public void Can_EditTask_SetUserIdAndCanScheduleAngles()
        {
            //arrange.
            SessionViewModel sessionViewModel = new SessionViewModel {
                SystemPrivileges = new SystemPrivilegeViewModel
                {
                    manage_system = true,
                    schedule_angles = true
                }
            };
            sessionHelper.SetupGet(x => x.Session).Returns(sessionViewModel);

            List<SystemScriptViewModel> scripts = new List<SystemScriptViewModel>
            {
                new SystemScriptViewModel()
                {
                    filetype = "test",
                    name = "test",
                    id = "test"
                }
            };
            List<DataStoresViewModel> dataStore = new List<DataStoresViewModel>
            {
                new DataStoresViewModel
                {
                    datastore_plugin = "test",
                    is_default = true,
                    Uri=new Uri("/system/datastores/6", UriKind.Relative)
                }
            };
            var datastores = new ListViewModel<DataStoresViewModel>();
            datastores.Data = dataStore;
            List<DataStorePluginsViewModel> plugins = new List<DataStorePluginsViewModel>
            {
                new DataStorePluginsViewModel
                {
                    id="test",
                    name="test",
                    supports_append=true,
                    description="test",
                    Uri=new Uri("/system/datastores/6", UriKind.Relative)
                }
            };
            DataStoresViewModel data = new DataStoresViewModel
            {
                datastore_plugin = "test",
                is_default =true,
                Uri = new Uri("/system/datastores", UriKind.Relative)
            };
            var plugin = new ListViewModel<DataStorePluginsViewModel>();
            plugin.Data = plugins;
            automationTaskService.Setup(x => x.GetDatastore(It.IsAny<string>())).Returns(data);
            automationTaskService.Setup(x => x.GetDatastores(It.IsAny<string>())).Returns(datastores);
            automationTaskService.Setup(x => x.GetDatastorePlugins(It.IsAny<string>())).Returns(plugin);
            systemScriptService.Setup(x => x.GetSystemScripts(It.IsAny<string>())).Returns(scripts);

            //act.
            var result = _testingController.EditTask(It.IsAny<string>(), It.IsAny<string>());

            //assert.
            Assert.AreEqual(_testingController.ViewBag.UserId, "testing_user");
            Assert.AreEqual(_testingController.ViewBag.CanScheduleAngles, true);
        }

        [TestCase]
        public void Can_SaveAutomateTask_IfUserHasCanManageSystemPrivilege()
        {
            //arrange.
            taskService.ResetCalls();
            var taskUri = @"https://test.com:9080//tasks/20";
            taskService.Setup(m => m.UpdateTask(It.IsAny<TaskViewModel>(), false)).Returns(new TaskViewModel() { Uri = new Uri(taskUri) });

            //act.
            var result = _testingController.SaveAutomateTask(taskUri, TestData(), "[]");

            //assert
            taskService.Verify(m => m.UpdateTask(It.IsAny<TaskViewModel>(), false), Times.Once);
            taskService.Verify(m => m.CreateTaskAction(It.IsAny<string>(), It.IsAny<TaskAction>()), Times.Once);
        }

        [TestCase]
        public void Can_SaveAutomateTask_OwnerOfTheTask_UserWithCanScheduleAnglesPrivilege()
        {
            //arrange.
            taskService.ResetCalls();
            var taskUri = @"https://test.com:9080//tasks/21";
            SessionViewModel sessionViewModel = GetMockViewModel<SessionViewModel>();
            sessionViewModel.SystemPrivileges.manage_system = false;
            sessionViewModel.SystemPrivileges.schedule_angles = true;
            sessionHelper.SetupGet(x => x.Session).Returns(sessionViewModel);
            var userViewModel = new UserViewModel
            {
                Id = "local\\test",
                Uri = new Uri("/users/1", UriKind.Relative)
            };
            sessionHelper.SetupGet(x => x.CurrentUser).Returns(userViewModel);
            taskService.Setup(m => m.UpdateTask(It.IsAny<TaskViewModel>(), false)).Returns(new TaskViewModel() { Uri = new Uri(taskUri) });

            //act.
            var result = _testingController.SaveAutomateTask(taskUri, TestData(), "[]");

            //assert
            taskService.Verify(m => m.UpdateTask(It.IsAny<TaskViewModel>(), false), Times.Once);
            taskService.Verify(m => m.CreateTaskAction(It.IsAny<string>(), It.IsAny<TaskAction>()), Times.Once);
        }

        [TestCase]
        public void Can_SaveAutomateTask_SaveActionOnly_UserWithCanScheduleAnglesPrivilege()
        {
            //arrange.
            taskService.ResetCalls();
            var taskUri = @"https://test.com:9080//tasks/22";
            SessionViewModel sessionViewModel = GetMockViewModel<SessionViewModel>();
            sessionViewModel.SystemPrivileges.manage_system = false;
            sessionViewModel.SystemPrivileges.schedule_angles = true;
            sessionHelper.SetupGet(x => x.Session).Returns(sessionViewModel);
            taskService.Setup(m => m.UpdateTask(It.IsAny<TaskViewModel>(), true)).Returns(new TaskViewModel() { Uri = new Uri(taskUri) });

            //act.
            var result = _testingController.SaveAutomateTask(taskUri, TestData(), "[]");

            //assert
            taskService.Verify(m => m.UpdateTask(It.IsAny<TaskViewModel>(), false), Times.Never);
            taskService.Verify(m => m.CreateTaskAction(It.IsAny<string>(), It.IsAny<TaskAction>()), Times.Once);
        }

        private string TestData()
        {
           return "{\"name\":\"new_task_updated\",\"delete_after_completion\":false,\"run_as_user\":\"local\\\\test\",\"actions\":[{\"run_as_user\":\"local\\\\test\",\"action_type\":\"export_angle_to_datastore\",\"arguments\":[{\"name\":\"datastore\",\"value\":\"Export_to_Excel_Default\"},{\"name\":\"model\",\"value\":\"EA2_800\"},{\"name\":\"angle_id\",\"value\":\"ea747c6de36f3a4db9a4b5026c74f7ffce\"},{\"name\":\"display_id\",\"value\":\"eae6ee8cca45f94a72b3520668648f8c93\"},{\"name\":\"model_timestamp_index\",\"value\":1},{\"name\":\"header_format\",\"value\":\"id\"},{\"name\":\"enum_format\",\"value\":\"id\"},{\"name\":\"max_rows_to_export\",\"value\":-1},{\"name\":\"file_name\",\"value\":\"{anglename:normalized}\"},{\"name\":\"template_file\",\"value\":\"EveryAngle-Standard.xlsx\"},{\"name\":\"sheet_name\",\"value\":\"{displayname:normalized}\"},{\"name\":\"include_techinfo\",\"value\":true},{\"name\":\"add_angle_summary\",\"value\":false},{\"name\":\"add_angle_definition\",\"value\":false},{\"name\":\"abort_task_when_error\",\"value\":false}],\"approval_state\":\"enabled\",\"notification\":null,\"order\":3}],\"enabled\":true,\"max_run_time\":9000,\"actions_uri\":\"https:\\test.com:9080\tasks\\/20\actions\",\"triggers\":[{\"days\":[{\"day\":0,\"active\":false},{\"day\":1,\"active\":false},{\"day\":2,\"active\":false},{\"day\":3,\"active\":false},{\"day\":4,\"active\":false},{\"day\":5,\"active\":false},{\"day\":6,\"active\":false}],\"trigger_type\":\"schedule\",\"continuous\":false,\"frequency\":\"Weekly\",\"start_time\":5400}]}";
        }

        [TestCase]
        public void Can_GetDatastoreDetails()
        {
            //setup
            List<DataStoresViewModel> dataStore = new List<DataStoresViewModel>
            {
                new DataStoresViewModel
                {
                    datastore_plugin = "msexcel",
                    is_default =true,
                    Uri=new Uri("/system/datastores/6", UriKind.Relative)
                }
            };
            var datastores = new ListViewModel<DataStoresViewModel>();
            datastores.Data = dataStore;
            List<DataStorePluginsViewModel> plugins = new List<DataStorePluginsViewModel>
            {
                new DataStorePluginsViewModel
                {
                    id="msexcel",
                    name="msexcel_test",
                    supports_append=true,
                    description="msexcel",                    
                    Uri=new Uri("/system/datastores/6", UriKind.Relative)
                }
            };
            var plugin = new ListViewModel<DataStorePluginsViewModel>();
            plugin.Data = plugins;
            DataStoresViewModel data = new DataStoresViewModel
            {
                datastore_plugin = "msexcel",
                is_default = true,
                data_settings = new ModelServerSettings()
                {
                    SettingList = new List<Setting>
                        {
                            new Setting()
                            {
                                Id="template_file",
                                Value="EveryAngle-Test.xlsx"
                            }
                        }
                },
                Uri = new Uri("/system/datastores", UriKind.Relative)
            };
            automationTaskService.Setup(x => x.GetDatastore(It.IsAny<string>())).Returns(data);
            automationTaskService.Setup(x => x.GetDatastores(It.IsAny<string>())).Returns(datastores);
            automationTaskService.Setup(x => x.GetDatastorePlugins(It.IsAny<string>())).Returns(plugin);
            // execute
            JsonResult result = _testingController.GetDatastoreDetails("EveryAngle-Test.xlsx") as JsonResult;

            //Assert
            List<DataStoresViewModel> resultData = result.Data as List<DataStoresViewModel>;
            Assert.AreEqual(resultData[0], data);

        }
        #endregion
    }
}