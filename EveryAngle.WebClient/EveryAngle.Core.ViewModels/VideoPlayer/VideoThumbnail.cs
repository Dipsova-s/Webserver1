using Newtonsoft.Json;

namespace EveryAngle.Core.ViewModels.VideoPlayer
{
    public class VideoThumbnail
    {
        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string src { get; set; }
    }
}
