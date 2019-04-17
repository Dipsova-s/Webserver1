using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels;
using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Core.ViewModels.ModelServer;
using EveryAngle.Logging;
using EveryAngle.ManagementConsole.Helpers;
using EveryAngle.Shared.Globalization;
using EveryAngle.Shared.Helpers;
using EveryAngle.Utilities;
using EveryAngle.WebClient.Domain.Enums;
using EveryAngle.WebClient.Service.HttpHandlers;
using EveryAngle.WebClient.Service.Security;
using Kendo.Mvc.UI;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mime;
using System.Web.Mvc;

namespace EveryAngle.ManagementConsole.Controllers
{
    public class ModelServersController : BaseController
    {
        private readonly IModelService _modelService;
        private readonly IModelAgentService _modelAgentService;

        public ModelServersController(IModelService service, IModelAgentService modelAgentService)
        {
            _modelService = service;
            _modelAgentService = modelAgentService;
        }

        #region "Public"

        public ActionResult GetAllModelServers(string modelUri, string modelId, string q = "")
        {
            ViewBag.ModelId = modelId;
            ViewBag.ModelUri = modelUri;

            return PartialView("~/Views/Model/ModelServers/AllModelServer.cshtml");
        }

        public ActionResult GetFilterModelServers(string modelUri, string q = "")
        {
            modelUri = modelUri.ToLower();
            var sessionHelper = SessionHelper.Initialize();
            var currentModel = sessionHelper.GetModel(modelUri);
            var modelServers = GetModelServers(q, modelUri, 1, MaxPageSize);
            var currentInstanceModelServerId = string.Empty;

            if (modelServers != null && modelServers.Data.Count() > 0)
            {
                modelServers.Data = modelServers.Data.Where(model => model.id != "EA4IT_Xtractor").ToList();
                modelServers.Header.Total = modelServers.Header.Total - 1;
            }

            if (currentModel != null && currentModel.current_instance != null)
            {
                var modelServer =
                    modelServers.Data.Find(
                        filter =>
                            filter.instance != null &&
                            filter.instance.ToString() == currentModel.current_instance.ToString());
                if (modelServer != null)
                {
                    currentInstanceModelServerId = modelServer.id;
                }
            }

            modelServers.Data.ForEach(x => x.status = (x.IsProcessing.HasValue && x.IsProcessing.Value) ? "Postprocessing" : x.status);

            ViewData["CurrentInstanceId"] = currentInstanceModelServerId;
            ViewData["Total"] = modelServers.Header.Total;
            ViewData["SearchKeyword"] = string.IsNullOrEmpty(q) ? string.Empty : q;
            ViewData["DefaultPageSize"] = MaxPageSize;
            ViewBag.ModelUri = modelUri;
            return PartialView("~/Views/Model/ModelServers/ModelServerGrid.cshtml", modelServers.Data);
        }

        public ActionResult GetAllModelServer(string modelServerUri, bool isCurrentInstance)
        {
            // model instances
            ModelServerViewModel modelServerViewModel = _modelService.GetModelServer(modelServerUri);

            // shared view bag
            ViewBag.ModelServerUri = modelServerUri;
            ViewBag.IsCurrentInstance = isCurrentInstance;

            return modelServerViewModel.Type == ModelAgentType.Extractor
                ? GetModelExtractorInfoPartialView(modelServerViewModel)
                : GetModelServerInfoPartialView(modelServerViewModel);
        }

        public ActionResult GetAllModelServerReport(string modelServerUri, bool isCurrentInstance)
        {
            var modelServer = _modelService.GetModelServer(modelServerUri);
            ViewBag.ModelServerUri = modelServerUri;
            ViewBag.ModelServerID = modelServer.id;
            ViewBag.IsCurrentInstance = isCurrentInstance;
            var parentDetails = new List<TreeViewItemModel>();

            var reportUri = modelServer.reports == null ? "" : modelServer.reports.ToString();
            var reports = string.IsNullOrEmpty(reportUri)
                ? new ListViewModel<ModelServerReportViewModel>()
                : _modelService.GetReports(reportUri);

            var status = new TreeViewItemModel();
            status.Text = Resource.MC_Status;
            parentDetails.Add(status);

            if (reports.Data != null)
            {
                var generalReports =
                    reports.Data.Where(x => !x.id.StartsWith("Class") && !x.id.StartsWith("Enum")).ToList();
                var classesReports = reports.Data.Where(x => x.id.StartsWith("Class")).ToList();
                var enumReports = reports.Data.Where(x => x.id.StartsWith("Enum")).ToList();
                CreateReportTreeView(parentDetails, generalReports, Resource.MC_GeneralReport);
                CreateReportTreeView(parentDetails, classesReports, Resource.MC_ClassReport);
                CreateReportTreeView(parentDetails, enumReports, Resource.MC_EnumReport);
                ViewBag.TaskDetails = parentDetails;
            }

            return PartialView("~/Views/Model/ModelServers/ModelServerReport.cshtml", parentDetails);
        }

