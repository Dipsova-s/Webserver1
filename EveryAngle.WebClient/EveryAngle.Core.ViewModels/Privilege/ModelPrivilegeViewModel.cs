using EveryAngle.Core.ViewModels.Users;
using EveryAngle.Shared.Helpers;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Runtime.Serialization;

namespace EveryAngle.Core.ViewModels.Privilege
{
    [Serializable]
    public class ModelPrivilegeViewModel
    {
        public ModelPrivilegeViewModel()
        {
            Privileges = new PrivilegesForModelViewModel();
        }

        private Uri modelUri;
        [DataMember(EmitDefaultValue = false)]
        [LocalizedDisplayName("Model")]
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, Required = Required.Always)]
        public Uri model
        {
            get { return modelUri; }
            set
            {
                string originalModel = value.ToString();
                originalModel = originalModel.Replace(UrlHelper.GetRequestUrl(URLType.NOA), "");
                modelUri = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + originalModel);
            }
        }

        public string model_id { get; set; }

        private Uri authorizations;
        [JsonProperty(PropertyName = "authorizations")]
        [LocalizedDisplayName("MC_Authorizations")]
        public virtual Uri authorizationsUri
        {
            get { return authorizations; }
            set
            {
                authorizations = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        [DataMember(EmitDefaultValue = false)]
        [LocalizedDisplayName("MC_Privileges")]
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "privileges")]
        public PrivilegesForModelViewModel Privileges { get; set; }

        [DataMember(EmitDefaultValue = false)]
        [LocalizedDisplayName("MC_Roles")]
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "roles")]
        public IList<AssignedRoleViewModel> roles { get; set; }

        [JsonProperty(PropertyName = "allowed_classes")]
        [LocalizedDisplayName("MC_AllowedClasses")]
        public List<string> AllowedClasses { get; set; }

        [JsonProperty(PropertyName = "denied_classes")]
        [LocalizedDisplayName("MC_DeniedClasses")]
        public List<string> DeniedClasses { get; set; }

        [JsonProperty(PropertyName = "object_filters")]
        [LocalizedDisplayName("MC_ObjectFilters")]
        public List<ObjectFilterViewModel> ObjectFilter { get; set; }

        [JsonProperty(PropertyName = "field_authorizations")]
        [LocalizedDisplayName("MC_FieldAuthorizations")]
        public List<FieldAuthorizationViewModel> FieldAuthorizations { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "label_authorizations")]
        [LocalizedDisplayName("MC_LabelAuthorizations")]
        public Dictionary<string, string> LabelAuthorizations { get; set; }

        [JsonProperty(PropertyName = "default_label_authorization")]
        [LocalizedDisplayName("MC_DefaultLabelAuthorization")]
        public string DefaultLabelAuthorization { get; set; }

        [JsonProperty(PropertyName = "default_class_authorization")]
        [LocalizedDisplayName("MC_DefaultClassAuthorization")]
        public bool? DefaultClassAuthorization { get; set; }

        public string ModelName { get; set; }
    }

}
