/// <reference path="/Dependencies/ViewModels/Models/Search/searchmodel.js" />
/// <reference path="/Dependencies/viewmanagement/shared/itemdownloadhandler.js" />
/// <reference path="/Dependencies/ViewManagement/Search/AngleExportHandler.js" />

describe("AngleExportHandler", function () {
    var angleExportHandler;
    beforeEach(function () {
        angleExportHandler = new AngleExportHandler(new ItemDownloadHandler());
    });

    describe(".DownloadItems", function () {
        it("should start downloading", function () {
            spyOn(angleExportHandler.Handler(), 'StartExportItems');

            angleExportHandler.DownloadItems();
            expect(angleExportHandler.Handler().StartExportItems).toHaveBeenCalled();
        });
    });
});

