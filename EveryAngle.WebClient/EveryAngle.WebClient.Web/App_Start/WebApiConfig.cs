using System.Web.Http;
using System.Web.Mvc;
using Microsoft.AspNet.WebApi.Extensions.Compression.Server;
using System.Net.Http.Extensions.Compression.Core.Compressors;

namespace EveryAngle.WebClient.Web.App_Start
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );

            config.Routes.MapHttpRoute(
               name: "DefaultProxy",
               routeTemplate: "api/{controller}/{*requestUrl}",
               defaults: new { controller = "proxy", requestUrl = UrlParameter.Optional }
            );
            
            config.Routes.MapHttpRoute(
                name: "ApiByAction",
                routeTemplate: "userapi/{action}/{id}",
                defaults: new { controller = "userapi", id = RouteParameter.Optional }
            );

            config.Routes.MapHttpRoute(
                name: "DefaultExport",
                routeTemplate: "export/{action}/{id}",
                defaults: new { controller = "export", id = UrlParameter.Optional }
            );
            
            GlobalConfiguration.Configuration.MessageHandlers.Insert(0, new ServerCompressionHandler(new GZipCompressor(), new DeflateCompressor()));
        }
    }
}
