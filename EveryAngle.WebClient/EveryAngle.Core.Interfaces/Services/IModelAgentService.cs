using EveryAngle.Core.ViewModels.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EveryAngle.Core.Interfaces.Services
{
    public interface IModelAgentService
    {
        AgentViewModel Get(string uri);
        void Reload(string agentUri);
        void KillSapJob(string agentUri, string data);
    }
}
