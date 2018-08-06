using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Net;
using System.Web;
using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels;
using EveryAngle.Core.ViewModels.Cycle;
using EveryAngle.Core.ViewModels.EAPackage;
using EveryAngle.Core.ViewModels.FieldCategory;
using EveryAngle.Core.ViewModels.Label;
using EveryAngle.Core.ViewModels.LabelCategory;
using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Core.ViewModels.ModelServer;
using EveryAngle.Core.ViewModels.Users;
using EveryAngle.Shared.Helpers;
using EveryAngle.Utilities;
using EveryAngle.WebClient.Service.HttpHandlers;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using RestSharp;
using EveryAngle.WebClient.Service.Security;
using EveryAngle.Logging;

namespace EveryAngle.WebClient.Service.ApiServices
{
    public class ModelService : IModelService
    {
        public string WebServiceUri { get; set; }

        public object category { get; set; }

        public ModelServerViewModel GetModelServer(string uri)
        {
            var requestManager = RequestManager.Initialize(uri);
            var jsonResult = requestManager.Run();
            var result = JsonConvert.DeserializeObject<ModelServerViewModel>(jsonResult.ToString(),
                new UnixDateTimeConverter());
            return result;
        }

        public ExtractorViewModel GetModelExtractor(string uri)
        {
            var requestManager = RequestManager.Initialize(uri);
            var jsonResult = requestManager.Run();
            var result = JsonConvert.DeserializeObject<ExtractorViewModel>(jsonResult.ToString());
            return result;
        }

        public ListViewModel<ModelServerViewModel> GetModelServers(string uri)
        {
            var requestManager = RequestManager.Initialize(uri);
            var jsonResult = requestManager.Run();
            var result = new ListViewModel<ModelServerViewModel>();

            result.Data =
                JsonConvert.DeserializeObject<List<ModelServerViewModel>>(
                    jsonResult.SelectToken("model_servers").ToString(), new UnixDateTimeConverter());
            result.Header = JsonConvert.DeserializeObject<HeaderViewModel>(jsonResult.SelectToken("header").ToString());
            return result;
        }

        public List<EventLogViewModel> GetEventLog(string modelServerUri)
        {
            var requestManager = RequestManager.Initialize(modelServerUri);
            var jsonResult = requestManager.Run();
            var models =
                JsonConvert.DeserializeObject<List<EventLogViewModel>>(jsonResult.SelectToken("events").ToString(),
                    new UnixDateTimeConverter());
            return models;
        }

        public DataTable GetEventsTable(string serverUri, int page, int pagesize)
        {
            var eventsTimeList = GetAllModelServersEventsTime(serverUri, page, pagesize);

            //Created Table
            var EventDataTable = new DataTable();
            EventDataTable.Columns.Add(new DataColumn("Time", typeof(long)));
            var serverNames = eventsTimeList.Select(e => e.Item2).Distinct().OrderBy(r => r).ToList();

            serverNames.ForEach(s => { EventDataTable.Columns.Add(new DataColumn(s, typeof(string))); });

            //Get time list
            //Created Rows
            eventsTimeList.ForEach(e =>
            {
                var row = EventDataTable.AsEnumerable().FirstOrDefault(t => Convert.ToInt64(t["time"]) == e.Item1);

                if (row != null)
                {
                    SetEventsStatusOnTime(EventDataTable, e, row);
                }
                else
                {
                    row = EventDataTable.NewRow();

                    row["time"] = e.Item1;

                    SetEventsStatusOnTime(EventDataTable, e, row);

                    EventDataTable.Rows.Add(row);
                }
            });

            return EventDataTable;
        }

