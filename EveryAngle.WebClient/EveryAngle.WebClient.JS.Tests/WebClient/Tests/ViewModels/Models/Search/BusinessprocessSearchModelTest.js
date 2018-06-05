/// <reference path="/Dependencies/ViewModels/Models/Search/businessprocessmodel.js" />

describe("BusinessprocessSearchModel", function () {
    var businessprocessSearchModel;

    beforeEach(function () {
        businessprocessSearchModel = new BusinessprocessSearchModel();
    });

    describe("when create new instance", function () {
        it("should be defined", function () {
            expect(businessprocessSearchModel).toBeDefined();
        });
    });

});
