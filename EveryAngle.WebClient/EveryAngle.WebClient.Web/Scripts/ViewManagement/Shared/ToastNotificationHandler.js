
function ToastNotificationManager(toastSuccess) {
    "use strict";

    var self = this;

    var _notificationInstance;
    var _toastSuccess = toastSuccess;

    //default to hide the message
    var SUCCESS_TOAST_AUTOHIDE_AFTER = 3500;
    var SUCCESS_TOAST_DELAY_BEFORE_DISPLAY = 500;

    var _makeAlertText = function (instance, title, message) {
        instance.Configurations = instance.Configurations || new ToastNotificationConfigurations();
        instance.Configurations.title = title;
        instance.Configurations.message = message;
        instance.MakeAlertText(_notificationInstance);
    };

    self.MakeSuccessText = function (message, title) {
        setTimeout(function () {
            _toastSuccess.Configurations = new ToastNotificationConfigurations();
            _toastSuccess.Configurations.autoHideAfter = SUCCESS_TOAST_AUTOHIDE_AFTER;
            _makeAlertText(_toastSuccess, title, message);
        }, SUCCESS_TOAST_DELAY_BEFORE_DISPLAY);
    };
    self.MakeSuccessTextFormatting = function (word, messageFormat, title) {
        var fullMessage = ToastNotificationUtility.TruncateTextFormatting(word, messageFormat);
        self.MakeSuccessText(fullMessage, title);
    };

}

function ToastNotificationConfigurations() {
    "use strict";

    // our custom configurations
    this.title = '';
    this.message = '';
    this.templateType = 'alert';

    // kendo configurations
    this.hideOnClick = false;
    this.autoHideAfter = 0;
    this.stacking = 'up';
    this.position = {
        bottom: 20,
        right: 20
    };
    this.templates = [{
        type: 'alert',
        template: $('#ToastNotificationAlertTemplate').html()
    }];
    this.show = function (event) {
        event.element.find('.toast-notification__progress-bar').addClass('countdown');
        event.element.find('.toast-notification__close-icon').one('click', function () {
            event.element.parent().remove();
        });
    };
    this.animation = {
        open: {
            effects: "slideIn:left",
            // set slide in to half a sec
            duration: 500
        }
    };
}

function ToastNotification(alertType) {
    "use strict";

    var self = this;

    self.Configurations;
    self.AlertType = alertType;

    self.MakeAlertText = function (notificationInstance) {
        notificationInstance = jQuery('#ToastNotificationContainer').getKendoNotification();
        if (!notificationInstance) {
            self.Configurations = jQuery.extend(new ToastNotificationConfigurations(), self.Configurations);
            notificationInstance = jQuery('#ToastNotificationContainer').kendoNotification(self.Configurations).data('kendoNotification');
        }
        notificationInstance.show({
            title: self.Configurations.title || '',
            message: self.Configurations.message || '',
            type: self.AlertType,
            icon: ToastNotification.AlertIcon[self.AlertType],
            progressbarDuration: self.Configurations.autoHideAfter / 1000
        }, self.Configurations.templateType);
    };

}
ToastNotification.AlertType = { 'Success': 'success' };
ToastNotification.AlertIcon = { 'success': 'icon validated' };

function ToastNotificationUtility() {
    "use strict";

    var self = this;
}
ToastNotificationUtility.MAXIMUM_LENGTH_OF_TEXT_MESSAGE = 130;
ToastNotificationUtility.MAXIMUM_LENGTH_OF_TEXT_MESSAGE_FORMATTING = 20;
ToastNotificationUtility.TruncateTextFormatting = function (word, messageFormat) {
    var messageFormatOverflowLength = 0;
    word = word || '';
    messageFormat = messageFormat || '';
    var totalMessageLength = word.length + messageFormat.length;

    if (totalMessageLength >= ToastNotificationUtility.MAXIMUM_LENGTH_OF_TEXT_MESSAGE + ToastNotificationUtility.MAXIMUM_LENGTH_OF_TEXT_MESSAGE_FORMATTING) {
        if (messageFormat.length >= ToastNotificationUtility.MAXIMUM_LENGTH_OF_TEXT_MESSAGE_FORMATTING)
            messageFormatOverflowLength = messageFormat.length - ToastNotificationUtility.MAXIMUM_LENGTH_OF_TEXT_MESSAGE_FORMATTING;

        if (word.length >= ToastNotificationUtility.MAXIMUM_LENGTH_OF_TEXT_MESSAGE || messageFormatOverflowLength > 0)
            word = word.substr(0, ToastNotificationUtility.MAXIMUM_LENGTH_OF_TEXT_MESSAGE - messageFormatOverflowLength - 3) + '...';
    }

    var fullMessage = kendo.format(messageFormat, word);
    return fullMessage;
};

var toast = new ToastNotificationManager(
    new ToastNotification(ToastNotification.AlertType.Success)
);
