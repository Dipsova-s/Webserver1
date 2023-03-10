using EveryAngle.Core.ViewModels.About;
using EveryAngle.WebClient.Service.HttpHandlers;
using EveryAngle.WebClient.Service.LogHandlers;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Web.Mvc;
using EveryAngle.Core.Interfaces.Services;
using EveryAngle.WebClient.Service.ApplicationServices;
using System.Web.Hosting;

namespace EveryAngle.WebClient.Web.Controllers
{
    [LogExceptionHandler]
    public class SharedComponentController : Controller
    {
        private readonly ICopyrightService copyrightService;
        public SharedComponentController()
        {
            this.copyrightService = new CopyrightService();
        }
        public SharedComponentController(ICopyrightService copyrightService)
        {
            this.copyrightService = copyrightService;
        }

        [HttpGet]
        public FileStreamResult Resource(string id)
        {
            string resourceName = Assembly.GetAssembly(typeof(Shared.EmbeddedViews.EmbeddedResourceViewEngine)).GetManifestResourceNames().FirstOrDefault(f => f.EndsWith(id));
            return new FileStreamResult(Assembly.GetAssembly(typeof(Shared.EmbeddedViews.EmbeddedResourceViewEngine)).GetManifestResourceStream(resourceName), GetMediaType(id));
        }

        [HttpGet]
        public ActionResult Helptext(string model, string id)
        {
            string helptextUri = $"{model}/helptexts?ids={id}&viewmode=details";
            RequestManager requestManager = RequestManager.Initialize(Shared.Helpers.UrlHelper.GetRequestUrl(Shared.Helpers.URLType.NOA) + helptextUri);
            JObject helptext = requestManager.Run();
            List<JToken> tokens = helptext.SelectToken("help_texts").ToList();

            string helptextHtml = string.Empty;
            string helptextName = id;

            foreach (var token in tokens)
            {
                helptextHtml = token.SelectToken("html_help")?.ToString() ?? string.Empty;

                string shortName = token.SelectToken("short_name")?.ToString() ?? string.Empty;
                string longName = token.SelectToken("long_name")?.ToString() ?? string.Empty;

                helptextName = string.IsNullOrEmpty(longName) || string.Compare(shortName, longName, StringComparison.InvariantCultureIgnoreCase) == 0
                        ? shortName : longName;
                break;
            }

            ViewBag.Helptext = helptextHtml;
            ViewBag.helptextName = helptextName;
            return PartialView("~/Views/Shared/Helptext.cshtml");
        }

        public ActionResult Copyright()
        {
            string path = HostingEnvironment.MapPath("~/Content/ExternalResource/Copyright.json");
            LicenseCopyrightViewModel model = copyrightService.GetLicenses(path);
            return View("~/Views/Shared/Copyright.cshtml", model);
        }

        private string GetMediaType(string fileId)
        {
            string extension = fileId.Substring(fileId.LastIndexOf('.'));
            Dictionary<string, string> mediaTypeMappers = new Dictionary<string, string>
            {
                { ".js", "text/javascript" },
                { ".css", "text/stylesheet" },
                { ".jpg", "image/jpeg" },
                { ".png", "image/png" },
                { ".png", "image/png" },
                { ".svg", "image/svg+xml" }
            };
            if (!mediaTypeMappers.TryGetValue(extension, out string mediaType))
            {
                mediaType = "text";
            }
            return mediaType;
        }
    }
}
