/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ModelsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Dashboard/dashboardmodel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/SystemLanguageHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ItemState/itemstateview.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ItemState/itemstatehandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ItemState/itemvalidatestatehandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/SidePanel/SidePanelHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/SidePanel/SidePanelView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Dashboard/DashboardSidePanelView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Dashboard/dashboardstateview.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Dashboard/dashboardstatehandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Dashboard/dashboardvalidatestatehandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Dashboard/DashboardSidePanelHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Dashboard/DashboardWidgetDefinitionHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Dashboard/DashboardWidgetDefinitionView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Dashboard/DashboardUserSpecificHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ItemSaveActionHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Dashboard/DashboardSaveActionHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Dashboard/DashboardStatisticView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Dashboard/DashboardStatisticHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Dashboard/DashboardBusinessProcessHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Dashboard/DashboardTagHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Dashboard/DashboardPageHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ToastNotificationHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/User/UserSettingModel.js" />

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