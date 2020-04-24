/// <reference path="/Dependencies/Helper/HtmlHelper.Tab.js" />

describe("HtmlHelper.Tab", function () {

    beforeEach(function () {
        // prepare html
        $([
            '<div class="tab" id="Tab">',
                '<div class="tab-menu-wrapper">',
                    '<div class="tab-menu">Tab 1</div>',
                    '<div class="tab-menu">Tab 2</div>',
                    '<div class="tab-menu">Tab 3</div>',
                '</div>',
                '<div class="tab-content-wrapper">',
                    '<div class="tab-content">Tab 1</div>',
                    '<div class="tab-content">Tab 2</div>',
                    '<div class="tab-content">Tab 3</div>',
                '</div>',
            '</div>'
        ].join('')).appendTo('body');

        $.fn.scrollbar = $.noop;
    });

    afterEach(function () {
        $('#Tab').remove();
    });

    describe("contructor", function () {
        it("should create with default settings", function () {
            var settings = { change: $.noop };
            spyOn(settings, 'change');
            var result = new WC.HtmlHelper.Tab('#Tab', settings);

            expect(result.menu.index()).toEqual(0);
            expect(result.menu.attr('class')).toEqual('tab-menu active');
            expect(result.content.index()).toEqual(0);
            expect(result.content.attr('class')).toEqual('tab-content active');
            expect(settings.change).not.toHaveBeenCalled();
        });

        it("should create with specific settings", function () {
            var settings = { index: 2, change: $.noop };
            spyOn(settings, 'change');
            var result = new WC.HtmlHelper.Tab('#Tab', settings);

            expect(result.menu.index()).toEqual(2);
            expect(result.menu.attr('class')).toEqual('tab-menu active');
            expect(result.content.index()).toEqual(2);
            expect(result.content.attr('class')).toEqual('tab-content active');
            expect(settings.change).not.toHaveBeenCalled();
        });

        it("should active tab by clicking", function () {
            var settings = { change: $.noop };
            spyOn(settings, 'change');
            var result = new WC.HtmlHelper.Tab('#Tab', settings);
            $('#Tab .tab-menu:eq(1)').trigger('click');

            expect(result.menu.index()).toEqual(1);
            expect(result.menu.attr('class')).toEqual('tab-menu active');
            expect(result.content.index()).toEqual(1);
            expect(result.content.attr('class')).toEqual('tab-content active');
            expect(settings.change).toHaveBeenCalled();
        });
    });

    describe(".active", function () {
        it("should active at tab index 1", function () {
            var settings = { change: $.noop };
            spyOn(settings, 'change');
            var result = new WC.HtmlHelper.Tab('#Tab', settings);
            result.active(1);

            expect(result.menu.index()).toEqual(1);
            expect(result.menu.attr('class')).toEqual('tab-menu active');
            expect(result.content.index()).toEqual(1);
            expect(result.content.attr('class')).toEqual('tab-content active');
            expect(settings.change).toHaveBeenCalled();
        });
    });

});
