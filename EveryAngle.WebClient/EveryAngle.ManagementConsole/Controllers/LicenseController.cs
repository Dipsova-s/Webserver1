using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels.Model;
using EveryAngle.WebClient.Service.Security;

using EveryAngle.ManagementConsole.Helpers;
using System.Collections.Generic;

namespace EveryAngle.ManagementConsole.Controllers
{
    public class LicenseController : BaseController
    {
        private readonly IGlobalSettingService globalSettingService;
        private readonly IModelService modelService;

        public LicenseController(IModelService modelService, IGlobalSettingService globalSettingService)
        {
            this.modelService = modelService;
            this.globalSettingService = globalSettingService;
        }

        public ActionResult GetLicense()
        {
            SessionHelper session = SessionHelper.Initialize();
            string licenseUri = session.Version.GetEntryByName("system_license").Uri.ToString();
            SystemLicenseViewModel modelLicense = new SystemLicenseViewModel();
            ViewBag.LicenseUri = licenseUri;
            try
            {
                modelLicense = globalSettingService.GetLicense(licenseUri);
                if (modelLicense.model_licenses != null)
                {
                    List<ModelViewModel> models = session.Models;
                    modelLicense.model_licenses.ForEach(license =>
                    {
                        ModelViewModel model = models.FirstOrDefault(w => w.id == license.model_id);
                        license.ModelName = model != null ? model.short_name : license.model_id;
                    });
                }
            }
            catch (HttpException ex)
            {
                if (ex.GetHttpCode() == 404)
                    modelLicense = null;
            }
            return PartialView("~/Views/GlobalSettings/License/LicenseFile.cshtml", modelLicense);
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult SaveLicenseFile(FormCollection formCollection, HttpPostedFileBase file)
        {
            try
            {
                if (file != null && file.ContentLength > 0)
                {
                    StreamReader reader = new StreamReader(file.InputStream);
                    string licenseData = reader.ReadToEnd();

                    globalSettingService.UpdateLicense(formCollection["LicenseUri"], licenseData);
                    return JsonHelper.GetJsonStringResult(
                        true,
                        null,
                        null,
                        MessageType.SUCCESS_UPDATED,
                        new { modelUri = formCollection["LicenseUri"] });
                }
                return JsonHelper.GetJsonStringResult(
                    true,
                    null,
                    null,
                    MessageType.SUCCESS_UPDATED,
                    new { modelUri = formCollection["LicenseUri"] });
            }
            catch (HttpException ex)
            {
                return JsonHelper.GetJsonStringResult(
                    false,
                    ex.GetHttpCode(),
                    ex.Message,
                    MessageType.DEFAULT,
                    null);
            }
        }
    }
}
