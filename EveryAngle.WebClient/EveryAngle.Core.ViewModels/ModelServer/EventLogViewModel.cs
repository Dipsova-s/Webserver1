using EveryAngle.Shared.Helpers;
using EveryAngle.Utilities;
using Newtonsoft.Json;
using System;

namespace EveryAngle.Core.ViewModels.ModelServer
{
    public class EventLogViewModel
    {
        [JsonProperty(PropertyName = "status_timestamp")]
        public long timestamp { get; set; }

        [JsonProperty(ItemConverterType = typeof(UnixDateTimeConverter))]
        public DateTime? timeStampDate
        {
            get
            {
                if (timestamp != 0)
                {
                    return DateTimeUtils.FromUnixTime(timestamp);
                }
                return null;
            }
        }

        [JsonProperty(PropertyName = "status")]
        public string status { get; set; }

        [JsonProperty(PropertyName = "api_version")]
        public string version { get; set; }

        [JsonProperty(PropertyName = "size")]
        public string size { get; set; }

        [JsonProperty(PropertyName = "error_count")]
        public string error_count { get; set; }

        public string model_server_id { get; set; }

        private Uri uri;
        [JsonProperty(PropertyName = "instance")]
        public Uri Uri
        {
            get { return uri; }
            set
            {
                uri = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        [JsonProperty(PropertyName = "is_postprocessing")]
        public bool? IsProcessing { get; set; } 
    }
}
