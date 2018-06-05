using EveryAngle.Core.ViewModels.SystemInformation;

namespace EveryAngle.Core.Interfaces.Services
{
    public interface ISystemInformationService
    {
        SystemInformationViewModel GetSystemInformation(string systemInformationUrl);
    }
}
