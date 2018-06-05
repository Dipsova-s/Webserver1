using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EveryAngle.Core.ViewModels.Model
{
    public class AgentModelInfoViewModel
    {
        [JsonProperty(PropertyName = "id")]
        public string id { get; set; }

        [JsonProperty(PropertyName = "application_type")]
        public string application_type { get; set; }

        [JsonProperty(PropertyName = "name")]
        public string name { get; set; }

        [JsonProperty(PropertyName = "host_name")]
        public string host_name { get; set; }

        [JsonProperty(PropertyName = "uris")]
        public List<string> uris { get; set; }

        [JsonProperty(PropertyName = "is_active")]
        public bool is_active { get; set; }
    }
}
