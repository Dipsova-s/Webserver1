using System.Web.Mvc;
using EveryAngle.Core.Interfaces.Services;
using EveryAngle.WebClient.Service.Security;
using EveryAngle.ManagementConsole.Models;
using EveryAngle.Shared.Globalization;
using EveryAngle.ManagementConsole.Helpers;
using System.Collections.Generic;

namespace EveryAngle.ManagementConsole.Controllers
{
    public class HomeController : BaseController
    {
        private readonly IDirectoryService _directoryService;

        public HomeController(IDirectoryService directoryService)
        {
            _directoryService = directoryService;
        }

        public ActionResult Index()
        {
            ViewBag.EASECTOKEN = string.Empty;
            return PartialView("~/Views/Shared/Index.cshtml");
        }

        public ActionResult OverView()
        {
            SessionHelper sessionHelper = SessionHelper.Initialize();
            var models = sessionHelper.Models;

            //Get system license
            var licenseUri = sessionHelper.GetSystemLicenseUri();
            var modelLicense = sessionHelper.GetModelLicense(licenseUri);

            //Get Model Servers
            var modelServers = sessionHelper.GetModelServers(models);

            ViewBag.ModelServersUri = sessionHelper.GetModelServersUri();
            ViewBag.LicensesData = modelLicense;
            ViewBag.ModelServers = modelServers;

            return PartialView("~/Views/Home/OverView.cshtml", models);
        }

        public ActionResult SideMenu()
        {
            List<SiteMapModel.SiteMap> siteMaps = SiteMapHelper.GetSiteMap(false);
            return PartialView("~/Views/Shared/SideMenu.cshtml", siteMaps);
        }

        public ActionResult NotImplement()
        {
            ViewBag.Message = Resource.MC_YourContactPage;
            return PartialView("~/Views/Shared/NotImplement.cshtml");
        }

        public ActionResult Maintenance()
        {
            ViewBag.Message = Resource.MC_YourContactPage;
            return PartialView("~/Views/Shared/Maintenance.cshtml");
        }

        public ActionResult TopMenu()
        {
            ViewBag.Message = Resource.MC_YourContactPage;
            return PartialView("~/Views/Shared/TopMenu.cshtml");
        }

        public ActionResult AboutInformation()
        {
            var aboutUri = SessionHelper.Initialize().Version.GetEntryByName("about").Uri.ToString();
            var result = _directoryService.GetAbout(aboutUri);
            result.web_client_version = AssemblyInfoHelper.GetFileVersion();

            return PartialView("~/Views/Shared/AboutSystem.cshtml", result);
        }
    }
}
