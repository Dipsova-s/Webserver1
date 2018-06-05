/// <reference path="/Dependencies/ViewModels/Models/Angle/displayqueryblockmodel.js" />

describe("displayQueryBlockModel", function () {
    var displayQueryBlockModel;

    beforeEach(function () {
        displayQueryBlockModel = new DisplayQueryBlockModel();
    });

    describe("when create new instance", function () {

        it("should be defined", function () {
            expect(displayQueryBlockModel).toBeDefined();
        });

    });

});
