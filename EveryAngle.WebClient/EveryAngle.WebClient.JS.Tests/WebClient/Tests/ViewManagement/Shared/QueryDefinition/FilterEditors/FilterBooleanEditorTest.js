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
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/FilterEditors/FilterBooleanEditor.js" />

describe("FilterBooleanEditor", function () {
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
        var element, booleanOperators;

        beforeEach(function () {
            $('<div class="query-oprator"> <div data-role="dropdownlist" /> <div data-role="dropdownlist" /> </div>').appendTo('body');
            element = $('.query-oprator');
            editor = new FilterBooleanEditor(handler, querysteps, element);
            booleanOperators = [].concat(
                enumHandlers.QUERYSTEPOPERATOR.DEFAULT,
                enumHandlers.QUERYSTEPOPERATOR.GROUPONE);
        });

        it("should Get Operators correctly", function () {
            var operators = editor.GetOperators();
            expect(booleanOperators).toEqual(operators);
        });

        it("should Get Target type correctly", function () {
            expect(enumHandlers.FIELDTYPE.BOOLEAN).toEqual(editor.GetCompareFieldTarget());
        });
    });
});