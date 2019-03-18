using EveryAngle.Shared.Helpers;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EveryAngle.Core.ViewModels.Model
{
    public class ActionListViewModel
    {
        [JsonProperty(PropertyName = "id")]
        public string id { get; set; }

        [JsonProperty(PropertyName = "name")]
        public string name { get; set; }

        [JsonProperty(PropertyName = "description")]
        public string description { get; set; }

        [JsonProperty(PropertyName = "actions")]
        public List<string> actions { get; set; }

        public string ActionItems
        {
            get
            {
                return actions != null ? string.Join(", ", actions) : string.Empty;
            }
        }
    }
}
