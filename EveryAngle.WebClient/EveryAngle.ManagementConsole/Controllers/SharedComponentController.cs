using EveryAngle.Core.ViewModels.About;
using EveryAngle.Core.Interfaces.Services;
using System.Web.Mvc;
using System.Web.Hosting;

namespace EveryAngle.ManagementConsole.Controllers
{
    public class SharedComponentController : BaseController
    {
        private readonly ICopyrightService copyrightService;
        public SharedComponentController(ICopyrightService copyrightService)
        {
            this.copyrightService = copyrightService;
        }
        public ActionResult FieldsChooser()
        {
            return PartialView("~/Views/Component/FieldsChooser.cshtml");
        }

        public ActionResult Copyright()
        {
            string path = HostingEnvironment.MapPath("~/Content/ExternalResource/Copyright.json");
            LicenseCopyrightViewModel model = copyrightService.GetLicenses(path);
            return View("~/Views/Shared/Copyright.cshtml", model);
        }
    }
}
