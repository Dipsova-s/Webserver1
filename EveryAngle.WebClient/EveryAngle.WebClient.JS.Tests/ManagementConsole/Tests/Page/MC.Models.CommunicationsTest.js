/// <reference path="/Dependencies/custom/mc.form.js" />
/// <reference path="/Dependencies/page/MC.Models.Communications.js" />

describe("MC.Models.Communications", function () {
    var communications;
    beforeEach(function () {
        communications = MC.Models.Communications;
    });

    describe("when create new instance", function () {
        it("should be defined", function () {
            expect(communications).toBeDefined();
        });
    });

    describe("when SaveModelCommunication without 'send_logs_frequency'", function () {

        beforeEach(function () {
            spyOn($.fn, 'val').and.returnValue("");
        });

        it(".GetData() should set default value to '0'", function () {
            var returnResult = communications.GetData();
            expect(returnResult.emailSettingsData.send_logs_frequency).toEqual(0);
        });
    });
});
