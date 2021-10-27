using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels;
using EveryAngle.Core.ViewModels.Cycle;
using EveryAngle.Core.ViewModels.DataStore;
using EveryAngle.Core.ViewModels.Item;
using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Core.ViewModels.Privilege;
using EveryAngle.ManagementConsole.Helpers;
using EveryAngle.Shared.Globalization;
using EveryAngle.Shared.Helpers;
using EveryAngle.WebClient.Domain.Constants;
using EveryAngle.WebClient.Domain.Enums;
using EveryAngle.WebClient.Service.HttpHandlers;
using EveryAngle.WebClient.Service.Security;
using Kendo.Mvc.UI;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using RestSharp;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;
using UrlHelper = EveryAngle.Shared.Helpers.UrlHelper;

namespace EveryAngle.ManagementConsole.Controllers
{
    public class AutomationTasksController : BaseController
    {
        #region private variables

        private readonly IAutomationTaskService _automationTaskService;
        private readonly IFileTemplateService _fileTemplateService;
        private readonly IModelService _modelService;
        private readonly ITaskService _taskService;
        private readonly ISystemScriptService _systemScriptService;
        private readonly IItemService _itemService;

        #endregion

        #region constructors

        // testsability only 
        public AutomationTasksController(
           IModelService modelService,
           ITaskService taskService,
           IAutomationTaskService automationTaskService,
           IFileTemplateService fileTemplateService,
           ISystemScriptService systemScriptService,
           IItemService itemService,
           SessionHelper sessionHelper)
        {
            SessionHelper = sessionHelper;
            _modelService = modelService;
            _taskService = taskService;
            _automationTaskService = automationTaskService;
            _fileTemplateService = fileTemplateService;
            _systemScriptService = systemScriptService;
            _itemService = itemService;
        }

        public AutomationTasksController(
            IModelService modelService,
            ITaskService tasklService,
            IAutomationTaskService automationTaskService,
            IFileTemplateService fileTemplateService,
            ISystemScriptService systemScriptService,
            IItemService itemService)
        {
            _modelService = modelService;
            _taskService = tasklService;
            _automationTaskService = automationTaskService;
            _fileTemplateService = fileTemplateService;
            _systemScriptService = systemScriptService;
            _itemService = itemService;
        }

        #endregion

        #region routes

        public ActionResult GetAllTasks()
        {
            ViewBag.TasksUri = SessionHelper.Version.GetEntryByName("tasks").Uri.ToString();
            ViewBag.TaskHistoryUri = SessionHelper.Version.GetEntryByName("eventlog").Uri.ToString();
            return PartialView("~/Views/AutomationTasks/Tasks/AllTasks.cshtml");
        }

        public ActionResult GetTasksGrid(string tasksUri, string q = "")
        {
            ViewData["DefaultPageSize"] = DefaultPageSize;
            ViewBag.TasksUri = tasksUri;
            ViewBag.ManageSystemPrivilege = Convert.ToString(SessionHelper.Session.IsValidToManageSystemPrivilege()).ToLowerInvariant();
            ViewBag.CanScheduleAngles = Convert.ToString(SessionHelper.Session.IsValidToScheduleAngles()).ToLowerInvariant();
            ViewBag.UserId = SessionHelper.CurrentUser.Id.Replace("\\", "\\\\");

            ViewBag.Query = q;
            return PartialView("~/Views/AutomationTasks/Tasks/TasksGrid.cshtml");
        }

        public ActionResult ReadTasksGrid([DataSourceRequest] DataSourceRequest request, string tasksUri, string q = "")
        {
            string fullTasksUri = string.Format("{0}?types=export_angle_to_datastore,run_external_command&{1}{2}", tasksUri, OffsetLimitQuery, string.IsNullOrEmpty(q) ? "" : "&q=" + q);
            fullTasksUri += GetTaskQueryString(request);
            var tasks = _taskService.GetTasks(fullTasksUri);

            return Json(new DataSourceResult
            {
                Data = tasks,
                Total = tasks.Count
            }, JsonRequestBehavior.AllowGet);
        }

