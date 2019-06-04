using DevExpress.Data.PivotGrid;
using DevExpress.Utils;
using DevExpress.Web.ASPxPivotGrid;
using DevExpress.Web.Internal;
using DevExpress.Web.Mvc;
using DevExpress.XtraPivotGrid;
using EveryAngle.Shared.Formatter;
using EveryAngle.Shared.Pivot;
using EveryAngle.WebClient.Domain;
using EveryAngle.WebClient.Service.Aggregation;
using EveryAngle.WebClient.Web.CSTests.TestBase;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace EveryAngle.WebClient.Web.CSTests.ServiceTests
{
    [TestFixture]
    public class AggregationServiceTests : UnitTestBase
    {
        [TestCase("DeliveryStatus", null, null)]
        [TestCase("any", "/models/1/field_domains/66", null)]
        [TestCase("DeliveryStatus", "/models/1/field_domains/66", "deliverystatus")]
        public void TestGetDomainImageFolder(string fieldInFolderList, string domainURI, string expected)
        {
            string[] domainImageFolderList = new string[] { fieldInFolderList };
            EAPivotField field = new EAPivotField();
            field.DataType = "enumerated";
            field.DomainURI = domainURI;
            field.Bucket = new BucketSetting { Operator = "individual" };

            string folder = _aggregationService.GetDomainImageFolder(field, domainImageFolderList);
            Assert.AreEqual(expected, folder);
        }

        [Test]
        public void TestTimeFormat()
        {
            string json = "[{\"CellFormat\":\"h:mm tt\",\"CellFormatType\":3,\"Area\":0,\"SourceField\":\"DedicatedSalesDocumentItem__ERZET\",\"Caption\":\"Ded. SD Item - Time  [Per hour]\",\"DefaultCaption\":\"Ded. SD Item - Time  [Per hour]\",\"FieldName\":\"hour_DedicatedSalesDocumentItem__ERZET\",\"CssClass\":\"row\",\"InternalID\":\"e6f742b7-25dc-23bb-163a-474876001891\",\"Bucket\":{\"field_type\":\"grouping_fields\",\"Operator\":\"hour\",\"source_field\":\"DedicatedSalesDocumentItem__ERZET\",\"field\":\"hour_DedicatedSalesDocumentItem__ERZET\"},\"Index\":1,\"DataType\":\"time\",\"IsDomain\":false,\"MayBeSorted\":true,\"DomainURI\":\"\",\"IsSelected\":true},{\"CellFormat\":\"F0,count,N\",\"CellFormatType\":3,\"Area\":3,\"SourceField\":null,\"Caption\":\"Count\",\"DefaultCaption\":\"Count\",\"FieldName\":\"count\",\"CssClass\":\"data\",\"InternalID\":\"bb45c272-e8b9-515c-cf54-474876001891\",\"Bucket\":{\"field_type\":\"aggregation_fields\",\"Operator\":\"count\",\"source_field\":null,\"field\":\"count\"},\"Index\":1,\"DataType\":\"int\",\"IsDomain\":false,\"MayBeSorted\":true,\"DomainURI\":\"\",\"IsSelected\":true}]";
            JArray root = JArray.Parse(json);

            List<EAPivotField> fields = (List<EAPivotField>)JsonConvert.DeserializeObject(root.ToString(), typeof(List<EAPivotField>));
            fields[0].FieldDetails = "{\"pivot_area\":\"row\",\"sorting\":\"asc\"}";
            fields[1].FieldDetails = "{\"pivot_area\":\"data\",\"prefix\":\"N\",\"decimals\":0,\"thousandseparator\":false,\"sorting\":\"\"}";
            PivotGridSettings settings = new PivotGridSettings();
            settings.Name = "pivotGrid";
            settings.Width = Unit.Percentage(100);
            settings.Height = Unit.Pixel(600);
            settings.OptionsBehavior.SortBySummaryDefaultOrder = DevExpress.XtraPivotGrid.PivotSortBySummaryOrder.Descending;

            _aggregationService.FieldSetting = new PivotSettings();
            _aggregationService.SetPivotGridField(fields, settings);
            _aggregationService.SetPivotGridSettingsFormat(settings, null, fields);

            Assert.AreEqual("h:mm tt", settings.Fields[0].CellFormat.FormatString);
        }

        [Test]
        public void TestGetCellBackgroundColorForSubTotalRowAndColumn()
        {
            string cellClass = _aggregationService.GetCellBackgroundColor(true, false, true, true);
            Assert.AreEqual("subWithSubTotal", cellClass);
        }

        [Test]
        public void TestGetCellBackgroundColorForGrandTotalColumn()
        {
            string cellClass = _aggregationService.GetCellBackgroundColor(true, true, true, false);
            Assert.AreEqual("subWithGrandTotal", cellClass);
        }

        [Test]
        public void TestGetCellBackgroundColorForGrandTotalTotalRowAndColumn()
        {
            string cellClass = _aggregationService.GetCellBackgroundColor(false, true, true, true);
            Assert.AreEqual("grandWithGrandTotal", cellClass);
        }

        [Test]
        public void TestGetCellBackgroundColorForNotTotalCell()
        {
            string cellClass = _aggregationService.GetCellBackgroundColor(false, false, false, false);
            Assert.IsNull(cellClass);
        }

        [Test]
        public void TestGetControlNullTextLiteralControl()
        {
            LiteralControl control = new LiteralControl("&nbsp;");
            int index = -1;
            string controlText = _aggregationService.GetControlNullText(control, "null", ref index);
            Assert.AreEqual(0, index);
            Assert.AreEqual("null", controlText);
        }

        [Test]
        public void TestGetControlNullTextLiteralControlTotal()
        {
            LiteralControl control = new LiteralControl(" Total");
            int index = -1;
            string controlText = _aggregationService.GetControlNullText(control, "null", ref index);
            Assert.AreEqual(0, index);
            Assert.AreEqual("null Total", controlText);
        }

        [Test]
        public void TestGetControlNullTextInternalImage()
        {
            Control parent = new Control();
            parent.Controls.Add(new InternalImage());
            parent.Controls.Add(new LiteralControl("&nbsp;"));

            int index = -1;
            string controlText = _aggregationService.GetControlNullText(parent.Controls[0], "null", ref index);
            Assert.AreEqual(1, index);
            Assert.AreEqual("null", controlText);
        }

        [Test]
        public void TestGetControlNullTextControl()
        {
            Control control = new Control();
            int index = -1;
            string controlText = _aggregationService.GetControlNullText(control, "null", ref index);
            Assert.AreEqual(-1, index);
            Assert.AreEqual(null, controlText);
        }

        [TestCase(false, false, "Field_Row2", "", null, null, null, "asc,null,0")]
        [TestCase(true, false, "Field_Row3", "", null, null, null, "asc,null,0")]
        [TestCase(true, true, "Field_Row2", "", null, null, null, "asc,null,0")]
        [TestCase(true, false, "Field_Row2", "desc", "Field_Data2", null, null, "desc,null,0")]
        [TestCase(true, false, "Field_Row2", "desc", "Field_Data1", null, null, "desc,field_data1,0")]
        [TestCase(true, false, "Field_Row2", "desc", "Field_Data1", "Field_Column1", "null", "desc,field_data1,1")]
        [TestCase(true, false, "Field_Row2", "desc", "Field_Data1", "Field_Column1", "value1", "desc,field_data1,1")]
        public void TestSetSortBySummaryField(
            bool hasSortBySummary,
            bool clearAll,
            string sortField,
            string sortDirection,
            string summaryField,
            string conditionFieldName,
            string conditionFieldValue,
            string expected)
        {
            MVCxPivotGridFieldCollection fields = new MVCxPivotGridFieldCollection();
            fields.Add(new MVCxPivotGridField("field_row1", PivotArea.RowArea));
            fields.Add(new MVCxPivotGridField("field_row2", PivotArea.RowArea));
            fields.Add(new MVCxPivotGridField("field_column1", PivotArea.ColumnArea));
            fields.Add(new MVCxPivotGridField("field_data1", PivotArea.DataArea));

            #region Set sort by summary
            PivotSettings pivotSetting = new PivotSettings
                {
                    SortBySummaryInfo = !hasSortBySummary ? null : new List<SortBySummary>
                    {
                        new SortBySummary
                        {
                            clear_all = clearAll,
                            sort_field = sortField,
                            sort_direction = sortDirection,
                            summary_field = summaryField,
                            summary_conditions = conditionFieldName == null ? null : new List<SortBySummaryConditionField>
                            {
                                new SortBySummaryConditionField
                                {
                                    fieldname = conditionFieldName,
                                    value = conditionFieldValue
                                }
                            }
                        }
                    }
                }; 
            #endregion

            AggregationService aggregationService = new AggregationService();
            aggregationService.FieldSetting = pivotSetting;
            aggregationService.SetSortBySummaryField(fields);

            // prepare expect results
            PivotGridField testField = fields["field_row2"];
            string[] expectedList = expected.Split(',');
            PivotSortOrder expectSortOrder = expectedList[0] == "desc" ? PivotSortOrder.Descending : PivotSortOrder.Ascending;
            PivotGridField expectSummaryField = expectedList[1] == "null" ? null : fields[expectedList[1]];
            int expectSummaryCount = int.Parse(expectedList[2]);

            // assert
            Assert.AreEqual(testField.SortOrder, expectSortOrder);
            Assert.AreEqual(testField.SortBySummaryInfo.Field, expectSummaryField);
            Assert.AreEqual(testField.SortBySummaryInfo.Conditions.Count, expectSummaryCount);
            if (expectSummaryCount != 0)
            {
                string expectConditionFieldName = conditionFieldName.ToLowerInvariant();
                object expectConditionFieldValue = conditionFieldValue == "null" ? null : conditionFieldValue;
                Assert.AreEqual(testField.SortBySummaryInfo.Conditions[0].Field.FieldName, expectConditionFieldName);
                Assert.AreEqual(testField.SortBySummaryInfo.Conditions[0].Value, expectConditionFieldValue);
            }
        }

        [TestCase(typeof(PeriodFormatter))]
        public void TestSetPivotGridSettingsFormat(Type expectedType)
        {
            var fieldName = "espresso";
            var mockPivotGridSettings = new PivotGridSettings();
            var mvcxPivotGridField = new MVCxPivotGridField(fieldName, PivotArea.RowArea);
            var mockEAPivotFields = new List<EAPivotField>
            {
                new EAPivotField
                {
                    FieldName = fieldName,
                    CellFormat = string.Empty,
                    CellFormatType = (int)FormatType.Custom,
                    DataType = EveryAngleEnums.FIELDTYPE.PERIOD.ToString(),
                    Bucket = new BucketSetting { Operator = "week" }
                }
            };
            mockPivotGridSettings.Fields.AddField(mvcxPivotGridField);
            _aggregationService.SetPivotGridSettingsFormat(mockPivotGridSettings, null, mockEAPivotFields);
            Type actualType = mockPivotGridSettings.Fields[fieldName].CellFormat.Format.GetType();
            Assert.AreEqual(expectedType, actualType);
        }

        [TestCase(null, PivotSummaryType.Sum)]
        [TestCase("any", PivotSummaryType.Sum)]
        [TestCase("sum", PivotSummaryType.Sum)]
        [TestCase("count", PivotSummaryType.Sum)]
        [TestCase("count_valid", PivotSummaryType.Sum)]
        [TestCase("min", PivotSummaryType.Min)]
        [TestCase("max", PivotSummaryType.Max)]
        [TestCase("average", PivotSummaryType.Average)]
        [TestCase("average_valid", PivotSummaryType.Average)]
        public void TestGetPivotSummaryType(string bucket, PivotSummaryType expected)
        {
            PivotSummaryType result = AggregationService.GetPivotSummaryType(bucket);

            Assert.AreEqual(expected, result);
        }

        [TestCase("period", "average", typeof(Double))]
        [TestCase("period", "average_valid", typeof(Double))]
        [TestCase("period", "any", typeof(Int64))]
        [TestCase("int", "any", typeof(Int64))]
        [TestCase("double", "any", typeof(Double))]
        [TestCase("currency", "any", typeof(Double))]
        [TestCase("percentage", "any", typeof(Double))]
        [TestCase("timespan", "any", typeof(Double))]
        [TestCase("date", "any", typeof(DateTime))]
        [TestCase("datetime", "any", typeof(DateTime))]
        [TestCase("time", "any", typeof(Int64))]
        public void TestGetDataType(string type, string bucket, Type expected)
        {
            Type result = AggregationService.GetDataType(type, bucket);
            
            Assert.AreEqual(expected, result);
        }

        [TestCase(PivotEnums.TotalForType.None, false, false)]
        [TestCase(PivotEnums.TotalForType.RowAndColumn, true, true)]
        [TestCase(PivotEnums.TotalForType.Row, true, false)]
        [TestCase(PivotEnums.TotalForType.Column, false, true)]
        public void TestSetGrandTotalsManagement_TotalForType(PivotEnums.TotalForType totalForType, bool expectShowColumnGrandTotals, bool expectShowRowGrandTotals)
        {
            PivotGridSettings settings = new PivotGridSettings();
            _aggregationService.FieldSetting = new PivotSettings
            {
                TotalForType = totalForType
            };
            _aggregationService.SetGrandTotalsManagement(settings);

            Assert.AreEqual(expectShowColumnGrandTotals, settings.OptionsView.ShowColumnGrandTotals);
            Assert.AreEqual(expectShowRowGrandTotals, settings.OptionsView.ShowRowGrandTotals);
        }

        [TestCase(PivotEnums.TotalsLocation.Far, false, false, PivotTotalsLocation.Far)]
        [TestCase(PivotEnums.TotalsLocation.Near, true, true, PivotTotalsLocation.Near)]
        public void TestSetGrandTotalsManagement_Others(PivotEnums.TotalsLocation totalsLocation, bool isIncludeSubTotals, bool expectShowTotals, PivotTotalsLocation expectTotalsLocation)
        {
            PivotGridSettings settings = new PivotGridSettings();
            _aggregationService.FieldSetting = new PivotSettings
            {
                TotalsLocation = totalsLocation,
                IsIncludeSubTotals = isIncludeSubTotals
            };
            _aggregationService.SetGrandTotalsManagement(settings);

            Assert.AreEqual(true, settings.OptionsView.ShowGrandTotalsForSingleValues);
            Assert.AreEqual(expectShowTotals, settings.OptionsView.ShowColumnTotals);
            Assert.AreEqual(expectShowTotals, settings.OptionsView.ShowRowTotals);
            Assert.AreEqual(expectTotalsLocation.ToString(), settings.OptionsView.ColumnTotalsLocation.ToString());
            Assert.AreEqual(expectTotalsLocation.ToString(), settings.OptionsView.RowTotalsLocation.ToString());
        }
    }
}
