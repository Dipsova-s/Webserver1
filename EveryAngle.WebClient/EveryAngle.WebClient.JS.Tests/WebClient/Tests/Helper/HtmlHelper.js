describe("HtmlHelper", function () {

    describe(".AdjustToolbar", function () {
        beforeEach(function () {
            // prepare html
            $([
                '<div class="toolbar" style="width: 500px;">',
                    '<div class="col-break"></div>',
                    '<div class="form-col col-1">1</div>',
                    '<div class="form-col col-2">2</div>',
                    '<div class="form-col col-3">3</div>',
                    '<div class="form-col col-4">4</div>',
                    '<div class="form-col col-5">5</div>',
                '</div>'
            ].join('')).appendTo('body');
        });

        afterEach(function () {
            $('.toolbar').remove();
        });

        it("should show col-break", function () {
            $('.toolbar .form-col').width(100);
            WC.HtmlHelper.AdjustToolbar();

            expect($('.toolbar .col-break').hasClass('hidden')).toEqual(false);
        });

        it("should hide col-break", function () {
            $('.toolbar .form-col').width(50);
            WC.HtmlHelper.AdjustToolbar();

            expect($('.toolbar .col-break').hasClass('hidden')).toEqual(true);
        });
    });

});
