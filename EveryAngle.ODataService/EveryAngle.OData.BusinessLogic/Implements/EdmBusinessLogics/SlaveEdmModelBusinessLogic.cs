using EveryAngle.OData.BusinessLogic.Abstracts;
using EveryAngle.OData.BusinessLogic.Interfaces;
using EveryAngle.OData.Collector.Interfaces;
using EveryAngle.OData.DTO;
using EveryAngle.OData.Proxy;
using EveryAngle.OData.Repository;
using EveryAngle.OData.Utils.Logs;
using System.Diagnostics;

namespace EveryAngle.OData.BusinessLogic.EdmBusinessLogics
{
    public class SlaveEdmModelBusinessLogic : AbstractEdmModelBusinessLogic, ISlaveEdmModelBusinessLogic
    {
        public SlaveEdmModelBusinessLogic(
            IAppServerProxy appServerProxy,
            IAngleDataCollector angleDataCollector)
            : base(appServerProxy, angleDataCollector, ModelType.Slave)
        {

        }

        public void SwitchSlaveToMasterModel()
        {
            Stopwatch stopwatch = Stopwatch.StartNew();
            LogService.Info("SwitchSlaveToMasterModel: Switching model metadata...");

            // switch slave model to master
            EdmModelContainer.SwitchSlaveToMasterModel();

            stopwatch.Stop();
            LogService.Info(string.Format("SwitchSlaveToMasterModel: Finished switch model metadata [Status: {0}, {1:N0}ms]", EdmModelContainer.Status.ToString(), stopwatch.ElapsedMilliseconds));
        }
    }
}
