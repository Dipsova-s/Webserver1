using Newtonsoft.Json;

namespace EveryAngle.Core.ViewModels.Model
{
    public class ComponentLogViewModel
    {
        [JsonProperty(PropertyName = "file")]
        public string file { get; set; }

        [JsonProperty(PropertyName = "size")]
        public long size { get; set; }

        [JsonProperty(PropertyName = "modified")]
        public long modified { get; set; }

        [JsonProperty(PropertyName = "uri")]
        public string uri { get; set; }

        [JsonProperty(PropertyName = "warning_count")]
        public int? warning_count { get; set; }

        [JsonProperty(PropertyName = "error_count")]
        public int? error_count { get; set; }
    }
}
