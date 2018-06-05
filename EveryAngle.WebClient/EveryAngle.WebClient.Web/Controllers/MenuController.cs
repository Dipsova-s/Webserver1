using System.Web.Mvc;

namespace EveryAngle.WebClient.Web.Controllers
{
    public class MenuController : Controller
    {
        //Do not need cache here because it's already added with UserPanel
        public ActionResult UserMenu(bool isVisible)
        {
            return PartialView("~/Views/Shared/Menus/Top/UserMenu.cshtml");
        }

        public ActionResult UserPanel()
        {
            return PartialView("~/Views/Shared/Menus/Top/UserPanel.cshtml");
        }
    }
}
