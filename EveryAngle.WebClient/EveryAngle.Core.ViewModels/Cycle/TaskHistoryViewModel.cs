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
    public class TaskHistoryViewModel
    {
        [JsonProperty(PropertyName = "id")]
        public string id { get; set; }

        [JsonProperty(PropertyName = "task_id")]
        public string task_id { get; set; }

        [JsonProperty(PropertyName = "task_name")]
        public string task_name { get; set; }

        [JsonProperty(PropertyName = "timestamp")]
        public long timestamp { get; set; }

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

        private Uri action_list;
        [JsonProperty(PropertyName = "action_list")]
        public virtual Uri ActionListUri 
        {
            get { return action_list; }
            set
            {
                action_list = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        [JsonProperty(PropertyName = "delta")]
        public bool delta { get; set; }

        [JsonProperty(PropertyName = "parameters")]
        public string parameters { get; set; }

        [JsonProperty(PropertyName = "type")]
        public string type { get; set; }

        [JsonProperty(PropertyName = "manual")]
        public bool manual { get; set; }

        private Uri scheduled_task;
        [JsonProperty(PropertyName = "scheduled_task")]
        public virtual Uri ScheduledTask
        {
            get { return scheduled_task; }
            set
            {
                scheduled_task = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        [JsonProperty(PropertyName = "start_time")]
        public long start_time { get; set; }

        [JsonProperty(PropertyName = "end_time")]
        public long end_time { get; set; }

        [JsonProperty(PropertyName = "start_user")]
        [DataMember]
        public UserDateViewModel StartBy { get; set; }

        [JsonProperty(PropertyName = "stop_user")]
        [DataMember]
        public UserDateViewModel StopBy { get; set; }

        private Uri snapshot;
        [JsonProperty(PropertyName = "snapshot")]
        public virtual Uri SnapShotUri
        {
            get { return snapshot; }
            set
            {
                snapshot = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        [JsonProperty(PropertyName = "error_count")]
        public int error_count { get; set; }

        [JsonProperty(PropertyName = "warning_count")]
        public int warning_count { get; set; }

        [JsonProperty(PropertyName = "result")]
        public string result { get; set; }

        [JsonProperty(PropertyName = "correlation_id")]
        public string correlation_id { get; set; }

        [JsonProperty(PropertyName = "level")]
        public string level { get; set; }

        [JsonProperty(PropertyName = "category")]
        public string category { get; set; }

        [JsonProperty(PropertyName = "category_description")]
        public string category_description { get; set; }

        [JsonProperty(PropertyName = "details")]
        public string details { get; set; }

        [JsonProperty(PropertyName = "report")]
        public string report { get; set; }

        [JsonProperty(PropertyName = "tables")]
        public List<TablesViewModel> tables { get; set; }

        [JsonProperty(PropertyName = "action")]
        public string action { get; set; }

        [JsonProperty(PropertyName = "arguments")]
        public List<ArgumentsViewModel> arguments { get; set; }
    }

    public class ArgumentsViewModel
    {
        [JsonProperty(PropertyName = "name")]
        public string name { get; set; }

        [JsonProperty(PropertyName = "value")]
        public object value { get; set; }
    }

    public class TablesViewModel
    {
        [JsonProperty(PropertyName = "name")]
        public string name { get; set; }

        [JsonProperty(PropertyName = "title")]
        public string title { get; set; }

        [JsonProperty(PropertyName = "fields")]
        public List<FieldsViewModel> fields { get; set; }

        [JsonProperty(PropertyName = "rows")]
        public List<RowsViewModel> rows { get; set; }
    }

    public class FieldsViewModel
    {
        [JsonProperty(PropertyName = "name")]
        public string name { get; set; }

        [JsonProperty(PropertyName = "title")]
        public string title { get; set; }

        [JsonProperty(PropertyName = "type")]
        public string type { get; set; }
    }

    public class RowsViewModel
    {
        [JsonProperty(PropertyName = "row_id")]
        public string row_id { get; set; }

        [JsonProperty(PropertyName = "field_values")]
        public List<string> field_values { get; set; }
    }
}
