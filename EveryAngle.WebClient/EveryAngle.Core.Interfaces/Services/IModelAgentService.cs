using EveryAngle.Core.ViewModels.Model;

namespace EveryAngle.Core.Interfaces.Services
{
    public interface IModelAgentService
    {
        AgentViewModel Get(string uri);
        void Reload(string agentUri);        
    }
}
