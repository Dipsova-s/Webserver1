using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels;
using EveryAngle.Core.ViewModels.DownloadTable;
using EveryAngle.WebClient.Service.Security;
using EveryAngle.Shared.Helpers;
using EveryAngle.WebClient.Service;
using Kendo.Mvc.UI;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using UrlHelper = EveryAngle.Shared.Helpers.UrlHelper;
using EveryAngle.ManagementConsole.Helpers;
using EveryAngle.Core.ViewModels.Model;

namespace EveryAngle.ManagementConsole.Controllers
{
    public class DownloadTableController : BaseController
    {
        #region private variables

        private readonly IDownloadTableService _downloadTableService;
        private readonly IModelService _modelService;

        #endregion

        #region constructors

        public DownloadTableController(
            IDownloadTableService downloadTableService,
            IModelService modelService,
            AuthorizationHelper authorizationHelper)
        {
            _downloadTableService = downloadTableService;
            _modelService = modelService;
            AuthorizationHelper = authorizationHelper;
        }

        public DownloadTableController(
            IDownloadTableService downloadTableService,
            IModelService modelService)
        {
            _downloadTableService = downloadTableService;
            _modelService = modelService;
        }

        #endregion

        #region "Public"

        public ActionResult GetDownloadTablePage(string modelUri, string modelId)
        {
            var model = AuthorizationHelper.GetModel(modelUri);
            ViewBag.ModelUri = modelUri;
            ViewBag.ModelId = modelId;
            ViewBag.ModelName = model.short_name;
            ViewBag.ModelAgent = model.Agent.ToString();

            return PartialView("~/Views/DownloadTable/DownloadTable.cshtml");
        }

        public ActionResult GetDownloadTableGrid(string modelId, string modelAgent, string modelUri, string q = "")
        {
            ViewBag.ModelUri = modelUri;
            AgentViewModel agent = _modelService.GetModelAgent(modelAgent);
            ViewData["DefaultPageSize"] = DefaultPageSize;
            ViewData["Keyword"] = q;
            ViewBag.ModelId = modelId;
            ViewBag.DownloadTableUri = agent.DownloadTables.ToString();
            return PartialView("~/Views/DownloadTable/DownloadTableGrid.cshtml");
        }

