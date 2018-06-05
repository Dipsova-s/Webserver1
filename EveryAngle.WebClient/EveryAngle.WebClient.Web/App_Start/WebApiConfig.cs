using Microsoft.AspNet.WebApi.MessageHandlers.Compression;
using Microsoft.AspNet.WebApi.MessageHandlers.Compression.Compressors;
using System.Web.Http;
using System.Web.Mvc;

namespace EveryAngle.WebClient.Web.App_Start
{
    public class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {

            config.Routes.MapHttpRoute(
            name: "DefaultExcelWithRequesUri",
            routeTemplate: "excelapi/{action}/{id}",
            defaults: new { controller = "ExcelGenerator", id = UrlParameter.Optional }
            );

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
