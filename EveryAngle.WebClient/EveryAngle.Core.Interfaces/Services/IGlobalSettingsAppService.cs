using System.Collections.Generic;

namespace EveryAngle.Core.Interfaces.Services
{
    public interface IGlobalSettingsAppService
    {
        IEnumerable<ApprovalStateOption> BuildApprovalStateOptions();
    }

    public class ApprovalStateOption
    {
        public string Id { get; set; }
        public string Name { get; set; }
    }
}
