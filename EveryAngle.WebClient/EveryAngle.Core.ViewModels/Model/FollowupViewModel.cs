using EveryAngle.Shared.Helpers;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel;

namespace EveryAngle.Core.ViewModels.Model
{
    [Serializable]
    public class FollowupViewModel
    {
        [JsonProperty(PropertyName = "short_name")]
        public string short_name { get; set; }

        [JsonProperty(PropertyName = "long_name")]
        public string long_name { get; set; }

        [JsonProperty(PropertyName = "id")]
        public string id { get; set; }

        private Uri Uri;
        [JsonProperty(PropertyName = "uri")]
        public virtual Uri uri
        {
            get { return Uri; }
            set
            {
                Uri = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        [JsonProperty(PropertyName = "resulting_classes")]
        public List<string> resulting_classes { get; set; }

        [JsonProperty(PropertyName = "category")]
        public string category { get; set; }

        [JsonProperty(PropertyName = "helpid")]
        public string helpid { get; set; }
    }
}
