using Newtonsoft.Json;
namespace EveryAngle.Core.ViewModels.Users
{
    public class AssignedRoleViewModel
    {
        [JsonProperty(PropertyName = "role_id")]
        public string RoleId { get; set; }

        [JsonProperty(PropertyName = "model_id", NullValueHandling = NullValueHandling.Ignore)]
        public string ModelId { get; set; }
    }
}
