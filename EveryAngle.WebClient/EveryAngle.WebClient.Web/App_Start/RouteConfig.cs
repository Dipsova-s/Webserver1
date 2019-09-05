using EveryAngle.WebClient.Service.EmbededResource.HttpHandlers;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Routing;

namespace EveryAngle.WebClient.Web
{
    public static class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");
            routes.IgnoreRoute("{resource}.ashx/{*pathInfo}");
            routes.IgnoreRoute("{file}.mp4");

            routes.MapRoute(
                "Default", // Route name
                "{language}/{controller}/{action}/{id}", // URL with parameters
                new
                {
                    controller = "User",
                    action = "Login",
                    language = "en",
                    id = UrlParameter.Optional
                }, // Parameter defaults
                constraints: new { language = "[a-z]{2}" }
            );


            routes.LowercaseUrls = true;
            routes.MapRoute(
                "Login", // Route name
                "{controller}/{action}/{id}", // URL with parameters
                new { controller = "Login", action = "Index", id = UrlParameter.Optional } // Parameter defaults           
            );

            RouteTable.Routes.Insert(0,
              new Route("resources/embedded/{file}.{extension}",
                  new RouteValueDictionary(new { }),
                  new RouteValueDictionary(new { extension = "css|js|png|jpg|gif|svg" }),
                  new EmbeddedResourceRouteHandler()
              ));
        }
    }
}
