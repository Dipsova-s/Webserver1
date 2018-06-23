using Newtonsoft.Json;

namespace EveryAngle.Core.ViewModels.Model
{
    public class ModelSiteMapBaseViewModel
    {
        [JsonProperty(PropertyName = "download_settings_uri")]
        public string DownloadSettings { get; set; }

        [JsonProperty(PropertyName = "modelinfo_uri")]
        public string ModelInfo { get; set; }

        [JsonProperty(PropertyName = "refresh_tasks_uri")]
        public string RefreshTasks { get; set; }

        [JsonProperty(PropertyName = "modelserver_settings_uri")]
        public string ModelServerSettings { get; set; }

        [JsonProperty(PropertyName = "languages_uri")]
        public string Languages { get; set; }

        [JsonProperty(PropertyName = "modules_uri")]
        public string Modules { get; set; }

        [JsonProperty(PropertyName = "downloadtables_uri")]
        public string DownloadTables { get; set; }

        #region menu visibility

        public virtual bool CanManageCommunications => true;
        public virtual bool CanManageExtractor => !string.IsNullOrEmpty(DownloadSettings);
        public virtual bool CanViewModelServers => true;
        public virtual bool CanManageRefreshTasks => !string.IsNullOrEmpty(RefreshTasks);
        public virtual bool CanManageAngleWarnings => true;
        public virtual bool CanManageContentParameters  => !string.IsNullOrEmpty(ModelServerSettings);
        public virtual bool CanManageLabelCategories  => true;
        public virtual bool CanManageLanguages  => !string.IsNullOrEmpty(Languages);
        public virtual bool CanManageModules  => !string.IsNullOrEmpty(Modules);
        public virtual bool CanManagePackages  => true;
        public virtual bool CanManageSuggestedFields  => true;
        public virtual bool CanManageDownloadTables  => !string.IsNullOrEmpty(DownloadTables);
        public virtual bool CanManageRoles  => true;

        #endregion
    }
}
