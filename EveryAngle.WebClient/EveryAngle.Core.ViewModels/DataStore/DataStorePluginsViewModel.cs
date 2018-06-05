using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Shared.Helpers;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EveryAngle.Core.ViewModels.DataStore
{
    public class DataStorePluginsViewModel
    {
        [JsonProperty(PropertyName = "description")]
        public virtual string description { get; set; }

        [JsonProperty(PropertyName = "id")]
        public virtual string id { get; set; }

        [JsonProperty(PropertyName = "name")]
        public virtual string name { get; set; }
        
        [JsonProperty(PropertyName = "supports_write")]
        public virtual bool supports_write { get; set; }

        [JsonProperty(PropertyName = "supports_append")]
        public virtual bool? supports_append { get; set; }

        private Uri uri;
        [JsonProperty(PropertyName = "uri")]
        public virtual Uri Uri
        {
            get { return uri; }
            set
            {
                uri = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        [JsonProperty(PropertyName = "connection_settings_template")]
        public ModelServerSettings connection_settings_template { get; set; }

        [JsonProperty(PropertyName = "data_settings_template")]
        public ModelServerSettings data_settings_template { get; set; }

        [JsonProperty(PropertyName = "is_file_based")]
        public virtual bool? is_file_based { get; set; }
    }
}
