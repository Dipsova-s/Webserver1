using EveryAngle.Shared.Helpers;
using Newtonsoft.Json;
using System;

namespace EveryAngle.Core.ViewModels.Users
{
    public class AuthenticatedUserViewModel
    {
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


        [JsonProperty(PropertyName = "name")]
        public string Name { get; set; }

        [JsonProperty(PropertyName = "provider")]
        public string Provider { get; set; }

        [JsonProperty(PropertyName = "created_on")]
        public virtual DateTime CreatedOn { get; set; }

        [JsonProperty(PropertyName = "last_authenticated")]
        public virtual long LastAuthenticated { get; set; }

     
   


        private Uri userUri;
        [JsonProperty(PropertyName = "user")]
        public virtual Uri UserUri
        {
            get { return userUri; }
            set
            {
                userUri = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }


    }
}
