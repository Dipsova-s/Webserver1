/// <reference path="/Dependencies/ViewModels/Models/Search/searchmodel.js" />

describe("SearchViewModel", function () {
    var searchViewModel;

    beforeEach(function () {
        searchViewModel = new SearchViewModel();
    });

    describe("when create new instance", function () {

        it("should be defined", function () {
            expect(searchViewModel).toBeDefined();
        });

    });

});
