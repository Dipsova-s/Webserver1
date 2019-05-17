using EveryAngle.Core.ViewModels.EAPackage;
using EveryAngle.Shared.Globalization;
using EveryAngle.Shared.Helpers;
using EveryAngle.WebClient.Web.Helpers;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;

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
        public ContentResult ImportItem(IEnumerable<HttpPostedFileBase> file)
        {
            ImportResultViewModel<JObject> viewModel = GetImportResult(file.FirstOrDefault());

            string viewModelAsJsonString = JsonConvert.SerializeObject(viewModel,
                                new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });

            return Content(viewModelAsJsonString, "application/json", System.Text.Encoding.UTF8);
        }

        #region private

        private ImportResultViewModel<JObject> GetImportResult(HttpPostedFileBase source)
        {
            ImportResultViewModel<JObject> viewModel = new ImportResultViewModel<JObject>();

            try
            {
                string extension = Path.GetExtension(source.FileName);
                if (extension.Equals(".json", StringComparison.InvariantCultureIgnoreCase))
                {
                    viewModel.Result = GetImportIndividualResult(source.InputStream);
                }
                else if (extension.Equals(".eapackage", StringComparison.InvariantCultureIgnoreCase))
                {
                    viewModel.Result = GetImportPackageResult(source.InputStream);
                }
                else
                {
                    throw new Exception(Resource.UploadAngles_InvalideExtension);
                }
            }
            catch (Exception ex)
            {
                viewModel.ErrorMessage = ex.Message;
            }

            return viewModel;
        }

        internal JObject GetImportIndividualResult(Stream stream)
        {
            JObject content = ItemImporter.GetObjectFromStream<JObject>(stream);
            content["type"] = "download";
            return content;
        }

        internal JObject GetImportPackageResult(Stream stream)
        {
            string packageSource = "WebClient";
            ImportPackageResultViewModel result = new ImportPackageResultViewModel();
            ItemImporter itemImporter = new ItemImporter(stream);

            // ea_package_contents.json
            List<JObject> sources = itemImporter.GetContents<JObject>("name = ea_package_contents.json");
            if (!sources.Any() || !packageSource.Equals(sources[0].GetValue("source").ToString(), StringComparison.InvariantCultureIgnoreCase))
            {
                throw new Exception(Resource.UploadAngles_ItemPackageSourceInvalid);
            }
            result.source = sources.First();

            // angles/*.json
            List<ImportPackageItemViewModel> angles = itemImporter.GetContents<ImportPackageItemViewModel>("name = angles/*.json");
            foreach (ImportPackageItemViewModel angle in angles)
            {
                result.angles.AddRange(angle.items);
            }

            // dashboards/*.json
            List<ImportPackageItemViewModel> dashboards = itemImporter.GetContents<ImportPackageItemViewModel>("name = dashboards/*.json");
            foreach (ImportPackageItemViewModel dashboard in dashboards)
            {
                result.dashboards.AddRange(dashboard.items);
            }

            JObject content = JObject.FromObject(result);
            content["type"] = "package";
            return content;
        }

        #endregion

    }
}
