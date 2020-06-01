/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/SidePanel/SidePanelView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/SidePanel/SidePanelHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Dashboard/DashboardSidePanelView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Dashboard/DashboardSidePanelHandler.js" />

describe("DashboardSidePanelHandler", function () {
    var dashboardSidePanelHandler;
    beforeEach(function () {
        dashboardSidePanelHandler = new DashboardSidePanelHandler();
    });

    describe(".InitialDashboard", function () {
        it("should initial", function () {
            // prepare
            spyOn(dashboardSidePanelHandler, 'Initial');
            spyOn(dashboardSidePanelHandler, 'SetTemplates');
            dashboardSidePanelHandler.InitialDashboard();

            // assert
            expect(dashboardSidePanelHandler.Initial).toHaveBeenCalled();
            expect(dashboardSidePanelHandler.SetTemplates).toHaveBeenCalled();
            expect(dashboardSidePanelHandler.StateManager.DashboardAccordions).not.toBeNull();
            expect(dashboardSidePanelHandler.StateManager.WidgetAccordions).not.toBeNull();
        });
    });

    describe(".TabStateChange", function () {
        it("should update UI", function () {
            // prepare
            spyOn(kendo, 'resize');
            dashboardSidePanelHandler.TabStateChange();

            // assert
            expect(kendo.resize).toHaveBeenCalled();
        });
    });

    describe(".SetTemplates", function () {
        it("should set templates and accordions", function () {
            // prepare
            spyOn(dashboardSidePanelHandler, 'InitialAccordion');
            dashboardSidePanelHandler.SetTemplates();

            // assert
            expect(dashboardSidePanelHandler.InitialAccordion).toHaveBeenCalled();
        });
    });
});