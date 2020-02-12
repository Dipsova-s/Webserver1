using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels.Model;

namespace EveryAngle.WebClient.Service.ApiServices
{
    public class LogFileService : BaseService, ILogFileService
    {
        public FileViewModel Get(string requestUrl)
        {
            return Download(requestUrl);
        }
    }
}
