/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/DefaultExcelDatastoreHandler.js" />

describe("DefaultExcelDatastoreHandler", function () {
    var defaultExcelDatastoreHandler;

    beforeEach(function () {
        defaultExcelDatastoreHandler = new DefaultExcelDatastoreHandler();
    });

    describe("when create new instance", function () {

        it("should be defined", function () {
            expect(defaultExcelDatastoreHandler).toBeDefined();
        });

    });

});