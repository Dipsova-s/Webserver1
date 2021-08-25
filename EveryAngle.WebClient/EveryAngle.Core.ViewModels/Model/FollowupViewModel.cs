using EveryAngle.Shared.Helpers;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel;

namespace EveryAngle.Core.ViewModels.Model
{
    [Serializable]
    public class FollowupViewModel: BaseViewModel
    {
        [JsonProperty(PropertyName = "resulting_classes")]
        public List<string> resulting_classes { get; set; }

        [JsonProperty(PropertyName = "category")]
        public string category { get; set; }

        [JsonProperty(PropertyName = "helpid")]
        public string helpid { get; set; }
    }
}
