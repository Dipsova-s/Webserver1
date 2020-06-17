/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepView.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepViewModel.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryDefinitionHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepFilterHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepJumpHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepSortableHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/WidgetFilter/WidgetFilterHelper.js" />
/// <reference path="/Dependencies/viewmanagement/shared/fieldchooserhandler.js" />
/// <reference path="/../SharedDependencies/FieldsChooser.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ModelFieldSourceHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ModelFieldsHandler.js" />
/// <reference path="/Dependencies/ViewModels/Models/User/usersettingmodel.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/FilterEditors/BaseFilterEditor.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/FilterEditors/FilterCurrencyEditor.js" />

describe("FilterCurrencyEditor", function () {
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
        var element, currencyOperators;

        beforeEach(function () {
            $('<div class="query-oprator"> <div data-role="dropdownlist" /> <div data-role="dropdownlist" /> </div>').appendTo('body');
            element = $('.query-oprator');
            editor = new FilterCurrencyEditor(handler, querysteps, element);
            currencyOperators = [].concat(
                enumHandlers.QUERYSTEPOPERATOR.DEFAULT,
                enumHandlers.QUERYSTEPOPERATOR.GROUPONE,
                enumHandlers.QUERYSTEPOPERATOR.GROUPTWO,
                enumHandlers.QUERYSTEPOPERATOR.GROUPTHREE);
        });

        it("should Get Operators correctly", function () {
            var operators = editor.GetOperators();
            expect(currencyOperators).toEqual(operators);
        });

        it("should Get Target type correctly", function () {
            expect(enumHandlers.FIELDTYPE.CURRENCY).toEqual(editor.GetCompareFieldTarget());
        });
    });

    describe(".IsValidArgumentValue", function () {
        var element;
        beforeEach(function () {
            $('<div class="query-oprator"> <div data-role="dropdownlist" /> <div data-role="dropdownlist" /> </div>').appendTo('body');
            element = $('.query-oprator');
            editor = new FilterCurrencyEditor(handler, querysteps, element);
        });

        afterEach(function () {
            $('.query-oprator').remove();
        });

        var testCases = [
            {
                datatype: 'double (positive)',
                val: 99.987654321,
                expected: true
            },
            {
                datatype: 'double (negative)',
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
            editor = new FilterCurrencyEditor(handler, querysteps, element);
        });

        var testCases = [
            {
                datatype: 'double',
                val: ["1.123456789", "0", "-1.987654321"],
                expected: [1.123456789, 0, -1.987654321]
            },
            {
                datatype: 'mix double and null',
                val: ["1.123456789", "0", null],
                expected: [1.123456789, 0, NaN]
            },
            {
                datatype: 'mix double and NaN',
                val: ["1.123456789", "0", NaN],
                expected: [1.123456789, 0, NaN]
            },
            {
                datatype: 'mix double and string',
                val: ["1.987654321", "0", "string"],
                expected: [1.987654321, 0, NaN]
            },
            {
                datatype: 'mix double and undefined',
                val: ["1.987654321", "0", undefined],
                expected: [1.987654321, 0, NaN]
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
        var tests = [
            {
                value: '',
                expected: 1
            },
            {
                value: '0.4',
                expected: 1
            },
            {
                value: '5',
                expected: 1
            },
            {
                value: '.',
                expected: 0
            },
            {
                value: '5.',
                expected: 0
            }
        ];
        tests.forEach(function (test) {
            it('should ' + (test.expected ? '' : 'not') + ' set value (value="' + test.value + '")', function () {
                var inputUI = {
                    element: $('<input/>'),
                    value: $.noop,
                    trigger: $.noop
                };
                inputUI.element.val(test.value);
                spyOn(inputUI, 'value');
                spyOn(inputUI, 'trigger');
                editor.OnInputTextChange(inputUI);

                expect(inputUI.value).toHaveBeenCalledTimes(test.expected);
                expect(inputUI.trigger).toHaveBeenCalledTimes(test.expected);
            });
        });
    });
});