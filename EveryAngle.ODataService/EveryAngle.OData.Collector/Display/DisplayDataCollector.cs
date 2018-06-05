using EveryAngle.OData.DTO;
using EveryAngle.OData.Repository.InMemoryContainer;
using EveryAngle.OData.Utils;
using System.Threading.Tasks;

namespace EveryAngle.OData.Collector
{
    public class DisplayDataCollector : IBaseCollector
    {
        private readonly AppServerProxy _ASProxy;
        private readonly int _model;
        private readonly int _maxAngles;
        private readonly string _query;

        public DisplayDataCollector()
        {
            _ASProxy = new AppServerProxy();
            _model = ODataSettings.Settings.Model;
            _maxAngles = ODataSettings.Settings.MaxAngles;
            _query = ODataSettings.Settings.AnglesQuery;
        }

        public Task Collect(ModelType syncTo, string token)
        {
            return Task.Factory.StartNew(() =>
            {
                EdmModelMetadata syncingModel = EdmModelContainer.GetEdmModelMetadata(syncTo);
                foreach (var angle in syncingModel.Angles.Values)
                {
                    Parallel.ForEach(angle.displays_summary, item =>
                    {
                        Display display = _ASProxy.GetDisplay(item.uri, token);
                        syncingModel.AngleDisplays.TryAdd(display.uri, display);
                    });
                }
            });
        }
    }
}
