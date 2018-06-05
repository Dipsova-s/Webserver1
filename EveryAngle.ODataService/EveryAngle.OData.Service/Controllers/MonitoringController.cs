using System.Web.Mvc;

namespace EveryAngle.OData.Service.Controllers
{
    public class MonitoringController : Controller
    {
        public ActionResult Index()
        {
            ViewBag.Title = "OData's Monitoring";
            return View();
        }
    }
}