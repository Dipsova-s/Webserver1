/// <reference path="/Dependencies/ViewModels/Models/Angle/DisplayModel.js" />
/// <reference path="/Dependencies/ViewModels/Models/User/usersettingmodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/HistoryModel.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/DisplayCopyHandler.js" />

describe("DisplayCopyHandler", function () {

    describe("when create new instance", function () {
        it("should be defined", function () {
            expect(displayCopyHandler).toBeDefined();
        });
    });

    describe("call CopyDisplay", function () {

        var displayData = {
            is_public: true,
            is_angle_default: true,
            user_specific: {
                execute_on_login: true,
                is_user_default: true
            },
            display_details: "{drilldown_display : \"e1332454fss645s009\"}"
        };

        beforeEach(function () {
            spyOn(displayModel, 'Data').and.callFake(function () {
                return displayData;
            });
            spyOn(displayCopyHandler, 'CanPasteDisplay').and.callFake(function () {
                return false;
            });
        });

        it("should set user specific / is_public / angle_default to false", function () {

            displayCopyHandler.CopyDisplay();
            var result = jQuery.localStorage('copied_display');

            expect(result.is_public).toEqual(false);
            expect(result.is_angle_default).toEqual(false);
            expect(result.user_specific.execute_on_login).toEqual(false);
            expect(result.user_specific.is_user_default).toEqual(false);
        });

        it("should remove default drilldown display", function () {

            displayCopyHandler.CopyDisplay();
            var result = jQuery.localStorage('copied_display');

            expect(WC.Utility.ParseJSON(result).drilldown_display).not.toBeDefined();
        });
    });
});