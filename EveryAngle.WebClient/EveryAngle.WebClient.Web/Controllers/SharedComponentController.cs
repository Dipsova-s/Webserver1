using System;
using EveryAngle.WebClient.Service.HttpHandlers;
using EveryAngle.WebClient.Service.LogHandlers;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Web.Mvc;

namespace EveryAngle.WebClient.Web.Controllers
{
    [LogExceptionHandler]
    public class SharedComponentController : Controller
    {
        [HttpGet]
        public FileStreamResult Resource(string id)
        {
            string resourceName = Assembly.GetAssembly(typeof(Shared.EmbeddedViews.EmbeddedResourceViewEngine)).GetManifestResourceNames().FirstOrDefault(f => f.EndsWith(id));
            return new FileStreamResult(Assembly.GetAssembly(typeof(Shared.EmbeddedViews.EmbeddedResourceViewEngine)).GetManifestResourceStream(resourceName), this.GetMediaType(id));
        }

        [HttpGet]
        public ActionResult Helptext(string helptextUri)
        {
            var requestManager = RequestManager.Initialize(Shared.Helpers.UrlHelper.GetRequestUrl(Shared.Helpers.URLType.NOA) + helptextUri + "&viewmode=details");
            JObject helptext = requestManager.Run();
            List<JToken> tokens = helptext.SelectToken("help_texts").ToList();

            string helptextHtml = "Cound not find the helptext.";
            string helptextId = "-";
            string helptextName = "-";

            foreach (var token in tokens)
            {
                helptextHtml = token.SelectToken("html_help") != null ? token.SelectToken("html_help").ToString() : string.Empty;
                helptextId = token.SelectToken("id").ToString();
                helptextName =
                    string.Compare(token.SelectToken("short_name").ToString(), token.SelectToken("long_name").ToString(), StringComparison.OrdinalIgnoreCase) ==
                    0
                        ? token.SelectToken("short_name").ToString()
                        : !string.IsNullOrEmpty(token.SelectToken("long_name").ToString()) ? token.SelectToken("long_name").ToString() : token.SelectToken("short_name").ToString();
                break;
            }

            ViewBag.Helptext = helptextHtml;
            ViewBag.HelptextId = helptextId;
            ViewBag.helptextName = helptextName;
            return PartialView("~/Views/Shared/Helptext.cshtml");
        }

        private string GetMediaType(string fileId)
        {
            if (fileId.EndsWith(".js"))
            {
                return "text/javascript";
            }
            else if (fileId.EndsWith(".css"))
            {
                return "text/stylesheet";
            }
            else if (fileId.EndsWith(".jpg"))
            {
                return "image/jpeg";
            }
            else if (fileId.EndsWith(".png"))
            {
                return "image/png";
            }
            else if (fileId.EndsWith(".svg"))
            {
                return "image/svg+xml";
            }
            return "text";
        }
    }
}
