/// <reference path="/Dependencies/ViewModels/Models/Search/searchmodel.js" />
/// <reference path="/Dependencies/ViewManagement/Search/AngleDownloadHandler.js" />
/// <reference path="/Dependencies/Helper/EnumHandlers.js" />
/// <reference path="/Dependencies/ViewManagement/Search/AngleExportHandler.js" />

describe("AngleExportHandler", function () {

    var angleExportHandler;

    beforeEach(function () {
        angleExportHandler = new AngleExportHandler(new AngleDownloadHandler());
    });

    describe(".DownloadItems", function () {

        it("should call handler StartExportAngle", function () {
            spyOn(angleExportHandler.Handler(), 'StartExportAngle').and.callFake($.noop);

            angleExportHandler.DownloadItems();
            expect(angleExportHandler.Handler().StartExportAngle).toHaveBeenCalled();
        });
    });
});

