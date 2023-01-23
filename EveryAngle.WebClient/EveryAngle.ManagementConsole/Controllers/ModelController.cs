using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels;
using EveryAngle.Core.ViewModels.DataTransferObject;
using EveryAngle.Core.ViewModels.Directory;
using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Core.ViewModels.ModelServer;
using EveryAngle.Logging;
using EveryAngle.ManagementConsole.Helpers;
using EveryAngle.Shared.Globalization;
using EveryAngle.Shared.Helpers;
using EveryAngle.Utilities;
using EveryAngle.WebClient.Domain.Enums;
using EveryAngle.WebClient.Service;
using EveryAngle.WebClient.Service.Security;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using UrlHelper = EveryAngle.Shared.Helpers.UrlHelper;

namespace EveryAngle.ManagementConsole.Controllers
{
    [ExcludeFromCodeCoverage]
    public class ModelController : BaseController
    {
        private readonly IModelService modelService;
        private readonly IModelAgentService modelAgentService;
        private readonly IComponentService componentService;

        public ModelController(
            IModelService service,
            IModelAgentService modelAgentService,
            IComponentService componentService,
            AuthorizationHelper authorizationHelper)
        {
            this.modelService = service;
            this.modelAgentService = modelAgentService;
            this.componentService = componentService;
            this.AuthorizationHelper = authorizationHelper;
        }
        public ModelController(
            IModelService service,
            IModelAgentService modelAgentService,
            IComponentService componentService)
        {
            this.modelService = service;
            this.modelAgentService = modelAgentService;
            this.componentService = componentService;
            this.AuthorizationHelper = AuthorizationHelper.Initialize();
        }

        #region "Public"
        public ActionResult ModelClassReport()
        {
            return View("~/Views/Model/AllModels/ModelClassReport.cshtml");
        }

        public ActionResult GetAllModelServers(IEnumerable<ModelViewModel> models, SystemLicenseViewModel licenses, string modelServersUri)
        {
            ViewBag.LicensesData = licenses;
            ViewBag.ModelServersUri = modelServersUri;
            return PartialView("~/Views/Home/ModelOverView.cshtml", models);
        }

        public ActionResult GetModelOverview(string modelUri, SystemLicenseViewModel licensesData, string modelServersUri)
        {
            var model = AuthorizationHelper.Initialize().GetModelFromSession(modelUri);
            ViewBag.ConnectedUser = "0";
            ViewBag.ActiveUsersThisWeek = "0";
            ViewBag.ActiveUsersThisMonth = "0";

            if (model == null)
            {
                return PartialView("~/Views/Home/ModelOverviewItem.cshtml", null);
            }
            else
            {
                ViewBag.ModelId = model.id;
                ViewBag.ModelName = string.IsNullOrEmpty(model.short_name) ? model.id : model.short_name;
                ViewBag.AuthorizedUsers = model.authorized_users;
                ViewBag.ModelStatus = (model.IsProcessing.HasValue && model.IsProcessing.Value && model.model_status.ToLower() == "up") ? "Postprocessing" : model.model_status;
                ViewBag.ConnectedUser = model.connected_users.ToString();
                ViewBag.ActiveUsersThisWeek = model.active_this_week.ToString();
                ViewBag.ActiveUsersThisMonth = model.active_this_month.ToString();

                // Get license date
                ViewBag.LicenseDate = AuthorizationHelper.Initialize().GetModelLicenseDate(model.id, licensesData);

                if (model.ServerUri != null)
                {
                    var modelServerList = modelService.GetModelServers(model.ServerUri.ToString());
                    var modelServerCount = modelServerList.Data.Count;
                    for (var i = 0; i < modelServerCount; i++)
                    {
                        modelServerList.Data[i].ErrorWarningNumber = 0;
                        modelServerList.Data[i].IsCurrentInstance = false;
                        modelServerList.Data[i].status = bool.Equals(modelServerList.Data[i].IsProcessing, true) && modelServerList.Data[i].status.ToLowerInvariant() == "up" ? "Postprocessing" : modelServerList.Data[i].status;
                        if (modelServerList.Data[i].instance != null)
                        {
                            bool isCurrentInstance = model.current_instance == modelServerList.Data[i].instance;
                            modelServerList.Data[i].IsCurrentInstance = isCurrentInstance;
                            if (isCurrentInstance)
                                modelServerList.Data[i].ErrorWarningNumber = Convert.ToInt32(modelServerList.Data[i].error_count) + Convert.ToInt32(modelServerList.Data[i].warning_count);
                        }
                    }
                    return PartialView("~/Views/Home/ModelOverviewItem.cshtml", modelServerList.Data.OrderByDescending(server => server.type).ToList());
                }

                return PartialView("~/Views/Home/ModelOverviewItem.cshtml", new List<ModelServerViewModel>());
            }
        }

