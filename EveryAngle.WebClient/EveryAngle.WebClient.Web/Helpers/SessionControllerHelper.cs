using Newtonsoft.Json.Linq;

namespace EveryAngle.WebClient.Web.Helpers
{
    public static class SessionControllerHelper
    {
        public static JObject GetTokenWithClientIp(string body, string clientIp)
        {
            JObject token = JObject.Parse(body);
            token.Add("client_ip", clientIp);
            return token;
        }
    }
}
