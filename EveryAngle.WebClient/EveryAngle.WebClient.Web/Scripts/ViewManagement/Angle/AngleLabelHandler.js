function AngleLabelHandler(angleHandler) {
    "use strict";

    var self = this;
    self.AngleHandler = angleHandler;

    self.CanUpdate = function () {
        return self.AngleHandler.CanUpdate();
    };
    self.GetModelUri = function () {
        return self.AngleHandler.Data().model;
    };
    self.IsPublished = function () {
        return self.AngleHandler.Data().is_published();
    };
    self.IsAdhoc = function () {
        return self.AngleHandler.IsAdhoc();
    };
    self.GetAssignedLabels = function () {
        return self.AngleHandler.Data().assigned_labels();
    };
    self.Save = function (labels) {
        self.AngleHandler.ConfirmSave(null, jQuery.proxy(self.ForceSave, self, labels), jQuery.proxy(self.Cancel, self));
    };
    self.ForceSave = function (labels) {
        self.ShowProgressbar();
        var data = {
            assigned_labels: labels
        };
        self.AngleHandler.Data().assigned_labels(labels);
        self.AngleHandler.UpdateData(data, true, jQuery.proxy(self.SaveDone, self), jQuery.proxy(self.SaveFail, self));
    };
    self.SaveDone = function () {
        self.HideProgressbar();
        if (!self.IsAdhoc())
            toast.MakeSuccessTextFormatting(self.AngleHandler.GetName(), Localization.Toast_SaveItem);
    };

    self.GetStateData = function () {
        return self.AngleHandler.GetData();
    };
}
AngleLabelHandler.extend(ItemLabelHandler);