        public ActionResult GetModelServers(string modelUri, string modelId)
        {
            int parallelRequestIndex = 0;
            IList<ModelServerViewModel> modelServerViewModels = new List<ModelServerViewModel>();
            IList<AgentModelInfoViewModel> agentModelInfoViewModels = new List<AgentModelInfoViewModel>();
            DateTime currentTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, TimeZoneInfo.FindSystemTimeZoneById(TimeZoneInfo.Local.Id));
            DateTime unixEpochTime = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            ModelViewModel modelViewModel = AuthorizationHelper.GetModelById(modelId);

            ViewBag.ModelId = modelId;
            ViewBag.ModelUri = modelUri;
            ViewBag.AgentUri = modelViewModel.Agent.ToString();
            ViewBag.LicensesData = AuthorizationHelper.GetModelLicense(AuthorizationHelper.GetSystemLicenseUri());
            ViewBag.LicenseDate = AuthorizationHelper.GetModelLicenseDate(modelId, ViewBag.LicensesData);
            // M4-13788: Error 500 when created second model and then click model menu immediately
            ViewBag.ModelStatus = modelViewModel.model_status;
            ViewBag.ModelLongName = modelViewModel.long_name;
            ViewBag.ModelEnvironment = modelViewModel.environment;
            ViewBag.ModelType = modelViewModel.modelType;
            ViewBag.ConnectedUser = modelViewModel.connected_users;
            ViewBag.AuthorizedUsers = modelViewModel.authorized_users;
            ViewBag.ActiveUsersThisWeek = modelViewModel.active_this_week;
            ViewBag.ActiveUsersThisMonth = modelViewModel.active_this_month;
            ViewBag.DateToday = currentTime.ToUnixTime();
            ViewBag.DateYesterday = currentTime.AddDays(-1).ToUnixTime();

            if (modelViewModel.ServerUri != null)
            {
                List<string> modelServerRequestUrls = new List<string>
                    { modelViewModel.ServerUri.ToString(), string.Format("{0}/modelinfo", modelViewModel.Agent.ToString()) };

                UrlHelperExtension.ParallelRequest(modelServerRequestUrls, true).ForEach(delegate (Task<JObject> task)
                {
                    if (task.IsCompleted)
                    {
                        if (parallelRequestIndex == 0)
                            modelServerViewModels = JsonConvert.DeserializeObject<IList<ModelServerViewModel>>(task.Result.SelectToken("model_servers").ToString(), new UnixDateTimeConverter());
                        else
                            agentModelInfoViewModels = JsonConvert.DeserializeObject<IList<AgentModelInfoViewModel>>(task.Result.SelectToken("servers").ToString(), new UnixDateTimeConverter());

                        parallelRequestIndex++;
                    }
                });

                SetModelServersAdditionalInfo(modelServerViewModels, agentModelInfoViewModels);

                ModelServerViewModel modelServer = modelServerViewModels.Where(x => x.type.Equals("ModelServer", StringComparison.InvariantCultureIgnoreCase) || x.type.Equals("HanaServer", StringComparison.InvariantCultureIgnoreCase))
                    .OrderByDescending(x => unixEpochTime.AddMilliseconds(x.timestamp))
                    .FirstOrDefault();

                if (modelServer != null)
                {
                    modelServer.status = modelViewModel.IsProcessing.GetValueOrDefault(false) && modelServer.status.Equals("up", StringComparison.InvariantCultureIgnoreCase) ? "Postprocessing" : modelServer.status;
                    ViewBag.ServerStatus = modelServer.status;

                    if (modelServer.instance != null && modelViewModel.current_instance != null)
                    {
                        modelServer.IsCurrentInstance = modelViewModel.current_instance.Equals(modelServer.instance);
                        modelServer.currentInstanceTime = modelService.GetInstance(modelServer.instance.ToString()).modeldata_timestamp;
                    }
                }

                // re-order fow showing in UI
                modelServerViewModels = modelServerViewModels.OrderBy(s => s.id).ToList();
            }

