using EveryAngle.Shared.Helpers;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;

namespace EveryAngle.Core.ViewModels.Model
{
    public class FieldDomainViewModel
    {
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

        [JsonProperty(PropertyName = "short_name")]
        public string short_name { get; set; }

        [JsonProperty(PropertyName = "long_name")]
        public string long_name { get; set; }

        [JsonProperty(PropertyName = "element_count")]
        public int element_count { get; set; }

        [JsonProperty(PropertyName = "elements")]
        public List<ElementsViewModel> elements { get; set; }

        [JsonProperty(PropertyName = "may_be_sorted")]
        public bool? may_be_sorted { get; set; }
    }

    public class ElementsViewModel
    {
        [JsonProperty(PropertyName = "id")]
        public string id { get; set; }

        [JsonProperty(PropertyName = "short_name")]
        public string short_name { get; set; }

        [JsonProperty(PropertyName = "long_name")]
        public string long_name { get; set; }

        [JsonProperty(PropertyName = "pattern")]
        public string pattern { get; set; }

        [JsonProperty(PropertyName = "color")]
        public string color { get; set; }
    }
}
