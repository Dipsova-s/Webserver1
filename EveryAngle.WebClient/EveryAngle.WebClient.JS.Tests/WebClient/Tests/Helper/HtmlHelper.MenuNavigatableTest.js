/// <chutzpah_reference path="/../../Dependencies/Helper/HtmlHelper.MenuNavigatable.js" />

describe("HtmlHelper.MenuNavigatable test", function () {

    var menuNavigatable;
    var items = $();

    beforeEach(function () {

        // BEGIN: prepare html

        // handle
        $('<a id="handle" />').hide().appendTo('body');

        // menu
        $('<div id="menu" />').css({
            position: 'absolute',
            left: -1000,
            top: 0,
            width: 200,
            height: 100,
            overflow: 'auto'
        }).html([
            '<div class="disabled" style="height: 20px;">Item 1</div>',
            '<div style="height: 20px; display: none">Item 2</div>',
            '<div class="active" style="height: 20px">Item 3</div>',
            '<div style="height: 20px;">Item 4</div>',
            '<div class="disabled" style="height: 20px">Item 5</div>',
            '<div style="height: 20px;">Item 6</div>',
            '<div style="height: 20px;">Item 7</div>',
            '<div style="height: 20px;">Item 8</div>',
            '<div style="height: 20px;">Item 9</div>',
            '<div class="disabled" style="height: 20px;">Item 10</div>'
        ].join('')).appendTo('body');

        // END: prepare html

        // create instance
        menuNavigatable = new WC.HtmlHelper.MenuNavigatable('#handle', '#menu', 'div');
        items = menuNavigatable._getAvailableItems({ data: menuNavigatable._data });
    });

    afterEach(function () {
        $('#handle,#menu').remove();
    });

    describe("when initial window and create new instance", function () {

        it("should be defined WC.HtmlHelper.MenuNavigatable be default", function () {
            expect(window.WC.HtmlHelper.MenuNavigatable).toBeDefined();
        });

        it("should be defined new instance", function () {
            expect(menuNavigatable).toBeDefined();
        });

        it("should set correct namespace and data", function () {
            expect(menuNavigatable._namespace).toEqual('_handle_menu');
            expect(menuNavigatable._data).toEqual({
                handle: '#handle',
                target: '#menu',
                itemSelector: 'div',
                selectedClassName: 'active',
                disabledClassName: 'disabled',
                autoSelect: false,
                enableLoop: true
            });
        });

        it("should have 6 avaliable items (exclude 2 disabled, 2 hidden)", function () {
            expect(items.length).toEqual(6);
        });

    });

    describe("call _getActiveElementIndex", function () {

        it("should get active index (0)", function () {
            var result = menuNavigatable._getActiveElementIndex(items, menuNavigatable._data.selectedClassName);
            var expected = 0;
            expect(expected).toEqual(result);
        });

        it("should not get active index if no active class name", function () {
            var result = menuNavigatable._getActiveElementIndex(items.removeClass('active'), menuNavigatable._data.selectedClassName);
            var expected = -1;
            expect(expected).toEqual(result);
        });

    });

    describe("call _getPrevItemIndex", function () {

        it("should get previous index if can loop (2 -> 1)", function () {
            var result = menuNavigatable._getPrevItemIndex(items, 2, true);
            var expected = 1;
            expect(expected).toEqual(result);
        });

        it("should get previous index if can loop (0 -> 5)", function () {
            var result = menuNavigatable._getPrevItemIndex(items, 0, true);
            var expected = 5;
            expect(expected).toEqual(result);
        });

        it("should get previous index if cannot loop (0 -> 0)", function () {
            var result = menuNavigatable._getPrevItemIndex(items, 0, false);
            var expected = 0;
            expect(expected).toEqual(result);
        });

    });

    describe("call _getNextItemIndex", function () {

        it("should get next index if can loop (2 -> 3)", function () {
            var result = menuNavigatable._getNextItemIndex(items, 2, true);
            var expected = 3;
            expect(expected).toEqual(result);
        });

        it("should get next index if can loop (9 -> 0)", function () {
            var result = menuNavigatable._getNextItemIndex(items, 9, true);
            var expected = 0;
            expect(expected).toEqual(result);
        });

        it("should get next index if cannot loop (9 -> 9)", function () {
            var result = menuNavigatable._getNextItemIndex(items, 9, false);
            var expected = 9;
            expect(expected).toEqual(result);
        });

    });

    describe("call _isItemInView", function () {

        var targetBound = {
            top: 0,
            bottom: 100
        };

        var tests = [
            true, true, true, true,
            false, false
        ];

        $.each(tests, function (index, expected) {
            it("should get " + expected + " for item " + index, function () {
                var result = menuNavigatable._isItemInView(items.eq(index), 20, targetBound);
                expect(expected).toEqual(result);
            });
        });

    });

});
