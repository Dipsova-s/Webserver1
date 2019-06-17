/// <reference path="/Dependencies/ViewModels/Models/User/usermodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/User/privileges.js" />
/// <reference path="/Dependencies/ViewModels/Models/Dashboard/dashboardmodel.js" />
/// <reference path="/Dependencies/ViewManagement/Dashboard/DashboardHandler.js" />

describe("DashboardHandler", function () {
    var dashboardHandler;

    beforeEach(function () {
        dashboardHandler = new DashboardHandler();
    });

    afterEach(function () {
        jQuery.localStorage(enumHandlers.ANGLEPARAMETER.ADHOCFILTERS, null);
    });

    describe(".SetValidFilters(widgetElement)", function () {
        it("should not set the filter in local storage when no ResultModel", function () {
            var widgetElement = $('<div class="widgetDisplayColumn " />').data('ResultModel', null );
            dashboardHandler.SetValidFilters(widgetElement);
            var filter = jQuery.localStorage(enumHandlers.ANGLEPARAMETER.ADHOCFILTERS);
            expect(filter).toEqual(null);
        });

        it("should not set the filter in local storage when no valid filter", function () {
            var widgetElement = $('<div class="widgetDisplayColumn " />').data('ResultModel', {
                WidgetModel: {
                    GetExtendedFilters: function () {
                        return [];
                    }
                }
            });
            dashboardHandler.SetValidFilters(widgetElement);
            var filter = jQuery.localStorage(enumHandlers.ANGLEPARAMETER.ADHOCFILTERS);
            expect(filter).toEqual(null);
        });

        it("should be set the valid filter in local storage when has valid filter", function () {
            var widgetElement = $('<div class="widgetDisplayColumn " />').data('ResultModel', {
                WidgetModel: {
                    GetExtendedFilters: function () {
                        return 'filter';
                    }
                }
            });
            dashboardHandler.SetValidFilters(widgetElement);
            var filter = jQuery.localStorage(enumHandlers.ANGLEPARAMETER.ADHOCFILTERS);
            expect(filter).toEqual('filter');
        });
    });

    describe(".GetActionDropdownItems", function () {
        it("check menu visibility on editmode = true", function () {
            spyOn(dashboardHandler, 'IsEditMode').and.returnValue(true);
            spyOn(dashboardModel, 'CanUpdateDashboard').and.returnValue(true);
            spyOn(dashboardModel, 'IsTemporaryDashboard').and.returnValue(true);

            // act
            var items = dashboardHandler.GetActionDropdownItems();

            // assert
            expect(items.length).toEqual(4);
            expect(items[0].Visible).toEqual(true);
            expect(items[1].Visible).toEqual(true);
            expect(items[2].Visible).toEqual(true);
            expect(items[3].Visible).toEqual(true);
        });

        it("check menu visibility on editmode = false", function () {
            spyOn(dashboardHandler, 'IsEditMode').and.returnValue(false);
            spyOn(dashboardModel, 'CanUpdateDashboard').and.returnValue(true);
            spyOn(dashboardModel, 'IsTemporaryDashboard').and.returnValue(true);

            // act
            var items = dashboardHandler.GetActionDropdownItems();

            // assert
            expect(items.length).toEqual(4);
            expect(items[0].Visible).toEqual(true);
            expect(items[1].Visible).toEqual(true);
            expect(items[2].Visible).toEqual(true);
            expect(items[3].Visible).toEqual(false);
        });

        it("check menu with a right authorization", function () {
            spyOn(dashboardHandler, 'IsEditMode').and.returnValue(false);
            spyOn(dashboardModel, 'CanUpdateDashboard').and.returnValue(true);
            spyOn(dashboardModel, 'IsTemporaryDashboard').and.returnValue(false);
            spyOn(privilegesViewModel, 'IsAllowExecuteDashboard').and.returnValue(true);

            // act
            var items = dashboardHandler.GetActionDropdownItems();

            // assert
            expect(items.length).toEqual(4);
            expect(items[0].Enable).toEqual(true);
            expect(items[1].Enable).toEqual(true);
            expect(items[2].Enable).toEqual(true);
            expect(items[3].Enable).toEqual(true);
        });

        it("check menu without a right authorization", function () {
            spyOn(dashboardHandler, 'IsEditMode').and.returnValue(false);
            spyOn(dashboardModel, 'CanUpdateDashboard').and.returnValue(false);
            spyOn(dashboardModel, 'IsTemporaryDashboard').and.returnValue(true);
            spyOn(privilegesViewModel, 'IsAllowExecuteDashboard').and.returnValue(false);

            // act
            var items = dashboardHandler.GetActionDropdownItems();

            // assert
            expect(items.length).toEqual(4);
            expect(items[0].Enable).toEqual(false);
            expect(items[1].Enable).toEqual(false);
            expect(items[2].Enable).toEqual(true);
            expect(items[3].Enable).toEqual(true);
        });
    });
});
