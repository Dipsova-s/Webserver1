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
/// <reference path="/Dependencies/ViewManagement/Shared/ItemSaveActionHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/AngleSaveActionHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/ResultHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/BaseItemHandler.js" />
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

describe("AnglePageHandler", function () {
    var anglepageHandler;
    beforeEach(function () {
        anglepageHandler = new AnglePageHandler();
    });

    describe(".CheckSaveQueryDefinition", function () {
        it('should not call other functions when query definition did not change', function () {
            spyOn(anglePageHandler.HandlerAngle.QueryDefinitionHandler, 'HasChanged').and.returnValue(false);
            spyOn(anglePageHandler.HandlerAngle.QueryDefinitionHandler, 'Validate');
            spyOn(anglePageHandler.HandlerAngle, 'ConfirmSave');
            anglePageHandler.CheckSaveQueryDefinition();

            // assert
            expect(anglePageHandler.HandlerAngle.ConfirmSave).not.toHaveBeenCalled();
            expect(anglePageHandler.HandlerAngle.QueryDefinitionHandler.HasChanged).toHaveBeenCalled();
            expect(anglePageHandler.HandlerAngle.QueryDefinitionHandler.Validate).not.toHaveBeenCalled();
        });

        it('should not call other functions when query definition not valid', function () {
            spyOn(anglePageHandler.HandlerAngle.QueryDefinitionHandler, 'HasChanged').and.returnValue(true);
            spyOn(anglePageHandler.HandlerAngle.QueryDefinitionHandler, 'Validate').and.returnValue({
                valid: false
            });
            spyOn(popup, 'Alert');
            spyOn(anglePageHandler.HandlerAngle, 'ConfirmSave');
            anglePageHandler.CheckSaveQueryDefinition();

            // assert
            expect(anglePageHandler.HandlerAngle.ConfirmSave).not.toHaveBeenCalled();
            expect(anglePageHandler.HandlerAngle.QueryDefinitionHandler.HasChanged).toHaveBeenCalled();
            expect(anglePageHandler.HandlerAngle.QueryDefinitionHandler.Validate).toHaveBeenCalled();
            expect(popup.Alert).toHaveBeenCalled();
        });

        it('should not call other functions when Angle is not valid', function () {
            spyOn(anglePageHandler.HandlerAngle.QueryDefinitionHandler, 'HasChanged').and.returnValue(true);
            spyOn(anglePageHandler.HandlerAngle.QueryDefinitionHandler, 'Validate').and.returnValue({
                valid: true
            });
            spyOn(anglePageHandler.HandlerAngle, 'Validate').and.returnValue(false);
            spyOn(anglePageHandler.HandlerAngle, 'ConfirmSave');
            anglePageHandler.CheckSaveQueryDefinition(true, $.noop);

            // assert
            expect(anglePageHandler.HandlerAngle.ConfirmSave).not.toHaveBeenCalled();
            expect(anglePageHandler.HandlerAngle.QueryDefinitionHandler.HasChanged).toHaveBeenCalled();
            expect(anglePageHandler.HandlerAngle.QueryDefinitionHandler.Validate).toHaveBeenCalled();
        });

        it('should call confirm save', function () {
            spyOn(anglePageHandler.HandlerAngle.QueryDefinitionHandler, 'HasChanged').and.returnValue(true);
            spyOn(anglePageHandler.HandlerAngle.QueryDefinitionHandler, 'Validate').and.returnValue({
                valid: true
            });
            spyOn(anglePageHandler.HandlerAngle, 'Validate').and.returnValue(true);
            spyOn(anglePageHandler.HandlerAngle, 'ConfirmSave');
            anglePageHandler.CheckSaveQueryDefinition(true, $.noop);

            // assert
            expect(anglePageHandler.HandlerAngle.ConfirmSave).toHaveBeenCalled();
            expect(anglePageHandler.HandlerAngle.QueryDefinitionHandler.HasChanged).toHaveBeenCalled();
            expect(anglePageHandler.HandlerAngle.QueryDefinitionHandler.Validate).toHaveBeenCalled();
        });
    });

    describe(".SaveAdhocDisplays", function () {
        it('should retrieve adhoc display and store in local storage', function () {

            var display = {
                display_name: 'display_name',
                uri: 'display_data_uri'
            };
            var displayData = {
                GetData: $.noop
            }
            spyOn(displayData, 'GetData').and.returnValue(display);
            spyOn(anglepageHandler.HandlerAngle, 'GetAdhocDisplays').and.returnValue([displayData]);
            spyOn(jQuery, 'localStorage');

            anglepageHandler.SaveAdhocDisplays();

            expect(jQuery.localStorage).toHaveBeenCalledWith('temp_displays', {
                "display_data_uri": display
            });
        });
    });

    describe(".ShowEditDescriptionPopup ", function () {
        it('should call show edit description from display handler', function () {
            spyOn(anglePageHandler.HandlerDisplay, 'ShowEditDescriptionPopup');

            anglePageHandler.ShowEditDescriptionPopup();

            // assert
            expect(anglePageHandler.HandlerDisplay.ShowEditDescriptionPopup).toHaveBeenCalled();
        });
    });
});
