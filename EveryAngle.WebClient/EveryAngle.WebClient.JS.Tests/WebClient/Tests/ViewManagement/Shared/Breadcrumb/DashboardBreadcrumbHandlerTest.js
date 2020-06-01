/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/Breadcrumb/BreadcrumbHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/Breadcrumb/DashboardBreadcrumbHandler.js" />

describe("DashboardBreadcrumbHandler", function () {
    var handler;

    beforeEach(function () {
        handler = new DashboardBreadcrumbHandler();
    });

    describe(".GetDashboardViewModel", function () {

        it("should get dashboard breadcrumb view model correctly", function () {
            var viewModel = handler.GetDashboardViewModel('dashboard name', true);
            expect(viewModel.label()).toEqual('dashboard name');
            expect(viewModel.itemIcon()).toEqual('icon-dashboard');
        });

    });
});
