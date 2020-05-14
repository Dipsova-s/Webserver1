using EveryAngle.OData.App_Start;
using EveryAngle.OData.IoC;
using EveryAngle.OData.Service.App_Start;
using EveryAngle.OData.Utils.Logs;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;

namespace EveryAngle.OData
{
    public class WebApiApplication : HttpApplication
    {
        protected void Application_Start()
        {
            LogConfig.Configure(Server);
            LogService.Init();

            GlobalConfiguration.Configure(IoCConfig.Register);
            GlobalConfiguration.Configure(WebApiConfig.Register);
            GlobalConfiguration.Configure(ODataApiConfig.Register);
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
            GlobalConfiguration.Configure(PartialFieldConfig.Register);
            GlobalConfiguration.Configuration.EnsureInitialized();
        }
    }
}
