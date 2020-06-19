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
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/FilterEditors/FilterPercentageEditor.js" />

describe("FilterPercentageEditor", function () {
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
            editor = new FilterPercentageEditor(handler, querysteps, element);
            expectedOperators = [].concat(
                enumHandlers.QUERYSTEPOPERATOR.DEFAULT,
                enumHandlers.QUERYSTEPOPERATOR.GROUPONE,
                enumHandlers.QUERYSTEPOPERATOR.GROUPTWO,
                enumHandlers.QUERYSTEPOPERATOR.GROUPTHREE);
        });

        it("should Get Operators correctly", function () {
            var actualOperators = editor.GetOperators();
            expect(expectedOperators).toEqual(actualOperators);
        });

        it("should Get Target type correctly", function () {
            expect(enumHandlers.FIELDTYPE.PERCENTAGE).toEqual(editor.GetCompareFieldTarget());
        });

        afterEach(function () {
            $('.query-oprator').remove();
        });
    });

    describe(".IsValidArgumentValue", function () {
        var element;
        beforeEach(function () {
            $('<div class="query-oprator"> <div data-role="dropdownlist" /> <div data-role="dropdownlist" /> </div>').appendTo('body');
            element = $('.query-oprator');
            editor = new FilterPercentageEditor(handler, querysteps, element);
        });

        afterEach(function () {
            $('.query-oprator').remove();
        });

        var testCases = [
            {
                datatype: 'percentage (positive)',
                val: 99.987654321,
                expected: true
            },
            {
                datatype: 'percentage (negative)',
                val: -1.123456789,
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
            editor = new FilterPercentageEditor(handler, querysteps, element);
        });

        var testCases = [
            {
                datatype: 'percentage',
                val: ["1.123456789", "0", "-1.987654321"],
                expected: [.01123456789, 0, -.01987654321]
            },
            {
                datatype: 'mix percentage and null',
                val: ["1.123456789", "0", null],
                expected: [.01123456789, 0, NaN]
            },
            {
                datatype: 'mix percentage and NaN',
                val: ["1.123456789", "0", NaN],
                expected: [.01123456789, 0, NaN]
            },
            {
                datatype: 'mix percentage and string',
                val: ["1.987654321", "0", "string"],
                expected: [.01987654321, 0, NaN]
            },
            {
                datatype: 'mix percentage and undefined',
                val: ["1.987654321", "0", undefined],
                expected: [.01987654321, 0, NaN]
            }
        ];

        jQuery.each(testCases, function (index, testCase) {
            it(kendo.format('should return correct list for field type: "{0}"', testCase.datatype), function () {
                var actual = editor.TransformPastingList(testCase.val);
                expect(testCase.expected).toEqual(actual);
            });
        });

        afterEach(function () {
            $('.query-oprator').remove();
        });
    });

    describe(".InitialSingleArgumentUI", function () {
        it('should set event on keyup', function () {
            editor.Data.arguments([{}]);
            spyOn($.fn, 'on').and.returnValue($());
            spyOn($.fn, 'off').and.returnValue($());
            spyOn($.fn, 'find').and.returnValue($());
            spyOn(editor, 'IsArgumentTypeValue').and.returnValue(true);
            spyOn(editor, 'BindingNumericTextbox').and.returnValue({ value: $.noop });
            spyOn(editor.parent.prototype, 'InitialSingleArgumentUI');
            editor.InitialSingleArgumentUI($());

            expect(editor.BindingNumericTextbox).toHaveBeenCalledTimes(1);
            expect($.fn.off).toHaveBeenCalledTimes(1);
            expect($.fn.on).toHaveBeenCalledTimes(1);
        });
    });

    describe(".InitialDoubleArgumentUI", function () {
        it('should set event on keyup', function () {
            editor.Data.arguments([{}, {}]);
            spyOn($.fn, 'on').and.returnValue($());
            spyOn($.fn, 'off').and.returnValue($());
            spyOn($.fn, 'find').and.returnValue($());
            spyOn(editor, 'IsArgumentTypeValue').and.returnValue(true);
            spyOn(editor, 'BindingNumericTextbox').and.returnValue({ value: $.noop });
            spyOn(editor.parent.prototype, 'InitialDoubleArgumentUI');
            editor.InitialDoubleArgumentUI($());

            expect(editor.BindingNumericTextbox).toHaveBeenCalledTimes(2);
            expect(jQuery.fn.off).toHaveBeenCalledTimes(2);
            expect(jQuery.fn.on).toHaveBeenCalledTimes(2);
        });
    });

    describe(".OnInputTextChange", function () {
        it('should set value', function () {
            var inputUI = {
                element: $('<input/>'),
                value: $.noop,
                trigger: $.noop
            };
            inputUI.element.val('-0.01');
            spyOn(inputUI, 'value');
            spyOn(inputUI, 'trigger');
            editor.OnInputTextChange(inputUI);

            expect(inputUI.value).toHaveBeenCalled();
            expect(inputUI.trigger).toHaveBeenCalled();
            expect(inputUI.element.val()).toEqual('-0.01');
        });
    });
});