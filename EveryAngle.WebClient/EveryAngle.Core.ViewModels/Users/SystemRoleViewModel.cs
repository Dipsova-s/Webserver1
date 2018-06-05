using EveryAngle.Core.ViewModels.Privilege;
using EveryAngle.Shared.Helpers;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Runtime.Serialization;

namespace EveryAngle.Core.ViewModels.Users
{
    [Serializable]
    public class SystemRoleViewModel : ICloneable
    {
        public SystemRoleViewModel()
        {
            ModelPrivilege = new ModelPrivilegeViewModel();
        }

        [DataMember(EmitDefaultValue = false)]
        [JsonProperty(PropertyName = "id", DefaultValueHandling = DefaultValueHandling.Ignore)]
        [RegularExpression(@"^[a-zA-Z_][A-Za-z0-9_]*$")]
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

        [JsonProperty(PropertyName = "description")]
        public string Description { get; set; }

        [JsonProperty(PropertyName = "subrole_ids")]
        public List<string> Subrole_ids { get; set; }

        [SkipPropertyAttribute]
        public int TotalSubRoles
        {
            get
            {
                return this.Subrole_ids != null ? this.Subrole_ids.Count : 0;
            }
        }

        private Uri subRolesUri;
        [JsonProperty(PropertyName = "sub_roles")]
        public Uri SubRolesUri
        {
            get { return subRolesUri; }
            set
            {
                subRolesUri = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        public List<SystemRoleViewModel> SubRoles { get; set; }

        [JsonProperty(PropertyName = "created", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public UserDateViewModel CreatedBy { get; set; }

        [JsonProperty(PropertyName = "changed", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public UserDateViewModel ChangedBy { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        [DefaultValue(0)]
        public int TotalSubRole { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        [DefaultValue(0)]
        public string ModelRole { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        [DefaultValue(0)]
        public string ModelId { get; set; }

        [JsonProperty(PropertyName = "user_count", DefaultValueHandling = DefaultValueHandling.Ignore)]
        [DefaultValue(0)]
        public int user_count { get; set; }

        private Uri consolidated_role;
        [JsonProperty(PropertyName = "consolidated_role")]
        public virtual Uri Consolidated_role
        {
            get { return consolidated_role; }
            set
            {
                consolidated_role = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        [JsonProperty(PropertyName = "system_privileges")]
        public SystemPrivilegeViewModel SystemPrivileges { get; set; }

        [JsonProperty(PropertyName = "model_authorization")]
        public ModelPrivilegeViewModel ModelPrivilege { get; set; }

        private List<PrivilegeLabel> privilegeLabels;
        public List<PrivilegeLabel> PrivilegeLabels
        {
            get
            {
                if (privilegeLabels == null)
                {
                    privilegeLabels = GetCurrentLabelsPrivilage();
                }

                return privilegeLabels;
            }
            set { privilegeLabels = value; }
        }

        private List<PrivilegeLabel> GetCurrentLabelsPrivilage()
        {
            List<PrivilegeLabel> privilages = new List<PrivilegeLabel>();

            if (ModelPrivilege.LabelAuthorizations != null)
            {
                foreach (KeyValuePair<string, string> labelPermission in ModelPrivilege.LabelAuthorizations)
                {
                    PrivilegeLabel label = new PrivilegeLabel();
                    label.Name = labelPermission.Key;

                    switch (labelPermission.Value)
                    {
                        case "validate":
                            label.Type = PrivilegeType.Validate;
                            break;
                        case "view":
                            label.Type = PrivilegeType.View;
                            break;
                        case "assign":
                            label.Type = PrivilegeType.Assign;
                            break;
                        case "manage":
                            label.Type = PrivilegeType.Manage;
                            break;
                        case "deny":
                            label.Type = PrivilegeType.Deny;
                            break;
                        default:
                            break;
                    }
                    privilages.Add(label);
                }
            }
            return privilages;
        }

        public object Clone()
        {
            return this.MemberwiseClone();
        }
    }

    [Serializable]
    public class PrivilegeLabel
    {
        [LocalizedDisplayName("MC_LabelCategory")]
        public string LabelCategory { get; set; }
        [LocalizedDisplayName("MC_Labels")]
        public string Name { get; set; }

        [UIHint("PrivilegeTypeTemplate")]
        [LocalizedDisplayName("MC_Privileges")]
        public PrivilegeType Type { get; set; }
    }

    public enum PrivilegeType
    {
        View = 0,
        Assign = 1,
        Manage = 2,
        Validate = 3,
        Deny = 4
    }

    public class ConsolidatedRoleViewModel
    {
        public string consolidated_role { get; set; }

        [JsonProperty(PropertyName = "system_privileges")]
        [LocalizedDisplayName("MC_SystemPrivileges")]
        public SystemPrivilegeViewModel SystemPrivileges { get; set; }

        [JsonProperty(PropertyName = "user_count")]
        [LocalizedDisplayName("MC_UserCount")]
        public int user_count { get; set; }

        [JsonProperty(PropertyName = "model_authorization")]
        [LocalizedDisplayName("MC_ModelAuthorization")]
        public ModelPrivilegeViewModel ModelPrivilege { get; set; }

        [JsonProperty(PropertyName = "uri")]
        [LocalizedDisplayName("MC_Uri")]
        public string uri { get; set; }

        [JsonProperty(PropertyName = "subrole_ids")]
        [LocalizedDisplayName("MC_Subrole_Ids")]
        public List<string> subrole_ids { get; set; }
    }

}
