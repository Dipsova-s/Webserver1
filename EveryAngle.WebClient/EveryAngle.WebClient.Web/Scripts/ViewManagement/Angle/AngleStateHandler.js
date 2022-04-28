function AngleStateHandler() {
    "use strict";

    var self = this;
    self.View = new AngleStateView();
    self.Data.is_template = ko.observable(false);
    self.Data.allow_more_details = ko.observable(false);
    self.Data.not_allow_more_details = ko.observable(false);
    self.Data.not_allow_more_details.subscribe(function (newValue) {
        if (newValue)
            self.Data.not_allow_followups(true);
    });
    self.Data.allow_followups = ko.observable(false);
    self.Data.not_allow_followups = ko.observable(false);
    self.Displays = ko.observableArray([]);
    
    // shared functions
    self.SetAngleData = function (angle) {
        self.SetItemData(angle);
        self.Data.is_template(angle.is_template);
        self.Data.allow_more_details(angle.allow_more_details);
        self.Data.not_allow_more_details(!angle.allow_more_details);
        self.Data.allow_followups(angle.allow_followups);
        self.Data.not_allow_followups(!angle.allow_followups || !angle.allow_more_details);
        self.Displays(self.GetDisplaysData(angle.display_definitions));
        self.CanSetState(!angleInfoModel.IsTemporaryAngle(angle.uri));
    };
    self.GetDisplaysData = function (displays) {
        var data = jQuery.map(displays, function (display) {
            return {
                id: display.id,
                name: WC.Utility.GetDefaultMultiLangText(display.multi_lang_name),
                display_type: display.display_type,
                // default display must set to public by default
                is_public: ko.observable(display.is_angle_default || display.is_public),
                is_angle_default: ko.observable(display.is_angle_default),
                css: function () {
                    return 'icon-' + this.display_type + (this.is_angle_default() ? ' default' : '');
                },
                state: display.state,
                can_set_state: self.CanSetDisplayState(display.is_angle_default, display.is_public, display.authorizations),
                is_available_externally: ko.observable(display.is_available_externally),
                external_id: ko.observable(display.external_id)
            };
        });
        data.sortObject('name', enumHandlers.SORTDIRECTION.ASC, false);
        return data;
    };
    self.CanSetDisplayState = function (isAngleDefault, isPublic, authorizations) {
        var canSetState = false;
        if (authorizations) {
            canSetState = isPublic ? authorizations.unpublish : authorizations.publish;
        }
        return !isAngleDefault && canSetState;
    };
    self.Update = function (handler, args, done, fail) {
        errorHandlerModel.Enable(false);
        var handleSaveError = function (xhr, status, error) {
            if (jQuery.isFunction(fail)) {
                fail(xhr, status, error);
            }
            if (resolveAngleDisplayHandler.IsConflictAngleDisplay(xhr)) {
                var updateCallback = function () {
                    handler.apply(null, args[1])
                        .done(done);
                };
                progressbarModel.CancelFunction = jQuery.noop;
                resolveAngleDisplayHandler.ShowResolveAngleDisplayPopup(xhr, updateCallback);
            }
            else {
                errorHandlerModel.BuildCustomAjaxError({ url: xhr.settings.url, type: xhr.settings.type }, xhr);
            }
            errorHandlerModel.EnableErrorByDelay(100);
        };
        return handler.apply(null, args[0])
            .fail(handleSaveError)
            .done(function () {
                errorHandlerModel.Enable(true);
                done.apply(null, arguments);
            });

    };
    self.UpdateState = function (uri, data, done, fail) {
        return self.Update(angleInfoModel.UpdateState, [[uri, data, true], [uri, data, true]], done, fail);
    };
}
AngleStateHandler.extend(ItemStateHandler);