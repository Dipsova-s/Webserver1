function AngleUserSpecificHandler(angleHandler) {
    "use strict";

    var self = this;
    self.AngleHandler = angleHandler;

    // general
    self.CanUpdate = function () {
        return self.AngleHandler.Data().authorizations.update_user_specific;
    };
    self.Save = function (data) {
        var query = {};
        query[enumHandlers.PARAMETERS.FORCED] = true;
        return jQuery.when(self.AngleHandler.IsAdhoc() ? data : UpdateDataToWebService(self.AngleHandler.Data().uri + '?' + jQuery.param(query), data))
            .done(self.SetData);
    };
    self.SetData = function (data) {
        var userSpecific = jQuery.extend(ko.toJS(self.AngleHandler.Data().user_specific), data.user_specific);

        // update to raw
        self.AngleHandler.SetRawData({ user_specific: userSpecific });

        // update to specific properties
        self.AngleHandler.Data().user_specific.private_note(userSpecific.private_note);
        self.AngleHandler.Data().user_specific.is_starred(userSpecific.is_starred);
    };

    // private_note
    self.HasPrivateNote = function () {
        return self.CanUpdate() && self.GetPrivateNote();
    };
    self.GetPrivateNote = function () {
        return self.AngleHandler.Data().user_specific.private_note();
    };
    self.InitialPrivateNote = function (target) {
        target.find('.section-personal-note-body').off('click').on('click', jQuery.proxy(self.CreateEditNoteUI, self, target));
    };
    self.CreateEditNoteUI = function (target, event) {
        if (!self.CanUpdate())
            return;

        var yourNoteContainer = jQuery(event.currentTarget);
        target.addClass("editable");

        if (!jQuery("#txtareaYourNote").length) {
            var note = self.GetPrivateNote();
            var yourNoteInput = jQuery('<textarea id="txtareaYourNote" maxlength="100"/>')
                .val(note)
                .on('blur', jQuery.proxy(self.DoneEditNote, self, target, true))
                .on('keydown', jQuery.proxy(self.OnTypingNote, self, target))
                .on('keyup', self.UpdateTextareaNoteHeight);
            yourNoteContainer.html(yourNoteInput);
            yourNoteInput.focus();
            yourNoteInput.trigger('keyup');
        }
    };
    self.UpdateTextareaNoteHeight = function (event) {
        jQuery(event.currentTarget).height(event.currentTarget.scrollHeight);
    };
    self.OnTypingNote = function (target, event) {
        self.UpdateTextareaNoteHeight(event);

        if (event.keyCode === 13) {
            // enter
            self.DoneEditNote(target, true);
            event.preventDefault();
        }
        else if (event.keyCode === 27) {
            // esc
            self.DoneEditNote(target, false);
        }
    };
    self.DoneEditNote = function (target, isSave) {
        var yourNoteInput = jQuery('#txtareaYourNote');
        if (yourNoteInput.length) {
            var refresh = function () {
                self.RefreshPrivateNote();
                target.removeClass('editable');
                target.busyIndicator(false);
            };
            var yourNote = jQuery.trim(yourNoteInput.val());
            if (isSave && yourNote !== self.AngleHandler.GetPrivateNote()) {
                target.busyIndicator(true);
                target.find('.k-loading-mask').addClass('k-loading-none');
                self.SavePrivateNote(yourNote).always(refresh);
            }
            else {
                refresh();
            }
        }
    };
    self.SavePrivateNote = function (yourNote) {
        var data = {
            user_specific: {
                private_note: yourNote
            }
        };
        return self.Save(data)
            .done(self.SaveDone);
    };
    self.RefreshPrivateNote = function () {
        self.AngleHandler.Data().user_specific.private_note.notifySubscribers();
    };

    // is_starred
    self.IsStarred = function () {
        return self.AngleHandler.Data().user_specific.is_starred();
    };
    self.SaveStarred = function (element) {
        if (!self.CanUpdate())
            return;

        element = jQuery(element);
        element.removeClass('icon-star-inactive icon-star-active').addClass('loader-spinner-inline');
        var data = {
            user_specific: {
                is_starred: !self.IsStarred()
            }
        };
        return self.Save(data)
            .always(function () {
                element.removeClass('loader-spinner-inline');
                self.RefreshStarred();
            });
    };
    self.RefreshStarred = function () {
        self.AngleHandler.Data().user_specific.is_starred.notifySubscribers();
    };

    // save utilities
    self.SaveDone = function () {
        if (!self.AngleHandler.IsAdhoc())
            toast.MakeSuccessTextFormatting(self.AngleHandler.GetName(), Localization.Toast_SaveItem);
    };
}