        private string GetTaskQueryString(DataSourceRequest request)
        {
            string query = string.Empty;
            if (request != null && request.Sorts != null && request.Sorts.Count > 0)
            {
                string sortingKey = request.Sorts[0].Member;
                Dictionary<string, string> sorting = new Dictionary<string, string>
                {
                    { "name", "name" },
                    { "run_as_user", "run_as_user" },
                    { "enabled", "enabled" },
                    { "action_count", "action_count" },
                    { "trigger_type", "trigger_type" }
                };

                if (sorting.ContainsKey(sortingKey))
                {
                    string sortDirection = request.Sorts[0].SortDirection == ListSortDirection.Descending ? "desc" : "asc";
                    query += string.Format("&sort={0}&dir={1}", sorting[sortingKey], sortDirection);
                }
            }
            return query;
        }


        public ActionResult GetTasksHistory(string taskHistoryUri)
        {
            ViewData["DefaultPageSize"] = DefaultPageSize;
            ViewBag.TaskHistoryUri = taskHistoryUri;
            return PartialView("~/Views/AutomationTasks/Tasks/TasksHistoryGrid.cshtml");
        }

        public ActionResult GetTasksHistoryByCorrelationId(string taskHistoryUri)
        {
            var tasksHistory =
                _modelService.GetTaskHistories(taskHistoryUri + "&" +
                                              UtilitiesHelper.GetOffsetLimitQueryString(1, MaxPageSize));
            tasksHistory.Data = tasksHistory.Data.OrderBy(x => x.id).ToList();
            var tasksHistoryJson = JsonConvert.SerializeObject(tasksHistory);

            return new ContentResult { Content = tasksHistoryJson, ContentType = "application/json" };
        }

        public ActionResult GetTaskHistory(string detailUri)
        {
            var taskHistory = _modelService.GetTaskHistory(detailUri);
            ViewBag.TaskHistoryDetails = EventLogHelper.GetTreeViewItemModelList(taskHistory.details);
            ViewBag.TaskHistoryArguments = new List<TreeViewItemModel>
            {
                new TreeViewItemModel
                {
                    Text = "task_arguments",
                    Items = EventLogHelper.GetTreeViewItemModelList(JToken.FromObject(taskHistory.arguments.ToDictionary(a => a.name, a => a.value)))
                }
            };
            return PartialView("~/Views/AutomationTasks/Tasks/DetailsAndArgumentsSection.cshtml", taskHistory);
        }

        public ActionResult ReadAutomationTasksHistories([DataSourceRequest] DataSourceRequest request,
            string taskHistoryUri)
        {
            string fullTaskHistoryUri = string.Format("{0}?types=export_angle_to_datastore,run_external_command&filterMode=task_results&{1}", taskHistoryUri, OffsetLimitQuery);
            ListViewModel<TaskHistoryViewModel> alltasksHistory = _taskService.GetTaskHistories(fullTaskHistoryUri);
            return Json(new DataSourceResult
            {
                Data = alltasksHistory.Data,
                Total = alltasksHistory.Header.Total
            });
        }

