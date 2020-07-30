function AngleSaveActionHandler(angleHandler, stateHandler) {
    "use strict";

    var self = this;
    self.AngleHandler = angleHandler;
    self.StateHandler = stateHandler;

    self.Initial = function (container) {
        self.AddAction('All', Localization.Save, 'action-save-all', self.VisibleSaveAll, self.EnableSaveAll, self.SaveAll);
        self.AddAction('Display', Localization.SaveDisplay, 'action-save-display', self.VisibleSaveDisplay, self.EnableSaveDisplay, self.SaveDisplay);
        self.AddAction('AngleAs', Localization.SaveAngleAs, 'action-save-angle-as', self.VisibleSaveAngleAs, self.EnableSaveAngleAs, self.SaveAngleAs);
        self.AddAction('DisplayAs', Localization.SaveAs, 'action-save-display-as', self.VisibleSaveDisplayAs, self.EnableSaveDisplayAs, self.SaveDisplayAs);
        self.AddAction('SetTemplate', Localization.AngleDetailPublishTabTemplate, 'action-set-template', self.VisibleSetTemplate, self.EnableSetTemplate, self.SetTemplate);
        self.AddAction('SetAngle', Localization.AngleDetailPublishTabAngle, 'action-set-angle', self.VisibleSetAngle, self.EnableSetTemplate, self.SetTemplate);

        // html
        self.ApplyHandler(container);
    };
    self.GetDisplayHandler = jQuery.noop;
    self.Redirect = jQuery.noop;
    self.ExecuteAngle = jQuery.noop;

    // All
    self.VisibleSaveAll = function () {
        var canSaveAngle = self.AngleHandler.CanCreateOrUpdate();
        var canSaveAnyDisplay = self.AngleHandler.Displays.hasObject('CanCreateOrUpdate', function (valid) { return valid(); });
        return canSaveAngle || canSaveAnyDisplay;
    };
    self.EnableSaveAll = function () {
        var hasAngleChanged = self.AngleHandler.CanCreateOrUpdate() && self.AngleHandler.GetCreateOrUpdateData();
        var hasAnyDisplayChanged = false;
        jQuery.each(self.AngleHandler.Displays, function (index, display) {
            if (display.CanCreateOrUpdate() && display.GetCreateOrUpdateData()) {
                hasAnyDisplayChanged = true;
                return false;
            }
        });
        return hasAngleChanged || hasAnyDisplayChanged;
    };
    self.SaveAll = function () {
        // will forced save when changing angle/display that is used in task
        self.AngleHandler.ConfirmSave(null, jQuery.proxy(self.ForceSaveAll, self, false, true));
    };
    self.ForceSaveAll = function (forcedExecuteAngle, forcedSaveAngle) {
        if (!self.ValidateSaveAll(forcedExecuteAngle))
            return;

        var isRedirect = self.IsRedirect();
        var displayId = self.GetDisplayHandler().Data().id();
        progressbarModel.ShowStartProgressBar();
        progressbarModel.SetDisableProgressBar();
        return self.AngleHandler.SaveAll(forcedSaveAngle)
            .always(function () {
                self.SaveAllDone(isRedirect, displayId, forcedExecuteAngle);
            });
    };
    self.IsRedirect = function () {
        return self.AngleHandler.IsAdhoc() || self.GetDisplayHandler().IsAdhoc();
    };
    self.ValidateSaveAll = function (forcedExecuteAngle) {
        if (!self.EnableSaveAll()) {
            if (forcedExecuteAngle === true) {
                self.AngleHandler.ForceInitial();
                self.ExecuteAngle();
            }
            return false;
        }

        if (!self.AngleHandler.Validate())
            return false;

        return true;
    };
    self.SaveAllDone = function (isRedirect, displayId, forcedExecuteAngle) {
        if (isRedirect) {
            self.Redirect(displayId);
            return;
        }
        
        if (forcedExecuteAngle === true)
            self.AngleHandler.ForceInitial();
        self.ExecuteAngle();
    };

    // Display
    self.VisibleSaveDisplay = function () {
        return !self.AngleHandler.IsAdhoc() && self.GetDisplayHandler().CanCreateOrUpdate();
    };
    self.EnableSaveDisplay = function () {
        var display = self.GetDisplayHandler();
        return display.CanCreateOrUpdate() && display.GetCreateOrUpdateData();
    };
    self.SaveDisplay = function () {
        if (!self.EnableSaveDisplay())
            return;

        // will forced save when changing angle/display that is used in task
        var display = self.GetDisplayHandler();
        self.HideSaveOptionsMenu();
        display.ConfirmSave(null, jQuery.proxy(self.ForceSaveDisplay, self));
    };
    self.ForceSaveDisplay = function () {
        var isRedirect = self.IsRedirect();
        var display = self.GetDisplayHandler();
        var displayId = display.Data().id();
        progressbarModel.ShowStartProgressBar();
        progressbarModel.SetDisableProgressBar();
        return self.AngleHandler.SaveDefaultDisplay()
            .then(function () {
                return self.AngleHandler.SaveDisplay(display, true);
            })
            .always(function () {
                self.SaveDisplayDone(isRedirect, displayId);
            });
    };
    self.SaveDisplayDone = function (isRedirect, displayId) {
        if (isRedirect) {
            self.Redirect(displayId);
            return;
        }
        self.ExecuteAngle();
    };

    // AngleAs
    self.VisibleSaveAngleAs = function () {
        return !self.AngleHandler.IsAdhoc() && self.AngleHandler.CanCreate();
    };
    self.EnableSaveAngleAs = function () {
        return self.AngleHandler.CanUseFilter() && self.AngleHandler.CanUseJump();
    };
    self.SaveAngleAs = function () {
        if (!self.EnableSaveAngleAs())
            return;
        
        self.HideSaveOptionsMenu();
        var handler = new AngleSaveAsHandler(self.AngleHandler, self.GetDisplayHandler());
        handler.ItemSaveAsHandler.Redirect = self.Redirect;
        handler.ShowPopup();
    };

    // DisplayAs
    self.VisibleSaveDisplayAs = function () {
        return self.GetDisplayHandler().CanCreate();
    };
    self.EnableSaveDisplayAs = function () {
        return self.GetDisplayHandler().CanUseFilter() && self.GetDisplayHandler().CanUseJump();
    };
    self.SaveDisplayAs = function () {
        if (!self.EnableSaveDisplayAs())
            return;

        self.HideSaveOptionsMenu();
        var handler = new DisplaySaveAsHandler(self.AngleHandler, self.GetDisplayHandler());
        handler.ItemSaveAsHandler.Redirect = self.Redirect;
        handler.ShowPopup();
    };

    // SetTemplate/SetAngle
    self.VisibleSetTemplate = function () {
        return !self.AngleHandler.Data().is_template() && self.AngleHandler.CanCreateTemplateAngle();
    };
    self.VisibleSetAngle = function () {
        return self.AngleHandler.Data().is_template() && self.AngleHandler.CanCreateTemplateAngle();
    };
    self.EnableSetTemplate = function () {
        return self.AngleHandler.CanSetTemplate();
    };
    self.SetTemplate = function () {
        if (!self.EnableSetTemplate())
            return;

        self.HideSaveOptionsMenu();
        self.AngleHandler.ConfirmSave(self.AngleHandler.IsDisplaysUsedInTask, self.ForceSetTemplate);
    };
    self.ForceSetTemplate = function () {
        self.AngleHandler.SaveAll(true).done(function () {
            self.StateHandler.SetTemplateStatus(!self.AngleHandler.Data().is_template());
        });
    };
}
AngleSaveActionHandler.extend(ItemSaveActionHandler);