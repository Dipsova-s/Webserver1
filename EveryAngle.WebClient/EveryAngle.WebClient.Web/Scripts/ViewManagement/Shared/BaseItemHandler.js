function BaseItemHandler() {}

(function (handler) {
    "use strict";

    handler.Data = ko.observable({});
    handler.ItemDescriptionHandler = null;
    handler.QueryDefinitionHandler = null;
    handler.Initial = jQuery.noop;
    handler.SetData = jQuery.noop;
    handler.GetData = jQuery.noop;
    handler.GetName = function () {
        var self = this;
        return WC.Utility.GetDefaultMultiLangText(self.Data().multi_lang_name);
    };
    handler.GetDescription = function () {
        var self = this;
        return WC.Utility.GetDefaultMultiLangText(self.Data().multi_lang_description);
    };
    handler.GetDescriptionText = function () {
        var self = this;
        var description = self.GetDescription();
        return WC.HtmlHelper.StripHTML(description, true);
    };
    handler.GetModelName = function () {
        var self = this;
        var model = modelsHandler.GetModelByUri(self.Data().model);
        return model ? model.short_name || model.id : '';
    };
    handler.IsAdhoc = function () {
        var self = this;
        return WC.ModelHelper.IsAdhocUri(self.Data().uri);
    };
    handler.GetDetails = function (property) {
        var self = this;
        return WC.Utility.ParseJSON(self.Data()[property], {});
    };
    handler.SetDetails = function (property, value, replaced) {
        var self = this;
        var details = replaced ? value : jQuery.extend(self.GetDetails(property), value);
        self.Data()[property] = JSON.stringify(details);
    };

    // edit description popup
    handler.ShowEditDescriptionPopup = function (title) {
        var self = this;
        self.ItemDescriptionHandler.SetData(self.Data().id(), self.Data().multi_lang_name, self.Data().multi_lang_description);
        self.ItemDescriptionHandler.SetReadOnly(!self.CanUpdateDescription());
        self.ItemDescriptionHandler.Save = jQuery.proxy(self.SaveDescription, self);
        self.ItemDescriptionHandler.ShowEditPopup(title);
    };
    handler.CanUpdateDescription = function () {
        var self = this;
        return self.Data().authorizations.update;
    };
    handler.SaveDescription = function () {
        var self = this;
        var data = self.GetChangeData(self.ItemDescriptionHandler.GetData(), self.Data());
        self.ItemDescriptionHandler.ShowProgressbar();
        self.UpdateData(data, true, jQuery.proxy(self.SaveDescriptionDone, self), jQuery.proxy(self.SaveDescriptionFail, self));
    };
    handler.SaveDescriptionDone = function () {
        var self = this;
        self.ItemDescriptionHandler.CloseEditPopup();

        if (!self.IsAdhoc())
            toast.MakeSuccessTextFormatting(self.GetName(), Localization.Toast_SaveItem);
    };
    handler.SaveDescriptionFail = function () {
        var self = this;
        self.ItemDescriptionHandler.HideProgressbar();
    };

    // add filter & jump
    handler.InitialQueryDefinition = function (definition, property, model) {
        var self = this;
        self.QueryDefinitionHandler.SetData(definition, property, model);
        self.SetProxyFunctions();
    };
    handler.SetProxyFunctions = function () {
        var self = this;
        self.QueryDefinitionHandler.Save = jQuery.proxy(self.SaveQueryDefinition, self);
        self.QueryDefinitionHandler.Execute = jQuery.proxy(self.ExecuteQueryDefinition, self);
    };
    handler.SaveQueryDefinition = function () {
        var self = this;
        if (!self.QueryDefinitionHandler.HasChanged(false, true))
            return;

        // check validation
        var validation = self.QueryDefinitionHandler.Validate();
        if (!validation.valid) {
            popup.Alert(Localization.Warning_Title, validation.message);
            return;
        }

        self.QueryDefinitionHandler.IsExecutedParameters = true;
        self.QueryDefinitionHandler.CloseAllFilterEditors();
        self.QueryDefinitionHandler.TriggerUpdateBlockUI();
        var hasJumpChanged = self.QueryDefinitionHandler.HasJumpChanged();
        var definition = self.QueryDefinitionHandler.GetQueryDefinition();
        var save = function (data) {
            if (self.QueryDefinitionHandler.CanSave()) {
                self.QueryDefinitionHandler.ShowProgressbar();
                self.UpdateData(data, true, jQuery.proxy(self.SaveQueryDefinitionDone, self), jQuery.proxy(self.SaveQueryDefinitionFail, self));
            }
            else {
                // a user cannot save but execute
                self.SaveAdhocQueryDefinition(data);
            }
        };
        if (hasJumpChanged) {
            // ask a user to confirm
            popup.Confirm(self.QueryDefinitionHandler.Texts().ConfirmJump,
                jQuery.proxy(self.SaveQueryDefinitionWithJump, self, save, definition),
                jQuery.proxy(self.CancelQueryDefinitionWithJump, self));
        }
        else {
            save(definition);
        }
    };
    handler.SaveAdhocQueryDefinition = function (extendData) {
        var self = this;
        var savedData = jQuery.extend(self.GetData(), extendData);
        self.QueryDefinitionHandler.ForcedSetData = true;
        self.UpdateAdhocFunction(savedData.uri, savedData);
        self.ExecuteQueryDefinition(QueryDefinitionHandler.ExecuteAction.Adhoc);
    };
    handler.SaveQueryDefinitionWithJump = function (save, definition) {
        save(definition);
    };
    handler.CancelQueryDefinitionWithJump = jQuery.noop;
    handler.SaveQueryDefinitionDone = function () {
        var self = this;
        self.QueryDefinitionHandler.ForcedSetData = true;
        self.QueryDefinitionHandler.HideProgressbar();
        toast.MakeSuccessTextFormatting(self.GetName(), Localization.Toast_SaveItem);
    };
    handler.SaveQueryDefinitionFail = function () {
        var self = this;
        self.QueryDefinitionHandler.HideProgressbar();
    };
    handler.ExecuteQueryDefinition = jQuery.noop;
    
    // save utilities
    handler.GetChangeData = jQuery.noop;
    handler.Update = function (handler, args, done, fail) {
        var handleSaveError = function (xhr, status, error) {
            errorHandlerModel.IgnoreAjaxError(xhr);
            if (jQuery.isFunction(fail)) {
                fail(xhr, status, error);
            }
            if (resolveAngleDisplayHandler.IsConflictAngleDisplay(xhr)) {
                var updateCallback = function () {
                    // set force = true
                    args.push(true);
                    handler.apply(null, args)
                        .done(done);
                };
                progressbarModel.CancelFunction = jQuery.noop;
                resolveAngleDisplayHandler.ShowResolveAngleDisplayPopup(xhr, updateCallback);
            }
            else {
                errorHandlerModel.BuildCustomAjaxError({ url: xhr.settings.url, type: xhr.settings.type }, xhr);
            }
        };
        return handler.apply(null, args)
            .fail(handleSaveError)
            .done(function () {
                done.apply(null, arguments);
            });
    };
    handler.UpdateData = function (data, forced, done, fail) {
        var self = this;
        var handler = self.GetUpdateHandler(data, self.UpdateDataFunction);
        var args = [self.Data().uri, data, forced];
        return self.Update(handler, args, done, fail);
    };
    handler.UpdateState = function (data, done, fail) {
        var self = this;
        var handler = self.GetUpdateHandler(data, self.UpdateStateFunction);
        var args = [self.Data().state, data];
        return self.Update(handler, args, done, fail);
    };
    handler.GetUpdateHandler = function (data, handler) {
        var self = this;
        return jQuery.isEmptyObject(data) || self.IsAdhoc() ? self.UpdateAdhocFunction : handler;
    };
    handler.UpdateDataFunction = jQuery.when;
    handler.UpdateStateFunction = jQuery.when;
    handler.UpdateAdhocFunction = jQuery.when;
}(BaseItemHandler.prototype));