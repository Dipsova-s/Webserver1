using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels.Model;
using EveryAngle.ManagementConsole.Helpers;
using EveryAngle.WebClient.Service.ApiServices;
using EveryAngle.WebClient.Service.Security;
using System;
using System.IO;
using System.Net.Mime;
using System.Web;
using System.Web.Mvc;

namespace EveryAngle.ManagementConsole.Controllers
{
    public class AngleWarningsFileController : BaseController
    {
        #region private variables
        private readonly IAngleWarningsFileService angleWarningsExcelService;
        #endregion

        public AngleWarningsFileController(
            IAngleWarningsFileService angleWarningExcelService
            )
            : this(angleWarningExcelService, SessionHelper.Initialize())
        { 
        }

        public AngleWarningsFileController(
            IAngleWarningsFileService angleWarningExcelService,
            SessionHelper sessionHelper)
        {
            this.angleWarningsExcelService = angleWarningExcelService;
            SessionHelper = sessionHelper;
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult UploadAngleWarningFile(FormCollection formCollection, HttpPostedFileBase file) 
        {
            try
            {
                if (file.ContentLength > 0)
                {
                    var path = string.Format("{0}\\Tools\\Data", AppDomain.CurrentDomain.BaseDirectory);

                    DirectoryInfo directoryInfo = new DirectoryInfo(path);
                    if (!directoryInfo.Exists)
                    {
                        directoryInfo = Directory.CreateDirectory(directoryInfo.FullName);
                    }
                    file.SaveAs(Path.Combine(path,file.FileName));

                    return JsonHelper.GetJsonStringResult(true, null,
                        null, MessageType.DEFAULT, null);
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

        public FilePathResult DownloadFile()
        {
            AngleWarningsFileViewModel viewModel = angleWarningsExcelService.Download();
            return File(viewModel.FileName, MediaTypeNames.Application.Octet);
        }
    }
}