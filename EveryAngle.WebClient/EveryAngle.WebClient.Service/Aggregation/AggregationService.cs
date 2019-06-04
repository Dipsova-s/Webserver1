using DevExpress.Data.PivotGrid;
using DevExpress.Utils;
using DevExpress.Web;
using DevExpress.Web.ASPxPivotGrid;
using DevExpress.Web.Mvc;
using DevExpress.XtraPivotGrid;
using DevExpress.XtraPivotGrid.Localization;
using EveryAngle.Core.ViewModels.Users;
using EveryAngle.Shared.Formatter;
using EveryAngle.Shared.Globalization;
using EveryAngle.Shared.Globalization.Helpers;
using EveryAngle.Shared.Helpers;
using EveryAngle.Shared.Pivot;
using EveryAngle.Utilities;
using EveryAngle.WebClient.Domain;
using EveryAngle.WebClient.Service.HttpHandlers;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using RestSharp;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Dynamic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.UI;
using System.Web.UI.WebControls;


namespace EveryAngle.WebClient.Service.Aggregation
{
    public class AggregationService
    {
        private const string REPLACE_CAPTION_HEADER = "<br>&nbsp;";
        private const string REPLACE_CAPTION_DATA = "<br>";
        private const string NON_BRAKING_SPACE = "&nbsp;";

        private string[] _domainImageFolderList;

        public PivotSettings FieldSetting { get; set; }
        public bool CanDrilldown { get; set; }

        #region Rest Manager

        public virtual JObject Get(string requestUrl)
        {
            var requestManager = RequestManager.Initialize(requestUrl);
            JObject jsonResult = requestManager.Run();
            return jsonResult;
        }

        public Task<JObject> GetAsync(string requestUrl)
        {
            var requestManager = RequestManager.Initialize(requestUrl);
            return requestManager.GetAsync(false);
        }

        private List<Task<JObject>> ParallelRequest(List<string> uriList)
        {
            List<Task<JObject>> request = new List<Task<JObject>>();

            foreach (string uri in uriList)
            {
                request.Add(GetAsync(uri));
            }

            Task.WaitAll(request.ToArray());

            return request;
        }

        #endregion

        #region Domain Elements

        public virtual dynamic GetDomainElementsByUri(string uri)
        {
            if (HttpContext.Current.Session["DomainElements"] != null)
            {
                var domainElementsList = ((List<dynamic>)HttpContext.Current.Session["DomainElements"]);
                dynamic domainElement = domainElementsList.FirstOrDefault(x => x.uri == uri);

                if (domainElement != null)
                    return domainElement;
            }

            dynamic domain = Get(uri);
            if (domain != null)
            {
                AddDomainElementToSession(domain);
            }
            return domain;
        }

        public void AddDomainElementToSession(dynamic domainElement)
        {
            List<dynamic> domainElements = new List<dynamic>();
            if (HttpContext.Current.Session["DomainElements"] != null)
            {
                domainElements = (List<dynamic>)HttpContext.Current.Session["DomainElements"];
            }
            domainElements.Add(domainElement);
            HttpContext.Current.Session["DomainElements"] = domainElements;
        }

        #endregion

        #region Public methods

        public string GetLayoutId(string guid)
        {
            return "PivotLayout" + guid;
        }

        public string GetCacheKeyBy(PivotSettings fieldSettings)
        {
            return "pivotDataTable-" + fieldSettings.Id.ToString();
        }

        public string GetPivotFieldsSettingName(string pivotId)
        {
            return pivotId != "pivotGrid" ? pivotId + "-FieldSettings" : "FieldSettings";
        }

        public dynamic ConvertStringToDynamic(string jsonString)
        {
            JavaScriptSerializer json_serializer = new JavaScriptSerializer();
            dynamic dynamicObject = (dynamic)json_serializer.DeserializeObject(jsonString);
            return dynamicObject;
        }

        public void AddDataTableToCache(DataTable dt, string key)
        {
            HttpContext.Current.Cache.Insert(key, dt, null, DateTime.Now.AddMinutes(60), System.Web.Caching.Cache.NoSlidingExpiration);
        }

        public DataTable GetCacheDataTable(PivotSettings fieldSettings)
        {
            DataTable pivotDataTable;

            string cacheKey = GetCacheKeyBy(fieldSettings);

            if (HttpContext.Current.Cache[cacheKey] == null)
            {
                dynamic currentResultModel = GetResultDataRows(fieldSettings);
                pivotDataTable = GetPivotDataTable(currentResultModel.Fields, currentResultModel.Rows, fieldSettings);
                AddDataTableToCache(pivotDataTable, cacheKey);
            }
            else
            {
                pivotDataTable = HttpContext.Current.Cache[cacheKey] as DataTable;
            }

            return pivotDataTable;
        }

        public dynamic GetRestClientDynamicDataByURI(string URI)
        {
            JObject objectData = Get(URI);
            dynamic dynamicData = JObject.FromObject(objectData);
            return dynamicData;
        }

        public ExpandoObject GetResultDataRows(PivotSettings fieldSettings)
        {
            dynamic dataRowsModel = new ExpandoObject();
            dynamic dataRowsDynamicData;
            List<dynamic> resultDataRows = new List<dynamic>();
            List<List<string>> uriGroups = new List<List<string>>();
            List<Task<JObject>> tasks = new List<Task<JObject>>();

            int itemsPerPage = FieldSetting.MaxPageSize;
            int totalPage = (fieldSettings.RowCount + itemsPerPage - 1) / itemsPerPage;

            AddGroupRequests(uriGroups, fieldSettings.DataRowsUri, fieldSettings.RequestsPerGroup, itemsPerPage, totalPage);

            try
            {
                foreach (List<string> uriList in uriGroups)
                {
                    tasks.AddRange(ParallelRequest(uriList));
                }
            }
            catch (AggregateException ex)
            {
                HttpResponseMessage message = ((System.Web.Http.HttpResponseException)ex.InnerExceptions[0]).Response;

                throw new HttpException((int)message.StatusCode, message.Content.ReadAsStringAsync().Result);
            }

            dataRowsDynamicData = AddResultDataRows(resultDataRows, tasks);

            dataRowsModel.Rows = resultDataRows;
            if (dataRowsDynamicData != null)
            {
                dataRowsModel.Fields = dataRowsDynamicData.fields;
            }
            else
            {
                List<string> defaultFields = AddDefaultFields(fieldSettings);
                dataRowsModel.Fields = defaultFields;
            }
            return dataRowsModel;
        }

        public DataRow GetDataRow(DataRow newDataRow, dynamic fields, dynamic row, Dictionary<string, EAPivotField> fieldsInfo, CultureInfo cultureInfo)
        {
            int columnIndex = 0;

            // handle no datarows
            if (row == null)
            {
                foreach (string fieldName in fields)
                {
                    newDataRow[fieldName.ToLowerInvariant()] = DBNull.Value;
                    columnIndex++;
                }
            }
            else
            {
                foreach (var rowValue in row.field_values)
                {
                    string fieldName = ((string)fields[columnIndex]).ToLowerInvariant();
                    EveryAngleEnums.FIELDTYPE fieldType = EnumHelper.ParseEnum<EveryAngleEnums.FIELDTYPE>(fieldsInfo[fieldName].DataType);
                    AddNewDataRow(newDataRow, row, cultureInfo, columnIndex, fieldName, fieldType);
                    columnIndex++;
                }
            }

            return newDataRow;
        }

