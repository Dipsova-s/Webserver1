/// <chutzpah_reference path="/../../Dependencies/custom/MC.ui.loading.js" />

describe("MC.ui.loading.js", function () {

    var loadingTest;
    beforeEach(function () {
        jQuery([
            '<div id="LoaderContainer">',
                '<div class="loader-container">',
                    '<div class="loader-percentage"></div>',
                '</div>',
                '<div class="loader-message"></div>',
            '</div>'
        ].join('')).appendTo('body');

        loadingTest = jQuery.extend({}, MC.ui.loading);
    });

    afterEach(function () {
        jQuery(loadingTest.loader).remove();
    });

    describe(".init", function () {

        beforeEach(function () {
            spyOn(MC, 'addPageReadyFunction');
            loadingTest.init();
        });

        it("should inject setup function to page ready event", function () {
            expect(MC.addPageReadyFunction).toHaveBeenCalled();
        });

    });

    describe(".setup", function () {

        beforeEach(function () {
            spyOn(jQuery.fn, 'click');
            loadingTest.setup();
        });

        it("should add event click to loader close button", function () {
            expect(jQuery.fn.click).toHaveBeenCalled();
        });
        it("should set loading type as a normal by default", function () {
            expect(loadingTest.type).toEqual(loadingTest.TYPE.normal);
        });

    });

    describe(".setError", function () {

        beforeEach(function () {
            spyOn(loadingTest, 'setLoader');
            spyOn(jQuery.fn, 'html');
            loadingTest.setError('message');
        });

        it("should set loading type as an error", function () {
            expect(loadingTest.type).toEqual(loadingTest.TYPE.error);
        });
        it("should call setLoader function", function () {
            expect(loadingTest.setLoader).toHaveBeenCalled();
        });
        it("should set message to element as html", function () {
            expect(jQuery.fn.html).toHaveBeenCalled();
        });
        
    });

    describe(".setInfo", function () {

        beforeEach(function () {
            spyOn(loadingTest, 'setLoader');
            spyOn(jQuery.fn, 'html');
            loadingTest.setInfo('message');
        });

        it("should set loading type as a info", function () {
            expect(loadingTest.type).toEqual(loadingTest.TYPE.info);
        });
        it("should call setLoader function", function () {
            expect(loadingTest.setLoader).toHaveBeenCalled();
        });
        it("should set message to element as html", function () {
            expect(jQuery.fn.html).toHaveBeenCalled();
        });

    });

    describe(".setLoader", function () {

        beforeEach(function () {
            loadingTest.setLoader('typeInfo');
        });

        it("should set classname to message container", function () {
            expect(jQuery(loadingTest.loaderMessageContainer).hasClass('typeInfo')).toEqual(true);
        });
        it("should show message container", function () {
            expect(jQuery(loadingTest.loaderMessageContainer).is(':visible')).toEqual(true);
        });
        it("should hide loading container", function () {
            expect(jQuery(loadingTest.loaderSpinnerContainer).is(':hidden')).toEqual(true);
        });

    });

    describe(".setUpload", function () {

        beforeEach(function () {
            var mockHttpReqest = {};
            spyOn(jQuery.fn, 'off').and.callFake(function () {
                return { one: jQuery.noop };
            });
            spyOn(jQuery.fn, 'on');
            spyOn(loadingTest, 'setUploadStatus');
            loadingTest.setUpload(mockHttpReqest);
        });

        it("should set loading type as a upload", function () {
            expect(loadingTest.type).toEqual(loadingTest.TYPE.upload);
        });
        it("should update percentage value", function () {
            expect(loadingTest.setUploadStatus).toHaveBeenCalled();
        });

    });

    describe(".setUploadStatus", function () {

        beforeEach(function () {
            loadingTest.setUploadStatus(10);
        });

        it("should update percentage text", function () {
            expect(jQuery(loadingTest.loaderPercentage).text()).toEqual('10%');
        });

    });

    describe(".clearUpload", function () {

        beforeEach(function () {
            spyOn(jQuery.fn, 'off');
            spyOn(loadingTest, 'hide');
            loadingTest.clearUpload();
        });

        it("should change loading type to normal", function () {
            expect(loadingTest.type).toEqual(loadingTest.TYPE.normal);
        });
        it("should call hide function", function () {
            expect(loadingTest.hide).toHaveBeenCalled();
        });

    });

    describe(".show", function () {

        describe("When type is error", function () {
            beforeEach(function () {
                spyOn(jQuery.fn, 'show');
                loadingTest.type = loadingTest.TYPE.error;
                loadingTest.show();
            });

            it("should not show loader container", function () {
                expect(jQuery.fn.show).not.toHaveBeenCalled();
            });
        });

        describe("When type is not error", function () {
            beforeEach(function () {
                spyOn(jQuery.fn, 'show');
                spyOn(jQuery.fn, 'hide');
                loadingTest.show();
            });

            it("should show loader container", function () {
                expect(jQuery.fn.show).toHaveBeenCalled();
            });
        });

    });

    describe(".showAndHide", function () {

        beforeEach(function () {
            jasmine.clock().install();
            spyOn(loadingTest, 'show');
            spyOn(loadingTest, 'hide');
            loadingTest.showAndHide();
        });

        afterEach(function () {
            jasmine.clock().uninstall();
        });

        it("should call hide function after 500 ms", function () {
            jasmine.clock().tick(501);
            expect(loadingTest.hide).toHaveBeenCalled();
        });

    });

    describe(".hide", function () {

        beforeEach(function () {
            spyOn(jQuery.fn, 'hide');
            spyOn(jQuery.fn, 'text');
            spyOn(jQuery.fn, 'off');
            spyOn(jQuery.fn, 'removeClass');
            loadingTest.type = loadingTest.TYPE.normal;
            loadingTest.handleByUser = false;
        });

        it("should not hide when type is upload", function () {
            loadingTest.type = loadingTest.TYPE.upload;
            loadingTest.hide();
            expect(jQuery.fn.hide).not.toHaveBeenCalled();
        });

        it("should not hide when type is error", function () {
            loadingTest.type = loadingTest.TYPE.error;
            loadingTest.hide();
            expect(jQuery.fn.hide).not.toHaveBeenCalled();
        });

        it("should not hide when handleByUser is true", function () {
            loadingTest.handleByUser = true;
            loadingTest.hide();
            expect(jQuery.fn.hide).not.toHaveBeenCalled();
        });

        it("should hide when force parameter is true", function () {
            loadingTest.type = loadingTest.TYPE.error;
            loadingTest.hide(true);
            expect(jQuery.fn.hide).toHaveBeenCalled();
        });

    });

    describe(".disableLoaderSpinner", function () {
        it("should has classname alwaysHidden", function () {
            loadingTest.disableLoaderSpinner();
            expect(jQuery(loadingTest.loaderSpinnerContainer).hasClass('alwaysHidden')).toEqual(true);
        });
    });

    describe(".disableLoaderMessage", function () {
        it("should has classname alwaysHidden", function () {
            loadingTest.disableLoaderMessage();
            expect(jQuery(loadingTest.loaderMessageContainer).hasClass('alwaysHidden')).toEqual(true);
        });
    });

});
