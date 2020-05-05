/// <reference path="/Dependencies/ViewModels/Models/User/usersettingmodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/User/usermodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/User/privileges.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/AngleInfoModel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/DisplayModel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/ResultModel.js" />
/// <reference path="/Dependencies/Helper/MeasurePerformance.js" />
/// <reference path="/../SharedDependencies/BusinessProcessesModel.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/DirectoryHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/businessprocesshandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/PopupPageHandlers.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ToastNotificationHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ValidationHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/WidgetFilter/WidgetFilterHelper.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ItemDescription/ItemDescriptionView.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ItemDescription/ItemDescriptionHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepView.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepViewModel.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryDefinitionHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepFilterHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepJumpHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepSortableHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ItemState/itemstateview.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ItemState/itemstatehandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ItemState/itempublishstatehandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/SidePanel/SidePanelView.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/SidePanel/SidePanelHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/AngleBusinessProcessHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/AngleUserSpecificHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/ResultHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/BaseItemHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/Chart/ChartOptionsView.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/Chart/ChartOptionsHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/FieldSettingsHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/AngleActionMenuHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/AngleSidePanelView.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/AngleSidePanelHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/AngleStatisticView.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/AngleStatisticHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/DisplayStatisticView.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/DisplayStatisticHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/AngleHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/DisplayOverviewHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/DisplayDrilldownHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/DisplayResultHandler/BaseDisplayResultHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/DisplayHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/AngleStateHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/AngleTemplateStateHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/AngleStateView.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/AnglePageHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/DisplayCopyHandler.js" />

describe("DisplayCopyHandler", function () {

    describe("when create new instance", function () {
        it("should be defined", function () {
            expect(displayCopyHandler).toBeDefined();
        });
    });

    describe(".CopyDisplay", function () {

        var displayData = {
            is_public: true,
            is_angle_default: true,
            used_in_task: true,
            user_specific: {
                execute_on_login: true,
                is_user_default: true
            },
            display_details: "{\"drilldown_display\" : \"e1332454fss645s009\"}"
        };

        beforeEach(function () {
            spyOn(displayModel, 'Data').and.callFake(function () {
                return displayData;
            });
        });

        it("should set user specific / is_public / angle_default to false", function () {
            spyOn(displayCopyHandler, 'CanPasteDisplay').and.returnValue(false);

            displayCopyHandler.CopyDisplay();
            var result = jQuery.localStorage('copied_display');

            expect(result.is_public).toEqual(false);
            expect(result.is_angle_default).toEqual(false);
            expect(result.used_in_task).toEqual(false);
            expect(result.user_specific.execute_on_login).toEqual(false);
            expect(result.user_specific.is_user_default).toEqual(false);
        });

        it("should store default drilldown display", function () {
            spyOn(displayCopyHandler, 'CanPasteDisplay').and.returnValue(false);

            displayCopyHandler.CopyDisplay();
            var result = jQuery.localStorage('copied_display');

            expect(WC.Utility.ParseJSON(result.display_details).drilldown_display).toEqual('e1332454fss645s009');
        });

        it("should show the toast message when it successful", function () {
            spyOn(displayCopyHandler, 'CanPasteDisplay').and.returnValue(true);
            spyOn(toast, 'MakeSuccessTextFormatting');

            displayCopyHandler.CopyDisplay();

            // assert
            expect(toast.MakeSuccessTextFormatting).toHaveBeenCalled();
        });
    });

    describe(".PasteDisplay", function () {
        var fieldSettingsHandler;

        beforeEach(function () {
            fieldSettingsHandler = new FieldSettingsHandler();
        });

        it("should show the toast message when it successful", function () {
            spyOn(displayCopyHandler, 'CanPasteDisplay').and.returnValue(true);
            spyOn(displayCopyHandler, 'CheckAngleHaveWarning').and.returnValue(false);
            spyOn(displayCopyHandler, 'CheckDisplayHaveWarning').and.returnValue($.when(true, '', { display_type: 'list' }));
            spyOn(displayModel, 'CreateTempDisplay').and.returnValue({ uri: 'test' });
            spyOn(displayModel, 'GotoTemporaryDisplay');
            spyOn(fieldSettingsHandler, 'ClearFieldSettings');
            spyOn(toast, 'MakeSuccessTextFormatting');
            spyOn(displayCopyHandler, 'PrepareDisplayForPasted');

            displayCopyHandler.PasteDisplay();

            // assert
            expect(toast.MakeSuccessTextFormatting).toHaveBeenCalled();
        });
    });

    describe(".PrepareDisplayForPasted", function () {

        var display;

        beforeEach(function () {
            display = {
                uri: "/models/1/angles/341/displays/1195",
                display_details: "{\"drilldown_display\" : \"e1332454fss645s009\"}"
            };
        });

        it("should remove drilldown_display when it's angle is not this angle", function () {

            spyOn(anglePageHandler.HandlerAngle, 'Data').and.returnValue({ uri: '/models/1/angles/3410' });

            displayCopyHandler.PrepareDisplayForPasted(display);

            expect(display.uri).toBeUndefined();
            expect(WC.Utility.ParseJSON(display.display_details).drilldown_display).toBeUndefined();
        });

        it("should keep drilldown_display when it's angle is this angle", function () {

            spyOn(anglePageHandler.HandlerAngle, 'Data').and.returnValue({ uri: '/models/1/angles/341' });

            displayCopyHandler.PrepareDisplayForPasted(display);

            expect(display.uri).toBeUndefined();
            expect(WC.Utility.ParseJSON(display.display_details).drilldown_display).toEqual("e1332454fss645s009");
        });
    });
});