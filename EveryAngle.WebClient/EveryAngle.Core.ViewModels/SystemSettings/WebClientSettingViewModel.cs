using Newtonsoft.Json;
using System.Collections.Generic;

namespace EveryAngle.Core.ViewModels.SystemSettings
{
    public class WebClientSettingViewModel
    {
        [JsonProperty(PropertyName = "introductiontexts")]
        public List<Multilingual> introductiontexts { get; set; }

        [JsonProperty(PropertyName = "newstexts")]
        public List<Multilingual> newstexts { get; set; }

        [JsonProperty(PropertyName = "movielinktitles")]
        public List<Multilingual> movielinktitles { get; set; }

        [JsonProperty(PropertyName = "movielinkurl")]
        public string movielinkurl { get; set; }

        [JsonProperty(PropertyName = "companylogo")]
        public string companylogo { get; set; }

        [JsonProperty(PropertyName = "client_details")]
        public dynamic client_details { get; set; }

        public object Clone()
        {
            return this.MemberwiseClone();
        }
    }

    public class Multilingual
    {
        public string lang { get; set; }
        public string text { get; set; }
    }
}
