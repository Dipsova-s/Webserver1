/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/DirectoryHandler.js" />

describe("DirectoryHandler", function () {
    var directoryHandler;

    beforeEach(function () {
        directoryHandler = new DirectoryHandler();
    });

    describe("when create new instance", function () {

        it("should be defined", function () {
            expect(directoryHandler).toBeDefined();
        });

    });

});
