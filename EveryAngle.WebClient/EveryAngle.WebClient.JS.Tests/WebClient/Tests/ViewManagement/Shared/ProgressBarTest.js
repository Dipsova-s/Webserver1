/// <reference path="/Dependencies/ViewManagement/Shared/ProgressBar.js" />

describe("ProgressBar", function () {
    var progressbarModel;

    beforeEach(function () {
        progressbarModel = new ProgressbarModel();
        createMockHandler(window, 'anglePageHandler', { BackToSearch: $.noop });
        createMockHandler(window, 'dashboardPageHandler', { BackToSearch: $.noop });
    });

    afterEach(function () {
        restoreMockHandlers();
    });

    describe(".CloseProgressBarPopup", function () {

        beforeEach(function () {
            spyOn(WC.Ajax, 'AbortAll');
            spyOn(window, 'stop');
            spyOn(document, 'execCommand');
            spyOn(window.history, 'back');
            spyOn(jQuery.fn, 'hide');
            spyOn(progressbarModel, 'IsSearchPage');
            spyOn(anglePageHandler, 'BackToSearch');
            spyOn(dashboardPageHandler, 'BackToSearch');
        });

        it("should call common functions", function () {
            progressbarModel.CloseProgressBarPopup();
            expect(WC.Ajax.AbortAll).toHaveBeenCalled();
            expect(jQuery.fn.hide).toHaveBeenCalled();
        });

        describe("Verify 'Stop' function", function () {

            beforeEach(function () {
                progressbarModel.IsSearchPage.and.returnValue(true);
            });

            it("should stop load page when the current page is search page #1", function () {
                progressbarModel.CloseProgressBarPopup();
                expect(window.stop).toHaveBeenCalled();
            });
            it("should stop load page when the current page is search page #2", function () {
                window.stop = null;
                progressbarModel.CloseProgressBarPopup();
                expect(document.execCommand).toHaveBeenCalled();
            });

        });

        describe("Verify 'BackToSearch' function", function () {

            beforeEach(function () {
                progressbarModel.ReferenceUri = 'redirect=/x/1/y/1';
            });

            it("should call BackToSeach function from AnglePageHandler", function () {
                progressbarModel.CloseProgressBarPopup();
                expect(anglePageHandler.BackToSearch).toHaveBeenCalled();
            });
            it("should call BackToSeach function from DashboardPageHandler", function () {
                delete window.anglePageHandler;
                progressbarModel.CloseProgressBarPopup();
                expect(dashboardPageHandler.BackToSearch).toHaveBeenCalled();
            });
        });

    });

    describe(".ShowStartProgressBar", function () {

        beforeEach(function () {
            spyOn(jQuery.fn, 'off').and.callFake(function () {
                return { on: jQuery.noop };
            });
            spyOn(jQuery.fn, 'removeClass');
            spyOn(jQuery.fn, 'show');
            spyOn(progressbarModel, 'SetProgressBarText');
            spyOn(progressbarModel, 'UpdateZIndex');

            progressbarModel.ShowStartProgressBar();
        });

        it("should reset configurations", function () {
            expect(progressbarModel.CancelCustomHandler).toEqual(false);
            expect(progressbarModel.CancelForceStop).toEqual(false);
            expect(progressbarModel.IsEndProgressBar).toEqual(false);
            expect(progressbarModel.CancelFunction).toEqual(jQuery.noop);
        });
        it("should unbind click event", function () {
            expect(jQuery.fn.off).toHaveBeenCalled();
        });
        it("should remove classname alwaysHide", function () {
            expect(jQuery.fn.removeClass).toHaveBeenCalled();
        });
        it("should update z-index", function () {
            expect(progressbarModel.UpdateZIndex).toHaveBeenCalled();
        });
        it("should reset progressbar text", function () {
            expect(progressbarModel.SetProgressBarText).toHaveBeenCalled();
        });
        it("should show loading element", function () {
            expect(jQuery.fn.show).toHaveBeenCalled();
        });
    });

    describe(".UpdateZIndex", function () {

        beforeEach(function () {
            jQuery([
                '<div class="container">',
                    '<div class="k-window"></div>',
                    '<div class="loader-container"></div>',
                '</div>'
            ].join('')).appendTo('body');
        });

        afterEach(function () {
            jQuery('.container').remove();
        });

        it("should update z-index when it has k-window at least 1", function () {
            progressbarModel.UpdateZIndex();
            expect(jQuery('.loader-container').attr('style').indexOf('10002') !== -1).toEqual(true);
        });

    });

    describe(".EndProgressBar", function () {

        beforeEach(function () {
            progressbarModel.IsEndProgressBar = false;
            spyOn(progressbarModel, 'CloseProgressBarPopup');
            progressbarModel.EndProgressBar();
        });

        it("should change IsEndProgresBar to true", function () {
            expect(progressbarModel.IsEndProgressBar).toEqual(true);
        });
        it("should call CloseProgressBarPopup function", function () {
            expect(progressbarModel.CloseProgressBarPopup).toHaveBeenCalled();
        });

    });

    describe(".GetPercentageValue", function () {

        it("should return zero when pass non-numeric value", function () {
            var result = progressbarModel.GetPercentageValue('test');
            expect(result).toEqual(0);
        });
        it("should correct value when pass numeric value", function () {
            var result = progressbarModel.GetPercentageValue(100);
            expect(result).toEqual(100);
        });
        it("should get 25 when input 25.04", function () {
            var result = progressbarModel.GetPercentageValue(25.04);
            expect(result).toBe(25);
        });

    });

    describe(".SetProgressBarText", function () {

        beforeEach(function () {
            spyOn(jQuery.fn, 'hide');
            spyOn(jQuery.fn, 'show');
            spyOn(jQuery.fn, 'text');
        });

        it("should show loading with progres bar when pass value", function () {
            progressbarModel.SetProgressBarText(100);
            expect(jQuery.fn.show).toHaveBeenCalled();
        });
        it("should hide loading with progres bar when not pass value", function () {
            progressbarModel.SetProgressBarText();
            expect(jQuery.fn.hide).toHaveBeenCalled();
        });

    });

    describe(".CancelProgressBar", function () {

        beforeEach(function () {
            spyOn(progressbarModel, 'EnableControl');
            spyOn(progressbarModel, 'CloseProgressBarPopup');
        });

        it("should call CloseProgressBarPopup function when it has no class alwaysHide and CancelFunction has return false value", function () {
            spyOn(jQuery.fn, 'hasClass').and.callFake(function () { return false; });
            spyOn(progressbarModel, 'CancelFunction').and.callFake(function () { return false; });
            progressbarModel.CancelProgressBar();

            expect(progressbarModel.CloseProgressBarPopup).toHaveBeenCalled();
        });

        it("should call CloseProgressBarPopup function when it has no class alwaysHide and CancelFunction has return true value", function () {
            spyOn(jQuery.fn, 'hasClass').and.callFake(function () { return true; });
            spyOn(progressbarModel, 'CancelFunction').and.callFake(function () { return true; });
            progressbarModel.CancelProgressBar();

            expect(progressbarModel.CloseProgressBarPopup).not.toHaveBeenCalled();
        });

    });
    
});
