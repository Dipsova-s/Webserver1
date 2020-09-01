function DashboardLabelHandler(unsavedModel, dashboardModel) {
    "use strict";

    var self = this;
    self.UnsavedModel = unsavedModel;
    self.DashboardModel = dashboardModel;

    self.CanUpdate = function () {
        return self.DashboardModel.Data().authorizations.update;
    };
    self.GetModelUri = function () {
        return self.DashboardModel.Data().model;
    };
    self.IsPublished = function () {
        return self.DashboardModel.Data().is_published();
    };
    self.IsAdhoc = function () {
        return self.DashboardModel.IsTemporaryDashboard();
    };
    self.GetAssignedLabels = function () {
        return self.UnsavedModel.Data().assigned_labels;
    };
    self.Save = jQuery.noop;
    self.ForceSave = function (labels) {
        self.ShowProgressbar();
        self.DashboardModel.SetAssignedLabels(labels)
            .fail(jQuery.proxy(self.SaveFail, self))
            .done(jQuery.proxy(self.SaveDone, self));
    };
    self.SaveDone = function (data) {
        self.HideProgressbar();
        self.UnsavedModel.Data().assigned_labels = data.assigned_labels;
        if (!self.IsAdhoc())
            toast.MakeSuccessTextFormatting(self.DashboardModel.Data().name(), Localization.Toast_SaveItem);
    };

    self.GetStateData = function () {
        return self.DashboardModel.GetData();
    };
}
DashboardLabelHandler.extend(ItemLabelHandler);