/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/resultmodel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/displayqueryblockmodel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/AngleInfoModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/DisplayModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ModelFieldDomainHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/Chart/ChartHelper.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/Chart/ChartOptionsView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/Chart/ChartOptionsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/FieldSettingsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/ChartHandler.js" />

describe("ChartHandler", function () {

    var chartHandler;

    beforeEach(function () {
        chartHandler = new ChartHandler();
    });

    describe("call GetDomainElementsForCustomSort", function () {

        it("should get not elements if operator is not 'individual'", function () {

            var result = chartHandler.GetDomainElementsForCustomSort('xxx', '/test/1');
            expect(result).toEqual([]);

        });

        it("should get not elements if no 'domainUri'", function () {

            var result = chartHandler.GetDomainElementsForCustomSort('individual', '');
            expect(result).toEqual([]);

        });

        it("should get not elements if may_be_sorted=true", function () {

            spyOn(modelFieldDomainHandler, "GetFieldDomainByUri").and.callFake(function (domainUri) {
                if (domainUri === '/test/1')
                    return {
                        may_be_sorted: true,
                        elements: ['element1']
                    };
                else
                    return null;
            });
            var result = chartHandler.GetDomainElementsForCustomSort('individual', '/test/1');
            expect(result).toEqual([]);

        });

        it("should get elements if may_be_sorted=false", function () {

            spyOn(modelFieldDomainHandler, "GetFieldDomainByUri").and.callFake(function (domainUri) {
                if (domainUri === '/test/1')
                    return {
                        may_be_sorted: false,
                        elements: ['element1']
                    };
                else
                    return null;
            });
            var result = chartHandler.GetDomainElementsForCustomSort('individual', '/test/1');
            expect(result).toEqual(['element1']);

        });

    });

    describe("call GetSortingFieldInfo", function () {

        beforeEach(function () {
            chartHandler.FieldSettings = {};
        });

        it("should get null", function () {

            chartHandler.FieldSettings.GetFields = function () {
                return [{ SortDirection: '', FieldName: 'test' }];
            };
            var result = chartHandler.GetSortingFieldInfo();
            expect(result).toEqual(null);

        });

        it("should get a sorting info", function () {

            chartHandler.FieldSettings.GetFields = function () {
                return [{ SortDirection: 'asc', FieldName: 'test' }];
            };
            var result = chartHandler.GetSortingFieldInfo();
            expect(result).not.toEqual(null);

        });

    });

    describe("call SetDefaultChartSettings", function () {

        var displayDetails;

        beforeEach(function () {
            displayDetails = {
                show_as_percentage: true,
                legend: false,
                gridline: 'show'
            };
        });

        it("should set show_as_percentage to true", function () {
            var options = {};
            displayDetails.show_as_percentage = true;
            chartHandler.SetDefaultChartSettings(options, displayDetails);
            expect(options.show_as_percentage).toEqual(true);
        });

        it("should set show_as_percentage to false", function () {
            var options = {};
            displayDetails.show_as_percentage = false;
            chartHandler.SetDefaultChartSettings(options, displayDetails);
            expect(options.show_as_percentage).toEqual(false);
        });

        it("should set legend to false", function () {
            var options = {};
            chartHandler.SetDefaultChartSettings(options, displayDetails);
            expect(options.legend).toEqual({ show: false });
        });

        it("should set gridline x to true", function () {
            var options = {};
            chartHandler.SetDefaultChartSettings(options, displayDetails);
            expect(options.gridline.x).toEqual(true);
        });
        it("should set gridline y to true", function () {
            var options = {};
            chartHandler.SetDefaultChartSettings(options, displayDetails);
            expect(options.gridline.y).toEqual(true);
        });
    });

    describe("call SetChartPatternStyle", function () {

        var chart;

        beforeEach(function () {
            chart = {
                options: {
                    series: [
                        {
                            name: 'ds0None',
                            data: [
                                {
                                    count: 664,
                                    individual_DeliveryStatus: 'ds0None',
                                    individual_DeliveryStatus_pattern: '/',
                                    quarter_CreationDate: new Date()
                                }
                            ]
                        },
                        {
                            name: 'ds1NotCritical',
                            data: [
                                {
                                    count: 400,
                                    individual_DeliveryStatus: 'ds1NotCritical',
                                    individual_DeliveryStatus_pattern: '',
                                    quarter_CreationDate: new Date()
                                }
                            ]
                        },
                        {
                            name: 'ds3Late',
                            data: []
                        }
                    ]
                }
            };

            chartHandler.FieldSettings = {
                GetFieldByFieldName: function (fieldName) {
                    if (fieldName === 'quarter_CreationDate')
                        return this.GetFields()[0];
                    else if (fieldName === 'individual_DeliveryStatus')
                        return this.GetFields()[1];
                    else if (fieldName === 'count')
                        return this.GetFields()[2];
                },
                GetFields: function () {
                    return [{
                        "FieldName": "quarter_CreationDate",
                        "DomainURI": ""
                    }, {
                        "FieldName": "individual_DeliveryStatus",
                        "DomainURI": "/models/1/field_domains/66"
                    }, {
                        "FieldName": "count",
                        "DomainURI": ""
                    }];
                }
            };
        });

        it("should not set dash line style when no group field", function () {
            chartHandler.GroupField = '';
            chartHandler.SetChartPatternStyle(chart);

            expect(chart.options.series[1].dashType).toBeUndefined();
        });

        it("should not set dash line style when group field is not enumerated", function () {
            chartHandler.GroupField = 'quarter_CreationDate';
            chartHandler.SetChartPatternStyle(chart);

            expect(chart.options.series[1].dashType).toBeUndefined();
        });

        it("should set dash line style to 1st serie when have pattern", function () {
            chartHandler.GroupField = 'individual_DeliveryStatus';
            chartHandler.SetChartPatternStyle(chart);

            expect(chart.options.series[0].dashType).not.toBeUndefined();
        });

        it("should not set dash line style to 2nd serie when no pattern", function () {
            chartHandler.GroupField = 'individual_DeliveryStatus';
            chartHandler.SetChartPatternStyle(chart);

            expect(chart.options.series[1].dashType).toBeUndefined();
        });

        it("should not set dash line style to 3rd serie when no data", function () {
            chartHandler.GroupField = 'individual_DeliveryStatus';
            chartHandler.SetChartPatternStyle(chart);

            expect(chart.options.series[2].dashType).toBeUndefined();
        });
    });

    describe("call SetSortSeries", function () {

        beforeEach(function () {
            chartHandler.FieldMetadata = {
                "0": {
                    "group": {
                        "field": "individual_BottleneckType"
                    },
                    "domain_elements": [{
                        "id": "bt00None",
                        "short_name": "None",
                        "long_name": "None",
                        "pattern": "/",
                        "color": "FFC2C2C2"
                    }, {
                        "id": "bt01PlanningShortage",
                        "short_name": "Planning shortage",
                        "long_name": "Planning shortage",
                        "pattern": "",
                        "color": ""
                    }]
                },
                "1": {
                    "group": {
                        "field": "count"
                    },
                    "domain_elements": []
                }
            };

            spyOn(chartHandler, "SetSortSeriesFromMetaData").and.callFake($.noop);
            spyOn(chartHandler, "GetCompareField").and.callFake(function () {
                return '';
            });
            spyOn(chartHandler, "SetSortSeriesFromData").and.callFake($.noop);
            spyOn(chartHandler, "GetSortObject").and.callFake(function (val) {
                return val;
            });
            spyOn(chartHandler, "SetColorToSeries").and.callFake($.noop);
        });

        it("when field have meta data, SetSortSeriesFromMetaData should have been called", function () {
            chartHandler.Series = [{
                "individual_BottleneckType": null,
                "individual_BottleneckType_label": null,
                "individual_BottleneckType_color": "",
                "count": 2800,
                "count_label": "2800",
                "count_color": ""
            }];
            chartHandler.SetSortSeries();
            expect(chartHandler.SetSortSeriesFromMetaData).toHaveBeenCalled();
        });
        it("when not have series data, SetSortSeriesFromMetaData should have not been called", function () {
            chartHandler.Series = [];
            chartHandler.SetSortSeries();
            expect(chartHandler.SetSortSeriesFromMetaData).not.toHaveBeenCalled();
        });
    });

    describe("call SetSortSeriesFromMetaData", function () {

        var metadata;
        var metadataGroupFieldName = "individual_BottleneckType";
        var sortFieldName = "individual_BottleneckType_sortindex";

        beforeEach(function () {

            chartHandler.Series = [{
                "individual_BottleneckType": null,
                "individual_BottleneckType_label": null,
                "individual_BottleneckType_color": "",
                "count": 2800,
                "count_label": "2800",
                "count_color": ""
            }];

            metadata = {
                "domain_elements": [{
                    "id": "bt00None",
                    "short_name": "None",
                    "long_name": "None",
                    "pattern": "/",
                    "color": "FFC2C2C2"
                }, {
                    "id": "bt01PlanningShortage",
                    "short_name": "Planning shortage",
                    "long_name": "Planning shortage",
                    "pattern": "",
                    "color": ""
                }]
            };
        });

        it("sort index is undefined, sort index should be added", function () {
            chartHandler.SetSortSeriesFromMetaData(metadata, metadataGroupFieldName, sortFieldName);
            expect(chartHandler.Series[0].individual_BottleneckType_sortindex).toBeDefined();
        });

        it("sort index is definded and have domain element, sort index should be added", function () {
            chartHandler.Series[0].individual_BottleneckType = "bt01PlanningShortage";
            chartHandler.SetSortSeriesFromMetaData(metadata, metadataGroupFieldName, sortFieldName);
            expect(chartHandler.Series[0].individual_BottleneckType_sortindex).toBeDefined();
        });
    });

    describe("call SetSortSeriesFromData", function () {

        var metadata;

        beforeEach(function () {

            chartHandler.Series = [{
                "individual_BottleneckType": null,
                "individual_BottleneckType_label": null,
                "individual_BottleneckType_color": "",
                "count": 2800,
                "count_label": "2800",
                "count_color": ""
            }];

            metadata = {
                "domain_elements": [{
                    "id": "bt00None",
                    "short_name": "None",
                    "long_name": "None",
                    "pattern": "/",
                    "color": "FFC2C2C2"
                }, {
                    "id": "bt01PlanningShortage",
                    "short_name": "Planning shortage",
                    "long_name": "Planning shortage",
                    "pattern": "",
                    "color": ""
                }]
            };
            metadata.formatter = new Formatter({ format: 'ln' }, 'enumerated');

            spyOn(chartHandler, "GetSortObject").and.callFake(function (val) {
                return val;
            });
        });

        it("sort index should be added", function () {
            var metadataGroupFieldName = "individual_BottleneckType";
            var sortFieldName = "individual_BottleneckType_sortindex";
            metadata.formatter.type = 'text';
            chartHandler.SetSortSeriesFromData(metadata, metadataGroupFieldName, sortFieldName);
            expect(chartHandler.Series[0].individual_BottleneckType_sortindex).toBeDefined();
        });

        it("when series more than 1, sort index should be added", function () {
            chartHandler.Series.push({
                "individual_BottleneckType": null,
                "individual_BottleneckType_label": null,
                "individual_BottleneckType_color": "",
                "count": 100,
                "count_label": "2800",
                "count_color": ""
            });
            chartHandler.Series.push({
                "individual_BottleneckType": null,
                "individual_BottleneckType_label": null,
                "individual_BottleneckType_color": "",
                "count": 100,
                "count_label": "2800",
                "count_color": ""
            });
            var metadataGroupFieldName = "individual_BottleneckType";
            var sortFieldName = "individual_BottleneckType_sortindex";
            var compareField = "count";
            metadata.fieldtype = enumHandlers.FIELDTYPE.ENUM;
            chartHandler.SetSortSeriesFromData(metadata, metadataGroupFieldName, sortFieldName, compareField);
            expect(chartHandler.Series[0].individual_BottleneckType_sortindex).toBeDefined();
        });
    });

    describe("call GetCompareField", function () {
        var compareField;
        var metadata;
        var metadataGroupFieldName = "individual_BottleneckType";

        beforeEach(function () {
            metadata = {
                "domain_elements": [{
                    "id": "bt00None",
                    "short_name": "None",
                    "long_name": "None",
                    "pattern": "/",
                    "color": "FFC2C2C2"
                }, {
                    "id": "bt01PlanningShortage",
                    "short_name": "Planning shortage",
                    "long_name": "Planning shortage",
                    "pattern": "",
                    "color": ""
                }]
            };
            metadata.formatter = new Formatter({}, 'enumerated');
        });

        it("when meta data type enum, should return correct compare field #1", function () {
            metadata.formatter.type = enumHandlers.FIELDTYPE.ENUM;
            compareField = chartHandler.GetCompareField(metadata, metadataGroupFieldName, compareField);
            expect(compareField).toEqual('individual_BottleneckType_label');
        });

        it("when meta data type enum, should return correct compare field #2", function () {
            metadata.domain_elements = [];
            metadata.formatter.type = enumHandlers.FIELDTYPE.ENUM;
            compareField = chartHandler.GetCompareField(metadata, metadataGroupFieldName, compareField);
            expect(compareField).toEqual('individual_BottleneckType_label');
        });

        it("when meta data type date, should return correct compare field", function () {
            metadata.domain_elements = [];
            metadata.formatter.type = enumHandlers.FIELDTYPE.DATE;
            compareField = chartHandler.GetCompareField(metadata, metadataGroupFieldName, compareField);
            expect(compareField).toEqual('individual_BottleneckType_label');
        });

        it("when meta data is other type, should return correct compare field", function () {
            metadata.domain_elements = [];
            metadata.formatter.type = enumHandlers.FIELDTYPE.TEXT;
            compareField = chartHandler.GetCompareField(metadata, metadataGroupFieldName, compareField);
            expect(compareField).toEqual('individual_BottleneckType');
        });
    });

    describe("call SetColorToSeries", function () {

        var compareField;
        var metadataGroupFieldName = "individual_BottleneckType";

        beforeEach(function () {
            chartHandler.Series = [{
                "individual_BottleneckType": null,
                "individual_BottleneckType_label": "TEST",
                "individual_BottleneckType_color": "",
                "count": 2800,
                "count_label": "2800",
                "count_color": ""
            }, {
                "individual_BottleneckType": null,
                "individual_BottleneckType_label": "TEST",
                "individual_BottleneckType_color": "",
                "count": 20,
                "count_label": "20",
                "count_color": ""
            }, {
                "individual_BottleneckType": 'x',
                "individual_BottleneckType_label": "XX",
                "individual_BottleneckType_color": "",
                "count": 0,
                "count_label": "0",
                "count_color": ""
            }];
            compareField = "individual_BottleneckType_label";
        });

        it("property color should be defined", function () {
            chartHandler.THEME.COLOURS = ["#91c439", "#0477bf", "#045b80", "#e96a25"];
            compareField = chartHandler.SetColorToSeries(metadataGroupFieldName, compareField);
            expect(chartHandler.Series[0].individual_BottleneckType_color).toBeDefined();
        });

        it("when color have been defined, color setting will not changed", function () {
            chartHandler.THEME.COLOURS = ["#91c439", "#0477bf", "#045b80", "#e96a25"];
            chartHandler.Series[0].individual_BottleneckType_color = "#FFF";
            compareField = chartHandler.SetColorToSeries(metadataGroupFieldName, compareField);
            expect(chartHandler.Series[0].individual_BottleneckType_color).toEqual('#FFF');
        });

        it("when not have cache color and them color, property color should not be defined", function () {
            compareField = chartHandler.SetColorToSeries(metadataGroupFieldName, compareField);
            expect(chartHandler.Series[0].individual_BottleneckType_color).not.toBeDefined();
        });
    });

    describe("call CalculateScatterAndBubbleBoundary", function () {

        beforeEach(function () {
            chartHandler.FieldSettings = {
                GetFieldByFieldName: function () { return null; }
            };
        });

        it("should get empty object if no categoryField", function () {
            var result = chartHandler.CalculateScatterAndBubbleBoundary();
            expect(result).toEqual({});
        });

        it("should get empty object if no need to adjust boundary", function () {
            chartHandler.FieldSettings.GetFieldByFieldName = function () {
                return {
                    DataType: 'xxx',
                    Bucket: { Operator: 'xxx' }
                };
            };
            var result = chartHandler.CalculateScatterAndBubbleBoundary();
            expect(result).toEqual({});
        });

        it("should define a major unit if time data type", function () {
            chartHandler.FieldSettings.GetFieldByFieldName = function () {
                return {
                    DataType: enumHandlers.FIELDTYPE.TIME,
                    Bucket: { Operator: 'xxx' }
                };
            };
            var result = chartHandler.CalculateScatterAndBubbleBoundary();
            expect(result.majorUnit).toBeDefined();
        });

        it("should get empty object if is power10_xxx but no categoryValues", function () {
            chartHandler.FieldSettings.GetFieldByFieldName = function () {
                return {
                    DataType: 'xxx',
                    Bucket: { Operator: 'power10_2' }
                };
            };
            chartHandler.GetCategoriesByFilter = function () { return []; };
            var result = chartHandler.CalculateScatterAndBubbleBoundary();
            expect(result.majorUnit).toEqual(100);
            expect(result.min).toEqual(0);
            expect(result.max).toEqual(100);
        });

        it("should set a major unit, min and max if is power10_xxx", function () {
            chartHandler.FieldSettings.GetFieldByFieldName = function () {
                return {
                    DataType: 'xxx',
                    Bucket: { Operator: 'power10_min2' }
                };
            };
            chartHandler.GetCategoriesByFilter = function () { return [0, 1]; };
            var result = chartHandler.CalculateScatterAndBubbleBoundary();
            expect(result.majorUnit).toEqual(0.01);
            expect(result.min).toEqual(0);
            expect(result.max).toEqual(1.01);
        });

        it("should set a major unit, min and new max if is power10_xxx", function () {
            chartHandler.FieldSettings.GetFieldByFieldName = function () {
                return {
                    DataType: 'xxx',
                    Bucket: { Operator: 'power10_2' }
                };
            };
            chartHandler.GetCategoriesByFilter = function () { return [0, 0]; };
            var result = chartHandler.CalculateScatterAndBubbleBoundary();
            expect(result.majorUnit).toEqual(100);
            expect(result.min).toEqual(0);
            expect(result.max).toEqual(100);
        });

    });

    describe("call GetChartFormatter", function () {

        var fieldSettingData;

        beforeEach(function () {
            fieldSettingData = {
                FieldName: "count",
                FieldDetails: "count_detail"
            };
        });

        it("Decimal is set to null if get format on count field", function () {
            spyOn(chartHandler.Models.Angle, "Data").and.callFake(function () {
                return { model: "models/1" };
            });

            var result = chartHandler.GetChartFormatter(fieldSettingData);
            expect(result.decimals).toEqual(null);
        });
    });

    describe("call GetDateBoundary", function () {

        it("min and max must not be equal no matter what bucket is", function () {
            var data = [new Date(1980, 0, 1)];
            var bucket = ['day', 'quarter', 'week', 'trimester', 'month', 'semester', 'year'];

            for (var index = 0; index < bucket.length; index++) {
                var result = chartHandler.GetDateBoundary(data, bucket[index]);
                expect(result.min.toString() !== result.max.toString()).toEqual(true);
            }

        });
    });

    describe("call TransferSortindex", function () {

        it("can get negative value from sum_Margin", function () {
            var categoryFieldName = "week_OrderDueDate";
            var fieldSorting = { field: "sum_Margin", dir: "desc" };

            chartHandler.Series = [{
                "individual_BottleneckType": null,
                "individual_BottleneckType_label": null,
                "individual_BottleneckType_color": "",
                "count": 2800,
                "count_label": "2800",
                "count_color": "",
                "sum_Margin":-165670616.47,
                "sum_Margin_color":"#91c439",
                "sum_Margin_label":"-165670616 EUR",
                "sum_Margin_sortindex":0,
                "week_OrderDueDate_color":"#0431bf",
                "week_OrderDueDate_label": "Wk 50 of 2006",
                "week_OrderDueDate_sortindex":102
            }];

            var result = chartHandler.TransferSortindex(categoryFieldName, fieldSorting);
            expect(result[0].sum === -165670616.47).toEqual(true);
        });
    });

    describe("call GetChartFormatter", function () {
        beforeEach(function () {
            this.fieldSettingData = {};
        });

        describe("when datatype is period", function () {
            beforeEach(function () {
                this.fieldSettingData.DataType = enumHandlers.FIELDTYPE.PERIOD;
                spyOn(chartHandler.Models.Angle, "Data").and.returnValue({ model: "models/1" });
            });
            it("should returns period type when field area is row", function () {
                this.fieldSettingData.Area = enumHandlers.FIELDSETTINGAREA.ROW;
                var expectedFormatter = chartHandler.GetChartFormatter(this.fieldSettingData);
                expect(expectedFormatter.type).toBe(enumHandlers.FIELDTYPE.PERIOD);
            });

            it("should returns period type when field area is column", function () {
                this.fieldSettingData.Area = enumHandlers.FIELDSETTINGAREA.COLUMN;
                var expectedFormatter = chartHandler.GetChartFormatter(this.fieldSettingData);
                expect(expectedFormatter.type).toBe(enumHandlers.FIELDTYPE.PERIOD);
            });

            it("should returns numeric type when field area is data", function () {
                this.fieldSettingData.Area = enumHandlers.FIELDSETTINGAREA.DATA;
                var expectedFormatter = chartHandler.GetChartFormatter(this.fieldSettingData);
                expect(expectedFormatter.type).toBe(enumHandlers.FIELDTYPE.INTEGER);
            });
        });
    });

    describe("call GetPeriodRangeFormatSetting", function () {
        describe("should get expected total number of days", function () {
            this.bucketOperators = [
                { type: 'day', operator: 'day', expectedTotalDays: 1 },
                { type: 'week', operator: 'week', expectedTotalDays: 7 },
                { type: 'month', operator: 'month', expectedTotalDays: 30.43685 },
                { type: 'quarter', operator: 'quarter', expectedTotalDays: 91.31055 },
                { type: 'trimester', operator: 'trimester', expectedTotalDays: 121.7474 },
                { type: 'semester', operator: 'semester', expectedTotalDays: 182.6211 },
                { type: 'year', operator: 'year', expectedTotalDays: 365.2422 }
            ];
            this.bucketOperators.forEach(function (bucketOperator) {
                it("when operator is " + bucketOperator.type, function () {
                    var expectedSetting = chartHandler.GetPeriodRangeFormatSetting(bucketOperator.operator);
                    expect(expectedSetting.divide).toBe(bucketOperator.expectedTotalDays);
                });
            });
        });
        describe("should get expected unit text", function () {
            this.bucketOperators = [
                { type: 'day', operator: 'day', expectedUnitText: 'days' },
                { type: 'week', operator: 'week', expectedUnitText: 'weeks' },
                { type: 'month', operator: 'month', expectedUnitText: 'months' },
                { type: 'quarter', operator: 'quarter', expectedUnitText: 'quarters' },
                { type: 'trimester', operator: 'trimester', expectedUnitText: 'trimesters' },
                { type: 'semester', operator: 'semester', expectedUnitText: 'semesters' },
                { type: 'year', operator: 'year', expectedUnitText: 'years' }
            ];
            this.bucketOperators.forEach(function (bucketOperator) {
                it("when operator is " + bucketOperator.type, function () {
                    var expectedSetting = chartHandler.GetPeriodRangeFormatSetting(bucketOperator.operator);
                    expect(expectedSetting.unitText).toBe(bucketOperator.expectedUnitText);
                });
            });
        });
    });

    describe("call GetFormattedValue", function () {
        beforeEach(function () {
            this.metadata = {};
            this.value = '';
        });

        describe("when bucket is period", function () {
            beforeEach(function () {
                this.metadata.bucket = enumHandlers.FIELDTYPE.PERIOD;
                this.metadata.formatter = new Formatter('#', enumHandlers.FIELDTYPE.PERIOD);
            });
            it("should handle null value", function () {
                this.value = null;
                var expectedValue = chartHandler.GetFormattedValue(this.metadata, this.value);
                expect(expectedValue).toBe(null);
            });
        });
    });

    describe("call ConvertAggregateValue ", function () {

        it("should return percentage when isShowPercentage is true", function () {
            var percent = 0.1;
            var expectedValue = chartHandler.ConvertAggregateValue(0, 'value', null, true, percent);
            expect(expectedValue).toBe("10 %");
        });

        it("should return zero percent when isShowPercentage is true and percentage is null", function () {
            var percent = null;
            var expectedValue = chartHandler.ConvertAggregateValue(0, 'value', null, true, percent);
            expect(expectedValue).toBe("0 %");
        });

    });

    describe(".GenerateChart", function () {

        describe("verification scrolls to top", function () {

            beforeEach(function () {
                jQuery([
                    '<div id="ChartWrapper">',
                        '<div class="chartWrapper" style="height: 1000px; overflow: scroll;">',
                            '<div style="height: 2000px;"></div>',
                        '</div>',
                    '</div>'
                ].join('')).appendTo('body');

                var fieldSettingsStub = { GetDisplayDetails: jQuery.noop };
                spyOn(fieldSettingsStub, 'GetDisplayDetails').and.returnValue({ chart_type: 'bar' });
                chartHandler.FieldSettings = fieldSettingsStub;

                spyOn(chartHandler, 'GetChartLabelRotation');
                spyOn(chartHandler, 'IsRadarChartType');

                spyOn(chartHandler.Models.Result, 'Data').and.returnValue({ row_count: 1 });

                spyOn(chartHandler, 'IsDonutOrPieChartType').and.returnValue(false);
                spyOn(chartHandler, 'SetChartOptionAndBinding');

            });

            afterEach(function () {
                jQuery('#ChartWrapper').remove();
            });

            it("should scrolls to top position when it has to generate chart", function () {
                var chartWrapper = jQuery('#ChartWrapper').find('.chartWrapper');
                chartWrapper.scrollTop(1000);
                expect(chartWrapper.scrollTop()).toEqual(1000);

                chartHandler.GenerateChart();

                expect(chartWrapper.scrollTop()).toEqual(0);
            });

        });

    });
    describe(".SetReferenceBand", function () {
        var chart;
        beforeEach(function () {
            chartHandler.FieldSettings = {
                GetFields: function () {
                    return {
                        findObjects: function () {
                            return [
                                {
                                    is_selected: true,
                                    FieldDetails: '{"targetlinedetails": {"fromvalue": 5,"tovalue": 500}}',
                                    FieldName: ''
                                },
                                {
                                    is_selected: true,
                                    FieldDetails: '{"targetlinedetails": {"fromvalue": 50,"tovalue": 5000}}',
                                    FieldName: ''
                                }
                            ];
                        }

                    };
                },
                GetDisplayDetails: function () {
                    return {
                        show_as_percentage: false,
                        chart_type: '',
                        multi_axis: false,
                        stack: false
                    }
                }
            };
            spyOn(chartHandler, 'GetDataItemsFromView');
            spyOn(chartHandler, 'CalculateValuesBoundary');
            spyOn(chartHandler, 'IsScatterOrBubbleChartType').and.returnValue(true);
            chart = {
                options: {
                    yAxis: {},
                    series: [
                        {
                            data: '', axis: 0
                        },
                        {
                            data: '', axis: 1
                        }
                    ],
                }
            }
        });

        describe("reference band or line when not multi_axis", function () {
            it("should set reference line", function () {
                chartHandler.FieldSettings.GetFields = function () {
                    return {
                        findObjects: function () {
                            return [
                                {
                                    is_selected: true,
                                    FieldDetails: '{"targetlinedetails": {"fromvalue": 5,"tovalue":null}}',
                                    FieldName: ''
                                }
                            ];
                        }
                    };
                };
                spyOn(chartHandler, 'PlotReferenceLine').and.returnValue(true);
                chartHandler.SetReferenceBand(chart);
                expect(chartHandler.PlotReferenceLine).toHaveBeenCalled();
            });
            it("should set reference band", function () {
                spyOn(chartHandler, 'PlotReferenceBand').and.returnValue(true);
                chartHandler.SetReferenceBand(chart);
                expect(chartHandler.PlotReferenceBand).toHaveBeenCalled();
            });
        });

        describe("reference band or line when multi_axis", function () {
            beforeEach(function () {
                chart.options.series = [{ data: '', axis: 0 }, { data: '', axis: 0 }];
                chartHandler.FieldSettings.GetDisplayDetails = function () {
                    return {
                        show_as_percentage: false,
                        chart_type: '',
                        multi_axis: true,
                        stack: false
                    }
                };
            });
            it("should set reference line for multi_axis", function () {
                chartHandler.FieldSettings.GetFields = function () {
                    return {
                        findObjects: function () {
                            return [
                                {
                                    is_selected: true,
                                    FieldDetails: '{"targetlinedetails": {"fromvalue": 5,"tovalue":null}}',
                                    FieldName: ''
                                },
                                {
                                    is_selected: true,
                                    FieldDetails: '{"targetlinedetails": {"fromvalue": 500,"tovalue":null}}',
                                    FieldName: ''
                                }
                            ];
                        }
                    };
                };
                spyOn(chartHandler, 'PlotReferenceLine').and.returnValue(true);
                chartHandler.SetReferenceBand(chart);
                expect(chartHandler.PlotReferenceLine).toHaveBeenCalled();
                expect(chartHandler.PlotReferenceLine.calls.count()).toEqual(2);
            });
            it("should set reference band for multi_axis", function () {
                spyOn(chartHandler, 'PlotReferenceBand').and.returnValue(true);
                chartHandler.SetReferenceBand(chart);
                expect(chartHandler.PlotReferenceBand).toHaveBeenCalled();
                expect(chartHandler.PlotReferenceBand.calls.count()).toEqual(2);
            });
        });
    });
    describe(".PlotReferenceLine", function () {
        var chartDetails, fieldDetails, expectedValue;
        beforeEach(function () {
            chartDetails = {
                chart_type: enumHandlers.CHARTTYPE.BUBBLECHART.Code,
                stack: true,
                multi_axis: true
            };
            fieldDetails = {
                targetlinedetails: { fromvalue: 12, color: "#666666", opacity: 1 }
            };
        });
        describe("set target value for scatter or bubble chart", function () {
            var axisValueSettings, target;
            beforeEach(function () {
                axisValueSettings = {
                    majorUnit: '',
                    max: ''
                };
                spyOn(chartHandler, 'IsScatterOrBubbleChartType').and.returnValue(true);
                expectedValue = {
                    from: 12,
                    to: 11.994988127663728,
                    color: "#666666",
                    opacity: 1
                }
            });
            it("should set target value for multi-axis", function () {
                target = [{ plotBands: '' }, { plotBands: '' }];
                chartHandler.PlotReferenceLine(0, chartDetails, fieldDetails, target, axisValueSettings, 0, [], {});
                expect(target[0].plotBands[0]).toEqual(jasmine.objectContaining(expectedValue));
            });
            it("should set target value for non multi-axis", function () {
                target = { plotBands: '' };
                chartDetails.multi_axis = false;
                target = { plotBands: '' };
                chartHandler.PlotReferenceLine(0, chartDetails, fieldDetails, target, axisValueSettings, 0, [], {});
                expect(target.plotBands[0]).toEqual(jasmine.objectContaining(expectedValue));
            });
        });
    });
    describe(".PlotReferenceBand", function () {
        var chartDetails, fieldDetails, target, row = 0, returnedValue = {
            from: 0,
            to: 500,
            color: "#c2c2c2",
            opacity: 0.75
        };
        beforeEach(function () {
            chartDetails = { multi_axis: false };
            fieldDetails = {
                targetlinedetails: {
                    fromvalue: 0,
                    tovalue: 500,
                    color: '#c2c2c2',
                    opacity: 0.75
                }
            }
        });
        it("should set target object properties", function () {
            target = { plotBands: '' };
            spyOn(chartHandler, 'PlotReferenceBand').and.callThrough()
            chartHandler.PlotReferenceBand(row, chartDetails, fieldDetails, target);
            expect(target.plotBands[0]).toEqual(jasmine.objectContaining(returnedValue));
        });
        it("should set target object properties for a specific row", function () {
            chartDetails.multi_axis = true;
            target = [{ plotBands: '' }, { plotBands: '' }];
            spyOn(chartHandler, 'PlotReferenceBand').and.callThrough()
            chartHandler.PlotReferenceBand(row, chartDetails, fieldDetails, target);
            expect(target[0].plotBands[0]).toEqual(jasmine.objectContaining(returnedValue));
        });
    });

    describe(".VisualLabel", function () {

        var e;
        var box;

        beforeEach(function () {
            e = {
                text: '',
                options: {
                    font: ''
                },
                rect: {
                    origin: {
                        x: 1,
                        y: 1
                    }
                },
                createVisual: $.noop
            };

            box = { children: [{}, {}] };

            chartHandler.Chart = {
                _plotArea: {
                    axisX: {
                        box: { x2: 0, y1: 0 }
                    },
                    axisY: {
                        box: { x2: 0, y1: 0 }
                    }
                }
            };

            spyOn(WC.Utility, 'MeasureText');
            spyOn(e, 'createVisual').and.returnValue(box);
            spyOn(chartHandler, 'SetLabelPositionX');
            spyOn(chartHandler, 'SetLabelPositionY');
        });

        it("should not update label position when plotArea is not exists", function () {
            chartHandler.Chart._plotArea = null;

            var result = chartHandler.VisualLabel(e);

            expect(result).toEqual(box);
            expect(chartHandler.SetLabelPositionX).not.toHaveBeenCalled();
            expect(chartHandler.SetLabelPositionY).not.toHaveBeenCalled();
        });

        it("should update label position when plotArea is exists", function () {
            var result = chartHandler.VisualLabel(e);

            expect(result).toEqual(box);
            expect(chartHandler.SetLabelPositionX).toHaveBeenCalled();
            expect(chartHandler.SetLabelPositionY).toHaveBeenCalled();
        });
    });
});
