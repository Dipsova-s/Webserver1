(function (handler) {
    "use strict";

    handler.SetTemplateStatus = function (istemplate) {
        var self = this;
        self.UpdateState(self.Data.state, { is_template: istemplate }, function () {
            var toastmessage = self.Data.is_template() ? Localization.Toast_SetTemplateToAngle : Localization.Toast_SetAngleToTemplate;
            toast.MakeSuccessTextFormatting(angleInfoModel.Name(), toastmessage);
            anglePageHandler.HandlerAngle.ClearData();
            anglePageHandler.HandlerDisplay.ClearPostResultData();
            anglePageHandler.ExecuteAngle();
        });
        return true;
    };
}
(AngleStateHandler.prototype));


