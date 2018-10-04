/// <reference path="/Dependencies/ViewModels/Models/User/usersettingmodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/AngleInfoModel.js" />
/// <reference path="/Dependencies/ViewModels/Shared/DataType/DataType.js" />
/// <reference path="/Dependencies/ViewManagement/shared/ModelFieldsHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angles/FieldSettingsHandler.js" />

describe("FieldSettingsHandler", function () {

    // variables and functions
    var fieldSettingsHandler;
    var createMockFieldSetting;
    var createPivotPageHandler;

    beforeEach(function () {
        fieldSettingsHandler = new FieldSettingsHandler();

        createMockFieldSetting = function (fieldSetting) {
            var setting = {
                Index: 0,
                CellFormat: '',
                CellFormatType: 0,
                Area: 0,
                Caption: '',
                DefaultCaption: '',
                FieldName: '',
                Operator: '',
                CssClass: '',
                InternalID: '',
                DataType: '',
                IsDomain: false,
                DomainURI: '',
                MayBeSorted: false,
                SortDirection: '',
                FieldDetails: '',
                MultiLangAlias: [],
                IsSelected: false,
                Valid: false,
                ValidError: '',
                Bucket: {
                    field_type: '',
                    Operator: '',
                    field: ''
                }
            };

            return jQuery.extend(true, setting, fieldSetting);
        };

        createPivotPageHandler = function (pivotPageHandler) {
            var handeler = {
                Models: {
                    Angle: new AngleInfoViewModel()
                }
            };

            return jQuery.extend(true, handeler, pivotPageHandler);
        };
    });

    describe("When set format to count field in chart or pivot data area", function () {

        it("must return the format options", function () {
            var angle = new AngleInfoViewModel().Data({ model: 'MODEL_A' });
            angle.Data.commit();
            //mock count setting from mockdata.js
            var fieldSetting = createMockFieldSetting(mockCountSetting);

            var expected = {
                options: [],
                formats: [],
                units: [
                    { name: "Use Default", id: "usedefault" },
                    { name: "None", id: "N" },
                    { name: "Thousands (K)", id: "K" },
                    { name: "Millions (M)", id: "M" }
                ],
                thousand: true
            };
            fieldSettingsHandler.Handler = createPivotPageHandler({ Models: { Angle: angle } });

            // Act
            var actual = fieldSettingsHandler.GetBucketOptions(fieldSetting);

            // Assert
            for (var i = 0; i < expected.units.length; i++) {
                expect(expected.units[i].id).toEqual(actual.units[i].id);
            }
            expect(expected.thousand).toEqual(actual.thousand);
        });

    });

    describe("When set bucket to day for datetime field type in chart or pivot data area", function () {

        it("must return only date format without time", function () {
            var angle = new AngleInfoViewModel().Data({ model: 'MODEL_A' });
            angle.Data.commit();

            //mock field setting with datetime from mockdata.js
            var fieldSetting = createMockFieldSetting(mockDateTimeFieldSetting);
            var fieldDetails = { pivot_area: "row", suffix: "", sorting: "" };
            var expectedformat = "MMM/dd/yyyy";
            fieldSettingsHandler.Handler = createPivotPageHandler({ Models: { Angle: angle } });

            // Act
            fieldSettingsHandler.SetFieldFormat(fieldSetting, fieldDetails);

            // Assert
            expect(expectedformat).toEqual(fieldSetting.CellFormat);
        });

    });

    describe("When get template options", function () {

        it("box chart template must have check box show as percentage", function () {

            var boxChartTemplateOption = fieldSettingsHandler.GetBoxChartTemplateOptions();
            var boxChartTemplate = boxChartTemplateOption.join('');
            expect(boxChartTemplate).toContain('ShowAsPercentage');
        });
    });

    describe("Chart can show as percentage", function () {

        it("stack barchart can show as percentage", function () {
            var option = {
                chart_type: enumHandlers.CHARTTYPE.BARCHART.Code,
                multi_axis: false,
                stack: true
            };
            var canShowAsPercentage = fieldSettingsHandler.ChartCanShowAsPercentage(option);
            expect(canShowAsPercentage).toEqual(true);
        });

        it("line chart can not show as percentage", function () {
            var option = {
                chart_type: enumHandlers.CHARTTYPE.LINECHART.Code,
                multi_axis: false,
                stack: false
            };
            var canShowAsPercentage = fieldSettingsHandler.ChartCanShowAsPercentage(option);
            expect(canShowAsPercentage).toEqual(false);
        });
    });

    describe(".SetTimeFormat", function () {

        beforeEach(function () {
            fieldSettingsHandler.Handler = {
                Models: {
                    Angle: {
                        Data: ko.observable({ model: '/models/1' })
                    }
                }
            };
        });

        it("should set a correct time format", function () {
            spyOn(modelFieldsHandler, 'GetFieldById').and.callFake(function () {
                return {
                    fieldtype: 'time',
                    user_specific: {}
                };
            });

            var field = {
                SourceField: 'test',
                DataType: 'time'
            };
            var fieldDetails = { second: 'ss' };
            fieldSettingsHandler.SetTimeFormat(field, fieldDetails);
            expect(field.CellFormat).toEqual('HH:mm:ss');
        });

    });

    describe(".SetTimeSpanFormat", function () {

        beforeEach(function () {
            fieldSettingsHandler.Handler = {
                Models: {
                    Angle: {
                        Data: ko.observable({ model: '/models/1' })
                    }
                }
            };
        });

        it("should set a correct timespan format", function () {
            spyOn(modelFieldsHandler, 'GetFieldById').and.callFake(function () {
                return {
                    fieldtype: 'timespan',
                    user_specific: {}
                };
            });

            var field = {
                SourceField: 'test',
                DataType: 'timespan'
            };
            var fieldDetails = { second: 'ss' };
            fieldSettingsHandler.SetTimeSpanFormat(field, fieldDetails);
            expect(field.CellFormat).toEqual('[h]:mm:ss');
        });

    });

    describe(".GetBucketFormatOptions", function () {

        it("should get a list of decimal formats in data area", function () {

            var formats = fieldSettingsHandler.GetBucketFormatOptions(enumHandlers.FIELDTYPE.INTEGER, enumHandlers.FIELDSETTINGAREA.DATA, enumHandlers.AGGREGATION.AVERAGE.Value, false);
            expect(formats.length).not.toEqual(0);

        });

        it("should not get a list of formats in data area", function () {

            var formats = fieldSettingsHandler.GetBucketFormatOptions(enumHandlers.FIELDTYPE.INTEGER, enumHandlers.FIELDSETTINGAREA.DATA, enumHandlers.AGGREGATION.COUNT.Value, false);
            expect(formats.length).toEqual(0);

        });

        it("should get a list of formats in row/column area when is text field and individual operator", function () {

            var formats = fieldSettingsHandler.GetBucketFormatOptions(enumHandlers.FIELDTYPE.TEXT, enumHandlers.FIELDSETTINGAREA.ROW, 'individual', true);
            expect(formats.length).not.toEqual(0);

        });

        it("should not get a list of formats in row/column area when is text field but not individual operator", function () {

            var formats = fieldSettingsHandler.GetBucketFormatOptions(enumHandlers.FIELDTYPE.TEXT, enumHandlers.FIELDSETTINGAREA.ROW, 'xxx', true);
            expect(formats.length).toEqual(0);

        });

        it("should get a list of formats in row/column area when is enum field and individual operator", function () {

            var formats = fieldSettingsHandler.GetBucketFormatOptions(enumHandlers.FIELDTYPE.ENUM, enumHandlers.FIELDSETTINGAREA.ROW, 'individual', true);
            expect(formats.length).not.toEqual(0);

        });

        it("should not get a list of formats in row/column area when is enum field but not individual operator", function () {

            var formats = fieldSettingsHandler.GetBucketFormatOptions(enumHandlers.FIELDTYPE.ENUM, enumHandlers.FIELDSETTINGAREA.ROW, 'xxx', true);
            expect(formats.length).toEqual(0);

        });

        it("should not get a list of formats in row/column area when is text/enum field but no domain uri", function () {

            var formats = fieldSettingsHandler.GetBucketFormatOptions(enumHandlers.FIELDTYPE.ENUM, enumHandlers.FIELDSETTINGAREA.ROW, 'individual', false);
            expect(formats.length).toEqual(0);

        });

        it("should get a list of formats in row/column area when is double field", function () {

            var formats = fieldSettingsHandler.GetBucketFormatOptions(enumHandlers.FIELDTYPE.DOUBLE, enumHandlers.FIELDSETTINGAREA.ROW, 'xxx', false);
            expect(formats.length).not.toEqual(0);

        });

        it("should get a list of formats in row/column area when is currency field", function () {

            var formats = fieldSettingsHandler.GetBucketFormatOptions(enumHandlers.FIELDTYPE.CURRENCY, enumHandlers.FIELDSETTINGAREA.ROW, 'xxx', false);
            expect(formats.length).not.toEqual(0);

        });

        it("should get a list of formats in row/column area when is percentage field", function () {

            var formats = fieldSettingsHandler.GetBucketFormatOptions(enumHandlers.FIELDTYPE.PERCENTAGE, enumHandlers.FIELDSETTINGAREA.ROW, 'xxx', false);
            expect(formats.length).not.toEqual(0);

        });

        it("should get a list of formats in row/column area when is period field", function () {

            var formats = fieldSettingsHandler.GetBucketFormatOptions(enumHandlers.FIELDTYPE.PERIOD, enumHandlers.FIELDSETTINGAREA.ROW, 'xxx', false);
            expect(formats.length).not.toEqual(0);

        });

    });

    describe(".AddUseDefaulToFormatList", function () {

        var formatList;

        beforeEach(function () {
            formatList = [{
                name: 'test',
                id: 'test'
            }];
        });

        it("when undefined format, should not add default value to list", function () {
            formatList = fieldSettingsHandler.AddUseDefaulToFormatList('', formatList);
            expect(formatList.length).toEqual(1);
        });

        it("when formatList is enum, should add default value to list", function () {
            formatList = fieldSettingsHandler.AddUseDefaulToFormatList('enumerated', formatList);
            expect(formatList[0].id).toEqual('usedefault');
        });

        it("when formatList is time, should add default value to list", function () {
            formatList = fieldSettingsHandler.AddUseDefaulToFormatList('time', formatList);
            expect(formatList[0].id).toEqual('usedefault');
        });

        it("when formatList is timespan, should add default value to list", function () {
            formatList = fieldSettingsHandler.AddUseDefaulToFormatList('timespan', formatList);
            expect(formatList[0].id).toEqual('usedefault');
        });

        it("when formatList is number, should add default value to list", function () {
            formatList = fieldSettingsHandler.AddUseDefaulToFormatList('number', formatList);
            expect(formatList[0].id).toEqual('usedefault');
        });

        it("when formatList is integer, should add default value to list", function () {
            formatList = fieldSettingsHandler.AddUseDefaulToFormatList('int', formatList);
            expect(formatList[0].id).toEqual('usedefault');
        });

        it("when formatList is double, should add default value to list", function () {
            formatList = fieldSettingsHandler.AddUseDefaulToFormatList('double', formatList);
            expect(formatList[0].id).toEqual('usedefault');
        });

        it("when formatList is currency, should add default value to list", function () {
            formatList = fieldSettingsHandler.AddUseDefaulToFormatList('currency', formatList);
            expect(formatList[0].id).toEqual('usedefault');
        });

        it("when formatList is percentage, should add default value to list", function () {
            formatList = fieldSettingsHandler.AddUseDefaulToFormatList('percentage', formatList);
            expect(formatList[0].id).toEqual('usedefault');
        });

        it("when formatList is other type, should not add default value to list", function () {
            formatList = fieldSettingsHandler.AddUseDefaulToFormatList('text', formatList);
            expect(formatList.length).toEqual(1);
        });
    });

    describe(".SetNumberFormat", function () {

        it("should set type as numeric if is data area", function () {
            var field = { Area: enumHandlers.FIELDSETTINGAREA.DATA };
            var formatter = new Formatter({}, 'double');
            fieldSettingsHandler.SetNumberFormat(field, formatter);

            expect(field.CellFormatType).toEqual(enumHandlers.DEVXPRESSFORMATTYPE.NUMERIC);
        });

        it("should set type as custom if is not data area", function () {
            var field = { Area: enumHandlers.FIELDSETTINGAREA.ROW };
            var formatter = new Formatter({}, 'percentage');
            fieldSettingsHandler.SetNumberFormat(field, formatter);

            expect(field.CellFormatType).toEqual(enumHandlers.DEVXPRESSFORMATTYPE.CUSTOM);
        });

    });

    describe(".GetStandardNumberFormat", function () {

        it("should set type as numeric and handle percentage format", function () {
            var formatter = new Formatter({
                prefix: null,
                decimals: 0,
                thousandseparator: false
            }, 'percentage');
            var result = fieldSettingsHandler.GetStandardNumberFormat(formatter);

            expect(result).toEqual('0 %');
        });

        it("should set type as numeric and handle K format", function () {
            var formatter = new Formatter({
                prefix: 'K',
                decimals: 0,
                thousandseparator: false
            }, 'int');
            var result = fieldSettingsHandler.GetStandardNumberFormat(formatter);

            expect(result).toEqual('0, K');
        });

        it("should set type as numeric and handle M format", function () {
            var formatter = new Formatter({
                prefix: 'M',
                decimals: 0,
                thousandseparator: false
            }, 'double');
            var result = fieldSettingsHandler.GetStandardNumberFormat(formatter);

            expect(result).toEqual('0,, M');
        });

    });

    describe(".NeedToDisableDisplayOptions", function () {

        beforeEach(function () {
            fieldSettingsHandler.FieldSettings = { GetFields: $.noop };
            fieldSettingsHandler.Handler = {
                Models: {
                    Display: {
                        Data: ko.observable({
                            display_type: null
                        })
                    }
                }
            };
        });

        it("disable display options button if PIVOT fieldType TIME is selected", function () {
            fieldSettingsHandler.Handler.Models.Display.Data().display_type = enumHandlers.DISPLAYTYPE.PIVOT;
            spyOn(fieldSettingsHandler.FieldSettings, 'GetFields').and.callFake(function () {
                var fields = [
                    {IsSelected : true, DataType : enumHandlers.FIELDTYPE.TIME}
                ];

                return fields;
            });

            var result = fieldSettingsHandler.NeedToDisableDisplayOptions();

            expect(result).toEqual(true);
        });

        it("enable display options button if PIVOT fieldType TIME is not selected", function () {
            fieldSettingsHandler.Handler.Models.Display.Data().display_type = enumHandlers.DISPLAYTYPE.PIVOT;
            spyOn(fieldSettingsHandler.FieldSettings, 'GetFields').and.callFake(function () {
                var fields = [
                    { IsSelected: false, DataType: enumHandlers.FIELDTYPE.TIME }
                ];

                return fields;
            });

            var result = fieldSettingsHandler.NeedToDisableDisplayOptions();

            expect(result).toEqual(false);
        });

        it("enable disable display options button if PIVOT fieldType DOUBLE is selected", function () {
            fieldSettingsHandler.Handler.Models.Display.Data().display_type = enumHandlers.DISPLAYTYPE.PIVOT;
            spyOn(fieldSettingsHandler.FieldSettings, 'GetFields').and.callFake(function () {
                var fields = [
                    { IsSelected: true, DataType: enumHandlers.FIELDTYPE.DOUBLE }
                ];

                return fields;
            });

            var result = fieldSettingsHandler.NeedToDisableDisplayOptions();

            expect(result).toEqual(false);
        });

        it("enable disable display options button if LINECHART fieldType TIME is selected", function () {
            fieldSettingsHandler.Handler.Models.Display.Data().display_type = enumHandlers.DISPLAYTYPE.LINECHART;
            spyOn(fieldSettingsHandler.FieldSettings, 'GetFields').and.callFake(function () {
                var fields = [
                    { IsSelected: true, DataType: enumHandlers.FIELDTYPE.TIME }
                ];

                return fields;
            });

            var result = fieldSettingsHandler.NeedToDisableDisplayOptions();

            expect(result).toEqual(false);
        });
    });

    describe(".GetDefaultOperator", function () {

        it("default operator for fieldType TIME in data area must be AVERAGE", function () {
            var fieldType = enumHandlers.FIELDTYPE.TIME;
            var area = enumHandlers.FIELDSETTINGAREA.DATA;
            var result = fieldSettingsHandler.GetDefaultOperator(fieldType, area);

            expect(result).toEqual(enumHandlers.AGGREGATION.AVERAGE.Value);
        });

        it("default operator for fieldType PERIOD in data area must be SUM", function () {
            var fieldType = enumHandlers.FIELDTYPE.PERIOD;
            var area = enumHandlers.FIELDSETTINGAREA.DATA;
            var result = fieldSettingsHandler.GetDefaultOperator(fieldType, area);

            expect(result).toEqual(enumHandlers.AGGREGATION.SUM.Value);
        });

    });

    describe(".CanSetChartScale", function () {

        var tests = [
            { index: 0, chart: 'line', expected: true },
            { index: 1, chart: 'line', expected: true },
            { index: 2, chart: 'line', expected: false },
            { index: 3, chart: 'line', expected: false },
            { index: 4, chart: 'line', expected: false },
            { index: 0, chart: 'bubble', expected: true },
            { index: 1, chart: 'bubble', expected: false }
        ];

        $.each(tests, function (index, test) {
            it("should " + (test.expected ? "" : "not ") + "be able' to set '" + test.chart + "' chart scale if field index is '" + test.index + "'", function () {
                fieldSettingsHandler.FieldSettings = {
                    GetDisplayDetails: function () { return { chart_type: test.chart }; }
                };

                var result = fieldSettingsHandler.CanSetChartScale(test.index);
                expect(test.expected).toEqual(result);
            });
        });

    });

    describe(".CreateChartScaleFormatSettings", function () {

        window.textDays = 'days';
        var tests = [
            { datatype: 'others', expected: 'test' },
            { datatype: 'time', expected: 'seconds' },
            { datatype: 'timespan', expected: 'days' }
        ];

        $.each(tests, function (index, test) {
            it("should set suffix to '" + test.expected + "' if data type is '" + test.datatype + "'", function () {
                var createFieldFormatSettingsResult = { type: test.datatype, suffix: 'test' };
                spyOn(fieldSettingsHandler, 'CreateFieldFormatSettings').and.callFake(function () { return createFieldFormatSettingsResult; });
                spyOn(WC.FormatHelper, 'GetUserDefaultFormatSettings').and.callFake(function () { return {}; });

                var result = fieldSettingsHandler.CreateChartScaleFormatSettings();
                expect(test.expected).toEqual(result.suffix);
            });
        });

    });

    describe(".GetChartScaleBoundary", function () {

        var tests = [
            { datatype: 'any', prefix: null, decimals: 0, scale: null, expected: [0, 1] },
            { datatype: 'any', prefix: 'K', decimals: 0, scale: [2000, 3000], expected: [2, 3] },
            { datatype: 'any', prefix: 'M', decimals: 0, scale: [2000000, 3000000], expected: [2, 3] },
            { datatype: 'any', prefix: null, decimals: 2, scale: [2.5555, 3.5555], expected: [2.56, 3.56] },
            { datatype: 'percentage', prefix: null, decimals: 1, scale: [0.555555555, 10.555555555], expected: [0.556, 10.556] },
            { datatype: 'any', prefix: null, decimals: 0, scale: [3, 2], expected: [3, 4] }
        ];

        $.each(tests, function (index, test) {
            it("should get a correct chart scale (type:" + test.datatype + ", prefix:" + test.prefix + ", decimals:" + test.decimals + ") [" + (test.scale ? test.scale.toString() : '') + "] -> [" + test.expected.toString() + "]", function () {
                var fieldFormatSettings = {
                    type: test.datatype,
                    prefix: test.prefix,
                    decimals: test.decimals
                };
                var result = fieldSettingsHandler.GetChartScaleBoundary(fieldFormatSettings, test.scale);
                expect(test.expected).toEqual([result.lower, result.upper]);
            });
        });

    });

    describe(".CreateChartScaleElement", function () {

        it("a container should contains caption text and suffix", function () {
            var container = $('<div />');
            var element = fieldSettingsHandler.CreateChartScaleElement(container, 0, 'MY_CAPTION', 'MY_SUFFIX');
            var result = container[0].innerHTML;

            expect(result).toContain('MY_CAPTION');
            expect(result).toContain('MY_SUFFIX');
            expect(result).toContain(' suffix');
        });

        it("a container should contains caption text but no suffix", function () {
            var container = $('<div />');
            var element = fieldSettingsHandler.CreateChartScaleElement(container, 0, 'MY_CAPTION', '');
            var result = container[0].innerHTML;

            expect(result).toContain('MY_CAPTION');
            expect(result).not.toContain('MY_SUFFIX');
            expect(result).not.toContain(' suffix');
        });

    });

    describe(".SetPeriodFormat", function () {
        beforeEach(function () {
            this.field = {};
        });

        it("should returns numeric type when field area is data", function () {
            this.field.Area = enumHandlers.FIELDSETTINGAREA.DATA;
            fieldSettingsHandler.SetPeriodFormat(this.field);
            expect(this.field.CellFormatType).toBe(enumHandlers.DEVXPRESSFORMATTYPE.NUMERIC);
        });

        it("should returns custom type when field area is row", function () {
            this.field.Area = enumHandlers.FIELDSETTINGAREA.ROW;
            fieldSettingsHandler.SetPeriodFormat(this.field);
            expect(this.field.CellFormatType).toBe(enumHandlers.DEVXPRESSFORMATTYPE.CUSTOM);
        });

        it("should returns custom type when field area is column", function () {
            this.field.Area = enumHandlers.FIELDSETTINGAREA.COLUMN;
            fieldSettingsHandler.SetPeriodFormat(this.field);
            expect(this.field.CellFormatType).toBe(enumHandlers.DEVXPRESSFORMATTYPE.CUSTOM);
        });
    });

    describe(".ChangeIncludeSubtotals()", function () {

        it("should not reset layout", function () {
            fieldSettingsHandler.IsNeedResetLayout = false;
            fieldSettingsHandler.FieldSettings = { SetDisplayDetails: $.noop };
            fieldSettingsHandler.ChangeIncludeSubtotals();
            expect(fieldSettingsHandler.IsNeedResetLayout).toEqual(false);
        });

    });

    describe(".ShowTotalForChanged(e)", function () {

        it("should not reset layout", function () {
            fieldSettingsHandler.IsNeedResetLayout = false;
            fieldSettingsHandler.FieldSettings = { SetDisplayDetails: $.noop };
            fieldSettingsHandler.ShowTotalForChanged({ sender: { value: $.noop } });
            expect(fieldSettingsHandler.IsNeedResetLayout).toEqual(false);
        });

    });

    describe(".PercentageSummaryChanged(e)", function () {

        it("should not reset layout", function () {
            fieldSettingsHandler.IsNeedResetLayout = false;
            fieldSettingsHandler.FieldSettings = { SetDisplayDetails: $.noop };
            fieldSettingsHandler.PercentageSummaryChanged({ sender: { value: $.noop } });
            expect(fieldSettingsHandler.IsNeedResetLayout).toEqual(false);
        });

    });

    describe(".SelectedCountCheckbox()", function () {

        it("should not reset layout", function () {
            spyOn(fieldSettingsHandler, 'SetSorting').and.callFake($.noop);
            fieldSettingsHandler.IsNeedResetLayout = false;
            fieldSettingsHandler.FieldSettings = {
                GetFields: function () {
                    return [
                        { FieldName: 'count' }
                    ];
                }
            };
            fieldSettingsHandler.SelectedCountCheckbox();
            expect(fieldSettingsHandler.IsNeedResetLayout).toEqual(false);
        });

    });

});
