using System.Web.Mvc;

namespace EveryAngle.WebClient.Web.Controllers
{

    public class PopupController : BaseController
    {
        [OutputCache(Duration = 0, NoStore = false)]
        public ActionResult Get(string id)
        {
            if (id.ToLowerInvariant() == "loginpopup")
            {
                return PartialView(@"~/Views/User/PartialViews/UserLoginBodyPage.cshtml");
            }
            else
            {
                return Content("Popup: " + id + " does not exists.");
            }
        }
    }


}
