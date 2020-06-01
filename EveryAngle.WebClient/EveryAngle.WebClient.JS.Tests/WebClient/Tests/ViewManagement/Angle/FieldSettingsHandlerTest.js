/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/AngleInfoModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Shared/DataType/DataType.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/FieldSettings/fieldsettingsmodel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/SystemSettingHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ModelFieldsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ValidationHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/Chart/ChartHelper.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/Chart/ChartOptionsView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/Chart/ChartOptionsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/FieldSettingsHandler.js" />

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

    describe(".SetFieldFormat", function () {

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

    describe(".GetShowTotalForSetting", function () {
        it("should get default value if nothing", function () {
            var settngs = {};
            var result = fieldSettingsHandler.GetShowTotalForSetting(settngs);
            expect(result).toEqual(parseInt(enumHandlers.PIVOTSHOWTOTALMODES[1].id));
        });

        it("should get a correct value if set", function () {
            var settngs = { show_total_for: 3 };
            var result = fieldSettingsHandler.GetShowTotalForSetting(settngs);
            expect(result).toEqual(3);
        });
    });

    describe(".GetPercentageSummaryTypeSetting", function () {
        it("should get default value if nothing", function () {
            var settngs = {};
            var result = fieldSettingsHandler.GetPercentageSummaryTypeSetting(settngs);
            expect(result).toEqual(parseInt(enumHandlers.PERCENTAGESUMMARYTYPES[0].id));
        });

        it("should get a correct value if set", function () {
            var settngs = { percentage_summary_type: 3 };
            var result = fieldSettingsHandler.GetPercentageSummaryTypeSetting(settngs);
            expect(result).toEqual(3);
        });
    });

    describe(".GetIncludeSubtotalsSetting", function () {
        it("should get default value if nothing", function () {
            var settngs = {};
            var result = fieldSettingsHandler.GetIncludeSubtotalsSetting(settngs);
            expect(result).toEqual(false);
        });

        it("should get a correct value if set", function () {
            var settngs = { include_subtotals: true };
            var result = fieldSettingsHandler.GetIncludeSubtotalsSetting(settngs);
            expect(result).toEqual(true);
        });
    });

    describe(".GetTotalsLocationSetting", function () {
        it("should get default value if nothing", function () {
            var settngs = {};
            var result = fieldSettingsHandler.GetTotalsLocationSetting(settngs);
            expect(result).toEqual(enumHandlers.PIVOTTOTALSLOCATION.FAR.Value);
        });

        it("should get a correct value if set", function () {
            var settngs = { totals_location: 0 };
            var result = fieldSettingsHandler.GetTotalsLocationSetting(settngs);
            expect(result).toEqual(0);
        });
    });

});
