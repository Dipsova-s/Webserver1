/// <reference path="/Dependencies/Helper/HtmlHelper.ActionMenu.js" />

describe("HtmlHelper.ActionMenu test", function () {

    var actionMenu;
    var actionId = '#ActionSelect';
    var siblingsWidth = 100;

    beforeEach(function () {
        // prepare html
        $('<div id="ActionSelect" class="compactMode" />').html([
            '<div id="ActionDropdownList" class="btnTools disabled"></div>',
            '<div class="k-window-titleless k-window-custom k-window-arrow-n popupAction popupActionSearch" id="ActionDropdownListPopup">',
                '<div class= "k-window-content k-content">',
                    '<a class="actionDropdownItem"><span>Action 1</span></a>',
                    '<a class="actionDropdownItem"><span>Action 2</span></a>',
                    '<a class="actionDropdownItem"><span>Action 3</span></a>',
                    '<a class="actionDropdownItem"><span>Action 4</span></a>',
                    '<a class="actionDropdownItem"><span>Action 5</span></a>',
                '</div >',
            '</div>'
        ].join('')).appendTo('body');

        // create instance
        actionMenu = new WC.HtmlHelper.ActionMenu(actionId, function () {
            return siblingsWidth;
        });
    });

    afterEach(function () {
        $(actionId).remove();
    });

    describe("test initial value", function () {
        it("._data", function () {
            var result = actionMenu._data;
            expect(result.target).toEqual(actionId);
            expect(result.buttonElement).toEqual('.btnTools');
            expect(result.itemContainer).toEqual('.popupAction');
            expect(result.itemElement).toEqual('.actionDropdownItem');
        });
        it("._data.calculateSiblingsWidth", function () {
            var result = actionMenu._data.calculateSiblingsWidth();
            expect(result).toEqual(siblingsWidth);
        });
    });

});
