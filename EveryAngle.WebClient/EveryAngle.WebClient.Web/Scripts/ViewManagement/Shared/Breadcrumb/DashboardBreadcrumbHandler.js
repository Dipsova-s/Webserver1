function DashboardBreadcrumbHandler() {
    "use strict";

    var self = this;
    self.IconDashboard = 'icon icon-dashboard icon-breadcrumb-front';

    self.GetDashboardViewModel = function (dashboardName, isValidated) {
        var data = self.GetItemViewModel(dashboardName, isValidated);
        data.frontIcon(self.IconDashboard);
        data.hasEditIcon(true);
        data.click = self.ShowEditPopup;
        return data;
    };
    self.ShowEditPopup = jQuery.noop;
}
DashboardBreadcrumbHandler.extend(BreadcrumbHandler);
var dashboardBreadcrumbHandler = new DashboardBreadcrumbHandler();
