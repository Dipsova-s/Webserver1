using EveryAngle.OData.Collector.Collectors;
using EveryAngle.OData.Collector.Interfaces;
using EveryAngle.OData.DTO;
using EveryAngle.OData.Proxy;
using System.Threading.Tasks;

namespace EveryAngle.OData.Collector
{
    public class FieldDataCollector : BaseDataCollector, IFieldDataCollector
    {
        public FieldDataCollector(IAppServerProxy appServerProxy)
            : base(appServerProxy)
        {

        }

        // [PERFORMANCE] slow performance here, user could have a ton of fields, over than 10k~.
        // Fields object can be moved by GC to LOH because of its collection's size is more than 10k items,
        // GetModelFields function should be a parallel execution.
        // which means a memory leak is possibly occur.
        public Task Collect(ModelType syncTo, string token)
        {
            // fetch by display, run after all displays is collected.
            return Task.Factory.StartNew(() => { });
        }
    }
}