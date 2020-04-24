/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepView.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepViewModel.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryDefinitionHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepFilterHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepJumpHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepSortableHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/WidgetFilter/WidgetFilterHelper.js" />
/// <reference path="/Dependencies/viewmanagement/shared/fieldchooserhandler.js" />
/// <reference path="/Dependencies/ViewModels/Shared/DataType/DataType.js" />
/// <reference path="/../SharedDependencies/FieldsChooser.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ModelFieldSourceHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ModelFieldsHandler.js" />
/// <reference path="/Dependencies/ViewModels/Models/User/usersettingmodel.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/FilterEditors/BaseFilterEditor.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/FilterEditors/FilterTimespanEditor.js" />


describe("FilterTimespanEditor", function () {
    var editor;

    beforeEach(function () {
        handler = new QueryDefinitionHandler();
        var queryStep = {
            step_type: enumHandlers.FILTERTYPE.FILTER,
            arguments: []
        };
        var modelUri = 'models/1';
        var checkValid = false;
        querysteps = new QueryStepViewModel(queryStep, modelUri, checkValid);
    });

    describe("Operator and Target Type", function () {
        var element, expectedOperators;

        beforeEach(function () {
            $('<div class="query-oprator"> <div data-role="dropdownlist" /> <div data-role="dropdownlist" /> </div>').appendTo('body');
            element = $('.query-oprator');
            editor = new FilterTimespanEditor(handler, querysteps, element);
            expectedOperators = [].concat(enumHandlers.QUERYSTEPOPERATOR.DEFAULT,
                enumHandlers.QUERYSTEPOPERATOR.GROUPONE,
                enumHandlers.QUERYSTEPOPERATOR.GROUPTWO,
                enumHandlers.QUERYSTEPOPERATOR.GROUPTHREE);
        });

        it(".should Get Operators correctly", function () {
            var actualOperators = editor.GetOperators();
            expect(expectedOperators).toEqual(actualOperators);
        });

        it(".should Get Target type correctly", function () {
            expect(enumHandlers.FIELDTYPE.TIMESPAN).toEqual(editor.GetCompareFieldTarget());
        });
    });

    describe(".IsValidArgumentValue", function () {
        var element;
        beforeEach(function () {
            $('<div class="query-oprator"> <div data-role="dropdownlist" /> <div data-role="dropdownlist" /> </div>').appendTo('body');
            element = $('.query-oprator');
            editor = new FilterTimespanEditor(handler, querysteps, element);
        });

        afterEach(function () {
            $('.query-oprator').remove();
        });

        var testCases = [
            {
                datatype: 'timespan (positive)',
                val: 99,
                expected: true
            },
            {
                datatype: 'timespan (negative)',
                val: -1,
                expected: true
            },
            {
                datatype: 'timespan (negative + decimals)',
                val: -1.4,
                expected: true
            },
            {
                datatype: '-99',
                val: '-99',
                expected: true
            },
            {
                datatype: 'null',
                val: null,
                expected: false
            },
            {
                datatype: 'NaN',
                val: NaN,
                expected: false
            },
            {
                datatype: 'string',
                val: 'string',
                expected: false
            },
            {
                datatype: 'undefied',
                val: undefined,
                expected: false
            }
        ];

        jQuery.each(testCases, function (index, testCase) {
            it("should return correct validation for field type: " + testCase.datatype, function () {
                var actual = editor.IsValidArgumentValue(testCase.val);
                expect(testCase.expected).toEqual(actual);
            });
        });
    });

    describe(".TransformPastingList", function () {
        var element;

        beforeEach(function () {
            $('<div class="query-oprator"> <div data-role="dropdownlist" /> <div data-role="dropdownlist" /> </div>').appendTo('body');
            element = $('.query-oprator');
            editor = new FilterTimespanEditor(handler, querysteps, element);
        });

        afterEach(function () {
            $('.query-oprator').remove();
        });

        var testCases = [
            {
                datatype: 'int',
                val: ['1', '0', '-1'],
                expected: [1, 0, -1]
            },
            {
                datatype: 'mix int and NaN',
                val: ['1', '0', 'NaN'],
                expected: [1, 0, NaN]
            },
            {
                datatype: 'mix int and string',
                val: ['1', '0', 'string'],
                expected: [1, 0, NaN]
            },
            {
                datatype: 'mix int and empty',
                val: ['1', '0', ''],
                expected: [1, 0, NaN]
            },
            {
                datatype: 'mix float and empty',
                val: ['1.5', '0', ''],
                expected: [1.5, 0, NaN]
            }
        ];

        jQuery.each(testCases, function (index, testCase) {
            it('should return correct list for field type: ' + testCase.datatype, function () {
                var actual = editor.TransformPastingList(testCase.val);
                expect(testCase.expected).toEqual(actual);
            });
        });
    });

    describe(".GetInputTimeSpanDatasource", function () {
        var element;

        beforeEach(function () {
            $('<div class="query-oprator"> <div data-role="dropdownlist" /> <div data-role="dropdownlist" /> </div>').appendTo('body');
            element = $('.query-oprator');
            editor = new FilterTimespanEditor(handler, querysteps, element);
        });

        afterEach(function () {
            $('.query-oprator').remove();
        });

        var testCases = [
            {
                format: '0 days',
                expected: 'days'
            },
            {
                format: '0 dag',
                expected: 'dag'
            }
        ];

        jQuery.each(testCases, function (index, testCase) {
            it('should return correct format: ' + testCase.format, function () {
                
                var actuals = editor.GetInputTimeSpanDatasource(testCase.format);
                jQuery.each(actuals, function (index, actual) {
                    expect(actual.text).toContain(testCase.expected);
                });
            });
        });
    });
});