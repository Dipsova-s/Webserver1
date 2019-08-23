(function (handler) {
    "use strict";

    handler.ValidateItem = function () {
        var self = this;
        requestHistoryModel.SaveLastExecute(self, self.ValidateItem, arguments);
        requestHistoryModel.ClearPopupBeforeExecute = true;
        self.ShowValidatingProgressbar();
        self.UpdateState(self.Data.state, { is_validated: self.Data.is_validated() }, function () {
            angleInfoModel.LoadAngle(self.Data.uri)
                .done(function () {
                    var validatetext = self.Data.is_validated() ? Localization.Toast_ValidateItem : Localization.Toast_UnValidateItem;
                    toast.MakeSuccessTextFormatting(angleInfoModel.Name(), validatetext);
                })
                .always(function () {
                    self.HideValidatingProgressbar();
                    self.CloseValidatePopup();
                    anglePageHandler.ApplyExecutionAngle();
                });
        });

        return true;
    };
}(AngleStateHandler.prototype));