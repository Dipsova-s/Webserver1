using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels.Model;

namespace EveryAngle.WebClient.Service.ApiServices
{
    public class ModelAgentService : BaseService, IModelAgentService
    {
        #region Constant

        private const string RELOAD_URI = "{0}/reload";

        #endregion

        public AgentViewModel Get(string uri)
        {
            return Get<AgentViewModel>(uri);
        }

        public void Reload(string agentUri)
        {
            string reloadUri = string.Format(RELOAD_URI, agentUri);
            Update(reloadUri);
        }
    }
}
