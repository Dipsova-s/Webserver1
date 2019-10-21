using DevExpress.Web.Mvc;
using DevExpress.XtraPivotGrid;
using EveryAngle.Core.ViewModels.Users;
using EveryAngle.Shared.Helpers;
using EveryAngle.Shared.Pivot;
using EveryAngle.Utilities;
using EveryAngle.WebClient.Domain;
using EveryAngle.WebClient.Service.Aggregation;
using EveryAngle.WebClient.Web.Helpers;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using System.Web.Mvc;


namespace EveryAngle.WebClient.Web.Controllers
{
    public class PivotController : BaseController
    {
        #region Variable

        private readonly AggregationService aggregationService;

        #endregion Variable

        #region Contructor

        public PivotController()
        {
            aggregationService = new AggregationService();
        }

        #endregion Contructor

        #region Methods

        public object GetFieldValue(object clientDataSourceValue, EveryAngleEnums.FIELDTYPE fieldType)
        {
            object fieldValue = clientDataSourceValue;

            if (clientDataSourceValue != null)
            {
                if (fieldType == EveryAngleEnums.FIELDTYPE.DATE || fieldType == EveryAngleEnums.FIELDTYPE.DATETIME)
                    fieldValue = DateTimeUtils.DateTimeToUnixTimestamp((DateTime)clientDataSourceValue);

            }

            return fieldValue;
        }

        private void SetQueryFromDimensions(string fieldCondition, List<FieldValue> querySteps, PivotDrillDownDataSource dataObject, PivotArea? filterArea)
        {
            if (dataObject != null && dataObject[0] != null && dataObject.RowCount > 0)
            {
                PivotDrillDownDataSource clientDataSource = dataObject[0].DataSource;
                if (clientDataSource != null && clientDataSource.RowCount > 0)
                {
                    List<EAPivotField> rows = filterArea != null
                            ? aggregationService.FieldSetting.GetFields().Where(filter => filter.Area == filterArea.GetHashCode()).ToList()
                            : aggregationService.FieldSetting.GetFields();

                    foreach (EAPivotField field in rows)
                    {
                        string fieldName = field.FieldName.ToLowerInvariant();
                        FieldValue fieldValue = new FieldValue();
                        fieldValue.InternalID = field.InternalID;
                        EveryAngleEnums.FIELDTYPE fieldType = EnumHelper.GetValueFromDescription<EveryAngleEnums.FIELDTYPE>(field.DataType);

                        object clientDataSourceValue = clientDataSource[0][fieldName];
                        fieldValue.Value = GetFieldValue(clientDataSourceValue, fieldType);

                        querySteps.Add(fieldValue);

                        if (!string.IsNullOrEmpty(fieldCondition)
                            && field.FieldName.Equals(fieldCondition, StringComparison.InvariantCultureIgnoreCase))
                        {
                            break;
                        }
                    }
                }
            }

            else throw new HttpException(409, "Could not find the data source");
        }

        private void GetFieldValues(string rowValueType, string columnValueType, string rowFieldName, string columnFieldName, List<FieldValue> querySteps, DimensionsFieldValue dimensions, PivotDrillDownDataSource dataObject)
        {

            if (rowValueType == "Value" && columnValueType == "GrandTotal")
            {
                SetQueryFromDimensions(rowFieldName, querySteps, dataObject, PivotArea.RowArea);
            }
            else if (rowValueType == "GrandTotal" && (columnValueType == "Value" || columnValueType == "Total"))
            {
                SetQueryFromDimensions(columnFieldName, querySteps, dataObject, PivotArea.ColumnArea);
            }
            else if (rowValueType == "Total" && (columnValueType == "Value" || columnValueType == "Total"))
            {
                SetQueryFromDimensions(rowFieldName, querySteps, dataObject, PivotArea.RowArea);
                SetQueryFromDimensions(columnFieldName, querySteps, dataObject, PivotArea.ColumnArea);
            }
            else if (rowValueType == "Total" && columnValueType == "GrandTotal")
            {
                SetQueryFromDimensions(rowFieldName, querySteps, dataObject, PivotArea.RowArea);
            }
            else if (rowValueType == "GrandTotal" && columnValueType == "GrandTotal")
            {
                //no need to filter
                dimensions.Type = PivotEnums.RowType.GrandTotal;
            }
            else
            {
                //row: value column: value
                if (dataObject.RowCount > 1)
                {

                    SetQueryFromDimensions(rowFieldName, querySteps, dataObject, PivotArea.RowArea);
                    SetQueryFromDimensions(columnFieldName, querySteps, dataObject, PivotArea.ColumnArea);
                }
                else
                {
                    SetQueryFromDimensions(string.Empty, querySteps, dataObject, null);
                }
                dimensions.Type = PivotEnums.RowType.Value;
            }

            dimensions.FieldValues = querySteps;
        }

