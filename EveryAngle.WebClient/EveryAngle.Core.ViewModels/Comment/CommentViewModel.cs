using EveryAngle.Core.ViewModels.Users;
using EveryAngle.Shared.Helpers;
using Newtonsoft.Json;
using System;
using System.ComponentModel.DataAnnotations;
using System.Runtime.Serialization;

namespace EveryAngle.Core.ViewModels.Comment
{
    public class CommentViewModel
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

        [JsonProperty(PropertyName = "comment_type")]
        public virtual string comment_type { get; set; }

        [JsonProperty(PropertyName = "created", DefaultValueHandling = DefaultValueHandling.Ignore)]
        [LocalizedDisplayName("MC_Created")]
        [DataMember]
        public UserDateViewModel CreatedBy { get; set; }

        [JsonProperty(PropertyName = "comment")]
        public virtual string comment { get; set; }
    }
}
