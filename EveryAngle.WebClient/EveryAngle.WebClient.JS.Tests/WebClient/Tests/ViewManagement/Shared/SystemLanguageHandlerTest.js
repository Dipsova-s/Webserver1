/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/SystemLanguageHandler.js" />


describe("SystemLanguageHandler", function () {
    var systemLanguageHandler;

    beforeEach(function () {
        systemLanguageHandler = new SystemLanguageHandler();
    });

    describe("when create new instance", function () {

        it("should be defined", function () {
            expect(systemLanguageHandler).toBeDefined();
        });

    });

});
