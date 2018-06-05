using Microsoft.Owin;
using Owin;

[assembly: OwinStartup(typeof(EveryAngle.OData.Service.Startup))]
namespace EveryAngle.OData.Service
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            app.MapSignalR();
        }
    }
}