        public DataTable GetAvailabelRolesTable(string roleModelUri)
        {
            var roles = GetRoles(roleModelUri);

            //Created Table
            var AvailabelRolesDataTable = new DataTable();
            AvailabelRolesDataTable.Columns.Add(new DataColumn("id", typeof(string)));
            AvailabelRolesDataTable.Columns.Add(new DataColumn("description", typeof(string)));
            AvailabelRolesDataTable.Columns.Add(new DataColumn("subroles", typeof(int)));
            AvailabelRolesDataTable.Columns.Add(new DataColumn("model", typeof(string)));

            foreach (var role in roles.Data)
            {
                var record = AvailabelRolesDataTable.NewRow();
                var eachRole = GetRole(null, role.Uri.ToString());
                var modelUri = eachRole.ModelPrivilege.model != null ? eachRole.ModelPrivilege.model.ToString() : "";
                var models = SessionHelper.Initialize().Models;

                record["id"] = role.Id;
                record["description"] = role.Description;
                record["subroles"] = role.TotalSubRoles;

                if (modelUri != "")
                {
                    var model = modelUri != "" ? models.Where(m => m.Uri.ToString() == modelUri).FirstOrDefault() : null;
                    if (model == null)
                    {
                        record["model"] = "No privilege for model:" + modelUri;
                    }
                    else
                    {
                        record["model"] = model.short_name;
                    }
                }
                else
                {
                    record["model"] = "No data";
                }


                AvailabelRolesDataTable.Rows.Add(record);
            }
            return AvailabelRolesDataTable;
        }

        public DataTable GetAvailabelRolesTable(List<SystemRoleViewModel> roles)
        {
            //Created Table
            var AvailabelRolesDataTable = new DataTable();
            AvailabelRolesDataTable.Columns.Add(new DataColumn("id", typeof(string)));
            AvailabelRolesDataTable.Columns.Add(new DataColumn("description", typeof(string)));
            AvailabelRolesDataTable.Columns.Add(new DataColumn("subroles", typeof(int)));
            AvailabelRolesDataTable.Columns.Add(new DataColumn("model", typeof(string)));

            foreach (var role in roles)
            {
                var record = AvailabelRolesDataTable.NewRow();
                var modelUri = role.ModelPrivilege.model != null ? role.ModelPrivilege.model.ToString() : "";

                record["id"] = role.Id;
                record["description"] = role.Description;
                record["subroles"] = role.TotalSubRoles;

                if (!string.IsNullOrEmpty(modelUri))
                {
                    var model = GetModel(modelUri);
                    if (model == null)
                    {
                        record["model"] = "No privilege for model:" + modelUri;
                    }
                    else
                    {
                        record["model"] = model.short_name;
                    }
                }
                else
                {
                    record["model"] = "No data";
                }


                AvailabelRolesDataTable.Rows.Add(record);
            }
            return AvailabelRolesDataTable;
        }

        public ModelServerViewModel CreateModelServer(string modelServerUri, string newModel)
        {
            var requestManager = RequestManager.Initialize(modelServerUri);
            var jsonResult = requestManager.Run(Method.POST, newModel);
            var result = JsonConvert.DeserializeObject<ModelServerViewModel>(jsonResult.ToString());
            return result;
        }

        public void DeleteModelServer(string uri)
        {
            var requestManager = RequestManager.Initialize(uri);
            var jsonResult = requestManager.Run(Method.DELETE);

            if (requestManager.ResponseStatus != HttpStatusCode.NoContent)
            {
                throw new Exception(jsonResult.ToString());
            }
        }

        public List<ModelViewModel> GetModels(string uri)
        {
            var requestManager = RequestManager.Initialize(uri);
            var jsonResult = requestManager.Run();
            var models = JsonConvert.DeserializeObject<List<ModelViewModel>>(
                jsonResult.SelectToken("models").ToString(), new UnixDateTimeConverter());
            return models;
        }

        public ModelViewModel GetModel(string modelUri)
        {
            var requestManager = RequestManager.Initialize(modelUri);

            ModelViewModel model = null;

            var jsonResult = requestManager.Run();
            model = JsonConvert.DeserializeObject<ModelViewModel>(jsonResult.ToString(), new UnixDateTimeConverter());

            return model;
        }

        public List<ModelViewModel> GetSessionModels(string uri)
        {
            var models = new List<ModelViewModel>();
            var results = new List<ModelViewModel>();
            var requestManager = RequestManager.Initialize(uri);
            var jsonResult = requestManager.Run();
            models = JsonConvert.DeserializeObject<List<ModelViewModel>>(jsonResult.SelectToken("models").ToString(),
                new UnixDateTimeConverter());

            for (var loop = 0; loop < models.Count; loop++)
            {
                var model = GetModel(models[loop].Uri.ToString());
                results.Add(model);
            }

            return results;
        }

