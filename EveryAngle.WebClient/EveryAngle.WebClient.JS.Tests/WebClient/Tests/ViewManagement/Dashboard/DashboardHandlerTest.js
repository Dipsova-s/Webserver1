/// <reference path="/Dependencies/ViewManagement/Dashboard/DashboardHandler.js" />

describe("DashboardHandler", function () {
    var dashboardHandler;

    beforeEach(function () {
        dashboardHandler = new DashboardHandler();
    });

    afterEach(function () {
        jQuery.localStorage(enumHandlers.ANGLEPARAMETER.ADHOCFILTERS, null);
    });

    describe("when create new instance", function () {
        it("should be defined", function () {
            expect(dashboardHandler).toBeDefined();
        });
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
});
