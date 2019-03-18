using EveryAngle.Core.ViewModels.Directory;
using EveryAngle.Core.ViewModels.DownloadTable;
using Newtonsoft.Json;
using NUnit.Framework;

namespace EveryAngle.Core.ViewModels.Tests
{
    public class DownloadTableViewModelTest : UnitTestBase
    {
        [TestCase]
        public void DownloadTableViewModel_TEST()
        {
            //arrange
            DownloadTableViewModel viewModel = new DownloadTableViewModel
            {
                id = "id",
                uri = "/test",
                local_name = "local",
                external_name = "external",
                table_group = "table",
                condition = "condition",
                delta_condition = "condition",
                delta_download = true,
                download_all_fields = true,
                fields_uri = "/fields",
                enabled_field_count = 20,
                specify_tables = true
            };

            //assert type
            Assert.AreEqual(viewModel.id.GetType(), typeof(string));
            Assert.AreEqual(viewModel.uri.GetType(), typeof(string));
            Assert.AreEqual(viewModel.local_name.GetType(), typeof(string));
            Assert.AreEqual(viewModel.external_name.GetType(), typeof(string));
            Assert.AreEqual(viewModel.table_group.GetType(), typeof(string));
            Assert.AreEqual(viewModel.condition.GetType(), typeof(string));
            Assert.AreEqual(viewModel.delta_condition.GetType(), typeof(string));
            Assert.AreEqual(viewModel.delta_download.GetType(), typeof(bool));
            Assert.AreEqual(viewModel.download_all_fields.GetType(), typeof(bool));
            Assert.AreEqual(viewModel.fields_uri.GetType(), typeof(string));
            Assert.AreEqual(viewModel.enabled_field_count.GetType(), typeof(int));
            Assert.AreEqual(viewModel.specify_tables.GetType(), typeof(bool));


            //assert json serialize
            var viewModelSerialize = JsonConvert.SerializeObject(viewModel);
            Assert.IsTrue(viewModelSerialize.Contains("id"));
            Assert.IsTrue(viewModelSerialize.Contains("uri"));
            Assert.IsTrue(viewModelSerialize.Contains("local_name"));
            Assert.IsTrue(viewModelSerialize.Contains("external_name"));
            Assert.IsTrue(viewModelSerialize.Contains("table_group"));
            Assert.IsTrue(viewModelSerialize.Contains("condition"));
            Assert.IsTrue(viewModelSerialize.Contains("delta_download"));
            Assert.IsTrue(viewModelSerialize.Contains("delta_condition"));
            Assert.IsTrue(viewModelSerialize.Contains("download_all_fields"));
            Assert.IsTrue(viewModelSerialize.Contains("fields_uri"));
            Assert.IsTrue(viewModelSerialize.Contains("enabled_field_count"));
            Assert.IsTrue(viewModelSerialize.Contains("specify_tables"));
        }

        [TestCase]
        public void DownloadTableFieldViewModel_TEST()
        {
            //arrange
            DownloadTableFieldViewModel viewModel = new DownloadTableFieldViewModel
            {
                id = "id",
                uri = "/test",
                name = "name",
                description = "description",
                table_group = "table",
                is_key_field = true,
                is_mandatory = true,
                datatype = "datatype",
                size = 1,
                domain = "everyangle",
                rolename = "role",
                is_enabled = true
            };

            //assert type
            Assert.AreEqual(viewModel.id.GetType(), typeof(string));
            Assert.AreEqual(viewModel.uri.GetType(), typeof(string));
            Assert.AreEqual(viewModel.name.GetType(), typeof(string));
            Assert.AreEqual(viewModel.description.GetType(), typeof(string));
            Assert.AreEqual(viewModel.table_group.GetType(), typeof(string));
            Assert.AreEqual(viewModel.is_key_field.GetType(), typeof(bool));
            Assert.AreEqual(viewModel.is_mandatory.GetType(), typeof(bool));
            Assert.AreEqual(viewModel.datatype.GetType(), typeof(string));
            Assert.AreEqual(viewModel.size.GetType(), typeof(int));
            Assert.AreEqual(viewModel.domain.GetType(), typeof(string));
            Assert.AreEqual(viewModel.rolename.GetType(), typeof(string));
            Assert.AreEqual(viewModel.is_enabled.GetType(), typeof(bool));


            //assert json serialize
            var viewModelSerialize = JsonConvert.SerializeObject(viewModel);
            Assert.IsTrue(viewModelSerialize.Contains("id"));
            Assert.IsTrue(viewModelSerialize.Contains("uri"));
            Assert.IsTrue(viewModelSerialize.Contains("name"));
            Assert.IsTrue(viewModelSerialize.Contains("description"));
            Assert.IsTrue(viewModelSerialize.Contains("table_group"));
            Assert.IsTrue(viewModelSerialize.Contains("is_key_field"));
            Assert.IsTrue(viewModelSerialize.Contains("is_mandatory"));
            Assert.IsTrue(viewModelSerialize.Contains("datatype"));
            Assert.IsTrue(viewModelSerialize.Contains("size"));
            Assert.IsTrue(viewModelSerialize.Contains("domain"));
            Assert.IsTrue(viewModelSerialize.Contains("rolename"));
            Assert.IsTrue(viewModelSerialize.Contains("is_enabled"));
        }
    }
}
