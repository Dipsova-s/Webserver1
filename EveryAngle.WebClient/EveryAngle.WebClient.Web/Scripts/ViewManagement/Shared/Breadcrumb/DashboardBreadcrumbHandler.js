function DashboardBreadcrumbHandler() {
    "use strict";

    var self = this;

    self.GetDashboardViewModel = function (dashboardName, isValidated) {
        return self.GetItemViewModel(dashboardName, isValidated, 'icon-dashboard');
    };
}
DashboardBreadcrumbHandler.extend(BreadcrumbHandler);

var dashboardBreadcrumbHandler = new DashboardBreadcrumbHandler();
