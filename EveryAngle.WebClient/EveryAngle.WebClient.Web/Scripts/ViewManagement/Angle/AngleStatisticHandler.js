function AngleStatisticHandler(angleHandler) {
    "use strict";

    var self = this;
    self.AngleHandler = angleHandler;
    self.View = new AngleStatisticView();
    self.StatisticInfo = ko.observable(null);
    self.ExecutionInfo = ko.observable(null);

    self.ShowPopup = function () {
        self.CreateStatisticModel();
        var options = self.GetPopupOptions();
        popup.Show(options);
    };

    self.CreateStatisticModel = function () {
        var data = self.AngleHandler.Data();
        var statisticInfo = null;
        if (!self.AngleHandler.IsAdhoc()) {
            var changedBy = self.GetStatisticItem(data.changed);
            statisticInfo = {
                CreatedBy: self.GetStatisticItem(data.created),
                ChangedBy: changedBy,
                ExecutedBy: self.GetStatisticItem(data.executed, changedBy),
                ValidatedBy: self.GetStatisticItem(data.validated),
                TimeExcuted: data.user_specific.times_executed
            };
        }
        self.StatisticInfo(statisticInfo);

        var executionInfo = null;
        if (self.AngleHandler.GetCurrentDisplay()) {
            executionInfo = self.AngleHandler.GetCurrentDisplay().ResultHandler.ExecutionInfo();
        }
        self.ExecutionInfo(executionInfo);
    };

    self.GetStatisticItem = function (modifiedBy, defaultStatistic) {
        if (!modifiedBy) {
            return jQuery.extend({ user: '', datetime: '', full_name: '' }, defaultStatistic);
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
            title: Captions.Popup_Angle_Info,
            html: self.View.GetTemplate(),
            className: 'popup-info',
            width: 'auto',
            minWidth: 100,
            maxWidth: 600,
            height: 'auto',
            minHeight: 100,
            maxHeight: 500,
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