using EveryAngle.Shared.Helpers;
using Newtonsoft.Json;
using System;
using System.ComponentModel.DataAnnotations;

namespace EveryAngle.Core.ViewModels.Users
{
      [Serializable] 
    public class UserDateViewModel
    {
      
        private Uri uri;
        [JsonProperty(PropertyName = "user")]
        public virtual Uri Uri
        {
            get { return uri; }
            set
            {
                uri = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        [JsonProperty(PropertyName = "datetime")]
        public virtual long Created { get; set; }

        [JsonProperty(PropertyName = "full_name")]
        [LocalizedDisplayName("CreatedBy")]
        public virtual string Fullname { get; set; }
    }
      
}
