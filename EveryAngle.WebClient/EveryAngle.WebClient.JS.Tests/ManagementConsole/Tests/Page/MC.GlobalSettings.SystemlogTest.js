/// <chutzpah_reference path="/../../Dependencies/page/MC.GlobalSettings.Systemlog.js" />

describe("MC.GlobalSettings.Systemlog", function () {
    var page;
    beforeEach(function () {
        page = MC.GlobalSettings.Systemlog;
    });
    describe(".DownloadLogFile", function () {
        beforeEach(function () {
            page.Target = 'AppServer';
            spyOn(MC.util, 'download');
        });
        it("should not download", function () {
            spyOn($.fn, 'val').and.returnValue('');
            page.DownloadLogFile($());

            // assert
            expect(MC.util.download).not.toHaveBeenCalled();
        });
        it("should download", function () {
            spyOn($.fn, 'val').and.returnValue('test.txt');
            page.DownloadLogFile($());

            // assert
            expect(MC.util.download).toHaveBeenCalledWith('/download?fullPath=dGVzdC50eHQ=&target=AppServer');
        });
    });
});
