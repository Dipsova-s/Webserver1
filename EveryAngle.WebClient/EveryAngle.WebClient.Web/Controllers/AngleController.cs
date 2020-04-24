using System.IO;
using System.Web.Mvc;
using EveryAngle.Shared.Helpers;

namespace EveryAngle.WebClient.Web.Controllers
{
    public class AngleController : BaseController
    {
        public ActionResult AnglePage()
        {
            return View(@"~/Views/Angle/AnglePage.cshtml");
        }

        public FileResult Images()
        {
            var imageUri = Request.Url;
            MemoryStream ms;
            var domainImage = UtilitiesHelper.FindHelpImage(imageUri, Server.MapPath(@"~/Data/Images"),
                Server.MapPath(@"~/Images"), out ms);
            return File(ms.ToArray(), UtilitiesHelper.GetImageFormatString(domainImage.FullName));
        }
    }
}
