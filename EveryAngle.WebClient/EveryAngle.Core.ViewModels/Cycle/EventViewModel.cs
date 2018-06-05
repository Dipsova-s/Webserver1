using EveryAngle.Core.ViewModels.Users;
using EveryAngle.Shared.Helpers;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace EveryAngle.Core.ViewModels.Cycle
{
    public class EventViewModel : ICloneable
    {
        [JsonProperty(PropertyName = "id")]
        public string id { get; set; }

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

        [JsonProperty(PropertyName = "name")]
        public string name { get; set; }

        [JsonProperty(PropertyName = "description")]
        public string description { get; set; }

        [JsonProperty(PropertyName = "enabled")]
        public bool enabled { get; set; }

        [JsonProperty(PropertyName = "is_custom")]
        public bool is_custom { get; set; }

        [JsonProperty(PropertyName = "model_specific")]
        public bool model_specific { get; set; }

        [JsonProperty(PropertyName = "created")]
        [DataMember]
        public UserDateViewModel CreatedBy { get; set; }

        [JsonProperty(PropertyName = "changed")]
        [DataMember]
        public UserDateViewModel ChangedBy { get; set; }

        private Uri triggers;
        [JsonProperty(PropertyName = "triggers")]
        public virtual Uri Triggers
        {
            get { return triggers; }
            set
            {
                triggers = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        private Uri tasks;
        [JsonProperty(PropertyName = "tasks")]
        public virtual Uri Tasks
        {
            get { return tasks; }
            set
            {
                tasks = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        public object Clone()
        {
            return this.MemberwiseClone();
        }
    }
}
