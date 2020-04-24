/// <reference path="/Dependencies/ViewModels/Models/User/usermodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/User/privileges.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/resultmodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/displayqueryblockmodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/displaymodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/DisplayFieldModel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/displaydropdownlistmodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/anglequerystepmodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/AngleInfoModel.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/DirectoryHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/FieldCategoryHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/SystemDefaultUserSettingHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/SystemInformationHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/SystemLanguagesHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/SystemSettingHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ModelsHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ModelCurrentInstanceHandler.js" />

/// <reference path="/Dependencies/ViewModels/Models/Dashboard/dashboardmodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Dashboard/DashboardWidgetModel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Dashboard/dashboardresultmodel.js" />


describe("DashboardResultViewModel", function () {
    var dashboardResultViewModel;
    var dashboardModel;
    var widGetModel;
    var testElementId = "TestElementId";

    beforeEach(function () {
        dashboardModel = new DashboardViewModel({});
        widGetModel = new DashboardWidgetViewModel();
        widGetModel.GetAngle = $.noop;
        widGetModel.GetDisplay = $.noop;
        dashboardResultViewModel = new DashboardResultViewModel(testElementId, widGetModel, dashboardModel);
    });

    describe(".Execute", function () {

        it("should call CheckPostIntegrityQueue, PostIntegrity, PostResult and GetResult function", function () {
            spyOn(dashboardResultViewModel, 'CheckPostIntegrityQueue').and.returnValue($.when());
            spyOn(dashboardResultViewModel, 'PostIntegrity').and.returnValue($.when());
            spyOn(dashboardResultViewModel, 'PostResult').and.returnValue($.when({}, {}));
            spyOn(dashboardResultViewModel, 'GetResult').and.callFake($.noop);

            // act
            dashboardResultViewModel.Execute();

            // assert
            expect(dashboardResultViewModel.CheckPostIntegrityQueue).toHaveBeenCalled();
            expect(dashboardResultViewModel.PostIntegrity).toHaveBeenCalled();
            expect(dashboardResultViewModel.PostResult).toHaveBeenCalled();
            expect(dashboardResultViewModel.GetResult).toHaveBeenCalled();
        });

    });

    describe(".PostResult", function () {

        it("should get 2 response values", function () {
            spyOn(dashboardResultViewModel, 'CreatePostData').and.returnValue({
                query_definition: 'test_definition'
            });
            spyOn(window, 'CreateDataToWebService').and.returnValue($.when('test_response'));

            // act
            dashboardResultViewModel.PostResult()
                .done(function (result1, result2) {
                    // assert
                    expect('test_response').toEqual(result1);
                    expect('test_definition').toEqual(result2);
                });
        });

    });

    describe(".PostIntegrity", function () {

        beforeEach(function () {
            dashboardResultViewModel.Angle = { model: '' };
            spyOn(dashboardResultViewModel.WidgetModel, 'SetExtendedFilters').and.callFake($.noop);
            spyOn(window, 'CreateDataToWebService').and.returnValue($.when({
                query_definition: [
                    {
                        query_steps: 'step1'
                    },
                    {
                        query_steps: 'step2'
                    }
                ]
            }));
            spyOn(dashboardResultViewModel, 'CreatePostIntegrityData').and.returnValue(null);
            spyOn(dashboardResultViewModel.DashboardModel, 'Data').and.returnValue({ model: '' });
        });

        it("should call SetExtendedFilters 1 time if cannot extend filters", function (done) {
            spyOn(dashboardResultViewModel.WidgetModel, 'CanExtendFilter').and.returnValue(false);
            spyOn(dashboardResultViewModel.DashboardModel, 'GetDashboardFilters').and.returnValue([1, 1, 1, 1]);
            dashboardResultViewModel.PostIntegrity()
                .done(function () {
                    // assert
                    expect(dashboardResultViewModel.WidgetModel.SetExtendedFilters).toHaveBeenCalledTimes(1);
                    done();
                });
        });

        it("should call SetExtendedFilters 1 time if no filter", function (done) {
            spyOn(dashboardResultViewModel.WidgetModel, 'CanExtendFilter').and.returnValue(true);
            spyOn(dashboardResultViewModel.DashboardModel, 'GetDashboardFilters').and.returnValue([]);

            // act
            dashboardResultViewModel.PostIntegrity()
                .done(function () {
                    // assert
                    expect(dashboardResultViewModel.WidgetModel.SetExtendedFilters).toHaveBeenCalledTimes(1);
                    done();
                });
        });

        it("should call SetExtendedFilters 2 times if has filters", function (done) {
            spyOn(dashboardResultViewModel.WidgetModel, 'CanExtendFilter').and.returnValue(true);
            spyOn(dashboardResultViewModel.DashboardModel, 'GetDashboardFilters').and.returnValue([1, 1, 1, 1]);

            // act
            dashboardResultViewModel.PostIntegrity()
                .done(function () {
                    // assert
                    expect(dashboardResultViewModel.WidgetModel.SetExtendedFilters).toHaveBeenCalledTimes(2);
                    done();
                });
        });
    });

    describe(".CreatePostIntegrityData", function () {


        it("should get data from query_definition property", function () {
            spyOn(dashboardResultViewModel.DashboardModel, 'GetDashboardFilters').and.returnValue([]);
            spyOn(dashboardResultViewModel.WidgetModel, 'GetQueryDefinitionsWithNewFilters').and.returnValue('test');

            // act
            var result = dashboardResultViewModel.CreatePostIntegrityData();

            // assert
            expect('test').toEqual(result.query_definition);
        });

    });

    describe(".GetPostExecuteParameters", function () {

        it("should get empty execution parameters if no execution parameters in dashboard", function () {
            var executeParameters = [];
            var angleQueryBlocks = [
                { queryblock_type: 'query_steps', query_steps: [{ field: 'A', operator: 'equal_to', arguments: [], is_execution_parameter: true }] }
            ];
            var displayQueryBlocks = [];
            var result = dashboardResultViewModel.GetPostExecuteParameters(executeParameters, angleQueryBlocks, displayQueryBlocks);
            expect(result.angle).toEqual([]);
            expect(result.display).toEqual([]);
        });

        it("should get empty execution parameters if no execution parameters in Angle or Display", function () {
            var executeParameters = [
                { field: 'A', operator: 'equal_to', arguments: [], is_execution_parameter: true }
            ];
            var angleQueryBlocks = [];
            var displayQueryBlocks = [];
            var result = dashboardResultViewModel.GetPostExecuteParameters(executeParameters, angleQueryBlocks, displayQueryBlocks);
            expect(result.angle).toEqual([]);
            expect(result.display).toEqual([]);
        });

        it("should get execution parameters in Angle and Display", function () {
            var executeParameters = [
                { field: 'A', operator: 'equal_to', arguments: [], is_execution_parameter: true },
                { field: 'B', operator: 'equal_to', arguments: [], is_execution_parameter: true }
            ];
            var angleQueryBlocks = [
                {
                    queryblock_type: 'query_steps',
                    query_steps: [
                        { field: 'A', operator: 'not_equal_to', arguments: [], is_execution_parameter: false },
                        { field: 'A', operator: 'not_equal_to', arguments: [], is_execution_parameter: true }
                    ]
                }
            ];
            var displayQueryBlocks = [
                {
                    queryblock_type: 'query_steps',
                    query_steps: [{ field: 'B', operator: 'not_equal_to', arguments: [], is_execution_parameter: true }]
                }
            ];

            var result = dashboardResultViewModel.GetPostExecuteParameters(executeParameters, angleQueryBlocks, displayQueryBlocks);
            expect(result.angle).toEqual([{ field: 'A', operator: 'equal_to', arguments: [], is_execution_parameter: true }]);
            expect(result.display).toEqual([{ field: 'B', operator: 'equal_to', arguments: [], is_execution_parameter: true }]);
        });

    });

    describe(".CreatePostData", function () {

        beforeEach(function () {
            dashboardResultViewModel.Angle = { query_definition: [] };
            dashboardResultViewModel.Display = { query_definition: [] };

            dashboardResultViewModel.WidgetModel.angle = 'angle';
            dashboardResultViewModel.WidgetModel.display = 'display';

            spyOn(dashboardResultViewModel, 'GetPostExecuteParameters').and.returnValue({ angle: [], display: [] });
            spyOn(dashboardResultViewModel.DashboardModel, 'IsTemporaryDashboard').and.returnValue(true);

            spyOn(dashboardResultViewModel.WidgetModel, 'GetBlockQuerySteps').and.returnValue({ query_steps: [] });
            spyOn(dashboardResultViewModel.WidgetModel, 'GetAggregationQueryStep').and.returnValue({});
        });

        it("should included base display if no aggregation step", function () {
            spyOn(dashboardResultViewModel.WidgetModel, 'GetExtendedFilters').and.returnValue([]);
            dashboardResultViewModel.Display.contained_aggregation_steps = false;
            var postData = dashboardResultViewModel.CreatePostData();
            var baseDisplay = postData.query_definition.findObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.BASE_DISPLAY);
            expect(baseDisplay).not.toBeNull();
        });

        it("should included base display if no filter", function () {
            spyOn(dashboardResultViewModel.WidgetModel, 'GetExtendedFilters').and.returnValue([]);
            dashboardResultViewModel.Display.contained_aggregation_steps = true;
            var postData = dashboardResultViewModel.CreatePostData();
            var baseDisplay = postData.query_definition.findObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.BASE_DISPLAY);
            expect(baseDisplay).not.toBeNull();
        });

        it("should excluded base display if have filters and contain aggregation step", function () {
            spyOn(dashboardResultViewModel.WidgetModel, 'GetExtendedFilters').and.returnValue([{}]);
            dashboardResultViewModel.Display.contained_aggregation_steps = true;
            var postData = dashboardResultViewModel.CreatePostData();
            var baseDisplay = postData.query_definition.findObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.BASE_DISPLAY);
            expect(baseDisplay).toBeNull();
        });

    });
});
