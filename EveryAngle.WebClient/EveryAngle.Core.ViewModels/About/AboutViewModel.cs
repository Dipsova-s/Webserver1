using EveryAngle.Shared.Helpers;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Runtime.Serialization;

namespace EveryAngle.Core.ViewModels.About
{
    public class AboutViewModel
    {
        public virtual string web_client_version { get; set; }

        [JsonProperty(PropertyName = "app_server_version")]
        public virtual string app_server_version { get; set; }

        private List<AboutModel> _models = new List<AboutModel>();
        [JsonProperty(PropertyName = "models")]
        public List<AboutModel> models {
            get
            {
                return this._models;
            }
            set
            {
                this._models = value ?? new List<AboutModel>();
            }
        }
    }

    public class AboutModel
    {
        [JsonProperty(PropertyName = "model_id")]
        public virtual string model_id { get; set; }

        [JsonProperty(PropertyName = "version")]
        public virtual string version { get; set; }

        [JsonProperty(PropertyName = "status")]
        public virtual string status { get; set; }

        [JsonProperty(PropertyName = "modeldata_timestamp")]
        public virtual int modeldata_timestamp { get; set; }
    }
}
