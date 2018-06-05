using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Shared.Helpers;
using EveryAngle.WebClient.Service.ApiServices;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
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

        static string RenderViewToString(ControllerContext context,
                                    string viewPath,
                                    object model = null,
                                    bool partial = false)
        {
            // first find the ViewEngine for this view
            ViewEngineResult viewEngineResult = null;
            if (partial)
                viewEngineResult = ViewEngines.Engines.FindPartialView(context, viewPath);
            else
                viewEngineResult = ViewEngines.Engines.FindView(context, viewPath, null);

            if (viewEngineResult == null)
                throw new FileNotFoundException("View cannot be found.");

            // get the view and attach the model to view data
            var view = viewEngineResult.View;
            context.Controller.ViewData.Model = model;

            string result = null;

            using (var sw = new StringWriter())
            {
                var ctx = new ViewContext(context, view,
                                            context.Controller.ViewData,
                                            context.Controller.TempData,
                                            sw);
                view.Render(ctx, sw);
                result = sw.ToString();
            }

            return result;
        }
    }
}
