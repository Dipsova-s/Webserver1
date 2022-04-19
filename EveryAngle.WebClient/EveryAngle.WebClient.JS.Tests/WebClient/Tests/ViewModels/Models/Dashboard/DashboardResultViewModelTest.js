/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/User/usermodel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/User/privileges.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/resultmodel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/displayqueryblockmodel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/displaymodel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/DisplayFieldModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/displaydropdownlistmodel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/anglequerystepmodel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/AngleInfoModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/DirectoryHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/FieldCategoryHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/SystemDefaultUserSettingHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/SystemInformationHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/SystemLanguagesHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/SystemSettingHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ModelsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ModelCurrentInstanceHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Dashboard/dashboardmodel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Dashboard/DashboardWidgetModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Dashboard/dashboardresultmodel.js" />


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
            dashboardResultViewModel.Execute()
                .then(function () {
                    expect(dashboardResultViewModel.PostIntegrity).toHaveBeenCalled();
                    expect(dashboardResultViewModel.PostResult).toHaveBeenCalled();
                    expect(dashboardResultViewModel.GetResult).toHaveBeenCalled();
                });

            // assert
            expect(dashboardResultViewModel.CheckPostIntegrityQueue).toHaveBeenCalled();
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
            expect(window.CreateDataToWebService).toHaveBeenCalled();
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
            dashboardResultViewModel.Angle = {
                query_definition: [
                    { queryblock_type: 'base_classes', base_classes: [] },
                    { queryblock_type: 'query_steps', query_steps: [] }
                ]
            };
            dashboardResultViewModel.Display = {
                query_blocks: [
                    { queryblock_type: 'query_steps', query_steps: [] }
                ]
            };
            spyOn(dashboardResultViewModel.DashboardModel, 'GetDashboardFilters').and.returnValue([]);

            // act
            var result = dashboardResultViewModel.CreatePostIntegrityData();

            // assert
            expect(result.query_definition.length).toEqual(2);
        });
    });

    describe(".CreatePostData", function () {

        beforeEach(function () {
            dashboardResultViewModel.WidgetModel.angle = '/angles/1';
            dashboardResultViewModel.WidgetModel.display = '/displays/1';
            spyOn(dashboardResultViewModel.DashboardModel, 'GetAngleExecutionParametersInfo').and.returnValue({
                angleQuery: { execution_parameters: 'my-angle-parameters' },
                displayQuery: { execution_parameters: 'my-display-parameters' }
            });
            spyOn(dashboardResultViewModel.DashboardModel, 'IsTemporaryDashboard').and.returnValue(true);
            spyOn(dashboardResultViewModel.WidgetModel, 'GetBlockQuerySteps').and.returnValue({ queryblock_type: 'query_steps' });
        });

        it("should use base display if no filter", function () {
            spyOn(dashboardResultViewModel.WidgetModel, 'GetExtendedFilters').and.returnValue([]);
            var result = dashboardResultViewModel.CreatePostData();
            expect(result.query_definition.length).toEqual(2);
            expect(result.query_definition[0].queryblock_type).toEqual('base_angle');
            expect(result.query_definition[0].execution_parameters).toEqual('my-angle-parameters');
            expect(result.query_definition[1].queryblock_type).toEqual('base_display');
            expect(result.query_definition[1].execution_parameters).toEqual('my-display-parameters');
        });

        it("should use query steps if have filters", function () {
            spyOn(dashboardResultViewModel.WidgetModel, 'GetExtendedFilters').and.returnValue([{}]);
            var result = dashboardResultViewModel.CreatePostData();
            expect(result.query_definition.length).toEqual(2);
            expect(result.query_definition[0].queryblock_type).toEqual('base_angle');
            expect(result.query_definition[0].execution_parameters).toEqual('my-angle-parameters');
            expect(result.query_definition[1].queryblock_type).toEqual('query_steps');
            expect(result.query_definition[1].execution_parameters).not.toBeDefined();
        });

    });
});