        #endregion

        #region Partial

        public ActionResult PivotGridPartial(string FieldSettingsData, string UserSettings, bool CanDrilldown)
        {
            PivotSettings fieldSettings = JsonConvert.DeserializeObject<PivotSettings>(Base64Helper.Decode(FieldSettingsData));
            aggregationService.FieldSetting = fieldSettings;
            aggregationService.CanDrilldown = CanDrilldown;

            UserSettingsViewModel userSettingsViewModel = JsonConvert.DeserializeObject<UserSettingsViewModel>(UserSettings);
            userSettingsViewModel.LoadClientSettings();
            Session["UserSettingsViewModel"] = userSettingsViewModel;
            LocalizationHelper.SetCultureFormatBy(userSettingsViewModel);

            DataTable pivotDataTable = new DataTable();

            if (!string.IsNullOrEmpty(fieldSettings.DataRowsUri))
            {
                dynamic currentResult = aggregationService.GetResultDataRows(fieldSettings);
                pivotDataTable = aggregationService.GetPivotDataTable(currentResult.Fields, currentResult.Rows, aggregationService.FieldSetting);
                aggregationService.AddDataTableToCache(pivotDataTable, aggregationService.GetCacheKeyBy(aggregationService.FieldSetting));
            }

            string fieldSettingsName = aggregationService.GetPivotFieldsSettingName(fieldSettings.ComponentId);

            Session[fieldSettingsName] = JsonConvert.SerializeObject(aggregationService.FieldSetting);

            ViewBag.PivotId = fieldSettings.ComponentId;
            ViewBag.IsDashBoard = fieldSettings.IsDashBoardMode;
            ViewBag.FieldSettings = JsonConvert.SerializeObject(aggregationService.FieldSetting);
            ViewBag.PivotSettings = aggregationService.MapPivotGridSettings(aggregationService.FieldSetting.GetFields());

            return PartialView("~/Views/Angle/PartialViews/Pivot/PivotGridPartial.cshtml", pivotDataTable);
        }

        public ActionResult PivotGridCallBackPartial(string fieldSettingsData,
            bool CanDrilldown, string __DXCallbackArgument, bool? isDrilldown,
            int? rowIndex, int? columnIndex,
            string rowValueType, string columnValueType,
            string rowFieldName, string columnFieldName)
        {
            // fieldSettingsData will be encoded as base64
            PivotSettings fieldSettings = JsonConvert.DeserializeObject<PivotSettings>(Base64Helper.Decode(fieldSettingsData));

            fieldSettings.IsCalledBack = true;
            aggregationService.FieldSetting = fieldSettings;
            aggregationService.CanDrilldown = CanDrilldown;
            PivotGridSettings pivotGridSettings = aggregationService.MapPivotGridSettings(aggregationService.FieldSetting.GetFields());
            DataTable pivotDataTable = aggregationService.GetCacheDataTable(fieldSettings);

            if (!isDrilldown.HasValue)
            {
                ViewBag.PivotSettings = pivotGridSettings;
                ViewBag.Handler = pivotGridSettings.Name;
                ViewBag.CallbackArgument = __DXCallbackArgument;
                return PartialView("~/Views/Angle/PartialViews/Pivot/PivotGridCallBackPartial.cshtml", pivotDataTable);
            }
            else
            {
                PivotDrillDownDataSource dataObject = rowIndex != null && columnIndex != null ? PivotGridExtension.CreateDrillDownDataSource(pivotGridSettings, pivotDataTable, columnIndex.Value, rowIndex.Value) : null;
                List<FieldValue> querySteps = new List<FieldValue>();
                DimensionsFieldValue dimensions = new DimensionsFieldValue();
                dimensions.RowIndex = rowIndex;
                dimensions.ColumnIndex = columnIndex;
                GetFieldValues(rowValueType, columnValueType, rowFieldName, columnFieldName, querySteps, dimensions, dataObject);

                return new JsonResult { Data = dimensions };
            }
        }

        public ActionResult PivotGridScript()
        {
            string script = ViewRenderer.RenderPartialView("~/Views/Angle/PartialViews/Pivot/PivotGridScript.cshtml");
            script = script.Replace("\" type=", string.Format("&version={0}\" type=", AssemblyInfoHelper.GetFileVersion()));
            return Content(script);
        }

        #endregion PartialView

    }

}

