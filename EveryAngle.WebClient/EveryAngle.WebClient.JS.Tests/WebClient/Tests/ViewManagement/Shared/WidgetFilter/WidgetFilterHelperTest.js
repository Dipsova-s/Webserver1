/// <reference path="/Dependencies/ViewModels/Shared/DataType/DataType.js" />
/// <reference path="/Dependencies/ViewModels/Models/User/usersettingmodel.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/WidgetFilter/WidgetFilterHelper.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/WidgetFilter/WidgetFilterHelper.DateTranslator.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/UserFriendlyNameHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ModelsHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ModelFollowupsHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ModelFieldsHandler.js" />

describe("WidgetFilterHelper", function () {
    var widgetFilterHelper;

    beforeEach(function () {
        widgetFilterHelper = new WidgetFilterHelper();
        $.extend(widgetFilterHelper, WC.WidgetFilterHelper);
        WC.FormatHelper = new FormatHelper();
    });

    //Define new WidgetFilterHelper
    describe("when using WidgetFilterHelper", function () {
        it("should be defined", function () {
            expect(widgetFilterHelper).toBeDefined();
        });
    });

    //GetDefaultFilterOperator
    describe("GetDefaultFilterOperator", function () {

        var tests = [
            {
                fieldType: undefined,
                expected: 'HASVALUE'
            },
            {
                fieldType: 'BOOLEAN',
                expected: 'EQUALTO'
            },
            {
                fieldType: 'ENUM',
                expected: 'INLIST'
            },
            {
                fieldType: 'TEXT',
                expected: 'CONTAIN'
            },
            {
                fieldType: 'CURRENCY',
                expected: 'GREATERTHAN'
            },
            {
                fieldType: 'NUMBER',
                expected: 'GREATERTHAN'
            },
            {
                fieldType: 'DOUBLE',
                expected: 'GREATERTHAN'
            },
            {
                fieldType: 'INTEGER',
                expected: 'GREATERTHAN'
            },
            {
                fieldType: 'PERCENTAGE',
                expected: 'GREATERTHAN'
            },
            {
                fieldType: 'PERIOD',
                expected: 'GREATERTHAN'
            },
            {
                fieldType: 'DATE',
                expected: 'AFTER'
            },
            {
                fieldType: 'DATETIME',
                expected: 'AFTER'
            },
            {
                fieldType: 'TIME',
                expected: 'AFTER'
            }
        ];

        $.each(tests, function (index, test) {
            it("should return '" + test.expected + "' operator if 'fieldType' is " + (test.fieldType || "not defined"), function () {
                var expected = enumHandlers.OPERATOR[test.expected];
                var fieldType = enumHandlers.FIELDTYPE[test.fieldType];
                var result = widgetFilterHelper.GetDefaultFilterOperator(fieldType);
                expect(expected).toEqual(result);
            });
        });
    });

    //GetDefaultFilterOperatorArguments
    describe("when get default filter operator arguments", function () {
        it("should return 'true' in first filter operation arrays if 'fieldType' is 'BOOLEAN'", function () {
            var fieldType = enumHandlers.FIELDTYPE.BOOLEAN;
            expect(widgetFilterHelper.GetDefaultFilterOperatorArguments(fieldType)[0].value).toBe(true);
        });

        it("should return '0' in first filter operation arrays if 'fieldType' is 'CURRENCY'", function () {
            var fieldType = enumHandlers.FIELDTYPE.CURRENCY;
            expect(widgetFilterHelper.GetDefaultFilterOperatorArguments(fieldType)[0].value).toBe(0);
        });

        it("should return '0' in first filter operation arrays if 'fieldType' is 'NUMBER'", function () {
            var fieldType = enumHandlers.FIELDTYPE.NUMBER;
            expect(widgetFilterHelper.GetDefaultFilterOperatorArguments(fieldType)[0].value).toBe(0);
        });

        it("should return '0' in first filter operation arrays if 'fieldType' is 'PERCENTAGE'", function () {
            var fieldType = enumHandlers.FIELDTYPE.PERCENTAGE;
            expect(widgetFilterHelper.GetDefaultFilterOperatorArguments(fieldType)[0].value).toBe(0);
        });

        it("should return empty arrays if 'fieldType' is not defined", function () {
            var fieldType;
            expect(widgetFilterHelper.GetDefaultFilterOperatorArguments(fieldType).length).toBe(0);
        });
    });

    //ConvertOperatorToCriteria
    describe("when convert operator to criteria", function () {
        it("should return null if 'operator' is not defined", function () {
            var operator = "fake",
                fieldType = enumHandlers.FIELDTYPE.TIME;
            expect(widgetFilterHelper.ConvertOperatorToCriteria(operator, fieldType)).toBe(null);
        });

        it("should return 'HASVALUE''s text if 'operator' is 'HASVALUE'", function () {
            var operator = enumHandlers.OPERATOR.HASVALUE.Value,
                fieldType = enumHandlers.FIELDTYPE.TIME;
            expect(widgetFilterHelper.ConvertOperatorToCriteria(operator, fieldType)).toBe(enumHandlers.OPERATOR.HASVALUE.Text);
        });

        it("should return 'HASNOVALUE''s text if 'operator' is 'HASNOVALUE'", function () {
            var operator = enumHandlers.OPERATOR.HASNOVALUE.Value,
                fieldType = enumHandlers.FIELDTYPE.TIME;
            expect(widgetFilterHelper.ConvertOperatorToCriteria(operator, fieldType)).toBe(enumHandlers.OPERATOR.HASNOVALUE.Text);
        });

        it("should return 'OperatorIsBefore''s text if 'operator' is 'SMALLERTHAN' and fieldType is 'TIME' format", function () {
            var operator = enumHandlers.OPERATOR.SMALLERTHAN.Value,
                fieldType = enumHandlers.FIELDTYPE.TIME;
            expect(widgetFilterHelper.ConvertOperatorToCriteria(operator, fieldType)).toBe(Localization.OperatorIsBefore);
        });

        it("should return 'OperatorIsSmallerThan''s text if 'operator' is 'SMALLERTHAN' and fieldType is 'TEXT' format", function () {
            var operator = enumHandlers.OPERATOR.SMALLERTHAN.Value,
                fieldType = enumHandlers.FIELDTYPE.TEXT;
            expect(widgetFilterHelper.ConvertOperatorToCriteria(operator, fieldType)).toBe(Localization.OperatorIsSmallerThan);
        });

        it("should return 'OperatorIsSmallerThan''s text if 'operator' is 'SMALLERTHAN' and fieldType is 'DOUBLE' format", function () {
            var operator = enumHandlers.OPERATOR.SMALLERTHAN.Value,
                fieldType = enumHandlers.FIELDTYPE.DOUBLE;
            expect(widgetFilterHelper.ConvertOperatorToCriteria(operator, fieldType)).toBe(Localization.OperatorIsSmallerThan);
        });

        it("should return 'OperatorIsSmallerThan''s text if 'operator' is 'SMALLERTHAN' and fieldType is 'INTEGER' format", function () {
            var operator = enumHandlers.OPERATOR.SMALLERTHAN.Value,
                fieldType = enumHandlers.FIELDTYPE.INTEGER;
            expect(widgetFilterHelper.ConvertOperatorToCriteria(operator, fieldType)).toBe(Localization.OperatorIsSmallerThan);
        });

        it("should return 'SMALLERTHAN''s text if 'operator' is 'SMALLERTHAN' and fieldType is not DateTime", function () {
            var operator = enumHandlers.OPERATOR.SMALLERTHAN.Value,
                fieldType = {};
            expect(widgetFilterHelper.ConvertOperatorToCriteria(operator, fieldType)).toBe(enumHandlers.OPERATOR.SMALLERTHAN.Text);
        });

        it("should return 'OperatorIsAfter''s text if fieldType is 'DateTime' format", function () {
            var operator = enumHandlers.OPERATOR.GREATERTHAN.Value,
                fieldType = enumHandlers.FIELDTYPE.TIME;
            expect(widgetFilterHelper.ConvertOperatorToCriteria(operator, fieldType)).toBe(Localization.OperatorIsAfter);
        });

        it("should return 'OperatorIsGreaterThan''s text if 'operator' is 'GREATERTHAN' and fieldType is 'TEXT' format", function () {
            var operator = enumHandlers.OPERATOR.GREATERTHAN.Value,
                fieldType = enumHandlers.FIELDTYPE.TEXT;
            expect(widgetFilterHelper.ConvertOperatorToCriteria(operator, fieldType)).toBe(Localization.OperatorIsGreaterThan);
        });

        it("should return 'OperatorIsGreaterThan''s text if 'operator' is 'GREATERTHAN' and fieldType is 'DOUBLE' format", function () {
            var operator = enumHandlers.OPERATOR.GREATERTHAN.Value,
                fieldType = enumHandlers.FIELDTYPE.DOUBLE;
            expect(widgetFilterHelper.ConvertOperatorToCriteria(operator, fieldType)).toBe(Localization.OperatorIsGreaterThan);
        });

        it("should return 'OperatorIsGreaterThan''s text if 'operator' is 'GREATERTHAN' and fieldType is 'INTEGER' format", function () {
            var operator = enumHandlers.OPERATOR.GREATERTHAN.Value,
                fieldType = enumHandlers.FIELDTYPE.INTEGER;
            expect(widgetFilterHelper.ConvertOperatorToCriteria(operator, fieldType)).toBe(Localization.OperatorIsGreaterThan);
        });

        it("should return 'OperatorIsGreaterThan''s text if 'operator' is 'GREATERTHAN' and fieldType is 'PERIOD' format", function () {
            var operator = enumHandlers.OPERATOR.GREATERTHAN.Value,
                fieldType = enumHandlers.FIELDTYPE.PERIOD;
            expect(widgetFilterHelper.ConvertOperatorToCriteria(operator, fieldType)).toBe(Localization.OperatorIsGreaterThan);
        });

        it("should return 'GREATERTHAN''s text if 'operator' is 'GREATERTHAN' and fieldType is not defined", function () {
            var operator = enumHandlers.OPERATOR.GREATERTHAN.Value,
                fieldType = {};
            expect(widgetFilterHelper.ConvertOperatorToCriteria(operator, fieldType)).toBe(enumHandlers.OPERATOR.GREATERTHAN.Text);
        });

        it("should return 'OperatorIsBeforeOrOn''s text if 'operator' is 'SMALLERTHANOREQUALTO' and fieldType is 'DateTime' format", function () {
            var operator = enumHandlers.OPERATOR.SMALLERTHANOREQUALTO.Value,
                fieldType = enumHandlers.FIELDTYPE.TIME;
            expect(widgetFilterHelper.ConvertOperatorToCriteria(operator, fieldType)).toBe(Localization.OperatorIsBeforeOrOn);
        });

        it("should return 'OperatorIsSmallerThanOrEqualTo''s text if 'operator' is 'SMALLERTHANOREQUALTO' and fieldType is 'TEXT' format", function () {
            var operator = enumHandlers.OPERATOR.SMALLERTHANOREQUALTO.Value,
                fieldType = enumHandlers.FIELDTYPE.TEXT;
            expect(widgetFilterHelper.ConvertOperatorToCriteria(operator, fieldType)).toBe(Localization.OperatorIsSmallerThanOrEqualTo);
        });

        it("should return 'OperatorIsSmallerThanOrEqualTo''s text if 'operator' is 'SMALLERTHANOREQUALTO' and fieldType is 'DOUBLE' format", function () {
            var operator = enumHandlers.OPERATOR.SMALLERTHANOREQUALTO.Value,
                fieldType = enumHandlers.FIELDTYPE.DOUBLE;
            expect(widgetFilterHelper.ConvertOperatorToCriteria(operator, fieldType)).toBe(Localization.OperatorIsSmallerThanOrEqualTo);
        });

        it("should return 'OperatorIsSmallerThanOrEqualTo''s text if 'operator' is 'SMALLERTHANOREQUALTO' and fieldType is 'INTEGER' format", function () {
            var operator = enumHandlers.OPERATOR.SMALLERTHANOREQUALTO.Value,
                fieldType = enumHandlers.FIELDTYPE.INTEGER;
            expect(widgetFilterHelper.ConvertOperatorToCriteria(operator, fieldType)).toBe(Localization.OperatorIsSmallerThanOrEqualTo);
        });

        it("should return 'OperatorIsSmallerThanOrEqualTo''s text if 'operator' is 'SMALLERTHANOREQUALTO' and fieldType is 'PERIOD' format", function () {
            var operator = enumHandlers.OPERATOR.SMALLERTHANOREQUALTO.Value,
                fieldType = enumHandlers.FIELDTYPE.PERIOD;
            expect(widgetFilterHelper.ConvertOperatorToCriteria(operator, fieldType)).toBe(Localization.OperatorIsSmallerThanOrEqualTo);
        });

        it("should return 'SMALLERTHANOREQUALTO''s text if 'operator' is 'GREATERTHANOREQUALTO' and fieldType is not defined", function () {
            var operator = enumHandlers.OPERATOR.SMALLERTHANOREQUALTO.Value,
                fieldType = {};
            expect(widgetFilterHelper.ConvertOperatorToCriteria(operator, fieldType)).toBe(enumHandlers.OPERATOR.SMALLERTHANOREQUALTO.Text);
        });

        it("should return 'OperatorIsAfterOrOn''s text if 'operator' is 'GREATERTHANOREQUALTO' and fieldType is 'DateTime' format", function () {
            var operator = enumHandlers.OPERATOR.GREATERTHANOREQUALTO.Value,
                fieldType = enumHandlers.FIELDTYPE.TIME;
            expect(widgetFilterHelper.ConvertOperatorToCriteria(operator, fieldType)).toBe(Localization.OperatorIsAfterOrOn);
        });

        it("should return 'OperatorIsGreaterThanOrEqualTo''s text if 'operator' is 'GREATERTHANOREQUALTO' and fieldType is 'TEXT' format", function () {
            var operator = enumHandlers.OPERATOR.GREATERTHANOREQUALTO.Value,
                fieldType = enumHandlers.FIELDTYPE.TEXT;
            expect(widgetFilterHelper.ConvertOperatorToCriteria(operator, fieldType)).toBe(Localization.OperatorIsGreaterThanOrEqualTo);
        });

        it("should return 'OperatorIsGreaterThanOrEqualTo''s text if 'operator' is 'GREATERTHANOREQUALTO' and fieldType is 'DOUBLE' format", function () {
            var operator = enumHandlers.OPERATOR.GREATERTHANOREQUALTO.Value,
                fieldType = enumHandlers.FIELDTYPE.DOUBLE;
            expect(widgetFilterHelper.ConvertOperatorToCriteria(operator, fieldType)).toBe(Localization.OperatorIsGreaterThanOrEqualTo);
        });

        it("should return 'OperatorIsGreaterThanOrEqualTo''s text if 'operator' is 'GREATERTHANOREQUALTO' and fieldType is 'INTEGER' format", function () {
            var operator = enumHandlers.OPERATOR.GREATERTHANOREQUALTO.Value,
                fieldType = enumHandlers.FIELDTYPE.INTEGER;
            expect(widgetFilterHelper.ConvertOperatorToCriteria(operator, fieldType)).toBe(Localization.OperatorIsGreaterThanOrEqualTo);
        });

        it("should return 'OperatorIsGreaterThanOrEqualTo''s text if 'operator' is 'GREATERTHANOREQUALTO' and fieldType is 'PERIOD' format", function () {
            var operator = enumHandlers.OPERATOR.GREATERTHANOREQUALTO.Value,
                fieldType = enumHandlers.FIELDTYPE.PERIOD;
            expect(widgetFilterHelper.ConvertOperatorToCriteria(operator, fieldType)).toBe(Localization.OperatorIsGreaterThanOrEqualTo);
        });

        it("should return 'GREATERTHANOREQUALTO''s text if 'operator' is 'GREATERTHANOREQUALTO' and fieldType is not defined", function () {
            var operator = enumHandlers.OPERATOR.GREATERTHANOREQUALTO.Value,
                fieldType = {};
            expect(widgetFilterHelper.ConvertOperatorToCriteria(operator, fieldType)).toBe(enumHandlers.OPERATOR.GREATERTHANOREQUALTO.Text);
        });

        it("should return 'EQUALTO''s text if 'operator' is 'EQUALTO'", function () {
            var operator = enumHandlers.OPERATOR.EQUALTO.Value,
                fieldType = {};
            expect(widgetFilterHelper.ConvertOperatorToCriteria(operator, fieldType)).toBe(enumHandlers.OPERATOR.EQUALTO.Text);
        });

        it("should return 'ISIN''s text if 'operator' is 'EQUALTO'", function () {
            var operator = enumHandlers.OPERATOR.EQUALTO.Value,
                fieldType = {};
            expect(widgetFilterHelper.ConvertOperatorToCriteria(operator, fieldType, true)).toBe(enumHandlers.OPERATOR.ISIN.Text);
        });

        it("should return 'NOTEQUALTO''s text if 'operator' is 'NOTEQUALTO'", function () {
            var operator = enumHandlers.OPERATOR.NOTEQUALTO.Value,
                fieldType = {};
            expect(widgetFilterHelper.ConvertOperatorToCriteria(operator, fieldType)).toBe(enumHandlers.OPERATOR.NOTEQUALTO.Text);
        });

        it("should return 'ISNOTIN''s text if 'operator' is 'NOTEQUALTO'", function () {
            var operator = enumHandlers.OPERATOR.NOTEQUALTO.Value,
                fieldType = {};
            expect(widgetFilterHelper.ConvertOperatorToCriteria(operator, fieldType, true)).toBe(enumHandlers.OPERATOR.ISNOTIN.Text);
        });

        it("should return 'BETWEEN''s text if 'operator' is 'BETWEEN'", function () {
            var operator = enumHandlers.OPERATOR.BETWEEN.Value,
                fieldType = {};
            expect(widgetFilterHelper.ConvertOperatorToCriteria(operator, fieldType)).toBe(enumHandlers.OPERATOR.BETWEEN.Text);
        });

        it("should return 'NOTBETWEEN''s text if 'operator' is 'NOTBETWEEN'", function () {
            var operator = enumHandlers.OPERATOR.NOTBETWEEN.Value,
                fieldType = {};
            expect(widgetFilterHelper.ConvertOperatorToCriteria(operator, fieldType)).toBe(enumHandlers.OPERATOR.NOTBETWEEN.Text);
        });
        
        it("should return 'INLIST''s text if 'operator' is 'INLIST'", function () {
            var operator = enumHandlers.OPERATOR.INLIST.Value,
                fieldType = {};
            expect(widgetFilterHelper.ConvertOperatorToCriteria(operator, fieldType)).toBe(enumHandlers.OPERATOR.INLIST.Text);
        });

        it("should return 'NOTINLIST''s text if 'operator' is 'NOTINLIST'", function () {
            var operator = enumHandlers.OPERATOR.NOTINLIST.Value,
                fieldType = {};
            expect(widgetFilterHelper.ConvertOperatorToCriteria(operator, fieldType)).toBe(enumHandlers.OPERATOR.NOTINLIST.Text);
        });

        it("should return 'OperatorContainsSubstringEnum''s text if 'operator' is 'CONTAIN' and 'fieldType' is 'ENUM'", function () {
            var operator = enumHandlers.OPERATOR.CONTAIN.Value,
                fieldType = enumHandlers.FIELDTYPE.ENUM;
            expect(widgetFilterHelper.ConvertOperatorToCriteria(operator, fieldType)).toBe(Localization.OperatorContainsSubstringEnum);
        });

        it("should return 'CONTAIN''s text if 'operator' is 'CONTAIN' and 'fieldType' is not defined'", function () {
            var operator = enumHandlers.OPERATOR.CONTAIN.Value,
                fieldType = {};
            expect(widgetFilterHelper.ConvertOperatorToCriteria(operator, fieldType)).toBe(enumHandlers.OPERATOR.CONTAIN.Text);
        });

        it("should return 'NOTCONTAIN''s text if 'operator' is 'NOTCONTAIN'", function () {
            var operator = enumHandlers.OPERATOR.NOTCONTAIN.Value,
                fieldType = {};
            expect(widgetFilterHelper.ConvertOperatorToCriteria(operator, fieldType)).toBe(enumHandlers.OPERATOR.NOTCONTAIN.Text);
        });

        it("should return 'OperatorContainsSubstringEnum''s text if 'operator' is 'STARTWITH' and 'fieldType' is 'ENUM'", function () {
            var operator = enumHandlers.OPERATOR.CONTAIN.Value,
                fieldType = enumHandlers.FIELDTYPE.ENUM;
            expect(widgetFilterHelper.ConvertOperatorToCriteria(operator, fieldType)).toBe(Localization.OperatorContainsSubstringEnum);
        });

        it("should return 'STARTWITH''s text if 'operator' is 'STARTWITH' and 'fieldType' is not defined'", function () {
            var operator = enumHandlers.OPERATOR.STARTWITH.Value,
                fieldType = {};
            expect(widgetFilterHelper.ConvertOperatorToCriteria(operator, fieldType)).toBe(enumHandlers.OPERATOR.STARTWITH.Text);
        });

        it("should return 'OperatorDoesNotStartWithSubstring''s text if 'operator' is 'NOTSTARTWITH'", function () {
            var operator = enumHandlers.OPERATOR.NOTSTARTWITH.Value,
                fieldType = {};
            expect(widgetFilterHelper.ConvertOperatorToCriteria(operator, fieldType)).toBe(Localization.OperatorDoesNotStartWithSubstring);
        });

        it("should return 'ENDON''s text if 'operator' is 'ENDON'", function () {
            var operator = enumHandlers.OPERATOR.ENDON.Value,
                fieldType = {};
            expect(widgetFilterHelper.ConvertOperatorToCriteria(operator, fieldType)).toBe(enumHandlers.OPERATOR.ENDON.Text);
        });

        it("should return 'NOTENDON''s text if 'operator' is 'NOTENDON'", function () {
            var operator = enumHandlers.OPERATOR.NOTENDON.Value,
                fieldType = {};
            expect(widgetFilterHelper.ConvertOperatorToCriteria(operator, fieldType)).toBe(enumHandlers.OPERATOR.NOTENDON.Text);
        });

        it("should return 'MATCHPATTERN''s text if 'operator' is 'MATCHPATTERN'", function () {
            var operator = enumHandlers.OPERATOR.MATCHPATTERN.Value,
                fieldType = {};
            expect(widgetFilterHelper.ConvertOperatorToCriteria(operator, fieldType)).toBe(enumHandlers.OPERATOR.MATCHPATTERN.Text);
        });
    });

    //ConvertFilterToFilterText
    describe("when using convert filter to filter text", function () {
        it("should return new formatter result", function () {
            var queryStep = {
                operator: enumHandlers.OPERATOR.INLIST.Value,
                arguments: [{
                    argument_type: 'value',
                    field: "fake",
                    value: 2.015
                }]
            };
            var field = {
                fieldtype: enumHandlers.FIELDTYPE.CURRENCY,
                uri: "/models/0"
            };

            var expected = widgetFilterHelper.ConvertFilterToFilterText(queryStep, field);
            expect(expected).toBe('(2.015 EUR)');
        });
    });

    describe("call IsBetweenArgumentComparable", function () {
        var testOperators = ["between", "not_between"];
        $.each(testOperators, function (indexOperator, operator) {
            it("should get 'true' if is '" + operator + "' operator and no type field", function () {
                var validArguments = [
                    [
                        { argument_type: 'value', value: 1 },
                        { argument_type: 'value', value: 2 }
                    ],
                    [
                        { argument_type: 'function', parameters: [{ name: 'period_type', value: 'day' }, { name: 'periods_to_add', value: 1 }] },
                        { argument_type: 'function', parameters: [{ name: 'period_type', value: 'day' }, { name: 'periods_to_add', value: 2 }] }
                    ],
                    [
                        { argument_type: 'value', value: 1 },
                        { argument_type: 'function', parameters: [{ name: 'period_type', value: 'day' }, { name: 'periods_to_add', value: 2 }] }
                    ]
                ];

                $.each(validArguments, function (index, arg) {
                    var expected = widgetFilterHelper.IsBetweenArgumentComparable(operator, arg);
                    expect(expected).toBe(true);
                });
            });
        });

        $.each(testOperators, function (indexOperator, operator) {
            it("should get 'false' if is '" + operator + "' operator but has type field", function () {
                var invalidArguments = [
                    [
                        { argument_type: 'field', field: 'field1' },
                        { argument_type: 'field', field: 'field2' }
                    ],
                    [
                        { argument_type: 'value', value: 1 },
                        { argument_type: 'field', field: 'field2' }
                    ],
                    [
                        { argument_type: 'field', value: 'field2' },
                        { argument_type: 'function', parameters: [{ name: 'period_type', value: 'day' }, { name: 'periods_to_add', value: 2 }] }
                    ]
                ];

                $.each(invalidArguments, function (index, arg) {
                    var expected = widgetFilterHelper.IsBetweenArgumentComparable(operator, arg);
                    expect(expected).toBe(false);
                });
            });
        });
    });

    describe("call CanUseAdvanceArgument", function () {

        it("should be 'true' when date type and equal_to operator", function () {
            var fieldType = 'date';
            var operator = 'equal_to';
            expect(widgetFilterHelper.CanUseAdvanceArgument(fieldType, operator)).toBe(true);
        });

        it("should be 'true' when date type and between operator", function () {
            var fieldType = 'date';
            var operator = 'between';
            expect(widgetFilterHelper.CanUseAdvanceArgument(fieldType, operator)).toBe(true);
        });

        it("should be 'false' when date type and has_value operator", function () {
            var fieldType = 'date';
            var operator = 'has_value';
            expect(widgetFilterHelper.CanUseAdvanceArgument(fieldType, operator)).toBe(false);
        });

        it("should be 'false' when date type and in_set operator", function () {
            var fieldType = 'date';
            var operator = 'in_set';
            expect(widgetFilterHelper.CanUseAdvanceArgument(fieldType, operator)).toBe(false);
        });

        it("should be 'false' when not date type and equal_to operator", function () {
            var fieldType = 'double';
            var operator = 'equal_to';
            expect(widgetFilterHelper.CanUseAdvanceArgument(fieldType, operator)).toBe(false);
        });

        it("should be 'false' when not date type and between operator", function () {
            var fieldType = 'double';
            var operator = 'between';
            expect(widgetFilterHelper.CanUseAdvanceArgument(fieldType, operator)).toBe(false);
        });
    });

    //GetFilterSuffixText
    describe("call GetFilterSuffixText", function () {
        it("should get empty if no argument", function () {
            var fieldType = '';
            var operator = '';
            var argumentCount = 0;
            var result = widgetFilterHelper.GetFilterSuffixText(fieldType, operator, argumentCount);
            var expected = '';
            expect(result).toBe(expected);
        });

        it("should get empty if not date, datetime or period type", function () {
            var fieldType = enumHandlers.FIELDTYPE.INTEGER;
            var operator = enumHandlers.OPERATOR.AFTER.Value;
            var argumentCount = 1;
            var result = widgetFilterHelper.GetFilterSuffixText(fieldType, operator, argumentCount);
            var expected = '';
            expect(result).toBe(expected);
        });
        
        it("should return 'WidgetFilter_PeriodType_Days' if period type and not list operator", function () {
            var fieldType = enumHandlers.FIELDTYPE.PERIOD;
            var operator = enumHandlers.OPERATOR.EQUALTO.Value;
            var argumentCount = 1;
            var result = widgetFilterHelper.GetFilterSuffixText(fieldType, operator, argumentCount);
            var expected = ' ' + Captions.WidgetFilter_PeriodType_Days.toLowerCase();

            expect(result).toBe(expected);
        });
    });

    //GetEnumText
    describe("when get enum text", function () {
        it("should return short name when its value equal to long name", function () {
            var shortname = "fake_name",
                longname = "fake_name",
                expected = shortname;

            expect(widgetFilterHelper.GetEnumText("fake_id", shortname, longname)).toBe(expected);
        });

        it("should return short name with longname the values are not equals", function () {
            var shortname = "fake_shortname",
                longname = "fake_longname",
                expected = shortname + ' (' + longname + ')';

            expect(widgetFilterHelper.GetEnumText("fake_id", shortname, longname)).toBe(expected);
        });
    });

    //GetTimeFormat
    describe("when get time format", function () {
        it("should return user time format by user setting model (HH:mm:ss)", function () {
            var result = widgetFilterHelper.GetTimeFormat();
            expect(result).toBe('HH:mm:ss');
        });

        it("should return user time format by user setting model (h.mm.ss (tt))", function () {
            userSettingModel.IsLoaded(true);
            userSettingModel.Data({
                format_time: "{\"hour\":\"hmm\",\"separator\":\".\"}"
            });
            var result = widgetFilterHelper.GetTimeFormat();

            userSettingModel.IsLoaded(false);
            userSettingModel.Data(null);

            expect(result).toBe('h.mm.ss tt');
        });
    });

    //GetTimeSpanFormat
    describe("when get spantime format", function () {
        it("should return user time format by user setting model ([h]:mm:ss)", function () {
            var result = widgetFilterHelper.GetTimeSpanFormat();
            expect(result).toBe('[h]:mm:ss');
        });

        it("should return user time format by user setting model ([h].mm.ss)", function () {
            userSettingModel.IsLoaded(true);
            userSettingModel.Data({
                format_time: "{\"hour\":\"hmm\",\"separator\":\".\"}"
            });
            var result = widgetFilterHelper.GetTimeSpanFormat();

            userSettingModel.IsLoaded(false);
            userSettingModel.Data(null);

            expect(result).toBe('[h].mm.ss');
        });
    });

    //GetDateTimeFormat
    describe("when get time format", function () {
        var dateTimeFormat = 'MMM/dd/yyyy HH:mm:ss';
        it("should return user date time format by user setting model with utc output", function () {
            expect(widgetFilterHelper.GetDateTimeFormat(true)).toBe(dateTimeFormat + ' UTC');
        });

        it("should return user date time format by user setting model without utc output", function () {
            expect(widgetFilterHelper.GetDateTimeFormat(false)).toBe(dateTimeFormat);
        });

        it("should return user date time format by user setting model without utc output", function () {
            expect(widgetFilterHelper.GetDateTimeFormat()).toBe(dateTimeFormat);
        });
    });

    //GetFilterText
    describe("when get filter Text", function () {
        it("should return field's id and 'has_value' operator's text when step_type is 'FOLLOWUP'", function () {
            var data = {
                step_type: enumHandlers.FILTERTYPE.FOLLOWUP,
                operator: enumHandlers.OPERATOR.HASVALUE.Value,
                field: "fake_id_field",
                followup: "fake_id_followup"
            };
            var modelUri = "/models/0";

            expect(widgetFilterHelper.GetFilterText(data, modelUri)).toBe(data.followup);
        });
    });

    //ConvertFieldType
    describe("when convert field type", function () {
        it("should return field's enum if its domain is defined and field_type is 'TEXT'", function () {
            var field = {
                domain: "fake_domain",
                fieldtype: enumHandlers.FIELDTYPE.TEXT
            };
            expect(widgetFilterHelper.ConvertFieldType(field)).toBe(enumHandlers.FIELDTYPE.ENUM);
        });

        it("should return field's type if its domain is not defined", function () {
            var field = {
                domain: null,
                fieldtype: enumHandlers.FIELDTYPE.TEXT
            };
            expect(widgetFilterHelper.ConvertFieldType(field)).toBe(enumHandlers.FIELDTYPE.TEXT);
        });

        it("should return field's type if field_type is not 'TEXT'", function () {
            var field = {
                domain: null,
                fieldtype: enumHandlers.FIELDTYPE.ENUM
            };
            expect(widgetFilterHelper.ConvertFieldType(field)).toBe(enumHandlers.FIELDTYPE.ENUM);
        });
    });

    //ConvertCriteriaToOperator
    describe("when convert criteria to operator", function () {
        it("should return 'HASVALUE' id selected operator is 'HASVALUE'", function () {
            var selectedCritetia = enumHandlers.OPERATOR.HASVALUE.Value;
            expect(widgetFilterHelper.ConvertCriteriaToOperator(selectedCritetia)).toBe(enumHandlers.OPERATOR.HASVALUE.Value);
        });

        it("should return 'HASVALUE' id selected criteria is 'NOTEMPTY'", function () {
            var selectedCritetia = enumHandlers.CRITERIA.NOTEMPTY;
            expect(widgetFilterHelper.ConvertCriteriaToOperator(selectedCritetia)).toBe(enumHandlers.OPERATOR.HASVALUE.Value);
        });

        it("should return 'HASNOVALUE' id selected operator is 'HASNOVALUE'", function () {
            var selectedCritetia = enumHandlers.OPERATOR.HASNOVALUE.Value;
            expect(widgetFilterHelper.ConvertCriteriaToOperator(selectedCritetia)).toBe(enumHandlers.OPERATOR.HASNOVALUE.Value);
        });

        it("should return 'HASNOVALUE' id selected criteria is 'CRITERIA'", function () {
            var selectedCritetia = enumHandlers.CRITERIA.EMPTY;
            expect(widgetFilterHelper.ConvertCriteriaToOperator(selectedCritetia)).toBe(enumHandlers.OPERATOR.HASNOVALUE.Value);
        });

        it("should return 'EQUALTO' id selected operator is 'EQUALTO'", function () {
            var selectedCritetia = enumHandlers.OPERATOR.EQUALTO.Value;
            expect(widgetFilterHelper.ConvertCriteriaToOperator(selectedCritetia)).toBe(enumHandlers.OPERATOR.EQUALTO.Value);
        });

        it("should return 'EQUALTO' id selected criteria is 'EQUAL'", function () {
            var selectedCritetia = enumHandlers.CRITERIA.EQUAL;
            expect(widgetFilterHelper.ConvertCriteriaToOperator(selectedCritetia)).toBe(enumHandlers.OPERATOR.EQUALTO.Value);
        });

        it("should return 'NOTEQUALTO' id selected operator is 'NOTEQUALTO'", function () {
            var selectedCritetia = enumHandlers.OPERATOR.NOTEQUALTO.Value;
            expect(widgetFilterHelper.ConvertCriteriaToOperator(selectedCritetia)).toBe(enumHandlers.OPERATOR.NOTEQUALTO.Value);
        });

        it("should return 'NOTEQUALTO' id selected criteria is 'NOTEQUAL'", function () {
            var selectedCritetia = enumHandlers.CRITERIA.NOTEQUAL;
            expect(widgetFilterHelper.ConvertCriteriaToOperator(selectedCritetia)).toBe(enumHandlers.OPERATOR.NOTEQUALTO.Value);
        });

        it("should return 'SMALLERTHAN' id selected operator is 'BEFORE'", function () {
            var selectedCritetia = enumHandlers.OPERATOR.BEFORE.Value;
            expect(widgetFilterHelper.ConvertCriteriaToOperator(selectedCritetia)).toBe(enumHandlers.OPERATOR.SMALLERTHAN.Value);
        });

        it("should return 'SMALLERTHAN' id selected operator is 'SMALLERTHAN'", function () {
            var selectedCritetia = enumHandlers.OPERATOR.SMALLERTHAN.Value;
            expect(widgetFilterHelper.ConvertCriteriaToOperator(selectedCritetia)).toBe(enumHandlers.OPERATOR.SMALLERTHAN.Value);
        });

        it("should return 'SMALLERTHAN' id selected criteria is 'SMALLERTHAN'", function () {
            var selectedCritetia = enumHandlers.CRITERIA.SMALLERTHAN;
            expect(widgetFilterHelper.ConvertCriteriaToOperator(selectedCritetia)).toBe(enumHandlers.OPERATOR.SMALLERTHAN.Value);
        });

        it("should return 'GREATERTHAN' id selected operator is 'AFTER'", function () {
            var selectedCritetia = enumHandlers.OPERATOR.AFTER.Value;
            expect(widgetFilterHelper.ConvertCriteriaToOperator(selectedCritetia)).toBe(enumHandlers.OPERATOR.GREATERTHAN.Value);
        });

        it("should return 'GREATERTHAN' id selected operator is 'GREATERTHAN'", function () {
            var selectedCritetia = enumHandlers.OPERATOR.GREATERTHAN.Value;
            expect(widgetFilterHelper.ConvertCriteriaToOperator(selectedCritetia)).toBe(enumHandlers.OPERATOR.GREATERTHAN.Value);
        });

        it("should return 'GREATERTHAN' id selected criteria is 'LARGERTHAN'", function () {
            var selectedCritetia = enumHandlers.CRITERIA.LARGERTHAN;
            expect(widgetFilterHelper.ConvertCriteriaToOperator(selectedCritetia)).toBe(enumHandlers.OPERATOR.GREATERTHAN.Value);
        });

        it("should return 'SMALLERTHANOREQUALTO' id selected operator is 'BEFOREORON'", function () {
            var selectedCritetia = enumHandlers.OPERATOR.BEFOREORON.Value;
            expect(widgetFilterHelper.ConvertCriteriaToOperator(selectedCritetia)).toBe(enumHandlers.OPERATOR.SMALLERTHANOREQUALTO.Value);
        });

        it("should return 'SMALLERTHANOREQUALTO' id selected operator is 'SMALLERTHANOREQUALTO'", function () {
            var selectedCritetia = enumHandlers.OPERATOR.SMALLERTHANOREQUALTO.Value;
            expect(widgetFilterHelper.ConvertCriteriaToOperator(selectedCritetia)).toBe(enumHandlers.OPERATOR.SMALLERTHANOREQUALTO.Value);
        });

        it("should return 'SMALLERTHANOREQUALTO' id selected operator is 'BEFOREOREQUAL'", function () {
            var selectedCritetia = enumHandlers.OPERATOR.BEFOREOREQUAL.Value;
            expect(widgetFilterHelper.ConvertCriteriaToOperator(selectedCritetia)).toBe(enumHandlers.OPERATOR.SMALLERTHANOREQUALTO.Value);
        });

        it("should return 'GREATERTHANOREQUALTO' id selected operator is 'AFTERORON'", function () {
            var selectedCritetia = enumHandlers.OPERATOR.AFTERORON.Value;
            expect(widgetFilterHelper.ConvertCriteriaToOperator(selectedCritetia)).toBe(enumHandlers.OPERATOR.GREATERTHANOREQUALTO.Value);
        });

        it("should return 'GREATERTHANOREQUALTO' id selected operator is 'GREATERTHANOREQUALTO'", function () {
            var selectedCritetia = enumHandlers.OPERATOR.GREATERTHANOREQUALTO.Value;
            expect(widgetFilterHelper.ConvertCriteriaToOperator(selectedCritetia)).toBe(enumHandlers.OPERATOR.GREATERTHANOREQUALTO.Value);
        });

        it("should return 'GREATERTHANOREQUALTO' id selected operator is 'AFTEROREQUAL'", function () {
            var selectedCritetia = enumHandlers.OPERATOR.AFTEROREQUAL.Value;
            expect(widgetFilterHelper.ConvertCriteriaToOperator(selectedCritetia)).toBe(enumHandlers.OPERATOR.GREATERTHANOREQUALTO.Value);
        });

        it("should return its custom criteria if not matched", function () {
            var selectedCritetia = "fake_criteria";
            expect(widgetFilterHelper.ConvertCriteriaToOperator(selectedCritetia)).toBe(selectedCritetia);
        });
    });

    //GetDefaultModelDataDate
    describe("when get default model data date", function () {
    });

    //GetInvalidCssClass
    describe("when get invalid css class", function () {
        it("should return 'validWarning' when step_type is 'FILTER' or data.valid is 'false'", function () {
            var data = {
                arguments: [{ fake: {}, valid: false }],
                step_type: enumHandlers.FILTERTYPE.FILTER,
                valid: false
            };
            var expected = 'validWarning';
            expect(widgetFilterHelper.GetInvalidCssClass(data)).toBe(expected);
        });

        it("should return 'validWarning' when step_type is 'FILTER' or data.valid is 'true' but its arguments is containing valid 'false'", function () {
            var data = {
                arguments: [{ argument: 'field', value: 'fake', valid: false }],
                step_type: enumHandlers.FILTERTYPE.FILTER,
                valid: false
            };
            var expected = 'validWarning';
            expect(widgetFilterHelper.GetInvalidCssClass(data)).toBe(expected);
        });

        it("should return 'validError' when step_type is 'FOLLOWUP'", function () {
            var data = {
                step_type: enumHandlers.FILTERTYPE.FOLLOWUP,
                valid: false
            };
            var expected = 'validError';
            expect(widgetFilterHelper.GetInvalidCssClass(data)).toBe(expected);
        });

        it("should return empty when data and its arguments are valid", function () {
            var data = {
                arguments: [{ fake: {}, valid: true }],
                step_type: enumHandlers.FILTERTYPE.FOLLOWUP,
                valid: true
            };
            var expected = '';
            expect(widgetFilterHelper.GetInvalidCssClass(data)).toBe(expected);
        });
    });

    describe("call GetBaseDate", function () {

        var tests = [
            { date: new Date(2017, 2, 15, 10, 15, 1, 154), type: 'day', expected: '2017/03/15 00:00:00' },

            { date: new Date(2017, 2, 11), type: 'week', dayOfWeek: 0, expected: '2017/03/05 00:00:00' },
            { date: new Date(2017, 2, 12), type: 'week', dayOfWeek: 0, expected: '2017/03/12 00:00:00' },
            { date: new Date(2017, 2, 13), type: 'week', dayOfWeek: 0, expected: '2017/03/12 00:00:00' },
            { date: new Date(2017, 2, 14), type: 'week', dayOfWeek: 0, expected: '2017/03/12 00:00:00' },

            { date: new Date(2017, 2, 11), type: 'week', dayOfWeek: 1, expected: '2017/03/06 00:00:00' },
            { date: new Date(2017, 2, 12), type: 'week', dayOfWeek: 1, expected: '2017/03/06 00:00:00' },
            { date: new Date(2017, 2, 13), type: 'week', dayOfWeek: 1, expected: '2017/03/13 00:00:00' },
            { date: new Date(2017, 2, 14), type: 'week', dayOfWeek: 1, expected: '2017/03/13 00:00:00' },

            { date: new Date(2017, 2, 11), type: 'week', dayOfWeek: 2, expected: '2017/03/07 00:00:00' },
            { date: new Date(2017, 2, 12), type: 'week', dayOfWeek: 2, expected: '2017/03/07 00:00:00' },
            { date: new Date(2017, 2, 13), type: 'week', dayOfWeek: 2, expected: '2017/03/07 00:00:00' },
            { date: new Date(2017, 2, 14), type: 'week', dayOfWeek: 2, expected: '2017/03/14 00:00:00' },

            { date: new Date(2017, 0, 15), type: 'month', expected: '2017/01/01 00:00:00' },
            { date: new Date(2017, 11, 15), type: 'month', expected: '2017/12/01 00:00:00' },

            { date: new Date(2017, 0, 15), type: 'quarter', expected: '2017/01/01 00:00:00' },
            { date: new Date(2017, 1, 15), type: 'quarter', expected: '2017/01/01 00:00:00' },
            { date: new Date(2017, 2, 15), type: 'quarter', expected: '2017/01/01 00:00:00' },
            { date: new Date(2017, 3, 15), type: 'quarter', expected: '2017/04/01 00:00:00' },
            { date: new Date(2017, 4, 15), type: 'quarter', expected: '2017/04/01 00:00:00' },
            { date: new Date(2017, 5, 15), type: 'quarter', expected: '2017/04/01 00:00:00' },
            { date: new Date(2017, 6, 15), type: 'quarter', expected: '2017/07/01 00:00:00' },
            { date: new Date(2017, 7, 15), type: 'quarter', expected: '2017/07/01 00:00:00' },
            { date: new Date(2017, 8, 15), type: 'quarter', expected: '2017/07/01 00:00:00' },
            { date: new Date(2017, 9, 15), type: 'quarter', expected: '2017/10/01 00:00:00' },
            { date: new Date(2017, 10, 15), type: 'quarter', expected: '2017/10/01 00:00:00' },
            { date: new Date(2017, 11, 15), type: 'quarter', expected: '2017/10/01 00:00:00' },

            { date: new Date(2017, 0, 15), type: 'trimester', expected: '2017/01/01 00:00:00' },
            { date: new Date(2017, 1, 15), type: 'trimester', expected: '2017/01/01 00:00:00' },
            { date: new Date(2017, 2, 15), type: 'trimester', expected: '2017/01/01 00:00:00' },
            { date: new Date(2017, 3, 15), type: 'trimester', expected: '2017/01/01 00:00:00' },
            { date: new Date(2017, 4, 15), type: 'trimester', expected: '2017/05/01 00:00:00' },
            { date: new Date(2017, 5, 15), type: 'trimester', expected: '2017/05/01 00:00:00' },
            { date: new Date(2017, 6, 15), type: 'trimester', expected: '2017/05/01 00:00:00' },
            { date: new Date(2017, 7, 15), type: 'trimester', expected: '2017/05/01 00:00:00' },
            { date: new Date(2017, 8, 15), type: 'trimester', expected: '2017/09/01 00:00:00' },
            { date: new Date(2017, 9, 15), type: 'trimester', expected: '2017/09/01 00:00:00' },
            { date: new Date(2017, 10, 15), type: 'trimester', expected: '2017/09/01 00:00:00' },
            { date: new Date(2017, 11, 15), type: 'trimester', expected: '2017/09/01 00:00:00' },

            { date: new Date(2017, 0, 15), type: 'semester', expected: '2017/01/01 00:00:00' },
            { date: new Date(2017, 1, 15), type: 'semester', expected: '2017/01/01 00:00:00' },
            { date: new Date(2017, 2, 15), type: 'semester', expected: '2017/01/01 00:00:00' },
            { date: new Date(2017, 3, 15), type: 'semester', expected: '2017/01/01 00:00:00' },
            { date: new Date(2017, 4, 15), type: 'semester', expected: '2017/01/01 00:00:00' },
            { date: new Date(2017, 5, 15), type: 'semester', expected: '2017/01/01 00:00:00' },
            { date: new Date(2017, 6, 15), type: 'semester', expected: '2017/07/01 00:00:00' },
            { date: new Date(2017, 7, 15), type: 'semester', expected: '2017/07/01 00:00:00' },
            { date: new Date(2017, 8, 15), type: 'semester', expected: '2017/07/01 00:00:00' },
            { date: new Date(2017, 9, 15), type: 'semester', expected: '2017/07/01 00:00:00' },
            { date: new Date(2017, 10, 15), type: 'semester', expected: '2017/07/01 00:00:00' },
            { date: new Date(2017, 11, 15), type: 'semester', expected: '2017/07/01 00:00:00' },

            { date: new Date(2017, 2, 15), type: 'year', expected: '2017/01/01 00:00:00' }
        ];

        $.each(tests, function (index, test) {

            it("should get correct base date of '" + test.type + (typeof test.dayOfWeek === 'number' ? '+' + test.dayOfWeek : '') + "' ('" + kendo.toString(test.date, 'yyyy/MM/dd HH:mm:ss') + "' => '" + test.expected + "')", function () {
                spyOn(WC.DateHelper, 'GetFirstDayOfWeek').and.callFake(function () { return test.dayOfWeek; });
                var result = widgetFilterHelper.GetBaseDate(test.date, test.type);
                expect(test.expected).toEqual(kendo.toString(result, 'yyyy/MM/dd HH:mm:ss'));
            });

        });

    });

    describe("call GetAddedDate", function () {

        var tests = [
            { date: new Date(2017, 2, 1), type: 'day', added: -1, expected: '2017/02/28 00:00:00' },
            { date: new Date(2017, 2, 1), type: 'day', added: 0, expected: '2017/03/01 00:00:00' },
            { date: new Date(2017, 2, 31), type: 'day', added: 1, expected: '2017/04/01 00:00:00' },

            { date: new Date(2017, 2, 6), type: 'week', added: -1, expected: '2017/02/27 00:00:00' },
            { date: new Date(2017, 2, 6), type: 'week', added: 0, expected: '2017/03/06 00:00:00' },
            { date: new Date(2017, 2, 6), type: 'week', added: 1, expected: '2017/03/13 00:00:00' },

            { date: new Date(2017, 0, 1), type: 'month', added: -1, expected: '2016/12/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'month', added: 0, expected: '2017/01/01 00:00:00' },
            { date: new Date(2017, 11, 1), type: 'month', added: 1, expected: '2018/01/01 00:00:00' },

            { date: new Date(2017, 0, 1), type: 'quarter', added: -5, expected: '2015/10/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'quarter', added: -4, expected: '2016/01/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'quarter', added: -3, expected: '2016/04/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'quarter', added: -2, expected: '2016/07/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'quarter', added: -1, expected: '2016/10/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'quarter', added: 0, expected: '2017/01/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'quarter', added: 1, expected: '2017/04/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'quarter', added: 2, expected: '2017/07/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'quarter', added: 3, expected: '2017/10/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'quarter', added: 4, expected: '2018/01/01 00:00:00' },

            { date: new Date(2017, 0, 1), type: 'trimester', added: -4, expected: '2015/09/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'trimester', added: -3, expected: '2016/01/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'trimester', added: -2, expected: '2016/05/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'trimester', added: -1, expected: '2016/09/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'trimester', added: 0, expected: '2017/01/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'trimester', added: 1, expected: '2017/05/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'trimester', added: 2, expected: '2017/09/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'trimester', added: 3, expected: '2018/01/01 00:00:00' },

            { date: new Date(2017, 0, 1), type: 'semester', added: -2, expected: '2016/01/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'semester', added: -1, expected: '2016/07/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'semester', added: 0, expected: '2017/01/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'semester', added: 1, expected: '2017/07/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'semester', added: 2, expected: '2018/01/01 00:00:00' },

            { date: new Date(2017, 0, 1), type: 'year', added: -1, expected: '2016/01/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'year', added: 0, expected: '2017/01/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'year', added: 1, expected: '2018/01/01 00:00:00' }
        ];

        $.each(tests, function (index, test) {

            it("should get correct added date of '" + test.type + " " + (test.added > 0 ? '+' : '') + test.added + "' ('" + kendo.toString(test.date, 'yyyy/MM/dd HH:mm:ss') + "' => '" + test.expected + "')", function () {
                var result = widgetFilterHelper.GetAddedDate(test.date, test.type, test.added);
                expect(test.expected).toEqual(kendo.toString(result, 'yyyy/MM/dd HH:mm:ss'));
            });

        });

    });

    describe("call GetLowerBoundDate", function () {

        var tests = [
            { date: new Date(2017, 2, 1), type: 'day', operator: 'greater_than', added: -1, expected: '2017/03/01 00:00:00' },
            { date: new Date(2017, 2, 1), type: 'day', operator: 'greater_than', added: 0, expected: '2017/03/02 00:00:00' },
            { date: new Date(2017, 2, 1), type: 'day', operator: 'greater_than', added: 1, expected: '2017/03/03 00:00:00' },
            { date: new Date(2017, 2, 1), type: 'day', operator: 'less_than', added: -1, expected: '2017/02/28 00:00:00' },
            { date: new Date(2017, 2, 1), type: 'day', operator: 'less_than', added: 0, expected: '2017/03/01 00:00:00' },
            { date: new Date(2017, 2, 1), type: 'day', operator: 'less_than', added: 1, expected: '2017/03/02 00:00:00' },

            { date: new Date(2017, 2, 6), type: 'week', operator: 'greater_than', added: -1, expected: '2017/03/06 00:00:00' },
            { date: new Date(2017, 2, 6), type: 'week', operator: 'greater_than', added: 0, expected: '2017/03/13 00:00:00' },
            { date: new Date(2017, 2, 6), type: 'week', operator: 'greater_than', added: 1, expected: '2017/03/20 00:00:00' },
            { date: new Date(2017, 2, 6), type: 'week', operator: 'less_than', added: -1, expected: '2017/02/27 00:00:00' },
            { date: new Date(2017, 2, 6), type: 'week', operator: 'less_than', added: 0, expected: '2017/03/06 00:00:00' },
            { date: new Date(2017, 2, 6), type: 'week', operator: 'less_than', added: 1, expected: '2017/03/13 00:00:00' },

            { date: new Date(2017, 0, 1), type: 'month', operator: 'greater_than', added: -1, expected: '2017/01/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'month', operator: 'greater_than', added: 0, expected: '2017/02/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'month', operator: 'greater_than', added: 1, expected: '2017/03/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'month', operator: 'less_than', added: -1, expected: '2016/12/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'month', operator: 'less_than', added: 0, expected: '2017/01/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'month', operator: 'less_than', added: 1, expected: '2017/02/01 00:00:00' },

            { date: new Date(2017, 0, 1), type: 'quarter', operator: 'greater_than', added: -1, expected: '2017/01/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'quarter', operator: 'greater_than', added: 0, expected: '2017/04/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'quarter', operator: 'greater_than', added: 1, expected: '2017/07/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'quarter', operator: 'less_than', added: -1, expected: '2016/10/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'quarter', operator: 'less_than', added: 0, expected: '2017/01/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'quarter', operator: 'less_than', added: 1, expected: '2017/04/01 00:00:00' },

            { date: new Date(2017, 0, 1), type: 'trimester', operator: 'greater_than', added: -1, expected: '2017/01/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'trimester', operator: 'greater_than', added: 0, expected: '2017/05/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'trimester', operator: 'greater_than', added: 1, expected: '2017/09/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'trimester', operator: 'less_than', added: -1, expected: '2016/09/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'trimester', operator: 'less_than', added: 0, expected: '2017/01/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'trimester', operator: 'less_than', added: 1, expected: '2017/05/01 00:00:00' },

            { date: new Date(2017, 0, 1), type: 'semester', operator: 'greater_than', added: -1, expected: '2017/01/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'semester', operator: 'greater_than', added: 0, expected: '2017/07/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'semester', operator: 'greater_than', added: 1, expected: '2018/01/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'semester', operator: 'less_than', added: -1, expected: '2016/07/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'semester', operator: 'less_than', added: 0, expected: '2017/01/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'semester', operator: 'less_than', added: 1, expected: '2017/07/01 00:00:00' },

            { date: new Date(2017, 0, 1), type: 'year', operator: 'greater_than', added: -1, expected: '2017/01/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'year', operator: 'greater_than', added: 0, expected: '2018/01/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'year', operator: 'greater_than', added: 1, expected: '2019/01/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'year', operator: 'less_than', added: -1, expected: '2016/01/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'year', operator: 'less_than', added: 0, expected: '2017/01/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'year', operator: 'less_than', added: 1, expected: '2018/01/01 00:00:00' }
        ];

        $.each(tests, function (index, test) {

            it("should get correct lower bound date of '" + test.type + " " + test.operator + " " + (test.added > 0 ? '+' : '') + test.added + "' ('" + kendo.toString(test.date, 'yyyy/MM/dd HH:mm:ss') + "' => '" + test.expected + "')", function () {
                spyOn(WC.DateHelper, 'GetFirstDayOfWeek').and.callFake(function () { return 1; });
                var result = widgetFilterHelper.GetLowerBoundDate(test.date, test.type, test.added, test.operator);
                expect(test.expected).toEqual(kendo.toString(result, 'yyyy/MM/dd HH:mm:ss'));
            });

        });

    });

    describe("call GetUpperBoundDate", function () {

        var tests = [
            { date: new Date(2017, 2, 1), type: 'day', operator: 'equal_to', added: -1, expected: '2017/03/01 00:00:00' },
            { date: new Date(2017, 2, 1), type: 'day', operator: 'equal_to', added: 0, expected: '2017/03/02 00:00:00' },
            { date: new Date(2017, 2, 1), type: 'day', operator: 'equal_to', added: 1, expected: '2017/03/03 00:00:00' },
            { date: new Date(2017, 2, 1), type: 'day', operator: 'not_equal_to', added: -1, expected: '2017/03/01 00:00:00' },
            { date: new Date(2017, 2, 1), type: 'day', operator: 'not_equal_to', added: 0, expected: '2017/03/02 00:00:00' },
            { date: new Date(2017, 2, 1), type: 'day', operator: 'not_equal_to', added: 1, expected: '2017/03/03 00:00:00' },
            { date: new Date(2017, 2, 1), type: 'day', operator: 'between', added: -1, expected: '2017/03/01 00:00:00' },
            { date: new Date(2017, 2, 1), type: 'day', operator: 'between', added: 0, expected: '2017/03/02 00:00:00' },
            { date: new Date(2017, 2, 1), type: 'day', operator: 'between', added: 1, expected: '2017/03/03 00:00:00' },
            { date: new Date(2017, 2, 1), type: 'day', operator: 'not_between', added: -1, expected: '2017/03/01 00:00:00' },
            { date: new Date(2017, 2, 1), type: 'day', operator: 'not_between', added: 0, expected: '2017/03/02 00:00:00' },
            { date: new Date(2017, 2, 1), type: 'day', operator: 'not_between', added: 1, expected: '2017/03/03 00:00:00' },

            { date: new Date(2017, 2, 6), type: 'week', operator: 'equal_to', added: -1, expected: '2017/03/06 00:00:00' },
            { date: new Date(2017, 2, 6), type: 'week', operator: 'equal_to', added: 0, expected: '2017/03/13 00:00:00' },
            { date: new Date(2017, 2, 6), type: 'week', operator: 'equal_to', added: 1, expected: '2017/03/20 00:00:00' },
            { date: new Date(2017, 2, 6), type: 'week', operator: 'not_equal_to', added: -1, expected: '2017/03/06 00:00:00' },
            { date: new Date(2017, 2, 6), type: 'week', operator: 'not_equal_to', added: 0, expected: '2017/03/13 00:00:00' },
            { date: new Date(2017, 2, 6), type: 'week', operator: 'not_equal_to', added: 1, expected: '2017/03/20 00:00:00' },
            { date: new Date(2017, 2, 6), type: 'week', operator: 'between', added: -1, expected: '2017/03/06 00:00:00' },
            { date: new Date(2017, 2, 6), type: 'week', operator: 'between', added: 0, expected: '2017/03/13 00:00:00' },
            { date: new Date(2017, 2, 6), type: 'week', operator: 'between', added: 1, expected: '2017/03/20 00:00:00' },
            { date: new Date(2017, 2, 6), type: 'week', operator: 'not_between', added: -1, expected: '2017/03/06 00:00:00' },
            { date: new Date(2017, 2, 6), type: 'week', operator: 'not_between', added: 0, expected: '2017/03/13 00:00:00' },
            { date: new Date(2017, 2, 6), type: 'week', operator: 'not_between', added: 1, expected: '2017/03/20 00:00:00' },

            { date: new Date(2017, 0, 1), type: 'month', operator: 'equal_to', added: -1, expected: '2017/01/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'month', operator: 'equal_to', added: 0, expected: '2017/02/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'month', operator: 'equal_to', added: 1, expected: '2017/03/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'month', operator: 'not_equal_to', added: -1, expected: '2017/01/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'month', operator: 'not_equal_to', added: 0, expected: '2017/02/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'month', operator: 'not_equal_to', added: 1, expected: '2017/03/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'month', operator: 'between', added: -1, expected: '2017/01/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'month', operator: 'between', added: 0, expected: '2017/02/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'month', operator: 'between', added: 1, expected: '2017/03/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'month', operator: 'not_between', added: -1, expected: '2017/01/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'month', operator: 'not_between', added: 0, expected: '2017/02/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'month', operator: 'not_between', added: 1, expected: '2017/03/01 00:00:00' },

            { date: new Date(2017, 0, 1), type: 'quarter', operator: 'equal_to', added: -1, expected: '2017/01/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'quarter', operator: 'equal_to', added: 0, expected: '2017/04/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'quarter', operator: 'equal_to', added: 1, expected: '2017/07/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'quarter', operator: 'not_equal_to', added: -1, expected: '2017/01/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'quarter', operator: 'not_equal_to', added: 0, expected: '2017/04/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'quarter', operator: 'not_equal_to', added: 1, expected: '2017/07/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'quarter', operator: 'between', added: -1, expected: '2017/01/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'quarter', operator: 'between', added: 0, expected: '2017/04/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'quarter', operator: 'between', added: 1, expected: '2017/07/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'quarter', operator: 'not_between', added: -1, expected: '2017/01/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'quarter', operator: 'not_between', added: 0, expected: '2017/04/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'quarter', operator: 'not_between', added: 1, expected: '2017/07/01 00:00:00' },

            { date: new Date(2017, 0, 1), type: 'trimester', operator: 'equal_to', added: -1, expected: '2017/01/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'trimester', operator: 'equal_to', added: 0, expected: '2017/05/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'trimester', operator: 'equal_to', added: 1, expected: '2017/09/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'trimester', operator: 'not_equal_to', added: -1, expected: '2017/01/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'trimester', operator: 'not_equal_to', added: 0, expected: '2017/05/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'trimester', operator: 'not_equal_to', added: 1, expected: '2017/09/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'trimester', operator: 'between', added: -1, expected: '2017/01/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'trimester', operator: 'between', added: 0, expected: '2017/05/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'trimester', operator: 'between', added: 1, expected: '2017/09/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'trimester', operator: 'not_between', added: -1, expected: '2017/01/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'trimester', operator: 'not_between', added: 0, expected: '2017/05/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'trimester', operator: 'not_between', added: 1, expected: '2017/09/01 00:00:00' },

            { date: new Date(2017, 0, 1), type: 'semester', operator: 'equal_to', added: -1, expected: '2017/01/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'semester', operator: 'equal_to', added: 0, expected: '2017/07/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'semester', operator: 'equal_to', added: 1, expected: '2018/01/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'semester', operator: 'not_equal_to', added: -1, expected: '2017/01/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'semester', operator: 'not_equal_to', added: 0, expected: '2017/07/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'semester', operator: 'not_equal_to', added: 1, expected: '2018/01/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'semester', operator: 'between', added: -1, expected: '2017/01/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'semester', operator: 'between', added: 0, expected: '2017/07/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'semester', operator: 'between', added: 1, expected: '2018/01/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'semester', operator: 'not_between', added: -1, expected: '2017/01/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'semester', operator: 'not_between', added: 0, expected: '2017/07/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'semester', operator: 'not_between', added: 1, expected: '2018/01/01 00:00:00' },

            { date: new Date(2017, 0, 1), type: 'year', operator: 'equal_to', added: -1, expected: '2017/01/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'year', operator: 'equal_to', added: 0, expected: '2018/01/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'year', operator: 'equal_to', added: 1, expected: '2019/01/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'year', operator: 'not_equal_to', added: -1, expected: '2017/01/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'year', operator: 'not_equal_to', added: 0, expected: '2018/01/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'year', operator: 'not_equal_to', added: 1, expected: '2019/01/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'year', operator: 'between', added: -1, expected: '2017/01/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'year', operator: 'between', added: 0, expected: '2018/01/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'year', operator: 'between', added: 1, expected: '2019/01/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'year', operator: 'not_between', added: -1, expected: '2017/01/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'year', operator: 'not_between', added: 0, expected: '2018/01/01 00:00:00' },
            { date: new Date(2017, 0, 1), type: 'year', operator: 'not_between', added: 1, expected: '2019/01/01 00:00:00' }
        ];

        $.each(tests, function (index, test) {

            it("should get correct upper bound date of '" + test.type + " " + test.operator + " " + (test.added > 0 ? '+' : '') + test.added + "' ('" + kendo.toString(test.date, 'yyyy/MM/dd HH:mm:ss') + "' => '" + test.expected + "')", function () {
                var result = widgetFilterHelper.GetUpperBoundDate(test.date, test.type, test.added);
                expect(test.expected).toEqual(kendo.toString(result, 'yyyy/MM/dd HH:mm:ss'));
            });

        });

    });

    describe("call GetTranslatedSettings", function () {

        it("should not be translate if contains type field", function () {
            var args = [{
                argument_type: 'field',
                field: 'AAA'
            }];
            var operator = 'equal_to';
            var fieldType = 'date';

            var expected = '';
            var result = widgetFilterHelper.GetTranslatedSettings(args, operator, fieldType, '');
            expect(expected).toEqual(result.template);
        });

        it("should not be translate if contains only values", function () {
            var args = [{
                argument_type: 'value',
                value: 0
            }, {
                argument_type: 'value',
                value: null
            }];
            var operator = 'between';
            var fieldType = 'date';

            var expected = '';
            var result = widgetFilterHelper.GetTranslatedSettings(args, operator, fieldType, '');
            expect(expected).toEqual(result.template);
        });

        var tests = [
            { argsText: '0 day', operator: 'equal_to', fieldType: 'date', expected: Localization.WidgetFilter_Preview_Equal },
            { argsText: '0 day', operator: 'equal_to', fieldType: 'datetime', expected: Localization.WidgetFilter_Preview_Equal },
            { argsText: '0 month', operator: 'equal_to', fieldType: 'date', expected: Localization.WidgetFilter_Preview_Between },
            { argsText: '0 month', operator: 'equal_to', fieldType: 'datetime', expected: Localization.WidgetFilter_Preview_Between },
            { argsText: '-2 week|3 month', operator: 'between', fieldType: 'date', expected: Localization.WidgetFilter_Preview_Between },
            { argsText: '-2 week|3 month', operator: 'between', fieldType: 'datetime', expected: Localization.WidgetFilter_Preview_Between },
            { argsText: '0 day', operator: 'not_equal_to', fieldType: 'date', expected: Localization.WidgetFilter_Preview_NotEqual },
            { argsText: '0 day', operator: 'not_equal_to', fieldType: 'datetime', expected: Localization.WidgetFilter_Preview_NotEqual },
            { argsText: '0 month', operator: 'not_equal_to', fieldType: 'date', expected: Localization.WidgetFilter_Preview_NotBetween },
            { argsText: '0 month', operator: 'not_equal_to', fieldType: 'datetime', expected: Localization.WidgetFilter_Preview_NotBetween },
            { argsText: '-2 week|3 month', operator: 'not_between', fieldType: 'date', expected: Localization.WidgetFilter_Preview_NotBetween },
            { argsText: '-2 week|3 month', operator: 'not_between', fieldType: 'datetime', expected: Localization.WidgetFilter_Preview_NotBetween },
            { argsText: '0 day', operator: 'greater_than', fieldType: 'date', expected: Localization.WidgetFilter_Preview_After },
            { argsText: '0 day', operator: 'greater_than', fieldType: 'datetime', expected: Localization.WidgetFilter_Preview_After },
            { argsText: '0 day', operator: 'less_than', fieldType: 'date', expected: Localization.WidgetFilter_Preview_Before },
            { argsText: '0 day', operator: 'less_than', fieldType: 'datetime', expected: Localization.WidgetFilter_Preview_Before }
        ];
        $.each(tests, function (index, test) {

            it("should get a translate settings for '" + test.fieldType + " " + test.operator + " " + test.argsText + "' as '" + test.expected + "'", function () {
                spyOn(widgetFilterHelper, 'GetDefaultModelDataDate').and.callFake(function () { return new Date(2017, 1, 1); });
                var args = [];
                $.each(test.argsText.split(','), function (index, arg) {
                    var values = arg.split(' ');
                    args.push({
                        argument_type: 'function',
                        parameters: [{
                            name: 'periods_to_add',
                            value: parseInt(values[0])
                        }, {
                            name: 'period_type',
                            value: values[1]
                        }]
                    });
                });
                var result = widgetFilterHelper.GetTranslatedSettings(args, test.operator, test.fieldType, '', new Date(2017, 1, 1));
                expect(test.expected).toEqual(result.template);
            });

        });

    });

});