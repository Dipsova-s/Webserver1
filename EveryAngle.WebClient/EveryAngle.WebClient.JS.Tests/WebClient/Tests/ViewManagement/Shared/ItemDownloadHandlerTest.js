/// <reference path="/Dependencies/ViewModels/Models/User/usermodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/User/privileges.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ModelsHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/DirectoryHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/SystemSettingHandler.js" />
/// <reference path="/Dependencies/viewmanagement/shared/itemdownloadhandler.js" />

describe("ItemDownloadHandler", function () {

    var itemDownloadHandler;

    beforeEach(function () {
        itemDownloadHandler = new ItemDownloadHandler();
    });

    describe("when create new instance", function () {

        it("should be defined", function () {
            expect(itemDownloadHandler).toBeDefined();
        });

        it("should set default SelectedItems as []", function () {
            expect(itemDownloadHandler.SelectedItems).toEqual([]);
        });

    });

    describe(".GetWarningMessage", function () {

        it("should not get a warning message", function () {
            var result = itemDownloadHandler.GetWarningMessage();
            expect(result).toEqual('');
        });

    });

    describe(".GetDownloadUrls", function () {
        it("should call GetDownloadUrls method", function () {
            var items = [
                {
                    type: 'angle',
                    uri: '/angles/1'
                },
                {
                    type: 'dashboard',
                    uri: '/dashboards/1'
                }
            ];
            spyOn(itemDownloadHandler, 'GetDashboardAngleUris').and.returnValue($.when(['/angles/3']));

            itemDownloadHandler.GetDownloadUrls(items)
                .done(function (urls) {
                    expect(urls.length).toEqual(3);
                });
        });
    });

    describe(".GetDashboardAngleUris", function () {
        it("should get unique Angle uris", function () {
            spyOn(window, 'GetDataFromWebService').and.returnValue($.when({
                widget_definitions: [
                    { angle: '/angles/1' },
                    { angle: '/angles/2' },
                    { angle: '/angles/1' }
                ]
            }));

            itemDownloadHandler.GetDashboardAngleUris('')
                .done(function (urls) {
                    expect(urls).toEqual(['/angles/1', '/angles/2']);
                });
        });
    });

    describe(".GetSelectData", function () {
        it("should get a list of selected", function () {
            itemDownloadHandler.SelectedItems = [{
                uri: '/angles/1'
            }];
            var result = itemDownloadHandler.GetSelectData();
            expect(result[0].uri.indexOf('/angles/1') !== -1).toBe(true);
        });

    });

    describe(".SetSelectedItems", function () {

        it("should set info to SelectedItems", function () {
            var items = [{
                type: 'angle'
            }, {
                type: 'dashboard'
            }];
            itemDownloadHandler.SetSelectedItems(items);
            expect(itemDownloadHandler.SelectedItems.length).toEqual(2);
        });

    });

    describe(".StartExportItems", function () {
        it("should call DownloadItems method", function () {
            window.progressbarModel = window.progressbarModel || {};
            window.progressbarModel.ShowStartProgressBar = $.noop;
            window.progressbarModel.IsCancelPopup = true;
            spyOn(progressbarModel, 'ShowStartProgressBar');
            spyOn(itemDownloadHandler, 'GetDownloadUrls').and.returnValue($.when());
            spyOn(itemDownloadHandler, 'GetSelectData');
            spyOn(itemDownloadHandler, 'DownloadItems');
            itemDownloadHandler.StartExportItems();
            
            expect(progressbarModel.IsCancelPopup).toEqual(false);
            expect(progressbarModel.ShowStartProgressBar).toHaveBeenCalled();
            expect(itemDownloadHandler.DownloadItems).toHaveBeenCalled();
        });
    });

    describe(".IsDownloadableItem", function () {

        it("should get true if is angle", function () {
            var result = itemDownloadHandler.IsDownloadableItem('angle');
            expect(result).toEqual(true);
        });

        it("should get false if is not angle", function () {
            var result = itemDownloadHandler.IsDownloadableItem('xxx');
            expect(result).toEqual(false);
        });

    });

    describe(".DownloadItems", function () {

        it("should call DownloadItemDone when finished", function (done) {
            window.progressbarModel = window.progressbarModel || {};
            window.progressbarModel.SetProgressBarText = $.noop;
            spyOn(WC.Utility, 'DownloadFile');
            spyOn(itemDownloadHandler, 'DownloadItemDone');

            itemDownloadHandler.DownloadItems(['/angles/1/download']);
            setTimeout(function () {
                expect(itemDownloadHandler.DownloadItemDone).toHaveBeenCalled();
                done();
            }, 600);
        });

    });

    describe(".DownloadItemDone", function () {

        it("should call ClearAllSelectedRows when finished", function () {
            window.progressbarModel = window.progressbarModel || {};
            window.progressbarModel.IsCancelPopup = true;
            window.progressbarModel.EndProgressBar = $.noop;
            spyOn(progressbarModel, 'EndProgressBar');
            spyOn(itemDownloadHandler, 'DownloadItemDoneCallback');
            itemDownloadHandler.DownloadItemDone();

            expect(progressbarModel.IsCancelPopup).toEqual(false);
            expect(progressbarModel.EndProgressBar).toHaveBeenCalled();
            expect(itemDownloadHandler.DownloadItemDoneCallback).toHaveBeenCalled();
        });

    });
    
});

