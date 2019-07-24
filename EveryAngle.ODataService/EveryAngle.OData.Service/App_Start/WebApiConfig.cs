using EveryAngle.OData.Service.Attributes;
using EveryAngle.OData.Settings;
using Microsoft.AspNet.WebApi.Extensions.Compression.Server;
using System.Net.Http.Extensions.Compression.Core.Compressors;
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

            // this is implement on an initialize state, restart web application to trigger.
            if (ODataSettings.Settings.EnableCompression)
                config.MessageHandlers.Insert(0, new ServerCompressionHandler(new GZipCompressor(), new DeflateCompressor()));

            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );
        }
    }
}
