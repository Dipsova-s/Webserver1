using EveryAngle.Core.ViewModels.Privilege;
using EveryAngle.Shared.Helpers;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;

namespace EveryAngle.Core.ViewModels.Users
{
    public class UserViewModel: ICloneable
    {
        [JsonProperty(PropertyName = "id")]
        public string Id { get; set; }

        private Uri uri;
        [JsonProperty(PropertyName = "uri")]
        public virtual Uri Uri
        {
            get { return uri; }
            set
            {
                uri = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        private Uri user;
        [JsonProperty(PropertyName = "user")]
        public Uri User
        {
            get { return user; }
            set
            {
                user = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        private Uri roles;
        [JsonProperty(PropertyName = "roles")]
        public virtual Uri Roles
        {
            get { return roles; }
            set
            {
                roles = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        public List<string> default_business_processes { get; set; }

  

        [JsonProperty(PropertyName = "assigned_roles")]
        public virtual List<AssignedRoleViewModel> AssignedRoles { get; set; }

        [JsonProperty(PropertyName = "access_to_models")]
        public virtual List<string> access_to_models { get; set; }

        public string AccessModel
        {
            get
            {
                if (access_to_models != null)
                {
                    return string.Join(", ", access_to_models);
                }
                return string.Empty;
            }
        }

        [JsonProperty(PropertyName = "full_name")]
        public string Fullname { get; set; }

        [JsonProperty(PropertyName = "domain")]
        public string Domain { get; set; }

        [JsonProperty(PropertyName = "enabled")]
        public virtual bool Enabled { get; set; }

        [JsonProperty(PropertyName = "is_enabled")]
        public virtual bool IsEnabled { get; set; }

        [JsonProperty(PropertyName = "enabled_until")]
        public virtual long? EnabledUntil { get; set; }

        [JsonProperty(PropertyName = "registered_on")]
        public virtual DateTime RegisteredOn { get; set; }

        [JsonProperty(PropertyName = "last_logon")]
        public virtual long Last_Logon { get; set; }

        private Uri userSettings;
        [JsonProperty(PropertyName = "user_settings")]
        public virtual Uri UserSettings
        {
            get { return userSettings; }
            set
            {
                userSettings = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }


        public virtual UserSettingsViewModel Settings { get; set; }


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

        private Uri authUsers;
        [JsonProperty(PropertyName = "authenticationprovider")]
        public virtual Uri AuthenticationProvider
        {
            get { return authUsers; }
            set
            {
                authUsers = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        public virtual string AuthenticationProviderName { get; set; }
       

        [JsonProperty(PropertyName = "system_privileges")]
        public SystemPrivilegeViewModel SystemPrivileges { get; set; }

        public virtual UserSettingsViewModel GetUserSettings()
        {
            throw new NotImplementedException();
        }

        public List<AuthenticatedUserViewModel> AuthenticatedUsers { get; set; }

        public string UserProvider { get; set; }
        
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public int TotalRole
        {
            get
            {
                return AssignedRoles == null ? 0 : AssignedRoles.Count;
            }
        }

        public object Clone()
        {
            return this.MemberwiseClone();
        }
    }

    public enum ModelPrivilegeType
    {
        AllowPrivateAngle = 0,
        AllowPrivateDisplay = 1,
        AllowNonDefaultDisplay = 2,
        AllowDrillDown = 3,
        AllowExport = 4

    }
}
