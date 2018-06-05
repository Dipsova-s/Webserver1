/// <reference path="/Dependencies/ViewModels/Models/Angle/resultmodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/historymodel.js" />
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
    var widGetModel;
    var testElementId = "TestElementId";

    beforeEach(function () {
        widGetModel = new DashboardWidgetViewModel();
        widGetModel.GetAngle = $.noop;
        widGetModel.GetDisplay = $.noop;
        dashboardResultViewModel = new DashboardResultViewModel(testElementId, widGetModel);
    });

    describe("when create new instance", function () {

        it("should be defined", function () {
            expect(dashboardResultViewModel).toBeDefined();
        });

    });

    describe("call GetPostExecuteParameters", function () {

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

});
