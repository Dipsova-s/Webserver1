using Newtonsoft.Json;
using System;

namespace EveryAngle.Core.ViewModels
{
    [Serializable]
    public class HeaderViewModel
    {
        [JsonProperty(PropertyName = "total")]
        public int Total { get; set; }

        [JsonProperty(PropertyName = "page")]
        public int Page { get; set; }

        [JsonProperty(PropertyName = "pagesize")]
        public int PageSize { get; set; }

        [JsonProperty(PropertyName = "next")]
        public string Next { get; set; }

        [JsonProperty(PropertyName = "previous")]
        public string Previous { get; set; }

        [JsonProperty(PropertyName = "offset")]
        public string offset { get; set; }

        [JsonProperty(PropertyName = "limit")]
        public string limit { get; set; }

        [JsonProperty(PropertyName = "total_is_truncated_by_size_limit")]
        public bool Total_is_truncated_by_size_limit { get; set; }
    }
}