        /// <summary>
        /// Create/Edit task
        /// </summary>
        /// <param name="tasksUri">empty means create</param>
        /// <param name="angleUri">This will come from WC</param>
        /// <returns></returns>
        public ActionResult EditTask(string tasksUri, string angleUri)
        {
            bool canManageSystem = SessionHelper.Session.IsValidToManageSystemPrivilege();
            bool canScheduleAngles = SessionHelper.Session.IsValidToScheduleAngles();

            // task
            TaskViewModel task = GetTask(tasksUri);

            // datastore
            List<DataStoresViewModel> dataStores = GetAllDataStores();

            // set is_file_based based on plugin to datastores
            SetPluginToDataStores(dataStores);

            // create model datasource
            List<ModelViewModel> allModels = SessionHelper.Models;
            List<SelectListItem> models = new List<SelectListItem>();
            foreach (ModelViewModel item in allModels)
            {
                SelectListItem model = new SelectListItem
                {
                    Text = item.long_name,
                    Value = item.id
                };
                models.Add(model);
            }

            ViewBag.TasksUri = tasksUri;
            ViewBag.TasksActionsUri = tasksUri + "/actions";
            ViewBag.IsTaskOwner = task.run_as_user == SessionHelper.CurrentUser.Id;
            ViewBag.DefaultApprovalState = SessionHelper.SystemSettings.default_approval_state;

            ViewData["AngleUri"] = angleUri;
            ViewData["DataStores"] = GetDataStoresDataSource(dataStores);
            ViewData["Scripts"] = GetScriptsDataSource();
            ViewData["CanManageSystem"] = canManageSystem;
            ViewData["CanScheduleAngles"] = canScheduleAngles;
            ViewData["ModelPrivileges"] = SessionHelper.Session.ModelPrivileges;
            ViewData["TaskData"] = JsonConvert.SerializeObject(task);
            ViewData["TaskCreator"] = task.created == null ? SessionHelper.CurrentUser.Uri.ToString() : task.created.Uri.ToString();

            // use for model dropdown list
            ViewData["AllModel"] = models;

            // use for checking priviledge
            ViewData["AllModels"] = allModels;
            ViewBag.TaskHistoryUri = SessionHelper.Version.GetEntryByName("eventlog").Uri.ToString();
            ViewBag.UserId = SessionHelper.CurrentUser.Id.Replace("\\", "\\\\");
            return PartialView("~/Views/AutomationTasks/Tasks/TaskDetail.cshtml");
        }

        /// <summary>
        /// Extend task action info
        /// </summary>
        /// <param name="tasksUri"></param>
        /// <returns></returns>
        public ActionResult GetTaskAction(string tasksUri)
        {
            List<TaskAction> taskActions = new List<TaskAction>();
            if (!string.IsNullOrEmpty(tasksUri))
            {
                taskActions = _modelService.GetActionsTask(string.Format("{0}/actions?{1}", tasksUri, OffsetLimitQuery));

                List<ItemViewModel> items = GetItemViewModels(taskActions);

                MapAngleDisplayToTaskAction(taskActions, items);
            }

            return Content(JsonConvert.SerializeObject(taskActions), "application/json");
        }

