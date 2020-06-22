using Newtonsoft.Json;

namespace EveryAngle.Core.ViewModels.Model
{
    public class FileTemplatesViewModel
    {
        [JsonProperty(PropertyName = "file")]
        public string File { get; set; }

        [JsonProperty(PropertyName = "size")]
        public long Size { get; set; }

        [JsonProperty(PropertyName = "modified")]
        public long Modified { get; set; }

        [JsonProperty(PropertyName = "uri")]
        public string Uri { get; set; }

        [JsonProperty(PropertyName = "is_default_file")]
        public bool Is_default_file { get; set; }
        
    }
}
