using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Core.ViewModels.ModelServer;
using EveryAngle.Core.ViewModels.SystemLog;
using EveryAngle.Core.ViewModels.Users;
using EveryAngle.ManagementConsole.Helpers;
using EveryAngle.Shared.Globalization;
using EveryAngle.WebClient.Domain.Enums;
using EveryAngle.WebClient.Service.Security;
using System;
using System.Collections.Generic;
using System.Linq;

namespace EveryAngle.ManagementConsole.Models
{
    public class SiteMapModel
    {
        #region constant

        private const string MODEL_EA4IT = "EA4IT";

        #endregion

        #region private variables

        private readonly SessionHelper _sessionHelper;
        private readonly IModelService _modelService;
        private List<SiteMap> _siteMaps = new List<SiteMap>();

        #endregion

        public SiteMapModel(SessionHelper sessionHelper, IModelService modelService)
        {
            _sessionHelper = sessionHelper;
            _modelService = modelService;
        }

        public class SiteMap
        {
            public string Id { get; set; }
            public string Color { get; set; }
            public string Name { get; set; }
            public string Uri { get; set; }
            public string HashPath { get; set; }
            public object Parameters { get; set; }
            public List<SiteMap> Childs { get; set; }
            public bool IsText { get; set; }

            private bool? visible = true;
            public bool? Visible
            {
                get { return visible ?? true; }
                set { visible = value; }
            }

            private bool? childsVisible = true;
            public bool? ChildsVisible
            {
                get { return childsVisible ?? true; }
                set { childsVisible = value; }
            }
        }

        /// <summary>
        /// Create sitemaps
        /// - Overview
        /// - GlobalSettings
        /// - Models
        /// - Users
        /// - AutomatedTasks
        /// </summary>
        public void CreateSiteMap()
        {
            SessionViewModel currentSession = _sessionHelper.Session;
            bool canAccessSystem = currentSession.IsValidToManagementAccess();
            bool canScheduleAngles = currentSession.IsValidToScheduleAngles();
            bool canUseOnlyAutomationTask = !canAccessSystem && canScheduleAngles;
            bool isSupportAutomateTask = _sessionHelper.Info.AngleAutomation;

            if (!canUseOnlyAutomationTask)
            {
                // Overview
                _siteMaps.Add(GetOverviewMenu());

                // GlobalSettings
                _siteMaps.Add(GetGlobalSettingMenu());

                // Models
                _siteMaps.Add(GetModelsMenu(_sessionHelper.Models));

                // Users
                _siteMaps.Add(GetUserMenu());
            }

            // AutomatedTasks
            if (isSupportAutomateTask)
            {
                _siteMaps.Add(GetAutomationTaskMenu(canAccessSystem, canUseOnlyAutomationTask));
            }

            // set into session
            SiteMapHelper.SetSiteMaps(_siteMaps);
        }

        public List<SiteMap> GetSiteMaps()
        {
            return _siteMaps;
        }

        private SiteMap GetOverviewMenu()
        {
            return new SiteMap
            {
                Id = "Overview",
                Name = Resource.MC_Overview,
                Uri = "~/Home/OverView",
                HashPath = "Overview",
                Visible = false
            };
        }

