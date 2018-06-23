using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels;
using EveryAngle.Core.ViewModels.DataTransferObject;
using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Core.ViewModels.ModelServer;
using EveryAngle.ManagementConsole.Helpers;
using EveryAngle.Shared.Globalization;
using EveryAngle.Shared.Helpers;
using EveryAngle.Utilities;
using EveryAngle.WebClient.Service;
using EveryAngle.WebClient.Service.Security;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using UrlHelper = EveryAngle.Shared.Helpers.UrlHelper;

namespace EveryAngle.ManagementConsole.Controllers
{
    public class ModelController : BaseController
    {
        private readonly IGlobalSettingService globalSettingService;
        private readonly ILabelService labelService;
        private readonly IModelService modelService;
        private readonly ISessionService sessionService;
        private readonly ISystemInformationService systemInformationService;

        public ModelController(IModelService service, ILabelService labelService,
            IGlobalSettingService globalSettingService, ISystemInformationService systemInformationService,
            ISessionService sessionService)
        {
            this.modelService = service;
            this.labelService = labelService;
            this.globalSettingService = globalSettingService;
            this.systemInformationService = systemInformationService;
            this.sessionService = sessionService;
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
            var model = SessionHelper.Initialize().GetModel(modelUri);
            var modelServerList = new ListViewModel<ModelServerViewModel>();
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
                ViewBag.LicenseDate = SessionHelper.Initialize().GetModelLicenseDate(model.id, licensesData);

                if (model.ServerUri != null)
                {
                    modelServerList = modelService.GetModelServers(model.ServerUri.ToString());
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
            var licenseUri = SessionHelper.Initialize().GetSystemLicenseUri();
            var modelLicenses = SessionHelper.Initialize().GetModelLicense(licenseUri);

            ViewBag.LicensesData = modelLicenses;
            ViewBag.LicenseDate = SessionHelper.Initialize().GetModelLicenseDate(modelId, modelLicenses);

            ViewBag.ModelId = modelId;
            ViewBag.ModelUri = modelUri;

            var model = SessionHelper.Initialize().GetModelById(modelId);
            // M4-13788: Error 500 when created second model and then click model menu immediately
            ViewBag.ModelStatus = model.model_status;
            ViewBag.ModelLongName = model.long_name;
            ViewBag.ModelEnvironment = model.environment;
            ViewBag.ModelType = model.modelType;
            ViewBag.ConnectedUser = model.connected_users;
            ViewBag.ActiveUsersThisWeek = model.active_this_week;
            ViewBag.ActiveUsersThisMonth = model.active_this_month;

            var zone = TimeZoneInfo.Local.Id;
            var tz = TimeZoneInfo.FindSystemTimeZoneById(zone);
            var dt = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, tz);
            ViewBag.DateToday = dt.ToUnixTime();
            ViewBag.DateYesterday = dt.AddDays(-1).ToUnixTime();

            IEnumerable<ModelServerViewModel> Data = new List<ModelServerViewModel>();
            ViewBag.AuthorizedUsers = model.authorized_users;
            if (model.ServerUri != null)
            {
                string serverUri = model.ServerUri.ToString();
                
                var uriList = new List<string>();
                uriList.Add(serverUri);
                
                UrlHelperExtension.ParallelRequest(uriList, true).ForEach(delegate(Task<JObject> task)
                {
                    if (task.IsCompleted)
                    {
                        Data = JsonConvert.DeserializeObject<List<ModelServerViewModel>>(
                                task.Result.SelectToken("model_servers").ToString(), new UnixDateTimeConverter());
                    }
                });

                DateTime date = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);
                ModelServerViewModel modelServer = Data.Where(x => x.type.Equals("ModelServer") || x.type.Equals("HanaServer"))
                    .OrderByDescending(x => date.AddMilliseconds(x.timestamp)).FirstOrDefault();
                if (modelServer != null)
                {
                    modelServer.status = (bool.Equals(model.IsProcessing.Value, true) && modelServer.status.ToLower() == "up") ? "Postprocessing" : modelServer.status;
                    ViewBag.ServerStatus = modelServer.status;
                    if (modelServer.instance != null && model.current_instance != null)
                    {
                        modelServer.IsCurrentInstance = model.current_instance.Equals(modelServer.instance);
                        modelServer.currentInstanceTime = modelService.GetInstance(modelServer.instance.ToString()).modeldata_timestamp;
                    }
                }

                // re-order fow showing in UI
                Data = Data.OrderBy(s => s.id).ToList();
            }
            return PartialView("~/Views/Model/AllModels/ModelServer.cshtml", Data);
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

