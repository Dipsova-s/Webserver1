function AngleExportHandler(angleDownloadHandler) {
    "use strict";

    var self = this;
    var _self = {};

    // BOF: Properties
    _self.angleDownloadHandler = angleDownloadHandler;

    self.Handler = ko.observable(_self.angleDownloadHandler);
    // EOF: Properties

    // BOF: Methods

    self.DownloadItems = function () {
        self.Handler().SetSelectedItems(searchModel.SelectedItems());
        self.Handler().StartExportAngle();
    };
    
    // EOF: Methods
}

AngleExportHandler.ANGLEEXPORTTYPE = {
    DOWNLOAD: 'download',
    PACKAGE: 'package'
};

var angleExportHandler = new AngleExportHandler(new AngleDownloadHandler());