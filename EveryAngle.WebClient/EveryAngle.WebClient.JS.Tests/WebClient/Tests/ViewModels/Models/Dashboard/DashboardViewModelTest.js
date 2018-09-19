/// <reference path="/Dependencies/ViewModels/Models/Dashboard/dashboardmodel.js" />
/// <reference path="/Dependencies/ViewModels/Shared/QueryBlock/QueryStepModel.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/WidgetFilter/WidgetFilterModel.js" />
/// <reference path="/Dependencies/Helper/DefaultValueHandler.js" />

describe("DashboardModel", function () {
    var dashboardModel;
    var mockDashboardModel;

    beforeEach(function () {
        dashboardModel = new DashboardViewModel();
        mockDashboardModel = {
            filters: [
                {
                    field: 'PurchaseRequisition__BAFIX',
                    operator: 'equal_to',
                    tech_info: 'xxx',
                    step_type: 'filter',
                    arguments: [{
                        argument_type: 'field',
                        field: 'PurchaseOrderLine__AcknowledgementRequired'
                    }]
                }
            ]
        };
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

    describe("call GetDashboardFilters", function () {

        it("should get dashboard filters by widget filters view model", function () {
            var viewModel = WidgetFilterModel;
            dashboardModel.Data(mockDashboardModel);

            var result = dashboardModel.GetDashboardFilters(viewModel);

            expect(result).toBeDefined();
            expect(result.length).toEqual(1);
            expect(result[0].arguments.length).toEqual(1);
            expect(result[0].step_type).toEqual('filter');
            expect(result[0].field).toEqual('PurchaseRequisition__BAFIX');
            expect(result[0].operator).toEqual('equal_to');
            expect(result[0].tech_info).toEqual('xxx');
            expect(result[0].arguments[0].argument_type).toEqual('field');
            expect(result[0].arguments[0].field).toEqual('PurchaseOrderLine__AcknowledgementRequired');
        });

    });

    describe("call SetDashboardFilters", function () {

        it("should set dashboard filters by widget filters view model", function () {
            var widgetFilterViewModels = mockDashboardModel.filters.map(function (widgetFilter) {
                return new WidgetFilterModel(widgetFilter);
            });
            dashboardModel.Data([]);

            dashboardModel.SetDashboardFilters(widgetFilterViewModels);

            expect(dashboardModel.Data()).toBeDefined();
            expect(dashboardModel.Data().filters).toBeDefined();
            expect(dashboardModel.Data().filters.length).toEqual(1);
            expect(dashboardModel.Data().filters[0].arguments.length).toEqual(1);
            expect(dashboardModel.Data().filters[0].step_type).toEqual('filter');
            expect(dashboardModel.Data().filters[0].field).toEqual('PurchaseRequisition__BAFIX');
            expect(dashboardModel.Data().filters[0].operator).toEqual('equal_to');
            expect(dashboardModel.Data().filters[0].tech_info).toBeUndefined();
            expect(dashboardModel.Data().filters[0].arguments[0].argument_type).toEqual('field');
            expect(dashboardModel.Data().filters[0].arguments[0].field).toEqual('PurchaseOrderLine__AcknowledgementRequired');
        });

    });

    describe("call ExtendDashboardFilter", function () {

        it("should normalize dashboard filter", function () {
            var dashboardFilter = mockDashboardModel.filters[0];

            dashboardModel.ExtendDashboardFilter(dashboardFilter);

            expect(dashboardFilter).toBeDefined();
            expect(dashboardFilter.arguments).toBeDefined();
            expect(dashboardFilter.arguments.length).toEqual(1);
            expect(dashboardFilter.step_type).toEqual('filter');
            expect(dashboardFilter.field).toEqual('PurchaseRequisition__BAFIX');
            expect(dashboardFilter.operator).toEqual('equal_to');
            expect(dashboardFilter.tech_info).toEqual('xxx');
            expect(dashboardFilter.arguments[0].argument_type).toEqual('field');
            expect(dashboardFilter.arguments[0].field).toEqual('PurchaseOrderLine__AcknowledgementRequired');
        });

    });

    describe("call GetAllDashboardFilterFieldIds", function () {
        it("should get all filter ids", function () {
            dashboardModel.Data(mockDashboardModel);

            var result = dashboardModel.GetAllDashboardFilterFieldIds();

            expect(result.length).toEqual(2);
        });
    });

});
