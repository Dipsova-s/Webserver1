using System.Configuration;
using System.Diagnostics.CodeAnalysis;
using EveryAngle.WebClient.Service.Extensions;
using Owin;

namespace EveryAngle.ManagementConsole
{
    [ExcludeFromCodeCoverage]
    public class Startup
    {
        private const string ClientId = "web_server";

        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }

        public void ConfigureAuth(IAppBuilder app)
        {
            var redirectBaseUri = ConfigurationManager.AppSettings["RedirectBaseUri"];
            app.SetupAuthenticationProviders(ClientId, redirectBaseUri, $"{redirectBaseUri}/admin");
        }
    }
}