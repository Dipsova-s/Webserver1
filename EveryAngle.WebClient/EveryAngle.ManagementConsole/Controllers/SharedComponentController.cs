using System.Web.Mvc;

namespace EveryAngle.ManagementConsole.Controllers
{
    public class SharedComponentController : BaseController
    {
        //public ActionResult BusinessProcessBar()
        //{
        //    return PartialView("~/Views/Component/BusinessProcessBar.cshtml");
        //}

        public ActionResult FieldsChooser()
        {
            return PartialView("~/Views/Component/FieldsChooser.cshtml");
        }
    }
}
