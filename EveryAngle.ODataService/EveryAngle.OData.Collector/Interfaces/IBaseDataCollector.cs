using EveryAngle.OData.DTO;
using System.Threading.Tasks;

namespace EveryAngle.OData.Collector.Interfaces
{
    public interface IBaseDataCollector
    {
        Task<bool> Collect(ModelType syncTo);
    }
}
