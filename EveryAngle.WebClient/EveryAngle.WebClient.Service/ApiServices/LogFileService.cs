using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Shared.Helpers;
using System.Diagnostics.CodeAnalysis;

namespace EveryAngle.WebClient.Service.ApiServices
{
    public class LogFileService : BaseService, ILogFileService
    {
        public FileViewModel Get(string requestUrl)
        {
            return Download(requestUrl);
        }
        [ExcludeFromCodeCoverage]
        public ExecuteJsonResult GetJsonFromCsl(ExecuteParameters para)
        {
            return UtilitiesHelper.GetJsonFromCsl(para);
        }
    }
}
