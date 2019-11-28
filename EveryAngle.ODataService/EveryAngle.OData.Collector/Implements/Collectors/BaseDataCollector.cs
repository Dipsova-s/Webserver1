using EveryAngle.OData.Proxy;

namespace EveryAngle.OData.Collector.Collectors
{
    public abstract class BaseDataCollector
    {
        protected IAppServerProxy AppServerProxy { get; private set; }

        public BaseDataCollector(IAppServerProxy appServerProxy)
        {
            AppServerProxy = appServerProxy;
        }
    }
}
