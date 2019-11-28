using EveryAngle.OData.IntegrationTests.Base;
using EveryAngle.OData.IntegrationTests.Shared;

namespace EveryAngle.OData.IntegrationTests.Clients.OData.Services
{
    public class ODataSyncMetadataService : RestService<ODataRestService, dynamic>
    {
        public ODataSyncMetadataService(TestContext testContext, IHttpBase httpBase) : base(testContext, httpBase)
        {
            route = "metadata";
        }
    }
}
