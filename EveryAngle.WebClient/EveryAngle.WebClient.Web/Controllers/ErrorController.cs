using EveryAngle.Shared.Helpers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq.Expressions;
using System.Web.Mvc;

namespace EveryAngle.WebClient.Web.Controllers
{
    //[LogExceptionHandler]
    public class ErrorController : BaseController
    {
        // Return another error
        public ActionResult Index(string error)
        {
            ViewBag.Title = "An error occured";
            ViewBag.Description = UtilitiesHelper.StripHTML(error, true);

            if (error.StartsWith("{") && error.EndsWith("}"))
            {
                try
                {
                    dynamic result = Newtonsoft.Json.JsonConvert.DeserializeObject(error);
                    ViewBag.Title = result.reason.Value;
                    ViewBag.Description = UtilitiesHelper.StripHTML(result.message.Value, true);
                }
                catch
                {
                    // no error
                }
            }
            else if (Response.StatusCode == 404)
            {
                ViewBag.Title = "Page not found";
                ViewBag.Description = error;
            }
            ViewBag.ReturnUrl = Request.UrlReferrer == null ? "javascript:history.back();" : Request.UrlReferrer.ToString();

            if (Request.IsAjaxRequest())
            {
                return new JsonResult
                {
                    Data = new { reason = ViewBag.Title, message = ViewBag.Description },
                    JsonRequestBehavior = JsonRequestBehavior.AllowGet
                };
            }
            else
            {
                return View(@"~/Views/Shared/Error.cshtml");
            }
        }

        public ActionResult ErrorPartialView()
        {
            HandleErrorInfo error = (TempData["HandleErrorInfo"]) as HandleErrorInfo;

            return PartialView("~/Views/Shared/ErrorPartial.cshtml", error);
        }

    }
}
