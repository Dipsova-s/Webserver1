(function (handler) {
    "use strict";

    handler.CheckShowingPublishSettingsPopup = function (showPopup) {
        var self = this;
        if (dashboardPageHandler.HasAnyChanged()) {
            var callback = jQuery.proxy(self.ForceSaveDashboard, self, showPopup);
            popup.Confirm(Localization.MessageSaveQuestionPublish, callback);
        }
        else {
            showPopup();
        }
    };
    handler.ForceSaveDashboard = function (showPopup) {
        return jQuery.when(dashboardPageHandler.DashboardSaveActionHandler.SaveAll()).done(showPopup);
    };
    
    handler.GetPublishSettingsPopupOptions = function (event) {
        var self = this;
        var options = self.parent.prototype.GetPublishSettingsPopupOptions.call(self, event);
        options.width = 440;
        return options;
    };
    
    handler.ReloadPublishingSettingsData = function (hasData) {
        var self = this;
        self.SetDashboardData(dashboardModel.Data());
        self.parent.prototype.ReloadPublishingSettingsData.call(self, hasData);
    };
    
    handler.SavePublishSettings = function (model, event) {
        var self = this;
        if (!self.CheckSavePublishSettings(jQuery('#popupPublishSettings'), self.Data.is_published()))
            return;
        
        self.ShowPublishingProgressbar(event.currentTarget);
        return self.UpdateItem()
            .done(function () {
                toast.MakeSuccessText(Localization.Toast_SavePublishSettings);
            })
            .always(function () {
                self.AfterUpdatedDashboard(event.currentTarget);
            });
    };

    handler.CheckPublishItem = function () {
        var self = this;
        var valid = true;

        // labels
        if (!self.CheckSavePublishSettings(jQuery('#popupPublishSettings'), true)) {
            valid = false;
        }

        // check displays
        if (!self.CheckWidgets()) {
            valid = false;
        }

        return valid;
    };
    handler.CheckWidgets = function () {
        var self = this;

        // displays
        if (self.HasPrivateDisplays()) {
            var container = jQuery('#popupPublishSettings .publish-widgets');
            if (container.find('.accordion-body').is(':hidden'))
                container.find('.accordion-header').trigger('click');
            container.find('.widget-section-message span').addClass('animation-shake');
            setTimeout(function () {
                container.find('.widget-section-message span').removeClass('animation-shake');
            }, 1000);
            return false;
        }

        return true;
    };
    handler.PublishItem = function (model, event) {
        var self = this;
        if (!self.CheckPublishItem())
            return;
        
        self.ShowPublishingProgressbar(event.currentTarget);
        return self.UpdateItem()
            .then(function () {
                return self.UpdateState(self.Data.state, { is_published: true });
            })
            .done(function () {
                toast.MakeSuccessTextFormatting(dashboardModel.Data().name(), Localization.Toast_PublishItem);
            })
            .always(function () {
                self.AfterUpdatedDashboard(event.currentTarget);
            });
    };
    handler.UnpublishItem = function (model, event) {
        var self = this;
        var unpublishDashboard = function () {
            self.ShowPublishingProgressbar(event.currentTarget);
            return self.UpdateState(self.Data.state, { is_published: false })
                .then(function () {
                    return self.UpdateItem();
                })
                .done(function () {
                    toast.MakeSuccessTextFormatting(dashboardModel.Data().name(), Localization.Toast_UnpublishItem);
                })
                .always(function () {
                    self.AfterUpdatedDashboard(event.currentTarget);
                });
        };

        if (!self.CanUserManagePrivateItem()) {
            popup.Confirm(Localization.MessageConfirmUnpublishAngle, function () {
                unpublishDashboard()
                    .done(function () {
                        dashboardPageHandler.BackToSearch();
                    });
            });
        }
        else {
            unpublishDashboard();
        }
    };
    handler.UpdateItem = function () {
        var self = this;
        var data = self.GetUpdatedPublishSettingsData();
        return self.Update(dashboardModel.UpdateDashboard, self.Data.uri, data);
    };
    handler.UpdatePublishState = function (published, event) {
        var self = this;
        self.ShowPublishingProgressbar(event.currentTarget);
        return self.UpdateItem()
            .then(function () {
                return self.UpdateState(self.Data.state, { is_published: published });
            })
            .always(function () {
                self.AfterUpdatedDashboard(event.currentTarget);
            });
    };
    handler.AfterUpdatedDashboard = function (event) {
        var self = this;

        // update viewmodel
        dashboardPageHandler.DashboardModel.SetData(dashboardModel.GetData());
        dashboardPageHandler.ApplyBindingHandler();

        // clear stuff
        self.HidePublishingProgressbar(event.currentTarget);
        self.ClosePublishSettingsPopup();
    };

    handler.HasPrivateDisplays = function () {
        var self = this;
        return self.Widgets().hasObject('is_public', false);
    };
    handler.ShowWidgetDefinition = function () {
        var self = this;
        self.ClosePublishSettingsPopup();
        dashboardPageHandler.HandlerSidePanel.SelectTab(1);
    };
}(DashboardStateHandler.prototype));