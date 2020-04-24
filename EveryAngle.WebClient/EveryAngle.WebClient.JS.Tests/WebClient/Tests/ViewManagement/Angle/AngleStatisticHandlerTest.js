/// <reference path="/Dependencies/Helper/DateTimeExtension.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/PopupPageHandlers.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/AngleStatisticView.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/AngleStatisticHandler.js" />

describe("AngleStatisticHandler", function () {
    var handler;
    beforeEach(function () {
        var angleHandler = {
            Data: $.noop,
            IsAdhoc: $.noop,
            GetCurrentDisplay: $.noop
        };
        handler = new AngleStatisticHandler(angleHandler);
    });

    describe(".ShowPopup", function () {
        it("should call functions by sequence", function () {
            spyOn(handler, 'CreateStatisticModel');
            spyOn(handler, 'GetPopupOptions');
            spyOn(popup, 'Show');
            handler.ShowPopup();
            expect(handler.CreateStatisticModel).toHaveBeenCalled();
            expect(handler.GetPopupOptions).toHaveBeenCalled();
            expect(popup.Show).toHaveBeenCalled();
        });
    });

    describe(".CreateStatisticModel", function () {
        it("should create StatisticInfo and ExecutionInfo", function () {
            spyOn(handler.AngleHandler, 'Data').and.returnValue({ user_specific: {} });
            spyOn(handler.AngleHandler, 'IsAdhoc').and.returnValue(false);
            spyOn(handler.AngleHandler, 'GetCurrentDisplay').and.returnValue({
                ResultHandler: { ExecutionInfo: ko.observable({}) }
            });
            spyOn(handler, 'GetStatisticItem').and.returnValue({});
            handler.CreateStatisticModel();

            // assert
            expect(handler.StatisticInfo()).not.toBeNull();
            expect(handler.ExecutionInfo()).not.toBeNull();
        });
        it("should not create StatisticInfo and ExecutionInfo", function () {
            spyOn(handler.AngleHandler, 'Data').and.returnValue({ user_specific: {} });
            spyOn(handler.AngleHandler, 'IsAdhoc').and.returnValue(true);
            spyOn(handler.AngleHandler, 'GetCurrentDisplay').and.returnValue(null);
            spyOn(handler, 'GetStatisticItem').and.returnValue({});
            handler.CreateStatisticModel();

            // assert
            expect(handler.StatisticInfo()).toBeNull();
            expect(handler.ExecutionInfo()).toBeNull();
        });
    });

    describe(".GetStatisticItem", function () {
        it("should return empty statistic when input data is null", function () {
            var result = handler.GetStatisticItem(null);
            expect(result).not.toBeNull();
            expect(result.user).toEqual('');
            expect(result.datetime).toEqual('');
            expect(result.full_name).toEqual('');
        });

        it("should return default statistic when input data is null and default statistic is provided", function () {
            var defaultItem = {
                user: 'default_user',
                datetime: 'default_datetime',
                full_name: 'default_full_name'
            };
            var result = handler.GetStatisticItem(null, defaultItem);
            expect(result).not.toBeNull();
            expect(result.user).toEqual('default_user');
            expect(result.datetime).toEqual('default_datetime');
            expect(result.full_name).toEqual('default_full_name');
        });

        it("should return statitsic item", function () {
            var item = {
                user: 'item_user',
                datetime: '',
                full_name: 'item_full_name'
            };
            spyOn(window, 'ConvertUnixTimeStampToDateStringInAngleDetails').and.returnValue('converted_datetime');
            var result = handler.GetStatisticItem(item);
            expect(result).not.toBeNull();
            expect(result.user).toEqual('item_user');
            expect(result.datetime).toEqual('converted_datetime');
            expect(result.full_name).toEqual('item_full_name');
        });
    });

    describe(".GetPopupOptions", function () {
        it("should get options", function () {
            var result = handler.GetPopupOptions();

            // assert
            expect(result.width).toEqual('auto');
            expect(result.height).toEqual('auto');
            expect(result.resizable).toEqual(false);
        });
    });

    describe(".ShowPopupCallback", function () {
        it("should apply knockout", function () {
            spyOn(WC.HtmlHelper, 'ApplyKnockout');
            handler.ShowPopupCallback({ sender: {} });
            
            // assert
            expect(WC.HtmlHelper.ApplyKnockout).toHaveBeenCalled();
        });
    });
});