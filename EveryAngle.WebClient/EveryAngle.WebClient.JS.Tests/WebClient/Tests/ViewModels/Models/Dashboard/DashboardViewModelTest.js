/// <reference path="/Dependencies/ViewModels/Models/Dashboard/dashboardmodel.js" />

describe("DashboardModel", function () {
    var dashboardModel;

    beforeEach(function () {
        dashboardModel = new DashboardViewModel();
    });

    describe("when create new instance", function () {

        it("should be defined", function () {
            expect(dashboardModel).toBeDefined();
        });

    });

    describe("call UpdatePublicationsWatcher", function () {

        beforeEach(function () {

            dashboardModel.Angles = mockAngles;
        });

        it("should set publication status for each Display", function () {

            dashboardModel.UpdatePublicationsWatcher();

            var watcher1 = jQuery.storageWatcher('__watcher_dashboard_publications_' + dashboardModel.Angles[0].display_definitions[0].uri);
            var watcher2 = jQuery.storageWatcher('__watcher_dashboard_publications_' + dashboardModel.Angles[0].display_definitions[1].uri);
            var watcher3 = jQuery.storageWatcher('__watcher_dashboard_publications_' + dashboardModel.Angles[0].display_definitions[2].uri);

            expect(watcher1).toEqual(true);
            expect(watcher2).toEqual(false);
            expect(watcher3).toEqual(true);
        });

    });

});
