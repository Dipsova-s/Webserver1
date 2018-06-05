/// <reference path="/Dependencies/ViewManagement/Shared/DirectoryHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/SystemSettingHandler.js" />
/// <reference path="/Dependencies/viewmanagement/Search/AngleDownloadHandler.js" />

describe("AngleDownloadHandler", function () {

    var angleDownloadHandler;

    beforeEach(function () {
        angleDownloadHandler = new AngleDownloadHandler();
    });

    describe("when create new instance", function () {

        it("should be defined", function () {
            expect(angleDownloadHandler).toBeDefined();
        });

        it("should set default SelectedItems as []", function () {
            expect(angleDownloadHandler.SelectedItems).toEqual([]);
        });

    });

    describe("call GetSelectData", function () {
        it("should get a list of urls", function () {
            angleDownloadHandler.SelectedItems = [{
                uri: '/angles/1'
            }];
            var result = angleDownloadHandler.GetSelectData();
            expect(result[0].indexOf('api/proxy/angles/1/download') !== -1).toBe(true);
        });

    });

    describe("call SetSelectedItems", function () {

        it("should set info to SelectedItems", function () {
            var items = [{
                type: 'angle'
            }, {
                type: 'dashboard'
            }];
            angleDownloadHandler.SetSelectedItems(items);
            expect(angleDownloadHandler.SelectedItems.length).toEqual(1);
        });

    });

    describe("call StartExportAngle", function () {

        it("should call DownloadAngles method", function () {
            spyOn(angleDownloadHandler, 'GetSelectData').and.callFake($.noop);
            spyOn(angleDownloadHandler, 'DownloadAngles').and.callFake($.noop);

            angleDownloadHandler.StartExportAngle();
            expect(angleDownloadHandler.DownloadAngles).toHaveBeenCalled();
        });

    });

    describe("call IsDownloadableItem", function () {

        it("should get true if is angle", function () {
            var result = angleDownloadHandler.IsDownloadableItem('angle');
            expect(result).toEqual(true);
        });

        it("should get false if is not angle", function () {
            var result = angleDownloadHandler.IsDownloadableItem('xxx');
            expect(result).toEqual(false);
        });

    });

    describe("call DownloadAngles", function () {

        it("should call DownloadAngleDone when finished", function (done) {
            window.progressbarModel = window.progressbarModel || {};
            window.progressbarModel.ShowStartProgressBar = $.noop;
            window.progressbarModel.SetProgressBarText = $.noop;

            spyOn(WC.Utility, 'DownloadFile').and.callFake($.noop);
            spyOn(angleDownloadHandler, 'DownloadAngleDone').and.callFake($.noop);

            angleDownloadHandler.DownloadAngles(['/angles/1/download']);
            setTimeout(function () {
                expect(angleDownloadHandler.DownloadAngleDone).toHaveBeenCalled();
                done();
            }, 600);
        });

    });

    describe("call DownloadAngleDone", function () {

        it("should call ClearAllSelectedRows when finished", function () {
            window.searchPageHandler = window.searchPageHandler || {};
            window.searchPageHandler.ClearAllSelectedRows = $.noop;

            window.progressbarModel = window.progressbarModel || {};
            window.progressbarModel.EndProgressBar = $.noop;

            spyOn(searchPageHandler, 'ClearAllSelectedRows');

            angleDownloadHandler.DownloadAngleDone();
            expect(searchPageHandler.ClearAllSelectedRows).toHaveBeenCalled();
        });

    });

});

