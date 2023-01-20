using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels.Model;
using EveryAngle.ManagementConsole.Helpers;
using EveryAngle.WebClient.Service.Security;
using Kendo.Mvc.UI;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Mime;
using System.Web;
using System.Web.Mvc;

namespace EveryAngle.ManagementConsole.Controllers
{
    public class AngleExportsController : BaseController
    {
        #region private variables
        private readonly IFileTemplateService excelTemplatesService;

        #endregion

        public AngleExportsController(
            IFileTemplateService excelTemplatesService
            )
            : this(excelTemplatesService, AuthorizationHelper.Initialize())
        {
        }

        public AngleExportsController(
            IFileTemplateService excelTemplatesService,
            AuthorizationHelper authorizationHelper)
        {
            this.excelTemplatesService = excelTemplatesService;
            AuthorizationHelper = authorizationHelper;
        }

        public ActionResult RenderExcelTemplates()
        {
            return PartialView("~/Views/AngleExports/ExcelTemplates.cshtml");
        }
        public ActionResult GetExcelTemplateGrid()
        {
            ViewData["DefaultPageSize"] = DefaultPageSize;
            return PartialView("~/Views/AngleExports/ExcelTemplatesGrid.cshtml");
        }
        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult ReadExcelTemplates()
        {
            IList<FileTemplatesViewModel> files = excelTemplatesService.Get().ToList();
            int total = files.Count();
            return Json(new DataSourceResult
            {
                Data = files,
                Total = total
            });
        }
        [AcceptVerbs(HttpVerbs.Post)]
        public void DeleteExcelTemplate(string excelTemplateUri)
        {
            excelTemplatesService.Delete(excelTemplateUri);
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult UploadExcelTemplates(FormCollection formCollection, HttpPostedFileBase file)
        {
            try
            {
                if (file.ContentLength > 0)
                {
                    var excelFile = ExcelTemplateHelper.Parse(file.FileName);
                    if (excelFile.IsValid())
                    {
                        MemoryStream target = new MemoryStream();
                        file.InputStream.CopyTo(target);

                        excelTemplatesService.Upload(target.ToArray(), file.FileName);
                        return JsonHelper.GetJsonStringResult(true, null,
                            null, MessageType.DEFAULT, null);
                    }
                    return JsonHelper.GetJsonStringResult(false, null,
                        excelFile.ErrorMessage, MessageType.DEFAULT, null);
                }
                return JsonHelper.GetJsonStringResult(false, null,
                    null, MessageType.REQUIRE_EXCEL, null);
            }
            catch (HttpException ex)
            {
                HttpContext.Response.AddHeader("Content-Type", "text/html; charset=utf-8");
                HttpContext.Response.AddHeader("X-Requested-With", "XMLHttpRequest");

                var error = ex.Message;
                if (ex.Source != "EveryAngle.WebClient.Service" || error == "")
                {
                    return JsonHelper.GetJsonStringResult(false, ex.GetHttpCode(), null,
                        MessageType.DEFAULT, null);
                }
                return JsonHelper.GetJsonStringResult(false, ex.GetHttpCode(), error,
                    MessageType.DEFAULT, null);
            }
        }

        public FileContentResult DownloadFile(string fileUri)
        {
            FileViewModel viewModel = excelTemplatesService.Download(fileUri);
            return File(viewModel.FileBytes, MediaTypeNames.Application.Octet, viewModel.FileName);
        }
    }
}