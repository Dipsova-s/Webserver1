using EveryAngle.Shared.Globalization;
using EveryAngle.Shared.Globalization.Helpers;
using System;
using System.Globalization;
using System.Web.Mvc;
using System.Web.UI;

namespace EveryAngle.WebClient.Web.Controllers
{
    public class ResourcesController : Controller
    {
        [OutputCache(CacheProfile = "ResourceContent")]
        public JavaScriptResult Index(string lang)
        {
            CultureInfo culture = new CultureInfo(lang);
            string resourceTexts = ResourceHelper.ToJson(typeof(Resource), culture);
            string captionTexts = ResourceHelper.ToJson(typeof(Captions), culture);
            string output = string.Format("window.Localization={0};{2}window.Captions={1};", resourceTexts, captionTexts, Environment.NewLine);
            return new JavaScriptResult
            {
                Script = output
            };
        }
    }
}