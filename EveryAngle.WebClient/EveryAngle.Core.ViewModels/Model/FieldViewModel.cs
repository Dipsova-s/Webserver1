using EveryAngle.Shared.Helpers;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel;

namespace EveryAngle.Core.ViewModels.Model
{
    public class FieldViewModel
    {
        [JsonProperty(PropertyName = "fields")]
        public List<Field> fields { get; set; }

        [JsonProperty(PropertyName = "facets")]
        public List<FacetViewModel> facets { get; set; }

        [JsonProperty(PropertyName = "sort_options")]
        public List<Option> sort_options { get; set; }

        [JsonProperty(PropertyName = "header")]
        public Header header { get; set; }
    }

    public class Header
    {
        [JsonProperty(PropertyName = "total")]
        public int total { get; set; }

        [JsonProperty(PropertyName = "page")]
        public int page { get; set; }

        [JsonProperty(PropertyName = "pagesize")]
        public int pagesize { get; set; }
    }

    public class Field
    {

        [JsonProperty(PropertyName = "id")]
        public string id { get; set; }

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

        [JsonProperty(PropertyName = "short_name")]
        public string short_name { get; set; }

        [JsonProperty(PropertyName = "long_name")]
        public string long_name { get; set; }

        private Uri Source;
        [JsonProperty(PropertyName = "source")]
        public virtual Uri source
        {
            get { return Source; }
            set
            {
                if (value == null)
                {
                    Source = null;
                }
                else
                {
                    Source = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
                }
            }
        }

        [JsonProperty(PropertyName = "fieldtype")]
        public string fieldtype { get; set; }


        private Uri Domain;
        [JsonProperty(PropertyName = "domain")]
        public virtual Uri domain
        {
            get { return Domain; }
            set
            {
                Domain = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        private Uri CategoryUri;
        [JsonProperty(PropertyName = "category")]
        public virtual Uri category
        {
            get { return CategoryUri; }
            set
            {
                CategoryUri = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        [JsonProperty(PropertyName = "user_specific")]
        public UserSpecific user_specific { get; set; }

        [JsonProperty(PropertyName = "is_suggested")]
        public bool is_suggested { get; set; }

        [JsonProperty(PropertyName = "helpid")]
        public string helpid { get; set; }

        [JsonProperty(PropertyName = "helptext")]
        public string helptext { get; set; }

        [JsonProperty(PropertyName = "technical_info")]
        public string technical_info { get; set; }
    }

    public class Option
    {
        [JsonProperty(PropertyName = "id")]
        public string id { get; set; }

        [JsonProperty(PropertyName = "name")]
        public string name { get; set; }


        [DefaultValue(null)]
        [JsonProperty(PropertyName = "default", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? Default { get; set; }
    }

    public class UserSpecific
    {
        [JsonProperty(PropertyName = "is_starred")]
        public bool is_starred { get; set; }
    }
}

public class HelpTextsViewModel
{
    [JsonProperty(PropertyName = "id")]
    public string id { get; set; }

    [JsonProperty(PropertyName = "short_name")]
    public string short_name { get; set; }

    [JsonProperty(PropertyName = "long_name")]
    public string long_name { get; set; }

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

    [JsonProperty(PropertyName = "html_help")]
    public string html_help { get; set; }
}

public class SuggestedViewModel
{
    [JsonProperty(PropertyName = "id")]
    public string id { get; set; }

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

    [JsonProperty(PropertyName = "model")]
    public string model { get; set; }

    [JsonProperty(PropertyName = "is_suggested")]
    public bool is_suggested { get; set; }

    [JsonProperty(PropertyName = "status")]
    public string status { get; set; }

    [JsonProperty(PropertyName = "progress")]
    public string progress { get; set; }

    [JsonProperty(PropertyName = "message")]
    public string message { get; set; }

    [JsonProperty(PropertyName = "mass_change_type")]
    public string mass_change_type { get; set; }
}

public class SuggestedFieldsSummaryViewModel
{
    [JsonProperty(PropertyName = "suggested_fields")]
    public string suggested_fields { get; set; }

    [JsonProperty(PropertyName = "classes_with_suggested_fields")]
    public string classes_with_suggested_fields { get; set; }

    [JsonProperty(PropertyName = "classes_without_suggested_fields")]
    public string classes_without_suggested_fields { get; set; }

    public string suggested_fields_last_change { get; set; }

    public long? suggested_fields_timestamp { get; set; }
}
