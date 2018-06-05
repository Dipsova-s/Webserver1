using System.Web.Mvc;

namespace EveryAngle.WebClient.Web.Controllers
{
    public class DashboardController : BaseController
    {
        public ActionResult DashboardPage()
        {
            return View(@"~/Views/Dashboard/DashboardPage.cshtml");
        }
    }
}
