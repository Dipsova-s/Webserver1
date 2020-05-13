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
/// <reference path="/Dependencies/ViewManagement/Angle/DisplayStatisticView.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/DisplayStatisticHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/AngleStatisticView.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/AngleStatisticHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/AngleHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/DisplayOverviewHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/DisplayDrilldownHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/DisplayResultHandler/BaseDisplayResultHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/DisplayHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/AngleStateHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/AngleTemplateStateHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/AngleStateView.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/AnglePageHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ModelFieldsHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/QuickFilterHandler.js" />

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