/// <reference path="/Dependencies/ViewModels/Models/User/usersettingmodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/User/usermodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/User/privileges.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/PopupPageHandlers.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ValidationHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/WidgetFilter/WidgetFilterHelper.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ItemDescription/ItemDescriptionView.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ItemDescription/ItemDescriptionHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepView.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepViewModel.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryDefinitionHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepFilterHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepJumpHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepSortableHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepAggregationHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/AngleUserSpecificHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/AngleBusinessProcessHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/ResultHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/BaseItemHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/AngleStatisticView.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/AngleStatisticHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/AngleHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/DisplayOverviewHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/DisplayDrilldownHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/DisplayResultHandler/BaseDisplayResultHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/DisplayResultHandler/DisplayListResultHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/DisplayStatisticView.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/DisplayStatisticHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/DisplayHandler.js" />


describe("DisplayListResultHandlerTest", function () {
    var displayListResultHandler;
    beforeEach(function () {
        var displayHandler = new DisplayHandler({ display_type: 'list' }, new AngleHandler());
        displayListResultHandler = new DisplayListResultHandler(displayHandler);
    });

    describe("constructor", function () {
        it('should set DisplayHandler', function () {
            // assert
            expect(displayListResultHandler.DisplayHandler instanceof DisplayHandler).toEqual(true);
        });
    });
});
