using Newtonsoft.Json;

namespace EveryAngle.Core.ViewModels
{
    public class RegistrationStatus
    {
        [JsonProperty(PropertyName = "available")]
        public bool? Available { get; set; }
        
        [JsonProperty(PropertyName = "last_event")]
        public string LastEvent { get; set; }
        
        [JsonProperty(PropertyName = "timestamp")]
        public long? Timestamp { get; set; }
    }
}