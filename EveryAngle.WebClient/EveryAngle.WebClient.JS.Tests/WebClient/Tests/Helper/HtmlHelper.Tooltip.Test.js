/// <reference path="/Dependencies/Helper/HtmlHelper.Tooltip.js" />

describe("HtmlHelper.Tooltip test", function () {

    describe(".GetTooltipTextWhenNeeded", function () {

        it("should return empty tooltip when element's width is longer than text's width", function () {
            var text = 'test';
            var elementWidth = 100;
            var textWidth = 99;
            spyOn(WC.HtmlHelper, 'GetFontCss').and.returnValue({});
            spyOn(WC.Utility, 'MeasureText').and.returnValue(textWidth);
            var result = WC.HtmlHelper.Tooltip.GetTooltipTextWhenNeeded({}, text, elementWidth);

            expect(result).toEqual('');
        });

        it("should return empty tooltip when element's width is shorter than text's width 1px", function () {
            var text = 'test';
            var elementWidth = 100;
            var textWidth = 101;
            spyOn(WC.HtmlHelper, 'GetFontCss').and.returnValue({});
            spyOn(WC.Utility, 'MeasureText').and.returnValue(textWidth);
            var result = WC.HtmlHelper.Tooltip.GetTooltipTextWhenNeeded({}, text, elementWidth);

            expect(result).toEqual('');
        });

        it("should return tooltip when element's width is shorter than text's width > 1px", function () {
            var text = 'test';
            var elementWidth = 100;
            var textWidth = 101.1;
            spyOn(WC.HtmlHelper, 'GetFontCss').and.returnValue({});
            spyOn(WC.Utility, 'MeasureText').and.returnValue(textWidth);
            var result = WC.HtmlHelper.Tooltip.GetTooltipTextWhenNeeded({}, text, elementWidth);

            expect(result).toEqual(text);
        });
    });
});