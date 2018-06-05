/// <reference path="/Dependencies/ViewManagement/Shared/SystemDefaultUserSettingHandler.js" />

describe("SystemDefaultUserSettingHandler", function () {

    var systemDefaultUserSettingHandler;

    beforeEach(function () {
        systemDefaultUserSettingHandler = new SystemDefaultUserSettingHandler();
    });

    describe("when create new instance", function () {

        it("should be defined", function () {
            expect(systemDefaultUserSettingHandler).toBeDefined();
        });

    });

});
