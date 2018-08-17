using EveryAngle.Core.ViewModels.Users;
using EveryAngle.Shared.Helpers;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace EveryAngle.Core.ViewModels.Cycle
{
    public class TaskViewModel : ICloneable
    {
        public TaskAction RefreshCycleAction
        {
            get
            {
                return actions.Where(filter => filter.action_type == "refresh_model" || filter.action_type == "EATest" || filter.action_type == "export_angle_to_datastore").FirstOrDefault();
            }
        }

        public string Model
        {
            get
            {
                return Convert.ToString(GetDataFromArgument("model"));
            }
        }

        public bool Delta
        {
            get
            {
                return GetDataFromBooleanArgument("delta");
            }
        }

        public bool ChangedTablesOnly
        {
            get
            {
                return GetDataFromBooleanArgument("new_and_changed_tables_only");
            }
        }

        public string ActionList
        {
            get
            {
                return Convert.ToString(GetDataFromArgument("action_list"));
            }
        }

        public string Angle_Id
        {
            get
            {
                return Convert.ToString(GetDataFromArgument("angle_id"));
            }
        }

        public string Datastore
        {
            get
            {
                return Convert.ToString(GetDataFromArgument("datastore"));
            }
        }

        public string ConditionMinimumRows
        {
            get
            {
                return Convert.ToString(GetDataFromArgument("condition_minimum_rows"));
            }
        }

        public string ConditionMaximumRows
        {
            get
            {
                return Convert.ToString(GetDataFromArgument("condition_maximum_rows"));
            }
        }

        private object GetDataFromArgument(string nameArgument)
        {
            object value = null;
            List<Argument> arguments = actions.SelectMany(filter => filter.arguments).ToList();
            if (arguments != null && arguments.Count() > 0)
            {
                Argument arg = arguments.FirstOrDefault(filter => filter.name == nameArgument);
                if (arg != null)
                {
                    value = arg.value;
                }
            }
            return value;
        }

        private bool GetDataFromBooleanArgument(string nameArgument)
        {
            object value = GetDataFromArgument(nameArgument);

            if (value == null)
                return false;

            switch (value.ToString().ToLowerInvariant())
            {
                case "t":
                case "true":
                case "1":
                    return true;
                default:
                    return false;
            }
        }

        [JsonProperty(PropertyName = "actions")]
        public List<TaskAction> actions { get; set; }

        [JsonProperty(PropertyName = "action_count")]
        public int action_count { get; set; }

        public string run_as_user { get; set; }

        [JsonProperty(PropertyName = "triggers")]
        public List<TriggerViewModel> Triggers { get; set; }

        public TriggerViewModel RefreshCycleTrigger
        {
            get
            {
                if (Triggers != null)
                {
                    return Triggers.FirstOrDefault(filter => filter.trigger_type == "schedule");
                }
                else
                {
                    return null;
                }
            }
        }

        [JsonProperty(PropertyName = "description")]
        public string description { get; set; }

        private Uri history;
        [JsonProperty(PropertyName = "history")]
        public virtual Uri History
        {
            get { return history; }
            set
            {
                history = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

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

        private Uri actions_uri;
        [JsonProperty(PropertyName = "actions_uri")]
        public virtual Uri ActionsUri
        {
            get { return actions_uri; }
            set
            {
                actions_uri = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        [JsonProperty(PropertyName = "id")]
        public string id { get; set; }

        [JsonProperty(PropertyName = "last_run_result")]
        public string last_run_result { get; set; }

        [JsonProperty(PropertyName = "last_run_time")]
        public long? last_run_time { get; set; }

        [JsonProperty(PropertyName = "next_run_time")]
        public long? next_run_time { get; set; }

        [JsonProperty(PropertyName = "name")]
        public string name { get; set; }

        [JsonProperty(PropertyName = "delete_after_completion")]
        public bool delete_after_completion { get; set; }

        [JsonProperty(PropertyName = "status")]
        public string status { get; set; }

        [JsonProperty(PropertyName = "enabled")]
        public bool enabled { get; set; }

        [JsonProperty(PropertyName = "created")]
        [DataMember]
        public UserDateViewModel created { get; set; }

        [JsonProperty(PropertyName = "changed")]
        [DataMember]
        public UserDateViewModel changed { get; set; }

        [JsonProperty(PropertyName = "max_run_time")]
        public int? max_run_time { get; set; }

        public object Clone()
        {
            return this.MemberwiseClone();
        }

        [JsonProperty(PropertyName = "start_immediately")]
        public bool? start_immediately { get; set; }

        public string SpecifyTables
        {
            get
            {
                var parameter = GetDataFromArgument("parameters");
                return (parameter != null) ? parameter.ToString() : string.Empty;
            }
        }
    }

    public class TriggerViewModel
    {

        [JsonProperty(PropertyName = "days")]
        public List<DaysList> days { get; set; }

        [JsonProperty(PropertyName = "trigger_type")]
        public string trigger_type { get; set; }

        [JsonProperty(PropertyName = "continuous")]
        public bool continuous { get; set; }

        [JsonProperty(PropertyName = "frequency")]
        public string frequency { get; set; }

        [JsonProperty(PropertyName = "start_time")]
        public int? start_time { get; set; }

        [JsonProperty(PropertyName = "restart_delay")]
        public int? restart_delay { get; set; }

        [JsonProperty(PropertyName = "end_time")]
        public int? end_time { get; set; }

        [JsonProperty(PropertyName = "event")]
        public string task_event { get; set; }

        [JsonProperty(PropertyName = "arguments")]
        public List<Argument> arguments { get; set; }

        private Uri triggerUri;
        [JsonProperty(PropertyName = "trigger_uri")]
        public virtual Uri TriggerUri
        {
            get
			{
				return triggerUri;
			}
            set
            {
                triggerUri = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }


        [JsonProperty(PropertyName = "token")]
        public string token { get; set; }

    }

    public class DaysList
    {
        [JsonProperty(PropertyName = "day")]
        public int day { get; set; }

        [JsonProperty(PropertyName = "active")]
        public bool active { get; set; }
    }

    public class TaskAction
    {
        [JsonProperty(PropertyName = "action_type")]
        public string action_type { get; set; }

        [JsonProperty(PropertyName = "arguments")]
        public List<Argument> arguments { get; set; }

        [JsonProperty(PropertyName = "run_as_user")]
        public string run_as_user { get; set; }

        [JsonProperty(PropertyName = "approval_state")]
        public string approval_state { get; set; }

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

        [JsonProperty(PropertyName = "order")]
        public int order { get; set; }

        [JsonProperty(PropertyName = "notification")]
        public Notification notification { get; set; }

        public string AngleName { get; set; }

        public string DisplayName { get; set; }

        public string Angle { get; set; }

    }

    public class Notification
    {
        [JsonProperty(PropertyName = "notification_type")]
        public string notification_type { get; set; }

        [JsonProperty(PropertyName = "subject")]
        public string subject { get; set; }

        [JsonProperty(PropertyName = "body")]
        public string body { get; set; }

        [JsonProperty(PropertyName = "recipients")]
        public List<Recipients> recipients { get; set; }

        [JsonProperty(PropertyName = "attach_result")]
        public bool? attach_result { get; set; }

    }

    public class Argument
    {
        [JsonProperty(PropertyName = "name")]
        public string name { get; set; }

        [JsonProperty(PropertyName = "value")]
        public dynamic value { get; set; }
    }

    public class Recipients
    {
        [JsonProperty(PropertyName = "email_address")]
        public string email_address { get; set; }

        [JsonProperty(PropertyName = "result")]
        public bool result { get; set; }

        [JsonProperty(PropertyName = "success")]
        public bool success { get; set; }

        [JsonProperty(PropertyName = "failed")]
        public bool failed { get; set; }
    }
}
