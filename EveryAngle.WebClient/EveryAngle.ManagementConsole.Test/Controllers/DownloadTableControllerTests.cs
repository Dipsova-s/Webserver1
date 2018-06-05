using EveryAngle.Core.ViewModels;
using EveryAngle.Core.ViewModels.DownloadTable;
using EveryAngle.Core.ViewModels.Model;
using EveryAngle.ManagementConsole.Controllers;
using EveryAngle.Shared.Helpers;
using Kendo.Mvc;
using Kendo.Mvc.UI;
using Moq;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Web;
using System.Web.Mvc;

namespace EveryAngle.ManagementConsole.Test.Controllers
{
    public class DownloadTableControllerTests : UnitTestBase
    {
        #region private variables

        private DownloadTableController _testingController;
        private AgentViewModel _testingAgent;
        private DownloadTableViewModel _downloadTable;

        #endregion

        #region setup/teardown

        [SetUp]
        public override void Setup()
        {
            // call base
            base.Setup();

            // prepare
            _testingAgent = new AgentViewModel { DownloadTables = new Uri("/tables/test", UriKind.Relative) };
            _downloadTable = new DownloadTableViewModel
            {
                custom_condition = "custom_condition",
                delta_condition = "delta_condition",
                delta_download = true,
                download_all_fields = false,
                fields_uri = "/fields"
            };

            // service
            modelService.Setup(x => x.GetModelAgent(It.IsAny<string>())).Returns(_testingAgent);
            downloadTableService.Setup(x => x.GetDownloadTable(It.IsAny<string>())).Returns(_downloadTable);
            downloadTableService.Setup(x => x.UpdateDownloadTableField(It.IsAny<string>(), It.IsAny<string>()));
            downloadTableService.Setup(x => x.GetDownloadTables(It.IsAny<string>())).Returns(new ListViewModel<DownloadTableViewModel>
            {
                Header = new HeaderViewModel { Total = 100 },
                Data = new List<DownloadTableViewModel> { new DownloadTableViewModel { id = "test_item_downloadtable" } }
            });
            downloadTableService.Setup(x => x.GetDownloadTableFields(It.IsAny<string>(), It.IsAny<bool>())).Returns(new ListViewModel<DownloadTableFieldViewModel>
            {
                Header = new HeaderViewModel { Total = 100 },
                Data = new List<DownloadTableFieldViewModel> { new DownloadTableFieldViewModel { id = "test_item_downloadtablefield" } }
            });

            // assign
            _testingController = new DownloadTableController(downloadTableService.Object, modelService.Object, sessionHelper.Object);
        }

        #endregion

        #region tests

        [TestCase]
        public void Can_InitiateConstructor()
        {
            // execute
            Action action = new Action(() =>
            {
                _testingController = new DownloadTableController(downloadTableService.Object, modelService.Object);
                _testingController = new DownloadTableController(downloadTableService.Object, modelService.Object, sessionHelper.Object);
            });

            // assert
            Assert.DoesNotThrow(action.Invoke);
        }

        [TestCase("/models/1", "EA2_800")]
        [TestCase("/models/2", "EA3_800")]
        public void Can_GetDownloadTablePage(string modelUri, string modelId)
        {
            // execute
            _testingController.GetDownloadTablePage(modelUri, modelId);

            // assert
            Assert.AreEqual(modelUri, _testingController.ViewBag.ModelUri);
            Assert.AreEqual(modelId, _testingController.ViewBag.ModelId);
            Assert.AreEqual(testingModel.short_name, _testingController.ViewBag.ModelName);
            Assert.AreEqual(testingModel.Agent.ToString(), _testingController.ViewBag.ModelAgent);
        }

        [TestCase("EA2_800", "/models/1/agent", "/models/1", "")]
        [TestCase("EA3_800", "/models/2/agent", "/models/2", "ea3_800")]
        public void Can_GetDownloadTableGrid(string modelId, string modelAgent, string modelUri, string query)
        {
            // execute
            _testingController.GetDownloadTableGrid(modelId, modelAgent, modelUri, query);

            // assert
            Assert.AreEqual(modelUri, _testingController.ViewBag.ModelUri);
            Assert.AreEqual(modelId, _testingController.ViewBag.ModelId);
            Assert.AreEqual(_testingAgent.DownloadTables.ToString(), _testingController.ViewBag.DownloadTableUri);
            Assert.AreEqual(query, _testingController.ViewData["Keyword"]);
            Assert.AreEqual(30, _testingController.ViewData["DefaultPageSize"]);
        }

