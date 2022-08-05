(function (handler) {
    "use strict";

    handler.ValidateItem = function (element) {
        var self = this;
        var isValidate = self.Data.is_validated();
        var checker = jQuery.proxy(anglePageHandler.HandlerAngle.IsDisplaysUsedInTask, anglePageHandler.HandlerAngle);
        var save = jQuery.proxy(self.CallbackValidateItem, self);
        var cancel = jQuery.proxy(self.CancelValidateItem, self, element, isValidate);
        anglePageHandler.HandlerAngle.ConfirmValidationSaveUsedInTask(checker, save, cancel);
    };
    handler.CancelValidateItem = function (element, isValidate) {
        element.prop('checked', isValidate);
    };
    handler.CallbackValidateItem = function () {
        var self = this;
        self.ShowValidatingProgressbar();
        self.UpdateState(self.Data.state, { is_validated: !self.Data.is_validated() }, function () {
            var validatetext = !self.Data.is_validated() ? Localization.Toast_ValidateItem : Localization.Toast_UnValidateItem;
            toast.MakeSuccessTextFormatting(angleInfoModel.Name(), validatetext);
            self.HideValidatingProgressbar();
            self.CloseValidatePopup();
            anglePageHandler.HandlerAngle.ClearData();
            anglePageHandler.HandlerDisplay.ClearPostResultData();
            anglePageHandler.ExecuteAngle();
        });
    };
    handler.ShowValidatePopupCallback = function (e) {
        var self = this;
        var target = e.sender.element.find('[type="checkbox"]');
        target.prop('checked', self.Data.is_validated());
        target.on('change', jQuery.proxy(self.ValidateItem, self, target));

        self.parent.prototype.ShowValidatePopupCallback.call(self, e);
    };
}(AngleStateHandler.prototype));