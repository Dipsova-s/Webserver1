(function (handler) {
    "use strict";

    handler.__GetPublishSettingsPopupOptions = handler.GetPublishSettingsPopupOptions;
    handler.GetPublishSettingsPopupOptions = function (event) {
        var self = this;
        var options = self.__GetPublishSettingsPopupOptions(event);
        options.width = 440;
        return options;
    };

    handler.__ReloadPublishingSettingsData = handler.ReloadPublishingSettingsData;
    handler.ReloadPublishingSettingsData = function (hasData) {
        var self = this;
        self.SetDashboardData(dashboardModel.Data());
        self.__ReloadPublishingSettingsData(hasData);
    };
    
    handler.SavePublishSettings = function (model, event) {
        var self = this;
        if (!self.CheckSavePublishSettings(self.Data.is_published()))
            return;

        requestHistoryModel.SaveLastExecute(self, self.SavePublishSettings, arguments);
        requestHistoryModel.ClearPopupBeforeExecute = true;

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
        if (!self.CheckSavePublishSettings(true)) {
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

        requestHistoryModel.SaveLastExecute(self, self.PublishItem, arguments);
        requestHistoryModel.ClearPopupBeforeExecute = true;
        
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
        requestHistoryModel.SaveLastExecute(self, self.UnpublishItem, arguments);
        requestHistoryModel.ClearPopupBeforeExecute = true;

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
                        dashboardHandler.BackToSearch();
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
        dashboardDetailsHandler.Model.SetData(dashboardModel.GetData());
        dashboardHandler.ApplyBindingHandler();

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
        dashboardDetailsHandler.ShowPopup(dashboardDetailsHandler.TAB.DEFINITION);
    };
}(DashboardStateHandler.prototype));