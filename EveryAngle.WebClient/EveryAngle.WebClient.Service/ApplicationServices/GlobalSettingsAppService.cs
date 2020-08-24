using EveryAngle.Shared.Globalization;
using EveryAngle.WebClient.Domain.Enums;
using System.Collections.Generic;
using EveryAngle.Core.Interfaces.Services;

namespace EveryAngle.WebClient.Service.ApplicationServices
{
    public class GlobalSettingsAppService : IGlobalSettingsAppService
    {
        public IEnumerable<ApprovalStateOption> BuildApprovalStateOptions()
        {
            return new List<ApprovalStateOption>
            {
                new ApprovalStateOption{ Id = ApprovalState.approved.ToString(), Name = Resource.MC_Approved },
                new ApprovalStateOption{ Id = ApprovalState.disabled.ToString(), Name = Resource.MC_Disabled },
                new ApprovalStateOption{ Id = ApprovalState.requested.ToString(), Name = Resource.MC_Requested },
                new ApprovalStateOption{ Id = ApprovalState.rejected.ToString(), Name = Resource.MC_Rejected }
            };
        }
    }
}
