/// <reference path="/Dependencies/ViewManagement/Dashboard/DashboardFiltersHandler.js" />
/// <reference path="/Dependencies/ViewModels/Models/Dashboard/dashboardmodel.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/WidgetFilter/WidgetFilterModel.js" />
/// <reference path="/Dependencies/ViewModels/Shared/QueryBlock/QueryStepModel.js" />
/// <reference path="/Dependencies/Helper/DefaultValueHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ValidationHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ModelFieldsHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/WidgetFilter/WidgetFilterHelper.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/popuppagehandlers.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/userfriendlynamehandler.js" />
/// <reference path="/Dependencies/ViewModels/Shared/DataType/DataType.js" />
/// <reference path="/Dependencies/ViewManagement/Angles/QuickFilterHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Dashboard/DashboardHandler.js" />


describe("DashboardFiltersHandler", function () {
    var dashboardFiltersHandler;
    var utils;

    beforeEach(function () {
        dashboardFiltersHandler = new DashboardFiltersHandler();
        utils = {
            createMockDashboardFilters: function () {
                var mockResult = {
                    model: 'https://modelserverurl.com',
                    filters: [{
                        step_type: "filter",
                        field: "ExecutionStatus",
                        operator: "in_set",
                        arguments: [{
                            argument_type: "value",
                            value: "es0ToBeExecuted"
                        }]
                    }]
                };
                var model = new DashboardViewModel();
                model.Data(mockResult);
                dashboardFiltersHandler.SetDashboardModel(model);
            }
        };
    });

    describe("when create new instance", function () {
        it("should be defined", function () {
            expect(dashboardFiltersHandler).toBeDefined();
        });
    });

    describe("call SetDashboardModel", function () {
        it("should appends dashboard filters to filters node", function () {
            utils.createMockDashboardFilters();

            expect(dashboardFiltersHandler.FilterNodes().length).toEqual(1);
        });
    });

    describe("call TogglePanel", function () {
        var testCases = [{
            title: 'should be true if previously is false',
            isOpen: false,
            expectedResult: true
        }, {
            title: 'should be false if previously is true',
            isOpen: true,
            expectedResult: false
        }];

        testCases.forEach(function (testCase) {
            it(testCase.title, function () {
                dashboardFiltersHandler.IsOpen(testCase.isOpen);
                dashboardFiltersHandler.TogglePanel();

                expect(dashboardFiltersHandler.IsOpen()).toEqual(testCase.expectedResult);
            });
        });
    });

    describe("call ToggleFilterHeader", function () {
        it("should be false if collapsed is true", function () {
            utils.createMockDashboardFilters();
            var filterNode = dashboardFiltersHandler.FilterNodes()[0];
            dashboardFiltersHandler.ToggleFilterHeader(filterNode);

            expect(filterNode.collapsed()).toBe(true);
        });
    });

    describe("call GetFiltersCount", function () {
        it("verify total number filter nodes", function () {
            utils.createMockDashboardFilters();
            var result = dashboardFiltersHandler.GetFiltersCount();

            expect(result).toEqual(1);
        });
    });

    describe("call GetModelUri", function () {
        it("verify model server url", function () {
            utils.createMockDashboardFilters();
            var result = dashboardFiltersHandler.GetModelUri();

            expect(result).toEqual('https://modelserverurl.com');
        });
    });

    describe("call GetFilterHeader", function () {
        it("verify filter header value", function () {
            utils.createMockDashboardFilters();
            var filterNode = dashboardFiltersHandler.FilterNodes()[0];
            var result = dashboardFiltersHandler.GetFilterHeader(filterNode);

            expect(result).toEqual('ExecutionStatus');
        });
    });

    describe("call GetFilterText", function () {
        it("verify filter text value", function () {
            utils.createMockDashboardFilters();
            var filterItem = dashboardFiltersHandler.FilterNodes()[0].filters[0];
            var result = dashboardFiltersHandler.GetFilterText(filterItem);

            expect(result).toEqual('is in list (es0ToBeExecuted)');
        });
    });

    describe("call ShowEditFilterPopup", function () {
        it("should call quick filter popup function", function () {
            utils.createMockDashboardFilters();
            var filter = dashboardFiltersHandler.FilterNodes()[0].filters[0];
            spyOn(quickFilterHandler, 'ShowEditDashboardFilterPopup').and.callFake(jQuery.noop);
            dashboardFiltersHandler.ShowEditFilterPopup(filter, 'testid');

            expect(quickFilterHandler.ShowEditDashboardFilterPopup).toHaveBeenCalled();
        });
    });

    describe("call ApplyFilter", function () {
        var mockFilter;
        beforeEach(function () {
            utils.createMockDashboardFilters();
            mockFilter = dashboardFiltersHandler.FilterNodes()[0].filters[0];
            var mockUpdateFilter = { operator: 'test', arguments: [{ argument_type: 'value', value: 'test' }] };
            dashboardFiltersHandler.HasChanged(false);
            dashboardFiltersHandler.ApplyFilter(mockFilter, mockUpdateFilter);
        });

        it("should be true if hasChanged is false", function () {
            expect(dashboardFiltersHandler.HasChanged()).toBe(true);
        });
        it("should update dashboard filter", function () {
            expect(mockFilter.operator()).toEqual('test');
            expect(mockFilter.arguments().length).toEqual(1);
        });
    });

    describe("call ApplyFilters", function () {
        it("should not update dashboard filters if hasChanged is false", function () {
            dashboardFiltersHandler.Model = { SetDashboardFilters: jQuery.noop };
            spyOn(dashboardFiltersHandler.Model, 'SetDashboardFilters').and.callFake(jQuery.noop);

            expect(dashboardFiltersHandler.Model.SetDashboardFilters).not.toHaveBeenCalled();
        });
        it("should not update dashboard filters if it has invalid execution parameters", function () {
            dashboardFiltersHandler.HasChanged(true);
            utils.createMockDashboardFilters();

            dashboardFiltersHandler.Model = { SetDashboardFilters: jQuery.noop };
            spyOn(validationHandler, 'CheckValidExecutionParameters').and.returnValue({ IsAllValidArgument: false, InvalidMessage: '' });
            spyOn(popup, 'Alert').and.callFake(jQuery.noop);
            spyOn(dashboardFiltersHandler.Model, 'SetDashboardFilters').and.callFake(jQuery.noop);
            dashboardFiltersHandler.ApplyFilters();

            expect(dashboardFiltersHandler.Model.SetDashboardFilters).not.toHaveBeenCalled();
        });
        it("should update dashboard filters if it passed validate", function () {
            dashboardFiltersHandler.HasChanged(true);
            utils.createMockDashboardFilters();

            dashboardFiltersHandler.Model = { SetDashboardFilters: jQuery.noop };
            spyOn(validationHandler, 'CheckValidExecutionParameters').and.returnValue({ IsAllValidArgument: true });
            spyOn(dashboardHandler, 'ReloadAllWidgets').and.callFake(jQuery.noop);
            dashboardFiltersHandler.ApplyFilters();

            expect(dashboardHandler.ReloadAllWidgets).toHaveBeenCalled();
        });
    });

});
