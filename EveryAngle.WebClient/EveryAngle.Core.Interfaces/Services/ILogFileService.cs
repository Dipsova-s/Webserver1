using EveryAngle.Core.ViewModels.Model;

namespace EveryAngle.Core.Interfaces.Services
{
    public interface ILogFileService
    {
        FileViewModel Get(string requestUrl);
    }
}
