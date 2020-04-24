/// <reference path="/Dependencies/Helper/DateTimeExtension.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/PopupPageHandlers.js" />
/// <reference path="/Dependencies/ViewManagement/Dashboard/DashboardStatisticView.js" />
/// <reference path="/Dependencies/ViewManagement/Dashboard/DashboardStatisticHandler.js" />

describe("DashboardStatisticHandler", function () {
    var handler;
    beforeEach(function () {
        handler = new DashboardStatisticHandler();
    });

    describe(".ShowPopup", function () {
        it("should call functions by sequence", function () {
            spyOn(handler, 'CreateStatisticModel');
            spyOn(handler, 'GetPopupOptions');
            spyOn(popup, 'Show');
            var dashboardModel = {
                Data: $.noop
            };

            handler.ShowPopup(dashboardModel);

            expect(handler.CreateStatisticModel).toHaveBeenCalled();
            expect(handler.GetPopupOptions).toHaveBeenCalled();
            expect(popup.Show).toHaveBeenCalled();
        });
    });

    describe(".CreateStatisticModel", function () {
        it("should create StatisticInfo", function () {
            var data = {};
            spyOn(handler, 'GetStatisticItem').and.returnValue({});

            handler.CreateStatisticModel(data);

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