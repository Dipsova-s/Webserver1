/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/AngleInfoModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/DisplayModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/ResultModel.js" />
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
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/DisplayStatisticView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/DisplayStatisticHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleStatisticView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleStatisticHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/DisplayOverviewHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/DisplayDrilldownHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/DisplayResultHandler/BaseDisplayResultHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/DisplayHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleStateHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleTemplateStateHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleStateView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AnglePageHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ModelFieldsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/QuickFilterHandler.js" />

describe("QuickFilterHandler", function () {

    var quickFilterHandler;

    beforeEach(function () {
        quickFilterHandler = new QuickFilterHandler();
    });

    describe(".AddFilter", function () {

        it("should do nothing when cannot get model field from fieldId", function () {

            spyOn(modelFieldsHandler, 'GetFieldById').and.returnValue(null);
            spyOn(anglePageHandler.HandlerSidePanel, 'Open');
            spyOn(anglePageHandler.HandlerDisplay.QueryDefinitionHandler, 'AddFilter');

            var handler = {
                Models: {
                    Angle: {
                        Data: $.noop
                    }
                }
            };
            spyOn(handler.Models.Angle, 'Data').and.returnValue({ model: 'model' });

            quickFilterHandler.AddFilter({}, handler);

            expect(anglePageHandler.HandlerSidePanel.Open).toHaveBeenCalledTimes(0);
            expect(anglePageHandler.HandlerDisplay.QueryDefinitionHandler.AddFilter).toHaveBeenCalledTimes(0);

        });

        it("should add filter to side panel when can get model field from fieldId", function () {

            spyOn(modelFieldsHandler, 'GetFieldById').and.returnValue({});
            spyOn(anglePageHandler.HandlerSidePanel, 'Open');
            spyOn(anglePageHandler.HandlerDisplay.QueryDefinitionHandler, 'AddFilter');

            var handler = {
                Models: {
                    Angle: {
                        Data: $.noop
                    }
                }
            };
            spyOn(handler.Models.Angle, 'Data').and.returnValue({ model: 'model' });

            quickFilterHandler.AddFilter({}, handler);

            expect(anglePageHandler.HandlerSidePanel.Open).toHaveBeenCalledWith(1);
            expect(anglePageHandler.HandlerDisplay.QueryDefinitionHandler.AddFilter).toHaveBeenCalled();
        });

    });
});