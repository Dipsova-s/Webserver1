/// <reference path="/Dependencies/ViewModels/Models/Angle/resultmodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/displayqueryblockmodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/AngleInfoModel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/DisplayModel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Dashboard/dashboardmodel.js" />
/// <reference path="/Dependencies/viewmanagement/Angles/FieldSettingsHandler.js" />
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

    describe(".LoadItem(fn, uri)", function () {

        it("should store loaded data in cache", function () {
            var uri = 'uri1';
            var fnGetData = function () {
                return 'data';
            };

            expect(itemInfoHandler.CacheItems[uri]).not.toBeDefined();
            itemInfoHandler.LoadItem(fnGetData, uri)
                .done(function () {
                    expect(itemInfoHandler.CacheItems[uri]).toBeDefined();
                });
        });

        it("should use data from cache", function () {
            var uri = 'uri1';
            var fnGetData = function () {
                return 'data_new';
            };
            itemInfoHandler.CacheItems[uri] = 'data_old';
            
            itemInfoHandler.LoadItem(fnGetData, uri)
                .done(function () {
                    expect(itemInfoHandler.CacheItems[uri]).toBe('data_old');
                });
        });

    });

    describe(".GetDisplaysElementSettings(contentWidth, target, totalDisplays)", function () {

        var tests = [
            {
                title: 'should show display list at bottom if it has enough space',
                totalDisplays: 1,
                expectedArrow: 'k-window-arrow-e'
            },
            {
                title: 'should show display list at top if no space at bottom',
                totalDisplays: 10,
                expectedArrow: 'k-window-arrow-e bottom'
            }
        ];

        $.each(tests, function (index, test) {
            it(test.title, function () {
                var contentWidth = 500;
                var target = {
                    height: function () { return 20; },
                    width: function () { return 20; },
                    offset: function () { return { left: 0, top: 500 }; }
                };
                window.WC.Window.Height = 600;
                var result = itemInfoHandler.GetDisplaysElementSettings(contentWidth, target, test.totalDisplays);
                expect(result.arrow).toEqual(test.expectedArrow);
            });
        });

    });

    describe(".CreateAngleListInDashboardInfo(widgets)", function () {
        it("should return angle list equal to 3", function () {
            itemInfoHandler.HandlerInfoDetails = new WidgetDetailsHandler(null, '', [], []);
            var angleList = itemInfoHandler.CreateAngleListInDashboardInfo(widgets);
            expect(angleList.length).toEqual(3);
        });

    });

    describe(".CreateModelListInDashboardInfo(angles)", function () {

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

    describe(".ShowAngleExecutionParameterPopupFunction(angle, display, event)", function () {

        beforeEach(function () {
            spyOn(itemInfoHandler, 'ShowAngleExecutionParameterPopup').and.callFake($.noop);
            spyOn(WC.Utility, 'RedirectUrl').and.callFake($.noop);
        });

        it("should call ItemInfoHandler.ShowAngleExecutionParameterPopup if angle is_parameterized", function () {
            var angle = { is_parameterized: true };
            var display = {};
            var event = {};
            itemInfoHandler.ShowAngleExecutionParameterPopupFunction(angle, display, event);

            // assert
            expect(itemInfoHandler.ShowAngleExecutionParameterPopup).toHaveBeenCalled();
        });

        it("should call ItemInfoHandler.ShowAngleExecutionParameterPopup if display is_parameterized", function () {
            var angle = { };
            var display = { is_parameterized: true };
            var event = {};
            itemInfoHandler.ShowAngleExecutionParameterPopupFunction(angle, display, event);

            // assert
            expect(itemInfoHandler.ShowAngleExecutionParameterPopup).toHaveBeenCalled();
        });

        it("should call WC.Utility.RedirectUrl if no is_parameterized", function () {
            var angle = {};
            var display = {};
            var event = { currentTarget: { href: '' } };
            itemInfoHandler.ShowAngleExecutionParameterPopupFunction(angle, display, event);

            // assert
            expect(WC.Utility.RedirectUrl).toHaveBeenCalled();
        });

    });
});

