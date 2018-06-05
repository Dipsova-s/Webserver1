using EveryAngle.Core.ViewModels.EAPackage;

namespace EveryAngle.Core.Interfaces.Services
{
    public interface IPackageService
    {
        ExportDownloadPackageViewModel Create(ExportPackageQueryViewModel exportPackageQueryViewModel);
        ExportDownloadPackageViewModel Download(string downloadFileUrl);
    }
}
