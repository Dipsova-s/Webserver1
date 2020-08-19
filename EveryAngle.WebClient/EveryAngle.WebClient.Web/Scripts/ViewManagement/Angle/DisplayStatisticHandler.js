function DisplayStatisticHandler(displayHandler) {
    "use strict";

    var self = this;
    self.DisplayHandler = displayHandler;
    self.View = new DisplayStatisticView();
    self.StatisticInfo = ko.observable(null);

    self.ShowPopup = function () {
        self.CreateStatisticModel();
        var options = self.GetPopupOptions();
        popup.Show(options);
    };

    self.CreateStatisticModel = function () {
        var data = self.DisplayHandler.Data();
        var statisticInfo = {
            CreatedBy: self.GetStatisticItem(data.created),
            ChangedBy: self.GetStatisticItem(data.changed)
        };

        self.StatisticInfo(statisticInfo);
    };

    self.GetStatisticItem = function (modifiedBy) {
        if (!modifiedBy) {
            return { user: '', datetime: '', full_name: '' };
        }
        return {
            user: modifiedBy.user,
            datetime: ConvertUnixTimeStampToDateStringInAngleDetails(modifiedBy.datetime),
            full_name: modifiedBy.full_name
        };
    };

    self.GetPopupOptions = function () {
        return {
            element: '#PopupStatistic',
            title: Captions.Popup_Display_Info,
            html: self.View.GetTemplate(),
            className: 'popup-info',
            width: 'auto',
            minWidth: 300,
            height: 'auto',
            minHeight: 150,
            actions: ["Close"],
            resizable: false,
            open: self.ShowPopupCallback,
            close: popup.Destroy
        };
    };

    self.ShowPopupCallback = function (e) {
        WC.HtmlHelper.ApplyKnockout(self, e.sender.element);
    };
}