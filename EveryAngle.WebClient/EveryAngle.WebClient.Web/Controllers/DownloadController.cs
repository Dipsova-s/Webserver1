using EveryAngle.WebClient.Service.Security;
using System.IO;
using System.Net.Mime;
using System.Web.Mvc;

namespace EveryAngle.WebClient.Web.Controllers
{
    public class DownloadController : Controller
    {
        public ActionResult GoToSAP()
        {
            AuthorizationHelper session = AuthorizationHelper.Initialize();
            if (!session.HasCookie)
                return new RedirectResult(Shared.Helpers.UrlHelper.GetLoginPath());

            FileInfo fileInfo = new FileInfo(Server.MapPath("~/bin/EveryAngle.GoToSAP.Launcher/EveryAngle.GoToSAP.Launcher.exe"));
            byte[] fileBytes = System.IO.File.ReadAllBytes(fileInfo.FullName);
            return File(fileBytes, MediaTypeNames.Application.Octet, fileInfo.Name);
        }
    }
}