        public ActionResult GetSpecifyTablesGrid(string modelId, string downloadTablesUri, string modelUri, string q = "")
        {
            ViewBag.ModelUri = modelUri;
            ViewData["DefaultPageSize"] = DefaultPageSize;
            ViewData["Keyword"] = q;
            ViewBag.ModelId = modelId;
            ViewBag.DownloadTableUri = downloadTablesUri;
            return PartialView("~/Views/DownloadTable/SpecifyTablesGrid.cshtml");
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult ReadDownloadTable([DataSourceRequest] DataSourceRequest request, string downloadTableUri, string q)
        {
            string uri = downloadTableUri;
            if (request != null)
            {
                string offsetLimit = UtilitiesHelper.GetOffsetLimitQueryString(request.Page, request.PageSize, q);
                string query = PageHelper.GetQueryString(request, QueryString.DownloadTable);
                uri = $"{downloadTableUri}?{offsetLimit}{query}";
            }
            
            ListViewModel<DownloadTableViewModel> downloadTables = _downloadTableService.GetDownloadTables(uri);
            DataSourceResult result = new DataSourceResult
            {
                Data = downloadTables.Data,
                Total = downloadTables.Header.Total
            };
            return Json(result);
        }

        public ActionResult EditDownloadTable(string downloadTableUri, string downloadTableName, string modelId, string modelUri, string q = "")
        {
            string requestUri = UrlHelper.GetRequestUrl(URLType.NOA);
            DownloadTableViewModel downloadTable = _downloadTableService.GetDownloadTable(requestUri + downloadTableUri);
            
            ViewBag.DeltaCondition = downloadTable.delta_condition;
            ViewBag.DeltaDownload = downloadTable.delta_download;
            ViewBag.DownloadAllFields = downloadTable.download_all_fields;

            string downloadTableFieldParams = "?" + UtilitiesHelper.GetOffsetLimitQueryString(1, MaxPageSize, q);
            var downloadTableFields = _downloadTableService.GetDownloadTableFields(
                                       string.Format("{0}{1}{2}", requestUri, downloadTable.fields_uri, downloadTableFieldParams), true);

            ViewBag.ModelId = modelId;
            ViewBag.ModelUri = modelUri;
            ViewData["Keyword"] = q;
            ViewBag.TableName = downloadTableName;
            ViewBag.DownloadTableUri = requestUri + downloadTableUri;
            ViewBag.DownloadTableFieldUri = requestUri + downloadTable.fields_uri;
            ViewData["Total"] = downloadTableFields.Data.Count;
            ViewData["DefaultPageSize"] = DefaultPageSize;
            return PartialView("~/Views/DownloadTable/DowloadTableFieldsGrid.cshtml", downloadTableFields.Data);
        }

        [AcceptVerbs(HttpVerbs.Put)]
        public ActionResult SaveDownloadTableField(string tableUri, string tableFieldsUri, string customCondition, string deltaCondition, bool deltaDownload, bool downloadAllFields, string fieldsData)
        {
            List<string> removedData = new List<string>();
            Dictionary<string, string> existingData = new Dictionary<string, string>();
            IEnumerable<dynamic> tableFields = JsonConvert.DeserializeObject<List<dynamic>>(fieldsData);
            if (tableFields != null)
            {
                foreach (var field in tableFields)
                {
                    dynamic fieldData = JObject.FromObject(field);
                    try
                    {
                        _downloadTableService.UpdateDownloadTableField(tableFieldsUri, fieldData.ToString());
                        if (fieldData.fields[0].is_enabled.ToString() == "false")
                        {
                            removedData.Add(fieldData.fields[0].id.ToString());
                        }
                    }
                    catch (HttpException ex)
                    {
                        dynamic errorResult = JsonConvert.DeserializeObject(ex.Message);
                        string message = errorResult.message;
                        existingData.Add(fieldData.fields[0].id.ToString(), message);
                    }
                }
            }

            DownloadTableViewModel table = _downloadTableService.GetDownloadTable(tableUri);
            table.delta_download = deltaDownload;
            table.delta_condition = HttpUtility.UrlDecode(deltaCondition.Trim());
            table.download_all_fields = downloadAllFields;

            _downloadTableService.UpdateDownloadTableField(tableUri, JsonConvert.SerializeObject(table, new JsonSerializerSettings
            {
                ContractResolver = new CleanUpPropertiesResolver(new List<string>
                    {
                        "id",
                        "uri",
                        "local_name",
                        "external_name",
                        "description",
                        "table_group",
                        "condition",
                        "fields_uri",
                        "total_field_count",
                        "enabled_field_count"
                    })
            }));

            return new JsonResult
            {
                Data = new { removedData, existingData },
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        [AcceptVerbs(HttpVerbs.Delete)]
        public void DeleteDownloadTableField(string fieldsUri)
        {
            var downloadTablefield = _downloadTableService.GetDownloadTableField(fieldsUri);
            if (downloadTablefield != null)
            {
                downloadTablefield.is_enabled = false;
            }
            _downloadTableService.UpdateDownloadTableField(UrlHelper.GetRequestUrl(URLType.NOA) + fieldsUri, 
            JsonConvert.SerializeObject(downloadTablefield, new JsonSerializerSettings
            {
                ContractResolver = new CleanUpPropertiesResolver(new List<string>
                    {
                        "id",
                        "name",
                        "uri",
                        "description",
                        "table_group",
                        "is_key_field",
                        "size",
                        "domain",
                        "rolename"
                    })
            }));
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult ReadDownloadTableFields([DataSourceRequest] DataSourceRequest request, string downloadTableUri, bool isEnable, string q = "")
        {
            string queryString = "?" + UtilitiesHelper.GetOffsetLimitQueryString(1, MaxPageSize, q);
            queryString += PageHelper.GetQueryString(request, QueryString.DownloadTable);

            List<DownloadTableFieldViewModel> downloadTables = _downloadTableService.GetDownloadTableFields(downloadTableUri + queryString, isEnable).Data;
            DataSourceResult result = new DataSourceResult
            {
                Data = downloadTables,
                Total = downloadTables == null ? 0 : downloadTables.Count
            };

            return Json(result);
        }

        public ActionResult GetAvailableFields(string fieldsUri, bool isEnable, string q = "", string sort = "", string dir = "")
        {
            string queryString = "?" + UtilitiesHelper.GetOffsetLimitQueryString(1, MaxPageSize, q);
            if (!string.IsNullOrEmpty(sort))
                queryString += "&sort=" + sort;
            if (!string.IsNullOrEmpty(dir))
                queryString += "&dir=" + dir;

            List<DownloadTableFieldViewModel> downloadTables = _downloadTableService.GetDownloadTableFields(fieldsUri + queryString, isEnable).Data;
            ViewData["Keyword"] = q;
            ViewData["Total"] = downloadTables == null ? 0 : downloadTables.Count;
            ViewData["DefaultPageSize"] = DefaultPageSize;
            ViewBag.DownloadTablefieldUri = fieldsUri;

            return PartialView("~/Views/DownloadTable/DowloadTableAvailableFieldsGrid.cshtml", downloadTables);
        }

        #endregion
    }
}
