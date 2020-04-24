/// <reference path="/Dependencies/ViewModels/Models/User/usermodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/User/privileges.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ModelsHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/DirectoryHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/SystemSettingHandler.js" />
/// <reference path="/Dependencies/viewmanagement/Search/AngleDownloadHandler.js" />
/// <reference path="/Dependencies/ViewModels/Models/Dashboard/dashboardmodel.js" />

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

    describe("call GetWarningMessage", function () {

        it("should not get a warning message", function () {
            var result = angleDownloadHandler.GetWarningMessage();
            expect(result).toEqual('');
        });

    });

    describe("call GetDownloadUrls", function () {

        it("should call GetDownloadUrls method", function () {
            var items = [
                {
                    type: 'angle',
                    uri: '/angles/1'
                }
            ];
            spyOn(dashboardModel, 'LoadDashboard').and.callFake($.noop);

            angleDownloadHandler.GetDownloadUrls(items)
                .done(function (urls) {
                    expect(urls.length).toEqual(1);
                });
        });

    });

    describe("call GetSelectData", function () {
        it("should get a list of selected", function () {
            angleDownloadHandler.SelectedItems = [{
                uri: '/angles/1'
            }];
            var result = angleDownloadHandler.GetSelectData();
            expect(result[0].uri.indexOf('/angles/1') !== -1).toBe(true);
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
            expect(angleDownloadHandler.SelectedItems.length).toEqual(2);
        });

    });

    describe("call StartExportAngle", function () {

        it("should call DownloadItems method", function () {
            spyOn(angleDownloadHandler, 'GetSelectData').and.callFake($.noop);
            spyOn(angleDownloadHandler, 'DownloadItems').and.callFake($.noop);

            angleDownloadHandler.StartExportAngle();
            expect(angleDownloadHandler.DownloadItems).toHaveBeenCalled();
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

    describe("call DownloadItems", function () {

        it("should call DownloadItemDone when finished", function (done) {
            window.progressbarModel = window.progressbarModel || {};
            window.progressbarModel.ShowStartProgressBar = $.noop;
            window.progressbarModel.SetProgressBarText = $.noop;

            spyOn(WC.Utility, 'DownloadFile').and.callFake($.noop);
            spyOn(angleDownloadHandler, 'DownloadItemDone').and.callFake($.noop);

            angleDownloadHandler.DownloadItems(['/angles/1/download']);
            setTimeout(function () {
                expect(angleDownloadHandler.DownloadItemDone).toHaveBeenCalled();
                done();
            }, 600);
        });

    });

    describe("call DownloadItemDone", function () {

        it("should call ClearAllSelectedRows when finished", function () {
            window.searchPageHandler = window.searchPageHandler || {};
            window.searchPageHandler.ClearAllSelectedRows = $.noop;

            window.progressbarModel = window.progressbarModel || {};
            window.progressbarModel.EndProgressBar = $.noop;

            spyOn(searchPageHandler, 'ClearAllSelectedRows');

            angleDownloadHandler.DownloadItemDone();
            expect(searchPageHandler.ClearAllSelectedRows).toHaveBeenCalled();
        });

    });
    
});