        [TestCase("EA2_800", "/models/1/agent", "/models/1", "")]
        [TestCase("EA3_800", "/models/2/agent", "/models/2", "ea3_800")]
        public void Can_GetSpecifyTablesGrid(string modelId, string modelAgent, string modelUri, string query)
        {
            // execute
            _testingController.GetSpecifyTablesGrid(modelId, modelAgent, modelUri, query);

            // assert
            Assert.AreEqual(modelUri, _testingController.ViewBag.ModelUri);
            Assert.AreEqual(modelId, _testingController.ViewBag.ModelId);
            Assert.AreEqual(_testingAgent.DownloadTables.ToString(), _testingController.ViewBag.DownloadTableUri);
            Assert.AreEqual(query, _testingController.ViewData["Keyword"]);
            Assert.AreEqual(30, _testingController.ViewData["DefaultPageSize"]);
        }

        [TestCase("/download/tables/test_1", "", true)]
        [TestCase("/download/tables/test_2", "", false)]
        [TestCase("/download/tables/test_3", "10", true)]
        [TestCase("/download/tables/test_4", "20", false)]
        public void Can_ReadDownloadTable(string downloadTableUri, string query, bool createRequest)
        {
            // execute
            ActionResult actionResult = null;
            if (createRequest)
                actionResult = _testingController.ReadDownloadTable(null, downloadTableUri, query);
            else
            {
                SortDescriptor sortDescriptor = new SortDescriptor { Member = "id", SortDirection = ListSortDirection.Ascending };
                actionResult = _testingController.ReadDownloadTable(new DataSourceRequest
                {
                    Page = 1,
                    PageSize = 30,
                    Sorts = new List<SortDescriptor> { sortDescriptor }
                }, downloadTableUri, query);
            }

            JsonResult jsonResult = actionResult as JsonResult;
            DataSourceResult dataSourceResult = jsonResult.Data as DataSourceResult;
            List<DownloadTableViewModel> downloadTables = dataSourceResult.Data as List<DownloadTableViewModel>;

            // assert
            Assert.IsNotNull(jsonResult);
            Assert.IsNotNull(dataSourceResult);
            Assert.IsNotNull(downloadTables);
            Assert.AreEqual(typeof(List<DownloadTableViewModel>), downloadTables.GetType());
            Assert.AreEqual(100, dataSourceResult.Total);
        }

        [TestCase("/download/tables/tests_1", "table_name_1", "model_id_1", "/models/1", "")]
        [TestCase("/download/tables/tests_2", "table_name_2", "model_id_2", "/models/2", "EA2_800")]
        public void Can_EditDownloadTable(string downloadTableUri, string downloadTableName, string modelId, string modelUri, string query)
        {
            // execute
            _testingController.EditDownloadTable(downloadTableUri, downloadTableName, modelId, modelUri, query);

            // assert
            Assert.AreEqual(_downloadTable.custom_condition, _testingController.ViewBag.CustomCondition);
            Assert.AreEqual(_downloadTable.delta_condition, _testingController.ViewBag.DeltaCondition);
            Assert.AreEqual(_downloadTable.delta_download, _testingController.ViewBag.DeltaDownload);
            Assert.AreEqual(_downloadTable.download_all_fields, _testingController.ViewBag.DownloadAllFields);

            Assert.AreEqual(modelId, _testingController.ViewBag.ModelId);
            Assert.AreEqual(modelUri, _testingController.ViewBag.ModelUri);
            Assert.AreEqual(downloadTableName, _testingController.ViewBag.TableName);
            Assert.AreEqual(host + downloadTableUri, _testingController.ViewBag.DownloadTableUri);
            Assert.AreEqual(host + _downloadTable.fields_uri, _testingController.ViewBag.DownloadTableFieldUri);

            Assert.AreEqual(query, _testingController.ViewData["Keyword"]);
            Assert.AreEqual(1, _testingController.ViewData["Total"]);
            Assert.AreEqual(30, _testingController.ViewData["DefaultPageSize"]);
        }

