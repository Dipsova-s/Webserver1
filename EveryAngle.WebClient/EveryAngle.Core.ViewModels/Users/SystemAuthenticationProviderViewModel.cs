using EveryAngle.Shared.Helpers;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;

namespace EveryAngle.Core.ViewModels.Users
{
    public class SystemAuthenticationProviderViewModel
    {
        [JsonProperty(PropertyName = "id")]
        public string Id { get; set; }

        [JsonProperty(PropertyName = "type")]
        public string Type { get; set; }

        [JsonProperty(PropertyName = "domain_name")]
        public string domain_name { get; set; }

        [JsonProperty(PropertyName = "target")]
        public string target { get; set; }

        [JsonProperty(PropertyName = "identity")]
        public string identity { get; set; }

        [JsonProperty(PropertyName = "sync_roles_to_groups")]
        public bool? syncRolesToGroups { get; set; }

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

        [JsonProperty(PropertyName = "description")]
        public string Description { get; set; }

        [JsonProperty(PropertyName = "is_enabled")]
        public bool IsEnabled { get; set; }

        [JsonProperty(PropertyName = "auto_create_users")]
        public bool autoCreateUsers { get; set; }

        [JsonProperty(PropertyName = "auto_create_users_always_on")]
        public bool autoCreateUsersAlwaysOn { get; set; }

        [JsonProperty(PropertyName = "default_roles")]
        public List<AssignedRoleViewModel> default_roles { get; set; }

        private Uri userUri;
        [JsonProperty(PropertyName = "users")]
        public Uri Users
        {
            get { return userUri; }
            set
            {
                userUri = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        [JsonProperty(PropertyName = "container")]
        public string container { get; set; }

        [JsonProperty(PropertyName = "identity_provider_issuer")]
        public string identityProviderIssuer { get; set; }

        [JsonProperty(PropertyName = "identity_provider_single_sign_on_url")]
        public string identityProviderSingleSignOnUrl { get; set; }

        [JsonProperty(PropertyName = "identity_provider_certificate_string")]
        public string identityProviderCertificateString { get; set; }

        public object Clone()
        {
            return this.MemberwiseClone();
        }
    }
}
