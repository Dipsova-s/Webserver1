using EveryAngle.Core.ViewModels.Model;
using System.Collections.Generic;

namespace EveryAngle.Core.Interfaces.Services
{
    public interface IAngleWarningsFileService
    {
        IEnumerable<AngleWarningsFileViewModel> Get();
        void Upload(byte[] templateFile, string fileName);
        FileViewModel Download(string uri);
    }
}
