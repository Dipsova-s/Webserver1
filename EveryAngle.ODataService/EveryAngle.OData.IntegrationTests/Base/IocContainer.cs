using EveryAngle.OData.IntegrationTests.Clients.Appserver;
using EveryAngle.OData.IntegrationTests.Clients.OData;
using EveryAngle.OData.IntegrationTests.Clients.OData.Services;
using EveryAngle.OData.IntegrationTests.Shared;
using Unity;
using Unity.Injection;

namespace EveryAngle.OData.IntegrationTests.Base
{
    public class IocContainer
    {
        public static IUnityContainer Initialize(TestContext testContext)
        {
            IUnityContainer container = new UnityContainer();

            container.RegisterType<AppserverRestService>(new InjectionConstructor(testContext));
            container.RegisterType<ODataRestService>(new InjectionConstructor(testContext));
            container.RegisterType<ODataService>();

            var odataRest = UnityContainerExtensions.Resolve<ODataRestService>(container);
            container.RegisterType<ODataSyncMetadataService>(new InjectionConstructor(testContext, odataRest));
            container.RegisterType<ODataSettingsService>(new InjectionConstructor(testContext, odataRest));
            container.RegisterType<ODataEntryService>(new InjectionConstructor(testContext, odataRest));
            container.RegisterType<ODataServiceContainer>();

            return container;
        }

    }
}
