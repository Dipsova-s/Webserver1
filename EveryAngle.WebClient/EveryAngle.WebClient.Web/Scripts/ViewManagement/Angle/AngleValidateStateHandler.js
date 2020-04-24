(function (handler) {
    "use strict";

    handler.ValidateItem = function (element) {
        var self = this;

        var isValidate = self.Data.is_validated();

        var checker = function () {
            return anglePageHandler.HandlerAngle.IsDisplaysUsedInTask();
        };

        var cancel = function () {
            element.prop('checked', isValidate);
        };

        anglePageHandler.HandlerAngle.ConfirmSave(checker, jQuery.proxy(self.CallbackValidateItem, self), cancel);
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
            anglePageHandler.ExecuteAngle();
        });
    };

    handler.ShowValidatePopupCallback = function (e) {
        var self = this;
        e.sender.element.find('[type="checkbox"]').prop('checked', self.Data.is_validated())
            .on('change', jQuery.proxy(self.ValidateItem, self, e.sender.element.find('[type="checkbox"]')));

        self.parent.prototype.ShowValidatePopupCallback.call(self, e);
    };
}(AngleStateHandler.prototype));