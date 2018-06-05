function AngleDownloadHandler() {
    "use strict";

    var self = this;

    // BOF: Properties
    self.SelectedItems = [];
    // EOF: Properties

    // BOF: Methods
    self.GetSelectData = function () {
        var urls = [];
        jQuery.each(self.SelectedItems, function (index, item) {
            urls.push(WC.Ajax.BuildRequestUrl(item.uri + '/download?show_angle_display_id=' + window.showAngleAndDisplayID, false));
        });
        return urls;
    };
    self.SetSelectedItems = function (items) {
        self.SelectedItems = [];
        jQuery.each(items, function (index, item) {
            if (self.IsDownloadableItem(item.type)) {
                self.SelectedItems.push(item);
            }
        });
    };
    self.StartExportAngle = function () {
        self.DownloadAngles(self.GetSelectData());
    };
    self.CloseAngleExportPopup = jQuery.noop;

    self.IsDownloadableItem = function (itemType) {
        return itemType === enumHandlers.ITEMTYPE.ANGLE;
    };
    self.DownloadAngles = function (angleUrls) {
        progressbarModel.ShowStartProgressBar(Localization.ProgressBar_DownloadAngle, false);
        progressbarModel.IsCancelPopup = false;

        var angleCount = angleUrls.length;
        var downloadAngle = function (urls) {
            if (self.IsDownloadAngleDone(urls.length)) {
                self.DownloadAngleDone();
            }
            else {
                WC.Utility.DownloadFile(urls.splice(0, 1)[0]);
                progressbarModel.SetProgressBarText(kendo.toString((angleCount - urls.length) / angleCount * 100, 'n0'), null, Localization.ProgressBar_DownloadAngle);
                setTimeout(function () {
                    downloadAngle(urls);
                }, 500);
            }
        };

        downloadAngle(angleUrls);
    };
    self.IsDownloadAngleDone = function (remainUrl) {
        return !remainUrl || progressbarModel.IsCancelPopup;
    };
    self.DownloadAngleDone = function () {
        progressbarModel.IsCancelPopup = false;
        progressbarModel.EndProgressBar();
        self.CloseAngleExportPopup();
        searchPageHandler.ClearAllSelectedRows();
    };
    // EOF: Methods
}