        public ModelViewModel CreateModel(string modelUri, string newModel)
        {
            var requestManager = RequestManager.Initialize(modelUri);
            var jsonResult = requestManager.Run(Method.POST, newModel);
            var result = JsonConvert.DeserializeObject<ModelViewModel>(jsonResult.ToString(),
                new UnixDateTimeConverter());
            return result;
        }

        public ModelViewModel UpdateModel(string modelUri, string model)
        {
            var requestManager = RequestManager.Initialize(modelUri);
            var jsonResult = requestManager.Run(Method.PUT, model);
            var result = JsonConvert.DeserializeObject<ModelViewModel>(jsonResult.ToString(),
                new UnixDateTimeConverter());
            return result;
        }

        public void DeleteModel(string uri)
        {
            var requestManager = RequestManager.Initialize(uri);
            var jsonResult = requestManager.Run(Method.DELETE);

            if (requestManager.ResponseStatus != HttpStatusCode.NoContent)
            {
                throw new Exception(jsonResult.ToString());
            }
        }

        public InstanceViewModel GetInstance(string instanceUri)
        {
            var requestManager = RequestManager.Initialize(instanceUri);
            var jsonResult = requestManager.Run();
            var modelInstance = JsonConvert.DeserializeObject<InstanceViewModel>(jsonResult.ToString(),
                new UnixDateTimeConverter());
            return modelInstance;
        }

        public ListViewModel<ModelServerReportViewModel> GetReports(string reportUri)
        {
            var requestManager = RequestManager.Initialize(reportUri);
            var jsonResult = requestManager.Run();
            var models = new ListViewModel<ModelServerReportViewModel>();
            models.Data =
                JsonConvert.DeserializeObject<List<ModelServerReportViewModel>>(
                    jsonResult.SelectToken("reports").ToString());
            models.Header = JsonConvert.DeserializeObject<HeaderViewModel>(jsonResult.SelectToken("header").ToString());
            return models;
        }

        public string GetModelServerReport(string reportUri)
        {
            var requestManager = RequestManager.Initialize(reportUri);
            var jsonResult = requestManager.Run();
            return jsonResult.ToString();
        }

        public FieldCategoryViewModel GetFieldCategory(string fieldCategoryUri)
        {
            var requestManager = RequestManager.Initialize(fieldCategoryUri);
            var jsonResult = requestManager.Run();
            var modelFieldCategory = JsonConvert.DeserializeObject<FieldCategoryViewModel>(jsonResult.ToString());
            return modelFieldCategory;
        }

        public FieldViewModel GetModelFields(string fieldUri)
        {
            var requestManager = RequestManager.Initialize(fieldUri);
            var jsonResult = requestManager.Run();
            var modelFields = JsonConvert.DeserializeObject<FieldViewModel>(jsonResult.ToString());
            return modelFields;
        }

        public FieldViewModel GetModelJumps(string fieldUri)
        {
            var requestManager = RequestManager.Initialize(fieldUri);
            var jsonResult = requestManager.Run();
            var modelFields = JsonConvert.DeserializeObject<FieldViewModel>(jsonResult.ToString());
            return modelFields;
        }

        public FieldDomainViewModel GetFieldDomain(string fieldUri)
        {
            var requestManager = RequestManager.Initialize(fieldUri);
            var jsonResult = requestManager.Run();
            var modelFields = JsonConvert.DeserializeObject<FieldDomainViewModel>(jsonResult.ToString());
            return modelFields;
        }

        public List<HelpTextsViewModel> GetModelFieldsHelpTexts(string helpTextUri)
        {
            var requestManager = RequestManager.Initialize(helpTextUri);
            var jsonResult = requestManager.Run();
            var modelFieldHelpText =
                JsonConvert.DeserializeObject<List<HelpTextsViewModel>>(jsonResult.SelectToken("help_texts").ToString());
            return modelFieldHelpText;
        }

