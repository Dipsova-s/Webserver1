using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels;
using EveryAngle.Core.ViewModels.BusinessProcesses;
using EveryAngle.Core.ViewModels.Label;
using EveryAngle.Core.ViewModels.LabelCategory;
using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Core.ViewModels.SystemLanguages;
using EveryAngle.WebClient.Service.Security;
using EveryAngle.Shared.Helpers;
using EveryAngle.WebClient.Service;
using Kendo.Mvc.Extensions;
using Kendo.Mvc.UI;
using Newtonsoft.Json;
using UrlHelper = EveryAngle.Shared.Helpers.UrlHelper;
using EveryAngle.ManagementConsole.Helpers;
using EveryAngle.Core.ViewModels.Directory;
using System.Diagnostics.CodeAnalysis;

namespace EveryAngle.ManagementConsole.Controllers
{
    [ExcludeFromCodeCoverage]
    public class LabelCategoriesController : BaseController
    {
        private readonly IGlobalSettingService globalSettingService;
        private readonly ILabelService labelService;
        private readonly IModelService modelService;
        private readonly ISystemInformationService systemInformationService;

        public LabelCategoriesController(IModelService service, ILabelService labelService,
            ISystemInformationService systemInformationService, IGlobalSettingService globalSettingService)
        {
            modelService = service;
            this.labelService = labelService;
            this.systemInformationService = systemInformationService;
            this.globalSettingService = globalSettingService;
        }

        public ActionResult AllBusinessProcesses()
        {
            var version = AuthorizationHelper.Initialize().Version;
            var labelCategories =
                labelService.GetLabelCategories(version.GetEntryByName("labelcategories").Uri +
                                                "?contains_businessprocesses=true&multilingual=yes");
            var systemLanguages = GetEnableSystemLanguagesList();

            var labelCategory = labelCategories.Data.FirstOrDefault();
            var labelCategoryUri = UrlHelper.GetRequestUrl(URLType.NOA) + labelCategory.uri + "?multilingual=yes";
            var businessProcessesUri = version.GetEntryByName("business_processes").Uri +
                                       "?multilingual=yes&include_disabled=true";
            var dataTable = labelService.GetLabelsGrid(businessProcessesUri, labelCategoryUri, 1, MaxPageSize,
                systemLanguages);

            ViewData["LanguagesList"] = systemLanguages;
            ViewBag.CategoryUri = labelCategoryUri;
            ViewData["LabelCategoryViewModel"] = labelCategory;
            return PartialView("~/Views/GlobalSettings/BusinessProcesses/BusinessProcesses.cshtml", dataTable);
        }

        public ActionResult BusinessProcessesCategoryGrid(LabelCategoryViewModel labelCategory,
            List<SystemLanguageViewModel> enabledLanguagesList)
        {
            var systemLanguages = GetEnableSystemLanguagesList();
            var labelsTable =
                labelService.GetMultilingualLabelCategory(UrlHelper.GetRequestUrl(URLType.NOA) + labelCategory.uri,
                    labelCategory, systemLanguages);
            ViewData["LanguagesList"] = systemLanguages;

            return PartialView("~/Views/GlobalSettings/BusinessProcesses/BusinessProcessesCategoryGrid.cshtml",
                labelsTable);
        }

        public ActionResult ReadBusinessProcesses([DataSourceRequest] DataSourceRequest request, string categoryUri)
        {
            var version = AuthorizationHelper.Initialize().Version;

            var query = version.GetEntryByName("business_processes").Uri + "?multilingual=yes&include_disabled=true";

            if (request != null)
            {
                query += PageHelper.GetQueryString(request, QueryString.LabelCategories);
            }

            var labelCategoryUri = UrlHelper.GetRequestUrl(URLType.NOA) + categoryUri +
                                   "?multilingual=yes&include_disabled=true";
            var dataTable = labelService.GetLabelsGrid(query, labelCategoryUri, 1, MaxPageSize);
            return Json(dataTable.ToDataSourceResult(request));
        }

