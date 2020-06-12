using EveryAngle.OData.Collector.Collectors;
using EveryAngle.OData.Collector.Interfaces;
using EveryAngle.OData.DTO;
using EveryAngle.OData.Proxy;
using EveryAngle.OData.Repository;
using EveryAngle.OData.Settings;
using System;
using System.Threading.Tasks;
using EveryAngle.OData.Utils.Logs;

namespace EveryAngle.OData.Collector
{
    public class AngleDataCollector : BaseDataCollector, IAngleDataCollector
    {
        public AngleDataCollector(IAppServerProxy appServerProxy)
            : base(appServerProxy)
        {

        }

        public Task<bool> Collect(ModelType syncTo)
        {
            return Task.Factory.StartNew(() =>
            {
                try
                {
                    int? settingsMaxAngles = ODataSettings.Settings.MaxAngles;
                    string settingsQuery = ODataSettings.Settings.AnglesQuery;

                    int currentOffset = 0;
                    Angles tempAngles = AppServerProxy.GetAngles(0, settingsQuery, AppServerProxy.SystemUser);
                    if (tempAngles == null)
                        return false;

                    int maxAngles = tempAngles.header.total.Value;

                    // if MaxAngles is set (not 'null' and not '-1')
                    if (settingsMaxAngles.HasValue && settingsMaxAngles.Value > 0)
                        maxAngles = Math.Min(maxAngles, settingsMaxAngles.Value);

                    int pageSize = ODataSettings.Settings.PageSize;

                    while (currentOffset < maxAngles)
                    {
                        // if currentOffset + page size is more than maxAngles, reduce pageSize to nr of remaining angles
                        pageSize = Math.Min(pageSize, maxAngles - currentOffset);

                        // Get the angles from the Application server
                        string query = ODataSettings.Settings.AnglesQuery;
                        Angles angles =
                            AppServerProxy.GetAngles(currentOffset, pageSize, query, AppServerProxy.SystemUser);

                        if (angles == null)
                        {
                            // M4-79662 - stop synchronizing because it's not able to get angles metadata
                            // Error message on why it failed is already logged by AppServerProxy
                            LogService.Warn("Get angles metadata failed");
                            return false;
                        }

                        // ONLY iterate on angles collection when it's available; not null
                        // Add full details of the Angle to the collection
                        Parallel.ForEach(angles.angles,
                            angle => { EdmModelContainer.Metadata[syncTo].Angles.TryAdd(angle.CompositeKey, angle); });

                        // increase offset
                        currentOffset += pageSize;
                    }

                    return true;
                }
                catch (Exception ex)
                {
                    LogService.Error("Error collecting angles metadata.", ex);
                    return false;
                }
            });
        }
    }
}
