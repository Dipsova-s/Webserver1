using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels;
using EveryAngle.Core.ViewModels.Cycle;
using EveryAngle.Core.ViewModels.Directory;
using EveryAngle.Core.ViewModels.EAPackage;
using EveryAngle.Core.ViewModels.Model;
using EveryAngle.ManagementConsole.Helpers;
using EveryAngle.Shared.Globalization;
using EveryAngle.Shared.Helpers;
using EveryAngle.WebClient.Domain.Constants;
using EveryAngle.WebClient.Service;
using EveryAngle.WebClient.Service.HttpHandlers;
using EveryAngle.WebClient.Service.Security;
using Kendo.Mvc.UI;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web.Mvc;

namespace EveryAngle.ManagementConsole.Controllers
{
    public class PackagesController : BaseController
    {
        private readonly IModelService modelService;
        private readonly IPackageService packageService;
        private readonly IFacetService facetService;

        public PackagesController(
            IGlobalSettingService globalSettingService,
            IModelService modelService,
            IPackageService packageService,
            IFacetService facetService,
            SessionHelper sessionHelper)
        {
            this.modelService = modelService;
            this.packageService = packageService;
            this.facetService = facetService;
            SessionHelper = sessionHelper;
        }

        public PackagesController(
            IGlobalSettingService globalSettingService,
            IModelService modelService,
            IPackageService packageService,
            IFacetService facetService)
        {
            this.modelService = modelService;
            this.packageService = packageService;
            this.facetService = facetService;
            SessionHelper = SessionHelper.Initialize();
        }

        #region "Private"

        private ListViewModel<PackageViewModel> GetPackages([DataSourceRequest] DataSourceRequest request, string query,
            string packageUri, string activeStatus)
        {
            var requestUri = packageUri + "?" +
                             UtilitiesHelper.GetOffsetLimitQueryString(request.Page, request.PageSize, query);
            if (activeStatus != "all")
            {
                requestUri += "&active=" + (activeStatus == "active" ? "true" : "false");
            }
            requestUri += PageHelper.GetPackagesQueryString(request);
            var packages = modelService.GetModelPackages(requestUri);

            return packages;
        }

        private ExportSummaryFacetViewModel GetExportSummaryFacetViewModel(IEnumerable<FacetViewModel> facetViewModels, string facetFilterIds)
        {
            ExportSummaryFacetViewModel exportSummaryFacetViewModel = new ExportSummaryFacetViewModel();
            if (facetViewModels.Any())
            {
                FacetViewModel characteristics = facetViewModels.FirstOrDefault(x => x.id.Equals("facetcat_characteristics"));
                exportSummaryFacetViewModel.TotalPrivate = GetTotalFacetItem(characteristics, "facet_isprivate");
                exportSummaryFacetViewModel.TotalValidated = GetTotalFacetItem(characteristics, "facet_isvalidated");
                exportSummaryFacetViewModel.TotalPublished = GetTotalPublishedFacetItem(facetViewModels, facetFilterIds, exportSummaryFacetViewModel.TotalPrivate);
            }
            return exportSummaryFacetViewModel;
        }

        private int GetTotalFacetItem(FacetViewModel facetViewModel, string facetFilterItemTypeId)
        {
            if (facetViewModel == null)
                return 0;

            FacetFilterViewModel facetFilterViewModel = facetViewModel.filters.FirstOrDefault(x => x.id.Equals(facetFilterItemTypeId));
            return facetFilterViewModel == null ? 0 : facetFilterViewModel.count;
        }

        private int GetTotalPublishedFacetItem(IEnumerable<FacetViewModel> facetViewModels, string facetFilterItemTypeIds, int totalPrivate)
        {
            if (string.IsNullOrEmpty(facetFilterItemTypeIds))
                return 0;

            int totalPublished = 0;
            FacetViewModel facetViewModel = facetViewModels.FirstOrDefault(x => x.id.Equals("facetcat_itemtype"));
            foreach (string facetFilterItemTypeId in facetFilterItemTypeIds.Split(' '))
            {
                totalPublished += GetTotalFacetItem(facetViewModel, facetFilterItemTypeId);
            }
            return Math.Max(0, totalPublished - totalPrivate);
        }

