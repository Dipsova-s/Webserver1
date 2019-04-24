using System.IO;
using System.Web.Mvc;
using EveryAngle.Shared.Helpers;
using System.Web;
using System.Collections.Generic;
using Newtonsoft.Json.Linq;
using EveryAngle.Shared.Globalization;

namespace EveryAngle.WebClient.Web.Controllers
{
    public class SearchController : BaseController
    {
        public ActionResult SearchPage()
        {
            return View(@"~/Views/Search/SearchPage.cshtml");
        }

        public FileResult Images()
        {
            var imageUri = Request.Url;
            MemoryStream ms;
            var domainImage = UtilitiesHelper.FindHelpImage(imageUri, Server.MapPath(@"~/Data/Images"),
                Server.MapPath(@"~/Images"), out ms);
            return File(ms.ToArray(), UtilitiesHelper.GetImageFormatString(domainImage.FullName));
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public JObject ImportAngle(IEnumerable<HttpPostedFileBase> ImportAngle)
        {
            JObject json = new JObject();

            if (ImportAngle != null)
            {
                foreach (var file in ImportAngle)
                {
                    string extension = Path.GetExtension(file.FileName);
                    if (extension == ".json")
                    {
                        try
                        {
                            string text = (new StreamReader(file.InputStream)).ReadToEnd();
                            json = JObject.Parse(EAHtmlSanitizer.Sanitize(text));
                        }
                        catch
                        {
                            json["ErrorMessage"] = Resource.UploadAngles_InvalideParseJson;
                        }
                    }
                    else
                    {
                        json["ErrorMessage"] = Resource.UploadAngles_InvalideExtension;
                    }
                }
            }

            return json;
        }
    }
}
