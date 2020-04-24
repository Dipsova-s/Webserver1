(function (handler) {
    "use strict";

    handler.ValidateItem = function () {
        var self = this;
        
        self.ShowValidatingProgressbar();
        self.UpdateState(self.Data.state, { is_validated: self.Data.is_validated() })
            .done(function () {
                var validatetext = self.Data.is_validated() ? Localization.Toast_ValidateItem : Localization.Toast_UnValidateItem;
                toast.MakeSuccessTextFormatting(dashboardModel.Data().name(), validatetext);
            })
            .always(function () {
                // update viewmodel
                dashboardPageHandler.DashboardModel.SetData(dashboardModel.GetData());
                dashboardPageHandler.ApplyBindingHandler();

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