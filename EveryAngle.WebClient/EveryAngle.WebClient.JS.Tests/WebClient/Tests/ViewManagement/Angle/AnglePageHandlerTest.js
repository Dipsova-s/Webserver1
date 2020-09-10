/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/AngleInfoModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/DisplayModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/ResultModel.js" />
/// <chutzpah_reference path="/../../Dependencies/Helper/MeasurePerformance.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/DirectoryHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/businessprocesshandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ToastNotificationHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/SidePanel/SidePanelView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/SidePanel/SidePanelHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ItemSaveActionHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleSaveActionHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleActionMenuHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleSidePanelView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleSidePanelHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleStateHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleTemplateStateHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleStateView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AnglePageHandler.js" />

describe("AnglePageHandler", function () {
    var anglepageHandler;
    beforeEach(function () {
        anglepageHandler = new AnglePageHandler();
    });

    describe(".InitialContent ", function () {
        it('should initial handlers', function () {
            spyOn(anglePageHandler.HandlerSidePanel, 'InitialAngle');
            spyOn(anglePageHandler, 'SetHandlerAngle');
            spyOn(anglePageHandler.HandlerAngle, 'InitialAngleUserSpecific');
            spyOn(anglePageHandler.HandlerDisplayOverview, 'Initial');
            spyOn(anglePageHandler, 'InitialSaveActions');
            spyOn($.fn, 'addClass');

            anglePageHandler.InitialContent();

            // assert
            expect(anglePageHandler.HandlerSidePanel.InitialAngle).toHaveBeenCalled();
            expect(anglePageHandler.SetHandlerAngle).toHaveBeenCalled();
            expect(anglePageHandler.HandlerAngle.InitialAngleUserSpecific).toHaveBeenCalled();
            expect(anglePageHandler.HandlerDisplayOverview.Initial).toHaveBeenCalled();
            expect(anglePageHandler.InitialSaveActions).toHaveBeenCalled();
            expect($.fn.addClass).toHaveBeenCalledWith('active');
        });
    });

    describe(".RenderDisplayTabs ", function () {
        beforeEach(function () {
            anglePageHandler.CanCreateNewDisplay = $.noop;
            spyOn(anglePageHandler.HandlerDisplayOverview, 'CanCreateNewDisplay');
            spyOn(anglePageHandler.HandlerDisplayOverview, 'SetData');
        });
        it('should not render', function () {
            anglePageHandler.HandlerAngle.Displays = [];
            anglePageHandler.RenderDisplayTabs();

            // assert
            expect(anglePageHandler.HandlerDisplayOverview.CanCreateNewDisplay).not.toHaveBeenCalled();
            expect(anglePageHandler.HandlerDisplayOverview.SetData).not.toHaveBeenCalled();
        });
        it('should render', function () {
            anglePageHandler.HandlerAngle.Displays = [anglePageHandler.HandlerDisplay];
            anglePageHandler.RenderDisplayTabs();

            // assert
            expect(anglePageHandler.HandlerDisplayOverview.CanCreateNewDisplay).toHaveBeenCalled();
            expect(anglePageHandler.HandlerDisplayOverview.SetData).toHaveBeenCalled();
        });
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

    describe(".CheckExecutionParameters", function () {
        it('should not call MarkAsExecutedParameter when adhoc angle', function () {
            spyOn(anglepageHandler.HandlerAngle, 'IsAdhoc').and.returnValue(true);
            spyOn(anglepageHandler.HandlerDisplay, 'IsAdhoc').and.returnValue(false);
            spyOn(anglepageHandler, 'MarkAsExecutedParameter');
            spyOn(jQuery, 'localStorage').and.returnValue(false);
            anglepageHandler.CheckExecutionParameters();

            //assert
            expect(anglepageHandler.MarkAsExecutedParameter).not.toHaveBeenCalled();
        });
    });
});
