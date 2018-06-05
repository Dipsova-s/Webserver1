using EveryAngle.Core.ViewModels.EAPackage;
using Newtonsoft.Json;
using NUnit.Framework;

namespace EveryAngle.Core.ViewModels.Tests
{
    public class ExportPackageQueryViewModelTest : UnitTestBase
    {
        [TestCase]
        public void ExportPackageQueryViewModel_TEST()
        {
            //arrange
            ExportPackageQueryViewModel viewModel = new ExportPackageQueryViewModel
            {
                ModelId = "model_id",
                PackageId = "package_id",
                PackageName = "package_name",
                PackageVersion = "package_version",
                PackageDescription = "package_description",
                PackageFormat = "package_format",
                FacetQuery = "facet_query",
                IncludeLabels = true,
                SortBy = "sort_by",
                SortDirection = "sort_direction",
                Source = "source",
                SourceVersion = "source_version"
            };

            //assert type
            Assert.AreEqual(viewModel.ModelId.GetType(), typeof(string));
            Assert.AreEqual(viewModel.PackageId.GetType(), typeof(string));
            Assert.AreEqual(viewModel.PackageName.GetType(), typeof(string));
            Assert.AreEqual(viewModel.PackageVersion.GetType(), typeof(string));
            Assert.AreEqual(viewModel.PackageDescription.GetType(), typeof(string));
            Assert.AreEqual(viewModel.PackageFormat.GetType(), typeof(string));
            Assert.AreEqual(viewModel.FacetQuery.GetType(), typeof(string));
            Assert.AreEqual(viewModel.IncludeLabels.GetType(), typeof(bool));
            Assert.AreEqual(viewModel.SortBy.GetType(), typeof(string));
            Assert.AreEqual(viewModel.SortDirection.GetType(), typeof(string));
            Assert.AreEqual(viewModel.Source.GetType(), typeof(string));
            Assert.AreEqual(viewModel.SourceVersion.GetType(), typeof(string));

            //assert json serialize
            string viewModelSerialize = JsonConvert.SerializeObject(viewModel);
            Assert.IsTrue(viewModelSerialize.Contains("model_id"));
            Assert.IsTrue(viewModelSerialize.Contains("package_id"));
            Assert.IsTrue(viewModelSerialize.Contains("package_name"));
            Assert.IsTrue(viewModelSerialize.Contains("package_version"));
            Assert.IsTrue(viewModelSerialize.Contains("package_description"));
            Assert.IsTrue(viewModelSerialize.Contains("package_format"));
            Assert.IsTrue(viewModelSerialize.Contains("facet_query"));
            Assert.IsTrue(viewModelSerialize.Contains("true"));
            Assert.IsTrue(viewModelSerialize.Contains("sort_by"));
            Assert.IsTrue(viewModelSerialize.Contains("sort_direction"));
            Assert.IsTrue(viewModelSerialize.Contains("source"));
            Assert.IsTrue(viewModelSerialize.Contains("source_version"));
        }
    }
}
