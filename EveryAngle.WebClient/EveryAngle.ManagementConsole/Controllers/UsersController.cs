using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels;
using EveryAngle.Core.ViewModels.BusinessProcesses;
using EveryAngle.Core.ViewModels.Directory;
using EveryAngle.Core.ViewModels.Kendo;
using EveryAngle.Core.ViewModels.Label;
using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Core.ViewModels.SystemCurrencies;
using EveryAngle.Core.ViewModels.SystemLanguages;
using EveryAngle.Core.ViewModels.Users;
using EveryAngle.ManagementConsole.Helpers;
using EveryAngle.ManagementConsole.Models;
using EveryAngle.Shared.Globalization;
using EveryAngle.Shared.Helpers;
using EveryAngle.Utilities;
using EveryAngle.WebClient.Service;
using EveryAngle.WebClient.Service.Security;
using Kendo.Mvc.UI;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace EveryAngle.ManagementConsole.Controllers
{
    public class UsersController : BaseController
    {
        private readonly IGlobalSettingService _globalSettingService;
        private readonly ILabelService _labelService;
        private readonly IModelService _modelService;
        private readonly ISessionService _sessionService;
        private readonly IUserService _userService;

        public UsersController(
            IUserService service,
            IModelService modelService,
            ISessionService sessionService,
            IGlobalSettingService globalSettingService,
            ILabelService labelService,
            SessionHelper sessionHelper)
        {
            _userService = service;
            _modelService = modelService;
            _sessionService = sessionService;
            _globalSettingService = globalSettingService;
            _labelService = labelService;
            SessionHelper = sessionHelper;
        }

        public UsersController(
            IUserService service,
            IModelService modelService,
            ISessionService sessionService,
            IGlobalSettingService globalSettingService,
            ILabelService labelService)
        {
            _userService = service;
            _modelService = modelService;
            _sessionService = sessionService;
            _globalSettingService = globalSettingService;
            _labelService = labelService;
            SessionHelper = SessionHelper.Initialize();
        }

        #region Save User Settings

        public void SaveUserSettingViewMode(string clientSetting)
        {
            string url = SessionHelper.CurrentUser.UserSettings.ToString();
            string saveData = JsonConvert.SerializeObject(new { client_settings = clientSetting });
            _userService.UpdateUserSetting(url, saveData);
            SessionHelper.RefreshUserSettings();
        }

        #endregion

        #region Users page

        #region All users

        public ActionResult GetAllUsers()
        {
            ViewBag.CurrentUser = SessionHelper.CurrentUser.Uri.ToString();
            return PartialView("~/Views/User/AllUsers.cshtml");
        }

        public ActionResult GetFilterUsers(string q = "")
        {
            UserViewModel currentUser = SessionHelper.CurrentUser;
            ViewBag.CurrentUserID = currentUser.Id;
            ViewBag.CurrentUserUri = currentUser.Uri.ToString();
            ViewData["DefaultPageSize"] = DefaultPageSize;
            ViewBag.Query = q;
            return PartialView("~/Views/User/AllUsersGrid.cshtml");
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult ReadUsers([DataSourceRequest] DataSourceRequest request, string q = "")
        {
            ListViewModel<UserViewModel> users = GetUsers(request, request.Page, request.PageSize, q);
            DataSourceResult result = new DataSourceResult
            {
                Data = users.Data,
                Total = users.Header.Total
            };
            return Json(result);
        }

        [AcceptVerbs(HttpVerbs.Get)]
        public JsonResult ReadUsers(string q = "")
        {
            ListViewModel<UserViewModel> users = GetUsers(null, 1, DefaultPageSize, q);
            return Json(users.Data, JsonRequestBehavior.AllowGet);
        }

        public void DeleteUser(string userUri)
        {
            string query = string.Format("{0}?{1}", userUri, "forced=true");
            _userService.DeleteUser(query);
        }

        private ListViewModel<UserViewModel> GetUsers([DataSourceRequest] DataSourceRequest request,
            int page, int pagesize, string q = "")
        {
            VersionViewModel version = SessionHelper.Version;
            string url = version.GetEntryByName("users").UriAsString;
            string offsetLimit = UtilitiesHelper.GetOffsetLimitQueryString(page, pagesize, q);
            string query = string.Format("{0}?{1}", url, offsetLimit);
            query += GetUserQueryString(request);
            return _userService.GetUsers(query);
        }

        private string GetUserQueryString([DataSourceRequest] DataSourceRequest request)
        {
            string query = string.Empty;
            if (request != null && request.Sorts.Count != 0)
            {
                string sortingKey = request.Sorts[0].Member;
                Dictionary<string, string> sorting = new Dictionary<string, string>
                {
                    { "Id", "id" },
                    { "Fullname", "full_name" }
                };

                if (sorting.ContainsKey(sortingKey))
                {
                    string sortDirection = request.Sorts[0].SortDirection == ListSortDirection.Descending ? "desc" : "asc";
                    query += string.Format("&sort={0}&dir={1}", sorting[sortingKey], sortDirection);
                }
            }
            return query;
        }

        #endregion

        #region Import users

        public ActionResult GetSystemProvider()
        {
            List<SystemAuthenticationProviderViewModel> enabledProviders = GetSystemAuthenticationProviders().Where(p => p.IsEnabled).ToList();
            string defaultAuthenticationProvider = SessionHelper.SystemSettings.DefaultAuthenticationProvider;
            dynamic data = new
            {
                default_provider = defaultAuthenticationProvider,
                providers = enabledProviders
            };
            return Json(data, JsonRequestBehavior.AllowGet);
        }

        public ActionResult GetNewUsers(string uri)
        {
            // default roles of user's provider
            SystemAuthenticationProviderViewModel userProvider = GetSystemAuthenticationProviders()
                .FirstOrDefault(w => w.Users.ToString() == uri);
            List<KendoMultiSelect> defaultRoleListView = GetRoleKendoMultiSelectListView(userProvider == null ? null : userProvider.default_roles);

            // all roles
            List<SystemRoleViewModel> systemRoles = GetAllRoles();
            List<AssignedRoleViewModel> assignedRoles = GetAssignedRoleViewModelBy(systemRoles);
            List<KendoMultiSelect> systemRoleListView = GetRoleKendoMultiSelectListView(assignedRoles);

            ViewBag.DefaultRoles = defaultRoleListView;
            ViewBag.SystemRoles = systemRoleListView;
            ViewBag.SystemAuthenticationProviderUri = uri;

            return PartialView("~/Views/User/ImportUsers.cshtml");
        }

        public ActionResult RenderImportUserGrid(string uri)
        {
            ViewBag.SystemAuthenticationProviderUri = uri;
            return PartialView("~/Views/User/ImportUserGrid.cshtml");
        }


        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult ReadAvailableUsers(string uri, string q = "")
        {
            ListViewModel<AuthenticationProviderUserViewModel> users = GetUnableUsers(uri, q);
            UsersDataSourceResult result = new UsersDataSourceResult
            {
                Data = users.Data.ToList(),
                Total = users.Header.Total,
                TotalTruncated = users.Header.Total_is_truncated_by_size_limit
            };
            return Json(result);
        }

        [AcceptVerbs(HttpVerbs.Put)]
        public void AddUser(string userUri, string rolesData)
        {
            // set enable to model
            AuthenticationProviderUserViewModel enableUser = _userService.GetUserAuthentication(userUri);
            enableUser.IsEnabled = true;

            // enable a user
            string updateResult = _userService.UpdateUser(enableUser.Uri.ToString(), JsonConvert.SerializeObject(enableUser));
            AuthenticationProviderUserViewModel result = JsonConvert.DeserializeObject<AuthenticationProviderUserViewModel>(updateResult);
            try
            {
                // assign roles
                _userService.UpdateUserRole(result.User.ToString(), JsonConvert.SerializeObject(new
                {
                    assigned_roles = JsonConvert.DeserializeObject<List<AssignedRoleViewModel>>(rolesData)
                }));
            }
            catch (HttpException ex)
            {
                throw new HttpException(ex.GetHttpCode(), JsonConvert.SerializeObject(new
                {
                    reason = ((HttpStatusCode)ex.GetHttpCode()).ToString(),
                    message = Resource.MC_ImportUsersFailAddRoles
                }));
            }
        }

        private IEnumerable<SystemAuthenticationProviderViewModel> GetSystemAuthenticationProviders()
        {
            string url = SessionHelper.Version.GetEntryByName("authentication_providers").Uri.ToString();
            return _userService.GetSystemAuthenticationProviders(url);
        }

        private List<AssignedRoleViewModel> GetAssignedRoleViewModelBy(List<SystemRoleViewModel> systemRoleViewModel)
        {
            List<AssignedRoleViewModel> assignedRoleViewModels = new List<AssignedRoleViewModel>();
            if (systemRoleViewModel == null)
                return assignedRoleViewModels;

            foreach (SystemRoleViewModel systemRole in systemRoleViewModel)
            {
                AssignedRoleViewModel assignedRole = new AssignedRoleViewModel { RoleId = systemRole.Id };

                if (systemRole.ModelPrivilege.model != null)
                {
                    //model uri
                    string modelUrl = systemRole.ModelPrivilege.model.ToString();
                    // load model from the session
                    assignedRole.ModelId = SessionHelper.GetModelFromSession(modelUrl).id;
                }
                assignedRoleViewModels.Add(assignedRole);
            }
            return assignedRoleViewModels;
        }

        private List<KendoMultiSelect> GetRoleKendoMultiSelectListView(List<AssignedRoleViewModel> roles)
        {
            var models = new List<KendoMultiSelect>();

            if (roles == null)
                return models;

            return roles.Select(r => new KendoMultiSelect
            {
                Text = r.RoleId,
                Value = string.IsNullOrEmpty(r.ModelId) ? r.RoleId : string.Format("{0}:{1}", r.ModelId, r.RoleId),
                Tooltip = string.IsNullOrEmpty(r.ModelId) ? "System role" : r.ModelId + " model role"
            })
            .ToList();
        }

        private List<SystemRoleViewModel> GetAssignSystemRoleViewModelBy(List<SystemRoleViewModel> systemRoleViewModels, List<AssignedRoleViewModel> assignedRoleViewModels)
        {
            List<SystemRoleViewModel> assignSystemRoleViewModels = new List<SystemRoleViewModel>();
            if (assignedRoleViewModels == null || systemRoleViewModels == null)
                return assignSystemRoleViewModels;

            foreach (SystemRoleViewModel systemRoleViewModel in systemRoleViewModels)
            {
                foreach (AssignedRoleViewModel assignedRoleViewModel in assignedRoleViewModels)
                {
                    if (systemRoleViewModel.Id == assignedRoleViewModel.RoleId)
                    {
                        // system role
                        if (systemRoleViewModel.ModelPrivilege.model == null)
                        {
                            assignSystemRoleViewModels.Add(systemRoleViewModel);
                            break;
                        }

                        // model role
                        string modelUrl = systemRoleViewModel.ModelPrivilege.model.ToString();
                        ModelViewModel model = SessionHelper.GetModelFromSession(modelUrl);
                        if (model.id == assignedRoleViewModel.ModelId)
                        {
                            assignSystemRoleViewModels.Add(systemRoleViewModel);
                            break;
                        }
                    }
                }
            }

            return assignSystemRoleViewModels;
        }

        private ListViewModel<AuthenticationProviderUserViewModel> GetUnableUsers(string uri, string q = "")
        {
            string userUrl = uri;
            if (!string.IsNullOrEmpty(q))
                userUrl += "?q=" + q;

            return _userService.GetUnableUsers(userUrl);
        }

        private List<SystemRoleViewModel> GetAllRoles()
        {
            List<SystemRoleViewModel> systemRoles = new List<SystemRoleViewModel>();
            Entry systemRoleEntry = SessionHelper.Version.GetEntryByName("system_roles");
            if (systemRoleEntry != null)
            {
                string systemRoleUrl = string.Format("{0}?{1}", systemRoleEntry.Uri, OffsetLimitQuery);
                systemRoles = _modelService.GetSystemRoles(systemRoleUrl);
            }
            return systemRoles;
        }

        #endregion

        #region Mass change users

        public ActionResult GetRolesID()
        {
            List<SystemRoleViewModel> systemRoles = GetAllRoles();
            List<AssignedRoleViewModel> assignedRoles = GetAssignedRoleViewModelBy(systemRoles);
            List<KendoMultiSelect> systemRoleListView = GetRoleKendoMultiSelectListView(assignedRoles);

            return Json(systemRoleListView, JsonRequestBehavior.AllowGet);
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public void SaveMassChangeUser(string userUri, string assignRoleData)
        {
            _userService.UpdateUser(userUri, assignRoleData);
        }

        #endregion

        #region Edit user

        public ActionResult EditUser(string userUri)
        {
            VersionViewModel version = SessionHelper.Version;
            List<SystemRoleViewModel> systemRoles = GetFullSystemRoles();
            IEnumerable<SystemAuthenticationProviderViewModel> providers = GetSystemAuthenticationProviders();
            List<LabelViewModel> businessProcesses = _labelService.GetLabels(version.GetEntryByName("business_processes").Uri.ToString()).Data;

            // load user info.
            UserViewModel user = _userService.GetUser(userUri);

            // set default BPs
            UserSettingsViewModel userSettings = _userService.GetUserSetting(user.UserSettings.ToString());
            user.default_business_processes = userSettings.default_business_processes;

            // set user provider
            SystemAuthenticationProviderViewModel provider = providers.FirstOrDefault(x => x.Uri == user.AuthenticationProvider);
            if (provider != null)
                user.UserProvider = provider.Id;

            // get roles
            List<SystemRoleViewModel> userAssignRoles = GetAssignSystemRoleViewModelBy(systemRoles, user.AssignedRoles);

            ViewBag.UserUri = userUri;
            ViewData["AssignedRoles"] = userAssignRoles;
            ViewData["AvailableRoles"] = systemRoles.Except(userAssignRoles).ToList();
            ViewData["AuthenticationProvidersList"] = providers.Select(p => p.Id).ToList();
            ViewData["BusinessProcesses"] = JsonConvert.SerializeObject(businessProcesses);
            ViewBag.CommentType = "All_Users";

            return PartialView("~/Views/User/EditUser.cshtml", user);
        }

        public ActionResult GetAvailableRoleTable(List<SystemRoleViewModel> availableRoles)
        {
            return PartialView("~/Views/User/AvailableRoleTable.cshtml", availableRoles);
        }

        public ActionResult AssignedRolesGrid(string userUri, List<SystemRoleViewModel> assignedRoles)
        {
            ViewBag.UserUri = userUri;
            return PartialView("~/Views/User/AssignedRolesGrid.cshtml", assignedRoles);
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult SaveEditUser(string rolesData, string userData, string userUri)
        {
            UserViewModel user = JsonConvert.DeserializeObject<UserViewModel>(userData);
            UserViewModel existingUser = _userService.GetUser(userUri);
            UserViewModel updatedData = (UserViewModel)existingUser.Clone();

            updatedData.Enabled = user.Enabled;
            updatedData.EnabledUntil = user.EnabledUntil;

            // set roles to a user
            if (!string.IsNullOrEmpty(rolesData))
            {
                string roles = JObject.Parse(rolesData).SelectToken("assigned_roles").ToString();
                updatedData.AssignedRoles = JsonConvert.DeserializeObject<List<AssignedRoleViewModel>>(roles);
            }

            // update "default_business_processes" to user settings
            string userSettingsUrl = existingUser.UserSettings.ToString();
            _userService.UpdateUserSetting(userSettingsUrl, JsonConvert.SerializeObject(new
            {
                default_business_processes = user.default_business_processes
            }));

            // save
            List<string> removeProperties = new List<string>
            {
                "last_logon",
                "ModelPrivileges",
                "default_business_processes",
                "AuthenticationProviderName",
                "AuthenticatedUsers",
                "UserProvider",
                "RegisteredOn",
                "Settings"
            };
            string data = JsonConvert.SerializeObject(updatedData, new JsonSerializerSettings
            {
                ContractResolver = new CleanUpPropertiesResolver(removeProperties)
            });
            string query = string.Format("{0}?{1}", userUri, "forced=true");
            string updateResult = _userService.UpdateUser(query, data);

            // check session_needs_update from response
            dynamic jsonResponse = JsonConvert.DeserializeObject(updateResult);
            bool sessionNeedsUpdate = bool.Equals((bool?)jsonResponse.session_needs_update, true);

            return JsonHelper.GetJsonResult(true, null, null, null, MessageType.SUCCESS_UPDATED, sessionNeedsUpdate);
        }

        private List<SystemRoleViewModel> GetFullSystemRoles()
        {
            List<ModelViewModel> models = SessionHelper.Models;
            List<SystemRoleViewModel> systemRoles = GetAllRoles();

            // set more info.
            foreach (SystemRoleViewModel systemRole in systemRoles)
            {
                if (systemRole.ModelPrivilege != null && systemRole.ModelPrivilege.model != null)
                {
                    // model roles
                    string modelUri = systemRole.ModelPrivilege.model.ToString();
                    ModelViewModel model = models.FirstOrDefault(m => m.Uri.ToString() == modelUri);
                    if (model != null)
                    {
                        systemRole.ModelId = model.id;
                        systemRole.ModelRole = model.short_name ?? model.id;
                    }
                    else
                    {
                        systemRole.ModelRole = string.Format("No privilege for model: {0}", modelUri);
                    }
                }
                else
                {
                    // system roles
                    systemRole.ModelRole = "No Data";
                }
            }
            return systemRoles;
        }

        #endregion

        #region User consolidated

        public ActionResult GetUserConsolidate(string userUri)
        {
            var userPrivilegesList = new Dictionary<string, List<TreeViewItemModel>>();
            var user = _userService.GetUser(userUri);
            if (user.SystemPrivileges != null)
            {
                var systemPrivilegesData = new List<TreeViewItemModel>();
                var data = JsonConvert.SerializeObject(user.SystemPrivileges);

                var node = JToken.Parse(data);

                systemPrivilegesData = WalkNode<ConsolidatedRoleViewModel>(node, systemPrivilegesData, n =>
                {
                    var token = (JToken)n;
                    if (token != null && token.Type == JTokenType.String)
                    {
                        var treeview = new TreeViewItemModel();
                        treeview.Text = "";
                    }
                });
                userPrivilegesList.Add("System privileges", systemPrivilegesData);
            }

            var modelPrivilegesList = _userService.GetUserModelPrivilege(user.ModelPrivilegesUri.ToString());
            foreach (var item in modelPrivilegesList)
            {
                var modelPrivilegesData = new List<TreeViewItemModel>();
                var modelAuthorizations = _userService.GetModelAuthorizations(item.authorizationsUri.ToString());
                
                SetShortNameToConsolidateRoles(modelAuthorizations);
                modelAuthorizations = ConsolidateRoleHelper.SortModelAuthorizations(modelAuthorizations);

                if (modelAuthorizations != null)
                {
                    var data = JsonConvert.SerializeObject(modelAuthorizations);

                    var node = JToken.Parse(data);

                    modelPrivilegesData = WalkNode<ModelAuthorizationsViewModel>(node, modelPrivilegesData, n =>
                    {
                        var token = (JToken)n;
                        if (token != null && token.Type == JTokenType.String)
                        {
                            var treeview = new TreeViewItemModel();
                            treeview.Text = "";
                        }
                    });
                    userPrivilegesList.Add(modelAuthorizations.model_id, modelPrivilegesData);
                }
            }

            return PartialView("~/Views/User/UserConsolidatedRole.cshtml", userPrivilegesList);
        }

        private List<TreeViewItemModel> WalkNode<T>(JToken node, List<TreeViewItemModel> flatObjects,
            Action<object> action)
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
                        if (child.Value.ToString() != "" && child.Name != "model" && child.Name != "ModelName" &&
                            child.Name != "authorizations" && child.Name != "AllowedValuesName" &&
                            child.Name != "DisAllowedValuesName" && child.Name != "AllFields" &&
                            child.Name != "AllFilters" && child.Name != "Ids" && child.Name != "Index")
                        {
                            if (child.Value.Type != JTokenType.Object && child.Value.Type != JTokenType.Array)
                            {
                                var value = ConsolidateRoleHelper.ChangePriviledgeState(child.Value.ToString(), node,
                                    child);
                                recursiveObjects.Add(new TreeViewItemModel
                                {
                                    Text =
                                        string.Format("{0}: <i class=\"{2}\">{1}</i>",
                                            JsonResourceHandler.GetResource<T>(child.Name), value, value.ToLower()),
                                    Items = WalkNode<T>(child.Value, flatObjects, action)
                                });
                            }
                            else if (child.Value.Type == JTokenType.Array)
                            {
                                recursiveObjects.Add(new TreeViewItemModel
                                {
                                    Text = JsonResourceHandler.GetResource<T>(child.Name),
                                    Items = WalkNode<T>(child.Value, flatObjects, action)
                                });
                            }
                            else
                            {
                                recursiveObjects.Add(new TreeViewItemModel
                                {
                                    Text = JsonResourceHandler.GetResource<T>(child.Name),
                                    Items = WalkNode<T>(child.Value, flatObjects, action)
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
                        if (token.Children<JProperty>().Count() > 0)
                        {
                            var allProperties = token.Children<JProperty>();

                            if (node.Path == "modelserver_authorization.field_authorizations" || node.Path == "modelserver_authorization.object_filters")
                                allProperties = ConsolidateRoleHelper.CreateClassProperty(token, node);

                            foreach (var child in allProperties)
                            {
                                if (child.Value.ToString() != "" && child.Name != "model" && child.Name != "ModelName" &&
                                    child.Name != "authorizations" && child.Name != "AllowedValuesName" &&
                                    child.Name != "DisAllowedValuesName" && child.Name != "AllFields" &&
                                    child.Name != "AllFilters" && child.Name != "Ids" && child.Name != "Index")
                                {
                                    if (child.Value.Type != JTokenType.Object && child.Value.Type != JTokenType.Array)
                                    {
                                        var value = ConsolidateRoleHelper.ChangePriviledgeState(child.Value.ToString(),
                                            node, child);
                                        recursiveObjects.Add(new TreeViewItemModel
                                        {
                                            Text =
                                                string.Format("{0}: <i class=\"{2}\">{1}</i>",
                                                    JsonResourceHandler.GetResource<T>(child.Name), value,
                                                    value.ToLower()),
                                            Items = WalkNode<T>(child.Value, flatObjects, action)
                                        });
                                    }
                                    else if (child.Value.Type == JTokenType.Array)
                                    {
                                        recursiveObjects.Add(new TreeViewItemModel
                                        {
                                            Text = JsonResourceHandler.GetResource<T>(child.Name),
                                            Items = WalkNode<T>(child.Value, flatObjects, action)
                                        });
                                    }
                                    else
                                    {
                                        recursiveObjects.Add(new TreeViewItemModel
                                        {
                                            Text = JsonResourceHandler.GetResource<T>(child.Name),
                                            Items = WalkNode<T>(child.Value, flatObjects, action)
                                        });
                                    }
                                }
                            }
                        }
                        else
                        {
                            if (token.Type == JTokenType.String)
                            {
                                if (!string.IsNullOrEmpty(token.ToString()))
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
            }
            return recursiveObjects;
        }

        private void SetShortNameToConsolidateRoles(ModelAuthorizationsViewModel consolidatedRole)
        {
            if (consolidatedRole != null && consolidatedRole.modelserver_authorization != null)
            {
                var model = SessionHelper.GetModel(consolidatedRole.model.ToString());

                //set short name to allowed class
                var requestClasses = new List<string>();
                requestClasses.AddRange(consolidatedRole.modelserver_authorization.allowed_classes);
                if (requestClasses.Count > 0)
                {
                    var availableClasses = ParallelRequestHelper.GetObjectListByIds(model, requestClasses);

                    for (var i = 0; i < consolidatedRole.modelserver_authorization.allowed_classes.Count; i++)
                    {
                        var currentClass =
                            availableClasses.Where(
                                f => f.id == consolidatedRole.modelserver_authorization.allowed_classes[i])
                                .FirstOrDefault();
                        consolidatedRole.modelserver_authorization.allowed_classes[i] = currentClass != null &&
                                                                                        !string.IsNullOrEmpty(
                                                                                            currentClass.short_name)
                            ? currentClass.short_name
                            : consolidatedRole.modelserver_authorization.allowed_classes[i];
                    }
                }

                //set short name to Object Fileter Class
                var objectFilterClasses = new List<string>();
                var objectFilterList = consolidatedRole.modelserver_authorization.ObjectFilter;

                if (objectFilterList != null)
                {
                    foreach (var objectFilter in objectFilterList)
                    {
                        objectFilterClasses.AddRange(objectFilter.Classes);
                    }
                }

                if (objectFilterClasses.Count > 0)
                {
                    var availableClassesInObjectFilter = ParallelRequestHelper.GetObjectListByIds(model, objectFilterClasses);

                    for (var i = 0; i < objectFilterList.Count; i++)
                    {
                        for (var j = 0; j < objectFilterList[i].Classes.Count; j++)
                        {
                            var currentClass =
                                availableClassesInObjectFilter.Where(f => f.id == objectFilterList[i].Classes[j])
                                    .FirstOrDefault();
                            objectFilterList[i].Classes[j] = currentClass != null &&
                                                             !string.IsNullOrEmpty(currentClass.short_name)
                                ? currentClass.short_name
                                : objectFilterList[i].Classes[j];
                        }
                    }
                }

                //set short name to Object Fileter Field
                var fieldFilterClasses = new List<string>();
                if (objectFilterList != null)
                {
                    foreach (var objectFilter in objectFilterList)
                    {
                        if (objectFilter.fieldvalue_filters != null)
                        {
                            foreach (var fieldFilter in objectFilter.fieldvalue_filters)
                            {
                                fieldFilterClasses.Add(fieldFilter.field);
                            }
                        }
                    }
                }
                if (fieldFilterClasses.Count > 0)
                {
                    var availableFields = ParallelRequestHelper.GetFieldListByIds(model, fieldFilterClasses);
                    var fieldSource = availableFields.Select(x => x.source.ToString()).Distinct().ToList();
                    var availableFieldsSource = ParallelRequestHelper.GetFieldCategoriesByUri(fieldSource);

                    for (var i = 0; i < objectFilterList.Count; i++)
                    {
                        if (objectFilterList[i].fieldvalue_filters != null)
                        {
                            for (var j = 0; j < objectFilterList[i].fieldvalue_filters.Count; j++)
                            {
                                objectFilterList[i].fieldvalue_filters[j].field = ConsolidateRoleHelper.GetFieldNameWithFieldSource(availableFields, objectFilterList[i].fieldvalue_filters[j].field, availableFieldsSource);
                            }
                        }
                    }
                }

                //set short name to Field Authorizations Class
                var fieldClasses = new List<string>();
                var fieldList = consolidatedRole.modelserver_authorization.FieldAuthorizations;
                if (fieldList != null)
                {
                    foreach (var objectFilter in fieldList)
                    {
                        fieldClasses.AddRange(objectFilter.FieldAuthorizationClasses);
                    }
                }
                if (fieldClasses.Count > 0)
                {
                    var availableClassesInField = ParallelRequestHelper.GetObjectListByIds(model, fieldClasses);

                    for (var i = 0; i < fieldList.Count; i++)
                    {
                        for (var j = 0; j < fieldList[i].FieldAuthorizationClasses.Count; j++)
                        {
                            var currentClass =
                                availableClassesInField.Where(f => f.id == fieldList[i].FieldAuthorizationClasses[j])
                                    .FirstOrDefault();
                            fieldList[i].FieldAuthorizationClasses[j] = currentClass != null &&
                                                                        !string.IsNullOrEmpty(currentClass.short_name)
                                ? currentClass.short_name
                                : fieldList[i].FieldAuthorizationClasses[j];
                        }
                    }
                }

                //set short name to Field Authorizations Field
                var fieldAuthorizations = new List<string>();
                foreach (var field in fieldList)
                {
                    foreach (var fieldFilter in field.AllowedFields)
                    {
                        fieldAuthorizations.Add(fieldFilter);
                    }
                    foreach (var fieldFilter in field.DisallowedFields)
                    {
                        fieldAuthorizations.Add(fieldFilter);
                    }
                }

                if (fieldAuthorizations.Count > 0)
                {
                    var availableAllowedFields = ParallelRequestHelper.GetFieldListByIds(model, fieldAuthorizations);
                    var fieldSource = availableAllowedFields.Where(x => x.source != null).Select(x => x.source.ToString()).Distinct().ToList();

                    var availableFieldsSource = ParallelRequestHelper.GetFieldCategoriesByUri(fieldSource);

                    for (var i = 0; i < fieldList.Count; i++)
                    {
                        for (var j = 0; j < fieldList[i].AllowedFields.Count; j++)
                        {
                            fieldList[i].AllowedFields[j] = ConsolidateRoleHelper.GetFieldNameWithFieldSource(availableAllowedFields, fieldList[i].AllowedFields[j], availableFieldsSource);
                        }

                        for (var j = 0; j < fieldList[i].DisallowedFields.Count; j++)
                        {
                            fieldList[i].DisallowedFields[j] = ConsolidateRoleHelper.GetFieldNameWithFieldSource(availableAllowedFields, fieldList[i].DisallowedFields[j], availableFieldsSource);
                        }
                    }
                }
            }
        }

        #endregion

        #endregion

        #region Sessions page

        public ActionResult GetAllSessions()
        {
            ViewBag.CurrentUserUri = SessionHelper.CurrentUser.Uri.ToString();
            return PartialView("~/Views/User/Sessions/AllSessions.cshtml");
        }

        public ActionResult GetFilterSessions(string q = "")
        {
            ViewData["DefaultPageSize"] = DefaultPageSize;
            ViewBag.Query = q;
            return PartialView("~/Views/User/Sessions/AllSessionsGrid.cshtml");
        }

        public ActionResult ReadSessions([DataSourceRequest] DataSourceRequest request, string q = "")
        {
            ListViewModel<SessionViewModel> sessions = GetSessions(request, q);
            DataSourceResult result = new DataSourceResult
            {
                Data = sessions.Data,
                Total = sessions.Header.Total
            };
            return Json(result, JsonRequestBehavior.AllowGet);
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult GetUsersByUri(string usersUrl)
        {
            List<UserViewModel> users = new List<UserViewModel>();
            List<string> usersUriList = usersUrl.Split(',').ToList();
            UrlHelperExtension.ParallelRequest(usersUriList, true).ForEach(delegate (Task<JObject> task)
            {
                if (task.Status != TaskStatus.Faulted)
                {
                    UserViewModel user = JsonConvert.DeserializeObject<UserViewModel>(task.Result.ToString(), new UnixDateTimeConverter());
                    users.Add(user);
                }
            });
            return Json(users, JsonRequestBehavior.AllowGet);
        }

        [AcceptVerbs(HttpVerbs.Delete)]
        public void DeleteSession(string sessionUri)
        {
            _userService.DeleteSession(sessionUri);
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public void UpdateDebugLogging(string sessionUri, bool isDebugLogging)
        {
            _userService.UpdateDebugLogging(sessionUri, isDebugLogging);
        }

        private ListViewModel<SessionViewModel> GetSessions([DataSourceRequest] DataSourceRequest request, string q)
        {
            VersionViewModel version = SessionHelper.Version;
            SessionViewModel currentSession = SessionHelper.Session;
            string currentUserId = SessionHelper.CurrentUser.Id;

            string offsetLimitQuery = UtilitiesHelper.GetOffsetLimitQueryString(request.Page, request.PageSize, q);
            string sessionsUrl = string.Format("{0}?{1}", version.GetEntryByName("sessions").Uri, offsetLimitQuery);
            sessionsUrl += PageHelper.GetQueryString(request, QueryString.Users);

            ListViewModel<SessionViewModel> model = _sessionService.GetSessions(sessionsUrl);
            foreach (SessionViewModel session in model.Data)
            {
                session.IsCurrentLogedInSession = currentSession.Id == session.Id;
                session.UserID = currentSession.UserUri == session.UserUri ? currentUserId : "...";
            }
            return model;
        }

        #endregion

        #region Default user settings page

        public ActionResult GetUserDefaultSetting()
        {
            VersionViewModel version = SessionHelper.Version;
            UserSettingsViewModel userDefaults = _userService.GetUserSetting(version.GetEntryByName("default_user_settings").Uri.ToString());
            if (string.IsNullOrEmpty(userDefaults.format_locale))
            {
                userDefaults.format_locale = "en";
            }
            userDefaults.LoadClientSettings();

            // Numberformat
            FormatViewModel defaultNumberFormat = new FormatViewModel
            {
                decimals = 0,
                prefix = "",
                thousandseparator = false
            };
            userDefaults.format_numbers_model = JsonConvert.DeserializeObject<FormatViewModel>(userDefaults.format_numbers ?? string.Empty) ?? defaultNumberFormat;
            userDefaults.format_currencies_model = JsonConvert.DeserializeObject<FormatViewModel>(userDefaults.format_currencies ?? string.Empty) ?? defaultNumberFormat;
            userDefaults.format_percentages_model = JsonConvert.DeserializeObject<FormatViewModel>(userDefaults.format_percentages ?? string.Empty) ?? defaultNumberFormat;

            // DateFormat
            FormatDateViewModel defaultDateFormat = new FormatDateViewModel
            {
                date_order = "MDY",
                date_day = "dd",
                date_month = "MMM",
                date_year = "yyyy",
                date_separator = "/"
            };
            userDefaults.format_date_model = JsonConvert.DeserializeObject<FormatDateViewModel>(userDefaults.format_date ?? string.Empty) ?? defaultDateFormat;

            // TimeFormat
            FormatTimeViewModel defaultTimeFormat = new FormatTimeViewModel
            {
                hour = "HHmm",
                separator = ":"
            };
            userDefaults.format_time_model = JsonConvert.DeserializeObject<FormatTimeViewModel>(userDefaults.format_time ?? string.Empty) ?? defaultTimeFormat;

            // SystemLanguages
            string systemLanguagesUri = string.Format("{0}?enabled=true&{1}", version.GetEntryByName("system_languages").Uri, OffsetLimitQuery);
            ListViewModel<SystemLanguageViewModel> systemLanguagesModel = _globalSettingService.GetSystemLanguages(systemLanguagesUri);
            ViewData["Languages"] = systemLanguagesModel.Data.OrderBy(x => x.Name).ToList();

            // BusinessProcesses
            string businessProcessUri = string.Format("{0}?{1}", version.GetEntryByName("business_processes").Uri, OffsetLimitQuery);
            List<BusinessProcessViewModel> businessProcesses = _globalSettingService.GetBusinessProcesses(businessProcessUri);
            ViewData["BusinessProcesses"] = businessProcesses;

            // SystemCurrencies
            string systemCurrencyUri = version.GetEntryByName("system_currencies").Uri.ToString();
            List<CurrenciesViewModel> systemCurrencies = _globalSettingService.GetSystemCurrencies(systemCurrencyUri)
                                                        .Where(currency => currency.enabled)
                                                        .ToList();
            ViewData["DefaultCurrency"] = systemCurrencies;

            // use the first currency if invalid default_currency
            if (systemCurrencies.Count != 0
                && !systemCurrencies.Exists(currency => currency.id == userDefaults.default_currency))
            {
                userDefaults.default_currency = systemCurrencies[0].id;
            }

            return PartialView("~/Views/User/UserDefaults/UserDefaultsSetting.cshtml", userDefaults);
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult SaveUserDefaultsSettings(string userDefaultsSettingsData)
        {
            VersionViewModel version = SessionHelper.Version;
            string defaultUserSettingsUri = version.GetEntryByName("default_user_settings").Uri.ToString();
            UserSettingsViewModel userDefaults = JsonConvert.DeserializeObject<UserSettingsViewModel>(userDefaultsSettingsData);
            UserSettingsViewModel existUserDefaults = _userService.GetUserSetting(defaultUserSettingsUri);
            UserSettingsViewModel updateduserDefaults = (UserSettingsViewModel)existUserDefaults.Clone();

            updateduserDefaults.default_language = userDefaults.default_language;
            updateduserDefaults.default_currency = userDefaults.default_currency;
            updateduserDefaults.format_numbers = userDefaults.format_numbers;
            updateduserDefaults.format_currencies = userDefaults.format_currencies;
            updateduserDefaults.format_percentages = userDefaults.format_percentages;
            updateduserDefaults.default_export_lines = userDefaults.default_export_lines;
            updateduserDefaults.sap_fields_in_chooser = userDefaults.sap_fields_in_chooser;
            updateduserDefaults.sap_fields_in_header = userDefaults.sap_fields_in_header;
            updateduserDefaults.compressed_list_header = userDefaults.compressed_list_header;
            updateduserDefaults.default_business_processes = userDefaults.default_business_processes;
            updateduserDefaults.auto_execute_items_on_login = userDefaults.auto_execute_items_on_login;
            updateduserDefaults.format_enum = userDefaults.format_enum;
            updateduserDefaults.format_date = userDefaults.format_date;
            updateduserDefaults.format_time = userDefaults.format_time;
            updateduserDefaults.format_locale = userDefaults.format_locale;
            updateduserDefaults.default_Starred_Fields = userDefaults.default_Starred_Fields;
            updateduserDefaults.default_Suggested_Fields = userDefaults.default_Suggested_Fields;
            updateduserDefaults.hide_other_users_private_display = userDefaults.hide_other_users_private_display;

            string clientSettingsTemplate = "{{\"default_Starred_Fields\":{0},\"default_Suggested_Fields\":{1},\"general_decimal_seperator\":\"{2}\",\"general_thousand_seperator\":\"{3}\"}}";
            updateduserDefaults.client_settings = string.Format(clientSettingsTemplate,
                                                    userDefaults.default_Starred_Fields.ToString().ToLower(),
                                                    userDefaults.default_Suggested_Fields.ToString().ToLower(),
                                                    userDefaults.general_decimal_seperator,
                                                    userDefaults.general_thousand_seperator);

            string data = JsonConvert.SerializeObject(updateduserDefaults, new JsonSerializerSettings
            {
                ContractResolver = new UpdatedPropertiesResolver<UserSettingsViewModel>(updateduserDefaults, existUserDefaults)
            });
            _userService.UpdateUserSetting(defaultUserSettingsUri, data);
            return JsonHelper.GetJsonResult(true, null, null, null, MessageType.SUCCESS_UPDATED);
        }

        #endregion
    }
}
