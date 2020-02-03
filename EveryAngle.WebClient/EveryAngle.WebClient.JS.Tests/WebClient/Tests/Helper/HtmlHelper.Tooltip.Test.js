/// <reference path="/Dependencies/Helper/HtmlHelper.Tooltip.js" />

describe("HtmlHelper.Tooltip test", function () {

    describe(".GetTooltipTextWhenNeeded", function () {

        it("should return the text when text's width is shorter than element's width more than 1 px", function () {
            var text = 'test';
            spyOn(WC.HtmlHelper, 'GetFontCss').and.returnValue({});
            spyOn(WC.Utility, 'MeasureText').and.returnValue(98.9);
            var result = WC.HtmlHelper.Tooltip.GetTooltipTextWhenNeeded({}, text, 100);

            expect(result).toEqual(text);
        });

        it("should return the text when text's width is longer than element's width more than 1 px", function () {
            var text = 'test';
            spyOn(WC.HtmlHelper, 'GetFontCss').and.returnValue({});
            spyOn(WC.Utility, 'MeasureText').and.returnValue(101.1);
            var result = WC.HtmlHelper.Tooltip.GetTooltipTextWhenNeeded({}, text, 100);

            expect(result).toEqual(text);
        });

        it("should return empty string when text's width is shorter than element's width equal 1 px", function () {
            var text = 'test';
            spyOn(WC.HtmlHelper, 'GetFontCss').and.returnValue({});
            spyOn(WC.Utility, 'MeasureText').and.returnValue(99);
            var result = WC.HtmlHelper.Tooltip.GetTooltipTextWhenNeeded({}, text, 100);

            expect(result).toEqual('');
        });

        it("should return empty string when text's width is shorter than element's width less than 1 px", function () {
            var text = 'test';
            spyOn(WC.HtmlHelper, 'GetFontCss').and.returnValue({});
            spyOn(WC.Utility, 'MeasureText').and.returnValue(99.01);
            var result = WC.HtmlHelper.Tooltip.GetTooltipTextWhenNeeded({}, text, 100);

            expect(result).toEqual('');
        });

        it("should return empty string when text's width is longer than element's width equal 1 px", function () {
            var text = 'test';
            spyOn(WC.HtmlHelper, 'GetFontCss').and.returnValue({});
            spyOn(WC.Utility, 'MeasureText').and.returnValue(101);
            var result = WC.HtmlHelper.Tooltip.GetTooltipTextWhenNeeded({}, text, 100);

            expect(result).toEqual('');
        });
         
        it("should return empty string when text's width is longer than element's width less than 1 px", function () {
            var text = 'test';
            spyOn(WC.HtmlHelper, 'GetFontCss').and.returnValue({});
            spyOn(WC.Utility, 'MeasureText').and.returnValue(100.99);
            var result = WC.HtmlHelper.Tooltip.GetTooltipTextWhenNeeded({}, text, 100);

            expect(result).toEqual('');
        });
    });
});