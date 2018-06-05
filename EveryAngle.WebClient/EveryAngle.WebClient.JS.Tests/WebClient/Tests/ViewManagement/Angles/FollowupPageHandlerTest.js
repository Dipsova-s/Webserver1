/// <reference path="/Dependencies/Helper/DefaultValueHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/PopupPageHandlers.js" />
/// <reference path="/Dependencies/ViewModels/Shared/QueryBlock/QueryStepModel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/resultmodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/displayqueryblockmodel.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/WidgetFilter/WidgetFilterModel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/displaymodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/HistoryModel.js" />
/// <reference path="/Dependencies/ViewManagement/Angles/FollowupPageHandler.js" />

describe("FollowupPageHandler", function () {

    var followupPageHandler;

    beforeEach(function () {
        followupPageHandler = new FollowupPageHandler();
    });

    describe(".ApplyFollowupForAdhocDisplay(followup)", function () {

        beforeEach(function () {
            spyOn(progressbarModel, 'ShowStartProgressBar').and.callFake($.noop);
            spyOn(historyModel, 'Get').and.returnValue({});
            spyOn(displayQueryBlockModel, 'QuerySteps').and.returnValue([]);
            spyOn(displayQueryBlockModel, 'TempQuerySteps').and.returnValue([]);
            spyOn(displayQueryBlockModel, 'CollectQueryBlocks').and.returnValue([]);
            spyOn(displayQueryBlockModel, 'GetQueryStepByNotInType').and.returnValue([]);
            spyOn(resultModel, 'PostResult').and.returnValue($.when());
            spyOn(resultModel, 'GetResult').and.returnValue($.when());
            spyOn(resultModel, 'Data').and.returnValue({});
            spyOn(resultModel, 'ApplyResult').and.callFake($.noop);
        });

        it("should update display fields in history model for display type list", function () {

            // default display data
            var displayData = {
                uri: 'display_1',
                display_type: 'list',
                fields: []
            };
            displayModel.Data(displayData);
            displayModel.Data.commit();

            spyOn(displayModel, 'GetDefaultListFields').and.returnValue([{ field: 'A' }]);

            followupPageHandler.ApplyFollowupForAdhocDisplay({});

            // fields in history model should be updated
            expect(1).toEqual(historyModel.Data()['display_1'].fields.length);
        });

        it("should call method ExecuteFollowup for display type pivot/chart", function () {

            // prepare fake handler
            window.displayDetailPageHandler = {
                ExecuteFollowup: $.noop
            };

            // default display data
            var displayData = {
                uri: 'display_1',
                display_type: 'pivot',
                fields: []
            };
            displayModel.Data(displayData);
            displayModel.Data.commit();

            spyOn(displayDetailPageHandler, 'ExecuteFollowup');

            followupPageHandler.ApplyFollowupForAdhocDisplay({});

            // fields in history model should be updated
            expect(displayDetailPageHandler.ExecuteFollowup).toHaveBeenCalled();
        });
    });
});