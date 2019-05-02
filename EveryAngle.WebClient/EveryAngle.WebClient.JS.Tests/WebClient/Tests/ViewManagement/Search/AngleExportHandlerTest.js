﻿/// <reference path="/Dependencies/ViewModels/Models/Search/searchmodel.js" />
/// <reference path="/Dependencies/ViewManagement/Search/AngleDownloadHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Search/EAPackageHandler.js" />
/// <reference path="/Dependencies/Helper/EnumHandlers.js" />
/// <reference path="/Dependencies/ViewManagement/Search/AngleExportHandler.js" />

describe("AngleExportHandler", function () {

    var angleExportHandler;

    beforeEach(function () {
        angleExportHandler = new AngleExportHandler(new AngleDownloadHandler(), new EAPackageHandler());
    });

    describe("call OnChangeAngleExportType", function () {

        it("should set EAPackageHandler if newValue is package", function () {
            angleExportHandler.AngleExportType(angleExportHandler.ANGLEEXPORTTYPE.DOWNLOAD);

            angleExportHandler.OnChangeAngleExportType(angleExportHandler.ANGLEEXPORTTYPE.PACKAGE);
            expect(angleExportHandler.Handler() instanceof EAPackageHandler).toEqual(true);
        });

        it("should set AngleDownloadHandler if newValue is download", function () {
            angleExportHandler.AngleExportType(angleExportHandler.ANGLEEXPORTTYPE.DOWNLOAD);

            angleExportHandler.OnChangeAngleExportType(angleExportHandler.ANGLEEXPORTTYPE.DOWNLOAD);
            expect(angleExportHandler.Handler() instanceof AngleDownloadHandler).toEqual(true);
        });

    });

    describe("call ShowAngleExportPopupCallback", function () {

        it("should call ApplyHandler method", function () {
            spyOn(angleExportHandler, 'InitialHandler').and.callFake($.noop);
            spyOn(angleExportHandler, 'ApplyHandler').and.callFake($.noop);

            angleExportHandler.ShowAngleExportPopupCallback({});
            expect(angleExportHandler.ApplyHandler).toHaveBeenCalled();
        });

    });

    describe("call InitialHandler", function () {

        window.userModel = window.userModel || {};
        window.userModel.IsPossibleToHaveManagementAccess = $.noop;

        it("should set AngleExportType = 'download'", function () {
            var e = {
                sender: {
                    element: $()
                }
            };
            angleExportHandler.InitialHandler(e);
            expect(angleExportHandler.AngleExportType()).toEqual(angleExportHandler.ANGLEEXPORTTYPE.DONWLOAD);
        });

    });

    describe("call GetRowExportTypeCss", function () {

        window.popup = window.popup || {};
        window.popup.Alert = $.noop;
        window.popup.Close = $.noop;

        it("should get 'rowExportTypePackage' if select type is angle", function () {
            spyOn(angleExportHandler, 'SelectType').and.callFake(function () { return angleExportHandler.SELECTTYPE.ANGLE; });

            var result = angleExportHandler.GetRowExportTypeCss();
            expect(result).toEqual('rowExportTypePackage');
        });

        it("should get '' if select type is dashboard", function () {
            spyOn(angleExportHandler, 'SelectType').and.callFake(function () { return angleExportHandler.SELECTTYPE.DASHBOARD; });

            var result = angleExportHandler.GetRowExportTypeCss();
            expect(result).toEqual('');
        });

        it("should get '' if select type is both angle and dashboard", function () {
            spyOn(angleExportHandler, 'SelectType').and.callFake(function () { return angleExportHandler.SELECTTYPE.BOTH; });

            var result = angleExportHandler.GetRowExportTypeCss();
            expect(result).toEqual('');
        });

    });

    describe("call ApplyHandler", function () {

        it("should call WC.HtmlHelper.ApplyKnockout method", function () {
            $('<input id="PackageName">').hide().appendTo('body');
            spyOn(WC.HtmlHelper, 'ApplyKnockout').and.callFake($.noop);

            var e = {
                sender: {
                    wrapper: $(),
                    element: $()
                }
            };
            angleExportHandler.ApplyHandler(e);
            jQuery('#PackageName').trigger('change');
            expect(WC.HtmlHelper.ApplyKnockout).toHaveBeenCalled();

            $('#PackageName').remove();
        });

    });

    describe("call GetAngleExportSettings", function () {

        it("should get settings", function () {
            window.angleExportHtmlTemplate = $.noop;
            var result = angleExportHandler.GetAngleExportSettings();
            expect(result).toBeDefined();
        });

    });

    describe("call GetAngleExportButtons", function () {

        it("should get buttons", function () {
            var result = angleExportHandler.GetAngleExportButtons();
            expect(result).toBeDefined();
        });

    });

    describe("call SubmitAngleExport", function () {

        window.popup = window.popup || {};
        window.popup.CanButtonExecute = $.noop;

        it("should not call StartExportAngle method if cannot be executed", function () {
            spyOn(popup, 'CanButtonExecute').and.callFake(function () { return false; });
            spyOn(angleExportHandler, 'StartExportAngle').and.callFake($.noop);

            angleExportHandler.SubmitAngleExport({}, $());
            expect(angleExportHandler.StartExportAngle).not.toHaveBeenCalled();
        });

        it("should call StartExportAngle method if can be executed", function () {
            spyOn(popup, 'CanButtonExecute').and.callFake(function () { return true; });
            spyOn(angleExportHandler, 'StartExportAngle').and.callFake($.noop);

            angleExportHandler.SubmitAngleExport({}, $());
            expect(angleExportHandler.StartExportAngle).toHaveBeenCalled();
        });

    });

    describe("call CloseAngleExportPopup", function () {

        window.popup = window.popup || {};
        window.popup.Close = $.noop;

        it("should call popup.Close method", function () {
            spyOn(popup, 'Close').and.callFake($.noop);

            angleExportHandler.CloseAngleExportPopup();
            expect(popup.Close).toHaveBeenCalled();
        });

    });

    describe("call GetAllWarningMessages", function () {

        beforeEach(function () {
            angleExportHandler.AngleExportType(angleExportHandler.ANGLEEXPORTTYPE.DONWLOAD);
            angleExportHandler.Handler().GetWarningMessage = function () { return 'message1'; };

            angleExportHandler.AngleExportType(angleExportHandler.ANGLEEXPORTTYPE.PACKAGE);
            angleExportHandler.Handler().GetWarningMessage = function () { return 'message2'; };
        });

        it("should show messages from download and package if package is visible", function () {
            spyOn(angleExportHandler, 'IsPackageVisible').and.callFake(function () { return true; });

            var result = angleExportHandler.GetAllWarningMessages();
            expect(result).toEqual('message1message2');
        });

        it("should show messages from download if package is not visible", function () {
            spyOn(angleExportHandler, 'IsPackageVisible').and.callFake(function () { return false; });

            var result = angleExportHandler.GetAllWarningMessages();
            expect(result).toEqual('message1');
        });

    });

    describe("call CheckIsAllSameModel", function () {

        it("should get 'true' when all model in items are same", function () {
            var items = [
                { model: "model_a" },
                { model: "model_a" },
                { model: "model_a" }
            ];

            var result = angleExportHandler.CheckIsAllSameModel(items);
            expect(result).toEqual(true);
        });

        it("should get 'false' when all model in items are not all same", function () {
            var items = [
                { model: "model_a" },
                { model: "model_a" },
                { model: "model_b" }
            ];

            var result = angleExportHandler.CheckIsAllSameModel(items);
            expect(result).toEqual(false);
        });

    });

    describe("call CanDownloadAngle", function () {

        it("should get 'true'", function () {
            var result = angleExportHandler.CanDownloadAngle();
            expect(result).toEqual(true);
        });

    });

    describe("call CanExportPackage", function () {

        beforeEach(function () {
            angleExportHandler.AngleExportType(angleExportHandler.ANGLEEXPORTTYPE.PACKAGE);
            angleExportHandler.IsPackageVisible = function () { return true; };
            angleExportHandler.Handler().GetWarningMessage = function () { return ''; };
        });

        it("should get 'false' when selected items are not same model", function () {
            angleExportHandler.IsAllSameModel = function () { return false; };

            var result = angleExportHandler.CanExportPackage();
            expect(result).toEqual(false);
        });

        it("should get 'false' when selected items are not all publish", function () {
            angleExportHandler.IsAllPublish = function () { return false; };
            
            var result = angleExportHandler.CanExportPackage();
            expect(result).toEqual(false);
        });

        it("should get 'false' when user has no manage access privilege", function () {
            angleExportHandler.IsPackageVisible = function () { return false; };

            var result = angleExportHandler.CanExportPackage();
            expect(result).toEqual(false);
        });

        it("should get 'true' when selected items are not something wrong", function () {
            angleExportHandler.IsAllSameModel = function () { return true; };
            angleExportHandler.IsAllPublish = function () { return true; };
            angleExportHandler.IsPackageVisible = function () { return true; };

            var result = angleExportHandler.CanExportPackage();
            expect(result).toEqual(true);
        });

    });

    describe("call GetDownloadAnglesCount", function () {

        it("should call handler StartExportAngle", function () {
            angleExportHandler.AngleExportType(angleExportHandler.ANGLEEXPORTTYPE.DOWNLOAD);
            angleExportHandler.Handler().SelectedItems = [{}, {}];

            var result = angleExportHandler.GetDownloadAnglesCount();
            expect(result).toEqual(2);
        });

    });

    describe("call StartExportAngle", function () {

        it("should call handler StartExportAngle", function () {
            spyOn(angleExportHandler.Handler(), 'StartExportAngle').and.callFake($.noop);

            angleExportHandler.StartExportAngle();
            expect(angleExportHandler.Handler().StartExportAngle).toHaveBeenCalled();
        });

    });

    describe("call SetSelectTypeByItems", function () {

        it("should set SelectType to Dashboard when every item's type is dashboard ", function () {

            var items = [
                { type: enumHandlers.ITEMTYPE.DASHBOARD },
                { type: enumHandlers.ITEMTYPE.DASHBOARD },
                { type: enumHandlers.ITEMTYPE.DASHBOARD }
            ];

            angleExportHandler.SetSelectTypeByItems(items);
            expect(angleExportHandler.SelectType()).toEqual(angleExportHandler.SELECTTYPE.DASHBOARD);
        });

        it("should set SelectType to Angle when every item's type is angle ", function () {

            var items = [
                { type: enumHandlers.ITEMTYPE.ANGLE },
                { type: enumHandlers.ITEMTYPE.ANGLE },
                { type: enumHandlers.ITEMTYPE.ANGLE }
            ];

            angleExportHandler.SetSelectTypeByItems(items);
            expect(angleExportHandler.SelectType()).toEqual(angleExportHandler.SELECTTYPE.ANGLE);
        });

        it("should set SelectType to Both when every item's type are angle and dashboard", function () {

            var items = [
                { type: enumHandlers.ITEMTYPE.ANGLE },
                { type: enumHandlers.ITEMTYPE.DASHBOARD },
                { type: enumHandlers.ITEMTYPE.ANGLE }
            ];

            angleExportHandler.SetSelectTypeByItems(items);
            expect(angleExportHandler.SelectType()).toEqual(angleExportHandler.SELECTTYPE.BOTH);
        });


    });

    describe("call IsDownloadable", function () {

        it("should has no warning or error messages when Dashboards are ok", function () {
            var result = angleExportHandler.IsDownloadable(angleExportHandler.SELECTTYPE.DASHBOARD, true, true, true);
            expect(result).toEqual(true);
            expect(angleExportHandler.AngleExportType(angleExportHandler.ANGLEEXPORTTYPE.PACKAGE));
        });

        it("should has no warning or error messages when Angles are ok", function () {
            var result = angleExportHandler.IsDownloadable(angleExportHandler.SELECTTYPE.ANGLE, true, true, true);
            expect(result).toEqual(true);
            expect(angleExportHandler.AngleExportType(angleExportHandler.ANGLEEXPORTTYPE.DOWNLOAD));
        });

        it("should has no warning or error messages when Both are ok", function () {
            var result = angleExportHandler.IsDownloadable(angleExportHandler.SELECTTYPE.BOTH, true, true, true);
            expect(result).toEqual(true);
            expect(angleExportHandler.AngleExportType(angleExportHandler.ANGLEEXPORTTYPE.PACKAGE));
        });

        it("should show error message when Dashboard has multi model", function () {
            var result = angleExportHandler.IsDownloadable(angleExportHandler.SELECTTYPE.DASHBOARD, false, true, true);
            expect(result).toEqual(false);
        });

        it("should show error message when Dashboard is not published", function () {
            var result = angleExportHandler.IsDownloadable(angleExportHandler.SELECTTYPE.DASHBOARD, true, false, true);
            expect(result).toEqual(false);
        });

        it("should show error message when Dashboard has no privilege", function () {
            var result = angleExportHandler.IsDownloadable(angleExportHandler.SELECTTYPE.DASHBOARD, true, true, false);
            expect(result).toEqual(false);
        });

        it("show show warning message when Angle has multi model", function () {
            var result = angleExportHandler.IsDownloadable(angleExportHandler.SELECTTYPE.ANGLE, false, true, true);
            expect(result).toEqual(true);
            expect(angleExportHandler.WarningTitle()).not.toBeNull();
            expect(angleExportHandler.WarningTitle()).not.toEqual('');
            expect(angleExportHandler.AngleExportType(angleExportHandler.ANGLEEXPORTTYPE.DOWNLOAD));
        });

        it("show show warning message when Angle is not published", function () {
            var result = angleExportHandler.IsDownloadable(angleExportHandler.SELECTTYPE.ANGLE, true, false, true);
            expect(result).toEqual(true);
            expect(angleExportHandler.WarningTitle()).not.toBeNull();
            expect(angleExportHandler.WarningTitle()).not.toEqual('');
            expect(angleExportHandler.AngleExportType(angleExportHandler.ANGLEEXPORTTYPE.DOWNLOAD));
        });

        it("show show warning message when Angle has no privilege", function () {
            var result = angleExportHandler.IsDownloadable(angleExportHandler.SELECTTYPE.ANGLE, true, true, false);
            expect(result).toEqual(true);
            expect(angleExportHandler.WarningTitle()).not.toBeNull();
            expect(angleExportHandler.WarningTitle()).not.toEqual('');
            expect(angleExportHandler.AngleExportType(angleExportHandler.ANGLEEXPORTTYPE.DOWNLOAD));
        });

        it("show show warning message when Both has multi model", function () {
            var result = angleExportHandler.IsDownloadable(angleExportHandler.SELECTTYPE.BOTH, false, true, true);
            expect(result).toEqual(false);
        });

        it("show show warning message when Both is not published", function () {
            var result = angleExportHandler.IsDownloadable(angleExportHandler.SELECTTYPE.BOTH, true, false, true);
            expect(result).toEqual(true);
            expect(angleExportHandler.WarningTitle()).not.toBeNull();
            expect(angleExportHandler.WarningTitle()).not.toEqual('');
            expect(angleExportHandler.AngleExportType(angleExportHandler.ANGLEEXPORTTYPE.DOWNLOAD));
        });

        it("should show error message when Both has no privilege", function () {
            var result = angleExportHandler.IsDownloadable(angleExportHandler.SELECTTYPE.BOTH, true, true, false);
            expect(result).toEqual(false);
        });

    });

});

