using EveryAngle.Core.ViewModels;
using System.Collections.Generic;

namespace EveryAngle.Core.Interfaces.Services
{
    public interface ISystemScriptService
    {
        List<SystemScriptViewModel> GetSystemScripts(string uri);
    }
}
