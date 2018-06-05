using EveryAngle.Shared.Helpers;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;

namespace EveryAngle.Core.ViewModels.BusinessProcesses
{
    public class BusinessProcessViewModel : ICloneable
    {
        public virtual string id { get; set; }

        public virtual string name { get; set; }

        public virtual string abbreviation { get; set; }

        public virtual int order { get; set; }

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

        public virtual List<MultilingualBusinessProcesses> multi_lang_name { get; set; }

        public virtual bool enabled { get; set; }

        public object Clone()
        {
            return this.MemberwiseClone();
        }
    }

    public class MultilingualBusinessProcesses
    {
        public virtual string lang { get; set; }
        public virtual string text { get; set; }
    }
}
