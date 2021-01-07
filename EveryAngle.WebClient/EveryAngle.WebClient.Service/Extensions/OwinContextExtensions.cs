using System.Threading.Tasks;
using Microsoft.Owin;
using Microsoft.Owin.Security;

namespace EveryAngle.WebClient.Service.Extensions
{
    public static class OwinContextExtensions
    {
        private const string AuthenticationType = "Cookies";

        public static Task<AuthenticateResult> AuthenticateAsyncFromCookies(this IOwinContext context)
        {
            return context.Authentication.AuthenticateAsync(AuthenticationType);
        }
    }
}