        private SiteMap GetGlobalSettingMenu()
        {
            return new SiteMap
            {
                Id = "GlobalSettings",
                Name = Resource.GlobalSettings,
                HashPath = "GlobalSettings",
                Childs = new List<SiteMap>
                {
                    new SiteMap
                    {
                        Id = "Authentication", Name = Resource.MC_Authentication, Uri = "~/GlobalSettings/GetAuthentication", HashPath = "GlobalSettings/Authentication" , ChildsVisible = false , Childs = new List<SiteMap>
                        {
                            new SiteMap { Id = "CreateNewAuthentication", Name = Resource.MC_CreateAuthentication, Uri = "~/GlobalSettings/EditAuthentication", HashPath = "GlobalSettings/Authentication/CreateNewAuthentication" },
                            new SiteMap { Id = "EditAuthentication", Name = Resource.MC_EditAuthentication, Uri = "~/GlobalSettings/EditAuthentication", HashPath = "GlobalSettings/Authentication/EditAuthentication" }
                        }
                    },
                    new SiteMap { Id = "BusinessProcesses", Name = Resource.MC_BusinessProcesses, Uri = "~/LabelCategories/AllBusinessProcesses", HashPath = "GlobalSettings/BusinessProcesses" },

                    new SiteMap { Id = "Components", Name = Resource.MC_Components, Uri = "~/Component/SystemComponents", HashPath = "GlobalSettings/Components" },

                    new SiteMap { Id = "CustomIcons", Name = Resource.MC_CustomIcons, Uri = "~/GlobalSettings/AllFieldCategory", HashPath = "GlobalSettings/CustomIcons" },

                    new SiteMap
                    {
                        Id = "AllLabelCategories", Name = Resource.MC_LabelCategories, Uri = "~/LabelCategories/AllLabelCategories", HashPath = "GlobalSettings/AllLabelCategories", ChildsVisible = false, Childs = new List<SiteMap>
                        {
                            new SiteMap { Id = "CreateLabelCategory", Name = Resource.MC_CreateNewLabelCategory, Uri = "~/LabelCategories/Labels", HashPath = "GlobalSettings/AllLabelCategories/CreateLabelCategory", Parameters = new { categoryLabelsUri = "", categoryUri = "" } },
                            new SiteMap { Id = "EditLabelCategory", Name = Resource.MC_EditLabelCategory, Uri = "~/LabelCategories/Labels", HashPath = "GlobalSettings/AllLabelCategories/EditLabelCategory" }
                        }
                    },
                    new SiteMap { Id = "Languages", Name = Resource.MC_Languages, Uri = "~/GlobalSettings/GetGlobalLanguages", HashPath = "GlobalSettings/Languages" },
                    new SiteMap { Id = "License", Name = Resource.MC_License, Uri = "~/License/GetLicense", HashPath = "GlobalSettings/License" },
                    new SiteMap { Id = "UploadEASets", Name = Resource.MC_Packages, Uri = "~/GlobalSettings/RenderUploadedEASetsPage", HashPath = "GlobalSettings/UploadEASets" },
                    new SiteMap
                    {
                        Id = "Systemlog", Name = Resource.MC_SystemLog, HashPath = "GlobalSettings/Systemlog", Childs = new List<SiteMap>
                        {
                            new SiteMap { Id = "SystemlogAppServer", Name = Resource.MC_SystemLog_AppServer, Uri = "~/GlobalSettings/SystemLog", HashPath = "GlobalSettings/Systemlog/SystemlogAppServer", Parameters = new { target = SystemLogType.AppServer.ToString() } },
                            new SiteMap { Id = "EventLog", Name = Resource.MC_EventLog, Uri = "~/GlobalSettings/AllEventLog", HashPath = "GlobalSettings/Systemlog/EventLog" },
                            new SiteMap { Id = "SystemlogManagementConsole", Name = Resource.MC_SystemLog_ManagementConsole, Uri = "~/GlobalSettings/SystemLog", HashPath = "GlobalSettings/Systemlog/SystemlogManagementConsole", Parameters = new { target = SystemLogType.ManagementConsole.ToString() } },
                            new SiteMap { Id = "SystemlogWebClient", Name = Resource.MC_SystemLog_WebClient, Uri = "~/GlobalSettings/SystemLog", HashPath = "GlobalSettings/Systemlog/SystemlogWebClient", Parameters = new { target = SystemLogType.WebClient.ToString() } },
                            new SiteMap { Id = "ModelServer", Name = Resource.MC_SystemLog_ModelServer, Uri = "~/GlobalSettings/SystemLog", HashPath = "GlobalSettings/Systemlog/ModelServer", Parameters = new { target = SystemLogType.ModelServer.ToString() }}
                        }
                    },
                    new SiteMap
                    {
                        Id = "SystemRoles", Name = Resource.MC_SystemRoles, Uri = "~/SystemRole/GetAllSystemRoles", HashPath = "GlobalSettings/SystemRoles", ChildsVisible = false, Childs = new List<SiteMap>
                        {
                            new SiteMap { Id = "CreateNewSystemRole", Name = Resource.MC_CreateNewSystemRole, Uri = "~/SystemRole/EditSystemRole", HashPath = "GlobalSettings/SystemRoles/CreateNewSystemRole", Parameters = new { systemRoleUri = "" } },
                            new SiteMap { Id = "EditSystemRole", Name = Resource.MC_EditSystemRole, Uri = "~/SystemRole/EditSystemRole", HashPath = "GlobalSettings/SystemRoles/EditSystemRole" }
                        }
                    },
                    new SiteMap { Id = "SystemSettings", Name = Resource.MC_SystemSettings, Uri = "~/GlobalSettings/GetSystemSettings", HashPath = "GlobalSettings/SystemSettings" },
                    new SiteMap { Id = "WebClientSettings", Name = Resource.MC_WebServerSettings, Uri = "~/GlobalSettings/GetWebClientSettings", HashPath = "GlobalSettings/WebClientSettings" },
                    new SiteMap { Id = "WelcomePage", Name = Resource.MC_WelcomePage, Uri = "~/GlobalSettings/GetWelcomePage", HashPath = "GlobalSettings/WelcomePage" }
                }
            };
        }

