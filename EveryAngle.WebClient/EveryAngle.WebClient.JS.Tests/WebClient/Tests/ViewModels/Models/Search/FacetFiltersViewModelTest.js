/// <reference path="/Dependencies/ViewModels/Models/Search/facetfiltersmodel.js" />

describe("FacetFiltersViewModel", function () {
    var facetFiltersViewModel;

    beforeEach(function () {
        facetFiltersViewModel = new FacetFiltersViewModel();
    });

    describe("when create new instance", function () {

        it("should be defined", function () {
            expect(facetFiltersViewModel).toBeDefined();
        });

    });

});
