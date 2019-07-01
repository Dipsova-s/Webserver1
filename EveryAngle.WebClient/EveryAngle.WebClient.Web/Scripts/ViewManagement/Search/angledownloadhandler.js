var angleDownloadHandler = new AngleDownloadHandler();

function AngleDownloadHandler() {
    "use strict";

    var self = this;

    // BOF: Properties
    self.SelectedItems = [];
    // EOF: Properties

    // BOF: Methods
    self.GetWarningMessage = function () {
        return '';
    };
    self.GetSelectData = function () {
        return self.SelectedItems;
    };
    self.SetSelectedItems = function (items) {
        self.SelectedItems = [];
        jQuery.each(items, function (index, item) {
            if (self.IsDownloadableItem(item.type)) {
                self.SelectedItems.push(item);
            }
        });
    };
    self.GetDownloadUrls = function (items) {
        var deferred = [];
        var urls = [];
        var loadDashboard = function (uri, dashboardId) {
            return dashboardModel.LoadDashboard(uri)
                .done(function () {
                    // get angle for dashboard from widget definitions
                    var dashboardAngles = [];
                    jQuery.each(dashboardModel.Data().widget_definitions, function (index, widget) {
                        dashboardAngles.push(widget.angle);
                    });

                    var distinctDashboardAngles = dashboardAngles.distinct();
                    jQuery.each(distinctDashboardAngles, function (index, angle) {
                        urls.push(WC.Ajax.BuildRequestUrl(angle
                            + '/download?show_angle_display_id=' + window.showAngleAndDisplayID
                            + '&as_widget=true&dashboard_id=' + dashboardId, false));
                    });
                });
        };
        jQuery.each(items, function (index, item) {
            urls.push(WC.Ajax.BuildRequestUrl(item.uri + '/download?show_angle_display_id=' + window.showAngleAndDisplayID, false));
            if (item.type === enumHandlers.ITEMTYPE.DASHBOARD) {
                deferred.pushDeferred(loadDashboard, [item.uri, item.uri.split("/").pop()]);
            }
        });
        return jQuery.whenAll(deferred)
            .then(function () {
                return jQuery.when(urls);
            });
    };
    self.StartExportAngle = function () {
        self.GetDownloadUrls(self.SelectedItems)
            .done(function (urls) {
                self.DownloadItems(urls);
            });
    };
    self.CloseAngleExportPopup = jQuery.noop;

    self.IsDownloadableItem = function (itemType) {
        return itemType === enumHandlers.ITEMTYPE.ANGLE || itemType === enumHandlers.ITEMTYPE.DASHBOARD;
    };
    self.DownloadItems = function (itemUrls) {
        progressbarModel.ShowStartProgressBar(Localization.ProgressBar_DownloadAngle, false);
        progressbarModel.IsCancelPopup = false;

        var itemCount = itemUrls.length;
        var downloadItem = function (urls) {
            if (self.IsDownloadItemDone(urls.length)) {
                self.DownloadItemDone();
            }
            else {
                WC.Ajax.EnableBeforeExit = false;
                WC.Utility.DownloadFile(urls.splice(0, 1)[0]);
                progressbarModel.SetProgressBarText(kendo.toString((itemCount - urls.length) / itemCount * 100, 'n0'), null, Localization.ProgressBar_DownloadAngle);
                setTimeout(function () {
                    downloadItem(urls);
                }, 500);
            }
        };

        downloadItem(itemUrls);
    };
    self.IsDownloadItemDone = function (remainUrl) {
        return !remainUrl || progressbarModel.IsCancelPopup;
    };
    self.DownloadItemDone = function () {
        progressbarModel.IsCancelPopup = false;
        progressbarModel.EndProgressBar();
        self.CloseAngleExportPopup();
        searchPageHandler.ClearAllSelectedRows();
    };
    // EOF: Methods
}
