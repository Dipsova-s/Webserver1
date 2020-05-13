function DashboardSaveActionHandler(handler, dashboardModel) {
    "use strict";

    var self = this;
    self.Handler = handler;
    self.DashboardModel = dashboardModel;

    self.Initial = function (container) {
        self.AddAction('All', Localization.Save, 'action-save-all', self.VisibleSaveAll, self.EnableSaveAll, self.SaveAll);
        self.AddAction('DashboardAs', Localization.SaveAsDashboard, 'action-save-dashboard-as', self.VisibleSaveDashboardAs, self.EnableSaveDashboardAs, self.SaveDashboardAs);

        // html
        self.ApplyHandler(container);
    };

    // All
    self.VisibleSaveAll = function () {
        return self.DashboardModel.CanUpdateDashboard();
    };
    self.EnableSaveAll = function () {
        return self.DashboardModel.IsTemporaryDashboard() || self.Handler.HasAnyChanged();
    };
    self.SaveAll = function () {
        if (!self.EnableSaveAll())
            return;

        return self.Handler.SaveDashboard();
    };

    // DashboardAs
    self.VisibleSaveDashboardAs = function () {
        return !self.DashboardModel.IsTemporaryDashboard() && privilegesViewModel.IsAllowExecuteDashboard();
    };
    self.EnableSaveDashboardAs = function () {
        return privilegesViewModel.IsAllowExecuteDashboard();
    };
    self.SaveDashboardAs = function () {
        if (!self.EnableSaveDashboardAs())
            return;

        self.HideSaveOptionsMenu();
        var handler = new DashboardSaveAsHandler(self.Handler, self.DashboardModel);
        handler.ItemSaveAsHandler.Redirect = self.Handler.Redirect;
        handler.ShowPopup();
    };
}
DashboardSaveActionHandler.extend(ItemSaveActionHandler);