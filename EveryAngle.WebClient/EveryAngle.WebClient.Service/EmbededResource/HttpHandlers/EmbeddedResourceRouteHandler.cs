using System.Web;
using System.Web.Routing;

namespace EveryAngle.WebClient.Service.EmbededResource.HttpHandlers
{
    public class EmbeddedResourceRouteHandler : IRouteHandler
    {
        IHttpHandler IRouteHandler.GetHttpHandler(RequestContext requestContext)
        {
            return new EmbeddedResourceHttpHandler(requestContext.RouteData);
        }
    }
}