        [AcceptVerbs(HttpVerbs.Get)]
        public ActionResult VerifyModelPriviledge(string taskUri)
        {
            TaskViewModel task = GetTask(taskUri);
            VerifyPriviledge(task);
            return new JsonResult
            {
                Data = new
                {
                    success = true,
                    parameters = new { tasksUri = taskUri }
                },
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult CopyTask(string taskUri, string taskName)
        {
            TaskViewModel task = GetTask(taskUri);
            VerifyPriviledge(task);

            task.name = taskName;
            string createTaskUri = SessionHelper.Version.GetEntryByName("tasks").Uri.ToString();
            task = _taskService.CreateTask(createTaskUri, task);

            return new JsonResult
            {
                Data = new
                {
                    success = true,
                    message = Resource.MC_ItemSuccesfullyUpdated,
                    parameters = new { tasksUri = task.Uri.ToString() }
                },
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult CheckTaskAction(string taskUri, string ActionData)
        {
            return new ContentResult
            {
                Content = _automationTaskService.CheckTaskAction(taskUri, ActionData),
                ContentType = "text/html"
            };
        }

        public ActionResult RenderDataStoresPage()
        {
            var version = SessionHelper.Version;
            ViewBag.DatastoreUri = version.GetEntryByName("system_datastores").Uri.ToString();
            ViewBag.DatastorePlugins = GetDatastorePlugins(false);
            return PartialView("~/Views/AutomationTasks/DataStores/AllDataStores.cshtml");
        }

        public ActionResult GetFilterDataStores(string dataStoresUri,
            List<Tuple<string, string, string, bool?>> datastorePlugins, string q = "")
        {
            ViewBag.Query = q;
            ViewData["DefaultPageSize"] = MaxPageSize;
            ViewBag.DatastorePlugins = datastorePlugins;
            return PartialView("~/Views/AutomationTasks/DataStores/DataStoresGrid.cshtml");
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult ReadAutomationTasks([DataSourceRequest] DataSourceRequest request, string dataStoresUri,
            string datastorePlugins, string q = "")
        {
            var dataStores =
                _automationTaskService.GetDatastores(dataStoresUri + "?" +
                                                    UtilitiesHelper.GetOffsetLimitQueryString(request.Page,
                                                        request.PageSize, q) + PageHelper.GetQueryString(request, QueryString.Datastores));
            var pluginsData = JsonConvert.DeserializeObject<List<Tuple<string, string, string, bool?>>>(datastorePlugins);
            dataStores.Data.ForEach(dataStore =>
            {
                dataStore.plugin_name =
                    pluginsData.FirstOrDefault(x => x.Item3 == dataStore.datastore_plugin).Item2;
                dataStore.supports_append =
                    pluginsData.FirstOrDefault(x => x.Item3 == dataStore.datastore_plugin).Item4;
            });

            var result = new DataSourceResult
            {
                Data = dataStores.Data,
                Total = dataStores.Header.Total
            };
            return Json(result);
        }

        public ActionResult EditDatastore(string datastoreUri, string pluginUri, string plugin)
        {
            DataStoresViewModel dataStore = GetDataStoreViewModel(datastoreUri, pluginUri, plugin);
            ViewBag.DatastoreDetails = GetAllDatastore(plugin);
            ViewBag.isSupportAutomateTask = true;
            return PartialView("~/Views/AutomationTasks/DataStores/EditDatastore.cshtml", dataStore);
        }

        public ActionResult EditDefaultDatastore(string plugin,bool AutomationTask)
        {
            List<DataStoresViewModel> dataStores = GetAllDatastore(plugin,AutomationTask);
            ViewBag.DatastoreDetails = dataStores;
            ViewBag.isSupportAutomateTask = AutomationTask;
            DataStoresViewModel defaultDataStore = dataStores.FirstOrDefault(x => x.is_default);
            DataStoresViewModel dataStore = GetDataStoreViewModel(defaultDataStore.Uri.ToString(), "", defaultDataStore.datastore_plugin);
            return PartialView("~/Views/AutomationTasks/DataStores/EditDatastore.cshtml", dataStore);
        }
        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult EditDefaultDatastoreCallback(string datastoreUri, string pluginUri, string plugin)
        {
            DataStoresViewModel dataStore = GetDataStoreViewModel(datastoreUri, pluginUri, plugin);
            return new JsonResult
            {
                Data = dataStore
            };
        }
        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult GetDatastoreDetails(string fileName)
        {
            List<DataStoresViewModel> excelDatastore = GetAllDatastore("msexcel");
            List<DataStoresViewModel> excelDatastores = new List<DataStoresViewModel>();
            foreach(DataStoresViewModel datastore in excelDatastore)
            {
                DataStoresViewModel dataStoreDetails = GetDataStoreViewModel(datastore.Uri.ToString(),"", "msexcel");
                string templatefile = dataStoreDetails.data_settings.SettingList.FirstOrDefault(x => x.Id.Equals("template_file")).Value.ToString();
                if (templatefile.Equals(fileName))
                {
                    excelDatastores.Add(dataStoreDetails);
                }
            }
            return new JsonResult
            {
                Data = excelDatastores
            };
        }
        public ActionResult GetDatastore(string datstoreUri)
        {
            var datastore = _automationTaskService.GetDatastore(datstoreUri);
            if (datastore.datastore_plugin.Equals("msexcel"))
            {
                AddFileDetailsToDatastore(datastore);
            }
            return PartialView("~/Views/AutomationTasks/Tasks/DatastoreSettings.cshtml", datastore);
        }

        public DataStorePluginsViewModel GetDatastorePlugin(string pluginUri)
        {
            var datastorePlugin = _automationTaskService.GetDatastorePlugin(pluginUri);
            return datastorePlugin;
        }

        public List<Tuple<string, string, string, bool?>> GetDatastorePlugins(bool isWriteOnly)
        {
            var version = SessionHelper.Version;
            var dataStoresPluginsUri = version.GetEntryByName("system_datastore_plugins").Uri.ToString();
            var plugins = _automationTaskService.GetDatastorePlugins(dataStoresPluginsUri);
            var pluginsData = new List<Tuple<string, string, string, bool?>>();

            if (isWriteOnly)
            {
                plugins.Data = plugins.Data.Where(filter => filter.supports_write == isWriteOnly).ToList();
            }

            foreach (var plugin in plugins.Data)
            {
                pluginsData.Add(Tuple.Create(plugin.Uri.ToString(), plugin.description, plugin.id,
                    plugin.supports_append));
            }
            return pluginsData;
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult SaveDatastore(bool isNewDatastore, string datastoreUri, string datastoreData)
        {
            DataStoresViewModel datastore;
            if (isNewDatastore)
            {
                string createDatastoreUri = SessionHelper.Version.GetEntryByName("system_datastores").Uri.ToString();
                datastore = _automationTaskService.CreateDataStore(createDatastoreUri, datastoreData);
            }
            else
            {
                datastore = _automationTaskService.UpdateDataStore(datastoreUri, datastoreData);
            }
            return new JsonResult
            {
                Data =
                    new
                    {
                        success = true,
                        message = Resource.MC_ItemSuccesfullyUpdated,
                        parameters =
                            new
                            {
                                datastoreUri = datastore.Uri.ToString(),
                                pluginUri = "",
                                plugin = datastore.datastore_plugin
                            }
                    },
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        [AcceptVerbs(HttpVerbs.Delete)]
        public void DeleteDataStore(string datastoreUri)
        {
            _automationTaskService.DeleteDataStore(datastoreUri);
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult ExecuteTask(string tasksUri, string data)
        {
            string executeTasksUri = $"{tasksUri}/execution";
            _modelService.CreateTask(executeTasksUri, data);

            return new JsonResult
            {
                Data = new { success = true, message = Resource.MC_ItemSuccesfullyUpdated },
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        [AcceptVerbs(HttpVerbs.Get)]
        public ContentResult FindAngle(string angleUri, bool canSeeScheduledtasks)
        {
            return Content(GetAngle(angleUri, canSeeScheduledtasks).ToString(), "application/json");
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public JObject TestDataStoreConnection(string testconnectionUri, string jsonData)
        {
            var requestManager = RequestManager.Initialize(testconnectionUri);

            return requestManager.Run(Method.POST, jsonData);
        }

        [ValidateInput(false)]
        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult SaveAutomateTask(string taskUri, string taskData, string deleteActionData)
        {
            TaskViewModel task = JsonConvert.DeserializeObject<TaskViewModel>(taskData);
            if (string.IsNullOrEmpty(taskUri))
            {
                string createTaskUri = SessionHelper.Version.GetEntryByName("tasks").Uri.ToString();
                task = _taskService.CreateTask(createTaskUri, task);
            }
            else
            {
                // add or update actions
                if (task.actions != null)
                {
                    foreach (TaskAction action in task.actions)
                    {
                        if (action.Uri != null)
                        {
                            _taskService.UpdateTaskAction(action);
                        }
                        else
                        {
                            string createActionUri = task.ActionsUri.AbsolutePath.TrimStart('/');
                            _taskService.CreateTaskAction(createActionUri, action);
                        }
                    }
                }

                // delate action
                List<string> deleteActions = JsonConvert.DeserializeObject<List<string>>(deleteActionData);
                foreach (string actionUri in deleteActions)
                {
                    _taskService.DeleteTaskAction(actionUri);
                }

                if (CanUpdateTask(task))
                {
                    //update task itself without "actions"
                    task.Uri = new Uri(taskUri);
                    task = _taskService.UpdateTask(task, false);
                }
                else
                {
                    task.Uri = new Uri(taskUri);
                }
            }

            return new JsonResult
            {
                Data = new
                {
                    success = true,
                    message = Resource.MC_ItemSuccesfullyUpdated,
                    parameters = new { tasksUri = task.Uri.ToString() }
                },
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        [AcceptVerbs(HttpVerbs.Delete)]
        public void DeleteTask(string taskUri)
        {
            _automationTaskService.DeleteDataStore(taskUri);
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult ExecuteTaskAction(string task)
        {
            string tasksUri = SessionHelper.Version.GetEntryByName("tasks").Uri.ToString();
            TaskViewModel result = _modelService.CreateTask(tasksUri, task);
            return Json(result, JsonRequestBehavior.AllowGet);
        }

        public ActionResult CheckExecutionTask(string uri)
        {
            TaskHistoryViewModel history = _modelService.GetTaskHistories(uri).Data.FirstOrDefault(f => (f.result.Equals(TaskStatus.Finished.ToString(), StringComparison.InvariantCultureIgnoreCase)
                                                                                                      || f.result.Equals(TaskStatus.Failed.ToString(), StringComparison.InvariantCultureIgnoreCase)));
            return Json(history, JsonRequestBehavior.AllowGet);
        }

        public ActionResult GetHistory(string eventlogUri)
        {
            TaskHistoryViewModel history = _modelService.GetTaskHistories(eventlogUri).Data.FirstOrDefault(w => !string.IsNullOrEmpty(w.correlation_id));
            return Json(history, JsonRequestBehavior.AllowGet);
        }

        public string GetDataStoresUri()
        {
            return string.Format("{0}?{1}", SessionHelper.Version.GetEntryByName("system_datastores").Uri.ToString(), OffsetLimitQuery);
        }

        #endregion

        #region private methods

        private bool CanUpdateTask(TaskViewModel task)
        {
            var isTaskOwner = task.run_as_user == SessionHelper.CurrentUser.Id;
            var canScheduleAngles = SessionHelper.Session.IsValidToScheduleAngles();
            var canManageSystem = SessionHelper.Session.IsValidToManageSystemPrivilege();
            var result = canManageSystem || (canScheduleAngles && isTaskOwner);
            return result;
        }

        private JObject GetAngle(string angleUri, bool canSeeScheduledtasks = true)
        {
            var userSettings = SessionHelper.GetUserSettings();
            var userLanguage = string.IsNullOrEmpty(userSettings.default_language) ? "en" : userSettings.default_language;
            var angleUrl = string.Format("{0}?lang={1}&can_see_scheduled_tasks={2}", UrlHelper.GetRequestUrl(URLType.NOA) + angleUri, userLanguage, canSeeScheduledtasks);
            var requestManager = RequestManager.Initialize(angleUrl);
            JObject output = requestManager.Run();
            var model = SessionHelper.GetModel(UrlHelper.GetRequestUrl(URLType.NOA) + output.SelectToken("model"));
            if (model != null)
            {
                output.Add("modelId", model.id);
            }
            return output;
        }

        private List<DataStoresViewModel> GetAllDataStores()
        {
            List<DataStoresViewModel> dataStores = _automationTaskService.GetDatastores(GetDataStoresUri()).Data.ToList();
            return dataStores;
        }

        private void SetPluginToDataStores(List<DataStoresViewModel> dataStores)
        {
            // plugin
            string dataStorePluginUri = SessionHelper.Version.GetEntryByName("system_datastore_plugins").Uri.ToString();
            ListViewModel<DataStorePluginsViewModel> dataStorePlugin = _automationTaskService.GetDatastorePlugins(dataStorePluginUri);
            foreach (DataStoresViewModel item in dataStores)
            {
                var relatedPlugin = dataStorePlugin.Data.FirstOrDefault(x => x.id == item.datastore_plugin);
                if (relatedPlugin != null)
                    item.is_file_based = relatedPlugin.is_file_based;
            }
        }

        private static List<DataStoresViewModel> GetDataStoresDataSource(List<DataStoresViewModel> dataStores)
        {
            List<DataStoresViewModel> availableDataStores = dataStores.OrderBy(datastore => datastore.name).ToList();
            availableDataStores.Insert(0, new DataStoresViewModel
            {
                id = "",
                name = Resource.PleaseSelect
            });
            return availableDataStores;
        }

        private List<DataStoresViewModel> GetAllDatastore(string plugin,bool AutomationTask=true)
        {
            List<DataStoresViewModel> dataStore = GetAllDataStores();
            List<DataStoresViewModel> data = AutomationTask ? dataStore.FindAll(x => x.datastore_plugin == plugin) : dataStore.FindAll(x => x.datastore_plugin == plugin && x.is_default);
            return data;
        }

        private List<SystemScriptViewModel> GetScriptsDataSource()
        {
            string scriptUri = SessionHelper.Version.GetEntryByName("system_scripts").Uri.ToString();
            List<SystemScriptViewModel> scripts = _systemScriptService.GetSystemScripts(scriptUri);
            scripts.Insert(0, new SystemScriptViewModel
            {
                id = "",
                name = Resource.PleaseSelect
            });
            return scripts;
        }

        private DataStoresViewModel GetDataStoreViewModel(string datastoreUri, string pluginUri, string plugin)
        {
            DataStoresViewModel dataStore = new DataStoresViewModel();
            DataStorePluginsViewModel datastorePlugin = string.IsNullOrEmpty(pluginUri) ? null : GetDatastorePlugin(pluginUri);
            IList<Tuple<string, string, string, bool?>> datastorePlugins = new List<Tuple<string, string, string, bool?>>();

            if (!string.IsNullOrEmpty(datastoreUri))
            {
                dataStore = _automationTaskService.GetDatastore(datastoreUri);

                if (datastorePlugin != null)
                {
                    dataStore.supports_append = datastorePlugin.supports_append;
                }
                else
                {
                    datastorePlugins = GetDatastorePlugins(false);
                    dataStore.supports_append = datastorePlugins.FirstOrDefault(x => x.Item3 == plugin).Item4;
                }
            }
            else if (datastorePlugin != null)
            {
                dataStore.datastore_plugin = datastorePlugin.id;
                dataStore.supports_write = datastorePlugin.supports_write;
                dataStore.connection_settings = datastorePlugin.connection_settings_template;
                dataStore.data_settings = datastorePlugin.data_settings_template;
                dataStore.supports_append = datastorePlugin.supports_append;
            }

            if (dataStore.datastore_plugin.Equals("msexcel"))
            {
                AddFileDetailsToDatastore(dataStore);
            }

            ClearConnectionPasswordValue(dataStore);

            #region view bags
            ViewBag.DatastorePlugin = datastorePlugin != null
                ? datastorePlugin.description
                : datastorePlugins.FirstOrDefault(x => x.Item3 == plugin).Item2;
            ViewBag.PluginUri = datastorePlugin != null
                ? datastorePlugin.Uri.ToString()
                : datastorePlugins.FirstOrDefault(x => x.Item3 == plugin).Item1;
            ViewBag.DatastoreUri = dataStore.id != null ? dataStore.Uri.ToString() : datastoreUri;
            #endregion

            return dataStore;
        }

        private void AddFileDetailsToDatastore(DataStoresViewModel datastore)
        {
            datastore.data_settings.SettingList.Find(x => x.Id == "template_file").FileDataOptions = _fileTemplateService.Get().ToList();
        }

        internal void ClearConnectionPasswordValue(DataStoresViewModel dataStore)
        {
            if (dataStore.connection_settings != null && dataStore.connection_settings.SettingList != null)
            {
                Setting connectionPassword = dataStore.connection_settings.SettingList
                                            .FirstOrDefault(x => DatastoreSettingConstant.ConnectionPasswordId.Equals(x.Id));

                if (connectionPassword != null)
                    connectionPassword.Value = string.Empty;
            }

        }

        /// <summary>
        /// Get task info
        /// </summary>
        /// <param name="taskUri">empty taskUri means new task</param>
        /// <returns></returns>
        private TaskViewModel GetTask(string taskUri)
        {
            TaskViewModel task;
            if (string.IsNullOrEmpty(taskUri))
            {
                task = new TaskViewModel
                {
                    name = "new_task",
                    actions = new List<TaskAction>(),
                    Triggers = new List<TriggerViewModel>(),
                    run_as_user = SessionHelper.CurrentUser.Id
                };

                TriggerViewModel trigger = new TriggerViewModel
                {
                    days = new List<DaysList>(),
                    trigger_type = "schedule"
                };
                for (int index = 0; index < 7; index++)
                {
                    var day = new DaysList
                    {
                        active = false,
                        day = index
                    };
                    trigger.days.Add(day);
                }

                task.Triggers.Add(trigger);
            }
            else
            {
                task = _modelService.GetTask(taskUri);
            }
            return task;
        }


        /// <summary>
        /// try get all angle in actions in order to verify ModelPriviledge
        /// </summary>
        /// <param name="task">task to verify</param>
        internal void VerifyPriviledge(TaskViewModel task)
        {
            List<ModelViewModel> models = SessionHelper.Models.ToList();
            List<ModelPrivilegeViewModel> modelPrivileges = SessionHelper.Session.ModelPrivileges.ToList();
            foreach (TaskAction action in task.actions)
            {
                string modelId = action.arguments.FirstOrDefault(filter => filter.name == "model")?.value?.ToString();
                if (modelId != null)
                {
                    var model = models.FirstOrDefault(x => x.id == modelId);
                    var modelPrivilege = modelPrivileges.FirstOrDefault(x => x.model == model.Uri);
                    if (modelPrivilege == null || !(bool)modelPrivilege.Privileges.manage_model)
                    {
                        throw new HttpException((int)HttpStatusCode.Forbidden, JsonConvert.SerializeObject(new
                        {
                            reason = HttpStatusCode.Forbidden.ToString(),
                            message = "User has no access to any model."
                        }));
                    }
                }
            }
        }

        internal List<ItemViewModel> GetItemViewModels(List<TaskAction> taskActions)
        {
            List<string> angleList = new List<string>();
            List<string> modelList = new List<string>();
            foreach (TaskAction action in taskActions)
            {
                var argumentAngle = action.arguments.FirstOrDefault(filter => filter.name == "angle_id");
                if (argumentAngle != null)
                {
                    angleList.Add(argumentAngle.value.ToString());
                    modelList.Add(action.arguments.FirstOrDefault(filter => filter.name == "model").value.ToString());
                }
            }

            return CallItemService(angleList, modelList);
        }

        internal List<ItemViewModel> CallItemService(List<string> angleList, List<string> modelList)
        {
            List<ItemViewModel> items = new List<ItemViewModel>();
            List<string> angles = angleList.Distinct().ToList();
            string modelIds = string.Join(" ", modelList.Distinct().ToArray());

            while (angles.Any())
            {
                string angleIds = string.Join(",", angles.Take(30));
                string query = $"fq=facetcat_itemtype:(facet_angle facet_template) AND facetcat_models:({modelIds})&include_facets=false&offset=0&limit=30&caching=false&viewmode=basic&ids={angleIds}&can_see_scheduled_tasks=true";
                items.AddRange(_itemService.Get(query));
                angles = angles.Skip(30).ToList();
            }

            return items;
        }

        internal void MapAngleDisplayToTaskAction(List<TaskAction> taskActions, List<ItemViewModel> items)
        {
            var models = SessionHelper.Models.ToList();
            foreach (TaskAction action in taskActions)
            {
                var angleId = action.arguments.FirstOrDefault(filter => filter.name == "angle_id");
                var displayId = action.arguments.FirstOrDefault(filter => filter.name == "display_id");
                var modelId = action.arguments.FirstOrDefault(filter => filter.name == "model");

                if (angleId != null)
                {
                    var model = models.FirstOrDefault(x => x.id == modelId.value.ToString());

                    ItemViewModel angle = items.FirstOrDefault(x =>
                    x.id == angleId.value.ToString() &&
                    x.Model == model.Uri);

                    if (angle != null)
                    {
                        action.AngleName = angle.name;
                        action.AngleUri = angle.uri;

                        foreach (ItemDisplayViewModel display in angle.displays)
                        {
                            if (Convert.ToString(displayId.value) == display.id)
                            {
                                action.DisplayName = display.name;
                                break;
                            }
                        }
                    }
                }
            }
        }

        #endregion
    }
}
