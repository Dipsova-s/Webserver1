using PartialResponse.Net.Http.Formatting;
using System.Web.Http;

namespace EveryAngle.OData.Service.App_Start
{
    public static class PartialFieldConfig
    {
        public static void Register(HttpConfiguration config)
        {
            config.Formatters.Clear();
            config.Formatters.Add(new PartialJsonMediaTypeFormatter { IgnoreCase = true });
        }
    }
}