        private SiteMap GetModelsMenu(List<ModelViewModel> models)
        {
            SiteMap siteMap = new SiteMap
            {
                Id = "Models",
                Name = "Models",
                HashPath = "Models",
                Childs = new List<SiteMap>
                {
                    new SiteMap {
                        Id = "AllModels", Name = Resource.MC_AllModels, Uri = "~/Model/GetAllModels", HashPath = "Models/AllModels", ChildsVisible = false, Childs = new List<SiteMap>
                        {
                            new SiteMap { Id = "CreateNewModel", Name = Resource.MC_CreateNewModel, Uri = "~/Model/GetModel", HashPath = "Models/AllModels/CreateNewModel", Parameters = new { modelUri = "" } },
                            new SiteMap { Id = "EditModel", Name = Resource.MC_EditModel, Uri = "~/Model/GetModel", HashPath = "Models/AllModels/EditModel" }
                        }
                    }
                }
            };

            foreach (ModelViewModel item in models)
            {
                siteMap.Childs.Add(GetModelMenu(item));
            }
            return siteMap;
        }

        private SiteMap GetModelMenu(ModelViewModel item)
        {
            List<ModelServerViewModel> modelServers = _modelService.GetModelServers(item.ServerUri.ToString()).Data;
            bool hasModelServer = modelServers.Any(filter => filter.Type == ModelAgentType.ModelServer);
            bool hasHanaServer = modelServers.Any(x => x.Type == ModelAgentType.HanaServer);
            Type modelSiteMapType = GetModelSiteMapType(item.id, hasModelServer, hasHanaServer);
            ModelSiteMapBaseViewModel modelSiteMap = _modelService.GetModelSiteMap(item.Agent.ToString(), modelSiteMapType);

            string modelPath = string.Format("Models/{0}", item.id);
            dynamic parameters = new
            {
                modelUri = item.Uri,
                modelId = item.id
            };

            SiteMap siteMap = new SiteMap
            {
                Id = item.id,
                Color = item.color,
                Name = String.IsNullOrEmpty(item.short_name) ? item.id : item.short_name,
                Uri = "~/Model/GetModelServers",
                HashPath = modelPath,
                Parameters = parameters,
                Childs = new List<SiteMap>
                {
                    new SiteMap { Id = "ServerSettings", Name = Resource.MC_ServerSettings, HashPath = string.Format("{0}/ServerSettings", modelPath), IsText = true },
                    new SiteMap { Id = "Communications", Name = Resource.MC_Communications, Uri = "~/ModelCommunication/GetCommunications", HashPath = string.Format("{0}/Communications", modelPath), Parameters = parameters, Visible = modelSiteMap.CanManageCommunications },
                    new SiteMap { Id = "EAXtractor", Name = Resource.MC_EAXtractor, Uri = "~/Model/RenderExtractorSettings", HashPath = string.Format("{0}/EAXtractor", modelPath), Parameters = parameters, Visible = modelSiteMap.CanManageExtractor },
                    new SiteMap { Id = "RefreshCycle", Name = Resource.MC_RefreshCycle, Uri ="~/RefreshCycle/GetRefreshCycle", HashPath = string.Format("{0}/RefreshCycle", modelPath), Parameters = parameters, Visible = modelSiteMap.CanManageRefreshTasks },

                    new SiteMap { Id = "ContentSettings", Name = Resource.MC_ContentSettings, HashPath = string.Format("{0}/ContentSettings", modelPath), IsText = true },
                    new SiteMap { Id = "AngleWarnings", Name = Resource.MC_AngleWarnings, Uri = "~/AngleWarnings/GetAngleWarnings", HashPath = string.Format("{0}/AngleWarnings", modelPath), Parameters = parameters , Visible = modelSiteMap.CanManageAngleWarnings },
                    new SiteMap { Id = "ContentParameters", Name = Resource.MC_ContentParameters, Uri = "~/Model/RenderModelServerSettings", HashPath = string.Format("{0}/ContentParameters", modelPath), Parameters = parameters, Visible = modelSiteMap.CanManageContentParameters },
                    new SiteMap { Id = "LabelCategories", Name = Resource.MC_Labels, Uri = "~/LabelCategories/LabelCategories", HashPath = string.Format("{0}/LabelCategories", modelPath), Parameters = parameters, Visible = modelSiteMap.CanManageLabelCategories },
                    new SiteMap { Id = "Languages", Name = Resource.MC_Languages, Uri = "~/ActiveLanguage/GetModelLanguages", HashPath = string.Format("{0}/Languages", modelPath), Parameters = parameters, Visible = modelSiteMap.CanManageLanguages },
                    new SiteMap { Id = "TemplateAngles", Name = Resource.MC_Packages, Uri = "~/Packages/RenderTemplateAnglesPage", HashPath = string.Format("{0}/TemplateAngles", modelPath), Parameters = parameters , Visible = modelSiteMap.CanManagePackages },
                    new SiteMap { Id = "SuggestedFields", Name = Resource.MC_SuggestedFields, Uri = "~/SuggestedFields/SuggestedFields", HashPath = string.Format("{0}/SuggestedFields", modelPath), Parameters = parameters , Visible = modelSiteMap.CanManageSuggestedFields },
                    new SiteMap { Id = "RolesSettings", Name = Resource.MC_RolesSettings, HashPath = string.Format("{0}/RolesSettings", modelPath), IsText = true },
                    new SiteMap
                    {
                        Id = "Roles",
                        Name = Resource.MC_Roles,
                        Uri = "~/Role/GetAllRolesPage",
                        HashPath = string.Format("{0}/Roles", modelPath),
                        Parameters = parameters,
                        Visible = modelSiteMap.CanManageRoles,
                        ChildsVisible = false,
                        Childs = new List<SiteMap>
                        {
                            new SiteMap { Id = "CreateNewRole", Name = Resource.MC_CreateNewRole, Uri = "~/Role/EditRole", HashPath = string.Format("{0}/Roles/CreateNewRole", modelPath), Parameters = new { roleUri = "", modelUri = item.Uri } },
                            new SiteMap { Id = "EditRole", Name = Resource.MC_EditRole, Uri = "~/Role/EditRole", HashPath = string.Format("{0}/Roles/EditRole", modelPath) },
                            new SiteMap { Id = "CreateObject", Name = Resource.MC_CreateObject, Uri = "~/Role/EditObject", HashPath = string.Format("{0}/Roles/CreateObject", modelPath) },
                            new SiteMap { Id = "EditObject", Name = Resource.MC_EditObject, Uri = "~/Role/EditObject", HashPath = string.Format("{0}/Roles/EditObject", modelPath) }
                        }
                    }
                }
            };
            return siteMap;
        }

