using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels;
using System.Collections.Generic;
using System.Linq;

namespace EveryAngle.WebClient.Service.ApiServices
{
    public class SystemScriptService : BaseService, ISystemScriptService
    {
        #region Constant

        private const string ATTRIBUTE_SCRIPTS = "scripts";

        #endregion

        #region Public method

        public List<SystemScriptViewModel> GetSystemScripts(string uri)
        {
            return GetItems<SystemScriptViewModel>(uri, ATTRIBUTE_SCRIPTS).ToList();
        }

        #endregion
    }
}
