function ItemDownloadHandler() {
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
            return self.GetDashboardAngleUris(uri)
                .done(function (angles) {
                    jQuery.each(angles, function (index, angle) {
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
    self.GetDashboardAngleUris = function (uri) {
        var angles = [];
        var query = {};
        query[enumHandlers.PARAMETERS.CACHING] = false;
        return GetDataFromWebService(uri, query)
            .then(function (dashboard) {
                angles = jQuery.map(dashboard.widget_definitions, function (widget) {
                    return widget.angle;
                });
                angles = angles.distinct();
                return jQuery.when(angles);
            });
    };
    self.StartExportItems = function () {
        progressbarModel.ShowStartProgressBar(Localization.ProgressBar_DownloadAngle, false);
        progressbarModel.IsCancelPopup = false;
        self.GetDownloadUrls(self.GetSelectData())
            .done(self.DownloadItems);
    };

    self.IsDownloadableItem = function (itemType) {
        return itemType === enumHandlers.ITEMTYPE.ANGLE || itemType === enumHandlers.ITEMTYPE.DASHBOARD;
    };
    self.DownloadItems = function (itemUrls) {
        var itemCount = itemUrls.length;
        var downloadItem = function (urls) {
            if (self.IsDownloadItemDone(urls.length)) {
                self.DownloadItemDone();
            }
            else {
                WC.Ajax.EnableBeforeExit = false;
                WC.Utility.DownloadFile(urls.splice(0, 1)[0], true);
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
        self.DownloadItemDoneCallback();
        $('.downloadIframe') && $('.downloadIframe').remove();
    };
    self.DownloadItemDoneCallback = jQuery.noop;
    // EOF: Methods
}
