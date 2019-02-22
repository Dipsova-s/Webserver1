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
    public class DataStoresViewModel
    {
        [JsonProperty(PropertyName = "datastore_plugin")]
        public virtual string datastore_plugin { get; set; }

        public string plugin_name { get; set; }

        [JsonProperty(PropertyName = "id")]
        public virtual string id { get; set; }

        [JsonProperty(PropertyName = "name")]
        public virtual string name { get; set; }

        private Uri settings;
        [JsonProperty(PropertyName = "settings")]
        public virtual Uri SettingsUri
        {
            get { return settings; }
            set
            {
                settings = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        [JsonProperty(PropertyName = "allow_write")]
        public virtual bool? allow_write { get; set; }

        [JsonProperty(PropertyName = "supports_write")]
        public virtual bool supports_write { get; set; }

        [JsonProperty(PropertyName = "supports_append")]
        public virtual bool? supports_append { get; set; }

        [JsonProperty(PropertyName = "is_default")]
        public virtual bool is_default { get; set; }

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

        [JsonProperty(PropertyName = "connection_settings")]
        public virtual ModelServerSettings connection_settings { get; set; }

        [JsonProperty(PropertyName = "data_settings")]
        public virtual ModelServerSettings data_settings { get; set; }

        [JsonProperty(PropertyName = "is_file_based")]
        public virtual bool? is_file_based { get; set; }
    }
}