        public Type GetModelSiteMapType(string modelId, bool hasModelServer, bool hasHanaServer)
        {
            // slave model have to disable some menu
            bool isSlaveModel = !hasModelServer && !hasHanaServer;
            Type siteMapType = isSlaveModel ? typeof(ModelSiteMapSlaveViewModel) : typeof(ModelSiteMapBaseViewModel);
            return siteMapType;
        }

        private SiteMap GetUserMenu()
        {
            return new SiteMap
            {
                Id = "Users",
                Name = Resource.MC_UsersUpperCase,
                HashPath = "Users",
                Childs = new List<SiteMap>
                {
                    new SiteMap
                    {
                        Id = "AllUsers", Name = Resource.MC_AllUsers, Uri = "~/Users/GetAllUsers", HashPath = "Users/AllUsers", ChildsVisible = false, Childs = new List<SiteMap>
                        {
                            new SiteMap { Id = "ImportNewUser", Name = Resource.MC_ImportUser_Add_Users, Uri = "~/Users/GetNewUsers", HashPath = "Users/AllUsers/ImportNewUser" },
                            new SiteMap { Id = "EditUser", Name = Resource.MC_EditUser, Uri = "~/Users/EditUser", HashPath = "Users/AllUsers/EditUser" }
                        }
                    },
                    new SiteMap { Id = "Sessions", Name = Resource.MC_Sessions, Uri = "~/Users/GetAllSessions", HashPath = "Users/Sessions" },
                    new SiteMap { Id = "UserDefaults", Name = Resource.MC_UserDefaults, Uri="~/Users/GetUserDefaultSetting", HashPath = "Users/UserDefaults" }
                }
            };
        }

