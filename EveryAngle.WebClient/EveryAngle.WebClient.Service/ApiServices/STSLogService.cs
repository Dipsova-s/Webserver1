using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels.Explorer;
using EveryAngle.Core.ViewModels.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EveryAngle.WebClient.Service.ApiServices
{
    public class STSLogService : BaseService, ISTSLogService
    {
        #region Constant

        private const string STSLOG_URI = "sts/logfiles";

        #endregion

        public IEnumerable<FileModel> Get()
        {
            string uri = STSLOG_URI;
            IEnumerable<ComponentLogViewModel> viewModels = GetItems<ComponentLogViewModel>(uri, "logfiles");
            return viewModels.Select(x => new FileModel(x, string.Empty));
        }
    }
}
