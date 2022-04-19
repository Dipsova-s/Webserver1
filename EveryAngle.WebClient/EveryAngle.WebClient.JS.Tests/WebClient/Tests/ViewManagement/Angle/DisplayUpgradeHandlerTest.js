/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/DisplayModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/DisplayUpgradeHandler.js" />

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
            expect(displayUpgradeHandler.UpgradableProperties).toEqual(['display_details', 'fields']);
        });
    });

    describe(".GetUpgradeDisplayData", function () {
        it("should not get upgrading data if upgrade_properties is empty", function () {
            var currentDisplay = {
                upgrade_properties: []
            };
            var sourceDisplay = {};
            spyOn(displayUpgradeHandler, 'CanUpgradeDisplay').and.returnValue(true);
            var result = displayUpgradeHandler.GetUpgradeDisplayData(currentDisplay, sourceDisplay);
            expect(result).toEqual({});
        });

        it("should not get upgrading data if no priviledge", function () {
            var currentDisplay = {
                upgrade_properties: ['fields']
            };
            var sourceDisplay = {};
            spyOn(displayUpgradeHandler, 'CanUpgradeDisplay').and.returnValue(false);
            var result = displayUpgradeHandler.GetUpgradeDisplayData(currentDisplay, sourceDisplay);
            expect(result).toEqual({});
        });

        it("should get upgrading data if from upgrade_properties property and a difference data with source display", function () {
            var currentDisplay = {
                upgrade_properties: ['fields', 'display_details'],
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
            spyOn(displayUpgradeHandler, 'CanUpgradeDisplay').and.returnValue(true);
            var result = displayUpgradeHandler.GetUpgradeDisplayData(currentDisplay, sourceDisplay);

            // got from upgrade_properties property
            expect(result.display_details).toEqual("{\"changed\":true}");
            expect(result.fields).toEqual([{
                "field": "f1", "field_details": "{\"sorting\":\"desc\"}"
            }, {
                "field": "f2", "field_details": "{\"sorting\":\"asc\"}"
            }]);

            expect(result.test1).not.toBeDefined();
        });
    });

    describe(".UpgradeDisplay", function () {

        beforeEach(function () {
            spyOn(window, 'UpdateDataToWebService').and.returnValue($.when({}));
            spyOn(WC.ModelHelper, 'ExtendDisplayData');
            spyOn(displayUpgradeHandler, 'UpgradeDisplayDone');
        });

        it("should update display if have an update data", function () {
            var displayUri = '/models/1/angles/1/display/1';
            var upgradeData = { fields: [] };
            displayUpgradeHandler.UpgradeDisplay(displayUri, upgradeData)
                .done(function (result) {
                    expect(result).not.toEqual(false);
                    expect(WC.ModelHelper.ExtendDisplayData).toHaveBeenCalled();
                    expect(displayUpgradeHandler.UpgradeDisplayDone).toHaveBeenCalled();
                });
            expect(window.UpdateDataToWebService).toHaveBeenCalled();
        });

        it("should not update display if is adhoc display", function () {
            var displayUri = '/models/1/angles/95c5f1a4-4789-36c6-2ff6-480304146935/display/95c5f1a4-4789-36c6-2ff6-480304146932';
            var upgradeData = { fields: [] };
            displayUpgradeHandler.UpgradeDisplay(displayUri, upgradeData)
                .done(function (result) {
                    expect(result).toEqual(false);
                    expect(WC.ModelHelper.ExtendDisplayData).not.toHaveBeenCalled();
                    expect(displayUpgradeHandler.UpgradeDisplayDone).toHaveBeenCalled();
                });
        });

        it("should not update display if no update data", function () {
            var displayUri = '/models/1/angles/1/display/1';
            var upgradeData = {};
            displayUpgradeHandler.UpgradeDisplay(displayUri, upgradeData)
                .done(function (result) {
                    expect(result).toEqual(false);
                    expect(WC.ModelHelper.ExtendDisplayData).not.toHaveBeenCalled();
                    expect(displayUpgradeHandler.UpgradeDisplayDone).toHaveBeenCalled();
                });
        });
    });

    describe(".UpgradeDisplayDone", function () {
        it("should mark as upgraded", function () {
            var displayUri = '/models/1/angles/1/display/1';
            displayUpgradeHandler.UpgradeDisplayDone(displayUri);

            expect(window.UpgradedDisplays[displayUri]).toEqual(true);
        });
    });

});