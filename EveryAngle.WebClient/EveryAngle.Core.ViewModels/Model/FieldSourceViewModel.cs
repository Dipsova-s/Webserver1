using EveryAngle.Shared.Helpers;
using Newtonsoft.Json;
using System;

namespace EveryAngle.Core.ViewModels.Model
{
    [Serializable]
    public class FieldSourceViewModel: BaseViewModel
    {
        [JsonProperty(PropertyName = "class_uri")]
        public string class_uri { get; set; }
    }
}
