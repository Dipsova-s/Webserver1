using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Shared.Helpers;

namespace EveryAngle.Core.Interfaces.Services
{
    public interface ILogFileService
    {
        FileViewModel Get(string requestUrl);
        ExecuteJsonResult GetJsonFromCsl(ExecuteParameters para);
    }
}
