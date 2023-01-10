using System.Diagnostics.CodeAnalysis;
using Owin;
using System.Configuration;
using EveryAngle.WebClient.Service.Extensions;

namespace EveryAngle.WebClient.Web
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
            app.SetupAuthenticationProviders(clientId, redirectBaseUri, "");
        }
    }
}