        public PivotGridSettings MapPivotGridSettings(List<EAPivotField> fields)
        {
            bool isBlockDisplayChange = IsBlockDisplayChange();

            // active Pivot language by a user default language
            Dictionary<PivotGridStringId, string> texts = new Dictionary<PivotGridStringId, string>
            {
                [PivotGridStringId.PrintDesignerDataHeaders] = Resource.DataHeaders,
                [PivotGridStringId.GrandTotal] = Resource.GrandTotal,
                [PivotGridStringId.TotalFormat] = "{0} " + Resource.Total,
                [PivotGridStringId.Total] = Resource.Total
            };
            PivotGridLocalizer.Active = new CustomPivotGridLocalizer(texts);

            PivotGridSettings settings = new PivotGridSettings();
            settings.Name = FieldSetting.ComponentId ?? "pivotGrid";
            settings.Width = Unit.Percentage(100);
            settings.Height = Unit.Pixel(600);
            settings.OptionsBehavior.SortBySummaryDefaultOrder = DevExpress.XtraPivotGrid.PivotSortBySummaryOrder.Descending;

            SetOptionsCustomization(isBlockDisplayChange, settings);
            SetOptionsPager(settings);

            int rowAreaCount;
            int dataAreaCount;
            GetAreaCount(fields, out rowAreaCount, out dataAreaCount);

            SetOptionsView(settings, rowAreaCount, dataAreaCount);
            SetGrandTotalsManagement(settings);
            SetClientSideEvents(settings);
            SetCallbackRouteValues(settings);
            SetHtmlCellPrepared(settings);
            SetHtmlFieldValuePrepared(settings);

            SetCustomCellDisplayText(settings);
            SetContextMenu(settings);
            SetPivotGridField(fields, settings);
            SetPivotGridSettingsFormat(settings, null, fields);
            SetCustomSortForEnum(fields, settings);

            // if call pivot first time
            if (!FieldSetting.IsCalledBack)
            {
                SetSortBySummaryField(settings.Fields);

                string layoutId = GetLayoutId(FieldSetting.Id.ToString());

                if (FieldSetting.IsNeedResetLayout)
                    HttpContext.Current.Session.Remove(layoutId);

                string layoutStateString = HttpContext.Current.Session[layoutId] != null ?
                                           HttpContext.Current.Session[layoutId].ToString() :
                                           !string.IsNullOrEmpty(FieldSetting.Layout) ? FieldSetting.Layout : string.Empty;

                if (!string.IsNullOrEmpty(layoutStateString))
                {
                    PreRenderEvent(fields, settings, layoutStateString);
                    EndRefreshEvent(settings, layoutId);
                }
                else
                {
                    PreRenderEvent(settings, layoutId);
                }
            }
            else
            {
                BeforeGetCallbackResultEvent(fields, settings);
                AfterPerformCallbackEvent(settings);
            }

            settings.CustomJsProperties = (sender, e) =>
            {
                MVCxPivotGrid pivot = (MVCxPivotGrid)sender;
                string layoutId = GetLayoutId(FieldSetting.Id.ToString());
                e.Properties["cpLayout"] = HttpContext.Current.Session[layoutId];
                e.Properties["cpAbsoluteColumnIndex"] = pivot.GetAbsoluteColumnIndex(0);
            };

            return settings;
        }

        public DataTable GetPivotDataTable(dynamic fields, dynamic rows, PivotSettings fieldSettings)
        {
            var cultureInfo = GetCultureInfo();

            DataTable pivotDataTable = new DataTable();

            int columnIndex = 0;

            Dictionary<string, EAPivotField> fieldsInfo = new Dictionary<string, EAPivotField>();
            List<EAPivotField> allFields = fieldSettings.GetFields();

            foreach (string fieldName in fields)
            {
                string newFieldName = fieldName.ToLowerInvariant();

                // Create column name by using field name in rows result
                EAPivotField fieldInfo = allFields.First(w => w.FieldName.Equals(newFieldName, StringComparison.InvariantCultureIgnoreCase));
                fieldsInfo.Add(newFieldName, fieldInfo);

                // Create column follow field type
                DataColumn column = new DataColumn(newFieldName, GetDataType(fieldInfo.DataType, fieldInfo.Bucket.Operator));
                column.AllowDBNull = true;
                pivotDataTable.Columns.Add(column);

                columnIndex++;
            }

            if (rows != null && rows.Count != 0)
            {
                foreach (var row in rows)
                {
                    DataRow myNewRow = GetDataRow(pivotDataTable.NewRow(), fields, row, fieldsInfo, cultureInfo);
                    pivotDataTable.Rows.Add(myNewRow);
                }
            }
            else
            {
                DataRow myNewRow = GetDataRow(pivotDataTable.NewRow(), fields, null, fieldsInfo, cultureInfo);
                pivotDataTable.Rows.Add(myNewRow);
            }

            return pivotDataTable;
        }

        #endregion

        #region Private methods

        private static bool IsIntegerDataType(EveryAngleEnums.FIELDTYPE fieldType)
        {
            return EveryAngleEnums.FIELDTYPE.PERIOD == fieldType
                || EveryAngleEnums.FIELDTYPE.INT == fieldType
                || EveryAngleEnums.FIELDTYPE.TIME == fieldType;
        }
        private static bool IsDoubleDataType(EveryAngleEnums.FIELDTYPE fieldType)
        {
            return EveryAngleEnums.FIELDTYPE.DOUBLE == fieldType
                || EveryAngleEnums.FIELDTYPE.CURRENCY == fieldType
                || EveryAngleEnums.FIELDTYPE.PERCENTAGE == fieldType
                || EveryAngleEnums.FIELDTYPE.TIMESPAN == fieldType;
        }
        private static bool IsDateTimeDataType(EveryAngleEnums.FIELDTYPE fieldType)
        {
            return EveryAngleEnums.FIELDTYPE.DATE == fieldType
                || EveryAngleEnums.FIELDTYPE.DATETIME == fieldType;

        }

        private static List<string> AddDefaultFields(PivotSettings fieldSettings)
        {
            return fieldSettings.GetFields().Where(w => w.IsSelected).Select(s => s.FieldName).ToList();
        }

        private static dynamic AddResultDataRows(List<dynamic> resultDataRows, List<Task<JObject>> tasks)
        {
            dynamic dataRowsDynamicDataResult = null;
            foreach (Task<JObject> task in tasks)
            {
                dataRowsDynamicDataResult = JObject.FromObject(task.Result);

                if (dataRowsDynamicDataResult.rows != null)
                    resultDataRows.AddRange(dataRowsDynamicDataResult.rows.ToObject<List<dynamic>>());
                else if (dataRowsDynamicDataResult.reason != null)
                    return null;
            }
            return dataRowsDynamicDataResult;
        }

