/// <reference path="/Dependencies/ViewModels/Models/User/usermodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Dashboard/dashboardmodel.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/SystemLanguageHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ItemState/itemstateview.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ItemState/itemstatehandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ItemState/itemvalidatestatehandler.js" />
/// <reference path="/Dependencies/ViewManagement/Dashboard/dashboardstateview.js" />
/// <reference path="/Dependencies/ViewManagement/Dashboard/dashboardstatehandler.js" />
/// <reference path="/Dependencies/ViewManagement/Dashboard/dashboardvalidatestatehandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ModelsHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Dashboard/DashboardHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Dashboard/DashboardDetailsHandler.js" />
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
                    update_user_specific:false
                },
                display_definitions: [],
                created: {user:'tester'},
                user_specific: {
                    private_note:'pr'
                }
            };

            dashboardModel.SetData(mockdashboard);
            dashboardDetailsHandler.Model = dashboardModel;

            spyOn(dashboardStateHandler, 'ShowValidatingProgressbar').and.callFake($.noop);
            spyOn(dashboardStateHandler, 'UpdateState').and.returnValue($.when());
            spyOn(dashboardDetailsHandler.Model, 'SetData').and.callFake($.noop);
            spyOn(dashboardHandler, 'ApplyBindingHandler').and.callFake($.noop);
            spyOn(dashboardStateHandler, 'HideValidatingProgressbar').and.callFake($.noop);
            spyOn(dashboardStateHandler, 'CloseValidatePopup').and.callFake($.noop);

            // act
            var result = dashboardStateHandler.ValidateItem();

            // assert
            expect(result).toEqual(true);
            expect(dashboardStateHandler.ShowValidatingProgressbar).toHaveBeenCalled();
            expect(dashboardStateHandler.UpdateState).toHaveBeenCalled();
            expect(dashboardDetailsHandler.Model.SetData).toHaveBeenCalled();
            expect(dashboardHandler.ApplyBindingHandler).toHaveBeenCalled();
            expect(dashboardStateHandler.HideValidatingProgressbar).toHaveBeenCalled();
            expect(dashboardStateHandler.CloseValidatePopup).toHaveBeenCalled();
        });
    });
});