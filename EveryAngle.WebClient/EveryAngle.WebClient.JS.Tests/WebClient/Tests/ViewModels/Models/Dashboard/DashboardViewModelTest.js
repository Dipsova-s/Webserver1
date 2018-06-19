/// <reference path="/Dependencies/ViewModels/Models/Dashboard/dashboardmodel.js" />
/// <reference path="/Dependencies/ViewModels/Shared/QueryBlock/QueryStepModel.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/WidgetFilter/WidgetFilterModel.js" />
/// <reference path="/Dependencies/Helper/DefaultValueHandler.js" />

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

    describe("call GetDashboardFilters", function () {

        it("should get dashboard filters by widget filters view model", function () {
            // mock
            var mockResponse = {
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

            var viewModel = WidgetFilterModel;
            dashboardModel.Data(mockResponse);

            // execute
            var result = dashboardModel.GetDashboardFilters(viewModel);

            // assert
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
            // mock
            var mockResponse = {
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

            var widgetFilterViewModels = mockResponse.filters.map(function (widgetFilter) {
                return new WidgetFilterModel(widgetFilter);
            });
            dashboardModel.Data([]);

            // execute
            dashboardModel.SetDashboardFilters(widgetFilterViewModels);

            // assert
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

    describe("call GetDashboardFiltersQueryBlock", function () {

        it("should get dashboard query block if it has filters", function () {
            spyOn(dashboardModel, 'GetDashboardFilters').and.returnValue([{
                field: 'PurchaseRequisition__BAFIX',
                operator: 'equal_to',
                tech_info: 'xxx',
                step_type: 'filter',
                arguments: [{
                    argument_type: 'field',
                    field: 'PurchaseOrderLine__AcknowledgementRequired'
                }]
            }]);

            var result = dashboardModel.GetDashboardFiltersQueryBlock();

            expect(result.queryblock_type).toEqual('query_steps');
            expect(result.query_steps).toBeDefined();
            expect(result.query_steps.length).toEqual(1);
            expect(result.query_steps[0].arguments.length).toEqual(1);
            expect(result.query_steps[0].step_type).toEqual('filter');
            expect(result.query_steps[0].field).toEqual('PurchaseRequisition__BAFIX');
            expect(result.query_steps[0].operator).toEqual('equal_to');
            expect(result.query_steps[0].tech_info).toEqual('xxx');
            expect(result.query_steps[0].arguments[0].argument_type).toEqual('field');
            expect(result.query_steps[0].arguments[0].field).toEqual('PurchaseOrderLine__AcknowledgementRequired');
        });

    });

    describe("call ExtendDashboardFilter", function () {

        it("should normalize dashboard filter", function () {
            var mockFilter = {
                field: 'PurchaseRequisition__BAFIX',
                operator: 'equal_to',
                tech_info: 'xxx',
                step_type: 'filter',
                arguments: [{
                    argument_type: 'field',
                    field: 'PurchaseOrderLine__AcknowledgementRequired'
                }]
            };

            dashboardModel.ExtendDashboardFilter(mockFilter);

            expect(mockFilter).toBeDefined();
            expect(mockFilter.arguments).toBeDefined();
            expect(mockFilter.arguments.length).toEqual(1);
            expect(mockFilter.step_type).toEqual('filter');
            expect(mockFilter.field).toEqual('PurchaseRequisition__BAFIX');
            expect(mockFilter.operator).toEqual('equal_to');
            expect(mockFilter.tech_info).toEqual('xxx');
            expect(mockFilter.arguments[0].argument_type).toEqual('field');
            expect(mockFilter.arguments[0].field).toEqual('PurchaseOrderLine__AcknowledgementRequired');
        });

    });

});
