using EveryAngle.Shared.Helpers;
using Newtonsoft.Json;
using System;

namespace EveryAngle.Core.ViewModels.FieldCategory
{
    public class FieldCategoryViewModel
    {
        public virtual string id { get; set; }

        private Uri Uri;
        [JsonProperty(PropertyName = "uri")]
        public virtual Uri uri
        {
            get { return Uri; }
            set
            {
                Uri = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        public virtual string short_name { get; set; }

        public virtual string long_name { get; set; }
    }
}
