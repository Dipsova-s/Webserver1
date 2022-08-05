(function (handler) {
    "use strict";

    handler.CheckShowingPublishSettingsPopup = function (showPopup) {
        var self = this;
        if (anglePageHandler.HasAnyChanged()) {
            popup.Confirm(Localization.MessageSaveQuestionPublish, function () {
                var callback = jQuery.proxy(self.ForceSaveAngle, self, showPopup);
                anglePageHandler.HandlerAngle.ConfirmSave(null, callback);
            });
        }
        else {
            showPopup();
        }
    };
    handler.ForceSaveAngle = function (showPopup) {
        return jQuery.when(anglePageHandler.SaveAll(false, true)).done(showPopup);
    };

    handler.ReloadPublishingSettingsData = function (hasData) {
        var self = this;
        self.SetAngleData(anglePageHandler.HandlerAngle.GetData());
        self.parent.prototype.ReloadPublishingSettingsData.call(self, hasData);

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
    handler.GetPublishSettingsData = function () {
        var self = this;
        var data = self.parent.prototype.GetPublishSettingsData.call(self);
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
        if (!self.CheckSavePublishSettings(jQuery('#popupPublishSettings'), self.Data.is_published()))
            return;

        var data = self.GetUpdatedPublishSettingsData();
        var displays = !self.Data.is_published() ? [] : WC.Utility.ToArray(data.display_definitions);
        delete data.display_definitions;

        var checker = function () {
            return (!jQuery.isEmptyObject(data) || displays.length) && anglePageHandler.HandlerAngle.IsDisplaysUsedInTask();
        };
        var callback = function () {
            self.ShowPublishingProgressbar(event.currentTarget);
            var onFail = jQuery.proxy(self.ClosePublishSettingsPopup, self);
            self.UpdateItem(function () {
                self.PublishDisplays(displays)
                    .done(function () {
                        toast.MakeSuccessText(Localization.Toast_SavePublishSettings);
                        self.ReloadAngleResult();
                    })
                    .always(function () {
                        self.HidePublishingProgressbar(event.currentTarget);
                        self.ClosePublishSettingsPopup();
                    });
            }, onFail);
        };

        anglePageHandler.HandlerAngle.ConfirmSave(
            checker,
            callback);
    };

    handler.PublishItem = function (model, event) {
        var self = this;
        if (!self.CheckPublishItem())
            return;

        var checker = function () {
            return anglePageHandler.HandlerAngle.IsDisplaysUsedInTask();
        };

        var callback = function () {
            self.ShowPublishingProgressbar(event.currentTarget);
            var onFail = jQuery.proxy(self.ClosePublishSettingsPopup, self);
            self.UpdateItem(function () {
                self.UpdateState(self.Data.state, { is_published: true }, function () {
                    var displays = self.GetPublishDisplaysData();
                    self.PublishDisplays(displays)
                        .done(function () {
                            toast.MakeSuccessTextFormatting(anglePageHandler.HandlerAngle.GetName(), Localization.Toast_PublishItem);
                            self.ReloadAngleResult();
                        })
                        .always(function () {
                            self.HidePublishingProgressbar(event.currentTarget);
                            self.ClosePublishSettingsPopup();
                        });
                }, onFail);
            }, onFail);
        };

        anglePageHandler.HandlerAngle.ConfirmSave(checker, callback);
    };
    handler.PublishDisplay = function (uri, data) {
        var dfd = jQuery.Deferred();
        var query = {};
        query[enumHandlers.PARAMETERS.FORCED] = true;
        UpdateDataToWebService(uri + '?' + jQuery.param(query), data)
            .always(dfd.resolve);
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

        var onFail = jQuery.proxy(self.ClosePublishSettingsPopup, self);
        var unpublishAngle = function (callback) {
            self.ShowPublishingProgressbar(event.currentTarget);
            self.UpdateState(self.Data.state, { is_published: false }, function () {
                self.UpdateItem(callback, onFail);
            }, onFail);
        };

        var checker = function () {
            return anglePageHandler.HandlerAngle.IsDisplaysUsedInTask();
        };

        if (!self.CanUserManagePrivateItem()) {
            popup.Confirm(Localization.MessageConfirmUnpublishAngle, function () {
                var unpublishPrivateDone = function () {
                    // update watcher then back to search page
                    angleInfoModel.UpdatePublicationsWatcher(false);
                    anglePageHandler.BackToSearch();
                };

                anglePageHandler.HandlerAngle.ConfirmSave(
                    checker,
                    jQuery.proxy(unpublishAngle, null, unpublishPrivateDone));
            });
        }
        else {
            var unpublishDone = function () {
                toast.MakeSuccessTextFormatting(anglePageHandler.HandlerAngle.GetName(), Localization.Toast_UnpublishItem);
                self.HidePublishingProgressbar(event.currentTarget);
                self.ClosePublishSettingsPopup();
                self.ReloadAngleResult();
            };

            anglePageHandler.HandlerAngle.ConfirmSave(
                checker,
                jQuery.proxy(unpublishAngle, null, unpublishDone));
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
        return self.Update(handler, [[self.Data.uri, data, true], [self.Data.uri, data, true]], done, fail);
    };

    handler.ReloadAngleResult = function () {
        anglePageHandler.HandlerAngle.ClearData();
        anglePageHandler.HandlerDisplay.ClearPostResultData();
        anglePageHandler.ExecuteAngle();
    };

    handler.CanSetAllowMoreDetails = function () {
        var self = this;
        return self.Data.authorizations().update
            && privilegesViewModel.AllowMoreDetails(self.Data.model);
    };
    handler.CanSetAllowFollowups = function () {
        var self = this;
        return self.Data.authorizations().update
            && !self.Data.not_allow_more_details()
            && privilegesViewModel.AllowFollowups(self.Data.model);
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