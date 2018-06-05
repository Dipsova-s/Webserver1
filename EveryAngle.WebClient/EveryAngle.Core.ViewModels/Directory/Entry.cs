using EveryAngle.Shared.Helpers;
using Newtonsoft.Json;
using System;

namespace EveryAngle.Core.ViewModels.Directory
{
    public class Entry
    {
        [JsonProperty(PropertyName = "entry")]
        public virtual string Name { get; set; }

        private Uri uri;
        [JsonProperty(PropertyName = "uri")]
        public Uri Uri
        {
            get { return uri; }
            set
            {
                uri = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        public string UriAsString
        {
            get { return Uri != null ? Uri.ToString() : ""; }
        }
    }
}
