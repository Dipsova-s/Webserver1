/// <chutzpah_reference path="/../../Dependencies/Helper/HtmlHelper.Overlay.js" />

describe("HtmlHelper.Overlay", function () {
    describe(".Create", function () {
        beforeEach(function () {
            $('<div class="block-overlay"/>').appendTo('body');
            spyOn($.fn, 'addClass');
            spyOn($.fn, 'on').and.returnValue($());
            spyOn($.fn, 'off').and.returnValue($());
            spyOn($.fn, 'appendTo');
        });
        afterEach(function () {
            $('.block-overlay').remove();
        });
        it("should set events and create overlay", function () {
            $('.block-overlay').remove();
            WC.HtmlHelper.Overlay.Create($());

            // assert
            expect($.fn.addClass).toHaveBeenCalledWith('block-overlay-scrollable');
            expect($.fn.on).toHaveBeenCalledTimes(3);
            expect($.fn.off).toHaveBeenCalledTimes(3);
            expect($.fn.appendTo).toHaveBeenCalledTimes(4);
        });
        it("should set events but create overlay", function () {
            WC.HtmlHelper.Overlay.Create($());

            // assert
            expect($.fn.addClass).toHaveBeenCalledWith('block-overlay-scrollable');
            expect($.fn.on).toHaveBeenCalledTimes(2);
            expect($.fn.off).toHaveBeenCalledTimes(2);
            expect($.fn.appendTo).not.toHaveBeenCalled();
        });
    });
    describe(".Resize", function () {
        it("should update overlay", function () {
            spyOn(WC.HtmlHelper.Overlay, 'Update');
            WC.HtmlHelper.Overlay.Resize();

            // assert
            expect(WC.HtmlHelper.Overlay.Update).toHaveBeenCalled();
        });
    });
    describe(".Scroll", function () {
        var e;
        beforeEach(function () {
            e = {
                preventDefault: $.noop,
                stopPropagation: $.noop
            };
            spyOn(e, 'preventDefault');
            spyOn(e, 'stopPropagation');
            spyOn(WC.HtmlHelper.Overlay, 'Update');
        });
        it("should not scroll (hidden)", function () {
            WC.HtmlHelper.Overlay.Scroll(e);

            // assert
            expect(WC.HtmlHelper.Overlay.Update).not.toHaveBeenCalled();
        });
        it("should scroll and update overlay", function () {
            spyOn($.fn, 'is').and.returnValue(true);
            spyOn($.fn, 'data').and.returnValue($());
            spyOn($.fn, 'scrollTop').and.returnValue(20);
            spyOn(Array.prototype, 'sum').and.returnValue(30);
            spyOn($.fn, 'outerHeight').and.returnValue(100);
            WC.HtmlHelper.Overlay.Scroll(e);

            // assert
            expect(e.preventDefault).not.toHaveBeenCalled();
            expect(e.stopPropagation).not.toHaveBeenCalled();
            expect(WC.HtmlHelper.Overlay.Update).toHaveBeenCalled();
        });
        it("should stop scrolling down", function () {
            spyOn($.fn, 'is').and.returnValue(true);
            spyOn($.fn, 'data').and.returnValue($());
            spyOn($.fn, 'scrollTop').and.returnValue(20);
            spyOn(Array.prototype, 'sum').and.returnValue(10);
            spyOn($.fn, 'outerHeight').and.returnValue(100);
            WC.HtmlHelper.Overlay.Scroll(e);

            // assert
            expect($.fn.scrollTop).toHaveBeenCalledWith(10);
            expect(e.preventDefault).toHaveBeenCalled();
            expect(e.stopPropagation).toHaveBeenCalled();
            expect(WC.HtmlHelper.Overlay.Update).not.toHaveBeenCalled();
        });
        it("should stop scrolling up", function () {
            spyOn($.fn, 'is').and.returnValue(true);
            spyOn($.fn, 'data').and.returnValue($());
            spyOn($.fn, 'scrollTop').and.returnValue(-20);
            spyOn(Array.prototype, 'sum').and.returnValue(110);
            spyOn($.fn, 'outerHeight').and.returnValue(100);
            WC.HtmlHelper.Overlay.Scroll(e);

            // assert
            expect($.fn.scrollTop).toHaveBeenCalledWith(110);
            expect(e.preventDefault).toHaveBeenCalled();
            expect(e.stopPropagation).toHaveBeenCalled();
            expect(WC.HtmlHelper.Overlay.Update).not.toHaveBeenCalled();
        });
    });
});