        [TestCase("/tables/uri_1", "/tables/fields_1", "customcond_1", "deltacond_1", true, false, "[{ \"fields\": [ { \"is_enabled\": \"true\", \"id\": 1 } ] }]")]
        [TestCase("/tables/uri_2", "/tables/fields_2", "customcond_2", "deltacond_2", true, false, "[{ \"fields\": [ { \"is_enabled\": \"false\", \"id\": 2 } ] }]")]
        public void Can_SaveDownloadTableField(string tableUri, string tableFieldsUri, string customCondition, string deltaCondition, bool deltaDownload, bool downloadAllFields, string fieldsData)
        {
            // execute 
            ActionResult result = _testingController.SaveDownloadTableField(tableUri, tableFieldsUri, customCondition, deltaCondition, deltaDownload, downloadAllFields, fieldsData);
            JsonResult jsonResult = result as JsonResult;

            // assert 
            Assert.IsNotNull(jsonResult);
            Assert.IsNotNull(jsonResult.Data);
            Assert.AreEqual(JsonRequestBehavior.AllowGet, jsonResult.JsonRequestBehavior);
        }

        [TestCase("/fields/1")]
        public void Can_DeleteDownloadTableField(string fieldsUri)
        {
            // execute
            Action action = new Action(() => { _testingController.DeleteDownloadTableField(fieldsUri); });

            // assert, just invoke our function, and it should working without exception
            Assert.DoesNotThrow(action.Invoke);
        }

        [TestCase("/fields/1")]
        public void Can_DeleteDownloadTableField_NotEnable(string fieldsUri)
        {
            // execute
            downloadTableService.Setup(x => x.GetDownloadTableField(It.IsAny<string>())).Returns(new DownloadTableFieldViewModel());
            Action action = new Action(() => { _testingController.DeleteDownloadTableField(fieldsUri); });

            // assert, just invoke our function, and it should working without exception
            Assert.DoesNotThrow(action.Invoke);
        }

        [TestCase("/download/tables/1", true, "")]
        [TestCase("/download/tables/2", true, "10")]
        [TestCase("/download/tables/3", false, "")]
        [TestCase("/download/tables/4", false, "20")]
        public void Can_ReadDownloadTableFields(string downloadTableUri, bool isEnable, string query)
        {
            // execute
            SortDescriptor sortDescriptor = new SortDescriptor { Member = "id", SortDirection = ListSortDirection.Ascending };
            ActionResult actionResult = _testingController.ReadDownloadTableFields(new DataSourceRequest
            {
                Page = 1,
                PageSize = 30,
                Sorts = new List<SortDescriptor> { sortDescriptor }
            }, downloadTableUri, isEnable, query);

            JsonResult jsonResult = actionResult as JsonResult;
            DataSourceResult dataSourceResult = jsonResult.Data as DataSourceResult;
            List<DownloadTableFieldViewModel> downloadTables = dataSourceResult.Data as List<DownloadTableFieldViewModel>;

            // assert
            Assert.IsNotNull(jsonResult);
            Assert.IsNotNull(dataSourceResult);
            Assert.IsNotNull(downloadTables);
            Assert.AreEqual(typeof(List<DownloadTableFieldViewModel>), downloadTables.GetType());
            Assert.AreEqual(1, dataSourceResult.Total);
        }

        [TestCase("/fields/1", true, "query_1", "id", "asc")]
        [TestCase("/fields/2", false, "query_2", "id", "asc")]
        [TestCase("/fields/3", true, "query_3", "id", "desc")]
        [TestCase("/fields/4", false, "query_4", "id", "desc")]
        [TestCase("/fields/5", true, "query_5", "", "desc")]
        [TestCase("/fields/6", false, "query_6", "id", "")]
        public void Can_GetAvailableFields(string fieldsUri, bool isEnable, string query, string sort, string dir)
        {
            // execute
            _testingController.GetAvailableFields(fieldsUri, isEnable, query, sort, dir);

            // assert
            Assert.AreEqual(1, _testingController.ViewData["Total"]);
            Assert.AreEqual(query, _testingController.ViewData["Keyword"]);
            Assert.AreEqual(30, _testingController.ViewData["DefaultPageSize"]);
            Assert.AreEqual(fieldsUri, _testingController.ViewBag.DownloadTablefieldUri);
        }

        #endregion
    }
}
