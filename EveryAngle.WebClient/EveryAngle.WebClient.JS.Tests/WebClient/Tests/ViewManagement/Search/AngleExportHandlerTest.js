/// <reference path="/Dependencies/ViewModels/Models/Search/searchmodel.js" />
/// <reference path="/Dependencies/ViewManagement/Search/AngleDownloadHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Search/AngleExportHandler.js" />

describe("AngleExportHandler", function () {

    var angleExportHandler;

    beforeEach(function () {
        angleExportHandler = new AngleExportHandler(new AngleDownloadHandler());
    });

    describe("when create new instance", function () {

        it("should be defined", function () {
            expect(angleExportHandler).toBeDefined();
        });

    });

    describe("call ShowAngleExportPopup", function () {

        window.popup = window.popup || {};
        window.popup.Show = $.noop;

        it("should not call popup.Show method if not ValidateAngleExport", function () {
            spyOn(angleExportHandler, 'GetAngleExportSettings').and.callFake($.noop);
            spyOn(angleExportHandler, 'ValidateAngleExport').and.callFake(function () { return false; });
            spyOn(popup, 'Show');

            angleExportHandler.ShowAngleExportPopup();
            expect(popup.Show).not.toHaveBeenCalled();
        });

        it("should call popup.Show method if ValidateAngleExport", function () {
            spyOn(angleExportHandler, 'GetAngleExportSettings').and.callFake($.noop);
            spyOn(angleExportHandler, 'ValidateAngleExport').and.callFake(function () { return true; });
            spyOn(popup, 'Show');

            angleExportHandler.ShowAngleExportPopup();
            expect(popup.Show).toHaveBeenCalled();
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

    describe("call ValidateAngleExport", function () {

        window.popup = window.popup || {};
        window.popup.Alert = $.noop;
        window.popup.Close = $.noop;

        it("should get 'true' if validated", function () {
            spyOn(angleExportHandler, 'CanAngleExport').and.callFake(function () { return true; });

            var result = angleExportHandler.ValidateAngleExport();
            expect(result).toEqual(true);
        });

        it("should get 'false' if invalidated", function () {
            spyOn(angleExportHandler, 'CanAngleExport').and.callFake(function () { return false; });

            var result = angleExportHandler.ValidateAngleExport();
            expect(result).toEqual(false);
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

    describe("call CanAngleExport", function () {

        it("should get 'true' if searchModel.SelectedItems do not have dashboard", function () {
            searchModel.SelectedItems([]);

            var result = angleExportHandler.CanAngleExport();
            expect(result).toEqual(true);
        });

        it("should get 'false' if searchModel.SelectedItems do not have dashboard", function () {
            searchModel.SelectedItems([{ type: enumHandlers.ITEMTYPE.DASHBOARD }]);

            var result = angleExportHandler.CanAngleExport();
            expect(result).toEqual(false);
        });

    });

    describe("call CanDownloadAngle", function () {

        it("should get 'true'", function () {
            var result = angleExportHandler.CanDownloadAngle();
            expect(result).toEqual(true);
        });

    });

    describe("call GetDownloadAnglesCount", function () {

        it("should call handler StartExportAngle", function () {
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

});

