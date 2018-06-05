using EveryAngle.Core.ViewModels.Users;
using EveryAngle.Shared.Helpers;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Runtime.Serialization;

namespace EveryAngle.Core.ViewModels.EAPackage
{
    public class PackageViewModel
    {
        [JsonProperty(PropertyName = "active")]
        public bool active { get; set; }

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

        private Uri package_file;
        [JsonProperty(PropertyName = "package_file")]
        public virtual Uri packageFileUri
        {
            get { return package_file; }
            set
            {
                package_file = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        [JsonProperty(PropertyName = "id")]
        public string Id { get; set; }

        [JsonProperty(PropertyName = "correlation_id")]
        public string correlation_id { get; set; }

        [JsonProperty(PropertyName = "name")]
        public string Name { get; set; }

        [JsonProperty(PropertyName = "description")]
        public string Description { get; set; }

        [JsonProperty(PropertyName = "version")]
        public string Version { get; set; }

        [JsonProperty(PropertyName = "status")]
        public string status { get; set; }

        [JsonProperty(PropertyName = "enabled")]
        public bool Enabled { get; set; }

        [JsonProperty(PropertyName = "creation_date")]
        public long CreatedDate { get; set; }

        [JsonProperty(PropertyName = "installed")]
        public long InstalledDate { get; set; }

        [JsonProperty(PropertyName = "languages")]
        public List<string> Languages { get; set; }

        [JsonProperty(PropertyName = "contents")]
        public List<string> Contents { get; set; }

        [JsonProperty(PropertyName = "is_ea_package")]
        public bool is_ea_package { get; set; }

        [JsonProperty(PropertyName = "source")]
        public string source { get; set; }

        [JsonProperty(PropertyName = "source_version")]
        public string source_version { get; set; }

        public bool IsUpgradePackage
        {
            get
            {
                return "2018.1".Equals(source_version, StringComparison.InvariantCultureIgnoreCase);
            }
        }

        [JsonProperty(PropertyName = "activated_models")]
        public List<string> activated_models { get; set; }

        public string ActivatedModels { get; set; }

        public string RePlaceActivatedModels
        {
            get
            {
                if (activated_models != null)
                {
                    return string.Join(", ", activated_models);
                }
                return string.Empty;
            }
        }

        [JsonProperty(PropertyName = "filename")]
        public string Filename { get; set; }

        public string ReLanguagesList
        {
            get
            {
                if (Languages != null)
                {
                    return string.Join(", ", Languages);
                }
                return string.Empty;
            }
        }

        public string ReContentsList
        {
            get
            {
                if (Contents != null)
                {
                    return string.Join(", ", Contents);
                }
                return string.Empty;
            }
        }

        [JsonProperty(PropertyName = "active_version")]
        public string active_version { get; set; }

        [JsonProperty(PropertyName = "activated")]
        [DataMember]
        public UserDateViewModel activated { get; set; }

        [JsonProperty(PropertyName = "deactivated")]
        [DataMember]
        public UserDateViewModel deactivated { get; set; }

        [JsonProperty(PropertyName = "error_message")]
        public string error_message { get; set; }
    }
}