        public ActionResult SaveBusinessProcesses(string labelCategoryData, string labelData, string deleteData,
            string categoryUri)
        {
            var labelCategory = JsonConvert.DeserializeObject<LabelCategoryViewModel>(labelCategoryData);
            var existlabelCategory =
                labelService.GetLabelCategory(UrlHelper.GetRequestUrl(URLType.NOA) + labelCategory.uri +
                                              "?multilingual=yes");
            var updatedLabelCategory = (LabelCategoryViewModel) existlabelCategory.Clone();
            updatedLabelCategory.multi_lang_name = labelCategory.multi_lang_name;
            updatedLabelCategory.contains_businessprocesses = true;

            var deleteLabels = JsonConvert.DeserializeObject<List<BusinessProcessViewModel>>(deleteData);
            var removedData = new List<string>();
            var un_removeData = new Dictionary<string, string>();
            foreach (var label in deleteLabels)
            {
                try
                {
                    globalSettingService.DeleteBusinessProcessLabel(label.Uri.ToString());
                    removedData.Add(label.abbreviation);
                }
                catch (HttpException ex)
                {
                    dynamic errorResult = JsonConvert.DeserializeObject(ex.Message);
                    string message = errorResult.message;
                    un_removeData.Add(label.abbreviation, message);
                }
            }

            labelService.UpdateLabelCategory(categoryUri + "?multilingual=yes",
                JsonConvert.SerializeObject(updatedLabelCategory, new JsonSerializerSettings
                {
                    ContractResolver = new CleanUpPropertiesResolver(new List<string> {"id"})
                }));

            var labels = JsonConvert.DeserializeObject<List<BusinessProcessViewModel>>(labelData);
            foreach (var label in labels)
            {
                if (label.Uri != null)
                {
                    var updatedLabel = globalSettingService.GetBusinessProcess(label.Uri + "?multilingual=yes");
                    updatedLabel.abbreviation = label.abbreviation;
                    updatedLabel.multi_lang_name = label.multi_lang_name;
                    updatedLabel.order = label.order;
                    updatedLabel.name =
                        label.multi_lang_name.Where(x => x.lang == "en").Select(c => c.text).FirstOrDefault();
                    updatedLabel.enabled = label.enabled;
                    globalSettingService.UpdateLabel(label.Uri + "?multilingual=yes",
                        JsonConvert.SerializeObject(updatedLabel, new JsonSerializerSettings
                        {
                            ContractResolver = new CleanUpPropertiesResolver(new List<string> {"id"})
                        }));
                }
                else
                {
                    globalSettingService.UpdateNewLabel(
                        UrlHelper.GetRequestUrl(URLType.NOA) + existlabelCategory.labels + "?multilingual=yes",
                        JsonConvert.SerializeObject(label, new JsonSerializerSettings
                        {
                            ContractResolver = new CleanUpPropertiesResolver(new List<string> {"name", "uri"})
                        }));
                }
            }

            return new JsonResult
            {
                Data = new {removedData, un_removeData},
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        public ActionResult AllLabelCategories(string state = "")
        {
            return PartialView("~/Views/GlobalSettings/Labels/AllLabelCategories.cshtml");
        }

        public ActionResult GetFilterGlobalLabelCategories(string q = "")
        {
            var version = AuthorizationHelper.Initialize().Version;
            ViewBag.LabelCategoryUri = version.GetEntryByName("labelcategories").Uri.ToString();
            ViewData["SearchKeyword"] = string.IsNullOrEmpty(q) ? string.Empty : q;
            ViewData["DefaultPageSize"] = MaxPageSize;

            return PartialView("~/Views/GlobalSettings/Labels/AllLabelCategoriesGrid.cshtml");
        }

        public ActionResult Labels(string categoryLabelsUri, string categoryUri)
        {
            ViewData["LanguagesList"] = GetEnableSystemLanguagesList();
            ViewBag.IsVisibleLabelGrid = false;
            ViewBag.CategoryEnName = "";
            if (categoryLabelsUri != "" && categoryUri != "")
            {
                var query = UrlHelper.GetRequestUrl(URLType.NOA) + categoryUri;
                var labelCategory = labelService.GetLabelCategory(query);

                ViewData["LabelCategory"] = labelCategory;
                ViewBag.IsVisibleLabelGrid = true;
                ViewBag.CategoryEnName = labelCategory.multi_lang_name.Where(l => l.lang == "en").FirstOrDefault() ==
                                         null
                    ? labelCategory.id
                    : labelCategory.multi_lang_name.Where(l => l.lang == "en").FirstOrDefault().text;
                ViewBag.Businessprocesses = labelCategory.contains_businessprocesses.ToString();
                ViewBag.CategoryLabelsUri = categoryLabelsUri;
                ViewBag.CategoryUri = categoryUri;
                ViewBag.CommentType = "Global_Label_Categories";
            }
            return PartialView("~/Views/GlobalSettings/Labels/Labels.cshtml");
        }

        public ActionResult LabelsGrid(string categoryLabelsUri, string categoryUri,
            List<SystemLanguageViewModel> enabledLanguagesList, string qlang = "", string q = "")
        {
            ViewBag.CategoryLabelsUri = categoryLabelsUri;
            ViewBag.CategoryUri = categoryUri;
            ViewData["LanguagesList"] = enabledLanguagesList;
            ViewData["SearchKeyword"] = string.IsNullOrEmpty(q) ? string.Empty : q;
            DataTable labelsTable = null;
            if (!string.IsNullOrEmpty(categoryLabelsUri))
            {
                var labelUri = UrlHelper.GetRequestUrl(URLType.NOA) + categoryLabelsUri +
                               (q == "" || q == null ? "" : "&q=" + q) + (qlang == "" ? "" : "&qlang=" + qlang);
                var labelCategoryUri = UrlHelper.GetRequestUrl(URLType.NOA) + categoryUri;
                labelsTable = labelService.GetLabelsGrid(labelUri, labelCategoryUri, 1, MaxPageSize,
                    enabledLanguagesList);
            }
            return PartialView("~/Views/GlobalSettings/Labels/LabelsGrid.cshtml", labelsTable);
        }

        public ActionResult EditLabelCategoryGrid(string categoryUri, List<SystemLanguageViewModel> enabledLanguagesList,
            LabelCategoryViewModel labelCategory = null)
        {
            DataTable labelsTable = categoryUri == ""
                    ? labelService.GetMultilingualLabelCategory(null)
                    : labelService.GetMultilingualLabelCategory(UrlHelper.GetRequestUrl(URLType.NOA) + categoryUri, labelCategory, enabledLanguagesList);

            ViewData["LanguagesList"] = enabledLanguagesList;
            return PartialView("~/Views/GlobalSettings/Labels/LabelCategoryEditGrid.cshtml", labelsTable);
        }


        public ActionResult ReadLabelCategory([DataSourceRequest] DataSourceRequest request, string categoryLabelsUri,
            string categoryUri)
        {
            var labelsTable = labelService.GetLabelsGrid(categoryLabelsUri, categoryUri, request.Page, request.PageSize);

            return Json(labelsTable.ToDataSourceResult(request));
        }


        private ListViewModel<LabelCategoryViewModel> GetLabelCategories(string q, string labelCategoryUri, int page,
            int displayPagesize, [DataSourceRequest] DataSourceRequest request)
        {
            var url = labelCategoryUri + "?contains_businessprocesses=false&" +
                      UtilitiesHelper.GetOffsetLimitQueryString(page, displayPagesize, q);
            if (request != null)
            {
                url += PageHelper.GetQueryString(request, QueryString.LabelCategories);
            }
            url += "&lang=en";

            var labelCategoryAllModel = labelService.GetLabelCategories(url);
            foreach (var item in labelCategoryAllModel.Data)
            {
                item.labelsID = "...";
            }

            if (request == null)
            {
                labelCategoryAllModel.Data =
                    labelCategoryAllModel.Data.Skip((page - 1)*displayPagesize).Take(DefaultPageSize).ToList();
            }

            return labelCategoryAllModel;
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult GetLabels(string labelsUrl)
        {
            var labels = new List<object>();
            foreach (var labelUrl in labelsUrl.Split(','))
            {
                var labelViewModel = labelService.GetLabels(UrlHelper.GetRequestUrl(URLType.NOA) + labelUrl);
                labels.Add(new {labels = labelViewModel.Data, uri = labelUrl});
            }
            return Json(labels);
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult ReadLabelGlobalCategories(string q, string labelCategoryUri,
            [DataSourceRequest] DataSourceRequest request)
        {
            var labelCategories = GetLabelCategories(q, labelCategoryUri, 1, MaxPageSize, request);
            var result = new DataSourceResult
            {
                Data = labelCategories.Data.ToList(),
                Total = labelCategories.Header.Total
            };
            return Json(result);
        }

        [AcceptVerbs(HttpVerbs.Put)]
        public ActionResult SaveLabelCategoryOrder(string labelCategoryUri, string labelCategoryOrderData)
        {
            labelService.UpdateLabelCategory(UrlHelper.GetRequestUrl(URLType.NOA) + labelCategoryUri,
                labelCategoryOrderData);
            return JsonHelper.GetJsonResult(true, null, null, null,
                MessageType.SUCCESS_UPDATED);
        }

        [AcceptVerbs(HttpVerbs.Delete)]
        public void DeleteLabelCategory(string labelUri)
        {
            labelService.DeleteLabelCategory(UrlHelper.GetRequestUrl(URLType.NOA) + labelUri);
            AuthorizationHelper.Initialize();
        }

        public ActionResult ReadLabels([DataSourceRequest] DataSourceRequest request, string categoryLabelsUri,
            string categoryUri, string q = "")
        {
            var query = categoryLabelsUri == null
                ? null
                : UrlHelper.GetRequestUrl(URLType.NOA) + categoryLabelsUri + (q == "" || q == null ? "" : "&q=" + q);
            if (request != null)
            {
                query += PageHelper.GetQueryString(request, QueryString.LabelCategories);
            }

            ViewData["SearchKeyword"] = string.IsNullOrEmpty(q) ? string.Empty : q;
            var labelsTable = labelService.GetLabelsGrid(query, UrlHelper.GetRequestUrl(URLType.NOA) + categoryUri, 1,
                MaxPageSize);

            return Json(labelsTable.ToDataSourceResult(request));
        }

        public ActionResult SaveLabelCategory(string jsonData, string labelData, string deleteLabelData,
            string categoryLabelsUri, string categoryUri)
        {
            var labelCategoryViewModel = new LabelCategoryViewModel();
            var removedData = new List<string>();
            var un_removeData = new Dictionary<string, string>();

            if (deleteLabelData != "")
            {
                var deleteLabels = JsonConvert.DeserializeObject<List<LabelViewModel>>(deleteLabelData);
                foreach (var lable in deleteLabels)
                {
                    try
                    {
                        labelService.DeleteLabelCategory(UrlHelper.GetRequestUrl(URLType.NOA) + lable.Uri);
                        removedData.Add(lable.abbreviation);
                    }
                    catch (HttpException ex)
                    {
                        dynamic errorResult = JsonConvert.DeserializeObject(ex.Message);
                        string message = errorResult.message;
                        un_removeData.Add(lable.abbreviation, message);
                    }
                }
            }

            if (categoryUri != null)
            {
                var labelCategory = JsonConvert.DeserializeObject<LabelCategoryViewModel>(jsonData);
                var updatedLabelCategory =
                    labelService.GetLabelCategory(UrlHelper.GetRequestUrl(URLType.NOA) + labelCategory.uri +
                                                  "?multilingual=yes");
                updatedLabelCategory.multi_lang_name = labelCategory.multi_lang_name;

                labelService.UpdateLabel(
                    UrlHelper.GetRequestUrl(URLType.NOA) + labelCategory.uri + "?multilingual=yes",
                    JsonConvert.SerializeObject(updatedLabelCategory, new JsonSerializerSettings
                    {
                        ContractResolver = new CleanUpPropertiesResolver(new List<string> {"id", "name", "uri"})
                    }));

                if (!string.IsNullOrEmpty(labelData))
                {
                    var labels = JsonConvert.DeserializeObject<List<LabelViewModel>>(labelData);
                    foreach (var label in labels)
                    {
                        if (label.Uri != null)
                        {
                            var existLabel =
                                labelService.GetLabel(UrlHelper.GetRequestUrl(URLType.NOA) + label.Uri +
                                                      "?multilingual=yes");
                            var updatedLabel = (LabelViewModel) existLabel.Clone();
                            updatedLabel.abbreviation = label.abbreviation;
                            updatedLabel.multi_lang_name = label.multi_lang_name;
                            labelService.UpdateLabel(
                                UrlHelper.GetRequestUrl(URLType.NOA) + label.Uri + "?multilingual=yes",
                                JsonConvert.SerializeObject(updatedLabel, new JsonSerializerSettings
                                {
                                    ContractResolver =
                                        new CleanUpPropertiesResolver(new List<string>
                                        {
                                            "id",
                                            "Uri",
                                            "category",
                                            "system",
                                            "name"
                                        })
                                }));
                        }
                        else
                        {
                            label.id = label.abbreviation;
                            labelService.UpdateNewLabel(UrlHelper.GetRequestUrl(URLType.NOA) + categoryLabelsUri,
                                JsonConvert.SerializeObject(label, new JsonSerializerSettings
                                {
                                    ContractResolver = new CleanUpPropertiesResolver(new List<string> {"system"})
                                }));
                        }
                    }
                }

                ViewBag.CategoryLabelsUri = categoryLabelsUri;
                ViewBag.CategoryUri = categoryUri;
                var parameters = new JsonResult
                {
                    Data = new {categoryLabelsUri, categoryUri, removedData, un_removeData}
                };
                return JsonHelper.GetJsonResult(true, null, parameters.Data,
                    null, MessageType.SUCCESS_UPDATED);
            }
            else
            {
                var labelCategoryUri = UrlHelper.GetRequestUrl(URLType.NOA) + "/labelcategories?multilingual=yes";
                var labelCategory = JsonConvert.DeserializeObject<LabelCategoryViewModel>(jsonData);
                labelCategory.name =
                    labelCategory.multi_lang_name.Where(x => x.lang == "en").Select(c => c.text).FirstOrDefault();

                labelCategoryViewModel = labelService.UpdateNewCategoryLabel(labelCategoryUri,
                    JsonConvert.SerializeObject(labelCategory, new JsonSerializerSettings
                    {
                        ContractResolver = new CleanUpPropertiesResolver(null)
                    }));

                ViewBag.CategoryLabelsUri = labelCategoryViewModel.labels + "?multilingual=yes";
                ViewBag.CategoryUri = categoryUri;
                var parameters = new JsonResult
                {
                    Data =
                        new
                        {
                            categoryLabelsUri = labelCategoryViewModel.labels + "?multilingual=yes",
                            categoryUri = labelCategoryViewModel.uri + "?multilingual=yes",
                            removedData,
                            un_removeData
                        }
                };
                return JsonHelper.GetJsonResult(true, null, parameters.Data,
                    null, MessageType.SUCCESS_UPDATED);
            }
        }

        public ActionResult LabelCategories(string modelUri, string q = "")
        {
            var model = AuthorizationHelper.Initialize().GetModel(modelUri);
            ViewBag.ModelUri = modelUri;
            ViewBag.ModelId = model.id;
            ViewBag.ModelName = model.short_name;
            return PartialView("~/Views/LabelCategories/LabelCategories.cshtml");
        }

        public ActionResult GetFilterLabelCategories(string modelUri, string q = "")
        {
            var version = AuthorizationHelper.Initialize().Version;

            var labelCategoryUri = version.GetEntryByName("labelcategories").Uri.ToString();

            var model = AuthorizationHelper.Initialize().GetModel(modelUri);

            ViewBag.LabelCategoryUri = labelCategoryUri;
            ViewBag.ModelUri = modelUri;
            ViewBag.ModelId = model.id;
            ViewData["DefaultPageSize"] = DefaultPageSize;

            return PartialView("~/Views/LabelCategories/LabelCategoriesGrid.cshtml");
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult ReadLabelCategories(string q, string modelUri, string labelCategoryUri,
            [DataSourceRequest] DataSourceRequest request)
        {
            var labelCategories = new ListViewModel<LabelCategoryViewModel>();

            if (!string.IsNullOrEmpty(labelCategoryUri))
            {
                if (System.Web.HttpContext.Current.Session["LabelCategoryViewModelList"] == null)
                    System.Web.HttpContext.Current.Session["LastFilterLabelCategoryViewModelList"] = "";

                if (q == null)
                    q = "";

                if (System.Web.HttpContext.Current.Session["LastFilterLabelCategoryViewModelList"].ToString() != q)
                    System.Web.HttpContext.Current.Session["LabelCategoryViewModelList"] = null;

                labelCategories = GetLabelCategories(q, modelUri, labelCategoryUri, request.Page, DefaultPageSize,
                    PageHelper.GetQueryString(request, QueryString.LabelCategories));
            }
            else
            {
                labelCategories.Data = new List<LabelCategoryViewModel>();
                labelCategories.Header = new HeaderViewModel();
            }

            var result = new DataSourceResult
            {
                Data = labelCategories.Data,
                Total = labelCategories.Header.Total
            };

            System.Web.HttpContext.Current.Session["LastFilterLabelCategoryViewModelList"] = q;
            return Json(result);
        }


        private ListViewModel<LabelCategoryViewModel> GetLabelCategories(string q, string modelUri,
            string labelCategoryUri, int page, int displayPagesize, string sort)
        {
            var model = AuthorizationHelper.Initialize().GetModel(modelUri);
            var systemLabelCategory =
                labelService.GetLabelCategories(labelCategoryUri + "?" +
                                                UtilitiesHelper.GetOffsetLimitQueryString(page, displayPagesize, q) +
                                                sort + "&lang=en");

            BindingLabelCategories(model, systemLabelCategory, q, page, sort);
            return
                (ListViewModel<LabelCategoryViewModel>)
                    System.Web.HttpContext.Current.Session["LabelCategoryViewModelList"];
        }

        private void BindingLabelCategories(ModelViewModel model,
            ListViewModel<LabelCategoryViewModel> systemLabelCategory, string q, int page, string sort)
        {
            if (systemLabelCategory.Data.Count > 0)
            {
                var modelLabelCategory =
                    labelService.GetLabelCategories(model.label_categories + "?" +
                                                    UtilitiesHelper.GetOffsetLimitQueryString(page, MaxPageSize, q) +
                                                    sort + "&lang=en").Data.ToDictionary(x => x.labels, x => x);
                var modelLabelCategoryCount = modelLabelCategory.Count();
                var systemLabelCategoryCount = systemLabelCategory.Data.Count();

                for (var index = 0; index < systemLabelCategoryCount; index++)
                {
                    var systemCategory = systemLabelCategory.Data[index];
                    IEnumerable<LabelViewModel> labelViewModel =
                        labelService.GetLabels(UrlHelper.GetRequestUrl(URLType.NOA) + systemCategory.labels).Data;
                    systemCategory.labelsID = string.Join(", ", labelViewModel.Select(l => l.abbreviation).ToArray());

                    for (var i = 0; i < modelLabelCategoryCount; i++)
                    {
                        modelLabelCategory.TryGetValue(systemCategory.labels, out LabelCategoryViewModel labelCategory);

                        if (labelCategory != null)
                        {
                            systemCategory.is_required = labelCategory.is_required;
                            systemCategory.used_for_authorization = labelCategory.used_for_authorization;
                            systemCategory.uri = labelCategory.uri;
                            systemCategory.activeForModel = true;
                        }
                        else
                        {
                            systemCategory.is_required = false;
                            systemCategory.used_for_authorization = false;
                            systemCategory.activeForModel = false;
                        }
                    }
                }
            }

            System.Web.HttpContext.Current.Session["LabelCategoryViewModelList"] = systemLabelCategory;
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult SaveLabelCategories(string labelCategoryData, string modelUri)
        {
            var model = AuthorizationHelper.Initialize().GetModel(modelUri);
            var labelCategories = JsonConvert.DeserializeObject<List<LabelCategoryViewModel>>(labelCategoryData);
            var modelLabelCategory = labelService.GetLabelCategories(model.label_categories + "?multilingual=yes");
            foreach (var category in labelCategories)
            {
                if (category.activeForModel)
                {
                    if (modelLabelCategory.Data.Where(m => m.uri.Contains(category.uri)).Count() != 0)
                    {
                        labelService.UpdateLabelCategory(
                            UrlHelper.GetRequestUrl(URLType.NOA) + category.uri + "?multilingual=yes",
                            JsonConvert.SerializeObject(category,
                                new JsonSerializerSettings
                                {
                                    ContractResolver = new CleanUpPropertiesResolver(new List<string> {"id"})
                                }));
                    }
                    else
                    {
                        labelService.UpdateNewCategoryLabel(model.label_categories + "?multilingual=yes",
                            JsonConvert.SerializeObject(category,
                                new JsonSerializerSettings {ContractResolver = new CleanUpPropertiesResolver(null)}));
                    }
                }
                else
                {
                    if (modelLabelCategory.Data.Any(m => m.uri.Contains(category.uri)))
                    {
                        labelService.UpdateLabelCategory(UrlHelper.GetRequestUrl(URLType.NOA) + category.uri,
                            JsonConvert.SerializeObject(category,
                                new JsonSerializerSettings
                                {
                                    ContractResolver = new CleanUpPropertiesResolver(new List<string> {"id"})
                                }));
                        labelService.DeleteLabelCategory(UrlHelper.GetRequestUrl(URLType.NOA) + category.uri);
                    }
                }
            }

            System.Web.HttpContext.Current.Session["LabelCategoryViewModelList"] = null;
            return LabelCategories(modelUri);
        }

        private List<SystemLanguageViewModel> GetEnableSystemLanguagesList()
        {
            VersionViewModel version = AuthorizationHelper.Initialize().Version;
            string uri = version.GetEntryByName("system_languages").Uri + "?caching=false&" + OffsetLimitQuery;
            ListViewModel<SystemLanguageViewModel> systemLanguages = globalSettingService.GetSystemLanguages(uri);
            return systemLanguages.Data.Where(lang => lang.Enabled).ToList();
        }
    }
}
