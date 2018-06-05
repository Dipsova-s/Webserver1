/// <reference path="/Dependencies/ViewModels/Models/Dashboard/dashboardmodel.js" />
/// <reference path="/Dependencies/ViewManagement/shared/WidgetFilter/WidgetFilterHelper.js" />
/// <reference path="/Dependencies/ViewManagement/shared/ValidationHandler.js" />
/// <reference path="/Dependencies/ViewManagement/dashboard/DashboardDetailsHandler.js" />
/// <reference path="/Dependencies/ViewManagement/shared/ModelsHandler.js" />
/// <reference path="/Dependencies/ViewModels/Models/User/usersettingmodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Dashboard/DashboardWidgetModel.js" />

describe("DashboardWidgetViewModel", function () {
    var dashboardWidgetViewModel;

    beforeEach(function () {
        dashboardWidgetViewModel = new DashboardWidgetViewModel({});
    });

    describe("when create new instance", function () {

        it("should be defined", function () {
            expect(dashboardWidgetViewModel).toBeDefined();
        });

    });

    describe("call GetDefaultWidgetName", function () {

        it("should get default widget name", function () {
            spyOn(modelsHandler, 'GetModelName').and.callFake(function () { return ''; });
            spyOn(dashboardWidgetViewModel, 'GetAngle').and.callFake(function () { return { name: 'name1', model: '/models/1' }; });
            spyOn(dashboardWidgetViewModel, 'GetDisplay').and.callFake(function () { return { name: 'name2' }; });
            var result = dashboardWidgetViewModel.GetDefaultWidgetName();
            expect(result).toEqual(' - name1 - name2');
        });

    });

    describe("call GetWidgetName", function () {

        it("should get widget name", function () {
            spyOn(dashboardWidgetViewModel, 'name').and.callFake(function () { return 'my name'; });
            spyOn(dashboardWidgetViewModel, 'GetDefaultWidgetName').and.callFake(function () { return 'default name'; });
            var result = dashboardWidgetViewModel.GetWidgetName();
            expect(result).toEqual('my name');
        });

        it("should get default widget name if no name", function () {
            spyOn(dashboardWidgetViewModel, 'name').and.callFake(function () { return ''; });
            spyOn(dashboardWidgetViewModel, 'GetDefaultWidgetName').and.callFake(function () { return 'default name'; });
            var result = dashboardWidgetViewModel.GetWidgetName();
            expect(result).toEqual('default name');
        });

    });

    describe("call GetAngleDisplayName", function () {

        it("should get angle display name with model name", function () {
            spyOn(modelsHandler, 'GetModelName').and.callFake(function () { return 'model1'; });
            var result = dashboardWidgetViewModel.GetAngleDisplayName('name1', 'name2', '/models/1');
            expect(result).toEqual('model1 - name1 - name2');
        });

        it("should get angle display name by prototype function", function () {
            spyOn(modelsHandler, 'GetModelName').and.callFake(function () { return 'model1'; });
            var result = DashboardWidgetViewModel.prototype.GetAngleDisplayName('name1', 'name2', '/models/1');
            expect(result).toEqual('model1 - name1 - name2');
        });

    });

});