        private void AddGroupRequests(List<List<string>> uriGroups, string dataRowsUri, int requestPerGroup, int itemsPerPage, long totalPage)
        {
            for (int index = 0; index < totalPage; index++)
            {
                // create group of request if not exists
                int groupIndex = index / requestPerGroup;
                if (!uriGroups.IsValidIndex(groupIndex))
                    uriGroups.Add(new List<string>());

                // add each requests to group
                string requestDataRowsURI = string.Format("{0}?offset={1}&limit={2}", dataRowsUri, index * itemsPerPage, itemsPerPage);
                uriGroups[groupIndex].Add(requestDataRowsURI);
            }
        }

        private void AddNewDataRow(DataRow newDataRow, dynamic row, CultureInfo cultureInfo, int columnIndex, string fieldName, EveryAngleEnums.FIELDTYPE fieldType)
        {
            if (fieldType == EveryAngleEnums.FIELDTYPE.ENUMERATED)
                AddNewDataRowTypeEnumerated(newDataRow, row, columnIndex, fieldName);
            else if (fieldType == EveryAngleEnums.FIELDTYPE.BOOLEAN)
                AddNewDataRowTypeBoolean(newDataRow, row, columnIndex, fieldName);
            else if (fieldType == EveryAngleEnums.FIELDTYPE.PERIOD)
                AddNewDataRowTypePeriod(newDataRow, row, cultureInfo, columnIndex, fieldName);
            else if (IsDateTimeDataType(fieldType))
                AddNewDataRowTypeDateTime(newDataRow, row, cultureInfo, columnIndex, fieldName);
            else if (fieldType == EveryAngleEnums.FIELDTYPE.CURRENCY)
                AddNewDataRowTypeCurrency(newDataRow, row, cultureInfo, columnIndex, fieldName);
            else if (IsDoubleDataType(fieldType))
                AddNewDataRowTypePercentageOrDouble(newDataRow, row, cultureInfo, columnIndex, fieldName);
            else
                AddNewDataRowTypeUnknown(newDataRow, row, columnIndex, fieldName);
        }

        private static void AddNewDataRowTypeEnumerated(DataRow newDataRow, dynamic row, int columnIndex, string fieldName)
        {
            if (row.field_values[columnIndex] == null)
            {
                newDataRow[fieldName] = DBNull.Value;
            }
            else
            {
                newDataRow[fieldName] = row.field_values[columnIndex].Value;
            }
        }

        private static void AddNewDataRowTypeUnknown(DataRow newDataRow, dynamic row, int columnIndex, string fieldName)
        {
            if (row.field_values[columnIndex] != null && !string.IsNullOrEmpty(row.field_values[columnIndex].ToString()))
                newDataRow[fieldName] = row.field_values[columnIndex];
        }

        private void AddNewDataRowTypePeriod(DataRow newDataRow, dynamic row, CultureInfo cultureInfo, int columnIndex, string fieldName)
        {
            if (row.field_values[columnIndex] == null)
            {
                newDataRow[fieldName] = DBNull.Value;
            }
            else
            {
                if (long.TryParse(row.field_values[columnIndex].ToString(), out long intResult))
                    newDataRow[fieldName] = ParseRowNumberValue<long>(row.field_values[columnIndex].ToString(), cultureInfo);
                else if (double.TryParse(row.field_values[columnIndex].ToString(), out double doubleResult))
                    newDataRow[fieldName] = ParseRowNumberValue<double>(row.field_values[columnIndex].ToString(), cultureInfo);
            }
        }

        private void AddNewDataRowTypeBoolean(DataRow newDataRow, dynamic row, int columnIndex, string fieldName)
        {
            if (row.field_values[columnIndex] == null)
            {
                newDataRow[fieldName] = DBNull.Value;
            }
            else
            {
                newDataRow[fieldName] = ParseRowValue<bool>(row.field_values[columnIndex].ToString());
            }
        }

        private void AddNewDataRowTypePercentageOrDouble(DataRow newDataRow, dynamic row, CultureInfo cultureInfo, int columnIndex, string fieldName)
        {
            if (row.field_values[columnIndex] == null)
            {
                newDataRow[fieldName] = DBNull.Value;
            }
            else
            {
                newDataRow[fieldName] = ParseRowNumberValue<double>(row.field_values[columnIndex].ToString(), cultureInfo);
            }
        }

        private void AddNewDataRowTypeCurrency(DataRow newDataRow, dynamic row, CultureInfo cultureInfo, int columnIndex, string fieldName)
        {
            if (row.field_values[columnIndex] == null)
            {
                newDataRow[fieldName] = DBNull.Value;
            }
            else
            {
                newDataRow[fieldName] = ParseCurrencyValue(row.field_values[columnIndex], cultureInfo);
            }
        }

        private void AddNewDataRowTypeDateTime(DataRow newDataRow, dynamic row, CultureInfo cultureInfo, int columnIndex, string fieldName)
        {
            if (row.field_values[columnIndex] == null)
            {
                newDataRow[fieldName] = DBNull.Value;
            }
            else
            {
                object longValue = ParseRowNumberValue<long>(row.field_values[columnIndex].ToString(), cultureInfo);
                newDataRow[fieldName] = longValue != DBNull.Value ? DateTimeUtils.UnixTimestampToDateTime((long)longValue) : longValue;
            }
        }

        public void SetPivotGridSettingsFormat(PivotGridSettings pivotGridSettings, object sender, List<EAPivotField> fields)
        {
            Dictionary<string, EAPivotField> fieldList = fields.ToDictionary(x => x.FieldName.ToLowerInvariant(), x => x);
            foreach (MVCxPivotGridField existingPivotField in pivotGridSettings.Fields)
            {
                string fieldName = existingPivotField.FieldName;
                PivotGridField field = sender != null ? ((MVCxPivotGrid)sender).Fields[fieldName] : pivotGridSettings.Fields[fieldName];

                if (field != null)
                {
                    EAPivotField dataField = fieldList[fieldName];
                    FormatType formatType = (FormatType)dataField.CellFormatType;
                    field.ValueFormat.FormatType = formatType;
                    field.ValueFormat.FormatString = dataField.CellFormat;
                    field.CellFormat.FormatType = formatType;
                    field.CellFormat.FormatString = dataField.CellFormat;

                    // Reassign caption to fix restore layout use old caption
                    field.Caption = dataField.Caption;
                    SetFieldCaption(dataField, field);

                    if (formatType == FormatType.Custom)
                    {
                        SetCustomFieldFormat(ref field, dataField);
                    }
                }
            }
        }

        private static bool IsAveragePeriodOperator(string type, string fieldOperator)
        {
            EveryAngleEnums.FIELDTYPE fieldType = EnumHelper.ParseEnum<EveryAngleEnums.FIELDTYPE>(type);
            return fieldOperator.StartsWith("average", StringComparison.OrdinalIgnoreCase) && fieldType.Equals(EveryAngleEnums.FIELDTYPE.PERIOD);
        }