        private SiteMap GetAutomationTaskMenu(bool canAccessSystem, bool canUseOnlyAutomationTask)
        {
            bool canSeeAutomationTask = canAccessSystem || canUseOnlyAutomationTask;

            SiteMap siteMap = new SiteMap { Id = "AutomationTasks", Name = Resource.MC_AutomationTasks, HashPath = "AutomationTasks", Visible = true, Childs = new List<SiteMap>() };

            // DataStores
            if (!canUseOnlyAutomationTask)
            {
                siteMap.Childs.Add(new SiteMap
                {
                    Id = "DataStores",
                    Name = Resource.DataStores,
                    Uri = "~/AutomationTasks/RenderDataStoresPage",
                    HashPath = "AutomationTasks/DataStores",
                    ChildsVisible = false,
                    Childs = new List<SiteMap>
                    {
                        new SiteMap { Id = "CreateNewDatastores", Name = Resource.MC_CreateDatastore, Uri = "~/AutomationTasks/EditDatastore", HashPath = "AutomationTasks/DataStores/CreateNewDatastores" },
                        new SiteMap { Id = "EditDatastores", Name = Resource.MC_EditDatastore, Uri = "~/AutomationTasks/EditDatastore", HashPath = "AutomationTasks/DataStores/EditDatastores" }
                    }
                });
            }

            // Tasks
            if (canSeeAutomationTask)
            {
                siteMap.Childs.Add(new SiteMap
                {
                    Id = "Tasks",
                    Name = Resource.MC_Tasks,
                    Uri = "~/AutomationTasks/GetAllTasks",
                    HashPath = "AutomationTasks/Tasks",
                    ChildsVisible = false,
                    Childs = new List<SiteMap>
                    {
                        new SiteMap { Id = "CreateNewTask", Name = Resource.MC_CreateTask, Uri = "~/AutomationTasks/EditTask", HashPath = "AutomationTasks/Tasks/CreateNewTask" },
                        new SiteMap { Id = "EditTask", Name = Resource.MC_EditTask, Uri = "~/AutomationTasks/EditTask", HashPath = "AutomationTasks/Tasks/EditTask" }
                    }
                });
            }

            return siteMap;
        }
    }
}
