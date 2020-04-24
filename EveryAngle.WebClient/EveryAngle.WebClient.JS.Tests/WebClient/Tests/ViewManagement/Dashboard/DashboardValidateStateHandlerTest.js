/// <reference path="/Dependencies/ViewModels/Models/User/usermodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/User/privileges.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ModelsHandler.js" />
/// <reference path="/Dependencies/ViewModels/Models/Dashboard/dashboardmodel.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ItemDescription/ItemDescriptionView.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ItemDescription/ItemDescriptionHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/SystemLanguageHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ItemState/itemstateview.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ItemState/itemstatehandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ItemState/itemvalidatestatehandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/SidePanel/SidePanelHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/SidePanel/SidePanelView.js" />
/// <reference path="/Dependencies/ViewManagement/Dashboard/DashboardSidePanelView.js" />
/// <reference path="/Dependencies/ViewManagement/Dashboard/dashboardstateview.js" />
/// <reference path="/Dependencies/ViewManagement/Dashboard/dashboardstatehandler.js" />
/// <reference path="/Dependencies/ViewManagement/Dashboard/dashboardvalidatestatehandler.js" />
/// <reference path="/Dependencies/ViewManagement/Dashboard/DashboardSidePanelHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepView.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryDefinitionHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Dashboard/DashboardWidgetDefinitionHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Dashboard/DashboardWidgetDefinitionView.js" />
/// <reference path="/Dependencies/ViewManagement/Dashboard/DashboardUserSpecificHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Dashboard/DashboardStatisticView.js" />
/// <reference path="/Dependencies/ViewManagement/Dashboard/DashboardStatisticHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Dashboard/DashboardBusinessProcessHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Dashboard/DashboardPageHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ToastNotificationHandler.js" />
/// <reference path="/Dependencies/ViewModels/Models/User/UserSettingModel.js" />



describe("DashboardStateHandler", function () {

    var dashboardStateHandler;
    beforeEach(function () {
        dashboardStateHandler = new DashboardStateHandler();
        spyOn(toast, 'MakeSuccessText');
    });

    describe(".ValidateItem", function () {
        it('always return true and call all functions', function () {

            spyOn(userModel, 'Data').and.returnValue({ uri: '' });
            var mockdashboard = {
                is_validated: true,
                is_template: true,
                allow_followups: true,
                allow_more_details: true,
                assigned_labels: ["S2D"],
                uri: "uri",
                state: "state",
                multi_lang_name: ["en"],
                multi_lang_description: ["en"],
                authorizations: {
                    update_user_specific: false
                },
                display_definitions: [],
                created: { user: 'tester' },
                user_specific: {
                    private_note: 'pr'
                }
            };

            dashboardModel.SetData(mockdashboard);
            dashboardPageHandler.DashboardModel = dashboardModel;

            spyOn(dashboardStateHandler, 'ShowValidatingProgressbar').and.callFake($.noop);
            spyOn(dashboardStateHandler, 'UpdateState').and.returnValue($.when());
            spyOn(dashboardPageHandler.DashboardModel, 'SetData').and.callFake($.noop);
            spyOn(dashboardPageHandler, 'ApplyBindingHandler').and.callFake($.noop);
            spyOn(dashboardStateHandler, 'HideValidatingProgressbar').and.callFake($.noop);
            spyOn(dashboardStateHandler, 'CloseValidatePopup').and.callFake($.noop);

            // act
            var result = dashboardStateHandler.ValidateItem();

            // assert
            expect(result).toEqual(true);
            expect(dashboardStateHandler.ShowValidatingProgressbar).toHaveBeenCalled();
            expect(dashboardStateHandler.UpdateState).toHaveBeenCalled();
            expect(dashboardPageHandler.DashboardModel.SetData).toHaveBeenCalled();
            expect(dashboardPageHandler.ApplyBindingHandler).toHaveBeenCalled();
            expect(dashboardStateHandler.HideValidatingProgressbar).toHaveBeenCalled();
            expect(dashboardStateHandler.CloseValidatePopup).toHaveBeenCalled();
        });
    });
});