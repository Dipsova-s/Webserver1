/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Exports/ExportModel.js" />

describe("ExportCSVModel", function () {
    var exportModel;

    beforeEach(function () {
        exportModel = new ExportModel();
    });

    describe("when create new instance", function () {

        it("should be defined", function () {
            expect(exportModel).toBeDefined();
        });

    });

});
