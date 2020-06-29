using EveryAngle.Core.ViewModels.Model;
using System.Collections.Generic;

namespace EveryAngle.Core.Interfaces.Services
{
    public interface IFileTemplateService
    {
        IEnumerable<FileTemplatesViewModel> Get();
        void Delete(string uri);
        void Upload(byte[] templateFile, string fileName);
        FileViewModel Download(string uri);

    }
}
