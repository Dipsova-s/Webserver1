using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Shared.Helpers;
using EveryAngle.WebClient.Service.ApiServices;
using System.Web.Mvc;

namespace EveryAngle.WebClient.Web.Controllers
{
    public class HelpController : Controller
    {

        public ActionResult GetModelParameter(string modelServerSettingsUri)
        {
            if (!string.IsNullOrEmpty(modelServerSettingsUri))
            {
                IModelService modelService = new ModelService();
                var modelServerSettings = modelService.GetModelSettings(EveryAngle.Shared.Helpers.UrlHelper.GetRequestUrl(URLType.NOA) + modelServerSettingsUri);
                return PartialView("~/Views/Help/ModelParameterPage.cshtml", modelServerSettings);
            }
            else {
                return PartialView("~/Views/Help/ModelParameterPage.cshtml", null);
            }
        }
    }
}
