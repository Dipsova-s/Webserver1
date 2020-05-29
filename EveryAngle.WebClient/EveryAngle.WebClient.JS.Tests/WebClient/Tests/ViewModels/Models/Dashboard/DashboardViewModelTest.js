/// <reference path="/Dependencies/ViewModels/Models/User/usermodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/User/privileges.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ModelsHandler.js" />
/// <reference path="/Dependencies/ViewModels/Models/Dashboard/dashboardmodel.js" />
/// <reference path="/Dependencies/ViewModels/Shared/QueryBlock/QueryStepModel.js" />
/// <reference path="/Dependencies/Helper/DefaultValueHandler.js" />

describe("DashboardModel", function () {
    var dashboardModel;
    var mockDashboardModel;

    beforeEach(function () {
        dashboardModel = new DashboardViewModel({});
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

    describe(".GetDefaultLayoutConfig", function () {
        var tests = [
            {
                count: 0,
                expected: { structure: [] }
            },
            {
                count: 1,
                expected: {
                    structure: [
                        { items: ['100%'], height: '100%' }
                    ]
                }
            },
            {
                count: 2,
                expected: {
                    structure: [
                        { items: ['50%', '50%'], height: '100%' }
                    ]
                }
            },
            {
                count: 3,
                expected: {
                    structure: [
                        { items: ['33.4%', '33.3%', '33.3%'], height: '100%' }
                    ]
                }
            },
            {
                count: 4,
                expected: {
                    structure: [
                        { items: ['50%', '50%'], height: '50%' },
                        { items: ['50%', '50%'], height: '50%' }
                    ]
                }
            },
            {
                count: 5,
                expected: {
                    structure: [
                        { items: ['33.4%', '33.3%', '33.3%'], height: '50%' },
                        { items: ['50%', '50%'], height: '50%' }
                    ]
                }
            },
            {
                count: 6,
                expected: {
                    structure: [
                        { items: ['33.4%', '33.3%', '33.3%'], height: '50%' },
                        { items: ['33.4%', '33.3%', '33.3%'], height: '50%' }
                    ]
                }
            },
            {
                count: 7,
                expected: {
                    structure: [
                        { items: ['25%', '25%', '25%', '25%'], height: '50%' },
                        { items: ['33.4%', '33.3%', '33.3%'], height: '50%' }
                    ]
                }
            },
            {
                count: 8,
                expected: {
                    structure: [
                        { items: ['25%', '25%', '25%', '25%'], height: '50%' },
                        { items: ['25%', '25%', '25%', '25%'], height: '50%' }
                    ]
                }
            },
            {
                count: 9,
                expected: {
                    structure: [
                        { items: ['33.4%', '33.3%', '33.3%'], height: '33%' },
                        { items: ['33.4%', '33.3%', '33.3%'], height: '33%' },
                        { items: ['33.4%', '33.3%', '33.3%'], height: '34%' }
                    ]
                }
            },
            {
                count: 10,
                expected: {
                    structure: [
                        { items: ['25%', '25%', '25%', '25%'], height: '33%' },
                        { items: ['25%', '25%', '25%', '25%'], height: '33%' },
                        { items: ['50%', '50%'], height: '34%' }
                    ]
                }
            },
            {
                count: 11,
                expected: {
                    structure: [
                        { items: ['25%', '25%', '25%', '25%'], height: '33%' },
                        { items: ['25%', '25%', '25%', '25%'], height: '33%' },
                        { items: ['33.4%', '33.3%', '33.3%'], height: '34%' }
                    ]
                }
            },
            {
                count: 12,
                expected: {
                    structure: [
                        { items: ['25%', '25%', '25%', '25%'], height: '33%' },
                        { items: ['25%', '25%', '25%', '25%'], height: '33%' },
                        { items: ['25%', '25%', '25%', '25%'], height: '34%' }
                    ]
                }
            },
            {
                count: 13,
                expected: {
                    structure: [
                        { items: ['25%', '25%', '25%', '25%'], height: '25%' },
                        { items: ['25%', '25%', '25%', '25%'], height: '25%' },
                        { items: ['25%', '25%', '25%', '25%'], height: '25%' },
                        { items: ['100%'], height: '25%' }
                    ]
                }
            },
            {
                count: 14,
                expected: {
                    structure: [
                        { items: ['25%', '25%', '25%', '25%'], height: '25%' },
                        { items: ['25%', '25%', '25%', '25%'], height: '25%' },
                        { items: ['25%', '25%', '25%', '25%'], height: '25%' },
                        { items: ['50%', '50%'], height: '25%' }
                    ]
                }
            },
            {
                count: 15,
                expected: {
                    structure: [
                        { items: ['33.4%', '33.3%', '33.3%'], height: '20%' },
                        { items: ['33.4%', '33.3%', '33.3%'], height: '20%' },
                        { items: ['33.4%', '33.3%', '33.3%'], height: '20%' },
                        { items: ['33.4%', '33.3%', '33.3%'], height: '20%' },
                        { items: ['33.4%', '33.3%', '33.3%'], height: '20%' }
                    ]
                }
            }
        ];
        $.each(tests, function (_index, test) {
            it("should get a default layout Nr.of widget=" + test.count, function () {
                var result = dashboardModel.GetDefaultLayoutConfig(test.count);
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".UpdatePublicationsWatcher", function () {

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

    describe(".GetDashboardFilters", function () {
        it("should get dashboard filters by widget filters view model", function () {
            dashboardModel.Data(mockDashboardModel);
            var result = dashboardModel.GetDashboardFilters();

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

    describe(".SetDashboardFilters", function () {

        it("should set dashboard filters by widget filters view model", function () {
            dashboardModel.Data({});
            dashboardModel.SetDashboardFilters(mockDashboardModel.filters);

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

    describe(".ExtendDashboardFilter", function () {

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

    describe(".GetAllDashboardFilterFieldIds", function () {
        it("should get all filter ids", function () {
            dashboardModel.Data(mockDashboardModel);

            var result = dashboardModel.GetAllDashboardFilterFieldIds();

            expect(result.length).toEqual(2);
        });
    });

    describe(".GetAngleExecutionParameters", function () {
        it("should get Angle execution parameters", function () {
            // prepare
            var angle = {
                is_parameterized: true,
                query_definition: [
                    { queryblock_type: 'other' },
                    {
                        queryblock_type: 'query_steps',
                        query_steps: [
                            { is_execution_parameter: false },
                            { is_execution_parameter: true }
                        ]
                    }
                ]
            };
            var display = {
                is_parameterized: true,
                query_blocks: [
                    {
                        queryblock_type: 'query_steps',
                        query_steps: [
                            { is_execution_parameter: true },
                            { is_execution_parameter: false },
                            { is_execution_parameter: true }
                        ]
                    }
                ]
            };
            var result = dashboardModel.GetAngleExecutionParameters(angle, display);

            // assert
            expect(result.angle).not.toBeNull();
            expect(result.display).not.toBeNull();
            expect(result.query_steps.length).toEqual(3);
        });
    });

    describe(".GetAngleExecutionParametersInfo", function () {
        it("should get Angle execution parameters info", function () {
            // prepare
            spyOn(dashboardModel, 'GetAngleExecutionParameters').and.returnValue({
                query_steps: [
                    { is_angle: true },
                    { is_angle: false },
                    { is_angle: false }
                ]
            });
            var result = dashboardModel.GetAngleExecutionParametersInfo({}, {});

            // assert
            expect(result.angleQuery.execution_parameters.length).toEqual(1);
            expect(result.displayQuery.execution_parameters.length).toEqual(2);
        });
        it("should not get Angle execution parameters info", function () {
            // prepare
            spyOn(dashboardModel, 'GetAngleExecutionParameters').and.returnValue({
                query_steps: []
            });
            var result = dashboardModel.GetAngleExecutionParametersInfo({}, {});

            // assert
            expect(result).toEqual({});
        });
    });

    describe(".GetDashboardExecutionParameters", function () {
        it("should Dashboard execution parameters", function () {
            // prepare
            dashboardModel.Data({
                model: '/models/1',
                filters: [
                    { is_execution_parameter: true },                    
                    { is_execution_parameter: false },                    
                    { is_execution_parameter: true }
                ],
                name: ko.observable('my-name')
            });
            var result = dashboardModel.GetDashboardExecutionParameters();

            // assert
            expect(result.angle.model).toEqual('/models/1');
            expect(result.angle.is_parameterized).toEqual(false);
            expect(result.angle.query_definition).toEqual([{
                queryblock_type: 'base_classes',
                base_classes: []
            }]);
            expect(result.display.name).toEqual('my-name');
            expect(result.display.is_parameterized).toEqual(true);
            expect(result.display.query_blocks).toEqual([{
                queryblock_type: 'query_steps',
                query_steps: [
                    { is_execution_parameter: true },                  
                    { is_execution_parameter: true }
                ]
            }]);
            expect(result.query_steps).toEqual([
                { is_execution_parameter: true },                  
                { is_execution_parameter: true }
            ]);
        });
    });

    describe(".SetBusinessProcesses", function () {
        it("should update locally for adhoc Dashboard", function () {
            // prepare
            var labels = ['Gaj1', 'Gaj2'];
            dashboardModel.Data({ assigned_labels: ['Others'] });
            spyOn(dashboardModel, 'IsTemporaryDashboard').and.returnValue(true);
            spyOn(dashboardModel, 'GetData');
            spyOn(dashboardModel, 'SaveDashboard');
            dashboardModel.SetBusinessProcesses(labels);

            // assert
            expect(dashboardModel.Data().assigned_labels).toEqual(labels);
            expect(dashboardModel.SaveDashboard).not.toHaveBeenCalled();
        });
        it("should save Dashboard", function () {
            // prepare
            var labels = ['Gaj1', 'Gaj2'];
            dashboardModel.Data({ assign_labels: ['Others'] });
            spyOn(dashboardModel, 'IsTemporaryDashboard').and.returnValue(false);
            spyOn(dashboardModel, 'GetData');
            spyOn(dashboardModel, 'SaveDashboard');
            dashboardModel.SetBusinessProcesses(labels);

            // assert
            expect(dashboardModel.SaveDashboard).toHaveBeenCalled();
        });
    });

    describe(".SetExecuteOnLogin", function () {
        it("should update locally for adhoc Dashboard", function () {
            // prepare
            dashboardModel.Data({ user_specific: { execute_on_login: ko.observable(false) } });
            spyOn(dashboardModel, 'IsTemporaryDashboard').and.returnValue(true);
            spyOn(dashboardModel, 'GetData');
            spyOn(dashboardModel, 'SaveDashboard');
            dashboardModel.SetExecuteOnLogin(true);

            // assert
            expect(dashboardModel.Data().user_specific.execute_on_login()).toEqual(true);
            expect(dashboardModel.SaveDashboard).not.toHaveBeenCalled();
        });
        it("should save Dashboard", function () {
            // prepare
            dashboardModel.Data({ user_specific: { execute_on_login: ko.observable(false) } });
            spyOn(dashboardModel, 'IsTemporaryDashboard').and.returnValue(false);
            spyOn(dashboardModel, 'GetData');
            spyOn(dashboardModel, 'SaveDashboard');
            dashboardModel.SetExecuteOnLogin(true);

            // assert
            expect(dashboardModel.SaveDashboard).toHaveBeenCalled();
        });
    });

});
