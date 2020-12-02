using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels;
using EveryAngle.Core.ViewModels.BusinessProcesses;
using EveryAngle.Core.ViewModels.Cycle;
using EveryAngle.Core.ViewModels.Directory;
using EveryAngle.Core.ViewModels.FieldCategory;
using EveryAngle.Core.ViewModels.Label;
using EveryAngle.Core.ViewModels.LabelCategory;
using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Core.ViewModels.ModelServer;
using EveryAngle.Core.ViewModels.Users;
using EveryAngle.ManagementConsole.Helpers;
using EveryAngle.Shared.Globalization;
using EveryAngle.Shared.Helpers;
using EveryAngle.Utilities;
using EveryAngle.WebClient.Service;
using EveryAngle.WebClient.Service.HttpHandlers;
using EveryAngle.WebClient.Service.Security;
using Kendo.Mvc.Extensions;
using Kendo.Mvc.UI;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using RestSharp;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace EveryAngle.ManagementConsole.Controllers
{
    public class RoleController : BaseController
    {
        private readonly ILabelService _labelService;
        private readonly IModelService _modelService;
        private readonly IUserService _userService;
        private readonly ITaskService _taskService;

        private readonly ListViewModel<LabelViewModel> allLabelsList = new ListViewModel<LabelViewModel>();
        private readonly ListViewModel<LabelCategoryViewModel> allCategoriesList = new ListViewModel<LabelCategoryViewModel>();
        private List<Tuple<string, string, string, bool, string>> fieldsList = new List<Tuple<string, string, string, bool, string>>();

        private delegate void LoadParallelDataForEditRoleDelegate(VersionViewModel version, ModelViewModel model, SessionHelper sessionHelper);
        private readonly LoadParallelDataForEditRoleDelegate _loadParallelDataForEditRole;

        public RoleController(IModelService modelService,
            ILabelService labelService,
            IUserService userService,
            ITaskService taskService)
        {
            _modelService = modelService;
            _labelService = labelService;
            _userService = userService;
            _taskService = taskService;
            _loadParallelDataForEditRole = LoadParallelDataForEditRole;
        }

        internal RoleController(IModelService modelService,
            ILabelService labelService,
            IUserService userService,
            ITaskService taskService,
            SessionHelper sessionHelper) : base(sessionHelper)
        {
            _modelService = modelService;
            _labelService = labelService;
            _userService = userService;
            _taskService = taskService;
            _loadParallelDataForEditRole = (version, model, helper) => { }; // Skipped for testing purposes
        }

        #region "public"

        public ActionResult GetAllRolesPage(string modelUri)
        {
            var version = SessionHelper.Version;
            var providersUrl = version.GetEntryByName("authentication_providers").Uri.ToString();
            var existProviders = _userService.GetSystemAuthenticationProviders(providersUrl);
            var model = GetModel(modelUri);
            ViewBag.AuthenticationProviders = existProviders;
            ViewBag.ModelId = model.id;
            ViewBag.ModelUri = modelUri;
            ViewBag.ModelName = model.short_name != "" ? model.short_name : model.id;
            ViewData["DefaultPageSize"] = DefaultPageSize;
            ViewBag.SupportOData = SessionHelper.Info.ODataService;

            return PartialView("~/Views/Model/Role/Roles.cshtml");
        }

        public ActionResult GetAllUsers(string filter = "")
        {
            string queryString = UtilitiesHelper.GetOffsetLimitQueryString(1, 1000, filter);
            string requestUrl = string.Format("/users?{0}", queryString);
            ListViewModel<UserViewModel> userViewModel = _userService.GetUsers(requestUrl);
            return Json(userViewModel.Data, JsonRequestBehavior.AllowGet);
        }

        public ActionResult GetUserInRole(string roleUri)
        {
            string queryString = UtilitiesHelper.GetOffsetLimitQueryString(1, 1000);
            string requestUrl = string.Format("{0}/users?{1}", roleUri, queryString);
            ListViewModel<UserViewModel> userViewModel = _userService.GetUsers(requestUrl);
            return Json(userViewModel.Data, JsonRequestBehavior.AllowGet);
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public async Task<ActionResult> SaveUserInRole(string roleId, string assignUserList, string unAssignUserList, string modelId)
        {
            if(assignUserList == "" && unAssignUserList == "")
                return Json(new List<TaskHistoryViewModel>(), JsonRequestBehavior.AllowGet);

            var taskViewModel = new TaskViewModel();
            var assignUserInRoleList = assignUserList != "" ? assignUserList.Split(',') : new string[] { };
            var unAssignUserInRoleList = unAssignUserList != "" ? unAssignUserList.Split(',') : new string[] { };

            taskViewModel.name = "Assign" + roleId;
            taskViewModel.delete_after_completion = true;
            taskViewModel.start_immediately = true;
            taskViewModel.actions = new List<Core.ViewModels.Cycle.TaskAction>();
            
            // This should be refactored to use just ONE action
            // PBI M4-26020 is for refactoring this code
            if (assignUserInRoleList.Any())
                AddTaskAction(roleId, modelId, taskViewModel, assignUserInRoleList, "assign");

            if (unAssignUserInRoleList.Any())
                AddTaskAction(roleId, modelId, taskViewModel, unAssignUserInRoleList, "unassign");

            string taskUri = SessionHelper.Version.GetEntryByName("tasks").Uri.ToString();
            taskViewModel = _taskService.CreateTask(taskUri, taskViewModel);

            var breakLoop = false;
            var taskHistories = new List<TaskHistoryViewModel>();
            while (!breakLoop)
            {
                List<TaskHistoryViewModel> taskHistoryItems = _taskService.GetTaskHistories(taskViewModel.History.ToString())
                                        .Data.Where(item => item.category == "201" || item.category == "202").ToList();
                if (taskHistoryItems.Count == taskViewModel.actions.Count)
                {
                    foreach (TaskHistoryViewModel taskHistoryItem in taskHistoryItems)
                    {
                        TaskHistoryViewModel taskHistory = _taskService.GetTaskHistory(taskHistoryItem.Uri.ToString());
                        taskHistories.Add(taskHistory);
                    }
                    breakLoop = true;
                }
                else
                {
                    await Task.Delay(1000);
                }
            }

            return Json(taskHistories, JsonRequestBehavior.AllowGet);
        }

        private static void AddTaskAction(string roleId, string modelId, TaskViewModel taskViewModel, string[] userInRoleList, string massUpdateType)
        {
            var action = new Core.ViewModels.Cycle.TaskAction
            {
                action_type = "mass_update_assigned_roles",
                arguments = new List<Core.ViewModels.Cycle.Argument>()
            };

            action.arguments.Add(new Core.ViewModels.Cycle.Argument
            {
                name = "role",
                value = roleId
            });

            action.arguments.Add(new Core.ViewModels.Cycle.Argument
            {
                name = "mass_update_type",
                value = massUpdateType
            });
            
            action.arguments.Add(new Core.ViewModels.Cycle.Argument
            {
                name = "users",
                value = userInRoleList
            });

            if (!string.IsNullOrEmpty(modelId))
            {
                action.arguments.Add(new Core.ViewModels.Cycle.Argument
                {
                    name = "model",
                    value = modelId
                });
            }

            taskViewModel.actions.Add(action);
        }

        public ActionResult GetFieldSource(string fieldsSourceUri)
        {
            var fieldsSource = _modelService.GetFieldCategory(Uri.UnescapeDataString(fieldsSourceUri));
            return Json(fieldsSource, JsonRequestBehavior.AllowGet);
        }

        public ActionResult GetModelField(string fieldsUri)
        {
            var fields = new FieldViewModel();
            if (fieldsUri != "")
            {
                fields = _modelService.GetModelFields(Uri.UnescapeDataString(fieldsUri) + "&viewmode=basic");
            }
            return Json(fields, JsonRequestBehavior.AllowGet);
        }

        public ActionResult GetFieldDomain(string fieldsDomainUri)
        {
            var fieldDomain = new FieldDomainViewModel();
            if (fieldsDomainUri != "")
            {
                fieldDomain = _modelService.GetFieldDomain(Uri.UnescapeDataString(fieldsDomainUri));
            }
            return Json(fieldDomain, JsonRequestBehavior.AllowGet);
        }

        public ActionResult GetHelpTexts(string helpTextUri)
        {
            var helpTextModel = new List<HelpTextsViewModel>();
            if (helpTextUri != "")
            {
                helpTextModel = _modelService.GetModelFieldsHelpTexts(Uri.UnescapeDataString(helpTextUri));
            }
            return Json(helpTextModel, JsonRequestBehavior.AllowGet);
        }

        public ActionResult GetHelpText(string helpTextUri)
        {
            var helpTextModel = new HelpTextsViewModel();
            if (helpTextUri != "")
            {
                helpTextModel = _modelService.GetModelFieldsHelpText(Uri.UnescapeDataString(helpTextUri));
            }
            return Json(helpTextModel, JsonRequestBehavior.AllowGet);
        }

        public ActionResult GetLabelDropdown(ListViewModel<LabelViewModel> labelDatas = null)
        {
            var version = SessionHelper.Version;
            var viewmodel = labelDatas ?? _labelService.GetLabels(version.GetEntryByName("labels").Uri + "?" +
                                           UtilitiesHelper.GetOffsetLimitQueryString(1, MaxPageSize));
            return Json(viewmodel.Data.OrderBy(l => l.id).ToList(), JsonRequestBehavior.AllowGet);
        }

        public ActionResult GetAvailableSubRoles(string modelUri)
        {
            var model = GetModel(modelUri);
            var subRoles =
                _modelService.GetRoles(model.ModelRolesUri.ToString()).Data.Select(selector => selector.Id).ToList();
            return Json(subRoles, JsonRequestBehavior.AllowGet);
        }

        public ActionResult GetConsolidatedRole(string roleUri)
        {
            var role = _userService.GetRole(roleUri);
            var consolidatedRole = GetShortNameToConsolidateRoles(role);

            var consolidatedRoleData = new List<TreeViewItemModel>();
            if (consolidatedRole != null)
            {
                var data = JsonConvert.SerializeObject(consolidatedRole);

                JToken node = JObject.Parse(data);

                consolidatedRoleData = WalkNode(node, consolidatedRoleData, n =>
                {
                    var token = (JToken)n;
                    if (token != null && token.Type == JTokenType.String)
                    {
                        var treeview = new TreeViewItemModel();
                        treeview.Text = "";
                    }
                });
            }
            ViewData["Id"] = role.Id;
            ViewData["Description"] = role.Description;
            return PartialView("~/Views/User/UserModelPrivileges.cshtml", consolidatedRoleData);
        }

        private List<TreeViewItemModel> WalkNode(JToken node, List<TreeViewItemModel> flatObjects, Action<object> action)
        {
            var recursiveObjects = new List<TreeViewItemModel>();

            if (node.Type == JTokenType.Object || node.Type == JTokenType.Array)
            {
                if (node.GetType() == typeof(JObject))
                {
                    action((JObject)node);
                    var allProperties = node.Children<JProperty>();

                    //check if it is a village, create group properties
                    allProperties = ConsolidateRoleHelper.CreatePrivilegeProperty(node, allProperties);
                    allProperties = ConsolidateRoleHelper.OrderModelPrivilege(node, allProperties);

                    foreach (var child in allProperties)
                    {
                        if (child.Value.ToString() != "" && child.Name != "model" && child.Name != "consolidated_role" &&
                            child.Name != "uri" && child.Name != "AllowedValuesName")
                        {
                            if (child.Value.Type != JTokenType.Object && child.Value.Type != JTokenType.Array)
                            {
                                var value = ConsolidateRoleHelper.ChangePriviledgeState(child.Value.ToString(), node,
                                    child);
                                recursiveObjects.Add(new TreeViewItemModel
                                {
                                    Text =
                                        string.Format("{0}: <i class=\"{2}\">{1}</i>",
                                            JsonResourceHandler.GetResource<ConsolidatedRoleViewModel>(child.Name),
                                            value, value.ToLowerInvariant()),
                                    Items = WalkNode(child.Value, flatObjects, action)
                                });
                            }
                            else
                            {
                                recursiveObjects.Add(new TreeViewItemModel
                                {
                                    Text = JsonResourceHandler.GetResource<ConsolidatedRoleViewModel>(child.Name),
                                    Items = WalkNode(child.Value, flatObjects, action)
                                });
                            }
                        }
                    }
                }
                else
                {
                    action((JArray)node);
                    foreach (var token in node)
                    {
                        if (token.Children<JProperty>().Any())
                        {
                            var allProperties = token.Children<JProperty>();

                            if (node.Path == "field_authorizations" || node.Path == "object_filters")
                                allProperties = ConsolidateRoleHelper.CreateClassProperty(token, node);

                            foreach (var child in allProperties)
                            {
                                if (child.Value.ToString() != "" && child.Name != "model" &&
                                    child.Name != "consolidated_role" && child.Name != "uri"
                                    && child.Name != "AllowedValuesName")
                                {
                                    if (child.Value.Type != JTokenType.Object && child.Value.Type != JTokenType.Array)
                                    {
                                        var value = ConsolidateRoleHelper.ChangePriviledgeState(child.Value.ToString(),
                                            node, child);
                                        recursiveObjects.Add(new TreeViewItemModel
                                        {
                                            Text = string.Format("{0}: <i class=\"{2}\">{1}</i>",
                                                    JsonResourceHandler.GetResource<ConsolidatedRoleViewModel>(child.Name),
                                                    value,
                                                    value.ToLower()),
                                            Items = WalkNode(child.Value, flatObjects, action)
                                        });
                                    }
                                    else
                                    {
                                        recursiveObjects.Add(new TreeViewItemModel
                                        {
                                            Text = JsonResourceHandler.GetResource<ConsolidatedRoleViewModel>(child.Name),
                                            Items = WalkNode(child.Value, flatObjects, action)
                                        });
                                    }
                                }
                            }
                        }
                        else
                        {
                            if (token.Type == JTokenType.String && !string.IsNullOrEmpty(token.ToString()))
                            {
                                recursiveObjects.Add(new TreeViewItemModel
                                {
                                    Text = token.ToString(),
                                    Items = null
                                });
                            }
                        }
                    }
                }
            }
            return recursiveObjects;
        }

        public ActionResult DeleteRole(string modelUri, string roleUri)
        {
            _modelService.DeleteRole(roleUri);
            return new JsonResult
            {
                Data = new { success = true, message = Resource.MC_ItemSuccesfullyUpdated },
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        public ActionResult GetFilterLabels(string modelUri, string roleUri, string q = "")
        {
            string query = q.ToLowerInvariant();
            var role = _modelService.GetRole(modelUri, roleUri);
            var labels = new List<PrivilegeLabel>();
            role.PrivilegeLabels.ForEach(label =>
            {
                if (label.LabelCategory.ToLowerInvariant().Contains(query) || label.Name.ToLowerInvariant().Contains(query))
                {
                    labels.Add(label);
                }
            });
            role.PrivilegeLabels = labels;
            return PartialView("~/Views/Model/Role/LabelsTab.cshtml", role);
        }

        public ActionResult GetSubRoleFilters(string modelUri, string roleUri, string q = "")
        {
            var role = _modelService.GetRole(modelUri, roleUri);
            var subRoles = new List<SystemRoleViewModel>();
            if (role.SubRoles != null)
            {
                role.SubRoles.ForEach(subRole =>
                {
                    if (subRole.Id.Contains(q) || subRole.Description.Contains(q))
                    {
                        subRoles.Add(subRole);
                    }
                });
            }
            role.SubRoles = subRoles;
            return PartialView("~/Views/Model/Role/SubRoleTab.cshtml", role);
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult GetObjectMetadata(string modelUri, string classes)
        {
            var model = GetModel(modelUri);

            // classes
            var classesNameList =
                _modelService.GetClasses(model.ClassesUri + "?ids=" + classes + "&" +
                                        UtilitiesHelper.GetOffsetLimitQueryString(1, MaxPageSize));

            return Json(classesNameList, JsonRequestBehavior.AllowGet);
        }

        public ActionResult EditRole(string modelUri, string roleUri)
        {
            var role = new SystemRoleViewModel { Id = "", Description = "" };
            var version = SessionHelper.Version;
            var model = GetModel(modelUri);
            List<ModelServerViewModel> modelServers = _modelService.GetModelServers(model.ServerUri.ToString()).Data;

            _loadParallelDataForEditRole(version, model, SessionHelper);

            InitialViewBagForEditRole(modelUri, roleUri, model, SessionHelper, modelServers);

            if (!string.IsNullOrEmpty(roleUri))
            {
                role = LoadRole(modelUri, roleUri, model);

                LoadDefaultClassesToSelectListItem();

                LoadFieldsList(model, role);

                LoadSubRole(model, roleUri);
            }

            return PartialView("~/Views/Model/Role/EditRole.cshtml", role);
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult CheckCopyRole(string destinationModelUri, string oldModelUri, string roleUri,
            string roleName)
        {
            var model = SessionHelper.GetModel(destinationModelUri);
            var role = _modelService.GetRole(destinationModelUri, roleUri);

            if (destinationModelUri != oldModelUri)
            {
                var Newrole = CopyRoleGeneralInformation(roleName, role);
                CopyRoleModelPrivilegeInformation(model, role, Newrole);

                var objectClasses = new List<string>();
                var modelFields = new List<string>();
                var nonExistingModelFields = new List<string>();

                // M4-32346 - need to check which classes are used in authorizations
                LoadModelClasses(role, objectClasses);

                LoadModelFieldsFromObjectFilters(model, role, objectClasses, modelFields, nonExistingModelFields);

                var existModelClasses = GetModelClassesName(destinationModelUri);
                MapValueToModelPrivilege(role, Newrole, objectClasses, modelFields, existModelClasses);

                var newLabelsAuthorization = LoadLabelAuthorizations(model, role, Newrole);
                Newrole.ModelPrivilege.DefaultLabelAuthorization = role.ModelPrivilege.DefaultLabelAuthorization;

                return new JsonResult
                {
                    Data =
                        new
                        {
                            roleData =
                                JsonConvert.SerializeObject(Newrole,
                                    new JsonSerializerSettings
                                    {
                                        ContractResolver = new CleanUpPropertiesResolver(new List<string> { "ChangedBy" })
                                    }),
                            removedData =
                                new
                                {
                                    modelId = model.id,
                                    objectClass = objectClasses.Except(existModelClasses).ToList(),
                                    referenceField = nonExistingModelFields,
                                    label =
                                        role.ModelPrivilege.LabelAuthorizations.Keys.Except(newLabelsAuthorization.Keys)
                                            .ToList()
                                }
                        },
                    JsonRequestBehavior = JsonRequestBehavior.AllowGet
                };
            }


            role.Id = roleName;

            return new JsonResult
            {
                Data =
                    new
                    {
                        roleData =
                            JsonConvert.SerializeObject(role,
                                new JsonSerializerSettings
                                {
                                    ContractResolver = new CleanUpPropertiesResolver(new List<string> { "ChangedBy" })
                                }),
                        removedData = new { modelId = model.id, objectClass = "", label = "" }
                    },
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult CopyRole(string roleData)
        {
            // Create role
            var version = SessionHelper.Version;
            _modelService.CreateRole(version.GetEntryByName("system_roles").Uri.ToString(), roleData);

            return new JsonResult
            {
                Data = new { success = true, message = Resource.MC_ItemSuccesfullyUpdated },
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult SaveRole(SystemRoleViewModel roleModel,
            string modelUri, string modelId,
            string deleteClassFromRole, string privilegeLabels,
            string deleteLabelPrivillage, string subRoleIds,
            string field_authorizations, string allowedObjects,
            string denyObjects, string objectFilters,
            FormCollection formCollection)
        {
            var roleUri = string.Empty;
            var session_needs_update = false;

            Session["AllClasses"] = null;
            Session["Role"] = null;

            ModelState.Remove("PrivilegeLabels");

            if (!ModelState.IsValid)
            {
                throw new HttpException(409,
                    "{ \"success\": false, \"reason\": \"Conflict\", \"message\": \"Role ID should contain only a-z, A-Z, 0-9, and '_'\" }");
            }

            var version = SessionHelper.Version;

            if (roleModel.Uri == null)
            {
                CreateRole(ref roleUri, modelUri, roleModel, version);
            }
            else
            {
                UpdateRole(ref roleUri
                                , ref session_needs_update
                                , modelUri
                                , privilegeLabels
                                , field_authorizations
                                , allowedObjects
                                , denyObjects
                                , objectFilters
                                , subRoleIds
                                , deleteLabelPrivillage
                                , formCollection
                                , roleModel);
            }


            return new JsonResult
            {
                Data =
                    new
                    {
                        success = true,
                        message = Resource.MC_ItemSuccesfullyUpdated,
                        session_needs_update,
                        parameters = new { modelUri, roleUri, modelId }
                    },
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };

        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult ReadRoles([DataSourceRequest] DataSourceRequest request, string modelUri, string q)
        {
            var model = GetModel(modelUri);
            var roles = GetRoles(model.ModelRolesUri.ToString(), request.Page, request.PageSize, q,
                PageHelper.GetQueryString(request, QueryString.Role));
            var result = new DataSourceResult
            {
                Data = roles.Data,
                Total = roles.Header.Total
            };
            return Json(result);
        }

        public ActionResult RenderObjectTab(string modelUri, string roleUri)
        {
            var model = GetModel(modelUri);
            var availableObjects = LoadAvailableObjectsAllClasses(model);

            if (roleUri != "")
            {
                ViewBag.RoleUri = roleUri;
                var role = LoadRole(modelUri, roleUri);

                SetAllowedClasses(availableObjects, role);
                SetDeninedClasses(availableObjects, role);
            }

            return PartialView("~/Views/Model/Role/ObjectTab.cshtml", availableObjects);
        }

        public ActionResult RenderFilterTab(string modelUri, string roleUri)
        {
            ViewBag.ModelUri = modelUri;

            var model = GetModel(modelUri);

            MapValueToTargetClasses();
            MapValueToSourceClasses();

            var filters = new List<ObjectFilterViewModel>();
            if (!string.IsNullOrEmpty(roleUri))
            {
                ViewBag.RoleUri = roleUri;
                LoadAllClasses(model);
                filters = LoadAllObjectFilter(modelUri, roleUri);

                var fieldIds = filters.SelectMany(se => se.AllFields).Distinct().ToList();
                LoadObjectFilter(ref filters, fieldIds, model);
            }

            return PartialView("~/Views/Model/Role/FilterTab.cshtml", filters.SelectMany(f => f.AllFilters));
        }

        public ActionResult RenderLabelTab(string modelUri, string roleUri, SystemRoleViewModel systemrole)
        {
            ViewBag.ModelUri = modelUri;
            ViewBag.RoleUri = roleUri;
            ViewBag.Systemrole = systemrole;
            return PartialView("~/Views/Model/Role/LabelsTab.cshtml");
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public JsonResult ReadLabels([DataSourceRequest] DataSourceRequest request, string modelUri, string roleUri)
        {
            var systemrole = _modelService.GetRoleById(roleUri);
            var model = SessionHelper.GetModel(modelUri);
            var offsetLimitQuery = UtilitiesHelper.GetOffsetLimitQueryString(1, MaxPageSize);
            var allCategories = _labelService.GetLabelCategories(model.label_categories.ToString() + "?" + offsetLimitQuery);
            var allLabels = _labelService.GetLabels(model.labels + "?" + offsetLimitQuery);

            int fakeId = 1;
            List<LabelDtoViewModel> labelsDto = new List<LabelDtoViewModel>();
            foreach (var category in allCategories.Data)
            {
                if (category.used_for_authorization)
                {
                    LabelDtoViewModel dto = new LabelDtoViewModel();
                    dto.Id = category.id;
                    dto.Name = category.name;
                    dto.FakeId = fakeId;
                    labelsDto.Add(dto);
                    int subFakeId = fakeId * 1000;

                    foreach (var label in allLabels.Data.Where(filter => filter.category + "/labels" == category.labels).ToList())
                    {
                        LabelDtoViewModel subDto = new LabelDtoViewModel
                        {
                            Id = label.id,
                            Name = label.name,
                            Abbreviation = label.abbreviation,
                            Authorization = systemrole.ModelPrivilege.LabelAuthorizations.ContainsKey(label.id)
                                            ? systemrole.ModelPrivilege.LabelAuthorizations[label.id]
                                            : "undefined",
                            FakeId = subFakeId,
                            ParentFakeId = fakeId
                        };
                        labelsDto.Add(subDto);
                        subFakeId++;
                    }
                    fakeId++;
                }
            }

            return Json(labelsDto.ToTreeDataSourceResult(request), JsonRequestBehavior.AllowGet);
        }
        #endregion

        #region "Private"

        private ListViewModel<SystemRoleViewModel> GetRoles(string roleUri, int page, int pagesize, string q,
            string sort)
        {
            var roles = new ListViewModel<SystemRoleViewModel>();
            var uriList = new List<string>();

            uriList.Add(roleUri + (roleUri.Contains("?") ? "&" : "?") +
                        UtilitiesHelper.GetOffsetLimitQueryString(page, pagesize, q) + sort);

            UrlHelperExtension.ParallelRequest(uriList).ForEach(delegate(Task<JObject> task)
            {
                roles.Data =
                    JsonConvert.DeserializeObject<List<SystemRoleViewModel>>(
                        task.Result.SelectToken("roles").ToString(), new UnixDateTimeConverter());
                roles.Header =
                    JsonConvert.DeserializeObject<HeaderViewModel>(task.Result.SelectToken("header").ToString());
            });

            return roles;
        }

        private List<string> GetModelClassesName(string modelUri, ModelViewModel modelData = null)
        {
            var model = modelData ?? GetModel(modelUri);
            var classesName =
                _modelService.GetClassesId(model.ClassesUri + "?" +
                                          UtilitiesHelper.GetOffsetLimitQueryString(1, MaxPageSize));

            return classesName.OrderBy(c => c).ToList();
        }

        private ModelViewModel GetModel(string modelUri, bool forceGetNew = false)
        {
            ModelViewModel model;
            bool isNeedLoadNew = TempData["ModelViewModelData"] == null
                || (((ModelViewModel)TempData["ModelViewModelData"]).Uri.ToString() != modelUri);

            if (isNeedLoadNew || forceGetNew)
            {
                var taskList = UrlHelperExtension.ParallelRequest(new List<string>() { modelUri });
                model = JsonConvert.DeserializeObject<ModelViewModel>(taskList[0].Result.ToString(), new UnixDateTimeConverter());

                TempData["ModelViewModelData"] = model;
            }
            else
            {
                model = TempData["ModelViewModelData"] as ModelViewModel;
            }

            return model;
        }

        private ConsolidatedRoleViewModel SetShortNameToAllowedClass(ConsolidatedRoleViewModel consolidatedRole, ModelViewModel model)
        {
            //set short name to allowed class
            var requestClasses = new List<string>();
            requestClasses.AddRange(consolidatedRole.ModelPrivilege.AllowedClasses);
            if (requestClasses.Count > 0)
            {
                var availableClasses = ParallelRequestHelper.GetObjectListByIds(model, requestClasses);

                for (var i = 0; i < consolidatedRole.ModelPrivilege.AllowedClasses.Count; i++)
                {
                    var currentClass = availableClasses.FirstOrDefault(f => f.id == consolidatedRole.ModelPrivilege.AllowedClasses[i]);
                    consolidatedRole.ModelPrivilege.AllowedClasses[i] = currentClass != null && !string.IsNullOrEmpty(currentClass.short_name)
                        ? currentClass.short_name
                        : consolidatedRole.ModelPrivilege.AllowedClasses[i];
                }
            }

            return consolidatedRole;
        }

        private List<ObjectFilterViewModel> SetShortNameToObjectFileterClass(List<string> objectFilterClasses
                                                    , List<ObjectFilterViewModel> objectFilterList
                                                    , ModelViewModel model)
        {
            if (objectFilterClasses.Any())
            {
                var availableClassesInObjectFilter = ParallelRequestHelper.GetObjectListByIds(model, objectFilterClasses);

                for (var i = 0; i < objectFilterList.Count; i++)
                {
                    for (var j = 0; j < objectFilterList[i].Classes.Count; j++)
                    {
                        var currentClass = availableClassesInObjectFilter.FirstOrDefault(f => f.id == objectFilterList[i].Classes[j]);
                        objectFilterList[i].Classes[j] = currentClass != null && !string.IsNullOrEmpty(currentClass.short_name)
                            ? currentClass.short_name
                            : objectFilterList[i].Classes[j];
                    }
                }
            }

            return objectFilterList;
        }

        private List<ObjectFilterViewModel> SetShortNameToObjectFileterField(List<string> objectFilterClasses
                                                                    , List<ObjectFilterViewModel> objectFilterList
                                                                    , ModelViewModel model)
        {
            var fieldFilterClasses = new List<string>();
            foreach (var objectFilter in objectFilterList)
            {
                if (objectFilter.field_filters != null)
                {
                    foreach (var fieldFilter in objectFilter.field_filters)
                    {
                        fieldFilterClasses.Add(fieldFilter.field);
                    }
                }
            }

            if (objectFilterClasses.Count > 0)
            {
                var availableFields = ParallelRequestHelper.GetFieldListByIds(model, fieldFilterClasses);

                for (var i = 0; i < objectFilterList.Count; i++)
                {
                    if (objectFilterList[i].field_filters != null)
                    {
                        for (var j = 0; j < objectFilterList[i].field_filters.Count; j++)
                        {
                            var currentField = availableFields.FirstOrDefault(f => f.id == objectFilterList[i].field_filters[j].field);
                            objectFilterList[i].field_filters[j].field = currentField != null && !string.IsNullOrEmpty(currentField.short_name)
                                ? currentField.short_name
                                : objectFilterList[i].Classes[j];
                        }
                    }
                }
            }

            return objectFilterList;
        }

        private List<FieldAuthorizationViewModel> SetShortNameToFieldAuthorizationsClass(List<FieldAuthorizationViewModel> fieldList
                                        , ModelViewModel model)
        {
            var fieldClasses = new List<string>();
            fieldClasses.AddRange(fieldList.SelectMany(x => x.FieldAuthorizationClasses));

            if (fieldClasses.Any())
            {
                var availableClassesInField = ParallelRequestHelper.GetObjectListByIds(model, fieldClasses);

                for (var i = 0; i < fieldList.Count; i++)
                {
                    for (var j = 0; j < fieldList[i].FieldAuthorizationClasses.Count; j++)
                    {
                        var currentClass = availableClassesInField.FirstOrDefault(f => f.id == fieldList[i].FieldAuthorizationClasses[j]);
                        fieldList[i].FieldAuthorizationClasses[j] = currentClass != null && !string.IsNullOrEmpty(currentClass.short_name)
                            ? currentClass.short_name
                            : fieldList[i].FieldAuthorizationClasses[j];
                    }
                }
            }

            return fieldList;
        }

        private List<FieldAuthorizationViewModel> SetShortNameToFieldAuthorizationsField(List<FieldAuthorizationViewModel> fieldList
                                                                                        , ModelViewModel model)
        {
            var fieldAuthorizations = new List<string>();
            fieldAuthorizations.AddRange(fieldList.Where(x => x.AllowedFields.Any()).SelectMany(x => x.AllowedFields));
            fieldAuthorizations.AddRange(fieldList.Where(x => x.AllowedFields.Any()).SelectMany(x => x.AllowedFields));

            if (fieldAuthorizations.Any())
            {
                var availableAllowedFields = ParallelRequestHelper.GetFieldListByIds(model, fieldAuthorizations);

                for (var i = 0; i < fieldList.Count; i++)
                {
                    FilterAllowedFieldAndDisallowedField(fieldList, availableAllowedFields, i);
                }
            }

            return fieldList;
        }

        private static void FilterAllowedFieldAndDisallowedField(List<FieldAuthorizationViewModel> fieldList, List<Field> availableAllowedFields, int i)
        {
            for (var j = 0; j < fieldList[i].AllowedFields.Count; j++)
            {
                var currentField = availableAllowedFields.FirstOrDefault(f => f.id == fieldList[i].AllowedFields[j]);
                fieldList[i].AllowedFields[j] = currentField != null && !string.IsNullOrEmpty(currentField.short_name)
                    ? currentField.short_name
                    : fieldList[i].AllowedFields[j];
            }

            for (var j = 0; j < fieldList[i].DisallowedFields.Count; j++)
            {
                var currentField = availableAllowedFields.FirstOrDefault(f => f.id == fieldList[i].DisallowedFields[j]);
                fieldList[i].DisallowedFields[j] = currentField != null && !string.IsNullOrEmpty(currentField.short_name)
                    ? currentField.short_name
                    : fieldList[i].DisallowedFields[j];
            }
        }

        private ConsolidatedRoleViewModel GetShortNameToConsolidateRoles(SystemRoleViewModel role)
        {
            var consolidatedRole = _userService.GetConsolidatedRole(role.Consolidated_role.ToString());

            if (consolidatedRole != null && consolidatedRole.ModelPrivilege != null)
            {
                var model = SessionHelper.GetModel(consolidatedRole.ModelPrivilege.model.ToString());

                //set short name to allowed class
                consolidatedRole = SetShortNameToAllowedClass(consolidatedRole, model);

                //set short name to Object Fileter Class
                var objectFilterClasses = new List<string>();
                var objectFilterList = consolidatedRole.ModelPrivilege.ObjectFilter;
                foreach (var objectFilter in objectFilterList)
                {
                    objectFilterClasses.AddRange(objectFilter.Classes);
                }
                objectFilterList = SetShortNameToObjectFileterClass(objectFilterClasses, objectFilterList, model);


                //set short name to Object Fileter Field
                objectFilterList = SetShortNameToObjectFileterField(objectFilterClasses, objectFilterList, model);

                //set short name to Field Authorizations Class
                var fieldList = consolidatedRole.ModelPrivilege.FieldAuthorizations;
                fieldList = SetShortNameToFieldAuthorizationsClass(fieldList, model);

                //set short name to Field Authorizations Field
                fieldList = SetShortNameToFieldAuthorizationsField(fieldList, model);

            }

            return consolidatedRole;
        }

        private void LoadDefaultClassesToSelectListItem()
        {
            var sourceClasses = new List<ClassViewModel>();
            sourceClasses.Insert(0,
                new ClassViewModel
                {
                    id = "*",
                    short_name = Resource.MC_AllObjects,
                    long_name = Resource.MC_AllObjects,
                    uri = null,
                    main_businessprocess = null
                });
            sourceClasses.Insert(1,
                new ClassViewModel
                {
                    id = "select_object",
                    short_name = Resource.MC_SelectObject,
                    long_name = Resource.MC_SelectObject,
                    uri = null,
                    main_businessprocess = null
                });

            ViewBag.SourceClasses = sourceClasses.Select(cls => new SelectListItem
            {
                Text = string.IsNullOrEmpty(cls.short_name) ? cls.id : cls.short_name,
                Value = cls.id
            });
        }

        private void LoadSubRole(ModelViewModel model, string roleUri)
        {
            var availableRoles = new List<Tuple<string, string>>();
            var modelRolesUri = string.Format("{0}{1}{2}", model.ModelRolesUri, "&", UtilitiesHelper.GetOffsetLimitQueryString(1, MaxPageSize));
            var rolesList = _modelService.GetRoles(modelRolesUri).Data;

            rolesList.ForEach(subRole =>
            {
                if (subRole.Uri.ToString() != roleUri)
                {
                    availableRoles.Add(Tuple.Create(subRole.Id, subRole.Description));
                }
            });
            ViewData["SubRoles"] = availableRoles.OrderBy(r => r.Item1).ToList();
        }

        private void LoadFieldsList(ModelViewModel model, SystemRoleViewModel role)
        {
            var fieldIds = new List<string>();
            fieldsList = new List<Tuple<string, string, string, bool, string>>();
            if (role.ModelPrivilege.FieldAuthorizations.Count > 0)
            {
                for (var index = 0; index < role.ModelPrivilege.FieldAuthorizations.Count; index++)
                {
                    foreach (var allowedField in role.ModelPrivilege.FieldAuthorizations[index].AllowedFields)
                    {
                        fieldIds.Add(allowedField);
                    }

                    foreach (var denyField in role.ModelPrivilege.FieldAuthorizations[index].DisallowedFields)
                    {
                        fieldIds.Add(denyField);
                    }
                }
                LoadFieldAuthorizationsAllowedAndDisallowed(fieldIds, model, role);
            }
            ViewData["fieldsList"] = fieldsList.OrderBy(field => field.Item1).ToList();
        }

        private void LoadFieldAuthorizationsAllowedAndDisallowed(List<string> fieldIds
                                                , ModelViewModel model
                                                , SystemRoleViewModel role)
        {
            if (fieldIds.Any())
            {
                List<string> ids = fieldIds.Distinct().ToList();
                var fieldFilter = ParallelRequestHelper.GetFieldListByIds(model, ids);
                ViewData["fieldFilter"] = fieldFilter;
                
                if (role.ModelPrivilege.FieldAuthorizations.Any())
                {
                    LoadFieldAuthorizations(role, fieldFilter, true);
                    LoadFieldAuthorizations(role, fieldFilter, false);
                }
            }
        }

        private void LoadFieldAuthorizations(SystemRoleViewModel role, List<Field> fieldFilter, bool isAllowedField)
        {
            var fieldAuthorizationsAllowedFieldsList = isAllowedField ?
                        role.ModelPrivilege.FieldAuthorizations.Where(x => x.AllowedFields.Count > 0)
                        : role.ModelPrivilege.FieldAuthorizations.Where(x => x.DisallowedFields.Count > 0);
            foreach (var fieldAuthorizationsItem in fieldAuthorizationsAllowedFieldsList)
            {
                FilterAllowedDisallowedFieldsList(fieldFilter, isAllowedField, fieldAuthorizationsItem);
            }
        }

        private void FilterAllowedDisallowedFieldsList(List<Field> fieldFilter, bool isAllowedField, FieldAuthorizationViewModel fieldAuthorizationsItem)
        {
            var allowedDisallowedFieldsList = isAllowedField ? fieldAuthorizationsItem.AllowedFields : fieldAuthorizationsItem.DisallowedFields;

            foreach (var allowedDisallowedField in allowedDisallowedFieldsList)
            {
                var fieldName = allowedDisallowedField;
                var field = fieldFilter.FirstOrDefault(filter => filter.id == allowedDisallowedField);
                if (field != null)
                {
                    if (field.source != null)
                    {
                        var fieldSource = _modelService.GetFieldCategory(field.source.ToString());
                        fieldName = string.Format("{0} - {1}", fieldSource.short_name, field.short_name);
                    }
                    else
                    {
                        fieldName = string.Format("{0} - {1}", "Unknown", field.short_name);
                    }
                }
                fieldsList.Add(Tuple.Create(Guid.NewGuid().ToString()
                    , fieldAuthorizationsItem.FieldAuthorizationClasses.FirstOrDefault()
                    , allowedDisallowedField, isAllowedField
                    , fieldName));
            }
        }

        private void BindAllLabels(Task<JObject> task)
        {
            var jsonResult = task.Result;
            var token = jsonResult.SelectToken("labels");

            if (token == null)
            {
                allLabelsList.Data = JsonConvert.DeserializeObject<List<LabelViewModel>>(
                                        jsonResult.SelectToken("business_processes").ToString());
            }
            else
            {
                allLabelsList.Data = JsonConvert.DeserializeObject<List<LabelViewModel>>(
                                        jsonResult.SelectToken("labels").ToString());
            }

            allLabelsList.Header = JsonConvert.DeserializeObject<HeaderViewModel>(jsonResult.SelectToken("header").ToString());
        }

        private void BindAllCategories(Task<JObject> task)
        {
            var jsonResult = task.Result;
            allCategoriesList.Data = JsonConvert.DeserializeObject<List<LabelCategoryViewModel>>(
                                        jsonResult.SelectToken("label_categories").ToString()).ToList();
            allCategoriesList.Header = JsonConvert.DeserializeObject<HeaderViewModel>(jsonResult.SelectToken("header").ToString());
            allCategoriesList.Header.Total = allCategoriesList.Data.Count;
        }

        private void BindFieldCategories(Task<JObject> task)
        {
            var fieldCategories = new ListViewModel<FieldCategoryViewModel>();
            fieldCategories.Data =
                JsonConvert.DeserializeObject<List<FieldCategoryViewModel>>(
                    task.Result.SelectToken("field_categories").ToString());
            fieldCategories.Header =
                JsonConvert.DeserializeObject<HeaderViewModel>(task.Result.SelectToken("header").ToString());

            ViewData["fieldCategories"] = JsonConvert.SerializeObject(fieldCategories.Data);
        }

        private void BindBusinessProcesses(Task<JObject> task)
        {
            ViewData["BusinessProcesses"] = JsonConvert.DeserializeObject<List<BusinessProcessViewModel>>(
                                                                   task.Result.SelectToken("business_processes").ToString());
        }

        private void BindAllClasses(Task<JObject> task)
        {
            ViewBag.AllClasses = JsonConvert.DeserializeObject<List<ClassViewModel>>(
                                                                   task.Result.SelectToken("classes").ToString())
                                                                       .OrderBy(o => o.id).ToList();
            Session["AllClasses"] = (List<ClassViewModel>)ViewBag.AllClasses;
        }

        private void LoadParallelDataForEditRole(VersionViewModel version
                            , ModelViewModel model
                            , SessionHelper sessionHelper)
        {
            var formatUrl = "{0}{1}{2}";
            var speratorUrl = "?";
            var offsetLimitQuery = UtilitiesHelper.GetOffsetLimitQueryString(1, MaxPageSize);

            var labelsUri = string.Format(formatUrl, version.GetEntryByEnum(VersionEntry.labels).Uri, speratorUrl, offsetLimitQuery);
            var labelCategoriesUri = string.Format(formatUrl, model.label_categories, speratorUrl, offsetLimitQuery);
            var fieldCategoriesUri = string.Format(formatUrl, version.GetEntryByEnum(VersionEntry.field_categories).Uri
                                                                 , speratorUrl
                                                                 , UtilitiesHelper.GetOffsetLimitQueryString(1, MaxPageSize));
            var businessProcessesUri = string.Format(formatUrl, sessionHelper.Version.GetEntryByEnum(VersionEntry.business_processes).Uri
                                                                , speratorUrl
                                                                , offsetLimitQuery);
            var classesUri = string.Format(formatUrl, model.ClassesUri
                                                         , speratorUrl
                                                         , UtilitiesHelper.GetOffsetLimitQueryString(1, MaxPageSize));

            ExecuteParallelDataForEditRole(labelsUri, labelCategoriesUri, fieldCategoriesUri, businessProcessesUri, classesUri);
        }

        private void ExecuteParallelDataForEditRole(string labelsUri, string labelCategoriesUri, string fieldCategoriesUri, string businessProcessesUri, string classesUri)
        {
            var taskIndex = 0;
            var taskList = UrlHelperExtension.ParallelRequest(new List<string>() { labelsUri, labelCategoriesUri, fieldCategoriesUri, businessProcessesUri, classesUri });
            foreach (var task in taskList)
            {
                switch (taskIndex)
                {
                    case 0:
                        BindAllLabels(task);
                        break;
                    case 1:
                        BindAllCategories(task);
                        break;
                    case 2:
                        BindFieldCategories(task);
                        break;
                    case 3:
                        BindBusinessProcesses(task);
                        break;
                    case 4:
                        BindAllClasses(task);
                        break;
                }
                taskIndex++;
            }
        }

        public void InitialViewBagForEditRole(string modelUri, string roleUri, ModelViewModel model, SessionHelper sessionHelper, List<ModelServerViewModel> modelServers)
        {
            // slave model server will show in compact details mode
            ViewData["ShowFullRoleDetails"] = modelServers.Any(x => x.IsPrimaryType);

            ViewData["ModelUri"] = modelUri;
            ViewData["RoleUri"] = roleUri;
            ViewData["ModelId"] = model.id;
            ViewData["ModelName"] = !string.IsNullOrEmpty(model.short_name) ? model.short_name : model.id;
            ViewData["CommentType"] = string.Format("{0}{1}", model.id, "_ROLES");
            ViewData["DefaultPagesize"] = DefaultPageSize;
            ViewData["MaxPageSize"] = MaxPageSize;
            ViewData["MaxDomainElementsForSearch"] = sessionHelper.SystemSettings.max_domainelements_for_search;
            ViewData["labelCategoriesList"] = allCategoriesList.Data.Where(x => x.used_for_authorization).ToList();
            ViewData["labelsList"] = GetLabelDropdown(allLabelsList);
            ViewData["ModelData"] = model;
            ViewData["FieldsUri"] = model.FieldsUri.ToString();
            ViewData["SupportODataService"] = sessionHelper.Info.ODataService;
            ViewData["ClientSettings"] = sessionHelper.CurrentUser.Settings.client_settings;
        }

        public SystemRoleViewModel LoadRole(string modelUri, string roleUri, ModelViewModel model)
        {
            var role = _modelService.GetRole(modelUri, roleUri, model, allCategoriesList, allLabelsList);
            Session["Role"] = role;
            return role;
        }

        private void MapValueToPrivilegesForModelViewModel(ref SystemRoleViewModel systemRoleViewModel
                                          , List<string> propertySystemRoleViewModelList
                                          , List<string> propertyFormCollectionList
                                          , FormCollection formCollection
                                          , bool? defaultValue)
        {
            int index = 0;
            foreach (var property in propertySystemRoleViewModelList)
            {
                PropertyInfo targetProperty = systemRoleViewModel.ModelPrivilege.Privileges.GetType().GetProperty(property);

                string value = formCollection[propertyFormCollectionList[index]];
                var result = value == null || value == "Undefined" ? defaultValue : value == "True";

                targetProperty.SetValue(systemRoleViewModel.ModelPrivilege.Privileges, result);

                index++;
            }

            // to set Modeling Workbench Configure/Edit Privilege
            systemRoleViewModel.SetModelingWorkbenchContentPrivilege(formCollection["ModelingWorkBenchContent"]);
        }

        private void MapValueToAllowedObjects<T>(string property, string allowedObjects, ref SystemRoleViewModel systemRoleViewModel)
        {
            if (!string.IsNullOrEmpty(allowedObjects))
            {
                PropertyInfo targetProperty = systemRoleViewModel.ModelPrivilege.GetType().GetProperty(property);
                var result = JsonConvert.DeserializeObject<List<T>>(allowedObjects);
                targetProperty.SetValue(systemRoleViewModel.ModelPrivilege, result);
            }
        }

        private void DeleteLabelPrivillage(ref SystemRoleViewModel systemRoleViewModel, List<PrivilegeLabel> labels, string deleteLabelPrivillage)
        {
            if (labels != null)
            {

                var deleteLabelPrivillageList = (deleteLabelPrivillage != null) ?
                                                            JsonConvert.DeserializeObject<List<string>>(deleteLabelPrivillage)
                                                            : new List<string>();

                for (var labelIndex = 0; labelIndex < deleteLabelPrivillageList.Count; labelIndex++)
                {
                    var label = deleteLabelPrivillageList[labelIndex];
                    if (systemRoleViewModel.ModelPrivilege.LabelAuthorizations.ContainsKey(label))
                    {
                        systemRoleViewModel.ModelPrivilege.LabelAuthorizations.Remove(label);
                    }
                }
            }
        }

        private void MapValueToLabelAuthorizations(ref SystemRoleViewModel systemRoleViewModel, List<PrivilegeLabel> labels)
        {
            if (labels != null)
            {
                var labelList = labels.Where(x => x.Name != string.Empty).ToList();

                foreach (var label in labelList)
                {
                    if (!systemRoleViewModel.ModelPrivilege.LabelAuthorizations.ContainsKey(label.Name))
                    {
                        systemRoleViewModel.ModelPrivilege.LabelAuthorizations.Add(label.Name, "view");
                    }

                    CheckLabelForPrivilegeType(systemRoleViewModel, label);
                }
            }
        }

        private void CheckLabelForPrivilegeType(SystemRoleViewModel systemRoleViewModel, PrivilegeLabel label)
        {
            switch (label.Type)
            {
                case PrivilegeType.Assign:
                    systemRoleViewModel.ModelPrivilege.LabelAuthorizations[label.Name] = "assign";
                    break;

                case PrivilegeType.Validate:
                    systemRoleViewModel.ModelPrivilege.LabelAuthorizations[label.Name] = "validate";
                    break;

                case PrivilegeType.View:
                    systemRoleViewModel.ModelPrivilege.LabelAuthorizations[label.Name] = "view";
                    break;

                case PrivilegeType.Manage:
                    systemRoleViewModel.ModelPrivilege.LabelAuthorizations[label.Name] = "manage";
                    break;

                case PrivilegeType.Deny:
                    systemRoleViewModel.ModelPrivilege.LabelAuthorizations[label.Name] = "deny";
                    break;
            }
        }

        private void MapValueToSubRole(ref SystemRoleViewModel systemRoleViewModel, string subRoleIds)
        {
            if (!string.IsNullOrEmpty(subRoleIds))
            {
                systemRoleViewModel.Subrole_ids = JsonConvert.DeserializeObject<List<string>>(subRoleIds);
            }
        }

        private void CheckSessionNeedsUpdate(ref bool session_needs_update, string updateResult)
        {
            dynamic jsonResponse = JsonConvert.DeserializeObject(updateResult);
            session_needs_update = jsonResponse.session_needs_update != null
                ? (bool)jsonResponse.session_needs_update
                : false;
        }

        private void CreateRole(ref string roleUri, string modelUri, SystemRoleViewModel roleModel, VersionViewModel version)
        {
            var model = GetModel(modelUri, true);
            roleModel.ModelPrivilege.model = model.Uri;

            if ((roleModel.Subrole_ids != null) && (roleModel.Subrole_ids[0].Equals("[]")))
            {
                roleModel.Subrole_ids = null;
            }

            roleModel.ModelPrivilege.FieldAuthorizations = new List<FieldAuthorizationViewModel>
                    {
                        new FieldAuthorizationViewModel
                        {
                            FieldAuthorizationClasses = new List<string> {"*"},
                            AllowedFields = new List<string>(),
                            DisallowedFields = new List<string>()
                        }
                    };

            var createdRole = JsonConvert.SerializeObject(roleModel,
                new JsonSerializerSettings { ContractResolver = new CleanUpPropertiesResolver(null) });
            var newRole = _modelService.CreateRole(version.GetEntryByName("system_roles").Uri.ToString(),
                createdRole);

            roleUri = newRole.Uri.ToString();
        }

        private void MapValueToModelPrivilege(ref SystemRoleViewModel systemRoleViewModel
                                                , ref SystemRoleViewModel roleModel
                                                , FormCollection formCollection)
        {
            systemRoleViewModel.ModelPrivilege.DefaultClassAuthorization = roleModel.ModelPrivilege.DefaultClassAuthorization;
            systemRoleViewModel.ModelPrivilege.DefaultLabelAuthorization = roleModel.ModelPrivilege.DefaultLabelAuthorization == "Undefined"
                                                                    ? null
                                                                    : roleModel.ModelPrivilege.DefaultLabelAuthorization;

            int? maxExportRows = formCollection["ModelPrivilege_Privileges_max_export_rows"] == ""
                                   ? 0
                                   : Convert.ToInt32(formCollection["ModelPrivilege_Privileges_max_export_rows"]);
            systemRoleViewModel.ModelPrivilege.Privileges.max_export_rows = (maxExportRows == 0 ? null : maxExportRows);
        }

        private void MapValueToFieldAuthorizations(ref SystemRoleViewModel systemRoleViewModel
                                                , ref SystemRoleViewModel roleModel
                                                , string field_authorizations)
        {
            if (roleModel.ModelPrivilege.FieldAuthorizations != null)
            {
                systemRoleViewModel.ModelPrivilege.FieldAuthorizations = roleModel.ModelPrivilege.FieldAuthorizations;
                systemRoleViewModel.ModelPrivilege.FieldAuthorizations[0].FieldAuthorizationClasses = new List<string>
                        {
                            "*"
                        };

                systemRoleViewModel.ModelPrivilege.FieldAuthorizations.AddRange(
                    JsonConvert.DeserializeObject<List<FieldAuthorizationViewModel>>(field_authorizations));
            }
            else
            {
                roleModel.ModelPrivilege.FieldAuthorizations = new List<FieldAuthorizationViewModel>
                        {
                            new FieldAuthorizationViewModel
                            {
                                FieldAuthorizationClasses = new List<string> {"*"},
                                AllowedFields = new List<string>(),
                                DisallowedFields = new List<string>()
                            }
                        };

                roleModel.ModelPrivilege.FieldAuthorizations.AddRange(
                    JsonConvert.DeserializeObject<List<FieldAuthorizationViewModel>>(field_authorizations));
            }


            systemRoleViewModel.ModelPrivilege.FieldAuthorizations = roleModel.ModelPrivilege.FieldAuthorizations;
        }

        private void UpdateRole(ref string roleUri
            , ref bool session_needs_update
            , string modelUri
            , string privilegeLabels
            , string field_authorizations
            , string allowedObjects
            , string denyObjects
            , string objectFilters
            , string subRoleIds
            , string deleteLabelPrivillage
            , FormCollection formCollection
            , SystemRoleViewModel roleModel)
        {
            var labels = JsonConvert.DeserializeObject<List<PrivilegeLabel>>(privilegeLabels);
            var existingRoleModel = _modelService.GetRole(modelUri, roleModel.Uri.ToString());
            existingRoleModel.CreatedBy = null;
            existingRoleModel.ModelPrivilege.ObjectFilter = null;

            var updatedData = existingRoleModel.DeepClone();
            updatedData.Id = roleModel.Id;
            updatedData.Description = roleModel.Description;

            MapValueToFieldAuthorizations(ref updatedData, ref roleModel, field_authorizations);
            MapValueToModelPrivilege(ref updatedData, ref roleModel, formCollection);

            /*Web Client Tab*/
            bool? defaultValue = null;
            MapValueToPrivilegesForModelViewModel(ref updatedData
                                                    , new List<string>() { "allow_publish_dashboards"
                                                                                        , "create_angles"
                                                                                        , "create_template_angles"
                                                                                        , "save_displays"
                                                                                        , "allow_followups"
                                                                                        , "allow_more_details"
                                                                                        , "allow_export"
                                                                                        , "allow_advanced_filter"
                                                                                        , "allow_single_item_view"
                                                                                        , "manage_private_items"
                                                                                        , "access_data_via_webclient"
                                                                                        , "access_data_via_odata"
                                                                                        , "manage_model"
                                                                                        , "allow_nonvalidated_items"
                                                                                 }
                                                    , new List<string>() { "AllowPublishDashboards"
                                                                                        , "AllowCreateAngles"
                                                                                        , "AllowCreateTemplateAngles"
                                                                                        , "AllowPrivateDisplays"
                                                                                        , "AllowFollowups"
                                                                                        , "AllowMoreDetails"
                                                                                        , "AllowExport"
                                                                                        , "AdvancedFilterSearch"
                                                                                        , "AllowSingleItemView"
                                                                                        , "manage_private_items"
                                                                                        , "AccessDataViaWebclient"
                                                                                        , "AccessDataViaOData"
                                                                                        , "ManageModel"
                                                                                        , "AllowNonvalidatedItems"
                                                                                 }
                                                    , formCollection
                                                    , defaultValue);


            /*Allowed Objects*/
            MapValueToAllowedObjects<string>("AllowedClasses", allowedObjects, ref updatedData);
            MapValueToAllowedObjects<string>("DeniedClasses", denyObjects, ref updatedData);
            MapValueToAllowedObjects<ObjectFilterViewModel>("ObjectFilter", objectFilters, ref updatedData);
            MapValueToSubRole(ref updatedData, subRoleIds);
            DeleteLabelPrivillage(ref updatedData, labels, deleteLabelPrivillage);
            MapValueToLabelAuthorizations(ref updatedData, labels);

            var updatedRole = JsonConvert.SerializeObject(updatedData,
                new JsonSerializerSettings
                {
                    ContractResolver =
                        new CleanUpPropertiesResolver(new List<string>
                                {
                                    "ChangedBy",
                                    "Ids",
                                    "ShortName",
                                    "Index",
                                    "DefaultFilter",
                                    "DefaultReferenceFilter",
                                    "TargetClassShortName",
                                    "FieldShortName",
                                    "AllowedValuesName",
                                    "DisAllowedValuesName"
                                })
                });

            var updateResult = _modelService.SaveRole(modelUri, roleModel.Uri.ToString(), updatedRole);
            roleUri = roleModel.Uri.ToString();

            CheckSessionNeedsUpdate(ref session_needs_update, updateResult);
        }

        private void MapValueToTargetClasses()
        {
            var targetClasses = new List<ClassViewModel>();
            targetClasses.Insert(0,
                new ClassViewModel
                {
                    id = "(self)",
                    short_name = "(Self)",
                    long_name = "(Self)",
                    uri = null,
                    main_businessprocess = null
                });
            targetClasses.Insert(1,
                new ClassViewModel
                {
                    id = "select_object",
                    short_name = "Select object",
                    long_name = "Select object",
                    uri = null,
                    main_businessprocess = null
                });


            ViewBag.TargetClasses = targetClasses.Select(cls => new SelectListItem
            {
                Text = string.IsNullOrEmpty(cls.short_name) ? cls.id : cls.short_name,
                Value = cls.id
            });
        }

        private void MapValueToSourceClasses()
        {
            var sourceClasses = new List<ClassViewModel>();
            sourceClasses.Insert(0,
                new ClassViewModel
                {
                    id = "*",
                    short_name = "All objects",
                    long_name = "All objects",
                    uri = null,
                    main_businessprocess = null
                });
            sourceClasses.Insert(1,
                new ClassViewModel
                {
                    id = "select_object",
                    short_name = "Select object",
                    long_name = "Select object",
                    uri = null,
                    main_businessprocess = null
                });

            ViewBag.SourceClasses = sourceClasses.Select(cls => new SelectListItem
            {
                Text = string.IsNullOrEmpty(cls.short_name) ? cls.id : cls.short_name,
                Value = cls.id
            });
        }

        private void LoadAllClasses(ModelViewModel model)
        {
            if (ViewBag.AllClasses == null)
            {
                var allClasses = Session["AllClasses"] == null
                    ? _modelService.GetClasses(model.ClassesUri + "?" +
                                              UtilitiesHelper.GetOffsetLimitQueryString(1, MaxPageSize))
                        .OrderBy(o => o.id).ToList()
                    : (List<ClassViewModel>)Session["AllClasses"];

                ViewBag.AllClasses = allClasses;
            }
        }

        private List<ObjectFilterViewModel> LoadAllObjectFilter(string modelUri, string roleUri)
        {
            var role = Session["Role"] == null
                   ? _modelService.GetRole(modelUri, roleUri)
                   : (SystemRoleViewModel)Session["Role"];
            return role.ModelPrivilege.ObjectFilter;
        }

        private void LoadObjectFilter(ref List<ObjectFilterViewModel> filters, List<string> fieldIds, ModelViewModel model)
        {
            var allRequiredFields = new FieldViewModel();
            if (fieldIds.Count > 0)
            {
                var fieldUri = string.Format("{0}?ids={1}&{2}", model.FieldsUri, string.Join(",", fieldIds),
                    UtilitiesHelper.GetOffsetLimitQueryString(1, MaxPageSize));

                allRequiredFields = ViewBag.fieldFilter == null
                    ? _modelService.GetModelFields(fieldUri)
                    : (FieldViewModel)ViewBag.fieldFilter;
            }

            for (var index = 0; index < filters.Count; index++)
            {
                SetShortNameToLoadObjectFilter(filters, allRequiredFields, index);
            }
        }

        private void SetShortNameToLoadObjectFilter(List<ObjectFilterViewModel> filters, FieldViewModel allRequiredFields, int index)
        {
            foreach (var filter in filters[index].ReferenceFilter ?? Enumerable.Empty<ReferenceFilterViewModel>())
            {
                SetShortNameByReferenceFilter(allRequiredFields, filter);
            }

            foreach (var filter in filters[index].field_filters ?? Enumerable.Empty<FieldFilterViewModel>())
            {
                SetShortNameByFieldFilters(allRequiredFields, filter);
            }
        }

        private void SetShortNameByFieldFilters(FieldViewModel allRequiredFields, FieldFilterViewModel filter)
        {
            var field = allRequiredFields.fields.FirstOrDefault(o => o.id == filter.field);
            if (field != null && field.fieldtype == "enumerated")
            {
                filter.DomainUri = field.domain.ToString();
            }

            filter.FieldShortName =
                allRequiredFields.fields.Where(o => o.id == filter.field)
                    .Select(v => v.short_name)
                    .FirstOrDefault();
        }

        private void SetShortNameByReferenceFilter(FieldViewModel allRequiredFields, ReferenceFilterViewModel filter)
        {
            foreach (var fieldFilter in filter.field_filters)
            {
                Field field = allRequiredFields.fields.FirstOrDefault(o => o.id == fieldFilter.field);
                FieldCategoryViewModel fieldSource = null;
                string shortName = fieldFilter.field;
                if (field != null)
                {
                    if (field.source != null)
                        fieldSource = _modelService.GetFieldCategory(field.source.ToString());
                    if (field.fieldtype == "enumerated")
                        fieldFilter.DomainUri = field.domain.ToString();
                    shortName = !string.IsNullOrEmpty(field.short_name) ? field.short_name : fieldFilter.field;
                }
                fieldFilter.FieldShortName = fieldSource != null ? string.Format("{0}-{1}", fieldSource.short_name, shortName) : shortName;
            }
        }

        private static void SetDeninedClasses(List<ClassViewModel> availableObjects, SystemRoleViewModel role)
        {
            foreach (var allowedObject in role.ModelPrivilege.DeniedClasses)
            {
                var updatedValue = availableObjects.FirstOrDefault(filter => filter.id == allowedObject);
                if (updatedValue != null)
                    updatedValue.Allowed = false;
            }
        }

        private static void SetAllowedClasses(List<ClassViewModel> availableObjects, SystemRoleViewModel role)
        {
            foreach (var allowedObject in role.ModelPrivilege.AllowedClasses)
            {
                var updatedValue = availableObjects.FirstOrDefault(filter => filter.id == allowedObject);
                if (updatedValue != null)
                    updatedValue.Allowed = true;
            }
        }

        private SystemRoleViewModel LoadRole(string modelUri, string roleUri)
        {
            var role = Session["Role"] == null
                ? _modelService.GetRole(modelUri, roleUri)
                : (SystemRoleViewModel)Session["Role"];
            return role;
        }

        private List<ClassViewModel> LoadAvailableObjectsAllClasses(ModelViewModel model)
        {
            var availableObjects = Session["AllClasses"] == null
                ? _modelService.GetClasses(model.ClassesUri + "?" +
                                          UtilitiesHelper.GetOffsetLimitQueryString(1, MaxPageSize))
                    .OrderBy(o => o.id).ToList()
                : (List<ClassViewModel>)Session["AllClasses"];
            return availableObjects;
        }

        private void LoadModelClasses(SystemRoleViewModel role, List<string> objectClasses)
        {
            objectClasses.AddRange(objectClasses.Union(role.ModelPrivilege.AllowedClasses).Union(role.ModelPrivilege.DeniedClasses).ToList());
        }

        private void LoadModelFieldsFromObjectFilters(ModelViewModel model, SystemRoleViewModel role, List<string> objectClasses, List<string> modelFields, List<string> nonExistingModelFields)
        {
            role.ModelPrivilege.ObjectFilter.ForEach(objectFilter =>
            {
                objectFilter.Classes.ForEach(filterObjectClasses => { objectClasses.Add(filterObjectClasses); });
                if (objectFilter.ReferenceFilter != null)
                {
                    objectFilter.ReferenceFilter.ForEach(referenceFilterClass =>
                    {
                        objectClasses.Add(referenceFilterClass.TargetClass);

                        GetModelFieldsFromFieldFilters(model, referenceFilterClass.field_filters, modelFields, nonExistingModelFields);
                        GetModelFieldsFromFieldFilters(model, referenceFilterClass.fieldvalue_filters, modelFields, nonExistingModelFields);
                    });
                }

                GetModelFieldsFromFieldFilters(model, objectFilter.field_filters, modelFields, nonExistingModelFields);
                GetModelFieldsFromFieldFilters(model, objectFilter.fieldvalue_filters, modelFields, nonExistingModelFields);
            });
        }

        private void GetModelFieldsFromFieldFilters(ModelViewModel model, List<FieldFilterViewModel> filters, List<string> modelFields, List<string> nonExistingModelFields)
        {
            if (filters != null)
            {
                filters.ForEach(fieldFilter =>
                {
                    var modelField =
                        _modelService.GetModelFields(model.FieldsUri.ToString() + "?ids=" + fieldFilter.field);
                    if (modelField.header.total == 1)
                    {
                        modelFields.Add(fieldFilter.field);
                    }
                    else
                    {
                        nonExistingModelFields.Add(fieldFilter.field);
                    }
                });
            }
        }

        private static void MapValueToModelPrivilege(SystemRoleViewModel role, SystemRoleViewModel Newrole, List<string> objectClasses, List<string> modelFields, List<string> existModelClasses)
        {
            var availableClasses = objectClasses.Intersect(existModelClasses).ToList();

            availableClasses.Add("*"); // M4-32346 - needed to be able to copy for "all" classes

            var newObjectFilters = new List<ObjectFilterViewModel>();
            LoadModelPrivilege(role, Newrole, modelFields, availableClasses, newObjectFilters);
        }

        private static void LoadModelPrivilege(SystemRoleViewModel role, SystemRoleViewModel Newrole, List<string> modelFields, List<string> availableClasses, List<ObjectFilterViewModel> newObjectFilters)
        {
            Newrole.ModelPrivilege.AllowedClasses =
                role.ModelPrivilege.AllowedClasses.Intersect(availableClasses).ToList();
            Newrole.ModelPrivilege.DeniedClasses =
                role.ModelPrivilege.DeniedClasses.Intersect(availableClasses).ToList();
            foreach (var x in role.ModelPrivilege.ObjectFilter)
            {
                // ONLY copy object filters of known classes
                if (x.Classes.Intersect(availableClasses).Count() == x.Classes.Count)
                {
                    newObjectFilters.Add(x);
                }
            }

            RemoveInvalidObjectFilters(newObjectFilters, modelFields, availableClasses);

            Newrole.ModelPrivilege.ObjectFilter = newObjectFilters;
        }

        private static void RemoveInvalidObjectFilters(List<ObjectFilterViewModel> newObjectFilters, List<string> modelFields, List<string> availableClasses)
        {
            newObjectFilters.ToList()
                .ForEach(objectFilter =>
                {
                    if (objectFilter.ReferenceFilter != null && objectFilter.ReferenceFilter.Any())
                    {
                        // remove reference filters referencing classes not supported in the target model
                        objectFilter.ReferenceFilter.RemoveAll(refFilter => !availableClasses.Contains(refFilter.TargetClass));

                        foreach (var refFilter in objectFilter.ReferenceFilter.ToList())
                        {
                            RemoveInvalidFieldFilters(refFilter.field_filters, modelFields);
                            RemoveInvalidFieldFilters(refFilter.fieldvalue_filters, modelFields);

                            if ((refFilter.field_filters == null || !refFilter.field_filters.Any())
                                && (refFilter.fieldvalue_filters == null || !refFilter.fieldvalue_filters.Any()))
                            {
                                // remove the reference filter when it no longer have field filters in it
                                objectFilter.ReferenceFilter.Remove(refFilter);
                            }
                        }
                    }

                    RemoveInvalidFieldFilters(objectFilter.field_filters, modelFields);
                    RemoveInvalidFieldFilters(objectFilter.fieldvalue_filters, modelFields);

                    if ((objectFilter.ReferenceFilter == null || !objectFilter.ReferenceFilter.Any())
                        && (objectFilter.field_filters == null || !objectFilter.field_filters.Any())
                        && (objectFilter.fieldvalue_filters == null || !objectFilter.fieldvalue_filters.Any()))
                    {
                        // remove object filter because all the objects in it don't exist in the other mnodel
                        newObjectFilters.Remove(objectFilter);
                    }
                });
        }

        private static void RemoveInvalidFieldFilters(List<FieldFilterViewModel> filters, List<string> modelFields)
        {
            if (filters != null && filters.Any())
            {
                // remove fieldfilter when field is not supported in the other model
                filters.RemoveAll(filterField => !modelFields.Contains(filterField.field));
            }
        }

        private Dictionary<string, string> LoadLabelAuthorizations(ModelViewModel model, SystemRoleViewModel role, SystemRoleViewModel Newrole)
        {
            ///label
            var newLabelsAuthorization = new Dictionary<string, string>();
            var existLabels = _labelService.GetLabels(model.labels.ToString()).Data.Select(d => d.id).ToList();
            if (existLabels.Any())
            {
                existLabels.ForEach(filterLabel =>
                {
                    var label =
                        role.ModelPrivilege.LabelAuthorizations.Where(p => p.Key == filterLabel)
                            .ToDictionary(a => a.Key, a => a.Value);
                    if (label.Any())
                    {
                        newLabelsAuthorization.Add(label.First().Key, label.First().Value);
                    }
                });
            }
            Newrole.ModelPrivilege.LabelAuthorizations = newLabelsAuthorization;
            return newLabelsAuthorization;
        }

        private void CopyRoleModelPrivilegeInformation(ModelViewModel model, SystemRoleViewModel role, SystemRoleViewModel Newrole)
        {
            Newrole.ModelPrivilege.model = model.Uri;
            Newrole.ModelPrivilege.Privileges = role.ModelPrivilege.Privileges;
            Newrole.ModelPrivilege.DefaultClassAuthorization = role.ModelPrivilege.DefaultClassAuthorization;
            Newrole.ModelPrivilege.FieldAuthorizations = role.ModelPrivilege.FieldAuthorizations;
        }

        private SystemRoleViewModel CopyRoleGeneralInformation(string roleName, SystemRoleViewModel role)
        {
            var Newrole = new SystemRoleViewModel
            {
                Id = roleName,
                Description = role.Description,
                Subrole_ids = null,
                SystemPrivileges = role.SystemPrivileges
            };
            return Newrole;
        }

        #endregion
    }
}
