using EveryAngle.OData.IntegrationTests.Base;
using EveryAngle.OData.IntegrationTests.Shared;
using EveryAngle.OData.ViewModel.Settings;

namespace EveryAngle.OData.IntegrationTests.Clients.OData.Services
{
    public class ODataSettingsService : RestService<ODataRestService, ODataSettingsViewModel>
    {
        public ODataSettingsService(TestContext testContext, IHttpBase httpBase) : base(testContext, httpBase)
        {
            route = "settings";
        }
    }
}