        public HelpTextsViewModel GetModelFieldsHelpText(string helpTextUri)
        {
            var requestManager = RequestManager.Initialize(helpTextUri);
            var jsonResult = requestManager.Run();
            var modelFieldHelpText = JsonConvert.DeserializeObject<HelpTextsViewModel>(jsonResult.ToString());
            return modelFieldHelpText;
        }

        public void UpdateModelLicense(string modelUri, SystemLicenseViewModel modelLicense)
        {
            var requestManager = RequestManager.Initialize(modelUri);
            var licenseInfo = JsonConvert.SerializeObject(modelLicense);
            requestManager.Run(Method.PUT, licenseInfo);
        }

        public ListViewModel<PackageViewModel> GetModelPackages(string packageUri)
        {
            var requestManager = RequestManager.Initialize(packageUri);
            var jsonResult = requestManager.Run();
            var packages = new ListViewModel<PackageViewModel>();
            packages.Data =
                JsonConvert.DeserializeObject<List<PackageViewModel>>(jsonResult.SelectToken("packages").ToString(),
                    new UnixDateTimeConverter());
            packages.Header = JsonConvert.DeserializeObject<HeaderViewModel>(jsonResult.SelectToken("header").ToString());
            return packages;
        }

        public IEnumerable<AgentModelInfoViewModel> GetModelServersInfo(string uri)
        {
            var requestManager = RequestManager.Initialize(uri);
            var agentResult = requestManager.Run();

            //get models data
            var modelInfoUri = UrlHelper.GetRequestUrl(URLType.NOA) + agentResult.SelectToken("modelinfo_uri");
            requestManager = RequestManager.Initialize(modelInfoUri);
            var jsonResult = requestManager.Run();
            var models =
                JsonConvert.DeserializeObject<IEnumerable<AgentModelInfoViewModel>>(
                    jsonResult.SelectToken("servers").ToString());
            return models;
        }

        public void UpdateModelInfo(string uri, string id, bool status)
        {
            var requestManager = RequestManager.Initialize(uri);
            var agentResult = requestManager.Run();

            //get models data
            var modelInfoUri = UrlHelper.GetRequestUrl(URLType.NOA) + agentResult.SelectToken("modelinfo_uri");
            requestManager = RequestManager.Initialize(modelInfoUri);
            var modelinfoResult = requestManager.Run();
            var servers = modelinfoResult.SelectToken("servers");
            if (servers != null && servers.Children().Count() != 0)
            {
                var modelinfo = servers.Children().FirstOrDefault(w => w["id"].ToString() == id);
                if (modelinfo != null && modelinfo["is_active"] != null &&
                    Convert.ToBoolean(modelinfo["is_active"]) != status)
                {
                    // update status
                    var data = "{\"servers\":[{\"id\":\"" + id + "\",\"is_active\":" +
                               Convert.ToString(status).ToLower() + "}]}";
                    requestManager = RequestManager.Initialize(modelInfoUri);
                    requestManager.Run(Method.PUT, data);
                }
            }
        }

        public PackageViewModel GetModelPackage(string packageUri)
        {
            var requestManager = RequestManager.Initialize(packageUri);
            var jsonResult = requestManager.Run();
            var package = JsonConvert.DeserializeObject<PackageViewModel>(jsonResult.ToString(),
                new UnixDateTimeConverter());
            return package;
        }

        //public byte[] DownloadPackageFile(string packageUri)
        //{
        //    var requestManager = RequestManager.Initialize(packageUri, false);
        //    string DownloadFileName = "";
        //    byte[] fileData = clientManager.GetBinaryWithFileName(ref DownloadFileName);

        //    return fileData;
        //}

        public void UpdatePackage(string packageUri, string updatedPackage)
        {
            var requestManager = RequestManager.Initialize(packageUri);
            requestManager.Run(Method.PUT, updatedPackage);
        }

        public SystemRoleViewModel CreateRole(string modelUri, string newModel)
        {
            var requestManager = RequestManager.Initialize(modelUri + "?redirect=no");
            var jsonResult = requestManager.Run(Method.POST, newModel);
            var result = JsonConvert.DeserializeObject<SystemRoleViewModel>(jsonResult.ToString(),
                new UnixDateTimeConverter());
            return result;
        }