        private void SetCustomFieldFormat(ref PivotGridField field, EAPivotField dataField)
        {
            if (RangeFormatHelper.IsRangeFormat(dataField.Bucket.Operator))
            {
                field.ValueFormat.Format = new RangeFormatter(dataField.CellFormat, dataField.Bucket.Operator);
                field.CellFormat.Format = new RangeFormatter(dataField.CellFormat, dataField.Bucket.Operator);
            }
            else if (DateFormatHelper.IsCustomDateFormat(dataField.CellFormat))
            {
                // format type & year format
                string yearFormat = GetYearFormatFromUserSetting(HttpContext.Current.Session["UserSettingsViewModel"] as UserSettingsViewModel);
                DateFormatType dateFormatType = DateFormatHelper.GetFormatType(dataField.CellFormat);

                field.ValueFormat.Format = new DateFormatter(dateFormatType, yearFormat);
                field.CellFormat.Format = new DateFormatter(dateFormatType, yearFormat);
            }
            else if (IsWeekBucketDateTime(dataField))
            {
                // first day of week & year format
                string yearFormat = GetYearFormatFromUserSetting(HttpContext.Current.Session["UserSettingsViewModel"] as UserSettingsViewModel);
                DayOfWeek firstDayOfWeek = FieldSetting.FirstDayOfWeek;

                field.ValueFormat.Format = new WeekFormatter(firstDayOfWeek, yearFormat, Resource.WeekFormat);
                field.CellFormat.Format = new WeekFormatter(firstDayOfWeek, yearFormat, Resource.WeekFormat);
            }
            else if (IsCustomEnumerated(dataField))
            {
                // if bucket not individual then dont format it, show id that already substring from AS
                dynamic domain = GetDomainElementsByUri(dataField.DomainURI);
                JArray domainElements = JArray.FromObject(domain.elements);
                Dictionary<object, string> enumMapper = EnumFormatHelper.GetFormattedEnums(dataField.CellFormat, domainElements);

                field.ValueFormat.Format = new EnumFormatter(enumMapper, false);
                field.CellFormat.Format = new EnumFormatter(enumMapper, false);
                field.SortMode = PivotSortMode.Custom;

            }
            else if (dataField.CellFormat.Contains("h]"))
            {
                field.ValueFormat.Format = new TimeSpanFormatter(Resource.Days);
                field.CellFormat.Format = new TimeSpanFormatter(Resource.Days);
            }
            else if (EveryAngleEnums.FIELDTYPE.PERIOD.ToString().Equals(dataField.DataType, StringComparison.InvariantCultureIgnoreCase))
            {
                string unitText = GetPeriodUnitText(dataField.Bucket.Operator);
                PeriodFormatter periodFormatter = new PeriodFormatter(dataField.CellFormat, dataField.Bucket.Operator, unitText);
                field.ValueFormat.Format = periodFormatter;
                field.CellFormat.Format = periodFormatter;
            }
            else if (EveryAngleEnums.FIELDTYPE.TIME.ToString().Equals(dataField.DataType, StringComparison.InvariantCultureIgnoreCase))
            {
                TimeFormatter timeFormatter = new TimeFormatter(true);
                field.ValueFormat.Format = timeFormatter;
                field.CellFormat.Format = timeFormatter;
            }
        }

        private string GetPeriodUnitText(string bucketOperator)
        {
            string unitText = ResourceHelper.GetLocalization($"Period_Unit_{bucketOperator}");
            return unitText;
        }

        private bool IsCustomEnumerated(EAPivotField eaField)
        {
            return !string.IsNullOrEmpty(eaField.DomainURI) && eaField.Bucket.Operator == "individual";
        }

        private bool IsWeekBucketDateTime(EAPivotField eaField)
        {
            EveryAngleEnums.FIELDTYPE fieldType = EnumHelper.ParseEnum<EveryAngleEnums.FIELDTYPE>(eaField.DataType);
            return (fieldType == EveryAngleEnums.FIELDTYPE.DATE || fieldType == EveryAngleEnums.FIELDTYPE.DATETIME) && eaField.Bucket.Operator == "week";
        }

        private EAPivotField GetFieldSettingMetaData(string fieldName, PivotSettings fieldSettings)
        {
            return fieldSettings.GetFields().FirstOrDefault(w => w.FieldName.Equals(fieldName, StringComparison.InvariantCultureIgnoreCase));
        }

        private int GetIndexOfDomainElementByElementId(dynamic domainElement, string id)
        {
            int index = 0;
            if (domainElement != null && domainElement.elements != null)
            {
                foreach (dynamic element in domainElement.elements)
                {
                    if (element.id.Value == id)
                        break;
                    index++;
                }
            }
            return index;
        }

        public void SetSortBySummaryField(MVCxPivotGridFieldCollection fields)
        {
            if (FieldSetting.SortBySummaryInfo == null)
                return;

            foreach (SortBySummary sortInfo in FieldSetting.SortBySummaryInfo)
            {
                PivotGridField sortField = fields[sortInfo.sort_field.ToLowerInvariant()];
                if (sortField != null)
                {
                    bool hasSortDirection = !string.IsNullOrEmpty(sortInfo.sort_direction);
                    bool canSortBySummary = !sortInfo.clear_all && hasSortDirection;
                    PivotGridField summaryField = !canSortBySummary ? null : fields[sortInfo.summary_field.ToLowerInvariant()];

                    sortField.SortBySummaryInfo.Conditions.Clear();
                    sortField.SortBySummaryInfo.Field = summaryField;

                    if (canSortBySummary && sortInfo.summary_conditions != null)
                    {
                        SetSortBySummaryConditionFields(fields, sortField, sortInfo.summary_conditions);
                    }

                    if (hasSortDirection)
                    {
                        sortField.SortOrder = GetSortDirection(sortInfo.sort_direction);
                    }
                }
            }
        }

        private void SetSortBySummaryConditionFields(MVCxPivotGridFieldCollection fields, PivotGridField sortField, List<SortBySummaryConditionField> conditionFields)
        {
            foreach (SortBySummaryConditionField sortBySummaryConditionField in conditionFields)
            {
                object sortSummaryValue = sortBySummaryConditionField.value == "null" ? null : sortBySummaryConditionField.value;
                PivotGridFieldSortCondition sortCondition = new PivotGridFieldSortCondition(fields[sortBySummaryConditionField.fieldname.ToLowerInvariant()], sortSummaryValue);
                sortField.SortBySummaryInfo.Conditions.Add(sortCondition);
            }
        }

        private PivotSortOrder GetSortDirection(string sorting)
        {
            return sorting == "1" || sorting == "desc" ? PivotSortOrder.Descending : PivotSortOrder.Ascending;
        }

        private void GetAreaCount(List<EAPivotField> fields, out int rowAreaCount, out int dataAreaCount)
        {
            rowAreaCount = fields.Count(c => c.IsSelected && (PivotArea)c.Area == PivotArea.RowArea);
            rowAreaCount = rowAreaCount == 0 ? 1 : rowAreaCount;
            dataAreaCount = fields.Count(c => c.IsSelected && (PivotArea)c.Area == PivotArea.DataArea);
            if (FieldSetting.PercentageSummaryType != PivotEnums.PercentageSummaryType.None)
            {
                dataAreaCount *= 2;
            }
        }

