using EveryAngle.Shared.Helpers;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;

namespace EveryAngle.Core.ViewModels.Item
{
    public class ItemViewModel
    {
        public string id { get; set; }
        public string name { get; set; }
        public string type { get; set; }
        public string uri { get; set; }
        private Uri model;
        [JsonProperty(PropertyName = "model")]
        public Uri Model
        {
            get { return model; }
            set
            {
                model = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }
        public IList<ItemDisplayViewModel> displays { get; set; }

    }

    public class ItemDisplayViewModel
    {
        public string id { get; set; }
        public string name { get; set; }
        public string display_type { get; set; }
        public string uri { get; set; }
    }
}
