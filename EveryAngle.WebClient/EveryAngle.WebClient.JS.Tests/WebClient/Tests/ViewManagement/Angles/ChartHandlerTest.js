/// <reference path="/Dependencies/ViewModels/Models/User/usersettingmodel.js" />
/// <reference path="/Dependencies/ViewModels/Shared/DataType/DataType.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/resultmodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/displayqueryblockmodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/AngleInfoModel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/DisplayModel.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ModelFieldDomainHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angles/FieldSettingsHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angles/ChartHandler.js" />

describe("ChartHandler", function () {

    var chartHandler;

    beforeEach(function () {
        chartHandler = new ChartHandler();
    });


    describe("when create new instance", function () {
        it("should be defined", function () {
            expect(chartHandler).toBeDefined();
        });
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
});

