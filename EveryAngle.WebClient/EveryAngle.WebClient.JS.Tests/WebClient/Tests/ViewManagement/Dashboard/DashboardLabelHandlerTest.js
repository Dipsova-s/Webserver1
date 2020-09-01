/// <chutzpah_reference path="/../../Dependencies/Helper/HtmlHelper.MultiSelect.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ModelsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/businessprocesshandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Dashboard/dashboardmodel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Dashboard/DashboardLabelHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ToastNotificationHandler.js" />

describe("DashboardLabelHandler", function () {
    var dashboardLabelHandler;
    beforeEach(function () {
        var dashboardModel = new DashboardViewModel({});
        var unsavedModel = new DashboardViewModel({});
        dashboardLabelHandler = new DashboardLabelHandler(dashboardModel, unsavedModel);
        dashboardLabelHandler.$BusinessProcess = {
            hideList: $.noop
        };
    });

    describe(".CanUpdate", function () {
        it("should be true", function () {
            //arrange
            dashboardLabelHandler.DashboardModel.Data().authorizations.update = true;

            //act
            var result = dashboardLabelHandler.CanUpdate();

            // assert
            expect(result).toEqual(true);
        });
    });

    describe(".GetModelUri", function () {
        it("should get model uri", function () {
            //arrange
            dashboardLabelHandler.DashboardModel.Data().model = '/models/1';

            //act
            var result = dashboardLabelHandler.GetModelUri();

            // assert
            expect(result).toEqual('/models/1');
        });
    });

    describe(".IsPublished", function () {
        it("should be true", function () {
            //arrange
            dashboardLabelHandler.DashboardModel.Data().is_published(true);

            //act
            var result = dashboardLabelHandler.IsPublished();

            // assert
            expect(result).toEqual(true);
        });
    });

    describe(".IsAdhoc", function () {
        it("should be true", function () {
            //arrange
            spyOn(dashboardLabelHandler.DashboardModel, 'IsTemporaryDashboard').and.returnValue(true);

            //act
            var result = dashboardLabelHandler.IsAdhoc();

            // assert
            expect(result).toEqual(true);
        });
    });

    describe(".GetAssignedLabels", function () {
        it("should get assigned labels", function () {
            //arrange
            dashboardLabelHandler.UnsavedModel.Data().assigned_labels = ['my_label'];

            //act
            var result = dashboardLabelHandler.GetAssignedLabels();

            // assert
            expect(result).toEqual(['my_label']);
        });
    });

    describe(".ForceSave", function () {
        beforeEach(function () {
            spyOn(dashboardLabelHandler, 'ShowProgressbar');
            spyOn(dashboardLabelHandler, 'SaveFail');
            spyOn(dashboardLabelHandler, 'SaveDone');
        });
        it("should save", function () {
            //arrange
            spyOn(dashboardLabelHandler.DashboardModel, 'SetAssignedLabels').and.returnValue($.when());

            //act
            dashboardLabelHandler.ForceSave(['new-label1', 'new-label2']);

            // assert
            expect(dashboardLabelHandler.ShowProgressbar).toHaveBeenCalled();
            expect(dashboardLabelHandler.DashboardModel.SetAssignedLabels).toHaveBeenCalledWith(['new-label1', 'new-label2']);
            expect(dashboardLabelHandler.SaveFail).not.toHaveBeenCalled();
            expect(dashboardLabelHandler.SaveDone).toHaveBeenCalled();
        });
        it("should not save", function () {
            //arrange
            spyOn(dashboardLabelHandler.DashboardModel, 'SetAssignedLabels').and.returnValue($.Deferred(function (defer) {
                defer.reject();
                return defer.promise();
            }));

            //act
            dashboardLabelHandler.ForceSave(['new-label1', 'new-label2']);

            // assert
            expect(dashboardLabelHandler.ShowProgressbar).toHaveBeenCalled();
            expect(dashboardLabelHandler.DashboardModel.SetAssignedLabels).toHaveBeenCalledWith(['new-label1', 'new-label2']);
            expect(dashboardLabelHandler.SaveFail).toHaveBeenCalled();
            expect(dashboardLabelHandler.SaveDone).not.toHaveBeenCalled();
        });
    });

    describe(".SaveDone", function () {
        beforeEach(function () {
            spyOn(dashboardLabelHandler, 'HideProgressbar');
            spyOn(toast, 'MakeSuccessTextFormatting');
        });
        it("should hide progress bar without notification message", function () {
            //arrange
            spyOn(dashboardLabelHandler, 'IsAdhoc').and.returnValue(true);

            //act
            dashboardLabelHandler.SaveDone({ assigned_labels: ['my-label'] });

            // assert
            expect(dashboardLabelHandler.UnsavedModel.Data().assigned_labels).toEqual(['my-label']);
            expect(dashboardLabelHandler.HideProgressbar).toHaveBeenCalled();
            expect(toast.MakeSuccessTextFormatting).not.toHaveBeenCalled();
        });
        it("should hide progress bar with notification message", function () {
            //arrange
            spyOn(dashboardLabelHandler, 'IsAdhoc').and.returnValue(false);

            //act
            dashboardLabelHandler.SaveDone({ assigned_labels: ['my-label'] });

            // assert
            expect(dashboardLabelHandler.UnsavedModel.Data().assigned_labels).toEqual(['my-label']);
            expect(dashboardLabelHandler.HideProgressbar).toHaveBeenCalled();
            expect(toast.MakeSuccessTextFormatting).toHaveBeenCalled();
        });
    });

    describe(".GetStateData", function () {
        it("should get state data", function () {
            //arrange
            spyOn(dashboardLabelHandler.DashboardModel, 'GetData').and.returnValue('my-dashboard-data');

            //act
            var result = dashboardLabelHandler.GetStateData();

            // assert
            expect(result).toEqual('my-dashboard-data');
        });
    });
});
