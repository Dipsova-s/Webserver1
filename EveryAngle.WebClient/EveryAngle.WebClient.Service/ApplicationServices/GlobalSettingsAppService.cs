using EveryAngle.Shared.Globalization;
using EveryAngle.WebClient.Domain.Enums;
using System.Collections.Generic;
using EveryAngle.Core.Interfaces.Services;
using System;

namespace EveryAngle.WebClient.Service.ApplicationServices
{
    public class GlobalSettingsAppService : IGlobalSettingsAppService
    {
        public IEnumerable<SystemSettingOption> BuildApprovalStateOptions()
        {
            return new List<SystemSettingOption>
            {
                new SystemSettingOption{ Id = ApprovalState.approved.ToString(), Name = Resource.MC_Approved },
                new SystemSettingOption{ Id = ApprovalState.disabled.ToString(), Name = Resource.MC_Disabled },
                new SystemSettingOption{ Id = ApprovalState.requested.ToString(), Name = Resource.MC_Requested },
                new SystemSettingOption{ Id = ApprovalState.rejected.ToString(), Name = Resource.MC_Rejected }
            };
        }

        public IEnumerable<SystemSettingOption> BuildTimeZoneOptions()
        {
            var timeZoneList = new List<SystemSettingOption>();
            foreach (var timeZone in TimeZoneInfo.GetSystemTimeZones())
            {
                timeZoneList.Add(new SystemSettingOption { Id = timeZone.Id, Name = timeZone.DisplayName });
            }
            return timeZoneList;
        }
    }
}
