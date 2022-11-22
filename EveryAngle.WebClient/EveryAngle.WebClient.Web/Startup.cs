using System.Diagnostics.CodeAnalysis;
using Owin;
using System.Configuration;
using EveryAngle.WebClient.Service.Extensions;

namespace EveryAngle.WebClient.Web
{
    [ExcludeFromCodeCoverage]
    public class Startup
    {
        private const string ClientId = "7c471a28-159f-472c-bc0a-f7bfb0b60e9f";

        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }

        public void ConfigureAuth(IAppBuilder app)
        {
            var redirectBaseUri = ConfigurationManager.AppSettings["RedirectBaseUri"];
            app.SetupAuthenticationProviders(ClientId, redirectBaseUri, "");
        }
    }
}