/// <reference path="/Dependencies/ViewManagement/Shared/SystemInformationHandler.js" />

describe("SystemInformationHandler", function () {
    var systemInformationHandler;

    beforeEach(function () {
        systemInformationHandler = new SystemInformationHandler();
    });

    describe("when create new instance", function () {

        it("should be defined", function () {
            expect(systemInformationHandler).toBeDefined();
        });

    });

});
