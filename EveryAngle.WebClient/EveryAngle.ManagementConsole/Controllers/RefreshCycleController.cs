using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels;
using EveryAngle.Core.ViewModels.Cycle;
using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Core.ViewModels.ModelServer;
using EveryAngle.CSM.Shared.Enums;
using EveryAngle.Shared.Globalization;
using EveryAngle.Shared.Helpers;
using EveryAngle.WebClient.Domain.Enums;
using EveryAngle.WebClient.Service.Security;
using Kendo.Mvc.UI;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;

namespace EveryAngle.ManagementConsole.Controllers
{
    public class RefreshCycleController : BaseController
    {
        private readonly IModelService _modelService;
        private readonly ITaskService _taskService;

        public RefreshCycleController(IModelService modelService, ITaskService refreshCycleService)
        {
            _modelService = modelService;
            _taskService = refreshCycleService;
        }

        public ActionResult GetRefreshCycle(string modelUri, string modelId)
        {
            var version = SessionHelper.Initialize().Version;
            var model = _modelService.GetModel(modelUri);
            ViewBag.ModelId = modelId;
            ViewBag.ModelUri = modelUri;
            ViewBag.ModelServerUri = model.ServerUri.ToString();
            ViewBag.TasksUri = version.GetEntryByName("tasks").Uri.ToString();
            ViewBag.TaskHistoryUri = version.GetEntryByName("eventlog").Uri.ToString();
            ViewBag.ActionListsUri = model.ActionLists.ToString();
            ViewBag.DownloadTablesUri = model.TableDefinitions.ToString();
            ViewBag.ModelName = model.short_name;
            return PartialView("~/Views/Model/RefreshCycle/RefreshCycle.cshtml");
        }

        public ActionResult GetTaskDetail(string modelId, string tasksUri, string modelUri)
        {
            ViewBag.ModelId = modelId;
            ViewBag.TasksUri = tasksUri;
            ViewBag.ModelUri = modelUri;
            return PartialView("~/Views/Model/RefreshCycle/TaskDetails.cshtml");
        }

