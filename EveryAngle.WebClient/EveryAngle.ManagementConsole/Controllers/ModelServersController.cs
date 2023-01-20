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

        public ModelServersController(IModelService service)
        {
            _modelService = service;
        }

        #region "Public"

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
            ModelServerViewModel modelServerViewModel = _modelService.GetModelServer(modelServerUri);
            
            ListViewModel<ModelServerReportViewModel> modelServerReportListView = new ListViewModel<ModelServerReportViewModel>();
            string modelServerReportUri = modelServerViewModel?.reports?.ToString();        
            try
            {
                if(!string.IsNullOrEmpty(modelServerReportUri))
                    modelServerReportListView = _modelService.GetReports(modelServerReportUri);
            }
            catch 
            {
                 //Do nothing
            }

            IList<TreeViewItemModel> treeListView = GetModelServerReportTreeViewItemModel(modelServerReportListView);

            ViewBag.ModelServerUri = modelServerUri;
            ViewBag.ModelServerID = modelServerViewModel.id;
            ViewBag.IsCurrentInstance = isCurrentInstance;
            ViewBag.TaskDetails = treeListView;

            return PartialView("~/Views/Model/ModelServers/ModelServerReport.cshtml", treeListView);
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
        public void KillSAPJobs(string modelServerUri, string body)
        {
            ModelServerViewModel modelServer = _modelService.GetModelServer(modelServerUri);

            Log.SendInfo("[KillSapJobs] Extractor: id = {0}, status = {1}", modelServer.id, modelServer.status);
            Log.SendInfo("[KillSapJobs] Request body: {0}", body);

            if (modelServer.Status == ModelServerStatus.Extracting)
            {
                try
                {
                    ModelViewModel model = AuthorizationHelper.Models.FirstOrDefault(x => x.Uri == modelServer.model);
                    _modelService.KillSapJob(model.Uri.ToString(), body);
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

        public FileResult GetModelServerMetaDataFile(string fullPath, string modelServerId, string instanceid)
        {
            string requestUrl = string.Format("{0}/metadata", Base64Helper.Decode(fullPath));
            string downloadFilename = string.Format("metadata_{0}_{1}.json", modelServerId, instanceid);

            RequestManager requestManager = RequestManager.Initialize(requestUrl);
            byte[] downloadFileByte = requestManager.GetBinary();
            return File(downloadFileByte, MediaTypeNames.Application.Octet, downloadFilename);
        }

        #endregion

        #region "Private"

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

        private IList<TreeViewItemModel> GetModelServerReportTreeViewItemModel(ListViewModel<ModelServerReportViewModel> modelServerReportListView)
        {
            List<TreeViewItemModel> treeListView = new List<TreeViewItemModel>
            {
                new TreeViewItemModel { Text = Resource.MC_Status }
            };

            if (modelServerReportListView.Data.Any())
            {
                List<ModelServerReportViewModel> generalsReport = modelServerReportListView.Data.Where(x => !x.id.StartsWith("Class") && !x.id.StartsWith("Enum")).ToList();
                List<ModelServerReportViewModel> classesReport = modelServerReportListView.Data.Where(x => x.id.StartsWith("Class")).ToList();
                List<ModelServerReportViewModel> enumsReport = modelServerReportListView.Data.Where(x => x.id.StartsWith("Enum")).ToList();

                CreateReportTreeView(treeListView, generalsReport, Resource.MC_GeneralReport);
                CreateReportTreeView(treeListView, classesReport, Resource.MC_ClassReport);
                CreateReportTreeView(treeListView, enumsReport, Resource.MC_EnumReport);
            }

            return treeListView;
        }

        #endregion
    }
}
