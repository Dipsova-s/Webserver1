function AngleExportHandler(itemDownloadHandler) {
    "use strict";

    var self = this;
    var _self = {};

    // BOF: Properties
    _self.itemDownloadHandler = itemDownloadHandler;
    _self.itemDownloadHandler.DownloadItemDoneCallback = function () {
        searchPageHandler.ClearAllSelectedRows();
    };

    self.Handler = ko.observable(_self.itemDownloadHandler);
    // EOF: Properties

    // BOF: Methods

    self.DownloadItems = function () {
        self.Handler().SetSelectedItems(searchModel.SelectedItems());
        self.Handler().StartExportItems();
    };
    
    // EOF: Methods
}

AngleExportHandler.ANGLEEXPORTTYPE = {
    DOWNLOAD: 'download',
    PACKAGE: 'package'
};

var angleExportHandler = new AngleExportHandler(new ItemDownloadHandler());