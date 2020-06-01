/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepViewModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryDefinitionHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepFilterHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepJumpHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepSortableHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/WidgetFilter/WidgetFilterHelper.js" />
/// <chutzpah_reference path="/../../Dependencies/viewmanagement/shared/fieldchooserhandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Shared/DataType/DataType.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ModelFieldSourceHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ModelFieldsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/FilterEditors/BaseFilterEditor.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/FilterEditors/FilterTimeEditor.js" />


describe("FilterTimeEditor", function () {
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
            editor = new FilterTimeEditor(handler, querysteps, element);
            expectedOperators = [].concat(enumHandlers.QUERYSTEPOPERATOR.DEFAULT,
                enumHandlers.QUERYSTEPOPERATOR.GROUPONE,
                enumHandlers.QUERYSTEPOPERATOR.TIMEONE,
                enumHandlers.QUERYSTEPOPERATOR.GROUPTHREE);
        });

        it("should Get Operators correctly", function () {
            var actualOperators = editor.GetOperators();
            expect(expectedOperators).toEqual(actualOperators);
        });

        it("should Get Target type correctly", function () {
            expect(enumHandlers.FIELDTYPE.TIME).toEqual(editor.GetCompareFieldTarget());
        });
    });

    describe(".IsValidArgumentValue", function () {
        var element;
        beforeEach(function () {
            $('<div class="query-oprator"> <div data-role="dropdownlist" /> <div data-role="dropdownlist" /> </div>').appendTo('body');
            element = $('.query-oprator');
            editor = new FilterTimeEditor(handler, querysteps, element);
        });

        afterEach(function () {
            $('.query-oprator').remove();
        });

        var testCases = [
            {
                datatype: 'time (positive)',
                val: 99,
                expected: true
            },
            {
                datatype: 'time (negative)',
                val: -1,
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
            editor = new FilterTimeEditor(handler, querysteps, element);
            spyOn(WC.FormatHelper, "GetUserDefaultFormatSettings").and.callFake(function () {
                return {
                    timedelimiter: ':'
                };
            });
        });

        afterEach(function () {
            $('.query-oprator').remove();
        });

        var testCases = [
            {
                datatype: 'int',
                val: ['1', '0', '-1'],
                expected: [3600, 0, NaN]
            },
            {
                datatype: 'mix int and NaN',
                val: ['1', '0', 'NaN'],
                expected: [3600, 0, NaN]
            },
            {
                datatype: 'mix int and string',
                val: ['1', '0', 'string'],
                expected: [3600, 0, NaN]
            },
            {
                datatype: 'mix int and empty',
                val: ['1', '0', ''],
                expected: [3600, 0, NaN]
            },
            {
                datatype: 'Border',
                val: ['24', '0', '-1'],
                expected: [NaN, 0, NaN]
            }
        ];

        jQuery.each(testCases, function (index, testCase) {
            it('should return correct list for field type: ' + testCase.datatype, function () {
                var actual = editor.TransformPastingList(testCase.val);
                expect(testCase.expected).toEqual(actual);
            });
        });
    });

    describe(".ParseTime", function () {
        var element;

        beforeEach(function () {
            $('<div class="query-oprator"> <div data-role="dropdownlist" /> <div data-role="dropdownlist" /> </div>').appendTo('body');
            element = $('.query-oprator');
            editor = new FilterTimeEditor(handler, querysteps, element);

            spyOn(WC.FormatHelper, "GetUserDefaultFormatSettings").and.callFake(function () {
                return {
                    timedelimiter: ':'
                };
            });
        });

        afterEach(function () {
            $('.query-oprator').remove();
        });

        var testCases = [
            {
                datatype: '1',
                val: '1',
                expected: '01:00:00'
            },
            {
                datatype: '0',
                val: '0',
                expected: '00:00:00'
            },
            {
                datatype: 'not empty',
                val: 'not empty',
                expected: '--'
            },
            {
                datatype: 'empty',
                val: '',
                expected: '--'
            },
            {
                datatype: '23',
                val: '23',
                expected: '23:00:00'
            },
            {
                datatype: '24',
                val: '24',
                expected: '--'
            },
            {
                datatype: '-1',
                val: '-1',
                expected: '--'
            }
        ];

        jQuery.each(testCases, function (index, testCase) {
            it('should return correct list for value: ' + testCase.datatype, function () {
                var actual = editor.ParseTime(testCase.val);
                expect(testCase.expected).toEqual(actual);
            });
        });
    });
});