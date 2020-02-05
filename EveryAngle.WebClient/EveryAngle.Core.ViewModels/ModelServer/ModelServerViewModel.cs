using EveryAngle.Shared.Globalization;
using EveryAngle.Shared.Helpers;
using EveryAngle.WebClient.Domain.Enums;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;

namespace EveryAngle.Core.ViewModels.ModelServer
{
    public class ModelServerViewModel
    {
        public virtual string id { get; set; }

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


        private Uri _model;
        public virtual Uri model
        {
            get { return _model; }
            set
            {
                _model = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        private Uri _info;
        public virtual Uri info
        {
            get { return _info; }
            set
            {
                _info = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        public virtual string type { get; set; }

        public ModelAgentType Type
        {
            get
            {
                ModelAgentType agentType;
                Enum.TryParse(type, true, out agentType);
                return agentType;
            }
        }

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

        public string modelId { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public JObject task_details { get; set; }

        [LocalizedDisplayName("MC_InstanceId")]
        public string instance_id { get; set; }

        public string license_id { get; set; }

        [LocalizedDisplayName("MC_InstanceStatus")]
        public string instance_status { get; set; }

        [JsonProperty(PropertyName = "application_version")]
        [LocalizedDisplayName("MC_ServerVersion")]
        public string application_version { get; set; }

        [JsonProperty(PropertyName = "status_timestamp")]
        [LocalizedDisplayName("MC_StatusSince")]
        public virtual long timestamp { get; set; }

        public virtual string api_version { get; set; }

        [JsonProperty(PropertyName = "size")]
        [LocalizedDisplayName("MC_ModelSize")]
        public virtual string size { get; set; }

        public string FormattedSize
        {
            get
            {
                if (!string.IsNullOrEmpty(size))
                {
                    double gbSize = UtilitiesHelper.ConvertBytesToGigabytes(Convert.ToDouble(size));
                    return string.Format("{0:#,##0.##} GB", gbSize);
                }
                return string.Empty;
            }
        }

        public bool SupportModelSize
        {
            get
            {
                return IsModelServer;
            }
        }

        public virtual string error_count { get; set; }

        public virtual string warning_count { get; set; }

        [LocalizedDisplayName("MC_Url")]
        public virtual string server_uri { get; set; }

        private Uri _instance;
        public virtual Uri instance
        {
            get { return _instance; }
            set
            {
                _instance = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        private Uri _event_log;
        public virtual Uri event_log
        {
            get { return _event_log; }
            set
            {
                _event_log = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        [JsonProperty(PropertyName = "modeldata_timestamp", NullValueHandling = NullValueHandling.Ignore)]
        public virtual long modeldata_timestamp { get; set; }

        public bool SupportModelDate
        {
            get
            {
                return Type == ModelAgentType.ModelServer;
            }
        }

        [JsonProperty(PropertyName = "metadata_available")]
        public bool metadata_available { get; set; }

        [JsonProperty(PropertyName = "metadata")]
        public string metadata { get; set; }

        [JsonProperty(PropertyName = "queryable")]
        public bool queryable { get; set; }

        [JsonProperty(PropertyName = "run_id")]
        public string run_id { get; set; }

        [JsonProperty(PropertyName = "run_result")]
        public string run_result { get; set; }

        public string ModelServerId { get; set; }

        public bool IsActiveServer { get; set; }

        public bool IsCurrentInstance { get; set; }

        public long currentInstanceTime { get; set; }

        public int ErrorWarningNumber { get; set; }

        public bool? available { get; set; }

        private Uri _reports;
        public virtual Uri reports
        {
            get { return _reports; }
            set
            {
                _reports = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        private bool? _isPostprocessing;
        [JsonProperty(PropertyName = "is_postprocessing")]
        public bool? IsProcessing
        {
            get
            {
                return _isPostprocessing ?? IsCaching && Status == ModelServerStatus.Up;
            }
            set
            {
                _isPostprocessing = value;
            }
        }

        [JsonProperty(PropertyName = "is_caching")]
        public bool IsCaching { get; set; }

        [JsonProperty(PropertyName = "model_definition_version")]
        public string model_definition_version { get; set; }

        public string ModelServerName
        {
            get
            {
                if (IsModelServer)
                    return Resource.MC_ModelServer;
                if (Type == ModelAgentType.Extractor)
                    return Resource.MC_EAXtractor;
                return type;
            }

        }

        public bool IsModelServer
        {
            get
            {
                return Type == ModelAgentType.ModelServer;
            }
        }

        public bool IsHanaServer
        {
            get
            {
                return Type == ModelAgentType.HanaServer;
            }
        }

        public bool IsPrimaryType
        {
            get
            {
                return IsModelServer || IsHanaServer;
            }
        }
    }
}
