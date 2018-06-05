using EveryAngle.ManagementConsole.Localization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.UI;

namespace EveryAngle.ManagementConsole.Controllers
{
    public class ResourcesController : Controller
    {
        [OutputCache(Duration = 36000, Location = OutputCacheLocation.ServerAndClient)]
        public JavaScriptResult Index()
        {
            string resourceTexts = UserCulture.GetLocalization();
            string captionTexts = UserCulture.GetCaption();
            string output = string.Format("window.Localization={0};{2}window.Captions={1};", resourceTexts, captionTexts, Environment.NewLine);
            return new JavaScriptResult
            {
                Script = output
            };
        }
    }
}
