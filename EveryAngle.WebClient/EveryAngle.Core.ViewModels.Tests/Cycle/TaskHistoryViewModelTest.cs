using EveryAngle.Core.ViewModels.Cycle;
using EveryAngle.Core.ViewModels.Users;
using Newtonsoft.Json;
using NUnit.Framework;
using System.Collections.Generic;

namespace EveryAngle.Core.ViewModels.Tests
{
    public class TaskHistoryViewModelTest : UnitTestBase
    {
        [TestCase]
        public void TaskHistoryViewModel_TEST()
        {
            //arrange
            TaskHistoryViewModel viewModel = new TaskHistoryViewModel
            {
                id = "id",
                task_id = "task_id",
                task_name = "task_name",
                timestamp = 1234569,
                delta = true,
                parameters = "parameters",
                type = "type",
                manual = false,
                start_time = 2145678,
                end_time = 2245678,
                StartBy = new UserDateViewModel(), 
                StopBy = new UserDateViewModel(),
                error_count = 2,
                warning_count = 3,
                result = "result",
                correlation_id = "correlation",
                level = "level",
                category = "category",
                category_description = "category description",
                details = "detail",
                report = "report",
                tables = new List<TablesViewModel>(),
                action = "action",
                arguments = new List<ArgumentsViewModel>()
            };

            //assert type
            AssertType(viewModel);

            //assert json serialize
            AssertJsonSerialize(viewModel);

        }

        [TestCase]
        public void ArgumentsViewModel_TEST()
        {
            //arrange
            ArgumentsViewModel viewModel = new ArgumentsViewModel
            {
                name = "name",
                value = 555
            };

            //assert type
            Assert.AreEqual(viewModel.name.GetType(), typeof(string));
            Assert.AreEqual(viewModel.value.GetType(), typeof(int));


            //assert json serialize
            var viewModelSerialize = JsonConvert.SerializeObject(viewModel);
            Assert.IsTrue(viewModelSerialize.Contains("name"));
            Assert.IsTrue(viewModelSerialize.Contains("value"));

        }

        [TestCase]
        public void TablesViewModel_TEST()
        {
            //arrange
            TablesViewModel viewModel = new TablesViewModel
            {
                name = "name",
                title = "title",
                fields = new List<FieldsViewModel>(),
                rows = new List<RowsViewModel>()
            };

            //assert type
            Assert.AreEqual(viewModel.name.GetType(), typeof(string));
            Assert.AreEqual(viewModel.title.GetType(), typeof(string));
            Assert.AreEqual(viewModel.fields.GetType(), typeof(List<FieldsViewModel>));
            Assert.AreEqual(viewModel.rows.GetType(), typeof(List<RowsViewModel>));

            //assert json serialize
            var viewModelSerialize = JsonConvert.SerializeObject(viewModel);
            Assert.IsTrue(viewModelSerialize.Contains("name"));
            Assert.IsTrue(viewModelSerialize.Contains("title"));
            Assert.IsTrue(viewModelSerialize.Contains("fields"));
            Assert.IsTrue(viewModelSerialize.Contains("rows"));
        }

        [TestCase]
        public void FieldsViewModel_TEST()
        {
            //arrange
            FieldsViewModel viewModel = new FieldsViewModel
            {
                name = "name",
                title = "title",
                type = "type"
            };

            //assert type
            Assert.AreEqual(viewModel.name.GetType(), typeof(string));
            Assert.AreEqual(viewModel.title.GetType(), typeof(string));
            Assert.AreEqual(viewModel.type.GetType(), typeof(string));

            //assert json serialize
            var viewModelSerialize = JsonConvert.SerializeObject(viewModel);
            Assert.IsTrue(viewModelSerialize.Contains("name"));
            Assert.IsTrue(viewModelSerialize.Contains("title"));
            Assert.IsTrue(viewModelSerialize.Contains("type"));
        }