        private bool IsBlockDisplayChange()
        {
            bool isBlockDisplayChange = false;

            if (!FieldSetting.IsDashBoardMode && !string.IsNullOrEmpty(FieldSetting.AnglePrivilege))
            {
                dynamic anglePrivilege = JsonConvert.DeserializeObject<dynamic>(FieldSetting.AnglePrivilege);
                isBlockDisplayChange = anglePrivilege.block_display_change ?? false;
            }
            return isBlockDisplayChange;
        }

        private static CultureInfo GetCultureInfo()
        {
            var cultureInfo = CultureInfo.InvariantCulture.Clone() as CultureInfo;
            cultureInfo.NumberFormat.NumberDecimalSeparator = Thread.CurrentThread.CurrentCulture.NumberFormat.NumberDecimalSeparator;
            cultureInfo.NumberFormat.NumberGroupSeparator = Thread.CurrentThread.CurrentCulture.NumberFormat.NumberGroupSeparator;
            return cultureInfo;
        }

        private static void LoadCollapsedStateFromString(MVCxPivotGrid grid, dynamic layoutState)
        {
            if (layoutState.collapse != null && !string.IsNullOrEmpty(layoutState.collapse.ToString()))
            {
                grid.LoadCollapsedStateFromString(layoutState.collapse.ToString());
            }
        }

        private void LoadLayoutFromString(MVCxPivotGrid grid, dynamic layoutState)
        {
            if (layoutState.layout != null && !string.IsNullOrEmpty(layoutState.layout.ToString()))
            {
                grid.LoadLayoutFromString(layoutState.layout.ToString(), PivotGridWebOptionsLayout.FullLayout);
            }
        }

        private void SaveLayoutFromPivotGrid(MVCxPivotGrid grid, string layoutId)
        {
            string layout = JsonConvert.SerializeObject(new
            {
                collapse = grid.SaveCollapsedStateToString()
            });
            HttpContext.Current.Session[layoutId] = layout;
            FieldSetting.Layout = layout;
        }

        private void AfterPerformCallbackEvent(PivotGridSettings settings)
        {
            settings.AfterPerformCallback = (sender, e) =>
            {
                SaveLayoutFromPivotGrid(sender as MVCxPivotGrid, GetLayoutId(FieldSetting.Id.ToString()));
            };
        }

        private void BeforeGetCallbackResultEvent(List<EAPivotField> fields, PivotGridSettings settings)
        {
            settings.BeforeGetCallbackResult = (sender, e) =>
            {
                SetPivotGridSettingsFormat(settings, sender, fields);
            };
        }

        private void PreRenderEvent(PivotGridSettings settings, string layoutId)
        {
            settings.PreRender = (sender, e) =>
            {
                RefreshLayout(sender, layoutId);
            };
        }

        private void PreRenderEvent(List<EAPivotField> fields, PivotGridSettings settings, string layoutStateString)
        {
            settings.PreRender = (sender, e) =>
            {
                try
                {
                    MVCxPivotGrid grid = sender as MVCxPivotGrid;
                    dynamic layoutState = JsonConvert.DeserializeObject(layoutStateString);
                    LoadLayoutFromString(grid, layoutState);
                    LoadCollapsedStateFromString(grid, layoutState);
                }
                catch
                {
                    //do nothing
                }

                SetPivotGridSettingsFormat(settings, sender, fields);

                SetSortBySummaryField(settings.Fields);
            };
        }

        private void EndRefreshEvent(PivotGridSettings settings, string layoutId)
        {
            settings.EndRefresh = (sender, e) =>
            {
                RefreshLayout(sender, layoutId);
            };
        }

        private void RefreshLayout(object sender, string layoutId)
        {
            SaveLayoutFromPivotGrid(sender as MVCxPivotGrid, layoutId);
        }

        private void SetFieldCaption(EAPivotField field, PivotGridField pivotField)
        {
            // add new line if it's <SOURCE> - <FIELD>
            pivotField.Caption = WebUtility.HtmlEncode(pivotField.Caption);
            if (field.DefaultCaption == field.Caption)
            {
                pivotField.Caption = pivotField.Caption.Replace(" - ", REPLACE_CAPTION_HEADER);
            }
        }

        public void SetPivotGridField(List<EAPivotField> fields, PivotGridSettings settings)
        {
            int areaIndex = 0;

            for (int index = 0; index < fields.Count; index++)
            {
                EAPivotField field = fields[index];
                if (field.IsSelected)
                {
                    string fieldName = field.FieldName.ToLowerInvariant();
                    PivotArea area = (PivotArea)field.Area;
                    MVCxPivotGridField pivotGridField = new MVCxPivotGridField(fieldName, area);
                    pivotGridField.Caption = field.Caption;
                    pivotGridField.AreaIndex = areaIndex;
                    pivotGridField.HeaderStyle.CssClass = field.CssClass;
                    pivotGridField.Options.AllowSortBySummary = DefaultBoolean.True;
                    pivotGridField.Options.AllowDrag = DefaultBoolean.False;

                    // sorting
                    dynamic fieldDetails = JsonConvert.DeserializeObject(field.FieldDetails);
                    pivotGridField.SortOrder = GetSortDirection(fieldDetails.sorting.Value);

                    // set summary type
                    if (area == PivotArea.DataArea)
                    {
                        pivotGridField.SummaryType = GetPivotSummaryType(field.Bucket.Operator);
                    }

                    settings.Fields.Add(pivotGridField);
                    areaIndex++;

                    // Add percentage field
                    if (FieldSetting.PercentageSummaryType != PivotEnums.PercentageSummaryType.None
                        && area == PivotArea.DataArea)
                    {
                        MVCxPivotGridField summaryField = GetSummaryField(field, pivotGridField, FieldSetting.PercentageSummaryType, areaIndex);
                        settings.Fields.Add(summaryField);
                        areaIndex++;
                    }
                }
            }
        }

        private MVCxPivotGridField GetSummaryField(EAPivotField eaField, MVCxPivotGridField sourceField, PivotEnums.PercentageSummaryType percentageSummaryType, int areaIndex)
        {
            MVCxPivotGridField summaryField = new MVCxPivotGridField(sourceField.FieldName, PivotArea.DataArea);
            summaryField.AreaIndex = areaIndex;
            summaryField.CellStyle.CssClass = "PercentageSummaryCell";

            switch (percentageSummaryType)
            {
                case PivotEnums.PercentageSummaryType.Row:
                    summaryField.SummaryDisplayType = PivotSummaryDisplayType.PercentOfRowGrandTotal;
                    summaryField.Caption = string.Format(Captions.Pivot_PercentOfRow, sourceField.Caption);
                    break;
                case PivotEnums.PercentageSummaryType.Column:
                    summaryField.SummaryDisplayType = PivotSummaryDisplayType.PercentOfColumnGrandTotal;
                    summaryField.Caption = string.Format(Captions.Pivot_PercentOfColumn, sourceField.Caption);
                    break;
                case PivotEnums.PercentageSummaryType.Total:
                    summaryField.SummaryDisplayType = PivotSummaryDisplayType.PercentOfGrandTotal;
                    summaryField.Caption = string.Format(Captions.Pivot_PercentOfTotal, sourceField.Caption);
                    break;
                default:
                    break;
            }

            string decimalsPercentageFormat = GetDecimalsPercentageFromUserSetting(HttpContext.Current.Session["UserSettingsViewModel"] as UserSettingsViewModel);

            // To format field value
            summaryField.ValueFormat.FormatType = FormatType.Numeric;
            summaryField.ValueFormat.FormatString = String.Format("p{0}", decimalsPercentageFormat);

            // To format summary cell
            summaryField.CellFormat.FormatType = FormatType.Numeric;
            summaryField.CellFormat.FormatString = String.Format("p{0}", decimalsPercentageFormat);

            // adjust caption for html
            SetFieldCaption(eaField, summaryField);

            return summaryField;
        }

