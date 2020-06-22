using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels.Model;
using System.Collections.Generic;

namespace EveryAngle.WebClient.Service.ApiServices
{
    public class ExcelTemplatesService: BaseService, IFileTemplateService
    {
        #region Constant

        private const string ExcelTemplate_URI = "system/files?fileType=ExcelTemplate";
        private const string ExcelTemplateUpload_URI = "system/files?fileType=ExcelTemplate&replaceFlag=true";

        #endregion

        public IEnumerable<FileTemplatesViewModel> Get()
        {
            string uri = ExcelTemplate_URI;
            IEnumerable<FileTemplatesViewModel> viewModels = GetItems<FileTemplatesViewModel>(uri, "files");
            return viewModels;
        }

        public void Upload(byte[] templateFile, string fileName)
        {
            Upload(ExcelTemplateUpload_URI, templateFile, fileName);
        }
    }
}