            return PartialView("~/Views/Model/AllModels/ModelServer.cshtml", modelServerViewModels);
        }

        public ActionResult GetModelServerGraph(string modelServerId, string isCurrentInstance)
        {
            ViewBag.CurrentInstanceTime = isCurrentInstance;
            ViewBag.ModelServerId = modelServerId;

            return PartialView("~/Views/Model/AllModels/GraphicalStatus.cshtml");
        }

        public ActionResult GetModelServerGraphData(string eventLogUri, string modelServerId)
        {
            string unknowStatus = string.Empty;
            int daysInHistory = 2;
            int recordsOfTheDays = Convert.ToInt32(daysInHistory * 24 / 0.5);
            double halfHour = 30;
            int pageSize = Math.Min(MaxPageSize, 1000);
            
            List<EventLogViewModel> eventlogs = modelService.GetEventLog(eventLogUri + "?" + UtilitiesHelper.GetOffsetLimitQueryString(1, pageSize));

            IList<BarGraphData> bargraphs = new List<BarGraphData>();
            double maximumSize = 240;
            double scaleSize = maximumSize / recordsOfTheDays;

            DateTime daysBefore = DateTime.Now.AddDays(-daysInHistory).ToUniversalTime();

            for (int index = 1; index <= recordsOfTheDays; index++)
            {
                List<EventLogViewModel> logs = eventlogs.Where(x => x.timeStampDate >= daysBefore
                                                            && x.timeStampDate <= daysBefore.AddMinutes(halfHour))
                                                        .Reverse().ToList();
                if (logs.Count > 0)
                {
                    if (bargraphs.Count == 0)
                    {
                        //find previous obj
                        int logIndex = eventlogs.FindIndex(filter => filter == logs.ElementAt(0));
                        BarGraphData axis = new BarGraphData();
                        axis.Value = (index - 1) * 2.5;
                        axis.Legend = unknowStatus;
                        if (logIndex + 1 < eventlogs.Count)
                        {
                            EventLogViewModel log = eventlogs[logIndex + 1];
                            axis.Legend = log.status.Equals("initializing", StringComparison.InvariantCultureIgnoreCase) ? "Restructure" : log.status;
                        }
                        bargraphs.Add(axis);
                    }

                    double logScaleSize = scaleSize / logs.Count;
                    foreach (EventLogViewModel log in logs)
                    {
                        bargraphs.Add(new BarGraphData
                        {
                            Legend = log.status.Equals("initializing", StringComparison.InvariantCultureIgnoreCase) ? "Restructure" : log.status,
                            Value = logScaleSize
                        });
                    }
                }
                else if (bargraphs.Count > 0)
                {
                    bargraphs.Add(new BarGraphData
                    {
                        Legend = bargraphs[bargraphs.Count - 1].Legend,
                        Value = scaleSize
                    });
                }
                daysBefore = daysBefore.AddMinutes(halfHour);
            }

            // create empty graph if nothing
            if (bargraphs.Count == 0)
            {
                BarGraphData axis = new BarGraphData();
                axis.Legend = unknowStatus;
                axis.Value = maximumSize;
                bargraphs.Add(axis);
            }

            // merge the same legend (status)
            // - check current with previous legend
            // - if the same legend then add value (size)
            // - if not add a new bar
            IList<BarGraphData> result = new List<BarGraphData>();
            for (var index = 0; index < bargraphs.Count; index++)
            {
                if (result.Count != 0 && result[result.Count - 1].Legend.Equals(bargraphs[index].Legend))
                    result[result.Count - 1].Value = result[result.Count - 1].Value + bargraphs[index].Value;
                else
                    result.Add(bargraphs[index]);
            }

            return new JsonResult
            {
                Data = new
                {
                    id = modelServerId,
                    logs = eventlogs,
                    graph = result
                },
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        public ActionResult GetModelLicense(string modelId, SystemLicenseViewModel licenses)
        {
            ViewBag.ModelId = modelId;
            return PartialView("~/Views/Model/AllModels/ModelLicenseBox.cshtml", licenses);
        }

        public ActionResult GetAllModels()
        {
            AuthorizationHelper session = AuthorizationHelper.Initialize();
            var currentSession = session.Session;
            List<ModelViewModel> models = session.Models;
            IList<ModelViewModel> modelList = new List<ModelViewModel>();
            int modelCount = models.Count;
            for (var i = 0; i < modelCount; i++)
            {
                var modelViewModel = models[i];
                var date = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);
                if (modelViewModel.ServerUri != null)
                {
                    var modelServer =
                        modelService.GetModelServers(modelViewModel.ServerUri.ToString())
                            .Data.OrderByDescending(x => date.AddMilliseconds(x.timestamp))
                            .FirstOrDefault();
                    modelViewModel.Version = modelServer == null ? "" : modelServer.api_version;
                }
                modelViewModel.manageModelPrivilege =
                    currentSession.IsValidToManageModelPrivilege(modelViewModel.Uri.ToString());
                modelViewModel.model_status = (modelViewModel.IsProcessing.HasValue && modelViewModel.IsProcessing.Value && modelViewModel.model_status.ToLower() == "up") ? "Postprocessing" : modelViewModel.model_status;
                modelList.Add(modelViewModel);
            }
            return PartialView("~/Views/Model/AllModels/AllModels.cshtml", modelList);
        }

        public ActionResult GetModelsName(string ModelUri, string roleUri)
        {
            var modelInfoList = new List<Tuple<string, string, string>>();
            var currentUser = AuthorizationHelper.Initialize().CurrentUser;
            var userPrivilegedModels =
                currentUser.ModelPrivileges.Where(v => v.Privileges.manage_model == true)
                    .Select(u => u.model.ToString())
                    .ToList();
            if (userPrivilegedModels.Any())
            {
                userPrivilegedModels.ForEach(privilegedmodel =>
                {
                    var model = AuthorizationHelper.Initialize().GetModel(privilegedmodel);
                    if (model != null)
                    {
                        modelInfoList.Add(Tuple.Create(model.short_name, model.Uri.ToString(), roleUri));
                    }
                });
            }
            return Json(modelInfoList, JsonRequestBehavior.AllowGet);
        }

        public ActionResult GetModel(string modelUri)
        {
            var modelViewModel = new ModelViewModel();
            if (!string.IsNullOrEmpty(modelUri))
            {
                modelViewModel = AuthorizationHelper.Initialize().GetModel(modelUri);
            }
            ViewBag.IsCreateNewModel = string.IsNullOrEmpty(modelViewModel.id);
            ViewBag.FormTitle = ViewBag.IsCreateNewModel ? Resource.CreateNewModel : string.Format("{0} {1}", modelViewModel.short_name, Resource.MC_ModelName);
            return PartialView("~/Views/Model/AllModels/Model.cshtml", modelViewModel);
        }

        [HttpGet]
        public ActionResult ModelIdDropdownItems()
        {
            IList<ModelViewModel> models = AuthorizationHelper.Initialize().Models;
            IList<ComponentViewModel> components = componentService.GetItems().Where(x => ComponentServiceManagerType.ModelAgentService.Equals(x.Type)).ToList();
            foreach (ModelViewModel model in models)
            {
                ComponentViewModel modelAgent = components.FirstOrDefault(x => model.id.Equals(x.ModelId));
                if(modelAgent != null)
                {
                    components.Remove(modelAgent);
                }
            }
            IEnumerable<object> dropdownList = components.Select(x => new
            {
                id = x.ModelId
            });
            return Json(dropdownList, JsonRequestBehavior.AllowGet);
        }

        public ActionResult SaveModel(string jsonData, string modelUri)
        {
            VersionViewModel version = AuthorizationHelper.Initialize().Version;
            ModelViewModel modelViewModel = JsonConvert.DeserializeObject<ModelViewModel>(jsonData);
            if (string.IsNullOrEmpty(modelUri))
            {
                try
                {
                    string uri = version.GetEntryByName("models").Uri.ToString();
                    modelViewModel.active_languages = new List<string> { "en" };
                    ModelViewModel createdModel = modelService.CreateModel(uri,
                        JsonConvert.SerializeObject(modelViewModel, new JsonSerializerSettings
                        {
                            ContractResolver = new CleanUpPropertiesResolver(null)
                        }));
                    Thread.Sleep(5000);
                    modelUri = createdModel.Uri.ToString();
                }
                catch (HttpException ex)
                {
                    if (ex.GetHttpCode() != 401)
                    {
                        throw ex;
                    }
                }
                finally
                {
                    AuthorizationHelper.Initialize().DestroyAllSession();
                }
            }
            else
            {
                string updateModel = JsonConvert.SerializeObject(modelViewModel, new JsonSerializerSettings
                {
                    ContractResolver =
                            new CleanUpPropertiesResolver(new List<string>
                            {
                                "abbreviation",
                                "latest_instance",
                                "userModelPriveledge",
                                "licence_labels",
                                "active_languages",
                                "authorized_users",
                                "model_status",
                                "type",
                                "company_information",
                                "email_settings"
                            })
                });
                modelService.UpdateModel(modelUri, updateModel);
            }

            JsonResult parameters = new JsonResult { Data = new { modelUri } };
            return JsonHelper.GetJsonResult(true, null, parameters.Data, null,
                MessageType.SUCCESS_UPDATED);
        }

        public ActionResult UpdateModelInfo(string modelUri, string id, bool status)
        {
            AuthorizationHelper session = AuthorizationHelper.Initialize();
            var modelViewModel = session.Models.FirstOrDefault(x => x.Uri.ToString().Equals(modelUri, StringComparison.OrdinalIgnoreCase));

            try
            {
                modelService.UpdateModelInfo(modelViewModel.Agent.ToString(), id, status);
                session.ReloadModels();
                return JsonHelper.GetJsonResult(true, null, null,
                    null, MessageType.SUCCESS_UPDATED);
            }
            catch (Exception ex)
            {
                return JsonHelper.GetJsonResult(false, null, null, ex.Message,
                    MessageType.DEFAULT);
            }
        }

        [AcceptVerbs(HttpVerbs.Put)]
        public void ReloadHanaModel(string agentUri)
        {
            Log.SendInfo("Reload model agent");
            modelAgentService.Reload(agentUri);
        }

        [AcceptVerbs(HttpVerbs.Delete)]
        public ActionResult DeleteModel(string modelUri)
        {
            if (!modelUri.Contains("?"))
                modelUri = string.Format("{0}?are_you_sure=true", modelUri);

            modelService.DeleteModel(modelUri);
            Thread.Sleep(2000);
            AuthorizationHelper.Initialize().DestroyAllSession();

            return JsonHelper.GetJsonResult(true, null, null, null, MessageType.SUCCESS_UPDATED);
        }

        public ActionResult RenderModelServerSettings(string modelUri)
        {
            ModelViewModel modelViewModel = AuthorizationHelper.Initialize().GetModel(modelUri);
            AgentViewModel agentViewModel = modelService.GetModelAgent(modelViewModel.Agent.ToString());
            ModelServerSettings modelServerSettings = GetModelServerSettings(modelViewModel, agentViewModel.ModelserverSettings.ToString());
            AddSwitchWhenPostprocessingSetting(modelServerSettings, modelViewModel);

            // M4-24410
            ViewBag.CommentType = string.Format("{0}{1}", modelViewModel.id, "ModelServerSettings");

            return PartialView("~/Views/Model/ModelServers/ModelServerSettings.cshtml", modelServerSettings);
        }

        public ActionResult RenderExtractorSettings(string modelUri)
        {
            ModelViewModel modelViewModel = AuthorizationHelper.Initialize().GetModel(modelUri);
            AgentViewModel agentViewModel = modelService.GetModelAgent(modelViewModel.Agent.ToString());
            ModelServerSettings modelServerSettings = GetModelServerSettings(modelViewModel, agentViewModel.DownloadSettings.ToString());

            // M4-24410
            ViewBag.CommentType = string.Format("{0}{1}", modelViewModel.id, "XtractorSettings");

            return PartialView("~/Views/Model/ModelServers/ModelServerSettings.cshtml", modelServerSettings);
        }

        public ModelServerSettings GetModelServerSettings(ModelViewModel modelViewModel, string modelSettingsUri)
        {
            ViewBag.AgentUri = modelSettingsUri;
            ViewBag.ModelUri = modelViewModel.Uri.ToString();
            ModelServerSettings modelServerSettings = modelService.GetModelSettings(modelSettingsUri);
            return modelServerSettings;
        }

        public void AddSwitchWhenPostprocessingSetting(ModelServerSettings modelServerSettings, ModelViewModel modelViewModel)
        {
            if (!modelViewModel.IsModelserverSwitchable)
                return;

            bool switchWhenPostprocessingValue = Equals(modelViewModel.SwitchWhenPostprocessing, true);

            SettingGroup refreshSettingGroup = new SettingGroup
            {
                Id = "Refresh settings",
                Name = "Refresh settings",
                Settings = new List<string>
                {
                    "switchWhenPostprocessing"
                }
            };

            Setting switchWhenPostprocessingSetting = new Setting
            {
                Id = "switchWhenPostprocessing",
                Type = "boolean",
                Name = "Switch when postprocessing",
                Value = switchWhenPostprocessingValue,
                Description = Resource.MC_SwitchWhenPostprocessing_Description
            };

            modelServerSettings.SettingsGroup.Insert(0, refreshSettingGroup);
            modelServerSettings.SettingList.Add(switchWhenPostprocessingSetting);
        }

        [ValidateInput(false)]
        [AcceptVerbs(HttpVerbs.Put)]
        public void SaveModelSettings(string modelUri, string agentUri, string settingList, bool? switchWhenPostprocessing)
        {
            JArray settingListAsJArray = JArray.Parse(settingList);

            IEnumerable<object> modelSettingList = settingListAsJArray.Select(modelSetting => new
            {
                id = modelSetting.Value<string>("id"),
                value = ConvertJTokenModelSettingValueByFieldType(modelSetting)
            });

            JObject modelSettingsObject = new JObject
            {
                ["setting_list"] = JArray.FromObject(modelSettingList)
            };

            modelService.SaveModelSettings(agentUri, JsonConvert.SerializeObject(modelSettingsObject));

            if (switchWhenPostprocessing.HasValue)
            {
                JObject switchWhenPostprocessingObject = new JObject
                {
                    ["switch_when_postprocessing"] = switchWhenPostprocessing.Value
                };

                modelService.UpdateModel(modelUri, JsonConvert.SerializeObject(switchWhenPostprocessingObject));
            }
        }

        [AcceptVerbs(HttpVerbs.Get)]
        public ContentResult FindAmountOfAngleAndDashboard(string modelUri)
        {
            var result = string.Empty;
            if (!string.IsNullOrEmpty(modelUri))
            {
                var modelViewModel = AuthorizationHelper.Initialize().GetModel(modelUri);


                var uriList = new List<string>();
                var uri = UrlHelper.GetRequestUrl(URLType.NOA);
                //Get Amount of Angle
                uriList.Add($"{uri}items?fq=facetcat_itemtype:(facet_angle) AND facetcat_models:({modelViewModel.id})&limit=0");

                //Get Amount of Dashboard
                uriList.Add($"{uri}items?fq=facetcat_itemtype:(facet_dashboard) AND facetcat_models:({modelViewModel.id})&limit=0");

                var taskIndex = 0;
                var amountofAngle = 0;
                var amountofDashboard = 0;
                UrlHelperExtension.ParallelRequest(uriList).ForEach(delegate (Task<JObject> task)
                {
                    if (taskIndex == 0)
                    {
                        var header = JsonConvert.DeserializeObject<dynamic>(task.Result.SelectToken("header").ToString());
                        amountofAngle = (int)header.total;
                    }
                    else if (taskIndex == 1)
                    {
                        var header = JsonConvert.DeserializeObject<dynamic>(task.Result.SelectToken("header").ToString());
                        amountofDashboard = (int)header.total;
                    }

                    taskIndex++;
                });

                result = JsonConvert.SerializeObject(new
                {
                    AmountofAngle = amountofAngle,
                    AmountofDashboard = amountofDashboard,
                    ConnectedUsers = modelViewModel.connected_users
                });
            }
            return Content(result, "application/json");
        }

        #endregion

        #region "function"

        public void SetModelServersAdditionalInfo(IList<ModelServerViewModel> modelServerViewModels, IList<AgentModelInfoViewModel> agentModelInfoViewModels)
        {
            foreach (ModelServerViewModel modelServerViewModel in modelServerViewModels)
            {
                SetModelServersActiveStatus(modelServerViewModel, agentModelInfoViewModels);
                SetModelServersDefinitionVersion(modelServerViewModel);
            }
        }

        public void SetModelServersDefinitionVersion(ModelServerViewModel modelServerViewModel)
        {
            modelServerViewModel.model_definition_version = string.Empty;
            if (modelServerViewModel.Status != ModelServerStatus.Down
                && modelServerViewModel.Status != ModelServerStatus.Unknown)
            {
                var extractorViewModel = modelService.GetModelExtractor(modelServerViewModel.info.ToString());
                modelServerViewModel.model_definition_version = extractorViewModel.modeldefinition_id;
            }
        }


        public void SetModelServersActiveStatus(ModelServerViewModel modelServerViewModel, IList<AgentModelInfoViewModel> agentModelInfoViewModels)
        {
            modelServerViewModel.ModelServerId = string.Empty;
            modelServerViewModel.IsActiveServer = false;

            AgentModelInfoViewModel agentModelInfo = agentModelInfoViewModels.FirstOrDefault(item => modelServerViewModel.id.Contains(item.id));

            if (agentModelInfo != null)
            {
                modelServerViewModel.ModelServerId = agentModelInfo.id;
                modelServerViewModel.IsActiveServer = agentModelInfo.is_active;
            }
        }

        #endregion


        #region "Private"

        private object ConvertJTokenModelSettingValueByFieldType(JToken token)
        {
            object result = token["value"];

            if ("percentage".Equals(token.SelectToken("type").ToString()) || "double".Equals(token.SelectToken("type").ToString()))
                result = Convert.ToDouble(token.SelectToken("value"));
            else if ("date".Equals(token.SelectToken("type").ToString()) && UtilitiesHelper.IsJTokenNullOrEmpty(token["value"]))
                result = 0;

            return result;
        }

        #endregion
    }
}
