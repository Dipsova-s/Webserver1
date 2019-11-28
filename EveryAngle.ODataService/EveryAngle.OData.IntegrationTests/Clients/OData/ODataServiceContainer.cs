using EveryAngle.OData.IntegrationTests.Clients.OData.Services;

namespace EveryAngle.OData.IntegrationTests.Clients.OData
{
    public class ODataServiceContainer
    {
        public ODataSyncMetadataService SyncMetadata { get; private set; }
        public ODataSettingsService Settings { get; private set; }
        public ODataEntryService Entry { get; private set; }

        public ODataServiceContainer(
            ODataSyncMetadataService syncMetadata,
            ODataSettingsService settings,
            ODataEntryService entry
            )
        {
            SyncMetadata = syncMetadata;
            Settings = settings;
            Entry = entry;
        }
    }
}
