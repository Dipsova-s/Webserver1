using System;
using System.Web.Mvc;
using EveryAngle.Shared.Globalization;
using Newtonsoft.Json;

namespace EveryAngle.ManagementConsole.Controllers
{
    public class ErrorController : BaseController
    {
        public ActionResult Index(string error)
        {
            ViewBag.ErrorTitle = Resource.MC_AnErrorOccured;
            ViewBag.ErrorMessage = error;

            if (error.StartsWith("{") && error.EndsWith("}"))
            {
                try
                {
                    dynamic result = JsonConvert.DeserializeObject(error);
                    ViewBag.ErrorTitle = result.reason.Value;
                    ViewBag.ErrorMessage = result.message.Value;
                }
                catch (Exception)
                {
                }
            }
            else if (Response.StatusCode == 404)
            {
                ViewBag.ErrorTitle = Resource.MC_PageNotFound;
                ViewBag.ErrorMessage = error;
            }
            ViewBag.ReturnUrl = Request.UrlReferrer == null
                ? "javascript:history.back();"
                : Request.UrlReferrer.ToString();

            if (Request.IsAjaxRequest())
            {
                return new JsonResult
                {
                    Data = new { reason = ViewBag.Title, message = ViewBag.Description },
                    JsonRequestBehavior = JsonRequestBehavior.AllowGet
                };
            }
            return View(@"~/Views/Shared/Error.cshtml");
        }

        public ActionResult ErrorHandling(string error)
        {
            if (error.StartsWith("{"))
            {
                return Content(error);
            }
            if (Request.IsAjaxRequest())
            {
                return new JsonResult
                {
                    Data = new { reason = Resource.MC_AnErrorOccured, message = error },
                    JsonRequestBehavior = JsonRequestBehavior.AllowGet
                };
            }
            ViewBag.ErrorTitle = Response.StatusCode;
            ViewBag.ErrorMessage = error == "" ? Resource.MC_AnErrorOccured : error;
            return PartialView("~/Views/Shared/Error.cshtml");
        }
    }
}
