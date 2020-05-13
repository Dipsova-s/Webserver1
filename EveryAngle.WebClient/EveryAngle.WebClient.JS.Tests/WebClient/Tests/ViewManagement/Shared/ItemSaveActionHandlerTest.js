/// <reference path="/Dependencies/Helper/HtmlHelper.MenuNavigatable.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ItemSaveActionHandler.js" />

describe("ItemSaveActionHandler", function () {
    var itemSaveActionHandler;
    beforeEach(function () {
        itemSaveActionHandler = new ItemSaveActionHandler();
    });
    
    describe(".GetPrimarySaveAction", function () {
        it("should not get action", function () {
            var result = itemSaveActionHandler.GetPrimarySaveAction();
            expect(result).toEqual(null);
        });
        it("should get action", function () {
            itemSaveActionHandler.SaveActions['test1'] = { Visible: ko.observable(false) };
            itemSaveActionHandler.SaveActions['test2'] = { Visible: ko.observable(true) };
            var result = itemSaveActionHandler.GetPrimarySaveAction();
            expect(result).toEqual(itemSaveActionHandler.SaveActions['test2']);
        });
    });
    describe(".IsPrimarySaveValid", function () {
        it("should not be valid", function () {
            var result = itemSaveActionHandler.IsPrimarySaveValid();
            expect(result).toEqual(false);
        });
        it("should be valid", function () {
            itemSaveActionHandler.SaveActions['test1'] = { Visible: ko.observable(false) };
            itemSaveActionHandler.SaveActions['test2'] = { Visible: ko.observable(true) };
            var result = itemSaveActionHandler.IsPrimarySaveValid();
            expect(result).toEqual(true);
        });
    });
    describe(".IsPrimarySaveEnable", function () {
        var tests = [
            {
                title: 'should be true',
                action: {
                    Enable: function () {
                        return true;
                    }
                },
                expected: true
            },
            {
                title: 'should be false',
                action: {
                    Enable: function () {
                        return false;
                    }
                },
                expected: false
            },
            {
                title: 'should be false (action=null)',
                action: null,
                expected: false
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                spyOn(itemSaveActionHandler, 'GetPrimarySaveAction').and.returnValue(test.action);

                var actual = itemSaveActionHandler.IsPrimarySaveEnable();
                expect(actual).toEqual(test.expected);
            });
        });
    });
    describe(".VisibleToggleSaveOptions", function () {
        it("should not be visible", function () {
            itemSaveActionHandler.SaveActions['test1'] = { Visible: ko.observable(false) };
            itemSaveActionHandler.SaveActions['test2'] = { Visible: ko.observable(true) };
            var result = itemSaveActionHandler.VisibleToggleSaveOptions();
            expect(result).toEqual(false);
        });
        it("should be visible", function () {
            itemSaveActionHandler.SaveActions['test1'] = { Visible: ko.observable(true) };
            itemSaveActionHandler.SaveActions['test2'] = { Visible: ko.observable(true) };
            var result = itemSaveActionHandler.VisibleToggleSaveOptions();
            expect(result).toEqual(true);
        });
    });
    describe(".ToggleSaveOptions", function () {
        beforeEach(function () {
            spyOn($.fn, 'removeClass');
            spyOn($.fn, 'show');
            spyOn($.fn, 'hide');
        });
        it("should show options", function () {
            spyOn($.fn, 'is').and.returnValue(false);
            itemSaveActionHandler.ToggleSaveOptions();

            // assert
            expect($.fn.removeClass).toHaveBeenCalledWith('active');
            expect($.fn.show).toHaveBeenCalled();
            expect($.fn.hide).not.toHaveBeenCalled();
        });
        it("should hide options", function () {
            spyOn($.fn, 'is').and.returnValue(true);
            itemSaveActionHandler.ToggleSaveOptions();

            // assert
            expect($.fn.removeClass).toHaveBeenCalledWith('active');
            expect($.fn.show).not.toHaveBeenCalled();
            expect($.fn.hide).toHaveBeenCalled();
        });
    });
    describe(".HideSaveOptionsMenu", function () {
        it("should hide options", function () {
            spyOn($.fn, 'hide');
            itemSaveActionHandler.HideSaveOptionsMenu();

            // assert
            expect($.fn.hide).toHaveBeenCalled();
        });
    });
    describe(".GetPrimarySaveLabel", function () {
        var tests = [
            {
                title: 'should get label',
                action: {
                    Label: function () {
                        return 'my label';
                    }
                },
                expected: 'my label'
            },
            {
                title: 'should get empty',
                action: null,
                expected: ''
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                spyOn(itemSaveActionHandler, 'GetPrimarySaveAction').and.returnValue(test.action);

                var actual = itemSaveActionHandler.GetPrimarySaveLabel();
                expect(actual).toEqual(test.expected);
            });
        });
    });
    describe(".PrimarySaveAction", function () {
        it("should not call Action", function () {
            var action = {
                Action: $.noop
            };
            spyOn(action, 'Action');
            spyOn(itemSaveActionHandler, 'GetPrimarySaveAction').and.returnValue(null);
            itemSaveActionHandler.PrimarySaveAction();

            expect(action.Action).not.toHaveBeenCalled();
        });
        it("should call Action", function () {
            var action = {
                Action: $.noop
            };
            spyOn(action, 'Action');
            spyOn(itemSaveActionHandler, 'GetPrimarySaveAction').and.returnValue(action);
            itemSaveActionHandler.PrimarySaveAction();
            
            expect(action.Action).toHaveBeenCalled();
        });
    });
    describe(".ApplyHandler", function () {
        it("should set html and apply handler", function () {
            spyOn($.fn, 'html');
            spyOn(WC.HtmlHelper, 'ApplyKnockout');
            spyOn(WC.HtmlHelper, 'MenuNavigatable');
            itemSaveActionHandler.ApplyHandler($('<div/>'));

            expect(itemSaveActionHandler.$Container.length).toEqual(1);
            expect($.fn.html).toHaveBeenCalled();
            expect(WC.HtmlHelper.ApplyKnockout).toHaveBeenCalled();
            expect(WC.HtmlHelper.MenuNavigatable).toHaveBeenCalled();
        });
    });
    describe(".AddAction", function () {
        it("should add action", function () {
            itemSaveActionHandler.AddAction('my-key', 'my-label', 'my-css', $.noop, $.noop, $.noop);

            expect(itemSaveActionHandler.SaveActions['my-key'].Label()).toEqual('my-label');
            expect(itemSaveActionHandler.SaveActions['my-key'].ClassName).toEqual('my-css');
            expect(typeof itemSaveActionHandler.SaveActions['my-key']._visible === 'function').toEqual(true);
            expect(itemSaveActionHandler.SaveActions['my-key'].Visible()).toEqual(false);
            expect(typeof itemSaveActionHandler.SaveActions['my-key']._enable === 'function').toEqual(true);
            expect(itemSaveActionHandler.SaveActions['my-key'].Enable()).toEqual(false);
            expect(typeof itemSaveActionHandler.SaveActions['my-key'].Action === 'function').toEqual(true);
        });
    });
    describe(".UpdateActions", function () {
        it("should update actions", function () {
            var getTrue = function () { return true; };
            var getFalse = function () { return false; };
            itemSaveActionHandler.AddAction('test1', 'my-label1', 'my-css1', getTrue, getTrue, $.noop);
            itemSaveActionHandler.AddAction('test2', 'my-label2', 'my-css2', getFalse, getFalse, $.noop);
            itemSaveActionHandler.UpdateActions();

            expect(itemSaveActionHandler.SaveActions['test1'].Label()).toEqual('my-label1');
            expect(itemSaveActionHandler.SaveActions['test1'].ClassName).toEqual('my-css1');
            expect(itemSaveActionHandler.SaveActions['test1'].Visible()).toEqual(true);
            expect(itemSaveActionHandler.SaveActions['test1'].Enable()).toEqual(true);
            expect(itemSaveActionHandler.SaveActions['test2'].Label()).toEqual('my-label2');
            expect(itemSaveActionHandler.SaveActions['test2'].ClassName).toEqual('my-css2');
            expect(itemSaveActionHandler.SaveActions['test2'].Visible()).toEqual(false);
            expect(itemSaveActionHandler.SaveActions['test2'].Enable()).toEqual(false);
        });
    });
});
