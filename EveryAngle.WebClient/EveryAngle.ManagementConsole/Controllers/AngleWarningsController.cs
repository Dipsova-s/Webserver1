using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Logging;
using EveryAngle.ManagementConsole.Helpers;
using EveryAngle.ManagementConsole.Helpers.AngleWarnings;
using EveryAngle.Shared.Globalization;
using EveryAngle.Shared.Helpers;
using EveryAngle.WebClient.Service.Security;
using Kendo.Mvc.UI;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace EveryAngle.ManagementConsole.Controllers
{
    public class AngleWarningsController : BaseController
    {
        #region private variables 

        private readonly IModelService _modelService;
        private readonly IGlobalSettingService _globalSettingService;
        private readonly IAngleWarningsAutoSolver _angleWarningsAutoSolver;

        #endregion

        #region constructor

        public AngleWarningsController(
            IModelService modelService,
            IGlobalSettingService globalSettingService,
            IAngleWarningsAutoSolver angleWarningsAutoSolver,
            SessionHelper sessionHelper)
        {
            _modelService = modelService;
            _globalSettingService = globalSettingService;
            _angleWarningsAutoSolver = angleWarningsAutoSolver;
            SessionHelper = sessionHelper;

            _angleWarningsAutoSolver.Initialize(SessionHelper);
        }

        [ExcludeFromCodeCoverage]
        public AngleWarningsController(
            IModelService modelService,
            IGlobalSettingService globalSettingService,
            IAngleWarningsAutoSolver angleWarningsAutoSolver)
        {
            _modelService = modelService;
            _globalSettingService = globalSettingService;
            _angleWarningsAutoSolver = angleWarningsAutoSolver;

            _angleWarningsAutoSolver.Initialize(SessionHelper);
        }

        #endregion

        #region public functions

        public ActionResult GetAngleWarnings(string modelUri, string modelId)
        {
            var version = SessionHelper.Version;
            var model = SessionHelper.GetModel(modelUri);
            ViewBag.TasksUri = version.GetEntryByName("tasks").Uri.ToString();
            ViewBag.TaskHistoryUri = version.GetEntryByName("eventlog").Uri.ToString();
            ViewBag.ModelUri = modelUri;
            ViewBag.ModelId = modelId;
            ViewBag.UserId = SessionHelper.CurrentUser.Id;
            ViewBag.FieldsUri = model.FieldsUri.ToString();
            ViewBag.DefaultPagesize = DefaultPageSize;
            ViewBag.MaxPageSize = MaxPageSize;
            ViewBag.MaxDomainElementsForSearch = SessionHelper.SystemSettings.max_domainelements_for_search;
            ViewBag.CanAccessViaWebClient = SessionHelper.Session.IsValidToAccessWebClient(modelUri).ToString().ToLowerInvariant();
            ViewBag.ClientSettings = SessionHelper.CurrentUser.Settings.client_settings;

            var offsetLimitQuery = UtilitiesHelper.GetOffsetLimitQueryString(1, MaxPageSize);
            var fieldCategory = _globalSettingService.GetFieldCategories(SessionHelper.Version.GetEntryByName("field_categories").Uri +
                                                        "?" + offsetLimitQuery);

            ViewData["fieldCategories"] = JsonConvert.SerializeObject(fieldCategory.Data);
            ViewData["BusinessProcesses"] = _globalSettingService.GetBusinessProcesses(SessionHelper.Version.GetEntryByName("business_processes").Uri + "?" + offsetLimitQuery);
            ViewData["ModelData"] = model;

            return PartialView("~/Views/Model/AngleWarnings/AngleWarnings.cshtml");
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult ReadAngleWarnings([DataSourceRequest] DataSourceRequest request, string modelUri, FormCollection formData)
        {
            var model = SessionHelper.GetModel(modelUri);
            string limitOffsetQueryString = UtilitiesHelper.GetOffsetLimitQueryString(1, MaxPageSize);
            var result = new AngleWarningsDataSourceResult();

            if (formData["level"] == "1")
            {
                result = GetAngleWarningsFirstLevel(formData, model, limitOffsetQueryString);
                result.Summary.WarningsSolvable = GetNumberOfSolvableFieldsViaInputFile(result);
            }
            else if (formData["level"] == "2")
            {
                result = GetAngleWarningsSecondLevel(formData, model, limitOffsetQueryString);
            }
            else if (formData["level"] == "3")
            {
                result = GetAngleWarningsThirdLevel(formData, model, limitOffsetQueryString);
            }

            return Json(result, JsonRequestBehavior.AllowGet);
        }

        private int GetNumberOfSolvableFieldsViaInputFile(AngleWarningsDataSourceResult dataSource)
        {
            return _angleWarningsAutoSolver.GetNumberOfSolvableFieldsViaInputFile(dataSource);
        }

        private AngleWarningsDataSourceResult GetAngleWarningsFirstLevel(FormCollection formData, ModelViewModel model, string limitOffsetQueryString)
        {
            AngleWarningsDataSourceResult result;
            string requestUri = model.angle_warnings_summary.ToString() + string.Format("?include_public={0}&include_private={1}&include_validated={2}&include_angles={3}&include_templates={4}&created_by={5}&" + limitOffsetQueryString, formData["include_public"], formData["include_private"], formData["include_validated"], formData["include_angles"], formData["include_templates"], formData["created_by"]);
            var angleWarningsResult = this._modelService.GetAngleWarningFirstLevel(requestUri);
            
            AngleWarningsAutoSolver.SetFirstLevelWarnings(angleWarningsResult);
            AngleWarningsAutoSolver.SetModel(model);
            
            var data = JsonConvert.DeserializeObject<List<AngleWarningFirstLevelViewmodel>>(angleWarningsResult.SelectToken("data").ToString());

            var angleWarningViewModelList = new List<AngleWarningsViewModel>();
            MapWarningFirstLevel(data, angleWarningViewModelList, Convert.ToBoolean(formData["include_angles"]), Convert.ToBoolean(formData["include_templates"]));

            result = new AngleWarningsDataSourceResult
            {
                Data = angleWarningViewModelList,
                Summary = JsonConvert.DeserializeObject<AngleWarningsSummaryViewModel>(angleWarningsResult.SelectToken("summary").ToString())
            };
            return result;
        }

        private AngleWarningsDataSourceResult GetAngleWarningsSecondLevel(FormCollection formData, ModelViewModel model, string limitOffsetQueryString)
        {
            AngleWarningsDataSourceResult result;
            string requestUri = EveryAngle.Shared.Helpers.UrlHelper.GetRequestUrl(URLType.NOA) + formData["uri"] + "&" + limitOffsetQueryString;
            var angleWarningsResult = this._modelService.GetAngleWarningSecondLevel(requestUri);
            var data = JsonConvert.DeserializeObject<List<AngleWarningSecondLevelViewmodel>>(angleWarningsResult.SelectToken("data").ToString());

            var angleWarningViewModelList = new List<AngleWarningsViewModel>();
            List<dynamic> objectNameList = new List<dynamic>();
            List<FollowupViewModel> jumpNameList = new List<FollowupViewModel>();
            List<Field> fieldNameList = new List<Field>();
            List<dynamic> sourceList = new List<dynamic>();
            WarningType warningType = WarningType.Other;
            GetDataForSecondLevelWarningName(model, data, ref objectNameList, ref jumpNameList, fieldNameList, sourceList, ref warningType);
            foreach (AngleWarningSecondLevelViewmodel dataSecondLevel in data)
            {
                var field = fieldNameList.FirstOrDefault(w => w.id == dataSecondLevel.Field);
                if (field != null)
                {
                    dataSecondLevel.FieldType = field.fieldtype;
                }

                var thirdLevelData = GetAllThirdLevelData(dataSecondLevel.Uri);
                dataSecondLevel.HasDisplaysUsedInAutomationTasks = thirdLevelData.Any(x => x.IsUsedInAutomationTask);
            }

            MapWarningSecondLevel(formData, data, angleWarningViewModelList, objectNameList, jumpNameList, fieldNameList, sourceList, warningType);

            result = new AngleWarningsDataSourceResult
            {
                Data = angleWarningViewModelList,
                Solutions = JsonConvert.DeserializeObject<List<AngleWarningsSolutionsViewModel>>(angleWarningsResult.SelectToken("solutions").ToString()),
                SolutionId = int.Parse(formData["id"])
            };
            return result;
        }

        private List<AngleWarningThirdLevelViewmodel> GetAllThirdLevelData(string uri)
        {
            string requestUri = EveryAngle.Shared.Helpers.UrlHelper.GetRequestUrl(URLType.NOA) + uri + "&" + UtilitiesHelper.GetOffsetLimitQueryString(1, MaxPageSize);
            var angleWarningsResult = this._modelService.GetAngleWarningThirdLevel(requestUri);
            return JsonConvert.DeserializeObject<List<AngleWarningThirdLevelViewmodel>>(angleWarningsResult.SelectToken("data").ToString());
        }

        private AngleWarningsDataSourceResult GetAngleWarningsThirdLevel(FormCollection formData, ModelViewModel model, string limitOffsetQueryString)
        {
            AngleWarningsDataSourceResult result;
            string requestUri = EveryAngle.Shared.Helpers.UrlHelper.GetRequestUrl(URLType.NOA) + formData["uri"] + "&" + limitOffsetQueryString;
            var angleWarningsResult = this._modelService.GetAngleWarningThirdLevel(requestUri);
            var data = JsonConvert.DeserializeObject<List<AngleWarningThirdLevelViewmodel>>(angleWarningsResult.SelectToken("data").ToString());

            var angleWarningViewModelList = new List<AngleWarningsViewModel>();
            List<dynamic> angleNameList = GetAngleNameList(model, data);
            List<dynamic> displayNameLIst = GetDisplayNameList(data);
            MapWarningThirdLevel(formData, data, angleWarningViewModelList, angleNameList, displayNameLIst);

            result = new AngleWarningsDataSourceResult
            {
                Data = angleWarningViewModelList,
            };
            return result;
        }

        public ActionResult GetAllJumps(string jumpUri)
        {
            var followUpList = this._modelService.GetFollowups(jumpUri + (jumpUri.Contains("?") ? "&" : "?") + UtilitiesHelper.GetOffsetLimitQueryString(1, MaxPageSize));
            return Json(followUpList, JsonRequestBehavior.AllowGet);
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult ExecuteAngleWarnings(string taskData)
        {
            var version = SessionHelper.Version;
            var angleWarningTask = _modelService.CreateTask(version.GetEntryByName("tasks").Uri.ToString(), taskData);
            var executionTask = _modelService.CreateTask($"{angleWarningTask.Uri}/execution",
                "{\"start\":true,\"reason\":\"Manual execute from MC\"}");
            return Json(executionTask, JsonRequestBehavior.AllowGet);
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult ExecuteAngleWarningsUsingInputFile(string modelId)
        {
            string json;
            try
            {
                json = _angleWarningsAutoSolver.ExecuteAngleWarningsUsingInputFile(modelId);
                
                if (json == "")
                {
                    throw new Exception("Angle warnings solve request is empty.");
                }
            }
            catch (Exception e)
            {
                throw new Exception($"Unable to construct automatic solving request: {e.Message}");
            }
            
            var version = SessionHelper.Version;
            var angleWarningTask = _modelService.CreateTask(version.GetEntryByName("tasks").Uri.ToString(), json);
            var executionTask = _modelService.CreateTask($"{angleWarningTask.Uri}/execution", "{\"start\":true,\"reason\":\"Manual execute from MC\"}");

            return Json(executionTask, JsonRequestBehavior.AllowGet);
        }

        public ActionResult CheckExecuteAngleWarnings(string uri)
        {
            var angleWarningTask = _modelService.GetTask(uri);
            return Json(angleWarningTask, JsonRequestBehavior.AllowGet);
        }

        [AcceptVerbs(HttpVerbs.Get)]
        public int AreSomeAutoSolveAnglesPartOfAutomationTasks()
        {
            return AngleWarningsAutoSolver.SomeAnglesPartOfAutomationTasks ? 1 : 0;
        }

        public ActionResult GetAngleWarningTaskHistory(string detailUri)
        {
            var taskHistory = _modelService.GetTaskHistories(detailUri).Data.FirstOrDefault(w => !string.IsNullOrEmpty(w.correlation_id));
            return Json(taskHistory, JsonRequestBehavior.AllowGet);
        }

        [AcceptVerbs(HttpVerbs.Delete)]
        public void DeleteAngleWarningTask(string taskUri)
        {
            _modelService.DeleteTask(taskUri);
        }

        public ActionResult GetAllThirdLevel(string uri)
        {
            string requestUri = EveryAngle.Shared.Helpers.UrlHelper.GetRequestUrl(URLType.NOA) + uri + "&" + UtilitiesHelper.GetOffsetLimitQueryString(1, MaxPageSize);
            var angleWarningsResult = this._modelService.GetAngleWarningThirdLevel(requestUri);
            var data = JsonConvert.DeserializeObject<List<AngleWarningThirdLevelViewmodel>>(angleWarningsResult.SelectToken("data").ToString());

            return Json(data, JsonRequestBehavior.AllowGet);
        }

        #endregion

        #region private functions

        public class AngleWarningsDataSourceResult : DataSourceResult
        {
            public AngleWarningsSummaryViewModel Summary { get; set; }

            public List<AngleWarningsSolutionsViewModel> Solutions { get; set; }

            public int SolutionId { get; set; }
        }

        private string GetAngleWarningNameFirstLevel(string id)
        {
            Dictionary<string, string> angleWarningMappers = new Dictionary<string, string>
            {
                { "unsupported_start_object", Resource.MC_UnsupportedStartObject },
                { "unsupported_jump", Resource.MC_UnsupportedJump },
                { "unsupported_filter_field", Resource.MC_UnsupportedFilterField },
                { "unsupported_display_field", Resource.MC_UnsupportedDisplayField },
                { "unsupported_grouping_field", Resource.MC_UnsupportedGroupingField },
                { "unsupported_aggregation_field", Resource.MC_UnsupportedAggregationField },
                { "unsupported_sorting_field", Resource.MC_UnsupportedSortingField },
                { "other_warnings", Resource.MC_OtherWarnings },
            };
            if (!angleWarningMappers.TryGetValue(id, out string name))
            {
                name = id;
            }
            return name;
        }

        private List<dynamic> GetAngleNameList(ModelViewModel model, List<AngleWarningThirdLevelViewmodel> data)
        {
            var uriList = new List<string>();
            var angleIdList = data.Select(x => x.AngleId).Distinct().ToList();
            int numberOfAnglePerRequest = 30;

            for (int i = 0; i < Math.Ceiling(data.Count / (decimal)numberOfAnglePerRequest); i++)
            {
                List<string> angles = angleIdList.Skip(i * numberOfAnglePerRequest).Take(numberOfAnglePerRequest).ToList();
                string ids = string.Join(",", angles);
                string offsetLimit = UtilitiesHelper.GetOffsetLimitQueryString(1, numberOfAnglePerRequest);
                string uri = $"{model.Uri}/angles?lang=en&ids={ids}&{offsetLimit}";
                uriList.Add(uri);
            }

            List<dynamic> angleNameList = new List<dynamic>();
            UrlHelperExtension.ParallelRequest(uriList, true).ForEach(delegate (Task<JObject> task)
            {
                if (task.Status != TaskStatus.Faulted)
                {
                    var angles = JsonConvert.DeserializeObject<List<dynamic>>(task.Result.SelectToken("angles").ToString());
                    angleNameList.AddRange(angles);
                }
            });
            return angleNameList;
        }

        private List<dynamic> GetDisplayNameList(List<AngleWarningThirdLevelViewmodel> data)
        {
            var displayUriList = data.Where(x => !string.IsNullOrEmpty(x.DisplayId)).Select(x => EveryAngle.Shared.Helpers.UrlHelper.GetRequestUrl(URLType.NOA) + x.DisplayUri + "?lang=en").Distinct().ToList();

            List<dynamic> displayNameList = new List<dynamic>();
            UrlHelperExtension.ParallelRequest(displayUriList, true).ForEach(delegate (Task<JObject> task)
            {
                if (task.Status != TaskStatus.Faulted)
                    displayNameList.Add(task.Result);
            });
            return displayNameList;
        }

        private List<dynamic> GetObjectNameList(ModelViewModel model, List<AngleWarningSecondLevelViewmodel> data)
        {
            var uriList = new List<string>();
            var objectIdList = data.Select(x => x.Object).Distinct().ToList();
            int numberOfObjectPerRequest = 30;

            for (int i = 0; i < Math.Ceiling(data.Count / (decimal)numberOfObjectPerRequest); i++)
            {
                List<string> objects = objectIdList.Skip(i * numberOfObjectPerRequest).Take(numberOfObjectPerRequest).ToList();
                string output = string.Join(",", objects);
                string uri = model.ClassesUri + "?ids=" + output + "&" + UtilitiesHelper.GetOffsetLimitQueryString(1, numberOfObjectPerRequest);
                uriList.Add(uri);
            }

            List<dynamic> objectNameList = new List<dynamic>();
            UrlHelperExtension.ParallelRequest(uriList, true).ForEach(delegate (Task<JObject> task)
            {
                if (task.Status != TaskStatus.Faulted)
                {
                    var classes = JsonConvert.DeserializeObject<List<dynamic>>(task.Result.SelectToken("classes").ToString());
                    objectNameList.AddRange(classes);
                }
            });
            return objectNameList;
        }

        private void GetFieldNameList(ModelViewModel model, List<AngleWarningSecondLevelViewmodel> data, List<Field> fieldNameList, List<dynamic> sourceList)
        {
            var uriList = new List<string>();
            var fieldIdList = data.Select(x => x.Field).Distinct().ToList();
            int numberOfFieldPerRequest = 30;

            for (int i = 0; i < Math.Ceiling(data.Count / (decimal)numberOfFieldPerRequest); i++)
            {
                List<string> fields = fieldIdList.Skip(i * numberOfFieldPerRequest).Take(numberOfFieldPerRequest).ToList();
                string output = string.Join(",", fields);
                string uri = model.FieldsUri + "?ids=" + output + "&" + UtilitiesHelper.GetOffsetLimitQueryString(1, numberOfFieldPerRequest);
                uriList.Add(uri);
            }

            List<string> sourceUriList = new List<string>();
            UrlHelperExtension.ParallelRequest(uriList, true).ForEach(delegate (Task<JObject> task)
            {
                if (task.Status != TaskStatus.Faulted)
                {
                    var fields = JsonConvert.DeserializeObject<List<Field>>(task.Result.SelectToken("fields").ToString());
                    fieldNameList.AddRange(fields);
                    var sources = fields.Where(x => x.source != null).Select(x => x.source.ToString()).Distinct().ToList<string>();
                    sourceUriList.AddRange(sources);
                }
            });

            UrlHelperExtension.ParallelRequest(sourceUriList, true).ForEach(delegate (Task<JObject> task)
            {
                if (task.Status != TaskStatus.Faulted)
                    sourceList.Add(task.Result);
            });
        }

        private List<FollowupViewModel> GetJumpNameList(ModelViewModel model)
        {
            string jumpUri = model.FollowupsUri.ToString() + "?" + UtilitiesHelper.GetOffsetLimitQueryString(1, MaxPageSize);
            var followUpList = this._modelService.GetFollowups(jumpUri);
            return followUpList;
        }

        private string GetSecondLevelWarningName(List<dynamic> objectNameList, List<FollowupViewModel> jumpNameList, List<Field> fieldNameList, WarningType warningType, AngleWarningSecondLevelViewmodel item, List<dynamic> sourceList)
        {
            if (warningType == WarningType.StartObject)
            {
                dynamic objectData = objectNameList.FirstOrDefault(x => x.id == item.Object);
                string objectName = GetWarningItemName(objectData?.name, item.Object);
                return string.Format("Start-Object: {0}", objectName);
            }
            else if (warningType == WarningType.Jump)
            {
                dynamic objectData = objectNameList.FirstOrDefault(x => x.id == item.Object);
                string objectName = GetWarningItemName(objectData?.name, item.Object);
                FollowupViewModel jump = jumpNameList.FirstOrDefault(x => x.id == item.Jump);
                string jumpName = GetWarningItemName(jump?.short_name, item.Jump);
                return string.Format("Object-Jump: {0}-{1}", objectName, jumpName);
            }
            else if (warningType == WarningType.Warning)
            {
                List<string> nameParts = new List<string> { "Object" };
                List<string> nameFormats = new List<string> { "{0}" };
                List<string> names = new List<string> { item.Object };
                if (!string.IsNullOrEmpty(item.Jump))
                {
                    nameParts.Add("Jump");
                    names.Add(item.Jump);
                }
                if (!string.IsNullOrEmpty(item.Field))
                {
                    nameParts.Add("Field");
                    names.Add(item.Field);
                }

                for (int i = 1; i < nameParts.Count; i++)
                {
                    nameFormats.Add("{" + i + "}");
                }
                return string.Format(string.Join("-", nameParts) + ": " + string.Join("-", nameFormats), names.ToArray());
            }
            else
            {
                dynamic objectData = objectNameList.FirstOrDefault(x => x.id == item.Object);
                string objectName = GetWarningItemName(objectData?.name, item.Object);
                dynamic field = fieldNameList.FirstOrDefault(x => x.id == item.Field);
                string sourceName = field?.source != null ? sourceList.FirstOrDefault(x => field.source.ToString().Contains(x.uri.ToString())).short_name + "-" : string.Empty;
                string fieldName = GetWarningItemName(field?.short_name, item.Field);
                return string.Format("Object-> Source-Field: {0}-> {1}{2}", objectName, sourceName, fieldName);
            }
        }

        private string GetWarningItemName(string name, string fallback)
        {
            return !string.IsNullOrEmpty(name) ? name : fallback;
        }

        private void GetDataForSecondLevelWarningName(ModelViewModel model, List<AngleWarningSecondLevelViewmodel> data, ref List<dynamic> objectNameList, ref List<FollowupViewModel> jumpNameList, List<Field> fieldNameList, List<dynamic> sourceList, ref WarningType warningType)
        {
            if (data != null && data.Count > 0)
            {
                if (data.First().Uri.Contains("_start_object"))
                {
                    objectNameList = GetObjectNameList(model, data);
                    warningType = WarningType.StartObject;
                }
                else if (data.First().Uri.Contains("_jump"))
                {
                    objectNameList = GetObjectNameList(model, data);
                    jumpNameList = this.GetJumpNameList(model);
                    warningType = WarningType.Jump;
                }
                else if (!data.First().Uri.Contains("other_warnings"))
                {
                    objectNameList = GetObjectNameList(model, data);
                    GetFieldNameList(model, data, fieldNameList, sourceList);
                    warningType = WarningType.Other;
                }
                else
                {
                    warningType = WarningType.Warning;
                }
            }
        }

        private void MapWarningThirdLevel(FormCollection formData, List<AngleWarningThirdLevelViewmodel> data, List<AngleWarningsViewModel> angleWarningViewModelList, List<dynamic> angleNameList, List<dynamic> displayNameLIst)
        {
            int index = 1;
            foreach (var item in data)
            {
                StringBuilder name = new StringBuilder();
                dynamic angleObject = angleNameList.FirstOrDefault(x => x.id == item.AngleId);
                AngleWarningsViewModel angleWarningViewModel = new AngleWarningsViewModel();
                angleWarningViewModel.Level = 3;
                angleWarningViewModel.fakeId = (angleWarningViewModel.ParentId * 1000) + index;

                if (angleObject != null)
                {
                    item.Type = Convert.ToBoolean(angleObject.is_template) ? "template" : "angle";
                    name.Append(angleObject.name);
                }
                else
                {
                    item.Type = "angle";
                    item.AngleUri = null;
                    name.Append(item.AngleId);
                }

                if (!string.IsNullOrEmpty(item.DisplayId))
                {
                    item.Type = "list";

                    dynamic displayObject = displayNameLIst.FirstOrDefault(x => x.id == item.DisplayId);
                    if (displayObject != null)
                    {
                        item.Type = displayObject.display_type.ToString().ToLower();
                        name.AppendFormat("\\{0}", displayObject.name);
                    }
                    else
                    {
                        item.DisplayUri = null;
                        name.AppendFormat("\\{0}", item.DisplayId);
                    }
                }

                // set access denied if no Angle and Display
                if (item.AngleUri == null && item.DisplayUri == null)
                    name.AppendFormat(" ({0})", Resource.MC_AccessDenied.ToLowerInvariant());

                angleWarningViewModel.Name = name.ToString();
                angleWarningViewModel.DataThirdLevel = item;
                angleWarningViewModel.ParentId = int.Parse(formData["id"]);
                angleWarningViewModel.Uri = item.AngleUri;
                angleWarningViewModelList.Add(angleWarningViewModel);
                index++;
            }
        }

        private void MapWarningSecondLevel(FormCollection formData,
            List<AngleWarningSecondLevelViewmodel> data,
            List<AngleWarningsViewModel> angleWarningViewModelList,
            List<dynamic> objectNameList,
            List<FollowupViewModel> jumpNameList,
            List<Field> fieldNameList,
            List<dynamic> sourceList,
            WarningType warningType)
        {
            int index = 1;
            foreach (var item in data)
            {
                var angleWarningViewModel = new AngleWarningsViewModel();
                angleWarningViewModel.DataSecondLevel = item;
                angleWarningViewModel.Level = 2;
                angleWarningViewModel.Name = GetSecondLevelWarningName(objectNameList, jumpNameList, fieldNameList, warningType, item, sourceList);
                angleWarningViewModel.hasChildren = (item.Count > 0);
                angleWarningViewModel.ParentId = int.Parse(formData["id"]);
                angleWarningViewModel.fakeId = (angleWarningViewModel.ParentId * 1000) + index;
                angleWarningViewModel.Uri = item.Uri;
                angleWarningViewModelList.Add(angleWarningViewModel);
                index++;
            }
            angleWarningViewModelList.Sort((x, y) => string.Compare(x.Name, y.Name, StringComparison.InvariantCultureIgnoreCase));
        }

        private void MapWarningFirstLevel(List<AngleWarningFirstLevelViewmodel> data, List<AngleWarningsViewModel> angleWarningViewModelList, bool includeAngles, bool includTemplates)
        {
            string itemType = "";
            if (includeAngles && includTemplates)
                itemType = "Angles/Templates ";
            else if (includeAngles)
                itemType = "Angles ";
            else if (includTemplates)
                itemType = "Templates ";

            int index = 1;
            foreach (var item in data)
            {
                var angleWarningViewModel = new AngleWarningsViewModel();
                angleWarningViewModel.DataFirstLevel = item;
                angleWarningViewModel.Id = item.Id;
                angleWarningViewModel.Level = 1;
                angleWarningViewModel.fakeId = index;
                angleWarningViewModel.Uri = item.Uri;
                angleWarningViewModel.Name = item.Severity.Equals("error") || item.Id.Equals("unsupported_filter_field") ? itemType + GetAngleWarningNameFirstLevel(item.Id) : GetAngleWarningNameFirstLevel(item.Id);
                angleWarningViewModel.hasChildren = (item.Count > 0);
                angleWarningViewModelList.Add(angleWarningViewModel);
                index++;
            }
        }

        #endregion
    }

    public enum WarningType
    {
        StartObject = 0,
        Jump = 1,
        Warning = 2,
        Other = 3
    }
}
