using System.Web.Http;

namespace EveryAngle.ManagementConsole
{
    public static class WebApiConfig
    {
        public static string UrlPrefix
        {
            get { return "api"; }
        }

        public static string UrlPrefixRelative
        {
            get { return "~/api"; }
        }

        public static void Register(HttpConfiguration config)
        {
            config.Routes.MapHttpRoute("DefaultApi", UrlPrefix + "/{controller}/{id}",
                new {id = RouteParameter.Optional}
                );
        }
    }
}
