using EveryAngle.Shared.Helpers;
using EveryAngle.Utilities;
using Newtonsoft.Json;
using System;

namespace EveryAngle.Core.ViewModels.Model
{
    public class InstanceViewModel
    {
        [JsonProperty(PropertyName = "id")]
        public string id { get; set; }

        [JsonProperty(PropertyName = "active_engine_count")]
        public int active_engine_count { get; set; }

        [JsonProperty(PropertyName = "created", ItemConverterType = typeof(UnixDateTimeConverter))]
        public DateTime created { get; set; }

        [JsonProperty(PropertyName = "last_active", ItemConverterType = typeof(UnixDateTimeConverter))]
        public DateTime last_active { get; set; }

        [JsonProperty(PropertyName = "modeldata_timestamp", NullValueHandling = NullValueHandling.Ignore)]
        public long modeldata_timestamp { get; set; }

        [JsonProperty(PropertyName = "status")]
        public string status { get; set; }

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

        private Uri Model;
        [JsonProperty(PropertyName = "model")]
        public virtual Uri model
        {
            get { return Model; }
            set
            {
                Model = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        private Uri Classes;
        [JsonProperty(PropertyName = "classes")]
        public virtual Uri classes
        {
            get { return Classes; }
            set
            {
                Classes = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        private Uri Fields;
        [JsonProperty(PropertyName = "fields")]
        public virtual Uri fields
        {
            get { return Fields; }
            set
            {
                Fields = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        private Uri FieldDomains;
        [JsonProperty(PropertyName = "fielddomains")]
        public virtual Uri fielddomains
        {
            get { return FieldDomains; }
            set
            {
                FieldDomains = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        private Uri Followups;
        [JsonProperty(PropertyName = "followups")]
        public virtual Uri followups
        {
            get { return Followups; }
            set
            {
                Followups = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        private Uri FieldSources;
        [JsonProperty(PropertyName = "field_sources")]
        public virtual Uri field_sources
        {
            get { return FieldSources; }
            set
            {
                FieldSources = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }
    }
}
