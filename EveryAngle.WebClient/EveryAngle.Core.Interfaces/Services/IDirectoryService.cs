using EveryAngle.Core.ViewModels.About;
using EveryAngle.Core.ViewModels.Directory;

namespace EveryAngle.Core.Interfaces.Services
{
    public interface IDirectoryService
    {
        VersionViewModel GetVersion(string uri);
        VersionViewModel GetVersion();
        AboutViewModel GetAbout(string uri);
    }
}
