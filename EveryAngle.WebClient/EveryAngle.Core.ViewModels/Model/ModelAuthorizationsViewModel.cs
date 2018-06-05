using EveryAngle.Core.ViewModels.Privilege;
using EveryAngle.Core.ViewModels.Users;
using EveryAngle.Shared.Helpers;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EveryAngle.Core.ViewModels.Model
{
    public class ModelAuthorizationsViewModel
    {
        private Uri modelUri;
        [JsonProperty(PropertyName = "model")]
        public Uri model
        {
            get { return modelUri; }
            set
            {
                modelUri = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        [JsonProperty(PropertyName = "model_id")]
        [LocalizedDisplayName("MC_ModelID")]
        public string model_id { get; set; }

        [JsonProperty(PropertyName = "profile_id")]
        [LocalizedDisplayName("MC_ProfileId")]
        public string profile_id { get; set; }

        [JsonProperty(PropertyName = "profile_key")]
        [LocalizedDisplayName("MC_ProfileKey")]
        public string profile_key { get; set; }

        [JsonProperty(PropertyName = "profile_created_on")]
        [LocalizedDisplayName("MC_ProfileCreatedOn")]
        public string profile_created_on { get; set; }

        [JsonProperty(PropertyName = "modelserver_authorization")]
        [LocalizedDisplayName("MC_ModelserverAuthorization")]
        public ModelServerAuthorizationViewModel modelserver_authorization { get; set; }

        [JsonProperty(PropertyName = "privileges")]
        [LocalizedDisplayName("MC_Privileges")]
        public PrivilegesForModelViewModel privileges { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "roles")]
        [LocalizedDisplayName("MC_Roles")]
        public IList<string> roles { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "label_authorizations")]
        [LocalizedDisplayName("MC_LabelAuthorizations")]
        public Dictionary<string, string> label_authorizations { get; set; }

        [JsonProperty(PropertyName = "default_label_authorization")]
        [LocalizedDisplayName("MC_ModelAuthorization")]
        public string DefaultLabelAuthorization { get; set; }

        [JsonProperty(PropertyName = "default_class_authorization")]
        [LocalizedDisplayName("MC_DefaultClassAuthorization")]
        public bool? DefaultClassAuthorization { get; set; }
    }

    public class ModelServerAuthorizationViewModel
    {
        [JsonProperty(PropertyName = "allowed_classes")]
        [LocalizedDisplayName("MC_AllowedClasses")]
        public List<string> allowed_classes { get; set; }

        [JsonProperty(PropertyName = "disallowed_classes")]
        [LocalizedDisplayName("MC_DisallowedClasses")]
        public List<string> disallowed_classes { get; set; }

        [JsonProperty(PropertyName = "object_filters")]
        [LocalizedDisplayName("MC_ObjectFilters")]
        public List<ObjectFilterViewModel> ObjectFilter { get; set; }

        [JsonProperty(PropertyName = "field_authorizations")]
        [LocalizedDisplayName("MC_FieldAuthorizations")]
        public List<FieldAuthorizationViewModel> FieldAuthorizations { get; set; }
    }
}