        private static void SetCallbackRouteValues(PivotGridSettings settings)
        {
            settings.CallbackRouteValues = new
            {
                Controller = "Pivot",
                Action = "PivotGridCallBackPartial"
            };
        }

        private void SetHtmlCellPrepared(PivotGridSettings settings)
        {
            settings.HtmlCellPrepared += CustomHtmlCellPrepared;
        }
        private void CustomHtmlCellPrepared(object sender, PivotHtmlCellPreparedEventArgs e)
        {
            e.Cell.Style.Clear();

            if (e.Cell.Text.Equals(NON_BRAKING_SPACE))
            {
                e.Cell.Text = "";
                e.Cell.Attributes.Remove("onclick");
            }
            else if (this.CanDrilldown)
            {
                e.Cell.Style.Add("cursor", "pointer");
            }

            //Set Color to Total Cell
            var cellItem = ((DevExpress.Web.ASPxPivotGrid.PivotCellBaseEventArgs)(e)).CellItem;
            string colorClass = GetCellBackgroundColor(cellItem.IsTotalAppearance,
                                                    cellItem.IsGrandTotalAppearance,
                                                    cellItem.ColumnFieldValueItem.IsTotal,
                                                    cellItem.RowFieldValueItem.IsTotal);
            if (colorClass != null)
            {
                string cellClass = e.Cell.ControlStyle.CssClass;
                e.Cell.ControlStyle.CssClass = string.Format("{0} {1}", cellClass, colorClass);
            }
        }

        private void SetHtmlFieldValuePrepared(PivotGridSettings settings)
        {
            _domainImageFolderList = GetDomainImageFolderList();
            settings.HtmlFieldValuePrepared += CustomHtmlFieldValuePrepared;
        }
        private void CustomHtmlFieldValuePrepared(object sender, PivotHtmlFieldValuePreparedEventArgs e)
        {
            e.Cell.Style.Clear();

            int literalControlIndex = GetLiteralControlControlIndex(e.Cell.Controls);
            if (literalControlIndex != -1)
            {
                // set caption by remove encoded html
                string caption = EncodeCaption(e, literalControlIndex);

                // set domain element icon
                SetHtmlFieldIcon(e, caption, literalControlIndex);
            }

            // set data-value attribute
            if (e.ValueType == PivotGridValueType.Value
                || e.ValueType == PivotGridValueType.Total)
            {
                string dataValue;
                if (e.Value == null)
                {
                    string nullText = e.Field.ValueFormat.Format is EnumFormatter
                                    ? HttpUtility.HtmlEncode(e.Field.ValueFormat.GetDisplayText(DBNull.Value))
                                    : "null";
                    SetNullText(e, nullText);
                    dataValue = "NULL";
                }
                else
                {
                    dataValue = Convert.ToString(e.Value);
                }
                e.Cell.Attributes.Add("data-value", dataValue);
            }
        }

        private int GetLiteralControlControlIndex(ControlCollection controls)
        {
            int index = -1;
            for (int loop = 0; loop < controls.Count; loop++)
            {
                if (controls[loop] is LiteralControl)
                {
                    index = loop;
                    break;
                }
            }
            return index;
        }


        internal string GetCellBackgroundColor(
            bool isTotalAppearance,
            bool isGrandTotalAppearance,
            bool isColumnFieldValueItemTotal,
            bool isRowFieldValueItemTotal)
        {
            if (IsSubWithSubTotal(isTotalAppearance, isGrandTotalAppearance, isColumnFieldValueItemTotal, isRowFieldValueItemTotal))
                return "subWithSubTotal";
            else if (IsSubWithGrandTotal(isTotalAppearance, isGrandTotalAppearance))
                return "subWithGrandTotal";
            else if (IsGrandWithGrandTotal(isGrandTotalAppearance, isColumnFieldValueItemTotal, isRowFieldValueItemTotal))
                return "grandWithGrandTotal";
            else
                return null;
        }
        private bool IsSubWithSubTotal(
            bool isTotalAppearance,
            bool isGrandTotalAppearance,
            bool isColumnFieldValueItemTotal,
            bool isRowFieldValueItemTotal)
        {
            return isTotalAppearance && !isGrandTotalAppearance && isColumnFieldValueItemTotal && isRowFieldValueItemTotal;
        }
        private bool IsSubWithGrandTotal(bool isTotalAppearance, bool isGrandTotalAppearance)
        {
            return isTotalAppearance && isGrandTotalAppearance;
        }
        private bool IsGrandWithGrandTotal(bool isGrandTotalAppearance, bool isColumnFieldValueItemTotal, bool isRowFieldValueItemTotal)
        {
            return isGrandTotalAppearance && isColumnFieldValueItemTotal && isRowFieldValueItemTotal;
        }

        private static string EncodeCaption(PivotHtmlFieldValuePreparedEventArgs e, int index)
        {
            string caption = ((LiteralControl)e.Cell.Controls[index]).Text;
            string endcodeCaption = HttpUtility.HtmlEncode(REPLACE_CAPTION_HEADER);
            if (caption.Contains(endcodeCaption))
            {
                e.Cell.Controls.RemoveAt(index);
                e.Cell.Controls.AddAt(index, new LiteralControl(caption.Replace(endcodeCaption, REPLACE_CAPTION_DATA)));
            }
            return caption;
        }

        public void SetHtmlFieldIcon(PivotHtmlFieldValuePreparedEventArgs e, string caption, int index)
        {
            if (e.Field == null)
                return;

            EAPivotField field = GetFieldSettingMetaData(e.Field.FieldName, FieldSetting);
            if (field == null)
                return;

            string folder = GetDomainImageFolder(field, _domainImageFolderList);
            if (folder == null)
                return;

            var className = $"icon-{folder}{e.Value}";

            e.Cell.Controls.RemoveAt(index);
            e.Cell.Controls.AddAt(index, new LiteralControl(string.Format("<span class=\"domainIcon {0}\"></span>{1}", className, caption)));
        }

        internal string GetDomainImageFolder(EAPivotField field, string[] domainImageFolderList)
        {
            if (IsCustomEnumerated(field))
            {
                dynamic domainElement = GetDomainElementsByUri(field.DomainURI);
                string domainId = domainElement.id;
                string domainFolder = domainId.Split('_').Last();
                if (domainImageFolderList.Any(x => x.Equals(domainFolder, StringComparison.OrdinalIgnoreCase)))
                    return domainFolder.ToLowerInvariant();
            }
            return null;
        }

