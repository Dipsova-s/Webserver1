/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/AngleInfoModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/DisplayModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/ResultModel.js" />
/// <chutzpah_reference path="/../../Dependencies/Helper/MeasurePerformance.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/DirectoryHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/businessprocesshandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/PopupPageHandlers.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ToastNotificationHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ValidationHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/WidgetFilter/WidgetFilterHelper.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ItemDescription/ItemDescriptionView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ItemDescription/ItemDescriptionHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepViewModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryDefinitionHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepFilterHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepJumpHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepSortableHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ItemState/itemstateview.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ItemState/itemstatehandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ItemState/itempublishstatehandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/SidePanel/SidePanelView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/SidePanel/SidePanelHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleBusinessProcessHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleUserSpecificHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ItemSaveActionHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleSaveActionHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/ResultHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/BaseItemHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleActionMenuHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleSidePanelView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleSidePanelHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleStatisticView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleStatisticHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/DisplayStatisticView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/DisplayStatisticHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/DisplayOverviewHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/DisplayDrilldownHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/DisplayResultHandler/BaseDisplayResultHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/DisplayHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleStateHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleTemplateStateHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleStateView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AnglePageHandler.js" />

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
