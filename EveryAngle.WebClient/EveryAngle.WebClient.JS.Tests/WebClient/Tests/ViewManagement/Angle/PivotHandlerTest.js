/// <chutzpah_reference path="/../../Dependencies/ErrorHandler/ErrorHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/resultmodel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/displayqueryblockmodel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/AngleInfoModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/DisplayModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/Chart/ChartHelper.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/Chart/ChartOptionsView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/Chart/ChartOptionsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/FieldSettingsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/SidePanel/SidePanelView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/SidePanel/SidePanelHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ItemSaveActionHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleSaveActionHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleActionMenuHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleSidePanelView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleSidePanelHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleStateHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleTemplateStateHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleStateView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AnglePageHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/PivotHandler.js" />


describe("PivotPageHandler", function () {

    var pivotPageHandler;

    beforeEach(function () {
        pivotPageHandler = new PivotPageHandler();
    });

    describe(".CanDrilldown", function () {

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

    describe(".OnPivotGridCellClick", function () {

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

    describe(".OnPivotBeginCallback", function () {

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

    describe(".UpdateSortingField", function () {

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

    describe(".UpdateStorageLayout", function () {

        var pivotPageHandler2;

        beforeEach(function () {

            pivotPageHandler2 = new PivotPageHandler();
            pivotPageHandler2.UpdateSortDataFromPivotTable = $.noop;
            pivotPageHandler2.Models.Display.Data({ display_details: '{}', upgrade_properties: [] });
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

    describe(".GetSortingDirectionFromElement", function () {

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
            spyOn(popup, 'Show');
            spyOn($.fn, 'trigger');
            spyOn($.fn, 'closest').and.returnValue($());
            spyOn($.fn, 'offset').and.returnValue({});
            var element = $();
            pivotPageHandler.ShowPivotCustomSortPopup(element);

            expect($.fn.closest).toHaveBeenCalled();
        });
    });
    describe(".SetPivotCellHeaderEvent", function () {
        var pivotId;
        beforeEach(function () {
            pivotId = pivotPageHandler.PivotId;
            $('<table id="' + pivotId + '_CVSCell_SCDTable">').html('<tr><td id="pivotGrid" class="dxpgColumnFieldValue lastLevel"><img id="pivotGrid_image" class="dxPivotGrid_pgCollapsedButton dxpgCollapsedButton" src="" alt="Image"> Test</td></tr>').hide().appendTo('body');
            jQuery('#' + pivotId + '_CVSCell_SCDTable .dxpgColumnFieldValue.lastLevel, #' + pivotId + '_CVSCell_SCDTable .dxPivotGrid_pgSortByColumn')
                .on('click', pivotPageHandler.ShowPivotCustomSortPopupOnHeaderText);
        });

        afterEach(function () {
            $('#' + pivotId + '_CVSCell_SCDTable').remove();
        });
        it("should open custom sort popup and not expand the header when image not clicked", function () {
            spyOn(pivotPageHandler, 'ShowPivotCustomSortPopup');
            $('.dxpgColumnFieldValue.lastLevel').trigger('click');
            expect(pivotPageHandler.ShowPivotCustomSortPopup).toHaveBeenCalled();
        });
        it("should expand the header when clicked on image", function () {
            spyOn(pivotPageHandler, 'ShowPivotCustomSortPopup');
            $('#pivotGrid_image').trigger('click');
            expect(pivotPageHandler.ShowPivotCustomSortPopup).not.toHaveBeenCalled();
        });
    });
    describe(".CheckPivotInstance", function () {
        beforeEach(function () {
            spyOn(errorHandlerModel, 'RedirectToLoginPage');
            spyOn(pivotPageHandler, 'GetContainer').and.returnValues($(), $('<div><script id="dxss_12345"></script></div>'), $('<div><script id="dxss_12345"></script></div>'));
            spyOn(pivotPageHandler, 'ShowLoadingIndicator');
            spyOn(pivotPageHandler, 'ProcessScriptsAndLinks');
            spyOn(pivotPageHandler, 'IsPivotReady').and.returnValues(false, true);
            window.ASPx = {
                startupScriptPrefix: 'dxss_'
            };
        });
        it("should redirect to login page if no authorization", function (done) {
            // prepare
            var response = '<form id="LoginForm" />';
            pivotPageHandler.CheckPivotInstance(response)
                .done(function (result) {
                    // assert
                    expect(result).toEqual(false);
                    expect(errorHandlerModel.RedirectToLoginPage).toHaveBeenCalled();
                    done();
                });
        });
        it("should check pivot instance", function (done) {
            // prepare
            var response = 'this is a pivot<script id="dxss_12345"></script>';
            pivotPageHandler.CheckPivotInstance(response)
                .done(function (result) {
                    // assert
                    expect(result).toEqual(true);
                    expect(errorHandlerModel.RedirectToLoginPage).not.toHaveBeenCalled();
                    expect(pivotPageHandler.ProcessScriptsAndLinks).toHaveBeenCalledTimes(1);
                    expect(pivotPageHandler.IsPivotReady).toHaveBeenCalledTimes(2);
                    done();
                });
        });
    });

    describe(".IsPivotReady", function () {
        beforeEach(function () {
            window.MVCxClientPivotGrid = function () {
                this.GetMainElement = $.noop;
            };
            window[pivotPageHandler.PivotId] = new window.MVCxClientPivotGrid();
        });
        it("should not be ready (not MVCxClientPivotGrid)", function () {
            // prepare
            window[pivotPageHandler.PivotId] = $();
            var result = pivotPageHandler.IsPivotReady();

            // assert
            expect(result).toBeFalsy();
        });
        it("should not be ready (no element)", function () {
            // prepare
            spyOn(window[pivotPageHandler.PivotId], 'GetMainElement').and.returnValue(null);
            var result = pivotPageHandler.IsPivotReady();

            // assert
            expect(result).toBeFalsy();
        });
        it("should be ready", function () {
            // prepare
            spyOn(window[pivotPageHandler.PivotId], 'GetMainElement').and.returnValue($('<div/>').get(0));
            var result = pivotPageHandler.IsPivotReady();

            // assert
            expect(result).toBeTruthy();
        });
    });

    describe(".ProcessScriptsAndLinks", function () {
        beforeEach(function () {
            window.ASPx = { ProcessScriptsAndLinks: $.noop };
            spyOn(window.ASPx, 'ProcessScriptsAndLinks');
        });
        it("should process scripts and links", function () {
            // prepare
            spyOn(pivotPageHandler, 'IsPivotReady').and.returnValue(false);
            pivotPageHandler.ProcessScriptsAndLinks();

            // assert
            expect(window.ASPx.ProcessScriptsAndLinks).toHaveBeenCalled();
        });
        it("should not process scripts and links", function () {
            // prepare
            spyOn(pivotPageHandler, 'IsPivotReady').and.returnValue(true);
            pivotPageHandler.ProcessScriptsAndLinks();

            // assert
            expect(window.ASPx.ProcessScriptsAndLinks).not.toHaveBeenCalled();
        });
    });

    describe(".EnsureUpdateLayout", function () {
        it("should be forced to update a layout", function () {
            // prepare
            spyOn(pivotPageHandler, 'UpdateLayout');
            pivotPageHandler.EnsureUpdateLayout();

            // assert
            expect(pivotPageHandler.UpdateLayout).toHaveBeenCalledTimes(1);
        });
    });
    describe(".SetTitleforElements", function () {
        it("should set tooltip", function () {
            spyOn(pivotPageHandler, 'GetCellCaptionTitle');
            spyOn(pivotPageHandler, 'SetTooltip');
            spyOn($.fn, 'find').and.returnValue($('<div/>'));
            pivotPageHandler.SetTitleforElements('.dxpgRowFieldValue');
            expect(pivotPageHandler.SetTooltip).toHaveBeenCalled();
        });
    });
    describe(".GetCellCaptionTitle", function () {
        var tests = [
            {
                html: 'firstname<br>&nbsp;surname ',
                expected: 'firstname - surname'
            },
            {
                html: '<img class="dxpgCollapsedButton" alt="image">0002 (Hartmans Plant)',
                expected: '0002 (Hartmans Plant)'
            },
            {
                html: '<span class="domainIcon test"></span>my name',
                expected: 'my name'
            },
            {
                html: 'you &amp; me',
                expected: 'you & me'
            },
            {
                html: '&lt;script&gt;alert("test")&lt;/script&gt;',
                expected: '<script>alert("test")</script>'
            }
        ];
        $.each(tests, function (_index, test) {
            it("should get title (" + test.html + " -> " + test.expected + ")", function () {
                var result = pivotPageHandler.GetCellCaptionTitle($('<div/>').html(test.html));
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".FieldOptionClick", function () {
        var internalId = "someInternalId";
        beforeEach(function () {
            pivotPageHandler.FieldSettings = {
                GetFieldByGuid: function () {
                    return {};
                }
            };
        })

        it("should call the function to sort the field in ascending order", function () {
            //prepare
            var element = "<div class='sortAsc'></div>";
            spyOn(pivotPageHandler, 'ApplyPivotSorting');
            spyOn(fieldSettingsHandler, 'HideFieldOptionsMenu');

            // call
            pivotPageHandler.FieldOptionClick(element, internalId);

            // assert
            expect(pivotPageHandler.ApplyPivotSorting).toHaveBeenCalledWith(jQuery(element), {});
            expect(fieldSettingsHandler.HideFieldOptionsMenu).toHaveBeenCalled();
        });

        it("should call the function to format the field", function () {
            //prepare
            var element = "<div class='fieldFormat'></div>";

            spyOn(pivotPageHandler, 'ShowPivotBucketPopup');
            spyOn(fieldSettingsHandler, 'HideFieldOptionsMenu');

            // call
            pivotPageHandler.FieldOptionClick(element, internalId);

            // assert
            expect(pivotPageHandler.ShowPivotBucketPopup).toHaveBeenCalledWith({});
            expect(fieldSettingsHandler.HideFieldOptionsMenu).toHaveBeenCalled();
        });

        it("should call the function to add filter to the field", function () {
            //prepare
            var element = jQuery("<div class='addFilter'></div>");
            spyOn(pivotPageHandler, 'ShowPivotAddFilterPopup');
            spyOn(fieldSettingsHandler, 'HideFieldOptionsMenu');

            // call
            pivotPageHandler.FieldOptionClick(element, internalId);

            // assert
            expect(pivotPageHandler.ShowPivotAddFilterPopup).toHaveBeenCalledWith({});
            expect(fieldSettingsHandler.HideFieldOptionsMenu).toHaveBeenCalled();
        });

        it("should call the function to add info", function () {
            //prepare
            var element = "<div class='fieldInfo'></div>";
            spyOn(pivotPageHandler, 'ShowPivotHelpTextPopup');
            spyOn(fieldSettingsHandler, 'HideFieldOptionsMenu');

            // call
            pivotPageHandler.FieldOptionClick(element, internalId);

            // assert
            expect(pivotPageHandler.ShowPivotHelpTextPopup).toHaveBeenCalledWith({});
            expect(fieldSettingsHandler.HideFieldOptionsMenu).toHaveBeenCalled();
        });

        it("should not allow the field option functions call as being disabled", function () {
            var element = "<div class='sortAsc disabled'></div>";
            var fieldOptionFunctions = ["ApplyPivotSorting", "ShowPivotBucketPopup", "ShowPivotAddFilterPopup", "ShowPivotHelpTextPopup"];
            for (var i = 0; i < fieldOptionFunctions; i++) {
                spyOn(pivotPageHandler, fieldOptionFunctions[i]);
            }
            spyOn(fieldSettingsHandler, 'HideFieldOptionsMenu');

            // call
            pivotPageHandler.FieldOptionClick(element, internalId);

            // assert
            for (var i = 0; i < fieldOptionFunctions; i++) {
                expect(pivotPageHandler[fieldOptionFunctions[i]]).not.toHaveBeenCalled();
            }
            expect(fieldSettingsHandler.HideFieldOptionsMenu).not.toHaveBeenCalled();
        });
    });

    describe(".ShowPivotAddFilterPopup", function () {
        it("should be open sidepanel by calling HandlerSidePanel.Open", function () {
            // prepare
            var field = {
                FieldName: 'hh'
            };
            spyOn(anglePageHandler.HandlerSidePanel, 'Open');
            spyOn(anglePageHandler.HandlerDisplay.QueryDefinitionHandler, 'GetAggregationFieldById').and.returnValue({});
            spyOn(anglePageHandler.HandlerDisplay.QueryDefinitionHandler, 'AddFilterFromAggregation');

            //call
            pivotPageHandler.ShowPivotAddFilterPopup(field);

            // assert
            expect(anglePageHandler.HandlerSidePanel.Open).toHaveBeenCalledTimes(1);
        });
    });
});

