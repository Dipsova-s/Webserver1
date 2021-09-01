using EveryAngle.Shared.Helpers;
using Newtonsoft.Json;
using System;

namespace EveryAngle.Core.ViewModels.Model
{
    [Serializable]
    public class ClassViewModel: BaseViewModel
    {
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
