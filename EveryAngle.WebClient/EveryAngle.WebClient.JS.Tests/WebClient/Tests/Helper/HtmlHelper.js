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

    describe(".DestroyNumericIfExists", function () {
        it("should remove numerictextbox when numerictextbox is already created", function () {

            var origin = {
                insertAfter: $.noop
            };

            var numeric = {
                element: {
                    show: $.noop
                },
                wrapper: {
                    remove: $.noop
                },
                destroy: $.noop
            };
            spyOn(numeric.element, 'show').and.returnValue(origin);
            spyOn(numeric.wrapper, 'remove');
            spyOn(numeric, 'destroy');
            spyOn($.fn, 'data').and.returnValue(numeric);

            WC.HtmlHelper.DestroyNumericIfExists('#id');

            expect(numeric.destroy).toHaveBeenCalled();
            expect(numeric.wrapper.remove).toHaveBeenCalled();
        });
    });

});
