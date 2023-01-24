using System.Collections.Generic;

namespace EveryAngle.Core.Interfaces.Services
{
    public interface IGlobalSettingsAppService
    {
        IEnumerable<SystemSettingOption> BuildApprovalStateOptions();
        IEnumerable<SystemSettingOption> BuildTimeZoneOptions();
    }

    public class SystemSettingOption
    {
        public string Id { get; set; }
        public string Name { get; set; }
    }
}
