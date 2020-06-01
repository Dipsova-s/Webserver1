/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/PopupPageHandlers.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/DisplayStatisticView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/DisplayStatisticHandler.js" />

describe("DisplayStatisticHandler", function () {
    var handler;
    beforeEach(function () {
        var displayHandler = {
            Data: $.noop,
            IsAdhoc: $.noop
        };
        handler = new DisplayStatisticHandler(displayHandler);
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
        it("should create StatisticInfo", function () {
            var data = {
                user_specific: 1
            };

            spyOn(handler.DisplayHandler, 'Data').and.returnValue(data);
            spyOn(handler, 'GetStatisticItem').and.returnValue({});

            handler.CreateStatisticModel();

            var info = handler.StatisticInfo();
            expect(info).not.toBeNull();
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