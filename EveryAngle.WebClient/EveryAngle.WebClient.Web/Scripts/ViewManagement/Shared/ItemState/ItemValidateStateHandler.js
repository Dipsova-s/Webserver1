(function (handler) {
    "use strict";

    handler.UpdatingValidateState = ko.observable(false);
    handler.ShowValidatePopup = function (model, event) {
        var self = this;
        if (!self.CanValidateItem() && !self.CanUnvalidateItem())
            return;

        if (jQuery('#popupValidateSettings').is(':visible')) {
            self.CloseValidatePopup();
            return;
        }

        requestHistoryModel.SaveLastExecute(self, self.ShowValidatePopup, arguments);
        requestHistoryModel.ClearPopupBeforeExecute = true;

        var handle = '#' + event.currentTarget.id;
        var popupName = 'ValidateSettings';
        var popupSettings = {
            element: '#popup' + popupName,
            html: self.View.GetValidateTemplate(),
            className: 'k-window-full popup' + popupName,
            scrollable: false,
            resizable: false,
            draggable: false,
            center: false,
            modal: false,
            minWidth: 260,
            minHeight: 42,
            resize: function (e) {
                self.OnPopupResized(e, handle);
            },
            open: jQuery.proxy(self.ShowValidatePopupCallback, self),
            close: popup.Destroy
        };
        popup.Show(popupSettings);
    };
    handler.ShowValidatePopupCallback = function (e) {
        var self = this;
        e.sender.element.find('.switch').addClass('no-animation');
        jQuery.clickOutside('.popupValidateSettings', function (e) {
            var target = jQuery(e.target);
            if (!target.closest('#ShowValidateButton').length
                && target.attr('id') !== 'ShowValidateButton')
                self.CloseValidatePopup();
        });
        WC.HtmlHelper.ApplyKnockout(self, e.sender.element);
        setTimeout(function () {
            e.sender.element.find('.switch').removeClass('no-animation');
        }, 300);
    };
    handler.CloseValidatePopup = function () {
        popup.Close('#popupValidateSettings');
    };
    handler.ValidateItem = jQuery.noop;
    handler.ShowValidatingProgressbar = function () {
        var self = this;
        self.UpdatingValidateState(true);
        jQuery('#popupValidateSettings').busyIndicator(true);
        jQuery('#popupValidateSettings .k-loading-mask').addClass('k-loading-none');
    };
    handler.HideValidatingProgressbar = function () {
        var self = this;
        self.UpdatingValidateState(false);
        jQuery('#popupValidateSettings').busyIndicator(false);
    };
    handler.CanValidateItem = function () {
        var self = this;
        return self.UpdatingValidateState() || self.Data.authorizations().validate;
    };
    handler.CanUnvalidateItem = function () {
        var self = this;
        return self.UpdatingValidateState() || self.Data.authorizations().unvalidate;
    };
}(ItemStateHandler.prototype));