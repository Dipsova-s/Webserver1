using System.Configuration;
using System.Diagnostics.CodeAnalysis;
using EveryAngle.WebClient.Service.Extensions;
using Owin;

namespace EveryAngle.ManagementConsole
{
    [ExcludeFromCodeCoverage]
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }

        public void ConfigureAuth(IAppBuilder app)
        {
            var redirectBaseUri = ConfigurationManager.AppSettings["RedirectBaseUri"];
            var clientId = ConfigurationManager.AppSettings["ClientId"];
            app.SetupAuthenticationProviders(clientId, redirectBaseUri, "/admin");
        }
    }
}