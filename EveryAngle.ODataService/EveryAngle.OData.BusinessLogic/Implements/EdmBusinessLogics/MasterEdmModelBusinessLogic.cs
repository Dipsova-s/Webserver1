using EveryAngle.OData.BusinessLogic.Abstracts;
using EveryAngle.OData.BusinessLogic.Interfaces;
using EveryAngle.OData.Collector.Interfaces;
using EveryAngle.OData.DTO;
using EveryAngle.OData.Proxy;

namespace EveryAngle.OData.BusinessLogic.EdmBusinessLogics
{
    public class MasterEdmModelBusinessLogic : AbstractEdmModelBusinessLogic, IMasterEdmModelBusinessLogic
    {
        public MasterEdmModelBusinessLogic(
            IAppServerProxy appServerProxy,
            IAngleDataCollector angleDataCollector)
            : base(appServerProxy, angleDataCollector, ModelType.Master)
        {

        }
    }
}
