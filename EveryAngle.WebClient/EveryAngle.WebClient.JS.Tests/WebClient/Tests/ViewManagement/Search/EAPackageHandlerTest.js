/// <reference path="/Dependencies/ViewManagement/Shared/DirectoryHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/SystemSettingHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Search/EAPackageHandler.js" />

describe("EAPackageHandler", function () {

    var eaPackageHandler;

    beforeEach(function () {
        eaPackageHandler = new EAPackageHandler();
    });

    describe("when create new instance", function () {

        it("should be defined", function () {
            expect(eaPackageHandler).toBeDefined();
        });

        it("should set default SelectedItems as []", function () {
            expect(eaPackageHandler.SelectedItems).toEqual([]);
        });

        it("should set default ModelUris as []", function () {
            expect(eaPackageHandler.ModelUris).toEqual([]);
        });

        it("should set default ContainsOnlyPublicItems as false", function () {
            expect(eaPackageHandler.ContainsOnlyPublicItems).toEqual(false);
        });

        it("should set default FromTheSameModel as false", function () {
            expect(eaPackageHandler.FromTheSameModel).toEqual(false);
        });

        it("should set default GeneratePackageUri as ''", function () {
            expect(eaPackageHandler.GeneratePackageUri).toEqual('');
        });

    });

    describe("call GetWarningMessage", function () {

        it("should get 2 warning messages if FromTheSameModel and ContainsOnlyPublicItems = false", function () {
            eaPackageHandler.FromTheSameModel = false;
            eaPackageHandler.ContainsOnlyPublicItems = false;
            var result = eaPackageHandler.GetWarningMessage();
            expect($(result).filter('.warningItem').length).toEqual(2);
        });

        it("should not get a warning message if FromTheSameModel and ContainsOnlyPublicItems = true", function () {
            eaPackageHandler.FromTheSameModel = true;
            eaPackageHandler.ContainsOnlyPublicItems = true;
            var result = eaPackageHandler.GetWarningMessage();
            expect(result).toEqual('');
        });

    });

    describe("call GetSelectData", function () {

        it("should get list of ids", function () {
            eaPackageHandler.SelectedItems = [{
                id: 'id1'
            }];
            var result = eaPackageHandler.GetSelectData();
            expect(result).toEqual(['id1']);
        });

    });

    describe("call SetSelectedItems", function () {

        it("should set info to SelectedItems, ModelUris and ContainsOnlyPublicItems", function () {
            var items = [{
                type: 'angle',
                is_published: true,
                model: '/models/1'
            }, {
                type: 'angle',
                is_published: true,
                model: '/models/1'
            }, {
                type: 'angle',
                is_published: true,
                model: '/models/2'
            }, {
                type: 'angle',
                is_published: false,
                model: '/models/2'
            }, {
                type: 'dashboard',
                is_published: true,
                model: '/models/1'
            }, {
                type: 'dashboard',
                is_published: false,
                model: '/models/2'
            }, {
                type: 'template',
                is_published: true,
                model: '/models/1'
            }, {
                type: 'template',
                is_published: false,
                model: '/models/2'
            }];
            eaPackageHandler.SetSelectedItems(items);
            expect(eaPackageHandler.SelectedItems.length).toEqual(5);
            expect(eaPackageHandler.ModelUris).toEqual(['/models/1', '/models/2']);
            expect(eaPackageHandler.ContainsOnlyPublicItems).toEqual(false);
        });

    });

    describe("call StartExportAngle", function () {

        it("should not call ExportAnglePackage if invalidated", function () {
            spyOn(eaPackageHandler, 'ValidateExportPackage').and.callFake(function () { return false; });
            spyOn(eaPackageHandler, 'ExportAnglePackage');

            eaPackageHandler.StartExportAngle();
            expect(eaPackageHandler.ExportAnglePackage).not.toHaveBeenCalled();
        });

        it("should call ExportAnglePackage method if validated", function () {
            spyOn(eaPackageHandler, 'ValidateExportPackage').and.callFake(function () { return true; });
            spyOn(eaPackageHandler, 'ExportAnglePackage').and.callFake($.noop);

            eaPackageHandler.StartExportAngle();
            expect(eaPackageHandler.ExportAnglePackage).toHaveBeenCalled();
        });

    });

    describe("call IsNotPublishedItem", function () {

        it("should get true if is angle and is not is_published", function () {
            var result = eaPackageHandler.IsNotPublishedAngle('angle', false);
            expect(result).toEqual(true);
        });

        it("should get false if is not angle", function () {
            var result = eaPackageHandler.IsNotPublishedAngle('xxx', false);
            expect(result).toEqual(false);
        });

        it("should get false if is angle but is_published", function () {
            var result = eaPackageHandler.IsNotPublishedAngle('angle', true);
            expect(result).toEqual(false);
        });
    });
    describe("call GetPackageName", function () {
        beforeEach(function () {
            $('<input id="PackageName">').hide().appendTo('body');
        });

        afterEach(function () {
            $('#PackageName').remove();
        });

        it("should get trim package name", function () {
            $('#PackageName').val(' test ');
            var result = eaPackageHandler.GetPackageName();
            expect(result).toEqual('test');
        });

        it("should get a default name package name if no value", function () {
            window.Localization = window.Localization || {};
            window.Localization.EAPackage = 'DefaultPackageName';
            $('#PackageName').val('');
            var result = eaPackageHandler.GetPackageName();
            expect(result).toEqual('DefaultPackageName');
        });

    });

    describe("call ValidateExportPackage", function () {

        it("should get 'false' if not ValidatePackageName", function () {
            spyOn(eaPackageHandler, 'ValidatePackageName').and.callFake(function () { return false; });

            var result = eaPackageHandler.ValidateExportPackage();
            expect(result).toEqual(false);
        });

        it("should get 'false' if not ValidatePackageId", function () {
            spyOn(eaPackageHandler, 'ValidatePackageName').and.callFake(function () { return true; });
            spyOn(eaPackageHandler, 'ValidatePackageId').and.callFake(function () { return false; });

            var result = eaPackageHandler.ValidateExportPackage();
            expect(result).toEqual(false);
        });

        it("should get 'false' if not ValidatePackageVersion", function () {
            spyOn(eaPackageHandler, 'ValidatePackageName').and.callFake(function () { return true; });
            spyOn(eaPackageHandler, 'ValidatePackageId').and.callFake(function () { return true; });
            spyOn(eaPackageHandler, 'ValidatePackageVersion').and.callFake(function () { return false; });

            var result = eaPackageHandler.ValidateExportPackage();
            expect(result).toEqual(false);
        });

        it("should get 'true' if all Valid", function () {
            spyOn(eaPackageHandler, 'ValidatePackageName').and.callFake(function () { return true; });
            spyOn(eaPackageHandler, 'ValidatePackageId').and.callFake(function () { return true; });
            spyOn(eaPackageHandler, 'ValidatePackageVersion').and.callFake(function () { return true; });

            var result = eaPackageHandler.ValidateExportPackage();
            expect(result).toEqual(true);
        });

    });

    describe("call ValidatePackageName", function () {

        window.popup = window.popup || {};
        window.popup.Alert = $.noop;

        window.Localization = window.Localization || {};

        beforeEach(function () {
            $('<input id="PackageName" type="text">').hide().appendTo('body');
        });

        afterEach(function () {
            $('#PackageName').remove();
        });

        it("should get 'false' if not IsValidPackageName", function () {
            window.Localization.CreateEAPackageInvalidPackageName = '';

            spyOn(window, 'IsValidPackageName').and.callFake(function () { return false; });

            var result = eaPackageHandler.ValidatePackageName();
            expect(result).toEqual(false);
        });

        it("should get 'true' if IsValidPackageName", function () {
            spyOn(window, 'IsValidPackageName').and.callFake(function () { return true; });

            var result = eaPackageHandler.ValidatePackageName();
            expect(result).toEqual(true);
        });

    });

    describe("call ValidatePackageId", function () {

        window.popup = window.popup || {};
        window.popup.Alert = $.noop;

        window.Localization = window.Localization || {};

        beforeEach(function () {
            $('<input id="PackageID" type="text">').hide().appendTo('body');
        });

        afterEach(function () {
            $('#PackageID').remove();
        });

        it("should get 'false' if no package ID", function () {
            window.Localization.ValidationForRequired = '';

            $('#PackageID').val('');

            var result = eaPackageHandler.ValidatePackageId();
            expect(result).toEqual(false);
        });

        it("should get 'false' if not IsValidPackageId", function () {
            window.Localization.Info_InvalidPackageId = '';

            $('#PackageID').val('test');
            spyOn(window, 'IsValidPackageId').and.callFake(function () { return false; });

            var result = eaPackageHandler.ValidatePackageId();
            expect(result).toEqual(false);
        });

        it("should get 'true' if IsValidPackageId", function () {
            window.Localization.Info_InvalidPackageId = '';

            $('#PackageID').val('test');
            spyOn(window, 'IsValidPackageId').and.callFake(function () { return true; });

            var result = eaPackageHandler.ValidatePackageId();
            expect(result).toEqual(true);
        });

    });

    describe("call ValidatePackageVersion", function () {

        window.popup = window.popup || {};
        window.popup.Alert = $.noop;

        window.Localization = window.Localization || {};

        beforeEach(function () {
            $('<input id="PackageVersion" type="text">').hide().appendTo('body');
        });

        afterEach(function () {
            $('#PackageVersion').remove();
        });

        it("should get 'false' if no package version", function () {
            window.Localization.ValidationForRequired = '';

            $('#PackageVersion').val('');

            var result = eaPackageHandler.ValidatePackageVersion();
            expect(result).toEqual(false);
        });

        it("should get 'false' if not IsValidPackageVersion", function () {
            window.Localization.Info_InvalidPackageVersion = '';

            $('#PackageVersion').val('1');
            spyOn(window, 'IsValidPackageVersion').and.callFake(function () { return false; });

            var result = eaPackageHandler.ValidatePackageVersion();
            expect(result).toEqual(false);
        });

        it("should get 'true' if IsValidPackageVersion", function () {
            $('#PackageVersion').val('1');
            spyOn(window, 'IsValidPackageVersion').and.callFake(function () { return true; });

            var result = eaPackageHandler.ValidatePackageVersion();
            expect(result).toEqual(true);
        });

    });

    describe("call ExportAnglePackage", function () {

        it("should call ExportAnglePackageComplete when finished", function () {
            spyOn(eaPackageHandler, 'StartExportProgressBar').and.callFake($.noop);
            spyOn(eaPackageHandler, 'GetExportAnglePackageQuery').and.callFake($.noop);
            spyOn(window, 'CreateDataToWebService').and.callFake(function () {
                return $.when({ uri: '' });
            });
            spyOn(eaPackageHandler, 'ExportAnglePackageSuccess').and.callFake($.noop);
            spyOn(eaPackageHandler, 'ExportAnglePackageFail').and.callFake($.noop);
            spyOn(eaPackageHandler, 'ExportAnglePackageComplete').and.callFake($.noop);

            eaPackageHandler.ExportAnglePackage();
            expect(eaPackageHandler.ExportAnglePackageComplete).toHaveBeenCalled();
        });

        it("should call ExportAnglePackageFail when fail", function () {
            spyOn(eaPackageHandler, 'StartExportProgressBar').and.callFake($.noop);
            spyOn(eaPackageHandler, 'GetExportAnglePackageQuery').and.callFake($.noop);
            spyOn(window, 'CreateDataToWebService').and.callFake(function () {
                var d = $.Deferred();
                d.reject({ responseText: '' });
                return d.promise();
            });
            spyOn(eaPackageHandler, 'ExportAnglePackageSuccess').and.callFake($.noop);
            spyOn(eaPackageHandler, 'ExportAnglePackageFail').and.callFake($.noop);
            spyOn(eaPackageHandler, 'ExportAnglePackageComplete').and.callFake($.noop);

            eaPackageHandler.ExportAnglePackage();
            expect(eaPackageHandler.ExportAnglePackageFail).toHaveBeenCalled();
        });

    });

    describe("call StartExportProgressBar", function () {

        window.progressbarModel = window.progressbarModel || {};
        window.progressbarModel.ShowStartProgressBar = $.noop;
        window.progressbarModel.SetProgressBarText = $.noop;

        window.errorHandlerModel = window.errorHandlerModel || {};
        window.errorHandlerModel.Enable = $.noop;

        it("should call AbortAll if cancel", function () {
            spyOn(WC.Ajax, 'AbortAll').and.callFake($.noop);

            eaPackageHandler.StartExportProgressBar();
            progressbarModel.CancelFunction();
            expect(WC.Ajax.AbortAll).toHaveBeenCalled();
        });

    });

    describe("call GetExportAnglePackageQuery", function () {

        window.searchQueryModel = window.searchQueryModel || {};
        window.searchQueryModel.GetAdvanceSearchQueryFromUri = function () { return ['created=tester']; };

        window.modelsHandler = window.modelsHandler || {};
        window.modelsHandler.GetModelByUri = function () {
            return { id: 'EA2_800' };
        };

        it("should clear 'sort' if relevancy sorting", function () {
            spyOn(WC.Utility, 'UrlParameter').and.callFake(function () {
                return enumHandlers.SEARCHPARAMETER.RELEVANCY;
            });
            spyOn(eaPackageHandler, 'GetPackageName').and.callFake($.noop);

            var result = eaPackageHandler.GetExportAnglePackageQuery(['id1']);
            expect(result.sort).toEqual('');
        });

        it("should not clear 'sort' if other sorting", function () {
            spyOn(WC.Utility, 'UrlParameter').and.callFake(function () {
                return 'xxx';
            });
            spyOn(eaPackageHandler, 'GetPackageName').and.callFake($.noop);

            var result = eaPackageHandler.GetExportAnglePackageQuery(['id1']);
            expect(result.sort).toEqual('xxx');
        });

    });

    describe("call ExportAnglePackageSuccess", function () {

        window.progressbarModel = window.progressbarModel || {};

        it("should call GeneratePackage", function () {
            spyOn(eaPackageHandler, 'GeneratePackage').and.callFake($.noop);

            eaPackageHandler.ExportAnglePackageSuccess('test');
            expect(eaPackageHandler.GeneratePackageUri).toEqual('test');
            expect(eaPackageHandler.GeneratePackage).toHaveBeenCalled();
        });

    });

    describe("call ExportAnglePackageFail", function () {

        window.progressbarModel = window.progressbarModel || {};
        window.progressbarModel.EndProgressBar = $.noop;

        window.popup = window.popup || {};
        window.popup.Alert = $.noop;

        window.searchPageHandler = window.searchPageHandler || {};
        window.searchPageHandler.ClearAllSelectedRows = $.noop;

        it("should call ClearAllSelectedRows", function (done) {
            spyOn(searchPageHandler, 'ClearAllSelectedRows');

            var responseText = JSON.stringify({ message: '' });
            eaPackageHandler.ExportAnglePackageFail(responseText);
            setTimeout(function () {
                expect(searchPageHandler.ClearAllSelectedRows).toHaveBeenCalled();
                done();
            }, 1100);
        });

    });

    describe("call ExportAnglePackageComplete", function () {

        window.errorHandlerModel = window.errorHandlerModel || {};
        window.errorHandlerModel.Enable = $.noop;

        it("should call errorHandlerModel.Enable", function (done) {
            spyOn(errorHandlerModel, 'Enable');

            eaPackageHandler.ExportAnglePackageComplete();
            setTimeout(function () {
                expect(errorHandlerModel.Enable).toHaveBeenCalled();
                done();
            }, 1100);
        });

    });

    describe("call GeneratePackage", function () {

        window.progressbarModel = window.progressbarModel || {};

        it("should call CheckGeneratePackageStatus when IsCancelPopup is 'false'", function () {
            window.progressbarModel.IsCancelPopup = false;
            spyOn(window, 'GetDataFromWebService').and.callFake(function () { return $.when(); });
            spyOn(eaPackageHandler, 'CheckGeneratePackageStatus').and.callFake($.noop);

            eaPackageHandler.GeneratePackage();
            expect(eaPackageHandler.CheckGeneratePackageStatus).toHaveBeenCalled();
        });

        it("should call DeleteDataToWebService when IsCancelPopup is 'true'", function () {
            window.progressbarModel.IsCancelPopup = true;
            spyOn(window, 'DeleteDataToWebService').and.callFake($.noop);

            eaPackageHandler.GeneratePackage();
            expect(window.DeleteDataToWebService).toHaveBeenCalled();
        });

    });

    describe("call CheckGeneratePackageStatus", function () {

        window.progressbarModel = window.progressbarModel || {};
        window.progressbarModel.SetProgressBarText = $.noop;

        window.popup = window.popup || {};
        window.popup.Error = $.noop;

        it("should call DownloadFile when status is ready", function (done) {
            spyOn(WC.Utility, 'DownloadFile').and.callFake($.noop);
            spyOn(eaPackageHandler, 'DoneToGeneratePackage').and.callFake($.noop);

            var response = {
                status: 'ready'
            };
            eaPackageHandler.CheckGeneratePackageStatus(response);
            setTimeout(function () {
                expect(eaPackageHandler.DoneToGeneratePackage).toHaveBeenCalled();
                done();
            }, 2100);
        });

        it("should call DoneToGeneratePackage when status is failed", function () {
            spyOn(eaPackageHandler, 'DoneToGeneratePackage').and.callFake($.noop);

            var response = {
                status: 'failed'
            };
            eaPackageHandler.CheckGeneratePackageStatus(response);
            expect(eaPackageHandler.DoneToGeneratePackage).toHaveBeenCalled();
        });

        it("should call GeneratePackage when status is not ready or failed", function (done) {
            spyOn(eaPackageHandler, 'GeneratePackage').and.callFake($.noop);

            var response = {
                status: 'xxx'
            };
            eaPackageHandler.CheckGeneratePackageStatus(response);
            setTimeout(function () {
                expect(eaPackageHandler.GeneratePackage).toHaveBeenCalled();
                done();
            }, 2100);
        });

    });

    describe("call DoneToGeneratePackage", function () {

        window.progressbarModel = window.progressbarModel || {};
        window.progressbarModel.EndProgressBar = $.noop;

        window.searchPageHandler = window.searchPageHandler || {};
        window.searchPageHandler.ClearAllSelectedRows = $.noop;

        it("should not call DeleteDataToWebService if send 'false'", function () {
            spyOn(window, 'DeleteDataToWebService').and.callFake($.noop);

            eaPackageHandler.DoneToGeneratePackage(false);
            expect(window.DeleteDataToWebService).not.toHaveBeenCalled();
        });

        it("should call DeleteDataToWebService if not send 'false'", function () {
            spyOn(window, 'DeleteDataToWebService').and.callFake($.noop);

            eaPackageHandler.DoneToGeneratePackage();
            expect(window.DeleteDataToWebService).toHaveBeenCalled();
        });

    });

});

