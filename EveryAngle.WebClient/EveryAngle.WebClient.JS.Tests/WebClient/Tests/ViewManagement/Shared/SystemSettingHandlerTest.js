/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/SystemSettingHandler.js" />


describe("SystemSettingHandler", function () {
    var systemSettingHandler;

    beforeEach(function () {
        systemSettingHandler = new SystemSettingHandler();
    });

    describe("when create new instance", function () {

        it("should be defined", function () {
            expect(systemSettingHandler).toBeDefined();
        });

    });

});
