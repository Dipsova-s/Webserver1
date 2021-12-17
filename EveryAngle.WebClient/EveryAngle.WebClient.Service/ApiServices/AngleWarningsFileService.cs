using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EveryAngle.WebClient.Service.ApiServices
{
    public class AngleWarningsFileService : BaseService, IAngleWarningsFileService
    {
        #region Constant

        private const string IAngleWarningsFile_URI = "system/file?fileType=AngleWarning";
        private const string IAngleWarningsFileUpload_URI = "system/file?fileType=AngleWarning&replaceFlag=true";

        #endregion

        public new IEnumerable<AngleWarningsFileViewModel> Get()
        {
            string uri = IAngleWarningsFile_URI;
            IEnumerable<AngleWarningsFileViewModel> viewModels = GetItems<AngleWarningsFileViewModel>(uri, "files");
            return viewModels;
        }

        public void Upload(byte[] templateFile, string fileName)
        {
            Upload(IAngleWarningsFileUpload_URI, templateFile, fileName);
        }
    }
}
