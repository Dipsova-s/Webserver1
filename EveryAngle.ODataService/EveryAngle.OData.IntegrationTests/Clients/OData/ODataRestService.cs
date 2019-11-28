using EveryAngle.OData.IntegrationTests.Base;
using EveryAngle.OData.IntegrationTests.Shared;

namespace EveryAngle.OData.IntegrationTests.Clients.OData
{
    public class ODataRestService : RestServiceBase
    {
        public ODataRestService(TestContext context) : base(context.ODataApiUri)
        {
        }
    }
}