        public List<SystemRoleViewModel> GetSystemRoles(string systemRoleUri)
        {
            var requestManager = RequestManager.Initialize(systemRoleUri);
            var jsonResult = requestManager.Run();
            var model =
                JsonConvert.DeserializeObject<List<SystemRoleViewModel>>(jsonResult.SelectToken("roles").ToString());
            return model;
        }

        public ListViewModel<SystemRoleViewModel> GetRoles(string roleUri)
        {
            var requestManager = RequestManager.Initialize(roleUri);
            var jsonResult = requestManager.Run();
            var models = new ListViewModel<SystemRoleViewModel>();
            models.Data =
                JsonConvert.DeserializeObject<List<SystemRoleViewModel>>(jsonResult.SelectToken("roles").ToString(),
                    new UnixDateTimeConverter());
            models.Header = JsonConvert.DeserializeObject<HeaderViewModel>(jsonResult.SelectToken("header").ToString());
            return models;
        }

        public SystemRoleViewModel GetRole(string modelUri, string roleUri, ModelViewModel modelData = null,
            ListViewModel<LabelCategoryViewModel> modelLabelCategoryDatas = null,
            ListViewModel<LabelViewModel> modelLabelDatas = null)
        {
            var requestManager = RequestManager.Initialize(roleUri);
            var jsonResult = requestManager.Run();
            var roleModel = JsonConvert.DeserializeObject<SystemRoleViewModel>(jsonResult.ToString(),
                new UnixDateTimeConverter());

            var systemSettings = SessionHelper.Initialize().SystemSettings;
            var offsetLimitQuery = UtilitiesHelper.GetOffsetLimitQueryString(1, systemSettings.max_pagesize);

            if (modelUri != null)
            {
                var labelservice = new LabelService();
                var model = modelData == null ? GetModel(modelUri) : modelData;
                var modelLabels = modelLabelDatas == null
                    ? labelservice.GetLabels(model.labels + "?" + offsetLimitQuery)
                    : modelLabelDatas;
                var modelCategories = modelLabelCategoryDatas == null
                    ? labelservice.GetLabelCategories(model.label_categories + "?" + offsetLimitQuery)
                    : modelLabelCategoryDatas;
                var allCategories = new ListViewModel<LabelCategoryViewModel>();
                var allLabels = new ListViewModel<LabelViewModel>();

                foreach (var privillageLabel in roleModel.PrivilegeLabels)
                {
                    var modelLabel = modelLabels.Data.Find(label => label.id == privillageLabel.Name);
                    if (modelLabel != null)
                    {
                        var modelCategory =
                            modelCategories.Data.Find(
                                category => category.labels.Replace("/labels", "") == modelLabel.category);
                        privillageLabel.LabelCategory = modelCategory != null ? modelCategory.id : "";
                    }
                    else
                    {
                        var version = SessionHelper.Initialize().Version;

                        if (allCategories.Data == null)
                            allCategories =
                                labelservice.GetLabelCategories(version.GetEntryByName("labelcategories").Uri + "?" +
                                                                offsetLimitQuery);

                        if (allLabels.Data == null)
                            allLabels =
                                labelservice.GetLabels(version.GetEntryByName("labels").Uri + "?" + offsetLimitQuery);

                        var label = allLabels.Data.Find(item => item.id == privillageLabel.Name);
                        if (label != null)
                        {
                            var category = allCategories.Data.Find(item => item.uri == label.category);
                            privillageLabel.LabelCategory = category != null ? category.id : "";
                        }
                    }
                }

                roleModel.PrivilegeLabels.Sort((x, y) => string.Compare(x.LabelCategory, y.LabelCategory));
            }


            if (roleModel.SubRolesUri != null)
            {
                var subRoles = GetRoles(roleModel.SubRolesUri + "?" + offsetLimitQuery).Data;
                roleModel.SubRoles = subRoles;
            }
            return roleModel;
        }

        public void DeleteRole(string roleUri)
        {
            var requestManager = RequestManager.Initialize(roleUri);
            requestManager.Run(Method.DELETE);
        }

