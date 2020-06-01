/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Exports/ExportModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Exports/ExportCSVModel.js" />

describe("ExportCSVModel", function () {
    var exportCSVModel;

    beforeEach(function () {
        exportCSVModel = new ExportCSVModel();
    });

    describe("when create new instance", function () {

        it("should be defined", function () {
            expect(exportCSVModel).toBeDefined();
        });

    });

});
