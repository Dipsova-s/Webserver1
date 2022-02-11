using EveryAngle.Shared.Helpers;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;

namespace EveryAngle.Core.ViewModels.Users
{
    public class AuthenticationProviderUserViewModel
    {
        [JsonProperty(PropertyName = "id")]
        public string Id { get; set; }

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

        [JsonProperty(PropertyName = "full_name")]
        public string Fullname { get; set; }

        [JsonProperty(PropertyName = "domain")]
        public string Domain { get; set; }

        private Uri user;
        [JsonProperty(PropertyName = "user")]
        public Uri User
        {
            get { return user; }
            set
            {
                user = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        [JsonProperty(PropertyName = "is_enabled")]
        public virtual bool IsEnabled { get; set; }

        [JsonProperty(PropertyName = "AssignedRoles")]
        public IList<AssignedRoleViewModel> AssignedRoles { get; set; }
    }
}
