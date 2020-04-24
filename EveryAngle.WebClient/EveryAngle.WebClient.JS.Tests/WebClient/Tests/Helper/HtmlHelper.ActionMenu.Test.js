/// <reference path="/Dependencies/Helper/HtmlHelper.ActionMenu.js" />

describe("WC.HtmlHelper.ActionMenu", function () {

    var actionMenu;
    var actionId = '#ActionSelect';

    beforeEach(function () {
        actionMenu = new WC.HtmlHelper.ActionMenu(actionId);
    });

    describe("constructor", function () {
        it("should set data", function () {
            //assert
            var result = actionMenu._data;
            expect(result.target).toEqual(actionId);
            expect(result.responsive).toEqual(false);
            expect(result.buttonElement).toEqual('.btnTools');
            expect(result.itemContainer).toEqual('.popupAction');
            expect(result.itemElement).toEqual('.actionDropdownItem');
        });
    });

    describe(".CreateActionMenuItems", function () {
        var dropdown;
        beforeEach(function () {
            dropdown = {
                dataSource: { filter: $.noop },
                items: function () { return []; },
                wrapper: $()
            };
            spyOn(WC.HtmlHelper, 'DropdownList').and.returnValue(dropdown);
            spyOn(dropdown.dataSource, 'filter');
            spyOn($.fn, 'append');
            spyOn($.fn, 'show');
            spyOn($.fn, 'hide');
        });
        it("should create menu (0 items)", function () {
            var data = [];
            WC.HtmlHelper.ActionMenu.CreateActionMenuItems('#MyMenu', '#MyDropdown', data, $.noop);

            //assert
            expect(WC.HtmlHelper.DropdownList).toHaveBeenCalled();
            expect(dropdown.dataSource.filter).toHaveBeenCalled();
            expect($.fn.append).not.toHaveBeenCalled();
            expect($.fn.show).not.toHaveBeenCalled();
            expect($.fn.hide).toHaveBeenCalled();
        });
        it("should create menu (2 items)", function () {
            var data = [
                { Enable: true, Visible: true },
                { Enable: false, Visible: false }
            ];
            dropdown.items = function () { return [{}, {}]; };
            WC.HtmlHelper.ActionMenu.CreateActionMenuItems('#MyMenu', '#MyDropdown', data, $.noop);

            //assert
            expect(WC.HtmlHelper.DropdownList).toHaveBeenCalled();
            expect(dropdown.dataSource.filter).toHaveBeenCalled();
            expect($.fn.append).toHaveBeenCalledTimes(2);
            expect($.fn.show).toHaveBeenCalled();
            expect($.fn.hide).not.toHaveBeenCalled();
        });
    });
});
