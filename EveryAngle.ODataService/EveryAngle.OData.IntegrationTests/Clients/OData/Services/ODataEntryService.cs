using EveryAngle.OData.IntegrationTests.Base;
using EveryAngle.OData.IntegrationTests.Shared;

namespace EveryAngle.OData.IntegrationTests.Clients.OData.Services
{
    public class ODataEntryService : RestService<ODataRestService, dynamic>
    {
        public ODataEntryService(TestContext testContext, IHttpBase httpBase) : base(testContext, httpBase)
        {
            route = "entry";
        }
    }
}
