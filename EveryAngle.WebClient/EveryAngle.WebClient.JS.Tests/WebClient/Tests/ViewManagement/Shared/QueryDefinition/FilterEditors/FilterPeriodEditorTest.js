/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepViewModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryDefinitionHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepFilterHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepJumpHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepSortableHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/WidgetFilter/WidgetFilterHelper.js" />
/// <chutzpah_reference path="/../../Dependencies/viewmanagement/shared/fieldchooserhandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ModelFieldSourceHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ModelFieldsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/FilterEditors/BaseFilterEditor.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/FilterEditors/FilterPeriodEditor.js" />

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
            spyOn(jQuery.fn, 'on');
            spyOn(jQuery.fn, 'off').and.returnValue($());

            var container = {
                find: $.noop
            };

            var inputUI = {
                numericTextbox: {
                    element: $()
                }
            };

            spyOn(editor, 'BindingPeriodPicker').and.returnValue(inputUI);
            spyOn(editor.parent.prototype, 'InitialSingleArgumentUI');

            editor.InitialSingleArgumentUI(container);

            expect(editor.BindingPeriodPicker).toHaveBeenCalledTimes(1);
            expect(jQuery.fn.off).toHaveBeenCalledTimes(1);
            expect(jQuery.fn.on).toHaveBeenCalledTimes(1);
        });
    });

    describe(".InitialDoubleArgumentUI", function () {
        it('should set event on keyup', function () {
            spyOn(jQuery.fn, 'on');
            spyOn(jQuery.fn, 'off').and.returnValue($());

            var container = {
                find: $.noop
            }; 
            spyOn(container, 'find').and.returnValue($());

            var inputUI = {
                numericTextbox: {
                    element: $()
                }
            };

            spyOn(editor, 'BindingPeriodPicker').and.returnValue(inputUI);
            spyOn(editor.parent.prototype, 'InitialSingleArgumentUI');

            editor.InitialDoubleArgumentUI(container);

            expect(editor.BindingPeriodPicker).toHaveBeenCalledTimes(2);
            expect(jQuery.fn.off).toHaveBeenCalledTimes(2);
            expect(jQuery.fn.on).toHaveBeenCalledTimes(2);
        });
    });
});