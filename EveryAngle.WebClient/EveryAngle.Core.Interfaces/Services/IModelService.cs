using EveryAngle.Core.ViewModels;
using EveryAngle.Core.ViewModels.Cycle;
using EveryAngle.Core.ViewModels.EAPackage;
using EveryAngle.Core.ViewModels.FieldCategory;
using EveryAngle.Core.ViewModels.Label;
using EveryAngle.Core.ViewModels.LabelCategory;
using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Core.ViewModels.ModelServer;
using EveryAngle.Core.ViewModels.Users;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Data;



namespace EveryAngle.Core.Interfaces.Services
{
    public interface IModelService
    {
        List<ModelViewModel> GetModels(string uri);
        List<ModelViewModel> GetSessionModels(string uri);
        ModelViewModel GetModel(string modelUri);
        ModelViewModel CreateModel(string modelUri, string newModel);
        SystemRoleViewModel CreateRole(string modelUri, string newModel);
        ModelViewModel UpdateModel(string modelUri, string model);
        void DeleteModel(string uri);
        void UpdateModelLicense(string modelUri, SystemLicenseViewModel modelLicense);
        ListViewModel<SystemRoleViewModel> GetRoles(string roleUri);
        SystemRoleViewModel GetRole(string modelUri, string roleUri, ModelViewModel modelData = null, ListViewModel<LabelCategoryViewModel> modelLabelCategoryDatas = null, ListViewModel<LabelViewModel> modelLabelDatas = null);
        SystemRoleViewModel GetRoleById( string roleUri);
        void DeleteRole(string roleUri);
        bool SaveRole(string modelUri, SystemRoleViewModel updatedRole, List<PrivilegeLabel> privilegeLabels);
        void DeletePrivilege(string uri, string updatedRole);
        List<string> GetClassesId(string uri);
        List<ClassViewModel> GetClasses(string uri);
        ListViewModel<ModelServerViewModel> GetModelServers(string uri);
        List<EventLogViewModel> GetEventLog(string modelServerUri);
        List<SystemRoleViewModel> GetSystemRoles(string systemRoleUri);
        FieldViewModel GetModelFields(string fieldUri);
        FieldCategoryViewModel GetFieldCategory(string fieldCategoryUri);
        InstanceViewModel GetInstance(string instanceUri);
        ListViewModel<ModelServerReportViewModel> GetReports(string reportUri);
        string GetModelServerReport(string reportUri);
        void UpdateModelActiveLanguages(string uri, string activeLanguages);
        DataTable GetEventsTable(string modelServerUri, int page, int pageSize);
        void DeleteModelServer(string modelServerUri);
        ModelServerViewModel CreateModelServer(string modelServerUri, string modelServersData); 
        string SaveRole(string modelUri, string roleUri, string updatedRole);

        FieldCategoryViewModel GetFieldName(string fieldsUri);

        List<HelpTextsViewModel> GetModelFieldsHelpTexts(string helpTextUri);
        HelpTextsViewModel GetModelFieldsHelpText(string helpTextUri);

        DataTable GetAvailabelRolesTable(string roleUri);
        DataTable GetAvailabelRolesTable(List<SystemRoleViewModel> roles);

        FieldDomainViewModel GetFieldDomain(string fieldsDomainUri);

        ListViewModel<PackageViewModel> GetModelPackages(string packageUri);

        PackageViewModel GetModelPackage(string packageUri);

        void UpdatePackage(string packageUri, string updatePackage);
        ModelServerSettings GetModelSettings(string uri);
        ModelServerSettings SaveModelSettings(string uri, string content);
        AgentViewModel GetModelAgent(string uri);
        ModelSiteMapBaseViewModel GetModelSiteMap(string uri, Type siteMapType);

        TaskViewModel CreateTask(string uri, string data);
        TaskViewModel UpdateTask(string uri, string data);
        void DeleteTask(string uri);
        
        ListViewModel<TaskHistoryViewModel> GetTaskHistories(string uri);
        
        ModelServerViewModel GetModelServer(string modelServerUri);

        ExtractorViewModel GetModelExtractor(string uri);

        IEnumerable<AgentModelInfoViewModel> GetModelServersInfo(string uri);

        void UpdateModelInfo(string uri, string id, bool status);

        string GetModuleExtensionsDetail(string detailUri);

        string UpdateModuleExtensionsDetail(string detailUri, string extensionData);

        TaskViewModel GetTask(string tasksUri);

        TaskHistoryViewModel GetTaskHistory(string taskHistoryUri);

        List<TaskAction> GetActionsTask(string taskActionsUri);

        string GetModelAngles(string uri);

        EveryAngle.Core.ViewModels.Model.Field UpdateField(string uri, string data);

        SuggestedFieldsSummaryViewModel GetSuggestedFieldsSummary(string uri);

        JObject GetAngleWarningFirstLevel(string uri);

        JObject GetAngleWarningSecondLevel(string uri);

        JObject GetAngleWarningThirdLevel(string uri);

        List<FollowupViewModel> GetFollowups(string uri);
    }
}