        [TestCase]
        public void RowsViewModel_TEST()
        {
            //arrange
            RowsViewModel viewModel = new RowsViewModel
            {
                row_id = "row_id",
                field_values = new List<string> { "value1", "value2" }
            };

            //assert type
            Assert.AreEqual(viewModel.row_id.GetType(), typeof(string));
            Assert.AreEqual(viewModel.field_values.GetType(), typeof(List<string>));

            //assert json serialize
            var viewModelSerialize = JsonConvert.SerializeObject(viewModel);
            Assert.IsTrue(viewModelSerialize.Contains("row_id"));
            Assert.IsTrue(viewModelSerialize.Contains("field_values"));
        }

        #region Private

        private static void AssertJsonSerialize(TaskHistoryViewModel viewModel)
        {
            var viewModelSerialize = JsonConvert.SerializeObject(viewModel);
            Assert.IsTrue(viewModelSerialize.Contains("id"));
            Assert.IsTrue(viewModelSerialize.Contains("task_id"));
            Assert.IsTrue(viewModelSerialize.Contains("task_name"));
            Assert.IsTrue(viewModelSerialize.Contains("timestamp"));
            Assert.IsTrue(viewModelSerialize.Contains("delta"));
            Assert.IsTrue(viewModelSerialize.Contains("parameters"));
            Assert.IsTrue(viewModelSerialize.Contains("type"));
            Assert.IsTrue(viewModelSerialize.Contains("manual"));
            Assert.IsTrue(viewModelSerialize.Contains("start_time"));
            Assert.IsTrue(viewModelSerialize.Contains("end_time"));
            Assert.IsTrue(viewModelSerialize.Contains("start_user"));
            Assert.IsTrue(viewModelSerialize.Contains("stop_user"));
            Assert.IsTrue(viewModelSerialize.Contains("error_count"));
            Assert.IsTrue(viewModelSerialize.Contains("warning_count"));
            Assert.IsTrue(viewModelSerialize.Contains("result"));
            Assert.IsTrue(viewModelSerialize.Contains("correlation_id"));
            Assert.IsTrue(viewModelSerialize.Contains("level"));
            Assert.IsTrue(viewModelSerialize.Contains("category"));
            Assert.IsTrue(viewModelSerialize.Contains("category_description"));
            Assert.IsTrue(viewModelSerialize.Contains("details"));
            Assert.IsTrue(viewModelSerialize.Contains("report"));
            Assert.IsTrue(viewModelSerialize.Contains("tables"));
            Assert.IsTrue(viewModelSerialize.Contains("action"));
            Assert.IsTrue(viewModelSerialize.Contains("arguments"));
        }

        private static void AssertType(TaskHistoryViewModel viewModel)
        {
            Assert.AreEqual(viewModel.id.GetType(), typeof(string));
            Assert.AreEqual(viewModel.task_id.GetType(), typeof(string));
            Assert.AreEqual(viewModel.task_name.GetType(), typeof(string));
            Assert.AreEqual(viewModel.timestamp.GetType(), typeof(long));
            Assert.AreEqual(viewModel.manual.GetType(), typeof(bool));
            Assert.AreEqual(viewModel.start_time.GetType(), typeof(long));
            Assert.AreEqual(viewModel.end_time.GetType(), typeof(long));
            Assert.AreEqual(viewModel.StartBy.GetType(), typeof(UserDateViewModel));
            Assert.AreEqual(viewModel.StopBy.GetType(), typeof(UserDateViewModel));
            Assert.AreEqual(viewModel.error_count.GetType(), typeof(int));
            Assert.AreEqual(viewModel.warning_count.GetType(), typeof(int));
            Assert.AreEqual(viewModel.result.GetType(), typeof(string));
            Assert.AreEqual(viewModel.correlation_id.GetType(), typeof(string));
            Assert.AreEqual(viewModel.level.GetType(), typeof(string));
            Assert.AreEqual(viewModel.category.GetType(), typeof(string));
            Assert.AreEqual(viewModel.category_description.GetType(), typeof(string));
            Assert.AreEqual(viewModel.details.GetType(), typeof(string));
            Assert.AreEqual(viewModel.report.GetType(), typeof(string));
            Assert.AreEqual(viewModel.tables.GetType(), typeof(List<TablesViewModel>));
            Assert.AreEqual(viewModel.action.GetType(), typeof(string));
            Assert.AreEqual(viewModel.arguments.GetType(), typeof(List<ArgumentsViewModel>));
        }

        #endregion
    }
}
