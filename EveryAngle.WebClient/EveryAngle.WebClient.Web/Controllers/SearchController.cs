using System;
using System.IO;
using System.Web.Mvc;
using System.Web;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;
using EveryAngle.Shared.Globalization;
using EveryAngle.Core.ViewModels.EAPackage;
using EveryAngle.Shared.Helpers;
using Newtonsoft.Json.Linq;

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
        public ContentResult ImportAngle(IEnumerable<HttpPostedFileBase> ImportAngle)
        {
            ImportResultViewModel<JObject> viewModel = GetImportAnglePackageViewModel(ImportAngle.FirstOrDefault());

            string viewModelAsJsonString = JsonConvert.SerializeObject(viewModel,
                                new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });

            return Content(viewModelAsJsonString, "application/json", System.Text.Encoding.UTF8);
        }

        #region private

        private ImportResultViewModel<JObject> GetImportAnglePackageViewModel(HttpPostedFileBase angleJson)
        {
            ImportResultViewModel<JObject> viewModel = new ImportResultViewModel<JObject>();

            try
            {
                if (!Path.GetExtension(angleJson.FileName).Equals(".json", StringComparison.InvariantCultureIgnoreCase))
                {
                    throw new Exception(Resource.UploadAngles_InvalideExtension);
                }

                string angleJsonAsString = new StreamReader(angleJson.InputStream).ReadToEnd();

                // if json has contains invalid html tags then throw an error
                if (!PotentiallyTagsHelper.IsSafeContent(angleJsonAsString))
                {
                    throw new Exception(Resource.UploadAngles_InvalideParseJson);
                }

                viewModel.Result = JObject.Parse(angleJsonAsString);
            }
            catch (Exception ex)
            {
                viewModel.ErrorMessage = ex.Message;
            }

            return viewModel;
        }

        #endregion

    }
}
