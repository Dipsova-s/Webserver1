using EveryAngle.Core.ViewModels.DataStore;
using EveryAngle.Core.ViewModels.Model;
using Newtonsoft.Json;
using NUnit.Framework;

namespace EveryAngle.Core.ViewModels.Tests
{
    public class DataStoresViewModelTest : UnitTestBase
    {
        [TestCase]
        public void DataStoresViewModel_TEST()
        {
            //arrange
            DataStoresViewModel viewModel = new DataStoresViewModel
            {
                id = "id",
                name = "name",
                datastore_plugin = "csv",
                allow_write = true,
                supports_write = true,
                supports_append = true,
                is_file_based = true,
                is_default = true,
                connection_settings = new ModelServerSettings(),
                data_settings = new ModelServerSettings(),
            };

            //assert type
            Assert.AreEqual(viewModel.id.GetType(), typeof(string));
            Assert.AreEqual(viewModel.name.GetType(), typeof(string));
            Assert.AreEqual(viewModel.supports_write.GetType(), typeof(bool));
            Assert.AreEqual(viewModel.supports_append.GetType(), typeof(bool));
            Assert.AreEqual(viewModel.connection_settings.GetType(), typeof(ModelServerSettings));
            Assert.AreEqual(viewModel.data_settings.GetType(), typeof(ModelServerSettings));
            Assert.AreEqual(viewModel.is_file_based.GetType(), typeof(bool));
            Assert.AreEqual(viewModel.allow_write.GetType(), typeof(bool));
            Assert.AreEqual(viewModel.is_default.GetType(), typeof(bool));
            Assert.AreEqual(viewModel.datastore_plugin.GetType(), typeof(string));

            //assert json serialize
            var viewModelSerialize = JsonConvert.SerializeObject(viewModel);
            Assert.IsTrue(viewModelSerialize.Contains("id"));
            Assert.IsTrue(viewModelSerialize.Contains("name"));
            Assert.IsTrue(viewModelSerialize.Contains("supports_write"));
            Assert.IsTrue(viewModelSerialize.Contains("supports_append"));
            Assert.IsTrue(viewModelSerialize.Contains("connection_settings"));
            Assert.IsTrue(viewModelSerialize.Contains("data_settings"));
            Assert.IsTrue(viewModelSerialize.Contains("is_file_based"));
            Assert.IsTrue(viewModelSerialize.Contains("allow_write"));
            Assert.IsTrue(viewModelSerialize.Contains("is_default"));
            Assert.IsTrue(viewModelSerialize.Contains("datastore_plugin"));
        }
    }
}