        public ContentResult GetModelServerReport(string modelServerUri, string reportUri)
        {
            var modelServer = _modelService.GetModelServer(modelServerUri);
            ViewBag.ModelServerUri = modelServerUri;
            ViewBag.ModelServerID = modelServer.id;
            string report = null;
            if (modelServer.status != "Down")
            {
                report = _modelService.GetModelServerReport(reportUri);
            }
            return Content(report, "application/json");
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult ReadModelServers(string q, string modelUri, [DataSourceRequest] DataSourceRequest request)
        {
            var modelServer = GetModelServers(q, modelUri, request.Page, DefaultPageSize);
            var result = new DataSourceResult
            {
                Data = modelServer.Data,
                Total = modelServer.Header != null ? modelServer.Header.Total : 0
            };
            return Json(result);
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public void KillSAPJobs(string modelServerUri, string body)
        {
            ModelServerViewModel modelServer = _modelService.GetModelServer(modelServerUri);

            Log.SendInfo("[KillSapJobs] Extractor: id = {0}, status = {1}", modelServer.id, modelServer.status);
            Log.SendInfo("[KillSapJobs] Request body: {0}", body);

            if (modelServer.Status == ModelServerStatus.Extracting)
            {
                try
                {
                    ModelViewModel model = SessionHelper.Models.FirstOrDefault(x => x.Uri == modelServer.model);
                    _modelAgentService.KillSapJob(model.Agent.ToString(), body);
                    Log.SendInfo("[KillSapJobs] Success");
                }
                catch (Exception ex)
                {
                    Log.SendWarning("[KillSapJobs] Failed: {0}", ex.Message);
                }
            }
            else
            {
                Log.SendWarning("[KillSapJobs] Skipped! the status is not applicable");
            }
        }

        #endregion

        #region "Private"

        private ListViewModel<ModelServerViewModel> GetModelServers(string q, string modelUri, int page, int pagesize)
        {
            var models = SessionHelper.Initialize().Models;
            var model = models.FirstOrDefault(eachModel => eachModel.Uri.ToString() == modelUri);
            var modelServer = new ListViewModel<ModelServerViewModel>();
            if (model.ServerUri != null)
            {
                modelServer =
                    _modelService.GetModelServers(model.ServerUri + "?" +
                                                 UtilitiesHelper.GetOffsetLimitQueryString(page, pagesize, q));
                foreach (var item in modelServer.Data)
                {
                    item.modelId =
                        models.FirstOrDefault(eachModel => eachModel.Uri.ToString() == item.model.ToString()).id;
                    item.instance_status = item.instance_status != null
                        ? _modelService.GetInstance(item.instance.ToString()).status
                        : "";
                }
            }
            return modelServer;
        }

        private void CreateReportTreeView(List<TreeViewItemModel> parentDetails,
            List<ModelServerReportViewModel> reports, string reportName)
        {
            var reportDetails = new List<TreeViewItemModel>();

            foreach (var item in reports)
            {
                reportDetails.Add(new TreeViewItemModel
                {
                    Text = item.title,
                    Id = item.id,
                    HtmlAttributes =
                        new Dictionary<string, string>
                        {
                            {"data-url", item.Uri != null ? item.Uri.ToString() : string.Empty}
                        }
                });
            }

            //create tree view
            var reportTreeView = new TreeViewItemModel();
            reportTreeView.Text = reportName;
            reportTreeView.Items.AddRange(reportDetails);
            parentDetails.Add(reportTreeView);
        }



        public FileResult GetModelServerMetaDataFile(string fullPath, string modelServerId, string instanceid)
        {
            string requestUrl = string.Format("{0}/metadata", Base64Helper.Decode(fullPath));
            string downloadFilename = string.Format("metadata_{0}_{1}.json", modelServerId, instanceid);

            RequestManager requestManager = RequestManager.Initialize(requestUrl);
            byte[] downloadFileByte = requestManager.GetBinary();
            return File(downloadFileByte, MediaTypeNames.Application.Octet, downloadFilename);
        }

        private PartialViewResult GetModelServerInfoPartialView(ModelServerViewModel modelServerViewModel)
        {
            // if MS down then use info from AS
            if (modelServerViewModel.Status == ModelServerStatus.Down)
                return PartialView("~/Views/Model/ModelServers/ModelServerInfo.cshtml", modelServerViewModel);

            InstanceViewModel instanceViewModel;
            ModelServerViewModel modelServerInfoViewModel = _modelService.GetModelServer(modelServerViewModel.info.ToString());

            // set type, in /info use application_type
            modelServerInfoViewModel.type = modelServerViewModel.type;

            // is post processing status
            if (modelServerInfoViewModel.IsProcessing.GetValueOrDefault())
            {
                modelServerInfoViewModel.status = ModelServerStatus.Postprocessing.ToString();
            }

            // model server view bag
            if (modelServerInfoViewModel.task_details != null)
            {
                ViewBag.TaskDetails = new List<TreeViewItemModel>
                {
                    new TreeViewItemModel
                    {
                        Text = Resource.MC_Status,
                        Items = EventLogHelper.GetTreeViewItemModelList(modelServerInfoViewModel.task_details)
                    }
                };
            }

            if (modelServerInfoViewModel.instance != null)
            {
                instanceViewModel = _modelService.GetInstance(modelServerInfoViewModel.instance.ToString());
                ViewBag.ModelInstance = instanceViewModel.created.ToUnixTime();
            }

            return PartialView("~/Views/Model/ModelServers/ModelServerInfo.cshtml", modelServerInfoViewModel);
        }

        private PartialViewResult GetModelExtractorInfoPartialView(ModelServerViewModel modelServerViewModel)
        {
            ExtractorViewModel extractorViewModel;
            // set model status
            if (modelServerViewModel.Status == ModelServerStatus.Down)
            {
                extractorViewModel = new ExtractorViewModel
                {
                    id = modelServerViewModel.id,
                    status = ModelServerStatus.Down.ToString()
                };
            }
            else
            {
                extractorViewModel = _modelService.GetModelExtractor(modelServerViewModel.info.ToString());
            }
            return PartialView("~/Views/Model/ModelServers/ModelExtractorInfo.cshtml", extractorViewModel);
        }

        #endregion
    }
}
