using EveryAngle.WebClient.Domain.Enums;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EveryAngle.Core.ViewModels.ModelServer
{
    public class ExtractorViewModel
    {
        [JsonProperty(PropertyName = "id")]
        public virtual string id { get; set; }

        [JsonProperty(PropertyName = "application_type")]
        public virtual string application_type { get; set; }

        [JsonProperty(PropertyName = "api_version")]
        public virtual string api_version { get; set; }

        [JsonProperty(PropertyName = "application_version")]
        public virtual string application_version { get; set; }

        [JsonProperty(PropertyName = "model_id")]
        public virtual string model_id { get; set; }

        [JsonProperty(PropertyName = "status")]
        public virtual string status { get; set; }
        public ModelServerStatus Status
        {
            get
            {
                ModelServerStatus modelServerStatus;
                Enum.TryParse(status, true, out modelServerStatus);
                return modelServerStatus;
            }
        }

        [JsonProperty(PropertyName = "status_timestamp")]
        public virtual long status_timestamp { get; set; }

        [JsonProperty(PropertyName = "instance_created")]
        public virtual long instance_created { get; set; }

        [JsonProperty(PropertyName = "error_count")]
        public int error_count { get; set; }

        [JsonProperty(PropertyName = "warning_count")]
        public int warning_count { get; set; }

        [JsonProperty(PropertyName = "ip_addresses")]
        public virtual List<string> ip_addresses { get; set; }

        [JsonProperty(PropertyName = "run_id")]
        public virtual string run_id { get; set; }

        [JsonProperty(PropertyName = "run_result")]
        public virtual string run_result { get; set; }

        [JsonProperty(PropertyName = "modeldefinition_id")]
        public virtual string modeldefinition_id { get; set; }

        [JsonProperty(PropertyName = "task_details")]
        public TaskDetailsViewModel task_details { get; set; }

        public bool IsBusy
        {
            get
            {
                bool isBusy = false;
                if (task_details != null)
                {
                    isBusy = task_details.extracting_tables.summary.busy > 0;
                }
                return isBusy;
            }
        }
    }

    public class TaskDetailsViewModel
    {
        [JsonProperty(PropertyName = "action_list")]
        public TaskDescriptionViewModel action_list { get; set; }

        [JsonProperty(PropertyName = "current_action")]
        public TaskDescriptionViewModel current_action { get; set; }

        [JsonProperty(PropertyName = "extracting_tables")]
        public TaskTableViewModel extracting_tables { get; set; }

        [JsonProperty(PropertyName = "copying_tables")]
        public TaskTableViewModel copying_tables { get; set; }

        [JsonProperty(PropertyName = "indexing_tables")]
        public TaskTableViewModel indexing_tables { get; set; }

        [JsonProperty(PropertyName = "running_external_apps")]
        public TaskTableViewModel running_external_apps { get; set; }
    }

    public class TaskDescriptionViewModel
    {
        [JsonProperty(PropertyName = "id")]
        public virtual string id { get; set; }

        [JsonProperty(PropertyName = "description")]
        public virtual string description { get; set; }
    }

    public class TaskTableViewModel
    {
        [JsonProperty(PropertyName = "progress")]
        public virtual string progress { get; set; }

        [JsonProperty(PropertyName = "summary")]
        public TaskTableSummaryViewModel summary { get; set; }

        [JsonProperty(PropertyName = "tables")]
        public List<string> tables { get; set; }

        [JsonProperty(PropertyName = "apps")]
        public List<TaskDescriptionViewModel> apps { get; set; }

        public string RePlaceTables
        {
            get
            {
                if (tables != null)
                {
                    return string.Join(", ", tables);
                }
                return string.Empty;
            }
        }

        public string RePlaceApps
        {
            get
            {
                if (apps != null)
                {
                    return string.Join(", ", apps.Select(item => item.id).ToList());
                }
                return string.Empty;
            }
        }
    }

    public class TaskTableSummaryViewModel
    {
        [JsonProperty(PropertyName = "total")]
        public int total { get; set; }

        [JsonProperty(PropertyName = "busy")]
        public int busy { get; set; }

        [JsonProperty(PropertyName = "remaining")]
        public int remaining { get; set; }

        [JsonProperty(PropertyName = "done")]
        public int done { get; set; }
    }
}
