using System.Web.Mvc;

namespace EveryAngle.ManagementConsole.Controllers
{
    public class SharedComponentController : BaseController
    {
        public ActionResult FieldsChooser()
        {
            return PartialView("~/Views/Component/FieldsChooser.cshtml");
        }
    }
}
