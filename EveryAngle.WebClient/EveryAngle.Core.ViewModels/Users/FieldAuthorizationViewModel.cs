using Newtonsoft.Json;
using System;
using System.Collections.Generic;

namespace EveryAngle.Core.ViewModels.Users
{
    [Serializable]
    public class FieldAuthorizationViewModel
    {
        [JsonProperty(PropertyName = "classes")]
        [LocalizedDisplayName("MC_Classes")]
        public List<string> FieldAuthorizationClasses { get; set; }

        [JsonProperty(PropertyName = "fields_default")]
        [LocalizedDisplayName("MC_FieldsDefault")]
        public string FieldsDefault { get; set; }

        [JsonProperty(PropertyName = "currency_fields_default")]
        [LocalizedDisplayName("MC_CurrencyFieldsDefault")]
        public string CurrencyFieldsDefault { get; set; }

        [JsonProperty(PropertyName = "allowed_fields")]
        [LocalizedDisplayName("MC_AllowedFields")]
        public List<string> AllowedFields { get; set; }

        [JsonProperty(PropertyName = "disallowed_fields")]
        [LocalizedDisplayName("MC_DisallowedFields")]
        public List<string> DisallowedFields { get; set; }
    }
}
