using EveryAngle.OData.Service.Attributes;
using System.Web.Http;

namespace EveryAngle.OData
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            // Web API routes
            config.IncludeErrorDetailPolicy = IncludeErrorDetailPolicy.LocalOnly;

            config.Filters.Clear();
            config.Filters.Add(new ContextAttribute());
            config.Filters.Add(new AsyncLoggingFilter());

            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );
        }
    }
}
