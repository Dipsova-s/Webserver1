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
        public string name { get; set; }

        [JsonProperty(PropertyName = "description")]
        public string description { get; set; }

        [JsonProperty(PropertyName = "has_parameters")]
        public bool has_parameters { get; set; }

        [JsonProperty(PropertyName = "actions")]
        public List<string> actions { get; set; }

        public string ReForfatActionLists
        {
            get
            {
                if (actions != null)
                {
                    return string.Join(", ", actions);
                }
                return string.Empty;
            }
        }
    }
}