            DateTime lastTwoDay = DateTime.Now.AddDays(-daysInHistory).ToUniversalTime();
            DateTime dateFormat = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);
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
            SessionHelper session = SessionHelper.Initialize();
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
            var version = SessionHelper.Initialize().Version;
            var currentUser = SessionHelper.Initialize().CurrentUser;
            var userPrivilegedModels =
                currentUser.ModelPrivileges.Where(v => v.Privileges.manage_model == true)
                    .Select(u => u.model.ToString())
                    .ToList();
            if (userPrivilegedModels.Count() > 0)
            {
                userPrivilegedModels.ForEach(privilegedmodel =>
                {
                    var model = SessionHelper.Initialize().GetModel(privilegedmodel);
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
            if (modelUri != "")
            {
                modelViewModel = SessionHelper.Initialize().GetModel(modelUri);
            }
            return PartialView("~/Views/Model/AllModels/Model.cshtml", modelViewModel);
        }

        public ActionResult SaveModel(string jsonData, string modelUri)
        {
            var version = SessionHelper.Initialize().Version;
            var modelViewModel = JsonConvert.DeserializeObject<ModelViewModel>(jsonData);
            if (modelUri == "")
            {
                try
                {
                    var uri = version.GetEntryByName("models").Uri.ToString();
                    modelViewModel.active_languages = new List<string> { "en" };
                    var createdModel = modelService.CreateModel(uri,
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
                    SessionHelper.Initialize().DestroyAllSession();
                }
            }
            else
            {
                var updateModel = JsonConvert.SerializeObject(modelViewModel, new JsonSerializerSettings
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
                                "email_settings",
                                "type",
                                "company_information",
                                "email_settings"
                            })
                });
                modelService.UpdateModel(modelUri, updateModel);
            }

            var parameters = new JsonResult { Data = new { modelUri } };
            return JsonHelper.GetJsonResult(true, null, parameters.Data, null,
                MessageType.SUCCESS_UPDATED);
        }

        public ActionResult UpdateModelInfo(string modelUri, string id, bool status)
        {
            SessionHelper session = SessionHelper.Initialize();
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

        public void ReloadModels()
        {
            HttpContext.Session["ModelViewModelList"] = null;
            SessionHelper.Initialize().ReloadModels();
        }

        [AcceptVerbs(HttpVerbs.Delete)]
        public ActionResult DeleteModel(string modelUri)
        {
            if (!modelUri.Contains("?"))
            {
                modelUri = modelUri + "?are_you_sure=true";
            }

            try
            {
                modelService.DeleteModel(modelUri);
            }
            catch
            {
                // do nothing
            }
            finally
            {
                Thread.Sleep(2000);
                SessionHelper.Initialize().DestroyAllSession();
            }
            return JsonHelper.GetJsonResult(true, null, null, null,
                MessageType.SUCCESS_UPDATED);
        }

        public ActionResult RenderModelServerSettings(string modelUri)
        {
            ModelViewModel modelViewModel = SessionHelper.Initialize().GetModel(modelUri);
            AgentViewModel agentViewModel = modelService.GetModelAgent(modelViewModel.Agent.ToString());
            ModelServerSettings modelServerSettings = GetModelServerSettings(modelViewModel, agentViewModel.ModelserverSettings.ToString());
            AddSwitchWhenPostprocessingSetting(modelServerSettings, modelViewModel);

            // M4-24410
            ViewBag.CommentType = string.Format("{0}{1}", modelViewModel.id, "ModelServerSettings");

            return PartialView("~/Views/Model/ModelServers/ModelServerSettings.cshtml", modelServerSettings);
        }

        public ActionResult RenderExtractorSettings(string modelUri)
        {
            ModelViewModel modelViewModel = SessionHelper.Initialize().GetModel(modelUri);
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

            bool switchWhenPostprocessingValue = modelViewModel != null && bool.Equals(modelViewModel.SwitchWhenPostprocessing, true);

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
            var result = "";
            var modelViewModel = new ModelViewModel();
            if ((modelUri != null) && (modelUri != ""))
            {
                modelViewModel = SessionHelper.Initialize().GetModel(modelUri);


                var uriList = new List<string>();
                var uri = UrlHelper.GetRequestUrl(URLType.NOA);
                //Get Amount of Angle
                uriList.Add(uri + "items?fq=facetcat_itemtype:(facet_angle) AND facetcat_models:(" + modelViewModel.id +
                            ")&limit=0");

                //Get Amount of Dashboard
                uriList.Add(uri + "items?fq=facetcat_itemtype:(facet_dashboard) AND facetcat_models:(" +
                            modelViewModel.id + ")&limit=0");

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

                result = "{\"AmountofAngle\":\"" + amountofAngle + "\", \"AmountofDashboard\":\"" + amountofDashboard +
                         "\", \"ConnectedUsers\":\"" + modelViewModel.connected_users + "\"}";
            }
            return Content(result, "application/json");
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
