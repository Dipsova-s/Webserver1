function DashboardStatisticHandler() {
    "use strict";

    var self = this;
    self.View = new DashboardStatisticView();
    self.StatisticInfo = ko.observable(null);

    self.ShowPopup = function (data) {
        self.CreateStatisticModel(data);
        var options = self.GetPopupOptions();
        popup.Show(options);
    };

    self.CreateStatisticModel = function (data) {
        var statisticInfo = {
            CreatedBy: self.GetStatisticItem(data.created),
            ChangedBy: self.GetStatisticItem(data.changed),
            ExecutedBy: self.GetStatisticItem(data.executed)
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
            title: Captions.Popup_Dashboard_Info,
            html: self.View.GetTemplate(),
            className: 'popup-info',
            width: 'auto',
            minWidth: 100,
            minHeight: 100,
            height: 'auto',
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