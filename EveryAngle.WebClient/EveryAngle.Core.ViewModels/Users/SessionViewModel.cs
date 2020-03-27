using EveryAngle.Core.ViewModels.Privilege;
using EveryAngle.Shared.Helpers;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;

namespace EveryAngle.Core.ViewModels.Users
{
    public class SessionViewModel
    {
        [JsonProperty(PropertyName = "id")]
        public string Id { get; set; }

        private Uri uri;
        [JsonProperty(PropertyName = "uri")]
        public Uri Uri
        {
            get { return uri; }
            set
            {
                uri = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        private Uri user;
        [JsonProperty(PropertyName = "user")]
        public Uri UserUri
        {
            get { return user; }
            set
            {
                user = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string UserID { get; set; }

        [JsonProperty(PropertyName = "use_tokencookie")]
        public bool TokenCookie { get; set; }

        [JsonProperty(PropertyName = "security_token")]
        public string SecurityToken { get; set; }

        [JsonProperty(PropertyName = "ip_address")]
        public string IpAddresses { get; set; }

        [JsonProperty(PropertyName = "client_ip")]
        public string ClienIpAddresses { get; set; }

        [JsonProperty(PropertyName = "is_active")]
        public bool IsActive { get; set; }

        [JsonProperty(PropertyName = "is_explicit")]
        public bool IsExplicit { get; set; }

        [JsonProperty(PropertyName = "created")]
        public long Created { get; set; }

        [JsonProperty(PropertyName = "expiration_time")]
        public long ExpirationTime { get; set; }

        public bool IsCurrentLogedInSession { get; set; }

        [JsonProperty(PropertyName = "system_privileges")]
        public SystemPrivilegeViewModel SystemPrivileges { get; set; }

        [JsonProperty(PropertyName = "assigned_roles")]
        public virtual List<AssignedRoleViewModel> AssignedRoles { get; set; }

        [JsonProperty(PropertyName = "debug_logging")]
        public bool debug_logging { get; set; }

        public string ReanableIpAddresses
        {
            get
            {
                if (IpAddresses != null)
                {
                    return string.Join(",", IpAddresses);
                }
                return string.Empty;
            }

        }

        public string Ip
        {
            get
            {
                return !string.IsNullOrEmpty(ClienIpAddresses) ? ClienIpAddresses : IpAddresses;
            }
        }

        public virtual bool IsValidToManagementAccess()
        {
            return bool.Equals(true, this.SystemPrivileges.has_management_access);
        }

        public virtual bool IsValidToManageSystemPrivilege()
        {
            return bool.Equals(true, this.SystemPrivileges.manage_system);
        }

        public virtual bool IsValidToManageUserPrivilege()
        {
            return bool.Equals(true, this.SystemPrivileges.manage_users);
        }

        /// <summary>
        /// Can use schedule task in Automation tasks section
        /// </summary>
        /// <returns></returns>
        public virtual bool IsValidToScheduleAngles()
        {
            return bool.Equals(true, this.SystemPrivileges.schedule_angles);
        }

        /// <summary>
        /// Can manage at least 1 model 
        /// </summary>
        /// <returns></returns>
        public virtual bool IsValidToManageModelPrivilege()
        {
            return IsValidToManageModelPrivilege(null);
        }

        public virtual bool IsValidToManageModelPrivilege(string model)
        {
            if (this.ModelPrivileges != null)
                return this.ModelPrivileges.Any(m => (model == null || m.model.ToString() == model) && bool.Equals(true, m.Privileges.manage_model));
            return false;
        }

        /// <summary>
        /// Can manage modeling workbench 
        /// </summary>
        /// <returns></returns>
        public virtual bool IsValidToManageModelingWorkbenchPrivilege()
        {
            return IsValidToManageModelingWorkbenchPrivilege(null);
        }

        public virtual bool IsValidToManageModelingWorkbenchPrivilege(string model)
        {
            if (this.ModelPrivileges != null)
                return this.ModelPrivileges.Any(m => (model == null || m.model.ToString() == model) && (bool.Equals(true, m.Privileges.configure_content) || bool.Equals(true, m.Privileges.edit_content)));
            return false;
        }

        /// <summary>
        /// Can access web client
        /// </summary>
        /// <returns></returns>
        public virtual bool IsValidToAccessWebClient()
        {
            return IsValidToAccessWebClient(null);
        }
        public virtual bool IsValidToAccessWebClient(string model)
        {

            if (this.ModelPrivileges != null)
                return this.ModelPrivileges.Any(m => (model == null || m.model.ToString() == model) && bool.Equals(true, m.Privileges.access_data_via_webclient));
            return false;
        }

        private Uri modelPrivileges;
        [JsonProperty(PropertyName = "model_privileges")]
        public virtual Uri ModelPrivilegesUri
        {
            get { return modelPrivileges; }
            set
            {
                modelPrivileges = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        public List<ModelPrivilegeViewModel> ModelPrivileges { get; set; }

    }
}
