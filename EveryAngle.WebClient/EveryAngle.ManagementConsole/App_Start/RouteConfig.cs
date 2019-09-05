using System.Web.Mvc;
using System.Web.Routing;
using EveryAngle.WebClient.Service.EmbededResource.HttpHandlers;

namespace EveryAngle.ManagementConsole
{
    public static class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute("Default", "{controller}/{action}/{id}",
                new {controller = "Security", action = "Index", id = UrlParameter.Optional}
                );


            RouteTable.Routes.Insert(0,
                new Route("resources/embedded/{file}.{extension}",
                    new RouteValueDictionary(new {}),
                    new RouteValueDictionary(new {extension = "css|js|png|jpg|gif|svg"}),
                    new EmbeddedResourceRouteHandler()
                    ));

            routes.LowercaseUrls = true;
        }
    }
}
