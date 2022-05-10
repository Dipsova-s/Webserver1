using EveryAngle.Core.ViewModels.EAPackage;
using Newtonsoft.Json;
using NUnit.Framework;

namespace EveryAngle.Core.ViewModels.Tests
{
    public class ActivePackageQueryViewModelTest : UnitTestBase
    {
        [TestCase]
        public void ActivePackageQueryViewModel_TEST()
        {
            //arrange
            ActivePackageQueryViewModel viewModel = new ActivePackageQueryViewModel
            {
                PackageUri = "package_uri",
                IsActive = true,
                ModelId = "model_id",
                IncludeLabelCategories = true,
                IncludePrivateItems = true,
                IncludeExternalId = true,
                AnglesConflictResolution = "overwrite",
                LabelCategoriesConflictResolution = "overwrite"
            };

            //assert type
            Assert.AreEqual(viewModel.PackageUri.GetType(), typeof(string));
            Assert.AreEqual(viewModel.IsActive.GetType(), typeof(bool));
            Assert.AreEqual(viewModel.ModelId.GetType(), typeof(string));
            Assert.AreEqual(viewModel.IncludeLabelCategories.GetType(), typeof(bool));
            Assert.AreEqual(viewModel.IncludeExternalId.GetType(), typeof(bool));
            Assert.AreEqual(viewModel.IncludePrivateItems.GetType(), typeof(bool));
            Assert.AreEqual(viewModel.AnglesConflictResolution.GetType(), typeof(string));
            Assert.AreEqual(viewModel.LabelCategoriesConflictResolution.GetType(), typeof(string));

            //assert json serialize
            string viewModelSerialize = JsonConvert.SerializeObject(viewModel);
            Assert.IsTrue(viewModelSerialize.Contains("package_uri"));
            Assert.IsTrue(viewModelSerialize.Contains("model_id"));
            Assert.IsTrue(viewModelSerialize.Contains("true"));
            Assert.IsTrue(viewModelSerialize.Contains("overwrite"));
        }
    }
}
