using EveryAngle.OData.Proxy;
using EveryAngle.OData.Settings;

namespace EveryAngle.OData.Collector.Collectors
{
    public abstract class BaseDataCollector
    {
        protected IAppServerProxy AppServerProxy { get; private set; }
        protected int? MaxAngles { get; private set; }
        protected string Query { get; private set; }

        public BaseDataCollector(IAppServerProxy appServerProxy)
        {
            AppServerProxy = appServerProxy;
            MaxAngles = ODataSettings.Settings.MaxAngles;
            Query = ODataSettings.Settings.AnglesQuery;
        }
    }
}
