using EveryAngle.Core.ViewModels.Explorer;
using System.Collections.Generic;

namespace EveryAngle.Core.Interfaces.Services
{
    public interface IRepositoryLogService
    {
        IEnumerable<FileModel> Get();
    }
}