        private void AddArgumentsForUpgradePackage(IList<Argument> arguments, PackageViewModel package, ActivePackageQueryViewModel activePackageQueryViewModel)
        {
            if (!package.IsUpgradePackage)
                return;

            arguments.Add(new Argument { name = TaskArgumentConstant.IncludeLabelCategories, value = activePackageQueryViewModel.IncludeLabelCategories });
            arguments.Add(new Argument { name = TaskArgumentConstant.IncludePrivateItems, value = activePackageQueryViewModel.IncludePrivateItems });
            arguments.Add(new Argument { name = TaskArgumentConstant.AnglesConflictResolution, value = activePackageQueryViewModel.AnglesConflictResolution });
            arguments.Add(new Argument { name = TaskArgumentConstant.IncludeExternalId, value = activePackageQueryViewModel.IncludeExternalId });

            if (activePackageQueryViewModel.IncludeLabelCategories)
                arguments.Add(new Argument { name = TaskArgumentConstant.LabelCategoriesConflictResolution, value = activePackageQueryViewModel.LabelCategoriesConflictResolution });
        }

        #endregion

        #region "Public"

        public ActionResult RenderTemplateAnglesPage(string modelUri, string modelId, string states = "")
        {
            if (states != "")
            {
                var parsed = JArray.Parse(states);
                var response = parsed[0]["query"];
                ViewBag.ActiveStatus = response["activeStatus"].ToString();
                ViewBag.Query = response["q"].ToString();
            }
            var version = SessionHelper.Version;
            var model = SessionHelper.GetModel(modelUri);

            ViewBag.ModelId = modelId;
            ViewBag.ModelName = model?.short_name ?? "";
            ViewBag.ModelPackagesUri = string.Format("{0}?model={1}&types=deactivate_package,activate_package&filterMode=task_results", version.GetEntryByName("eventlog").Uri, modelId);
            ViewBag.EventlogUri = version.GetEntryByName("eventlog").Uri.ToString();
            ViewBag.ModelUri = modelUri;
            ViewBag.HasManageModel = SessionHelper.Session.IsValidToManageModelPrivilege();
            IEnumerable<ExportPackageModelViewModel> ExportPackageModelViewModel = SessionHelper.Models.Select(x => new ExportPackageModelViewModel
            {
                Id = x.id,
                Name = x.short_name,
                HasManageModelPrivilege = SessionHelper.Session.IsValidToManageModelPrivilege(x.Uri.ToString()),
                PackageUri = x.PackagesUri.ToString()
            });
            return PartialView("~/Views/Model/TemplateAngles/TemplateAnglesPage.cshtml", ExportPackageModelViewModel);
        }

