using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels.Explorer;
using EveryAngle.Core.ViewModels.Model;
using System.Collections.Generic;
using System.Linq;

namespace EveryAngle.WebClient.Service.ApiServices
{
    public class RepositoryLogService : BaseService, IRepositoryLogService
    {
        #region Constant

        private const string REPOSITORYLOG_URI = "repository/logfiles";

        #endregion

        public IEnumerable<FileModel> Get()
        {
            string uri = REPOSITORYLOG_URI;
            IEnumerable<RepositoryLogViewModel> viewModels = GetItems<RepositoryLogViewModel>(uri, "logfiles");
            return viewModels.Select(x => new FileModel(x, string.Empty));
        }
    }
}
