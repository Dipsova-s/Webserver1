using EveryAngle.Shared.Helpers;
using Newtonsoft.Json;
using System;

namespace EveryAngle.Core.ViewModels.SystemLanguages
{
    [Serializable]
    public class SystemLanguageViewModel : ICloneable
    {

        [JsonProperty(PropertyName = "id")]
        public string Id { get; set; }

        private Uri uri;
        [JsonProperty(PropertyName = "uri")]
        public Uri Uri
        {
            get { return uri; }
            set
            {
                uri = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        [JsonProperty(PropertyName = "name")]
        public string Name { get; set; }

        [JsonProperty(PropertyName = "iso")]
        public string Iso { get; set; }

        [JsonProperty(PropertyName = "enabled")]
        public bool Enabled { get; set; }

        

        public object Clone()
        {
            return this.MemberwiseClone();
        }
    }
}
