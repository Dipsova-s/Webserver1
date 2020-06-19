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
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/FilterEditors/FilterPeriodEditor.js" />

describe("FilterPeriodEditor", function () {
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
            editor = new FilterPeriodEditor(handler, querysteps, element);
            expectedOperators = [].concat(
                enumHandlers.QUERYSTEPOPERATOR.DEFAULT,
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

    describe(".InitialSingleArgumentUI", function () {
        it('should set event on keyup', function () {
            editor.Data.arguments([{}]);
            spyOn($.fn, 'on').and.returnValue($());
            spyOn($.fn, 'off').and.returnValue($());
            spyOn($.fn, 'find').and.returnValue($());
            spyOn(editor, 'IsArgumentTypeValue').and.returnValue(true);
            spyOn(editor, 'BindingPeriodPicker').and.returnValue({
                value: $.noop,
                numericTextbox: { element: $() }
            });
            spyOn(editor.parent.prototype, 'InitialSingleArgumentUI');
            editor.InitialSingleArgumentUI($());

            expect(editor.BindingPeriodPicker).toHaveBeenCalledTimes(1);
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
            spyOn(editor, 'BindingPeriodPicker').and.returnValue({
                value: $.noop,
                numericTextbox: { element: $() }
            });
            spyOn(editor.parent.prototype, 'InitialDoubleArgumentUI');
            editor.InitialDoubleArgumentUI($());

            expect(editor.BindingPeriodPicker).toHaveBeenCalledTimes(2);
            expect(jQuery.fn.off).toHaveBeenCalledTimes(2);
            expect(jQuery.fn.on).toHaveBeenCalledTimes(2);
        });
    });

    describe(".OnInputTextChange", function () {
        it('should set value', function () {
            var inputUI = {
                numericTextbox: {
                    element: $('<input/>'),
                    value: $.noop,
                    trigger: $.noop
                }
            };
            inputUI.numericTextbox.element.val('-0.01');
            spyOn(inputUI.numericTextbox, 'value');
            spyOn(inputUI.numericTextbox, 'trigger');
            editor.OnInputTextChange(inputUI);

            expect(inputUI.numericTextbox.value).toHaveBeenCalled();
            expect(inputUI.numericTextbox.trigger).toHaveBeenCalled();
            expect(inputUI.numericTextbox.element.val()).toEqual('-001');
        });
    });
});