        public ActionResult ReadTaskDetail(
            [DataSourceRequest] DataSourceRequest request,
            string modelId,
            string tasksUri,
            string modelUri)
        {
            string fullTasksUri = string.Format("{0}?type=refresh_model&model={1}&{2}", tasksUri, modelId, OffsetLimitQuery);
            List<TaskViewModel> tasks = _taskService.GetTasks(fullTasksUri);
            ViewBag.ModelUri = modelUri;
            return Json(new DataSourceResult
            {
                Data = tasks,
                Total = tasks.Count
            }, JsonRequestBehavior.AllowGet);
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult SaveRefreshCycle(string tasksUri, string tasksData)
        {
            TaskViewModel task = JsonConvert.DeserializeObject<TaskViewModel>(tasksData);
            TaskViewModel savedTask = task.Uri == null
                ? _taskService.CreateTask(tasksUri, task)
                : _taskService.UpdateTask(task);

            return new JsonResult
            {
                Data = savedTask,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        [AcceptVerbs(HttpVerbs.Delete)]
        public void DeleteRefreshCycle(string taskUri)
        {
            _taskService.DeleteTask(taskUri);
        }

        public ActionResult CheckExtractor(string modelServerUri)
        {
            string extractorUri = string.Empty;
            try
            {
                ModelServerViewModel modelExtractor = _modelService.GetModelServers(modelServerUri)
                    .Data.FirstOrDefault(model => model.Type == ModelAgentType.Extractor);
                if (modelExtractor != null && modelExtractor.Status.Equals(ModelServerStatus.Extracting))
                {
                    extractorUri = modelExtractor.Uri.ToString();
                }
            }
            catch
            {
                // do nothing
            }
            return Json(new
            {
                ExtractorUri = extractorUri
            }, JsonRequestBehavior.AllowGet);
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult TestExtraction(string modelId, string modelServerUri, string tasksUri, string tasksData)
        {
            var taskName = "EATest_" + modelId;
            var tasksDetailUri = string.Format("{0}?model={1}&type=refresh_model&{2}", tasksUri, modelId, OffsetLimitQuery);
            var tasks = _taskService.GetTasks(tasksDetailUri).OrderByDescending(order => order.created.Created).ToList();
            var task = tasks.FirstOrDefault(x => x.ActionList == "EATest" && x.id == taskName);

            if (task != null)
            {
                if (task.status != "running" && task.status != "queued")
                {
                    _modelService.CreateTask($"{task.Uri}/execution",
                        "{\"start\":true,\"reason\":\"Manual execute from MC\"}");
                }
            }
            else
            {
                task = _modelService.CreateTask(tasksUri, tasksData);
                _modelService.CreateTask($"{task.Uri}/execution",
                    "{\"start\":true,\"reason\":\"Manual execute from MC\"}");
            }

            var modelExtractor = new ExtractorViewModel();
            var modelServers =
                _modelService.GetModelServers(modelServerUri + "?" +
                                             UtilitiesHelper.GetOffsetLimitQueryString(1, MaxPageSize));
            var modelServer = modelServers.Data.FirstOrDefault(server => server.Type == ModelAgentType.Extractor);
            ViewBag.ModelServerID = modelServer.id;
            if (modelServer.status != "Down")
            {
                modelExtractor = _modelService.GetModelExtractor(modelServer.info.ToString());
            }
            else
            {
                modelExtractor.status = "Down";
            }
            return PartialView("~/Views/Model/ModelServers/ModelExtractorInfo.cshtml", modelExtractor);
        }

        public ActionResult ReloadTestExtraction(string modelId, string modelServerUri)
        {
            var modelExtractor = new ExtractorViewModel();
            var modelServers =
                _modelService.GetModelServers(modelServerUri + "?" +
                                             UtilitiesHelper.GetOffsetLimitQueryString(1, MaxPageSize));
            var modelServer = modelServers.Data.FirstOrDefault(server => server.type == "Extractor");
            if (modelServer.available.HasValue && modelServer.available.Value)
            {
                modelExtractor = _modelService.GetModelExtractor(modelServer.info.ToString());
            }
            else
            {
                ViewBag.ModelServerID = modelServer.id;
                modelExtractor.status = "Down";
            }

            return PartialView("~/Views/Model/ModelServers/ModelExtractorInfo.cshtml", modelExtractor);
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult AbortTask(string tasksUri, string data)
        {
            _modelService.CreateTask($"{tasksUri}/execution", data);

            return new JsonResult
            {
                Data = new { success = true, message = Resource.MC_ItemSuccesfullyUpdated },
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult ExecuteTask(string tasksUri, string data)
        {
            _modelService.CreateTask($"{tasksUri}/execution", data);

            return new JsonResult
            {
                Data = new { success = true, message = Resource.MC_ItemSuccesfullyUpdated },
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        public ActionResult GetTaskHistory(string modelId)
        {
            var version = SessionHelper.Initialize().Version;
            string taskHistoryUri = string.Format("{0}?model={1}&type=refresh_model&filterMode=task_results", version.GetEntryByName("eventlog").Uri, modelId);

            ViewData["DefaultPageSize"] = DefaultPageSize;
            ViewBag.HistoryUri = taskHistoryUri;

            return PartialView("~/Views/Model/RefreshCycle/TaskHistories.cshtml");
        }

        public ActionResult ReadTaskHistories([DataSourceRequest] DataSourceRequest request, string historyUri)
        {
            string historyFullUri = string.Format("{0}&{1}", historyUri, OffsetLimitQuery);
            ListViewModel<TaskHistoryViewModel> alltasksHistory = _taskService.GetTaskHistories(historyFullUri);

            return Json(new DataSourceResult
            {
                Data = alltasksHistory.Data,
                Total = alltasksHistory.Header.Total
            }, JsonRequestBehavior.AllowGet);
        }

        public ActionResult ShowActionLists()
        {
            return PartialView("~/Views/Model/RefreshCycle/ShowActionLists.cshtml", new List<ActionListViewModel>());
        }

        public ActionResult GetActionList(string actionListsUri)
        {
            List<ActionListViewModel> actionLists = _taskService.GetActionList($"{actionListsUri}?{OffsetLimitQuery}");
            return Json(actionLists, JsonRequestBehavior.AllowGet);
        }
    }
}
