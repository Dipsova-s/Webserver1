using EveryAngle.Core.ViewModels.Explorer;
using System.Collections.Generic;

namespace EveryAngle.Core.Interfaces.Services
{
    public interface ISTSLogService
    {
        IEnumerable<FileModel> Get();
    }
}
