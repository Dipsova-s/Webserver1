using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels.EAPackage;
using Newtonsoft.Json;

namespace EveryAngle.WebClient.Service.ApiServices
{
    public class PackageService : BaseService, IPackageService
    {
        #region Constant
        
        private const string ITEM_EXPORT_URI = "item_exports?export=true";

        #endregion

        #region Public method

        public ExportDownloadPackageViewModel Create(ExportPackageQueryViewModel exportPackageQueryViewModel)
        {
            string body = JsonConvert.SerializeObject(exportPackageQueryViewModel);
            ExportDownloadPackageViewModel exportDownloadPackageViewModel = Create<ExportDownloadPackageViewModel>(ITEM_EXPORT_URI, body);
            return exportDownloadPackageViewModel;
        }

        public ExportDownloadPackageViewModel Download(string downloadFileUrl)
        {
            ExportDownloadPackageViewModel exportDownloadPackageViewModel = Get<ExportDownloadPackageViewModel>(downloadFileUrl);
            return exportDownloadPackageViewModel;
        }

        #endregion
    }
}
