using EveryAngle.OData.IntegrationTests.Base;
using EveryAngle.OData.IntegrationTests.Shared;

namespace EveryAngle.OData.IntegrationTests.Clients.Appserver
{
    public class AppserverRestService : RestServiceBase
    {
        public AppserverRestService(TestContext context) : base(context.BaseUri)
        {
        }
    }
}
