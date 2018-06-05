using System.Net;
using System.Net.Http;
using System.Text;
using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Shared.Helpers;
using EveryAngle.WebClient.Service.ApiServices;
using EveryAngle.WebClient.Web.Helpers;

namespace EveryAngle.WebClient.Web.Controllers.Apis
{
    public class HelpApiController : BaseApiController
    {
        public HttpResponseMessage GetModelParameter(string modelServerSettingsUri)
        {
            IModelService modelService = new ModelService();
            ModelServerSettings modelServerSettings = null;

            if (!string.IsNullOrEmpty(modelServerSettingsUri))
            {
                modelServerSettings =
                    modelService.GetModelSettings(UrlHelper.GetRequestUrl(URLType.NOA) + modelServerSettingsUri);
            }

            var body = ViewRenderer.RenderPartialView("~/Views/Help/ModelParameterPage.cshtml",
                modelServerSettings);
            var resp = new HttpResponseMessage(HttpStatusCode.OK);
            resp.Content = new StringContent(body, Encoding.UTF8, "text/plain");
            return resp;
        }
    }
}
