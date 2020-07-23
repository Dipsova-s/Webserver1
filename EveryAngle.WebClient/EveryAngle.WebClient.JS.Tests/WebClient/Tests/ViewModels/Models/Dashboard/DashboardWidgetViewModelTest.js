/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/User/usersettingmodel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/User/usermodel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/User/privileges.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Dashboard/dashboardmodel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/shared/WidgetFilter/WidgetFilterHelper.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/shared/ValidationHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/shared/ModelsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Dashboard/DashboardWidgetModel.js" />

describe("DashboardWidgetViewModel", function () {
    var dashboardWidgetViewModel;

    beforeEach(function () {
        dashboardWidgetViewModel = new DashboardWidgetViewModel({});
    });

    describe(".GetDefaultWidgetName", function () {

        it("should get default widget name", function () {
            spyOn(modelsHandler, 'GetModelName').and.callFake(function () { return ''; });
            spyOn(dashboardWidgetViewModel, 'GetAngle').and.callFake(function () { return { name: 'name1', model: '/models/1' }; });
            spyOn(dashboardWidgetViewModel, 'GetDisplay').and.callFake(function () { return { name: 'name2' }; });
            var result = dashboardWidgetViewModel.GetDefaultWidgetName();
            expect(result).toEqual(' - name1 - name2');
        });

    });

    describe(".GetWidgetName", function () {

        it("should get widget name", function () {
            spyOn(dashboardWidgetViewModel, 'name').and.callFake(function () { return 'my name'; });
            spyOn(dashboardWidgetViewModel, 'GetDefaultWidgetName').and.callFake(function () { return 'default name'; });
            var result = dashboardWidgetViewModel.GetWidgetName();
            expect(result).toEqual('my name');
        });

        it("should get default widget name if no name", function () {
            spyOn(dashboardWidgetViewModel, 'name').and.callFake(function () { return ''; });
            spyOn(dashboardWidgetViewModel, 'GetDefaultWidgetName').and.callFake(function () { return 'default name'; });
            var result = dashboardWidgetViewModel.GetWidgetName();
            expect(result).toEqual('default name');
        });

    });

    describe(".GetAngleDisplayName", function () {

        it("should get angle display name with model name", function () {
            spyOn(modelsHandler, 'GetModelName').and.callFake(function () { return 'model1'; });
            var result = dashboardWidgetViewModel.GetAngleDisplayName('name1', 'name2', '/models/1');
            expect(result).toEqual('model1 - name1 - name2');
        });

        it("should get angle display name by prototype function", function () {
            spyOn(modelsHandler, 'GetModelName').and.callFake(function () { return 'model1'; });
            var result = DashboardWidgetViewModel.prototype.GetAngleDisplayName('name1', 'name2', '/models/1');
            expect(result).toEqual('model1 - name1 - name2');
        });

    });

    describe(".CanExtendFilter", function () {
        it("can extend filter", function () {
            spyOn(dashboardWidgetViewModel, 'GetAngle').and.returnValue({ allow_more_details: true });
            spyOn(privilegesViewModel, 'AllowMoreDetails').and.returnValue(true);
            var result = dashboardWidgetViewModel.CanExtendFilter();
            expect(result).toBeTruthy();
        });
        it("cannot extend filter (angle=null)", function () {
            spyOn(dashboardWidgetViewModel, 'GetAngle').and.returnValue(null);
            spyOn(privilegesViewModel, 'AllowMoreDetails').and.returnValue(true);
            var result = dashboardWidgetViewModel.CanExtendFilter();
            expect(result).toBeFalsy();
        });
        it("cannot extend filter (allow_more_details=false)", function () {
            spyOn(dashboardWidgetViewModel, 'GetAngle').and.returnValue({ allow_more_details: false });
            spyOn(privilegesViewModel, 'AllowMoreDetails').and.returnValue(true);
            var result = dashboardWidgetViewModel.CanExtendFilter();
            expect(result).toBeFalsy();
        });
        it("cannot extend filter (AllowMoreDetails=false)", function () {
            spyOn(dashboardWidgetViewModel, 'GetAngle').and.returnValue({ allow_more_details: true });
            spyOn(privilegesViewModel, 'AllowMoreDetails').and.returnValue(false);
            var result = dashboardWidgetViewModel.CanExtendFilter();
            expect(result).toBeFalsy();
        });
    });

    describe(".GetBlockQuerySteps", function () {

        it("should append new filter if no filter", function () {
            var blockQuerySteps = [];
            var dashboardFilters = [
                { step_type: 'filter' }
            ];
            spyOn(dashboardWidgetViewModel, 'GetDisplay').and.returnValue({ query_blocks: blockQuerySteps });

            // act
            var result = dashboardWidgetViewModel.GetBlockQuerySteps(dashboardFilters);

            // assert
            expect(1).toEqual(result.query_steps.length);
            expect({ step_type: 'filter' }).toEqual(result.query_steps[0]);
        });

        it("should append new filter if has filter but no aggregation", function () {
            var blockQuerySteps = [{
                query_steps: [
                    { step_type: 'filter' },
                    { step_type: 'filter' }
                ]
            }];
            var dashboardFilters = [
                { step_type: 'filter' },
                { step_type: 'filter' }
            ];
            spyOn(dashboardWidgetViewModel, 'GetDisplay').and.returnValue({ query_blocks: blockQuerySteps });

            // act
            var result = dashboardWidgetViewModel.GetBlockQuerySteps(dashboardFilters);

            // assert
            expect(4).toEqual(result.query_steps.length);
            expect({ step_type: 'filter' }).toEqual(result.query_steps[0]);
            expect({ step_type: 'filter' }).toEqual(result.query_steps[1]);
            expect({ step_type: 'filter' }).toEqual(result.query_steps[2]);
            expect({ step_type: 'filter' }).toEqual(result.query_steps[3]);
        });

        it("should append new filter if has filter with sorting & aggregation", function () {
            var blockQuerySteps = [{
                query_steps: [
                    { step_type: 'filter' },
                    { step_type: 'filter' },
                    { step_type: 'sorting' },
                    { step_type: 'aggregation' }
                ]
            }];
            var dashboardFilters = [
                { step_type: 'filter' },
                { step_type: 'filter' }
            ];
            spyOn(dashboardWidgetViewModel, 'GetDisplay').and.returnValue({ query_blocks: blockQuerySteps });

            // act
            var result = dashboardWidgetViewModel.GetBlockQuerySteps(dashboardFilters);

            // assert
            expect(6).toEqual(result.query_steps.length);
            expect({ step_type: 'filter' }).toEqual(result.query_steps[0]);
            expect({ step_type: 'filter' }).toEqual(result.query_steps[1]);
            expect({ step_type: 'filter' }).toEqual(result.query_steps[2]);
            expect({ step_type: 'filter' }).toEqual(result.query_steps[3]);
            expect({ step_type: 'sorting' }).toEqual(result.query_steps[4]);
            expect({ step_type: 'aggregation' }).toEqual(result.query_steps[5]);
        });

    });

    describe(".SetExtendedFilters", function () {
        it("should not set any filter to widget", function () {
            var validatedFilters = [
                { field: 'dashboard_filter1', step_type: enumHandlers.FILTERTYPE.FILTER, valid: true },
                { field: 'dashboard_filter2', step_type: enumHandlers.FILTERTYPE.FILTER, valid: false },
                { field: 'dashboard_filter3', step_type: enumHandlers.FILTERTYPE.FILTER },
                { field: 'any', step_type: 'any' }
            ];
            spyOn(dashboardWidgetViewModel, 'CanExtendFilter').and.returnValue(false);

            // act
            dashboardWidgetViewModel.SetExtendedFilters(validatedFilters);
            var results = dashboardWidgetViewModel.GetExtendedFilters();

            // assert
            expect(0).toEqual(results.length);
        });

        it("should set 2 valid filters to widget", function () {
            var validatedFilters = [
                { field: 'dashboard_filter1', step_type: enumHandlers.FILTERTYPE.FILTER, valid: true },
                { field: 'dashboard_filter2', step_type: enumHandlers.FILTERTYPE.FILTER, valid: false },
                { field: 'dashboard_filter3', step_type: enumHandlers.FILTERTYPE.FILTER },
                { field: 'any', step_type: 'any' }
            ];
            spyOn(dashboardWidgetViewModel, 'CanExtendFilter').and.returnValue(true);

            // act
            dashboardWidgetViewModel.SetExtendedFilters(validatedFilters);
            var results = dashboardWidgetViewModel.GetExtendedFilters();

            // assert
            expect(2).toEqual(results.length);
            expect('dashboard_filter1').toEqual(results[0].field);
            expect('dashboard_filter3').toEqual(results[1].field);
        });

        it("should set a valid filter to widget in case no aggregation", function () {
            var validatedFilters = [
                { field: 'followup1', step_type: enumHandlers.FILTERTYPE.FOLLOWUP },
                { field: 'filter1', step_type: enumHandlers.FILTERTYPE.FILTER },
                { field: 'dashboard_filter1', step_type: enumHandlers.FILTERTYPE.FILTER },
                { field: 'dashboard_filter2', step_type: enumHandlers.FILTERTYPE.FILTER, valid: false }
            ];
            spyOn(dashboardWidgetViewModel, 'CanExtendFilter').and.returnValue(true);

            // act
            dashboardWidgetViewModel.SetExtendedFilters(validatedFilters);
            var results = dashboardWidgetViewModel.GetExtendedFilters();

            // assert
            expect(2).toEqual(results.length);
            expect('filter1').toEqual(results[0].field);
            expect('dashboard_filter1').toEqual(results[1].field);
        });

        it("should set a valid filter to widget in case has aggregation", function () {
            var validatedFilters = [
                { field: 'followup1', step_type: enumHandlers.FILTERTYPE.FOLLOWUP },
                { field: 'filter1', step_type: enumHandlers.FILTERTYPE.FILTER, valid: true },
                { field: 'dashboard_filter1', step_type: enumHandlers.FILTERTYPE.FILTER },
                { field: 'dashboard_filter2', step_type: enumHandlers.FILTERTYPE.FILTER, valid: false },
                { field: 'aggregation1', step_type: enumHandlers.FILTERTYPE.AGGREGATION, valid: false }
            ];
            spyOn(dashboardWidgetViewModel, 'CanExtendFilter').and.returnValue(true);

            // act
            dashboardWidgetViewModel.SetExtendedFilters(validatedFilters);
            var results = dashboardWidgetViewModel.GetExtendedFilters();

            // assert
            expect(2).toEqual(results.length);
            expect('filter1').toEqual(results[0].field);
            expect('dashboard_filter1').toEqual(results[1].field);
        });

    });

    describe(".GetAngle", function () {

        beforeEach(function () {
            dashboardModel.Angles = [
                { id: '1', uri: '/models/1/angles/1', name: 'Angle1' },
                { id: '2', uri: '/models/1/angles/2', name: 'Angle2' }
            ];
        });

        afterEach(function () {
            dashboardWidgetViewModel.angle = '';
            DashboardViewModel.KeyName = '';
            dashboardModel.Angles = [];
        });

        it("should get data by id correctly", function () {
            dashboardWidgetViewModel.angle = '1';
            DashboardViewModel.KeyName = 'id';
            var result = dashboardWidgetViewModel.GetAngle();

            expect(result.name).toEqual('Angle1');
        });

        it("should get data by uri correctly", function () {
            dashboardWidgetViewModel.angle = '/models/1/angles/2';
            DashboardViewModel.KeyName = 'uri';
            var result = dashboardWidgetViewModel.GetAngle();

            expect(result.name).toEqual('Angle2');
        });

        it("should get null when Angle is not in the list", function () {
            dashboardWidgetViewModel.angle = '/models/1/angles/3';
            DashboardViewModel.KeyName = 'uri';
            var result = dashboardWidgetViewModel.GetAngle();

            expect(result).toBeNull();
        });

    });

});
