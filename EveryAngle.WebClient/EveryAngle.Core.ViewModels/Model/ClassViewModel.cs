using EveryAngle.Shared.Helpers;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel;

namespace EveryAngle.Core.ViewModels.Model
{
      [Serializable]
    public class ClassViewModel
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

        private Uri _main_businessprocess;
        [JsonProperty(PropertyName = "main_businessprocess")]
        public Uri main_businessprocess
        {
            get { return _main_businessprocess; }
            set
            {
                _main_businessprocess = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        [JsonProperty(PropertyName = "helpid")]
        public string helpid { get; set; }

        [JsonProperty(PropertyName = "helptext")]
        public string helptext { get; set; }

        public bool? Allowed { get; set; }
    }
}
