(function (handler) {
    "use strict";

    handler.__ReloadPublishingSettingsData = handler.ReloadPublishingSettingsData;
    handler.ReloadPublishingSettingsData = function (hasData) {
        var self = this;
        self.SetAngleData(angleInfoModel.Data());
        self.__ReloadPublishingSettingsData(hasData);

        if (hasData && !self.Data.is_published()) {
            jQuery.each(self.Displays(), function (index, display) {
                display.is_public(true);
            });
        }
    };

    handler.GetPublishDisplaysData = function () {
        var self = this;
        return jQuery.map(self.Displays(), function (display) {
            if (!display.is_angle_default()) {
                return {
                    state: display.state,
                    is_public: display.is_public()
                };
            }
        });
    };
    handler.__GetPublishSettingsData = handler.GetPublishSettingsData;
    handler.GetPublishSettingsData = function () {
        var self = this;
        var data = self.__GetPublishSettingsData();
        data.allow_followups = !self.Data.not_allow_followups();
        data.allow_more_details = !self.Data.not_allow_more_details();
        data.display_definitions = self.GetPublishDisplaysData();
        return data;
    };

    handler.GetUpdatedValidatedItemMessage = function () {
        return '<i class="icon validWarning"></i>' + Localization.PublishSettings_InfoChangeValidatedAngle;
    };

    handler.SavePublishSettings = function (model, event) {
        var self = this;
        if (!self.CheckSavePublishSettings(self.Data.is_published()))
            return;

        requestHistoryModel.SaveLastExecute(self, self.SavePublishSettings, arguments);
        requestHistoryModel.ClearPopupBeforeExecute = true;

        var data = self.GetUpdatedPublishSettingsData();
        var displays = !self.Data.is_published() ? [] : WC.Utility.ToArray(data.display_definitions);
        delete data.display_definitions;

        self.ShowPublishingProgressbar(event.currentTarget);
        var onFail = function () {
            self.ClosePublishSettingsPopup();
        };
        return self.UpdateItem(function (resultAngle, reRender) {
            self.PublishDisplays(displays)
                .then(function (resultDisplay) {
                    return resultAngle === false && resultDisplay === false ? jQuery.whenDelay(500) : self.ReloadAngle();
                })
                .done(function () {
                    toast.MakeSuccessText(Localization.Toast_SavePublishSettings);
                })
                .always(function () {
                    self.HidePublishingProgressbar(event.currentTarget);
                    self.ClosePublishSettingsPopup();
                    if (reRender)
                        self.ReloadAngleResult();
                });
        }, self.ClosePublishSettingsPopup);
    };

    handler.PublishItem = function (model, event) {
        var self = this;
        if (!self.CheckPublishItem())
            return;

        requestHistoryModel.SaveLastExecute(self, self.PublishItem, arguments);
        requestHistoryModel.ClearPopupBeforeExecute = true;

        self.ShowPublishingProgressbar(event.currentTarget);
        var onFail = function () {
            self.ClosePublishSettingsPopup();
        };
        self.UpdateItem(function (angleResult, reRender) {
            self.UpdateState(self.Data.state, { is_published: true }, function () {
                var displays = self.GetPublishDisplaysData();
                self.PublishDisplays(displays)
                    .then(function () {
                        return self.ReloadAngle();
                    })
                    .done(function () {
                        toast.MakeSuccessTextFormatting(angleInfoModel.Name(), Localization.Toast_PublishItem);
                    })
                    .always(function () {
                        self.HidePublishingProgressbar(event.currentTarget);
                        self.ClosePublishSettingsPopup();
                        if (reRender)
                            self.ReloadAngleResult();
                    });
            }, onFail);
        }, onFail);
    };
    handler.PublishDisplay = function (uri, data) {
        var dfd = jQuery.Deferred();
        var query = {};
        query[enumHandlers.PARAMETERS.FORCED] = true;
        UpdateDataToWebService(uri + '?' + jQuery.param(query), data)
            .always(function () {
                dfd.resolve();
            });
        return dfd.promise();
    };
    handler.PublishDisplays = function (displays) {
        var self = this;
        var deferred = [];
        jQuery.each(displays, function (index, display) {
            var initialDisplay = self.InitialData.display_definitions.findObject('state', display.state);
            if (!initialDisplay || initialDisplay.is_public !== display.is_public)
                deferred.pushDeferred(self.PublishDisplay, [display.state, { is_published: display.is_public }]);
        });
        return deferred.length ? jQuery.whenAll(deferred, false) : jQuery.when(false);
    };
    handler.UnpublishItem = function (model, event) {
        var self = this;

        requestHistoryModel.SaveLastExecute(self, self.UnpublishItem, arguments);
        requestHistoryModel.ClearPopupBeforeExecute = true;

        var render = false;
        var onFail = function () {
            self.ClosePublishSettingsPopup();
        };
        var unpublishAngle = function (callback) {
            self.ShowPublishingProgressbar(event.currentTarget);
            self.UpdateState(self.Data.state, { is_published: false }, function () {
                self.UpdateItem(function (angleResult, reRender) {
                    render = reRender;
                    callback();
                }, onFail);
            }, onFail);
        };

        if (!self.CanUserManagePrivateItem()) {
            popup.Confirm(Localization.MessageConfirmUnpublishAngle, function () {
                unpublishAngle(function () {
                    // update watcher then back to search page
                    angleInfoModel.UpdatePublicationsWatcher(false);
                    anglePageHandler.BackToSearch();
                });
            });
        }
        else {
            unpublishAngle(function () {
                return self.ReloadAngle()
                    .done(function () {
                        toast.MakeSuccessTextFormatting(angleInfoModel.Name(), Localization.Toast_UnpublishItem);
                    })
                    .always(function () {
                        self.HidePublishingProgressbar(event.currentTarget);
                        self.ClosePublishSettingsPopup();
                        if (render)
                            self.ReloadAngleResult();
                    });
            });
        }
    };
    handler.UpdateItem = function (done, fail) {
        var self = this;
        var data = self.GetUpdatedPublishSettingsData();
        delete data.display_definitions;
        var handlerFake = function () { return jQuery.when(false, false); };
        var handlerUpdate = function (uri, data, forced) {
            var reRender = typeof data.allow_followups === 'boolean' || typeof data.allow_more_details === 'boolean';
            return angleInfoModel.UpdateAngle(uri, data, forced)
                .then(function (response) {
                    return jQuery.when(response, reRender);
                });
        };
        var handler = jQuery.isEmptyObject(data) ? handlerFake : handlerUpdate;
        return self.Update(handler, [[self.Data.uri, data, false], [self.Data.uri, data, true]], done, fail);
    };

    handler.ReloadAngle = function () {
        var self = this;
        return angleInfoModel.LoadAngle(self.Data.uri)
            .always(function () {
                anglePageHandler.ApplyExecutionAngle();
            });
    };
    handler.ReloadAngleResult = function () {
        resultModel.Data(null);
        anglePageHandler.ExecuteAngle();
    };

    handler.CanSetAllowMoreDetails = function () {
        var canAddFilter = resultModel.Data() && resultModel.Data().authorizations.add_filter;
        return angleInfoModel.CanUpdateAngle('allow_more_details')
            && (canAddFilter || !angleInfoModel.Data().allow_more_details);
    };
    handler.CanSetAllowFollowups = function () {
        var canAddFllowup = resultModel.Data() && resultModel.Data().authorizations.add_followup;
        return angleInfoModel.CanUpdateAngle('allow_followups')
            && (canAddFllowup || !angleInfoModel.Data().allow_followups);
    };
    handler.ShowInfoAllowMoreDetailsPopup = function () {
        var message = Localization.InfoAllowMoreDetailsPopup;
        var win = popup.Info(message);
        var options = {
            title: Localization.Infomation_Title,
            width: 510
        };
        win.setOptions(options);
        win.element.find('.notificationIcon').attr('class', 'notificationIcon');
    };
}(AngleStateHandler.prototype));