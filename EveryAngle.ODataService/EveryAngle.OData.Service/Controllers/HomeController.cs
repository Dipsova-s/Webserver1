using System.Web.Mvc;

namespace EveryAngle.OData.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            ViewBag.Title = "Home Page";

            return View();
        }

        public ActionResult ODataEntry()
        {
            ViewBag.Title = "OData's Entry";
            return View();
        }
    }
}
