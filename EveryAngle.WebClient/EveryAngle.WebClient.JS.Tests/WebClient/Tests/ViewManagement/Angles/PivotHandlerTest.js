/// <reference path="/Dependencies/ViewModels/Models/Angle/historymodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/resultmodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/displayqueryblockmodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/AngleInfoModel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/DisplayModel.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ValidationHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angles/FieldSettingsHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angles/PivotHandler.js" />

describe("PivotPageHandler", function () {

    var pivotPageHandler;

    beforeEach(function () {
        pivotPageHandler = new PivotPageHandler();
    });

    describe("call CanDrilldown", function () {

        it("should get true", function () {

            pivotPageHandler.Models.Result = new ResultViewModel();
            pivotPageHandler.Models.Result.Data({
                authorizations: {
                    add_aggregation: true,
                    add_filter: true,
                    add_followup: true,
                    change_field_collection: true,
                    change_query_filters: true,
                    change_query_followups: true,
                    'export': true,
                    single_item_view: true,
                    sort: true
                }
            });

            var canDrilldown = pivotPageHandler.CanDrilldown();
            expect(canDrilldown).toEqual(true);
        });

        it("should get false", function () {
            pivotPageHandler.Models.Result = new ResultViewModel();
            pivotPageHandler.Models.Result.Data({
                authorizations: {
                    add_aggregation: false,
                    add_filter: false,
                    add_followup: false,
                    change_field_collection: false,
                    change_query_filters: false,
                    change_query_followups: false,
                    'export': false,
                    single_item_view: false,
                    sort: false
                }
            });

            var canDrilldown = pivotPageHandler.CanDrilldown();
            expect(canDrilldown).toEqual(false);
        });

    });

    describe("call OnPivotGridCellClick", function () {

        beforeEach(function () {
            window[pivotPageHandler.PivotId] = {
                PerformCallback: function () { }
            };

            pivotPageHandler.Models.Result = new ResultViewModel();
            pivotPageHandler.Models.Result.Data({
                authorizations: {
                    add_aggregation: true,
                    add_filter: true,
                    add_followup: true,
                    change_field_collection: true,
                    change_query_filters: true,
                    change_query_followups: true,
                    'export': true,
                    single_item_view: true,
                    sort: true
                }
            });
        });

        it("should set IsDrilldown to true", function () {

            var s = {};
            var e = {
                Value: 'value'
            };
            pivotPageHandler.OnPivotGridCellClick(s, e);

            expect(pivotPageHandler.IsDrilldown).toEqual(true);
        });

    });

    describe("call OnPivotBeginCallback", function () {

        beforeEach(function () {
            window[pivotPageHandler.PivotId] = {};

            pivotPageHandler.Models.Result = new ResultViewModel();
            pivotPageHandler.Models.Result.Data({
                authorizations: {
                    add_aggregation: true,
                    add_filter: true,
                    add_followup: true,
                    change_field_collection: true,
                    change_query_filters: true,
                    change_query_followups: true,
                    'export': true,
                    single_item_view: true,
                    sort: true
                }
            });
        });

        it("should sent CanDrilldown state and field settings data", function () {

            var sender = {};
            var e = {
                customArgs: {}
            };
            pivotPageHandler.OnPivotBeginCallback(sender, e);

            expect(e.customArgs.CanDrilldown).toBeDefined();
            expect(e.customArgs.fieldSettingsData).toBeDefined();
        });

        it("should reset IsDrilldown to false", function () {

            var sender = {};
            var e = {
                customArgs: {}
            };
            pivotPageHandler.OnPivotBeginCallback(sender, e);

            expect(pivotPageHandler.IsDrilldown).toEqual(false);
        });

    });

    describe("call UpdateSortingField", function () {

        beforeEach(function () {

            pivotPageHandler.Models = {
                Display: {
                    Data: function () {
                        return {
                            fields: [
                                {
                                    field: 'A',
                                    field_details: JSON.stringify({ sorting: 'asc' })
                                }
                            ]
                        };
                    }
                }
            };
            pivotPageHandler.Models.Display.Data.commit = $.noop;

            pivotPageHandler.FieldSettings = {
                Fields: JSON.stringify([
                    {
                        FieldName: 'A',
                        InternalID: 'AA',
                        FieldDetails: JSON.stringify({ sorting: 'asc' })
                    }
                ]),
                GetFields: function () {
                    return JSON.parse(this.Fields);
                }
            };

            fieldSettingsHandler.FieldSettings = {};

        });

        it("should no changes when does not matches InternalID", function () {

            var currentField = pivotPageHandler.FieldSettings.Fields;

            pivotPageHandler.UpdateSortingField('XX', 'asc');

            expect(pivotPageHandler.FieldSettings.Fields).toEqual(currentField);

        });

        it("should update sorting when does matches InternalID", function () {

            pivotPageHandler.UpdateSortingField('AA', 'desc');

            expect(pivotPageHandler.FieldSettings.GetFields()[0].FieldDetails).toContain('desc');

        });

        it("should update sorting to FieldSettingsHandler if not in Dashboard", function () {

            pivotPageHandler.DashBoardMode(false);
            pivotPageHandler.UpdateSortingField('AA', 'yyy');

            expect(fieldSettingsHandler.FieldSettings.Fields).toContain('yyy');

        });

        it("should not update sorting to FieldSettingsHandler if in Dashboard", function () {

            pivotPageHandler.DashBoardMode(true);
            pivotPageHandler.UpdateSortingField('AA', 'xxx');

            expect(fieldSettingsHandler.FieldSettings.Fields).not.toContain('xxx');

        });

    });

    describe("call UpdateStorageLayout", function () {

        var pivotPageHandler2;

        beforeEach(function () {

            pivotPageHandler2 = new PivotPageHandler();
            pivotPageHandler2.UpdateSortDataFromPivotTable = $.noop;
            pivotPageHandler2.Models.Display.Data({ display_details: '{}', upgrades_properties: [] });
            pivotPageHandler2.Models.Display.Data.commit();

            fieldSettingsHandler.FieldSettings = {};
            pivotPageHandler2.FieldSettings = {};
            pivotPageHandler2.FieldSettings.DisplayDetails = JSON.stringify({
                layout: JSON.stringify({ layout: 'have_layout', collapse: 'have_collapse' })
            });
            pivotPageHandler2.FieldSettings.GetDisplayDetails = function () {
                return JSON.parse(this.DisplayDetails);
            };

        });

        it("should do nothing if no layout", function () {

            pivotPageHandler2.FieldSettings.DisplayDetails = '{}';
            pivotPageHandler2.UpdateStorageLayout();

            spyOn(pivotPageHandler2, 'UpdateSortDataFromPivotTable');

            expect(pivotPageHandler2.UpdateSortDataFromPivotTable).not.toHaveBeenCalled();

        });

        it("should remove pivot layout display_details in display if have layout and in dashboard", function () {

            pivotPageHandler2.DashBoardMode(true);
            pivotPageHandler2.UpdateStorageLayout();

            expect(pivotPageHandler2.FieldSettings.DisplayDetails).not.toContain('have_layout');

        });

        it("should remove pivot layout display_details in display and field settings if have layout and not dashboard", function () {

            pivotPageHandler2.DashBoardMode(false);
            pivotPageHandler2.UpdateStorageLayout();

            expect(fieldSettingsHandler.FieldSettings.DisplayDetails).not.toContain('have_layout');

        });

    });

    describe("call GetSortingDirectionFromElement", function () {

        beforeEach(function () {
            $('<table id="Test" />').html('<tr><td class="dxpgHeaderText" data-uid="id1"></td><td><img /></td></tr>').hide().appendTo('body');
        });

        afterEach(function () {
            $('#Test').remove();
        });

        it("should got empty direction", function () {

            $('#Test img').attr('class', '');
            var sortDirection = pivotPageHandler.GetSortingDirectionFromElement('id1');
            expect(sortDirection).toEqual('');

        });

        it("should got 'asc' direction if img has class 'dxPivotGrid_pgSortUpButton'", function () {

            $('#Test img').attr('class', 'dxPivotGrid_pgSortUpButton');
            var sortDirection = pivotPageHandler.GetSortingDirectionFromElement('id1');
            expect(sortDirection).toEqual('asc');

        });

        it("should got 'desc' direction if img has class 'dxPivotGrid_pgSortDownButton'", function () {

            $('#Test img').attr('class', 'dxPivotGrid_pgSortDownButton');
            var sortDirection = pivotPageHandler.GetSortingDirectionFromElement('id1');
            expect(sortDirection).toEqual('desc');

        });

    });

    describe(".ShowPivotCustomSortPopup", function () {
        it("should select a correct element", function () {
            spyOn(pivotPageHandler, 'ClosePivotCustomSortPopup').and.callFake($.noop);
            spyOn(fieldSettingsHandler, 'HideFieldOptionsMenu').and.callFake($.noop);
            window.popup = { Show: $.noop };
            spyOn($.fn, 'trigger').and.callFake($.noop);
            spyOn($.fn, 'closest').and.returnValue($());
            var element = $();
            pivotPageHandler.ShowPivotCustomSortPopup(element);

            expect($.fn.closest).toHaveBeenCalled();
        });
    });
});

