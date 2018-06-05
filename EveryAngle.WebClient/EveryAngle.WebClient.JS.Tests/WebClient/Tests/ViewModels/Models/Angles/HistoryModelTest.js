/// <reference path="/Dependencies/ViewModels/Models/Angle/historymodel.js" />

describe("historyModel", function () {
    var historyModel;

    beforeEach(function () {
        historyModel = new HistoryModel();
    });

    describe("when create new instance", function () {

        it("should be defined", function () {
            expect(historyModel).toBeDefined();
        });

    });

});
