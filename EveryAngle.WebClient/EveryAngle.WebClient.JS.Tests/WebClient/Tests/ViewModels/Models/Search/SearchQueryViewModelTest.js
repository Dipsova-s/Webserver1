/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Search/searchquery.js" />

describe("SearchQueryViewModel", function () {
    var searchQueryViewModel;

    beforeEach(function () {
        searchQueryViewModel = new SearchQueryViewModel();
    });

    describe("when create new instance", function () {

        it("should be defined", function () {
            expect(searchQueryViewModel).toBeDefined();
        });

    });

});
