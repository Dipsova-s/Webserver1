using EveryAngle.Core.ViewModels.About;

namespace EveryAngle.Core.Interfaces.Services
{
    public interface ICopyrightService
    {
        LicenseCopyrightViewModel GetLicenses(string path);
    }
}
