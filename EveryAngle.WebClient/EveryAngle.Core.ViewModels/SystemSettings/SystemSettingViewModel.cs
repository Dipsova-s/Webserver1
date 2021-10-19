using Newtonsoft.Json;
using System;
using System.Collections.Generic;

namespace EveryAngle.Core.ViewModels.SystemSettings
{
    public class SystemSettingViewModel : ICloneable
    {
        [JsonProperty(PropertyName = "default_pagesize")]
        [LocalizedDisplayName("MC_DefaultPageSize")]
        public virtual int default_pagesize { get; set; }

        [JsonProperty(PropertyName = "max_pagesize")]
        [LocalizedDisplayName("MC_MaxPageSize")]
        public int max_pagesize { get; set; }

        [JsonProperty(PropertyName = "max_pagesize_appserver")]
        [LocalizedDisplayName("MC_MaxPageSize")]
        public int max_pagesize_appserver { get; set; }
        
        [JsonProperty(PropertyName = "session_expiry_minutes")]
        [LocalizedDisplayName("MC_SessionTimeout")]
        public int session_expiry_minutes { get; set; }

        [JsonProperty(PropertyName = "remember_expired_sessions_minutes")]
        [LocalizedDisplayName("MC_SessionHistory")]
        public int remember_expired_sessions_minutes { get; set; }

        [JsonProperty(PropertyName = "modelserver_check_seconds")]
        [LocalizedDisplayName("MC_PollModelserver")]
        public int modelserver_check_seconds { get; set; }

        [JsonProperty(PropertyName = "modelserver_timeout")]
        [LocalizedDisplayName("MC_ModelserverTimeout")]
        public int modelserver_timeout { get; set; }

        [JsonProperty(PropertyName = "modelserver_metadata_timeout")]
        [LocalizedDisplayName("MC_ModelServerMetadataTimeout")]
        public int modelserver_metadata_timeout { get; set; }

        [JsonProperty(PropertyName = "max_domainelements_for_search")]
        [LocalizedDisplayName("MC_MaxDomainSizeSearch")]
        public int max_domainelements_for_search { get; set; }

        [JsonProperty(PropertyName = "default_cache_minutes")]
        [LocalizedDisplayName("MC_CacheValidity")]
        public int default_cache_minutes { get; set; }

        [JsonProperty(PropertyName = "min_labelcategories_to_publish")]
        [LocalizedDisplayName("MC_MinimumNumberPublishAngle")]
        public int min_labelcategories_to_publish { get; set; }

        [JsonProperty(PropertyName = "check_expired_sessions_minutes")]
        [LocalizedDisplayName("MC_CheckExpiredSessions")]
        public int check_expired_sessions_minutes { get; set; }

        [JsonProperty(PropertyName = "instances_per_model")]
        [LocalizedDisplayName("MC_InstancesKeepPerModel")]
        public int instances_per_model { get; set; }

        [JsonProperty(PropertyName = "auto_create_users")]
        [LocalizedDisplayName("MC_AutomaticallyCreateUsersFirstLogon")]
        public bool auto_create_users { get; set; }

        [JsonProperty(PropertyName = "default_system_roles")]
        [LocalizedDisplayName("MC_AssignFollowingRoles")]
        public List<string> default_system_roles { get; set; }

        [JsonProperty(PropertyName = "active_directory_size_limit")]
        [LocalizedDisplayName("MC_ActiveDirectorySizeLimit")]
        public int active_directory_size_limit { get; set; }

        [JsonProperty(PropertyName = "default_max_export_page_size")]
        [LocalizedDisplayName("MC_DefaultMaxExportPageSize")]
        public int default_max_export_page_size { get; set; }

        [JsonProperty(PropertyName = "trusted_webservers")]
        [LocalizedDisplayName("MC_AssignTrustedWebservers")]
        public List<string> trusted_webservers { get; set; }

        [JsonProperty(PropertyName = "max_general_history")]
        [LocalizedDisplayName("MC_MaxGeneralHistory")]
        public int max_general_history { get; set; }

        [JsonProperty(PropertyName = "max_audit_log_history")]
        [LocalizedDisplayName("MC_MaxAuditLogHistory")]
        public int max_audit_log_history { get; set; }

        [JsonProperty(PropertyName = "allow_grouping_in_pivot_excel_export")]
        [LocalizedDisplayName("MC_AllowGroupingInPivotExcelExport")]
        public bool allow_grouping_in_pivot_excel_export { get; set; }

        [JsonProperty(PropertyName = "include_self_in_export_headers")]
        [LocalizedDisplayName("MC_IncludeSelfInExportHeaders")]
        public bool include_self_in_export_headers { get; set; }

        [JsonProperty(PropertyName = "script_location")]
        [LocalizedDisplayName("MC_ScriptLocation")]
        public string script_location { get; set; }

        [JsonProperty(PropertyName = "fallback_field_length")]
        [LocalizedDisplayName("MC_FallbackFieldLength")]
        public int fallback_field_length { get; set; }

        [JsonProperty(PropertyName = "default_approval_state")]
        [LocalizedDisplayName("MC_DefaultApprovalState")]
        public string default_approval_state { get; set; }

        [JsonProperty(PropertyName = "log_level")]
        [LocalizedDisplayName("MC_LogLevel")]
        public string log_level { get; set; }

        [JsonProperty(PropertyName = "delay_to_trigger_task_on_new_model")]
        [LocalizedDisplayName("MC_DelayToTriggerTaskOnNewModel")]
        public int delay_to_trigger_task_on_new_model { get; set; }

        public string ReFormatTrustedWebservers
        {
            get
            {
                if (trusted_webservers != null)
                {
                    return string.Join(", ", trusted_webservers);
                }
                return string.Empty;
            }

        }

        [JsonProperty(PropertyName = "default_authentication_provider")]
        public string DefaultAuthenticationProvider { get; set; }


        [JsonProperty(PropertyName = "email_settings")]
        public SystemEmailSettingsViewModel EmailSettings { get; set; } = new SystemEmailSettingsViewModel();

        public bool IsEnableProvider { get; set; }

        public object Clone()
        {
            return this.MemberwiseClone();
        }
    }

    public class SystemEmailSettingsViewModel
    {
        [JsonProperty(PropertyName = "smtp_server")]
        [LocalizedDisplayName("MC_EmailServerSMTP")]
        public string smtp_server { get; set; }

        [JsonProperty(PropertyName = "smtp_port")]
        [LocalizedDisplayName("MC_EmailServerPort")]
        public int smtp_port { get; set; }

        [JsonProperty(PropertyName = "smtp_sender")]
        [LocalizedDisplayName("MC_Sender")]
        public string smtp_sender { get; set; }

        [JsonProperty(PropertyName = "recipient")]
        [LocalizedDisplayName("MC_Recipients")]
        public string recipient { get; set; }

        [JsonProperty(PropertyName = "smtp_use_ssl")]
        [LocalizedDisplayName("MC_UseSSL")]
        public bool smtp_use_ssl { get; set; }

        [JsonProperty(PropertyName = "smtp_user")]
        [LocalizedDisplayName("Username")]
        public string username { get; set; }

        [JsonProperty(PropertyName = "smtp_password")]
        [LocalizedDisplayName("Password")]
        public string password { get; set; }

        public bool has_password => !string.IsNullOrEmpty(password);

        public SystemEmailSettingsViewModel()
        {
            this.smtp_port = 25;
        }
    }
}
