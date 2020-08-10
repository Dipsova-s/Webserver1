/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/resultmodel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/ListSortHandler.js" />

describe("ListSortHandler", function () {

    var listSortHandler;

    beforeEach(function () {
        listSortHandler = new ListSortHandler();
    });

    describe(".IsClearSortingStep", function () {
        it("should be a clear sorting step", function () {
            listSortHandler.QuerySteps([{ sorting_fields: [] }]);
            var result = listSortHandler.IsClearSortingStep();
            expect(result).toBeTruthy();
        });
        it("should not be a clear sorting step", function () {
            listSortHandler.QuerySteps([]);
            var result = listSortHandler.IsClearSortingStep();
            expect(result).toBeFalsy();
        });
        it("should not be a clear sorting step", function () {
            listSortHandler.QuerySteps([{ sorting_fields: [{}] }]);
            var result = listSortHandler.IsClearSortingStep();
            expect(result).toBeFalsy();
        });
    });
});