/// <reference path="/Dependencies/ViewManagement/Angle/followupPageHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/FieldChooserHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ModelFollowupsHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/HelpTextHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepView.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepViewModel.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryDefinitionHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepSortingHandler.js" />

describe("QueryStepSortingHandler", function () {
    var handler;
    beforeEach(function () {
        handler = new QueryDefinitionHandler();
    });

    describe(".IsSorintg", function () {
        it("should be a sorting step", function () {
            var result = handler.IsSorintg({ step_type: 'sorting' });
            expect(result).toEqual(true);
        });
        it("should not be a sorting step", function () {
            var result = handler.IsSorintg({ step_type: 'filter' });
            expect(result).toEqual(false);
        });
    });
    describe(".GetSorting", function () {
        it("should get a sorting step", function () {
            handler.Data([
                { step_type: 'sorting' }
            ]);
            var result = handler.GetSorting();
            expect(result).not.toBeNull();
            expect(result.step_type).toEqual('sorting');
        });

        it("should not get a sorting step", function () {
            handler.Data([
                { step_type: 'filter' }
            ]);
            var result = handler.GetSorting();
            expect(result).toBeNull();
        });
    });
    describe(".RemoveSorting", function () {
        it("should remove a sorting step", function () {
            handler.Data([
                { step_type: 'followup' },
                { step_type: 'filter' },
                { step_type: 'sorting' }
            ]);
            handler.RemoveSorting();
            expect(handler.Data().length).toEqual(2);
            expect(handler.Data()[0].step_type).toEqual('followup');
            expect(handler.Data()[1].step_type).toEqual('filter');
        });
    });
    describe(".SetSorting", function () {
        it("should set a sorting step", function () {
            handler.Data([
                { step_type: 'filter' },
                { step_type: 'sorting' }
            ]);
            handler.SetSorting({ step_type: 'sorting', new_sorting: true });
            expect(handler.Data().length).toEqual(2);
            expect(handler.Data()[0].step_type).toEqual('filter');
            expect(handler.Data()[1].step_type).toEqual('sorting');
            expect(handler.Data()[1].new_sorting).toEqual(true);
        });
    });
});