        public bool SaveRole(string modelUri, SystemRoleViewModel updatedRole, List<PrivilegeLabel> privilegeLabels)
        {
            var success = false;
            var requestManager = RequestManager.Initialize(updatedRole.Uri.ToString());
            var roleInfo = JsonConvert.SerializeObject(updatedRole, new UnixDateTimeConverter());
            var jsonResult = requestManager.Run(Method.PUT, roleInfo);
            if (requestManager.ResponseStatus == HttpStatusCode.OK)
            {
                var roleModel = GetRole(modelUri, updatedRole.Uri.ToString());
                if (privilegeLabels != null)
                {
                    foreach (var label in privilegeLabels)
                    {
                        if (!roleModel.ModelPrivilege.LabelAuthorizations.ContainsKey(label.Name))
                        {
                            roleModel.ModelPrivilege.LabelAuthorizations.Add(label.Name, "view");
                        }

                        switch (label.Type)
                        {
                            case PrivilegeType.Assign:
                                roleModel.ModelPrivilege.LabelAuthorizations[label.Name] = "assign";
                                break;

                            case PrivilegeType.Validate:
                                roleModel.ModelPrivilege.LabelAuthorizations[label.Name] = "validate";
                                break;

                            case PrivilegeType.View:
                                roleModel.ModelPrivilege.LabelAuthorizations[label.Name] = "view";
                                break;

                            case PrivilegeType.Manage:
                                roleModel.ModelPrivilege.LabelAuthorizations[label.Name] = "manage";
                                break;
                        }
                    }
                }

                requestManager = RequestManager.Initialize(updatedRole.Uri.ToString());
                roleModel.CreatedBy = null;
                jsonResult = requestManager.Run(Method.PUT, JsonConvert.SerializeObject(roleModel));
                success = requestManager.ResponseStatus == HttpStatusCode.OK;
            }
            return success;
        }

        public string SaveRole(string modelUri, string roleUri, string updatedRole)
        {
            var success = false;
            var requestManager = RequestManager.Initialize(roleUri);
            // string roleInfo = JsonConvert.SerializeObject(updatedRole, new UnixDateTimeConverter());
            var jsonResult = requestManager.Run(Method.PUT, updatedRole);

            success = requestManager.ResponseStatus == HttpStatusCode.OK;
            return jsonResult.ToString();
        }


        public void DeletePrivilege(string uri, string updatedRole)
        {
            var requestManager = RequestManager.Initialize(uri);
            requestManager.Run(Method.PUT, updatedRole);
        }

        public List<string> GetClassesId(string uri)
        {
            var requestManager = RequestManager.Initialize(uri);
            var jsonResult = requestManager.Run();
            var token = jsonResult.SelectToken("classes");
            if (token != null)
            {
                var models = token.Select(selector => selector.SelectToken("id").ToString()).ToList();
                return models;
            }
            return new List<string>();
        }

        public List<ClassViewModel> GetClasses(string uri)
        {
            var requestManager = RequestManager.Initialize(uri);
            var jsonResult = requestManager.Run();

            return JsonConvert.DeserializeObject<List<ClassViewModel>>(jsonResult.SelectToken("classes").ToString());
        }

        public string GetModelAngles(string uri)
        {
            var requestManager = RequestManager.Initialize(uri);
            var jsonResult = requestManager.Run();

            return jsonResult.SelectToken("items").ToString();
        }

        public SuggestedFieldsSummaryViewModel GetSuggestedFieldsSummary(string uri)
        {
            var requestManager = RequestManager.Initialize(uri);
            var jsonResult = requestManager.Run();
            var suggestedFieldsSummary =
                JsonConvert.DeserializeObject<SuggestedFieldsSummaryViewModel>(jsonResult.ToString());
            return suggestedFieldsSummary;
        }

        public FieldCategoryViewModel GetFieldName(string uri)
        {
            var requestManager = RequestManager.Initialize(uri);
            var jsonResult = requestManager.Run();
            var fieldCategory =
                JsonConvert.DeserializeObject<List<FieldCategoryViewModel>>(jsonResult.SelectToken("fields").ToString());
            return fieldCategory.FirstOrDefault();
        }
        