        private void SetNullText(PivotHtmlFieldValuePreparedEventArgs e, string nullText)
        {
            int index = -1;
            string text = GetControlNullText(e.Cell.Controls[0], nullText, ref index);

            if (index != -1)
            {
                e.Cell.Controls.RemoveAt(index);
                e.Cell.Controls.AddAt(index, new LiteralControl(text));
            }
        }

        public string GetControlNullText(Control control, string nullText, ref int updateIndex)
        {
            if (control is LiteralControl)
            {
                string text = ((LiteralControl)control).Text;
                if (text.EndsWith(NON_BRAKING_SPACE, StringComparison.InvariantCulture))
                {
                    updateIndex = 0;
                    return text.Replace(NON_BRAKING_SPACE, nullText);
                }
                else if (text.Equals(" Total", StringComparison.InvariantCulture))
                {
                    updateIndex = 0;
                    return string.Format("{0} Total", nullText);
                }
            }
            else if (control is DevExpress.Web.Internal.InternalImage)
            {
                string text = ((LiteralControl)control.Parent.Controls[1]).Text;
                updateIndex = 1;
                return text.Replace(NON_BRAKING_SPACE, nullText);
            }
            return null;
        }

        private static string[] GetDomainImageFolderList()
        {
            string defualtDomainImageFolder = "Domains";
            string webconfigDomainImageFolder = WebConfigHelper.GetAppSettingByKey("DomainImageFolderName");
            string domainImagefolder = string.IsNullOrEmpty(webconfigDomainImageFolder) ? defualtDomainImageFolder : webconfigDomainImageFolder;

            string path = System.Web.HttpContext.Current.Server.MapPath(@"~/Images/" + domainImagefolder);

            IList<string> foldersName = new List<string>();

            string[] picFolders = Directory.GetDirectories(path);

            foreach (var fpath in picFolders)
            {
                DirectoryInfo dInfo = new DirectoryInfo(fpath);
                foldersName.Add(dInfo.Name);
            }

            return foldersName.ToArray();
        }

        private void SetCustomCellDisplayText(PivotGridSettings settings)
        {
            settings.CustomCellDisplayText = (sender, e) =>
            {
                if (IsEmptyCellValue(e))
                {
                    e.DisplayText = string.Empty;
                }
            };
        }

        private bool IsEmptyCellValue(PivotCellDisplayTextEventArgs e)
        {
            bool isEmptyValue = false;
            if (e.Value == null)
                isEmptyValue = true;
            else if (e.Value.ToString() == "0")
            {
                PivotDrillDownDataSource ds = e.CreateDrillDownDataSource();
                bool foundValue = false;
                int i;
                int rowCount = ds.RowCount;
                for (i = 0; i < rowCount; i++)
                {
                    if (ds[i][e.DataField.FieldName] != null)
                    {
                        foundValue = true;
                        break;
                    }
                }
                isEmptyValue = !foundValue;
            }
            return isEmptyValue;
        }

        private static void SetOptionsPager(PivotGridSettings settings)
        {
            settings.OptionsPager.RowsPerPage = 30;
            settings.OptionsPager.ColumnsPerPage = 30;
            settings.OptionsPager.Visible = false;
        }

        private void SetOptionsView(PivotGridSettings settings, int rowAreaCount, int dataAreaCount)
        {
            if (dataAreaCount > rowAreaCount * 2)
            {
                settings.OptionsView.DataHeadersDisplayMode = PivotDataHeadersDisplayMode.Popup;
                settings.OptionsView.DataHeadersPopupMinCount = 1;
            }
            else
            {
                settings.OptionsView.DataHeadersDisplayMode = PivotDataHeadersDisplayMode.Default;
            }
            settings.OptionsView.ShowColumnHeaders = true;
            settings.OptionsView.ShowRowHeaders = true;
            settings.OptionsView.ShowDataHeaders = true;
            settings.OptionsView.VerticalScrollingMode = PivotScrollingMode.Virtual;
            settings.OptionsView.HorizontalScrollingMode = PivotScrollingMode.Virtual;
            settings.OptionsView.VerticalScrollBarMode = ScrollBarMode.Auto;
            settings.OptionsView.HorizontalScrollBarMode = ScrollBarMode.Auto;
            settings.OptionsView.ShowFilterHeaders = false;
        }

        private static void SetOptionsCustomization(bool isBlockDisplayChange, PivotGridSettings settings)
        {
            settings.OptionsCustomization.AllowDrag = false;
            settings.OptionsCustomization.AllowFilter = false;
            settings.OptionsCustomization.AllowPrefilter = false;
            settings.OptionsCustomization.AllowDragInCustomizationForm = false;
            settings.OptionsCustomization.DeferredUpdates = true;
            settings.OptionsCustomization.AllowSortBySummary = true;
            settings.OptionsCustomization.AllowFilterInCustomizationForm = false;
            settings.OptionsCustomization.AllowSort = !isBlockDisplayChange;
            settings.OptionsCustomization.AllowExpand = true;
        }

        private void SetContextMenu(PivotGridSettings settings)
        {
            settings.PopupMenuCreated = (sender, e) =>
            {
                if (e.MenuType == DevExpress.Web.ASPxPivotGrid.PivotGridPopupMenuType.HeaderMenu)
                {
                    e.Menu.Items.Clear();
                }
                else if (e.MenuType == DevExpress.Web.ASPxPivotGrid.PivotGridPopupMenuType.FieldValueMenu)
                {
                    foreach (DevExpress.Web.MenuItem item in e.Menu.Items)
                    {
                        item.Text = item.Text.Replace(REPLACE_CAPTION_HEADER, " - ");
                    }
                }
            };
        }

