/// <reference path="/Dependencies/ViewModels/Models/Angle/AngleInfoModel.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/PopupPageHandlers.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ModelsHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/AboutSystemHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ItemDownloadHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/AngleActionMenuHandler.js" />

describe("AngleActionMenuHandler", function () {
    var AngleActionMenuHandlerTest = function () {
        var self = this;
        self.HandlerAngle = { GetData: $.noop, IsAdhoc: $.noop };
        self.HandlerAngleSaveAction = { EnableSaveAll: $.noop };

        jQuery.extend(self, new AngleActionMenuHandler(self));
    };
    var angleActionMenuHandler;
    beforeEach(function () {
        angleActionMenuHandler = new AngleActionMenuHandlerTest();
    });

    describe(".GetEditModeMenu", function () {
        it("should get menu", function () {
            // prepare
            spyOn(angleActionMenuHandler, 'GetPrivilegeData').and.returnValue({});
            var result = angleActionMenuHandler.GetEditModeMenu();

            // assert
            expect(result.length).toEqual(3);
        });
    });

    describe(".IsFindOptionVisible", function () {

        var tests = [
            {
                title: 'should hide Find option for realtime model',
                is_real_time: true,
                expected: false
            },
            {
                title: 'should show Find option if it\'s not realtime model',
                is_real_time: false,
                expected: true
            }
        ];

        $.each(tests, function (index, test) {
            it(test.title, function () {
                //initial
                spyOn(angleInfoModel, 'Data').and.returnValue({});
                spyOn(modelsHandler, 'GetModelByUri').and.returnValue({});
                spyOn(aboutSystemHandler, 'IsRealTimeModel').and.returnValue(test.is_real_time);

                //process
                var result = angleActionMenuHandler.IsFindOptionVisible();

                //assert
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".CanDownload", function () {
        it("should be true", function () {
            // prepare
            spyOn(angleActionMenuHandler.HandlerAngle, 'IsAdhoc').and.returnValue(false);
            var result = angleActionMenuHandler.CanDownload();

            // assert
            expect(result).toEqual(true);
        });
        it("should be false", function () {
            // prepare
            spyOn(angleActionMenuHandler.HandlerAngle, 'IsAdhoc').and.returnValue(true);
            var result = angleActionMenuHandler.CanDownload();

            // assert
            expect(result).toEqual(false);
        });
    });

    describe(".Download", function () {
        var downloadHandler, item;
        beforeEach(function () {
            downloadHandler = {
                SetSelectedItems: $.noop,
                StartExportItems: $.noop
            };
            item = {};
            spyOn(angleActionMenuHandler.HandlerAngle, 'GetData').and.returnValue(item);
            spyOn(downloadHandler, 'SetSelectedItems');
            spyOn(downloadHandler, 'StartExportItems');
            spyOn(window, 'ItemDownloadHandler').and.returnValue(downloadHandler);
            spyOn(popup, 'Confirm');
        });
        it('should download', function () {
            spyOn(angleActionMenuHandler.HandlerAngleSaveAction, 'EnableSaveAll').and.returnValue(false);
            angleActionMenuHandler.Download();

            // assert
            expect(item.type).toEqual('angle');
            expect(downloadHandler.SetSelectedItems).toHaveBeenCalled();
            expect(downloadHandler.StartExportItems).toHaveBeenCalled();
            expect(popup.Confirm).not.toHaveBeenCalled();
        });
        it('should show confirmation popup', function () {
            spyOn(angleActionMenuHandler.HandlerAngleSaveAction, 'EnableSaveAll').and.returnValue(true);
            angleActionMenuHandler.Download();

            // assert
            expect(item.type).not.toEqual('angle');
            expect(downloadHandler.SetSelectedItems).not.toHaveBeenCalled();
            expect(downloadHandler.StartExportItems).not.toHaveBeenCalled();
            expect(popup.Confirm).toHaveBeenCalled();
        });
    });
});
