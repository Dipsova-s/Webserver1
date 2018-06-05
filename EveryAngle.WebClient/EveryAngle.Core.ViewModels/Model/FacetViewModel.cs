using Newtonsoft.Json;
using System.Collections.Generic;

namespace EveryAngle.Core.ViewModels.Model
{
    public class FacetViewModel
    {
        //    "id": "classes",
        //    "name": "classes",
        //    "type": "metadata",
        //    "filters": [

        [JsonProperty(PropertyName = "id")]
        public string id { get; set; }

        [JsonProperty(PropertyName = "name")]
        public string name { get; set; }

        [JsonProperty(PropertyName = "type")]
        public string type { get; set; }

        [JsonProperty(PropertyName = "filters")]
        public List<FacetFilterViewModel> filters { get; set; }
        public FacetViewModel()
        {
            this.filters = new List<FacetFilterViewModel>();
        }
    }

    public class FacetFilterViewModel
    {
        [JsonProperty(PropertyName = "count")]
        public int count { get; set; }
        [JsonProperty(PropertyName = "id")]
        public string id { get; set; }
        [JsonProperty(PropertyName = "name")]
        public string name { get; set; }
        [JsonProperty(PropertyName = "description")]
        public string description { get; set; }
    }
}