        public string GetModuleExtensionsDetail(string detailUri)
        {
            var requestManager = RequestManager.Initialize(detailUri);
            var modelInfoResult = requestManager.Run();
            return modelInfoResult.ToString();
        }

        public string UpdateModuleExtensionsDetail(string detailUri, string extensionData)
        {
            var requestManager = RequestManager.Initialize(detailUri);
            var modelInfoResult = requestManager.Run(Method.PUT, extensionData);
            return modelInfoResult.ToString();
        }
        
        public void UpdateModelActiveLanguages(string uri, string updatelanguage)
        {
            var requestManager = RequestManager.Initialize(uri);
            requestManager.Run(Method.PUT, updatelanguage);
        } 
        
        public ModelServerSettings GetModelSettings(string uri)
        {
            var requestManager = RequestManager.Initialize(uri);
            var settings = requestManager.Run();
            var output = JsonConvert.DeserializeObject<ModelServerSettings>(settings.ToString());
            return output;
        }

        public ModelServerSettings SaveModelSettings(string uri, string content)
        {
            var requestManager = RequestManager.Initialize(uri);
            var json = requestManager.Run(Method.PUT, content);
            var output = JsonConvert.DeserializeObject<ModelServerSettings>(json.ToString());
            return output;
        }


        public AgentViewModel GetModelAgent(string uri)
        {
            var requestManager = RequestManager.Initialize(uri);
            var json = requestManager.Run();
            return JsonConvert.DeserializeObject<AgentViewModel>(json.ToString());
        }

        public ModelSiteMapBaseViewModel GetModelSiteMap(string uri, Type siteMapType)
        {
            // M4-39893: Not possible to log into the MC when a Model Agent can't be reached
            // - never show error on creating sitemap
            JObject agentContent;
            try
            {
                RequestManager requestManager = RequestManager.Initialize(uri);
                agentContent = requestManager.Run();
            }
            catch (HttpException ex)
            {
                // failed to get agent
                Log.SendWarning("Menu do not fully show because {0}", ex.Message);
                agentContent = new JObject();
            }
            return (ModelSiteMapBaseViewModel)JsonConvert.DeserializeObject(agentContent.ToString(), siteMapType);
        }

        public List<TaskAction> GetActionsTask(string taskActionsUri)
        {
            var requestManager = RequestManager.Initialize(taskActionsUri);
            var jsonResult = requestManager.Run();
            var taskActions = JsonConvert.DeserializeObject<List<TaskAction>>(jsonResult.SelectToken("actions").ToString());
            return taskActions;
        }

        public TaskViewModel GetTask(string tasksUri)
        {
            var requestManager = RequestManager.Initialize(tasksUri);
            var jsonResult = requestManager.Run();
            var task = JsonConvert.DeserializeObject<TaskViewModel>(jsonResult.ToString(), new UnixDateTimeConverter());
            return task;
        }

        public TaskViewModel UpdateTask(string uri, string data)
        {
            var requestManager = RequestManager.Initialize(uri);
            var jsonResult = requestManager.Run(Method.PUT, data);
            return JsonConvert.DeserializeObject<TaskViewModel>(jsonResult.ToString());
        }

        public TaskViewModel CreateTask(string uri, string data)
        {
            var requestManager = RequestManager.Initialize(uri);
            var jsonResult = requestManager.Run(Method.POST, data);
            return JsonConvert.DeserializeObject<TaskViewModel>(jsonResult.ToString());
        }

        public void DeleteTask(string uri)
        {
            var requestManager = RequestManager.Initialize(uri);
            var jsonResult = requestManager.Run(Method.DELETE);

            if (requestManager.ResponseStatus != HttpStatusCode.NoContent)
            {
                throw new Exception(jsonResult.ToString());
            }
        }

        public TaskHistoryViewModel GetTaskHistory(string tasksUri)
        {
            var requestManager = RequestManager.Initialize(tasksUri);
            var jsonResult = requestManager.Run();
            return JsonConvert.DeserializeObject<TaskHistoryViewModel>(jsonResult.ToString(),
                new UnixDateTimeConverter());
        }

