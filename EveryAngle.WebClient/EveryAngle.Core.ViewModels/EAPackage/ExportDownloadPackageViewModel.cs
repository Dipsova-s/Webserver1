using Newtonsoft.Json;

namespace EveryAngle.Core.ViewModels.EAPackage
{
    public class ExportDownloadPackageViewModel
    {
        [JsonProperty("progress")]
        public float Progress { get; set; }
        [JsonProperty("status")]
        public string Status { get; set; }
        [JsonProperty("uri")]
        public string ItemUrl { get; set; }
        [JsonProperty("file")]
        public string FileUrl { get; set; }
    }
}
