/// <reference path="/Dependencies/ViewModels/Models/Angle/resultmodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/displayqueryblockmodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/AngleInfoModel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/DisplayModel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Dashboard/dashboardmodel.js" />
/// <reference path="/Dependencies/viewmanagement/Angles/FieldSettingsHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/SearchStorageHandler.js" />
/// <reference path="/Dependencies/viewmanagement/Search/ItemInfoHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/WidgetDetails/WidgetDetailsHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/WidgetDetails/WidgetDetailsView.js" />
/// <reference path="/Dependencies/ViewManagement/shared/ModelsHandler.js" />

describe("ItemInfoHandler", function () {

    var itemInfoHandler;

    var widgets = [{
        "uri": "/dashboards/506/widgets/13",
        "angle": "/models/1/angles/469",
        "display": "/models/1/angles/469/displays/2515"
    },
    {
        "uri": "/dashboards/506/widgets/14",
        "angle": "/models/1/angles/469",
        "display": "/models/1/angles/469/displays/2555"
    },
    {
        "uri": "/dashboards/506/widgets/15",
        "angle": "/models/1/angles/469",
        "display": "/models/1/angles/469/displays/2515"
    },
    {
        "uri": "/dashboards/506/widgets/16",
        "angle": "/models/1/angles/469",
        "display": "/models/1/angles/469/displays/2516"
    }, {
        "uri": "/dashboards/506/widgets/17",
        "angle": "/models/1/angles/470",
        "display": "/models/1/angles/470/displays/2517"
    }, {
        "uri": "/dashboards/506/widgets/18",
        "angle": "/models/2/angles/507",
        "display": "/models/2/angles/507/displays/2592"
    }];

    beforeEach(function () {
        itemInfoHandler = new ItemInfoHandler();
        dashboardModel.Angles = [{
            uri: "/models/1/angles/469",
            display_definitions: [
                { uri: "/models/1/angles/469/displays/2515" },
                { uri: "/models/1/angles/469/displays/2516" }
            ],
            model: "/models/1"
        }, {
            uri: "/models/1/angles/470",
            display_definitions: [
                { uri: "/models/1/angles/470/displays/2517" }
            ],
            model: "/models/1"
        }, {
            uri: "/models/2/angles/507",
            display_definitions: [
                { uri: "/models/2/angles/507/displays/2592" }
            ],
            model: "/models/2"
        }];
    });


    describe("when create new instance", function () {
        it("should be defined", function () {
            expect(itemInfoHandler).toBeDefined();
        });
    });

    describe("call CreateAngleListInDashboardInfo", function () {
        it("should return angle list equal to 3", function () {
            itemInfoHandler.HandlerInfoDetails = new WidgetDetailsHandler(null, '', [], []);
            var angleList = itemInfoHandler.CreateAngleListInDashboardInfo(widgets);
            expect(angleList.length).toEqual(3);

        });

    });

    describe("call CreateModelListInDashboardInfo", function () {

        it("should return model list equal to 2", function () {
            itemInfoHandler.HandlerInfoDetails = new WidgetDetailsHandler(null, '', [], []);
            spyOn(modelsHandler, 'GetModelName').and.callFake(function (model) {
                if (model === "/models/1")
                    return "Model 1";
                else if (model === "/models/2")
                    return "Model 2";
            });
            var angleList = itemInfoHandler.CreateAngleListInDashboardInfo(widgets);
            var modelList = itemInfoHandler.CreateModelListInDashboardInfo(angleList);
            expect(modelList.length).toEqual(2);

        });

    });
});