        public ListViewModel<TaskHistoryViewModel> GetTaskHistories(string uri)
        {
            var requestManager = RequestManager.Initialize(uri);
            var jsonResult = requestManager.Run();
            var result = new ListViewModel<TaskHistoryViewModel>();
            result.Data =
                JsonConvert.DeserializeObject<List<TaskHistoryViewModel>>(jsonResult.SelectToken("event_log").ToString());
            result.Header = JsonConvert.DeserializeObject<HeaderViewModel>(jsonResult.SelectToken("header").ToString());
            return result;
        }

        public Field UpdateField(string uri, string data)
        {
            var requestManager = RequestManager.Initialize(uri);
            var json = requestManager.Run(Method.PUT, data);
            return JsonConvert.DeserializeObject<Field>(json.ToString());
        }

        public List<Tuple<long, string, string>> GetAllModelServersEventsTime(string modelServerUri, int page, int pagesize)
        {
            var eventsTimeList = new List<Tuple<long, string, string>>();
            var modelServers = GetModelServers(modelServerUri);
            foreach (var eventLog in modelServers.Data)
            {
                var eventLogList = GetEventLog(eventLog.event_log + "?" + UtilitiesHelper.GetOffsetLimitQueryString(page, pagesize));
                foreach (var log in eventLogList)
                {
                    eventsTimeList.Add(new Tuple<long, string, string>(log.timestamp, eventLog.id, log.status));
                }
            }
            return eventsTimeList.OrderByDescending(c => c.Item1).ToList();
        }

        private void SetEventsStatusOnTime(DataTable eventDataTable, Tuple<long, string, string> eventTime, DataRow row)
        {
            for (var colIndex = 1; colIndex <= eventDataTable.Columns.Count - 1; colIndex++)
            {
                if (eventDataTable.Columns[colIndex].ColumnName == eventTime.Item2)
                {
                    row[colIndex] = eventTime.Item3;
                    break;
                }
            }
        }
        
        public JObject GetAngleWarningFirstLevel(string uri)
        {
            var requestManager = RequestManager.Initialize(uri);
            var jsonResult = requestManager.Run();
            var summary = JsonConvert.DeserializeObject<AngleWarningsSummaryViewModel>(jsonResult.SelectToken("summary").ToString());
            var list = JsonConvert.DeserializeObject<List<AngleWarningFirstLevelViewmodel>>(jsonResult.SelectToken("list").ToString());

            JObject result = JObject.FromObject(new
            {
                summary = summary,
                data = list
            });
            return result;
        }

        public JObject GetAngleWarningSecondLevel(string uri)
        {
            var requestManager = RequestManager.Initialize(uri);
            var jsonResult = requestManager.Run();
            var solutions = JsonConvert.DeserializeObject<List<AngleWarningsSolutionsViewModel>>(jsonResult.SelectToken("solutions").ToString());
            var list = JsonConvert.DeserializeObject<List<AngleWarningSecondLevelViewmodel>>(jsonResult.SelectToken("list").ToString());

            return JObject.FromObject(new
            {
                solutions = solutions,
                data = list
            });
        }

        public JObject GetAngleWarningThirdLevel(string uri)
        {
            var requestManager = RequestManager.Initialize(uri);
            var jsonResult = requestManager.Run();
            var list = JsonConvert.DeserializeObject<List<AngleWarningThirdLevelViewmodel>>(jsonResult.SelectToken("list").ToString());

            return JObject.FromObject(new
            {
                data = list
            });
        }

        public List<FollowupViewModel> GetFollowups(string uri)
        {
            var requestManager = RequestManager.Initialize(uri);
            var jsonResult = requestManager.Run();

            return JsonConvert.DeserializeObject<List<FollowupViewModel>>(jsonResult.SelectToken("followups").ToString());
        }


        public SystemRoleViewModel GetRoleById(string roleUri)
        {
            var requestManager = RequestManager.Initialize(roleUri);
            var jsonResult = requestManager.Run();
            return JsonConvert.DeserializeObject<SystemRoleViewModel>(jsonResult.ToString(),
               new UnixDateTimeConverter());
        }
    }
}
