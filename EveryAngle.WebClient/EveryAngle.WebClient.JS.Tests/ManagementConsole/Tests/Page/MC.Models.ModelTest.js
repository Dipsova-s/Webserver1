/// <chutzpah_reference path="/../../Dependencies/page/MC.Models.Model.js" />

describe("MC.Models.Model", function () {
    var mcModel;
    beforeEach(function () {
        mcModel = MC.Models.Model;
    });
    describe("when create new instance", function () {
        it("should be defined", function () {
            expect(mcModel).toBeDefined();
        });
    });
    describe(".UpdateInstance", function () {
        it("should open confirmation popup", function () {
            spyOn(MC.util, "showPopupConfirmation");
            mcModel.UpdateInstance('TestServer', false, 'EA2_800_TestServer');
            expect(MC.util.showPopupConfirmation).toHaveBeenCalled();
        });
    });
    describe(".ShowModelServerInfo", function () {
        it("should call showInfoPopup", function () {
            spyOn(MC.util.modelServerInfo, "showInfoPopup");
            mcModel.ShowModelServerInfo(null, {});
            expect(MC.util.modelServerInfo.showInfoPopup).toHaveBeenCalled();
        });
    });
});