/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ModelsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Dashboard/DashboardModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ToastNotificationHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ItemSaveAs/ItemSaveAsView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ItemSaveAs/ItemSaveAsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Dashboard/DashboardSaveAsHandler.js" />

describe("DashboardSaveAsHandler", function () {

    var handler;

    beforeEach(function () {
        var dashboardPageHandler = {
            GetName: $.noop,
            CloneData: $.noop
        };

        var dashboardModel = {
            SaveAsDashboard: $.noop,
            GetData: function () { return { multi_lang_name: ['en'] }; }
        };

        handler = new DashboardSaveAsHandler(dashboardPageHandler, dashboardModel);
    });

    describe(".ShowPopup", function () {
        it("should show popup", function () {
            spyOn(handler.ItemSaveAsHandler, 'ShowPopup');
            handler.ShowPopup();
            expect(handler.ItemSaveAsHandler.ShowPopup).toHaveBeenCalled();
        });
    });

    describe(".GetSaveData", function () {
        it("should return data with languages", function () {
            spyOn(handler.DashboardPageHandler, 'CloneData').and.returnValue({
                multi_lang_name: [{ lang: 'en' }]
            });
            spyOn(handler.ItemSaveAsHandler, 'GetData').and.returnValue({});
            spyOn(handler.ItemSaveAsHandler, 'GetLanguages').and.returnValue('multi_lang_description');

            var result = handler.GetSaveData();

            expect(result.multi_lang_description).toEqual('multi_lang_description');
        });
    });

    describe(".Save", function () {
        it("should create new dashboard", function () {

            var data = {};

            spyOn(handler, 'GetSaveData').and.returnValue(data);
            spyOn(handler.ItemSaveAsHandler, 'ShowProgressbar');
            
            var callback = { fail: $.noop };
            spyOn(handler.DashboardModel, 'SaveAsDashboard').and.returnValue({
                done: function () { return callback; }
            });

            handler.Save();

            expect(handler.GetSaveData).toHaveBeenCalled();
            expect(handler.ItemSaveAsHandler.ShowProgressbar).toHaveBeenCalled();
            expect(handler.DashboardModel.SaveAsDashboard).toHaveBeenCalled();
        });
    });

    describe(".SaveDone", function () {
        it("should close popup and redirect to dashboard", function () {
            spyOn(handler.ItemSaveAsHandler, 'ClosePopup');
            spyOn(handler.DashboardPageHandler, 'GetName').and.returnValue({});
            spyOn(toast, 'MakeSuccessTextFormatting');
            spyOn(handler.ItemSaveAsHandler, 'Redirect');

            var dashboard = {};
            handler.SaveDone(dashboard);

            expect(handler.ItemSaveAsHandler.ClosePopup).toHaveBeenCalled();
            expect(handler.DashboardPageHandler.GetName).toHaveBeenCalled();
            expect(toast.MakeSuccessTextFormatting).toHaveBeenCalled();
            expect(handler.ItemSaveAsHandler.Redirect).toHaveBeenCalled();
        });
    });

    describe(".SaveFail", function () {
        it("should hide progress bar", function () {
            spyOn(handler.ItemSaveAsHandler, 'HideProgressbar');
            handler.SaveFail();
            expect(handler.ItemSaveAsHandler.HideProgressbar).toHaveBeenCalled();
        });
    });

});