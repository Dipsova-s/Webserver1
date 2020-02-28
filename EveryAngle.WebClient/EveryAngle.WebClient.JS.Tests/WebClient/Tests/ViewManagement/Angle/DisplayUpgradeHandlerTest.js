/// <reference path="/Dependencies/ViewModels/Models/User/usersettingmodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/HistoryModel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/DisplayModel.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/DisplayUpgradeHandler.js" />

describe("DisplayUpgradeHandler", function () {

    var displayUpgradeHandler;

    beforeEach(function () {
        displayUpgradeHandler = new DisplayUpgradeHandler();
    });

    describe("when create new instance", function () {
        it("should be defined", function () {
            expect(displayUpgradeHandler).toBeDefined();
        });

        it("should define UpgradableProperties property", function () {
            expect(displayUpgradeHandler.UpgradableProperties).toEqual(['display_details', 'fields', 'query_blocks']);
        });
    });

    describe("call GetUpgradeDisplayData", function () {
        it("should not get upgrading data if upgrades_properties is empty", function () {
            var currentDisplay = {
                upgrades_properties: []
            };
            var sourceDisplay = {};
            var result = displayUpgradeHandler.GetUpgradeDisplayData(currentDisplay, sourceDisplay);
            expect(result).toEqual({});
        });

        it("should not get upgrading data if no priviledge", function () {
            var currentDisplay = {
                upgrades_properties: ['fields'],
                authorizations: { update: false }
            };
            var sourceDisplay = {};
            var result = displayUpgradeHandler.GetUpgradeDisplayData(currentDisplay, sourceDisplay);
            expect(result).toEqual({});
        });

        it("should get upgrading data if from upgrades_properties property and a difference data with source display", function () {
            var currentDisplay = {
                upgrades_properties: ['fields', 'display_details'],
                authorizations: { update: true },
                display_details: "{\"changed\":true}",
                fields: [{
                    "field": "f1", "field_details": "{\"sorting\":\"desc\"}"
                }, {
                    "field": "f2", "field_details": "{\"sorting\":\"asc\"}"
                }],
                query_blocks: [{
                    "query_steps": [{
                        "aggregation_fields": [{
                            "field": "count",
                            "operator": "count"
                        }],
                        "step_type": "aggregation"
                    }],
                    "queryblock_type": "query_steps"
                }],
                test1: "new value",
                test2: "same value"
            };
            var sourceDisplay = {
                display_details: "{\"changed\":false}",
                fields: [{
                    "field": "f1"
                }, {
                    "field": "f2"
                }],
                query_blocks: [{
                    "query_steps": [{
                        "aggregation_fields": [{
                            "field": "count",
                            "operator": "count"
                        }],
                        "grouping_fields": [],
                        "step_type": "aggregation"
                    }],
                    "queryblock_type": "query_steps"
                }],
                test1: 'old value',
                test2: 'same value'
            };
            var result = displayUpgradeHandler.GetUpgradeDisplayData(currentDisplay, sourceDisplay);

            // got from upgrades_properties property
            expect(result.display_details).toEqual("{\"changed\":true}");
            expect(result.fields).toEqual([{
                "field": "f1", "field_details": "{\"sorting\":\"desc\"}"
            }, {
                "field": "f2", "field_details": "{\"sorting\":\"asc\"}"
            }]);

            // got from WC.ModelHelper.GetChangeDisplay function
            expect(result.query_blocks).toEqual([{
                "query_steps": [{
                    "aggregation_fields": [{
                        "field": "count",
                        "operator": "count"
                    }],
                    "step_type": "aggregation"
                }],
                "queryblock_type": "query_steps"
            }]);
            expect(result.test1).not.toBeDefined();
        });
    });

    describe("call UpgradeDisplay", function () {

        beforeEach(function () {
            spyOn(window, 'UpdateDataToWebService').and.callFake(function () { return $.when(true); });
            spyOn(displayUpgradeHandler, 'UpgradeDisplayDone').and.callFake($.noop);
        });

        it("should update display if have an update data", function () {
            var handler = {};
            var displayUri = '/models/1/angles/1/display/1';
            var upgradeData = { fields: [] };
            displayUpgradeHandler.UpgradeDisplay(handler, displayUri, upgradeData)
                .done(function (result) {
                    expect(result).toEqual(true);
                });
        });

        it("should not update display if is adhoc display", function () {
            var handler = {};
            var displayUri = '/models/1/angles/95c5f1a4-4789-36c6-2ff6-480304146935/display/95c5f1a4-4789-36c6-2ff6-480304146932';
            var upgradeData = { fields: [] };
            displayUpgradeHandler.UpgradeDisplay(handler, displayUri, upgradeData)
                .done(function (result) {
                    expect(result).toEqual(false);
                });
        });

        it("should not update display if no update data", function () {
            var handler = {};
            var displayUri = '/models/1/angles/1/display/1';
            var upgradeData = {};
            displayUpgradeHandler.UpgradeDisplay(handler, displayUri, upgradeData)
                .done(function (result) {
                    expect(result).toEqual(false);
                });
        });
    });

    describe("call UpgradeDisplayDone", function () {

        var handler;
        beforeEach(function () {
            handler = {
                Models: {
                    Angle: {
                        Data: ko.observable({ model: '/models/1' })
                    },
                    Display: {
                        Data: ko.protectedObservable()
                    }
                },
                DashBoardMode: ko.observable(false)
            };

            handler.Models.Display.Data({
                is_upgraded: false,
                upgrades_properties: ['fields']
            });
            handler.Models.Display.Data.commit();

            spyOn(historyModel, 'Get').and.callFake(function () { return {}; });
            spyOn(historyModel, 'Set');
        });

        it("should update history model if not dashboard mode", function () {
            handler.DashBoardMode(false);
            var displayUri = '/models/1/angles/1/display/1';
            var display = { fields: [], display_details: '{}' };
            var upgradeData = { fields: [], display_details: '{}' };
            displayUpgradeHandler.UpgradeDisplayDone(handler, displayUri, display, upgradeData);

            expect(historyModel.Set).toHaveBeenCalled();
        });

        it("should not update history model if dashboard mode", function () {
            handler.DashBoardMode(true);
            var displayUri = '/models/1/angles/1/display/1';
            var display = { fields: [], display_details: '{}' };
            var upgradeData = { fields: [], display_details: '{}' };
            displayUpgradeHandler.UpgradeDisplayDone(handler, displayUri, display, upgradeData);

            expect(historyModel.Set).not.toHaveBeenCalled();
        });

    });

});