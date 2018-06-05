using EveryAngle.Shared.Helpers;
using Newtonsoft.Json;
using System.Web;

namespace EveryAngle.Core.ViewModels.EAPackage
{
    public class ExportPackageQueryViewModel
    {
        [JsonProperty(PropertyName = "model")]
        public string ModelId { get; set; }

        [JsonProperty(PropertyName = "package_id")]
        public string PackageId { get; set; }

        [JsonProperty(PropertyName = "name")]
        public string PackageName { get; set; }

        [JsonProperty(PropertyName = "version")]
        public string PackageVersion { get; set; }

        [JsonProperty(PropertyName = "description")]
        public string PackageDescription { get; set; }

        [JsonProperty(PropertyName = "format")]
        public string PackageFormat { get; set; }

        [JsonProperty(PropertyName = "fq")]
        public string FacetQuery { get; set; }

        [JsonProperty(PropertyName = "include_labels")]
        public bool IncludeLabels { get; set; }

        [JsonProperty(PropertyName = "sort")]
        public string SortBy { get; set; }

        [JsonProperty(PropertyName = "dir")]
        public string SortDirection { get; set; }

        [JsonProperty(PropertyName = "source")]
        public string Source { get; set; }

        [JsonProperty(PropertyName = "source_version")]
        public string SourceVersion { get; set; }

        public ExportPackageQueryViewModel()
        {
            PackageFormat = "package";
            SortBy = "name";
            SortDirection = "asc";
            Source = WebConfigHelper.GetAppSettingByKey("ExportPackageSource");
            SourceVersion = WebConfigHelper.GetAppSettingByKey("ExportPackageSourceVersion");
        }
    }
}
