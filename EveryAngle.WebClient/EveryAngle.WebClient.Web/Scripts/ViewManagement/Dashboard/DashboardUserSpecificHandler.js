function DashboardUserSpecificHandler(dashboardModel, unsavedModel) {
    "use strict";

    var self = this;
    self.DashboardModel = dashboardModel;
    self.UnsavedModel = unsavedModel;

    // general
    self.CanUpdate = function () {
        return self.DashboardModel.Data().authorizations.update_user_specific;
    };

    // is_starred
    self.IsStarred = function () {
        return self.DashboardModel.Data().user_specific.is_starred();
    };
    self.SetFavorite = function (element) {
        if (!self.CanUpdate())
            return;
        
        element = jQuery(element);
        element.removeClass('icon-star-inactive icon-star-active').addClass('loader-spinner-inline');
        self.DashboardModel.SetFavorite(!self.IsStarred())
            .done(function (data) {
                self.UnsavedModel.Data().user_specific.is_starred(data.user_specific.is_starred);
            })
            .always(function () {
                element.removeClass('loader-spinner-inline');
            });
    };

    // private_note
    self.HasPrivateNote = function () {
        return self.CanUpdate() && self.GetPrivateNote();
    };
    self.GetPrivateNote = function () {
        return self.DashboardModel.Data().user_specific.private_note();
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
            if (isSave && yourNote !== self.GetPrivateNote()) {
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
        return self.DashboardModel.SetPrivateNote(yourNote)
            .done(function (data) {
                self.UnsavedModel.Data().user_specific.private_note(data.user_specific.private_note);
                self.SaveDone();
            });
    };
    self.RefreshPrivateNote = function () {
        self.DashboardModel.Data().user_specific.private_note.notifySubscribers();
    };

    // execute_on_login
    self.CanExecuteAtLogon = ko.observable(true);
    self.InitialExecuteAtLogon = function (target) {
        WC.HtmlHelper.ApplyKnockout(self, target);
    };
    self.GetExecuteAtLogon = function () {
        return self.DashboardModel.Data().user_specific.execute_on_login();
    };
    self.ExecuteOnLoginChanged = function () {
        self.CanExecuteAtLogon(false);
        self.DashboardModel.SetExecuteOnLogin(!self.GetExecuteAtLogon())
            .done(function (data) {
                self.UnsavedModel.Data().user_specific.execute_on_login(data.user_specific.execute_on_login);
                self.SaveDone();
            })
            .always(function () {
                self.CanExecuteAtLogon(true);
            });
        return true;
    };

    // save utilities
    self.SaveDone = function () {
        if (!self.DashboardModel.IsTemporaryDashboard())
            toast.MakeSuccessTextFormatting(self.DashboardModel.Data().name(), Localization.Toast_SaveItem);
    };
}