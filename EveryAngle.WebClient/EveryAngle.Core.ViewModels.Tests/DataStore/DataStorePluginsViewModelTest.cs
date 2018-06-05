using EveryAngle.Core.ViewModels.DataStore;
using EveryAngle.Core.ViewModels.Model;
using Newtonsoft.Json;
using NUnit.Framework;

namespace EveryAngle.Core.ViewModels.Tests
{
    public class DataStorePluginsViewModelTest : UnitTestBase
    {
        [TestCase]
        public void DataStorePluginsViewModel_TEST()
        {
            //arrange
            DataStorePluginsViewModel viewModel = new DataStorePluginsViewModel
            {
                id = "id",
                name = "name",
                description = "description",
                supports_write = true,
                supports_append = true,
                connection_settings_template = new ModelServerSettings(),
                data_settings_template = new ModelServerSettings(),
                is_file_based = true
            };

            //assert type
            Assert.AreEqual(viewModel.id.GetType(), typeof(string));
            Assert.AreEqual(viewModel.name.GetType(), typeof(string));
            Assert.AreEqual(viewModel.description.GetType(), typeof(string));
            Assert.AreEqual(viewModel.supports_write.GetType(), typeof(bool));
            Assert.AreEqual(viewModel.supports_append.GetType(), typeof(bool));
            Assert.AreEqual(viewModel.connection_settings_template.GetType(), typeof(ModelServerSettings));
            Assert.AreEqual(viewModel.data_settings_template.GetType(), typeof(ModelServerSettings));
            Assert.AreEqual(viewModel.is_file_based.GetType(), typeof(bool));

            //assert json serialize
            var viewModelSerialize = JsonConvert.SerializeObject(viewModel);
            Assert.IsTrue(viewModelSerialize.Contains("description"));
            Assert.IsTrue(viewModelSerialize.Contains("id"));
            Assert.IsTrue(viewModelSerialize.Contains("name"));
            Assert.IsTrue(viewModelSerialize.Contains("supports_write"));
            Assert.IsTrue(viewModelSerialize.Contains("supports_append"));
            Assert.IsTrue(viewModelSerialize.Contains("connection_settings_template"));
            Assert.IsTrue(viewModelSerialize.Contains("data_settings_template"));
            Assert.IsTrue(viewModelSerialize.Contains("is_file_based"));
        }
    }
}