        public ActionResult GetFilterTemplateAngles(string modelUri, string activeStatus, string q = "")
        {
            var model = SessionHelper.GetModel(modelUri);
            var packageUri = model != null && model.PackagesUri != null ? model.PackagesUri.ToString() : string.Empty;

            ViewData["DefaultPageSize"] = DefaultPageSize;
            ViewBag.Query = q;
            ViewBag.PackageUri = packageUri;
            ViewBag.ModelUri = modelUri;
            ViewBag.ModelId = model?.id ?? string.Empty;
            ViewBag.ActiveStatus = activeStatus ?? "active";
            return PartialView("~/Views/Model/TemplateAngles/TemplateAnglesGrid.cshtml");
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult GetPackageErrorMessage(string packageUri)
        {
            var package = modelService.GetModelPackage(packageUri);
            var errorMessages = package.error_message.Split(new[] { "\r\n" }, StringSplitOptions.None);
            if (package.status == "Active" && errorMessages != null)
            {
                var table = new DataTable();
                table.Columns.Add("Type", typeof(string));
                table.Columns.Add("ID", typeof(string));
                table.Columns.Add("Warning", typeof(string));

                for (var i = 0; i < errorMessages.Length - 1; i++)
                {
                    var record = table.NewRow();
                    var data = errorMessages[i].Trim().Split(new[] { "," }, StringSplitOptions.None);

                    record["Type"] = data[0].Trim();
                    record["ID"] = data[1].Trim();
                    record["Warning"] = data[2].Trim();
                    table.Rows.Add(record);
                }
                ViewData["DefaultPageSize"] = DefaultPageSize;
                return PartialView("~/Views/Model/TemplateAngles/ErrorMessageTableGrid.cshtml", table);
            }
            return PartialView("~/Views/Model/TemplateAngles/ErrorMessagePage.cshtml", package);
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult ReadPackages([DataSourceRequest] DataSourceRequest request, string q, string packageUri,
            string activeStatus)
        {
            ListViewModel<PackageViewModel> packages;
            var models = SessionHelper.Models;
            var isPackageUriEmpty = string.IsNullOrEmpty(packageUri);
            if (isPackageUriEmpty)
            {
                var version = SessionHelper.Version;
                packageUri = version.GetEntryByName("packages").Uri.ToString();
            }
            packages = GetPackages(request, q, packageUri, activeStatus);

            if (isPackageUriEmpty)
            {
                packages.Data.ForEach(packageData =>
                {
                    var modelsName = new List<string>();
                    var modelItems = new List<string> { "angles", "labels", "dashboards", "helptexts", "model_authorizations" };
                    if (packageData.Contents.Any(x => modelItems.Contains(x)))
                    {
                        packageData.activated_models.ForEach(activatedModel =>
                        {
                            var model = models.FirstOrDefault(w => w.id == activatedModel);
                            modelsName.Add(model != null ? model.short_name : activatedModel);
                        });
                        packageData.ActivatedModels = string.Join(", ", modelsName);
                    }
                    else
                    {
                        packageData.ActivatedModels = Resource.MC_GlobalModel;
                    }
                    packageData.active = packageData.activated_models.Count > 0;
                });
            }
            var result = new DataSourceResult
            {
                Data = packages.Data,
                Total = packages.Header.Total
            };
            return Json(result);
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult ManagePackage(ActivePackageQueryViewModel activePackageQueryViewModel)
        {
            VersionViewModel version = SessionHelper.Version;
            TaskViewModel taskViewModel = GetPackageTaskViewModel(activePackageQueryViewModel);
            JsonSerializerSettings jsonSerializerSettings = new JsonSerializerSettings
            {
                ContractResolver = new CleanUpPropertiesResolver(new List<string>
                {
                    "id",
                    "uri",
                    "description",
                    "created",
                    "changed",
                    "status"
                })
            };

            string uri = version.GetEntryByName("tasks").Uri.ToString();
            string data = JsonConvert.SerializeObject(taskViewModel, jsonSerializerSettings);
            modelService.CreateTask(uri, data);

            return JsonHelper.GetJsonResult(true, null, null, null, MessageType.DEFAULT);
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult ManageMultiplePackage(List<ActivePackageQueryViewModel> packages)
        {
            var actions = new List<Core.ViewModels.Cycle.TaskAction>();

            foreach (var input in packages)
            {
                PackageViewModel package = modelService.GetModelPackage(input.PackageUri);
                List<Argument> arguments = new List<Argument>
                {
                    new Argument { name = TaskArgumentConstant.Model, value = input.ModelId },
                    new Argument { name = TaskArgumentConstant.Package, value = package.Uri.AbsolutePath.Replace("//", "/") }
                };
                if (input.IsActive)
                {
                    arguments.Add(new Argument { name = TaskArgumentConstant.AutoCreateMissingUsers, value = true });
                    AddArgumentsForUpgradePackage(arguments, package, input);
                }
                actions.Add(new Core.ViewModels.Cycle.TaskAction
                {
                    action_type = input.IsActive ? "activate_package" : "deactivate_package",
                    arguments = arguments
                });
            }

            VersionViewModel version = SessionHelper.Version;

            TaskViewModel taskViewModel = new TaskViewModel
            {
                actions = actions,
                description = Resource.MC_ActivateUpgradePackageTask,
                Triggers = null,
                action_count = 1,
                delete_after_completion = true,
                enabled = true,
                last_run_result = "not_started",
                last_run_time = null,
                max_run_time = 0,
                name = "Multiple Package",
                next_run_time = null,
                status = "not_started",
                run_as_user = null,
                start_immediately = true,
            };

            JsonSerializerSettings jsonSerializerSettings = new JsonSerializerSettings
            {
                ContractResolver = new CleanUpPropertiesResolver(new List<string>
                {
                    "id",
                    "uri",
                    "description",
                    "created",
                    "changed",
                    "status"
                })
            };

            string uri = version.GetEntryByName("tasks").Uri.ToString();
            string data = JsonConvert.SerializeObject(taskViewModel, jsonSerializerSettings);
            modelService.CreateTask(uri, data);

            return JsonHelper.GetJsonResult(true, null, null, null, MessageType.DEFAULT);
        }

        public TaskViewModel GetPackageTaskViewModel(ActivePackageQueryViewModel activePackageQueryViewModel)
        {
            PackageViewModel package = modelService.GetModelPackage(activePackageQueryViewModel.PackageUri);

            List<Argument> arguments = new List<Argument>
            {
                new Argument { name = TaskArgumentConstant.Model, value = activePackageQueryViewModel.ModelId },
                new Argument { name = TaskArgumentConstant.Package, value = package.Uri.AbsolutePath.Replace("//", "/") }
            };

            if (activePackageQueryViewModel.IsActive)
            {
                arguments.Add(new Argument { name = TaskArgumentConstant.AutoCreateMissingUsers, value = true });
                AddArgumentsForUpgradePackage(arguments, package, activePackageQueryViewModel);
            }

            TaskViewModel taskViewModel = new TaskViewModel
            {
                actions = new List<Core.ViewModels.Cycle.TaskAction>
                {
                    new Core.ViewModels.Cycle.TaskAction
                    {
                        action_type = activePackageQueryViewModel.IsActive ? "activate_package" : "deactivate_package",
                        arguments = arguments
                    }
                },
                description = Resource.MC_ActivateUpgradePackageTask,
                Triggers = null,
                action_count = 1,
                delete_after_completion = true,
                enabled = true,
                last_run_result = "not_started",
                last_run_time = null,
                max_run_time = 0,
                id = package.Id,
                name = package.Name,
                next_run_time = null,
                status = "not_started",
                run_as_user = null,
                start_immediately = true,
            };

            return taskViewModel;
        }

        public FileContentResult DownloadPackageFile(string packageFileUri)
        {
            RequestManager requestManager = RequestManager.Initialize(packageFileUri);

            string contentDisposition = string.Empty;
            byte[] fileData = requestManager.GetBinary(ref contentDisposition);

            string contentType = "application/zip";
            string fileDownloadName = requestManager.GetFileDownloadName(contentDisposition);

            return File(fileData, contentType, fileDownloadName);
        }

        public ActionResult GetPackagesHistory(string EventlogUri)
        {
            ViewBag.ModelPackagesHistoryUri = EventlogUri;
            ViewData["DefaultPageSize"] = DefaultPageSize;
            return PartialView("~/Views/Model/TemplateAngles/PackagesHistoryGrid.cshtml");
        }

        public ActionResult ReadPackagesHistory([DataSourceRequest] DataSourceRequest request, string modelPackagesUri)
        {
            var packagesHistory =
                modelService.GetTaskHistories(modelPackagesUri + "&" +
                                              UtilitiesHelper.GetOffsetLimitQueryString(request.Page, request.PageSize));
            var result = new DataSourceResult
            {
                Data = packagesHistory.Data.Where(package => package.correlation_id != null).ToList(),
                Total = packagesHistory.Header.Total
            };
            return Json(result);
        }

        public ActionResult GetPackageSummary(string itemIds, string facetQueryString)
        {
            IEnumerable<FacetViewModel> facetViewModel = facetService.Get(facetQueryString);
            ExportSummaryFacetViewModel exportSummaryFacetViewModel = GetExportSummaryFacetViewModel(facetViewModel, itemIds);
            return Json(exportSummaryFacetViewModel, JsonRequestBehavior.AllowGet);
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult ExportPackage(ExportPackageQueryViewModel exportPackageQueryViewModel)
        {
            ExportDownloadPackageViewModel exportViewModel = packageService.Create(exportPackageQueryViewModel);
            return Json(exportViewModel, JsonRequestBehavior.AllowGet);
        }

        public ActionResult GetExportPackageStatus(string itemUri)
        {
            ExportDownloadPackageViewModel exportViewModel = packageService.Download(itemUri);
            return Json(exportViewModel, JsonRequestBehavior.AllowGet);
        }

        #endregion
    }
}
