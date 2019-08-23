(function (handler) {
    "use strict";

    handler.ValidateItem = function () {
        var self = this;

        requestHistoryModel.SaveLastExecute(self, self.ValidateItem, arguments);
        requestHistoryModel.ClearPopupBeforeExecute = true;
        self.ShowValidatingProgressbar();
        self.UpdateState(self.Data.state, { is_validated: self.Data.is_validated() })
            .done(function () {
                var validatetext = self.Data.is_validated() ? Localization.Toast_ValidateItem : Localization.Toast_UnValidateItem;
                toast.MakeSuccessTextFormatting(dashboardModel.Data().name(), validatetext);
            })
            .always(function () {
                // update viewmodel
                dashboardDetailsHandler.Model.SetData(dashboardModel.GetData());
                dashboardHandler.ApplyBindingHandler();

                // clear stuff
                self.HideValidatingProgressbar();
                self.CloseValidatePopup();

                // css
                var deleteWidgetButtonElement = jQuery('.widget-display-column').find('.widgetButtonDelete');
                if (dashboardModel.Data().is_validated())
                    deleteWidgetButtonElement.addClass('disabled');
                else
                    deleteWidgetButtonElement.removeClass('disabled');
            });

        return true;
    };
}(DashboardStateHandler.prototype));