        #region Custom sort
        private void SetCustomSortForEnum(List<EAPivotField> fields, PivotGridSettings settings)
        {
            Dictionary<string, Dictionary<object, string>> listDisplayElementNames = new Dictionary<string, Dictionary<object, string>>();
            foreach (EAPivotField eaField in fields)
            {
                if (IsCustomEnumerated(eaField))
                {
                    dynamic domain = GetDomainElementsByUri(eaField.DomainURI);
                    JArray domainElements = JArray.FromObject(domain.elements);
                    Dictionary<object, string> displayElementNames = CreateDisplayElementNames(eaField, domainElements);
                    listDisplayElementNames[eaField.FieldName.ToLowerInvariant()] = displayElementNames;
                }
            }

            SetCustomFieldSort(settings, listDisplayElementNames);
        }
        private void SetCustomFieldSort(PivotGridSettings settings, Dictionary<string, Dictionary<object, string>> listDisplayElementNames)
        {
            settings.CustomFieldSort = (sender, e) =>
            {
                string fieldName = e.Field.FieldName;
                Dictionary<object, string> displayElementNames;
                if (listDisplayElementNames.TryGetValue(fieldName, out displayElementNames))
                {
                    e.Handled = true;
                    e.Result = GetSortResult(displayElementNames, e.Value1, e.Value2);
                }
            };
        }
        private Dictionary<object, string> CreateDisplayElementNames(EAPivotField eaField, JArray domainElements)
        {
            Dictionary<object, string> displayElementNames;
            if (eaField.MayBeSorted)
                displayElementNames = EnumFormatHelper.GetFormattedEnums(eaField.CellFormat, domainElements);
            else
            {
                int elementIndex = 0;
                displayElementNames = new Dictionary<object, string>();
                foreach (JToken domainElement in domainElements)
                {
                    string elementName = string.Format("{0:0000000}", elementIndex);
                    string elementId = domainElement.Value<string>("id");
                    if (elementId == null)
                    {
                        if (!displayElementNames.ContainsKey(DBNull.Value))
                            displayElementNames[DBNull.Value] = elementName;
                    }
                    else
                        displayElementNames[elementId] = elementName;
                    elementIndex++;
                }
            }
            return displayElementNames;
        }
        private string GetDisplayElementName(Dictionary<object, string> displayElementNames, object elementId)
        {
            return elementId == null
                ? (displayElementNames.ContainsKey(DBNull.Value) ? displayElementNames[DBNull.Value] : null)
                : (displayElementNames.ContainsKey(elementId) ? displayElementNames[elementId] : elementId.ToString());
        }
        private int GetSortResult(Dictionary<object, string> displayElementNames, object value1, object value2)
        {
            // M4-33287: null element id will show empty text
            if (value1 != value2)
            {
                // null always be the first
                if (value1 == null)
                    return -1;
                if (value2 == null)
                    return 1;

                // ~NotInSet is a second choice to be the first
                if (value1.Equals("~NotInSet"))
                    return -1;
                if (value2.Equals("~NotInSet"))
                    return 1;
            }

            string sortValue1 = GetDisplayElementName(displayElementNames, value1);
            string sortValue2 = GetDisplayElementName(displayElementNames, value2);
            return string.Compare(sortValue1, sortValue2, StringComparison.OrdinalIgnoreCase);
        }
        #endregion

        private void SetClientSideEvents(PivotGridSettings settings)
        {
            settings.ClientSideEvents.BeginCallback = string.Format("{0}{1}", settings.Name, "OnPivotBeginCallback");
            settings.ClientSideEvents.EndCallback = string.Format("{0}{1}", settings.Name, "OnPivotEndCallback");
            settings.ClientSideEvents.CallbackError = string.Format("{0}{1}", settings.Name, "OnPivotClientError");
            if (this.CanDrilldown)
            {
                settings.ClientSideEvents.CellClick = string.Format("{0}{1}", settings.Name, "OnPivotGridCellClick");
            }
        }

        internal void SetGrandTotalsManagement(PivotGridSettings settings)
        {
            switch (FieldSetting.TotalForType)
            {
                case PivotEnums.TotalForType.None:
                    settings.OptionsView.ShowColumnGrandTotals = false;
                    settings.OptionsView.ShowRowGrandTotals = false;
                    break;
                case PivotEnums.TotalForType.RowAndColumn:
                    settings.OptionsView.ShowColumnGrandTotals = true;
                    settings.OptionsView.ShowRowGrandTotals = true;
                    break;
                case PivotEnums.TotalForType.Row:
                    settings.OptionsView.ShowColumnGrandTotals = true;
                    settings.OptionsView.ShowRowGrandTotals = false;
                    break;
                case PivotEnums.TotalForType.Column:
                    settings.OptionsView.ShowColumnGrandTotals = false;
                    settings.OptionsView.ShowRowGrandTotals = true;
                    break;
                default:
                    break;
            }
            settings.OptionsView.ShowGrandTotalsForSingleValues = true;

            settings.OptionsView.ShowColumnTotals = FieldSetting.IsIncludeSubTotals;
            settings.OptionsView.ShowRowTotals = FieldSetting.IsIncludeSubTotals;

            // total position
            PivotTotalsLocation totalsLocation = (PivotTotalsLocation)FieldSetting.TotalsLocation;
            settings.OptionsView.SetBothTotalsLocation(totalsLocation);
        }

        #region Get data from UserSetting

        private string GetYearFormatFromUserSetting(UserSettingsViewModel userSettings)
        {
            JObject dateSettings = string.IsNullOrEmpty(userSettings.format_date)
                                    ? new JObject()
                                    : JsonConvert.DeserializeObject<JObject>(userSettings.format_date);
            return dateSettings.Value<string>("year");
        }

        private string GetDecimalsPercentageFromUserSetting(UserSettingsViewModel userSettings)
        {
            JObject percentageSettings = string.IsNullOrEmpty(userSettings.format_percentages)
                                    ? new JObject()
                                    : JsonConvert.DeserializeObject<JObject>(userSettings.format_percentages);
            string decimals = percentageSettings.Value<string>("decimals");
            return string.IsNullOrEmpty(decimals) ? "0" : decimals;
        }

        #endregion

        #endregion

        #region Internal methods

        internal static object ParseCurrencyValue(JToken jToken, CultureInfo cultureInfo)
        {
            JToken currenciesValue = null;
            if (jToken != null && jToken.HasValues)
                currenciesValue = jToken.FirstOrDefault();

            if (currenciesValue != null && currenciesValue.HasValues)
            {
                try
                {
                    return double.Parse(currenciesValue.FirstOrDefault().ToString(), cultureInfo);
                }
                catch
                {
                    //do nothing
                }

            }

            return DBNull.Value;
        }

        internal static object ParseRowValue<T>(string input)
        {
            if (string.IsNullOrEmpty(input))
                return DBNull.Value;

            try
            {
                var converter = TypeDescriptor.GetConverter(typeof(T));
                if (converter != null)
                {
                    return (T)converter.ConvertFromInvariantString(input);
                }
            }
            catch
            {
                //do nothing
            }

            return default(T);
        }

        internal static object ParseRowNumberValue<T>(string input, CultureInfo cultureInfo)
        {
            //M4-19826: The default value of the numeric should be 0
            if (string.IsNullOrEmpty(input))
            {
                return (T)Convert.ChangeType("0", typeof(T));
            }

            try
            {
                if (typeof(T) == typeof(double))
                {
                    return double.Parse(input, cultureInfo);
                }
                else if (typeof(T) == typeof(long))
                {
                    return long.Parse(input, cultureInfo);
                }
                else if (typeof(T) == typeof(int))
                {
                    return int.Parse(input, cultureInfo);
                }

            }
            catch
            {
                // if conversion failes the default value of T will be returned 
                return input;
            }

            return default(T);
        }

        internal static Type GetDataType(string type, string fieldOperator)
        {
            EveryAngleEnums.FIELDTYPE fieldType = EnumHelper.ParseEnum<EveryAngleEnums.FIELDTYPE>(type);

            if (IsAveragePeriodOperator(type, fieldOperator) || IsDoubleDataType(fieldType))
                return typeof(Double);

            if (IsIntegerDataType(fieldType))
                return typeof(Int64);

            if (IsDateTimeDataType(fieldType))
                return typeof(DateTime);

            return typeof(String);
        }

        internal static PivotSummaryType GetPivotSummaryType(string bucket)
        {
            if (bucket == "min")
                return PivotSummaryType.Min;

            if (bucket == "max")
                return PivotSummaryType.Max;

            if (bucket == "average" || bucket == "average_valid")
                return PivotSummaryType.Average;

            return PivotSummaryType.Sum;
        }

        #endregion

    }


}
