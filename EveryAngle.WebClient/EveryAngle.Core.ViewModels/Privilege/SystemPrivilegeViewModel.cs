using Newtonsoft.Json;
using System;
using System.Runtime.Serialization;

namespace EveryAngle.Core.ViewModels.Privilege
{
    [Serializable]
    public class SystemPrivilegeViewModel
    {
        [DataMember(EmitDefaultValue = false)]
        [LocalizedDisplayName("MC_ManageSystem")]
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? manage_system { get; set; }

        [DataMember(EmitDefaultValue = false)]
        [LocalizedDisplayName("MC_ManageUsers")]
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? manage_users { get; set; }

        [LocalizedDisplayName("MC_AllowImpersonation")]
        [DataMember(EmitDefaultValue = false)]
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? allow_impersonation { get; set; }

        [DataMember(EmitDefaultValue = false)]
        [LocalizedDisplayName("MC_ManagementAccess")]
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? has_management_access { get; set; }

        [DataMember(EmitDefaultValue = false)]
        [LocalizedDisplayName("MC_ScheduleAngles")]
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? schedule_angles { get; set; }
    }



}
