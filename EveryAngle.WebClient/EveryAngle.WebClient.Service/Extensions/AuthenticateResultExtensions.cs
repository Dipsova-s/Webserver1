using Microsoft.Owin.Security;

namespace EveryAngle.WebClient.Service.Extensions
{
    public static class AuthenticateResultExtensions
    {
        private const string AccessTokenKey = "access_token";

        public static string GetAccessToken(this AuthenticateResult result)
        {
            return result?.Identity?.FindFirst(AccessTokenKey)?.Value;
        }
    }
}
