/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/DisplayModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/AngleInfoModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ModelsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/SearchStorageHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/SidePanel/SidePanelView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/SidePanel/SidePanelHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ToastNotificationHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Dashboard/dashboardstateview.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Dashboard/dashboardstatehandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Dashboard/DashboardWidgetDefinitionHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Dashboard/DashboardWidgetDefinitionView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Dashboard/dashboardmodel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Dashboard/DashboardStatisticView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Dashboard/DashboardStatisticHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Dashboard/DashboardSidePanelView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Dashboard/DashboardSidePanelHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Dashboard/DashboardUserSpecificHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ItemDownloadHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ItemSaveActionHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Dashboard/DashboardSaveActionHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Dashboard/DashboardLabelHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Dashboard/DashboardTagHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Dashboard/DashboardPageHandler.js" />

describe("DashboardPageHandler", function () {
    var dashboardPageHandler;
    beforeEach(function () {
        dashboardPageHandler = new DashboardPageHandler();
    });
    afterEach(function () {
        jQuery.localStorage(enumHandlers.ANGLEPARAMETER.ADHOCFILTERS, null);
    });

    describe(".Initial", function () {
        beforeEach(function () {
            angleInfoModel.Data({
                id: 'my-angle-id'
            });
            angleInfoModel.Data.commit();
            displayModel.Data({
                id: 'my-display-id'
            });
            displayModel.Data.commit();
            spyOn(searchStorageHandler, 'Initial');
            spyOn(dashboardPageHandler, 'BackToSearch');
            spyOn(dashboardPageHandler, 'InitialCallback');
        });
        it("should clear unused data and back to search page", function () {
            // prepare
            spyOn(WC.Utility, 'UrlParameter').and.returnValue(undefined);
            dashboardPageHandler.Initial();

            // assert
            expect(angleInfoModel.Data()).toEqual(null);
            expect(displayModel.Data()).toEqual(null);
            expect(searchStorageHandler.Initial).toHaveBeenCalled();
            expect(dashboardPageHandler.BackToSearch).toHaveBeenCalled();
            expect(dashboardPageHandler.InitialCallback).not.toHaveBeenCalled();
        });
        it("should clear unused data and initial", function () {
            // prepare
            spyOn(WC.Utility, 'UrlParameter').and.returnValue('/dashoards/1');
            spyOn(dashboardPageHandler, 'LoadResources').and.returnValue($.when());
            spyOn($.fn, 'addClass');
            dashboardPageHandler.Initial();

            // assert
            expect(angleInfoModel.Data()).toEqual(null);
            expect(displayModel.Data()).toEqual(null);
            expect(searchStorageHandler.Initial).toHaveBeenCalled();
            expect(dashboardPageHandler.BackToSearch).not.toHaveBeenCalled();
            expect($.fn.addClass).toHaveBeenCalledWith('initialized');
        });
    });

    describe(".SetValidFilters", function () {
        it("should not set the filter in local storage when no ResultModel", function () {
            var widgetElement = $('<div class="widget-display-column " />').data('ResultModel', null);
            dashboardPageHandler.SetValidFilters(widgetElement);
            var filter = jQuery.localStorage(enumHandlers.ANGLEPARAMETER.ADHOCFILTERS);
            expect(filter).toEqual(null);
        });

        it("should not set the filter in local storage when no valid filter", function () {
            var widgetElement = $('<div class="widget-display-column " />').data('ResultModel', {
                WidgetModel: {
                    GetExtendedFilters: function () {
                        return [];
                    }
                }
            });
            dashboardPageHandler.SetValidFilters(widgetElement);
            var filter = jQuery.localStorage(enumHandlers.ANGLEPARAMETER.ADHOCFILTERS);
            expect(filter).toEqual(null);
        });

        it("should be set the valid filter in local storage when has valid filter", function () {
            var widgetElement = $('<div class="widget-display-column " />').data('ResultModel', {
                WidgetModel: {
                    GetExtendedFilters: function () {
                        return [{ field: 'field1' }];
                    }
                }
            });
            dashboardPageHandler.SetValidFilters(widgetElement);
            var filter = jQuery.localStorage(enumHandlers.ANGLEPARAMETER.ADHOCFILTERS);
            expect(filter).toEqual([{ field: 'field1' }]);
        });
    });

    describe(".GetActionDropdownItems", function () {
        it("check menu visibility on editmode = true", function () {
            spyOn(dashboardPageHandler, 'IsEditMode').and.returnValue(true);
            spyOn(dashboardModel, 'IsTemporaryDashboard').and.returnValue(false);

            // act
            var items = dashboardPageHandler.GetActionDropdownItems();

            // assert
            expect(items.length).toEqual(2);
            expect(items[0].Enable).toEqual(true);
            expect(items[0].Visible).toEqual(true);
            expect(items[1].Enable).toEqual(true);
            expect(items[1].Visible).toEqual(true);
        });

        it("check menu visibility on editmode = false", function () {
            spyOn(dashboardPageHandler, 'IsEditMode').and.returnValue(false);
            spyOn(dashboardModel, 'IsTemporaryDashboard').and.returnValue(true);

            // act
            var items = dashboardPageHandler.GetActionDropdownItems();

            // assert
            expect(items.length).toEqual(2);
            expect(items[0].Enable).toEqual(false);
            expect(items[0].Visible).toEqual(false);
            expect(items[1].Enable).toEqual(false);
            expect(items[1].Visible).toEqual(false);
        });
    });

    describe(".CallActionDropdownFunction", function () {
        beforeEach(function () {
            spyOn(dashboardPageHandler, 'ExitEditMode');
            spyOn(dashboardPageHandler, 'Download');
        });
        it("should not do anything", function () {
            // prepare
            dashboardPageHandler.CallActionDropdownFunction($('<div class="disabled"/>'), enumHandlers.DASHBOARDACTION.EXECUTEDASHBOARD.Id);

            // assert
            expect(dashboardPageHandler.ExitEditMode).not.toHaveBeenCalled();
            expect(dashboardPageHandler.Download).not.toHaveBeenCalled();
        });
        it("should exit edit mode", function () {
            // prepare
            dashboardPageHandler.CallActionDropdownFunction($('<div/>'), enumHandlers.DASHBOARDACTION.EXECUTEDASHBOARD.Id);

            // assert
            expect(dashboardPageHandler.ExitEditMode).toHaveBeenCalled();
            expect(dashboardPageHandler.Download).not.toHaveBeenCalled();
        });
        it("should download", function () {
            // prepare
            dashboardPageHandler.CallActionDropdownFunction($('<div/>'), enumHandlers.DASHBOARDACTION.DOWNLOAD.Id);

            // assert
            expect(dashboardPageHandler.ExitEditMode).not.toHaveBeenCalled();
            expect(dashboardPageHandler.Download).toHaveBeenCalled();
        });
    });

    describe(".Download", function () {
        var downloadHandler, item;
        beforeEach(function () {
            downloadHandler = {
                SetSelectedItems: $.noop,
                StartExportItems: $.noop
            };
            item = {};
            spyOn(dashboardModel, 'GetData').and.returnValue(item);
            spyOn(downloadHandler, 'SetSelectedItems');
            spyOn(downloadHandler, 'StartExportItems');
            spyOn(window, 'ItemDownloadHandler').and.returnValue(downloadHandler);
            spyOn(popup, 'Confirm');
        });
        it('should download', function () {
            spyOn(dashboardPageHandler.DashboardSaveActionHandler, 'EnableSaveAll').and.returnValue(false);
            dashboardPageHandler.Download();

            // assert
            expect(item.type).toEqual('dashboard');
            expect(downloadHandler.SetSelectedItems).toHaveBeenCalled();
            expect(downloadHandler.StartExportItems).toHaveBeenCalled();
            expect(popup.Confirm).not.toHaveBeenCalled();
        });
        it('should show confirmation popup', function () {
            spyOn(dashboardPageHandler.DashboardSaveActionHandler, 'EnableSaveAll').and.returnValue(true);
            dashboardPageHandler.Download();

            // assert
            expect(item.type).not.toEqual('dashboard');
            expect(downloadHandler.SetSelectedItems).not.toHaveBeenCalled();
            expect(downloadHandler.StartExportItems).not.toHaveBeenCalled();
            expect(popup.Confirm).toHaveBeenCalled();
        });
    });

    describe(".CanAddNewRow", function () {
        var tests = [
            {
                title: 'can add new row if rowIndex != elementRowIndex',
                rowIndex: 0,
                elementRowIndex: 1,
                siblingColumnsCount: 0,
                expected: true
            },
            {
                title: 'can add new row if siblingColumnsCount > 0',
                rowIndex: 0,
                elementRowIndex: 0,
                siblingColumnsCount: 1,
                expected: true
            },
            {
                title: 'can not add new row',
                rowIndex: 0,
                elementRowIndex: 0,
                siblingColumnsCount: 0,
                expected: false
            }
        ];

        $.each(tests, function (index, test) {
            it(test.title, function () {
                var result = !!dashboardPageHandler.CanAddNewRow(test.rowIndex, test.elementRowIndex, test.siblingColumnsCount);
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".CanMoveColumn", function () {
        var tests = [
            {
                title: 'can move column if siblingColumnsCount > 0',
                siblingColumnsCount: 1,
                isCurrentWidget: true,
                expected: true
            },
            {
                title: 'can move column if isCurrentWidget = false',
                siblingColumnsCount: 0,
                isCurrentWidget: false,
                expected: true
            },
            {
                title: 'can not move column',
                siblingColumnsCount: 0,
                isCurrentWidget: true,
                expected: false
            }
        ];

        $.each(tests, function (index, test) {
            it(test.title, function () {
                var result = !!dashboardPageHandler.CanMoveColumn(test.siblingColumnsCount, test.isCurrentWidget);
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".CreateDropToWidget", function () {
        it("should get element", function () {
            var offset = { left: 10, top: 5 };
            var size = { width: 100, height: 50 };
            var result = dashboardPageHandler.CreateDropToWidget($(), offset, size);

            // expect
            expect(result.length).toEqual(1);
            expect(result.css('left'), '10px');
            expect(result.css('top'), '5px');
            expect(result.css('width'), '100px');
            expect(result.css('height'), '50px');
        });
    });

    describe(".HaveDropToRowTop", function () {
        var tests = [
            {
                title: 'can add new row at top if rowIndex - 1 !== elementRowIndex',
                rowIndex: 2,
                elementRowIndex: 0,
                elementSiblingColumnsCount: 0,
                expected: true
            },
            {
                title: 'can add new row at top if elementSiblingColumnsCount > 0',
                rowIndex: 1,
                elementRowIndex: 0,
                elementSiblingColumnsCount: 1,
                expected: true
            },
            {
                title: 'can not add new row at top',
                rowIndex: 1,
                elementRowIndex: 0,
                elementSiblingColumnsCount: 0,
                expected: false
            }
        ];

        $.each(tests, function (index, test) {
            it(test.title, function () {
                var result = !!dashboardPageHandler.HaveDropToRowTop(test.rowIndex, test.elementRowIndex, test.elementSiblingColumnsCount);
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".CreateDropToRowTop", function () {
        it("should not get element", function () {
            var result = dashboardPageHandler.CreateDropToRowTop(null, null, null, null, false);

            // expect
            expect(result.length).toEqual(0);
        });

        it("should get element", function () {
            var offset = { left: 10, top: 30 };
            var size = { width: 100, height: 50 };
            var result = dashboardPageHandler.CreateDropToRowTop($(), offset, size, 0, true);

            // expect
            expect(result.length).toEqual(1);
            expect(result.css('left')).toEqual('10px');
            expect(result.css('top')).toEqual('20px');
            expect(result.css('width')).toEqual('100px');
            expect(result.css('height')).toEqual('50px');
            expect(result.data('index')).toEqual(0);
            expect(result.data('insert-type')).toEqual('insertBefore');
        });
    });

    describe(".HaveDropToRowBottom", function () {
        var tests = [
            {
                title: 'can add new row at bottom if rowIndex + 1 !== elementRowIndex',
                rowIndex: 2,
                elementRowIndex: 0,
                elementSiblingColumnsCount: 0,
                expected: true
            },
            {
                title: 'can add new row at bottom if elementSiblingColumnsCount > 0',
                rowIndex: 0,
                elementRowIndex: 1,
                elementSiblingColumnsCount: 1,
                expected: true
            },
            {
                title: 'can not add new bottom at top',
                rowIndex: 0,
                elementRowIndex: 1,
                elementSiblingColumnsCount: 0,
                expected: false
            }
        ];

        $.each(tests, function (index, test) {
            it(test.title, function () {
                var result = !!dashboardPageHandler.HaveDropToRowBottom(test.rowIndex, test.elementRowIndex, test.elementSiblingColumnsCount);
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".CreateDropToRowBottom", function () {
        it("should not get element", function () {
            var result = dashboardPageHandler.CreateDropToRowBottom(null, null, null, null, false);

            // expect
            expect(result.length).toEqual(0);
        });

        it("should get element", function () {
            var offset = { left: 10, top: 30 };
            var size = { width: 100, height: 50 };
            var result = dashboardPageHandler.CreateDropToRowBottom($(), offset, size, 0, true);

            // expect
            expect(result.length).toEqual(1);
            expect(result.css('left')).toEqual('10px');
            expect(result.css('top')).toEqual('40px');
            expect(result.css('width')).toEqual('100px');
            expect(result.css('height')).toEqual('50px');
            expect(result.data('index')).toEqual(0);
            expect(result.data('insert-type')).toEqual('insertAfter');
        });
    });

    describe(".HaveDropToColumnLeft", function () {
        var tests = [
            {
                title: 'can drop column to left',
                isCurrentWidget: false,
                elementId: 'id1',
                previousWidgetId: 'id2',
                expected: true
            },
            {
                title: 'can not drop column to left if isCurrentWidget = true',
                isCurrentWidget: true,
                elementId: 'id1',
                previousWidgetId: 'id2',
                expected: false
            },
            {
                title: 'can not drop column to left if elementId = previousWidgetId',
                isCurrentWidget: false,
                elementId: 'id1',
                previousWidgetId: 'id1',
                expected: false
            }
        ];

        $.each(tests, function (index, test) {
            it(test.title, function () {
                var result = !!dashboardPageHandler.HaveDropToColumnLeft(test.isCurrentWidget, test.elementId, test.previousWidgetId);
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".CreateDropToColumnLeft", function () {
        it("should not get element", function () {
            var result = dashboardPageHandler.CreateDropToColumnLeft(null, null, null, null, false);

            // expect
            expect(result.length).toEqual(0);
        });

        it("should get element", function () {
            var offset = { left: 20, top: 30 };
            var size = { width: 100, height: 50 };
            var result = dashboardPageHandler.CreateDropToColumnLeft($(), offset, size, 0, true);

            // expect
            expect(result.length).toEqual(1);
            expect(result.css('left')).toEqual('10px');
            expect(result.css('top')).toEqual('30px');
            expect(result.css('width')).toEqual('50px');
            expect(result.css('height')).toEqual('50px');
            expect(result.data('index')).toEqual(0);
            expect(result.data('insert-type')).toEqual('insertBefore');
        });
    });

    describe(".HaveDropToColumnRight", function () {
        var tests = [
            {
                title: 'can drop column to right',
                isCurrentWidget: false,
                elementId: 'id1',
                nextWidgetId: 'id2',
                expected: true
            },
            {
                title: 'can not drop column to right if isCurrentWidget = true',
                isCurrentWidget: true,
                elementId: 'id1',
                nextWidgetId: 'id2',
                expected: false
            },
            {
                title: 'can not drop column to right if elementId = nextWidgetId',
                isCurrentWidget: false,
                elementId: 'id1',
                nextWidgetId: 'id1',
                expected: false
            }
        ];

        $.each(tests, function (index, test) {
            it(test.title, function () {
                var result = !!dashboardPageHandler.HaveDropToColumnRight(test.isCurrentWidget, test.elementId, test.nextWidgetId);
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".CreateDropToColumnRight", function () {
        it("should not get element", function () {
            var result = dashboardPageHandler.CreateDropToColumnRight(null, null, null, null, false);

            // expect
            expect(result.length).toEqual(0);
        });

        it("should get element", function () {
            var offset = { left: 20, top: 30 };
            var size = { width: 100, height: 50 };
            var result = dashboardPageHandler.CreateDropToColumnRight($(), offset, size, 0, true);

            // expect
            expect(result.length).toEqual(1);
            expect(result.css('left')).toEqual('80px');
            expect(result.css('top')).toEqual('30px');
            expect(result.css('width')).toEqual('50px');
            expect(result.css('height')).toEqual('50px');
            expect(result.data('index')).toEqual(0);
            expect(result.data('insert-type')).toEqual('insertAfter');
        });
    });

    describe(".GetQueryDefinitionSourceData", function () {
        it("should return TransformFiltersData", function () {

            var filters = [{ queryblock_type: "query_steps", query_steps: [] }];

            spyOn(dashboardModel, "Data").and.returnValue(filters);
            spyOn(dashboardPageHandler, "TransformFiltersData").and.returnValue(filters);

            var result = dashboardPageHandler.GetQueryDefinitionSourceData();

            expect(dashboardModel.Data).toHaveBeenCalled();
            expect(result.length).toEqual(1);
            expect(result[0].queryblock_type).toEqual('query_steps');
            expect(result[0].query_steps).toEqual([]);
        });
    });

    describe(".SetQueryDefinitionAuthorizations", function () {
        it("should call by sequence", function () {
            spyOn(dashboardPageHandler, "CanChangeFilter").and.returnValue(true);
            spyOn(dashboardPageHandler.QueryDefinitionHandler.Authorizations, "CanChangeFilter");
            spyOn(dashboardPageHandler.QueryDefinitionHandler.Authorizations, "CanChangeJump");
            spyOn(dashboardPageHandler.QueryDefinitionHandler.Authorizations, "CanExecute");
            spyOn(dashboardPageHandler.QueryDefinitionHandler.Authorizations, "CanSave");

            dashboardPageHandler.SetQueryDefinitionAuthorizations();

            expect(dashboardPageHandler.QueryDefinitionHandler.Authorizations.CanChangeFilter).toHaveBeenCalledWith(true);
            expect(dashboardPageHandler.QueryDefinitionHandler.Authorizations.CanChangeJump).toHaveBeenCalledWith(false);
            expect(dashboardPageHandler.QueryDefinitionHandler.Authorizations.CanExecute).toHaveBeenCalledWith(true);
            expect(dashboardPageHandler.QueryDefinitionHandler.Authorizations.CanSave).toHaveBeenCalledWith(false);
        });
    });

    describe(".CanChangeFilter", function () {
        it("can change filter", function () {
            dashboardPageHandler.DashboardModel.Data({
                widget_definitions: [
                    { CanExtendFilter: ko.observable(false) },
                    { CanExtendFilter: ko.observable(true) },
                    { CanExtendFilter: ko.observable(false) }
                ]
            });
            var result = dashboardPageHandler.CanChangeFilter();

            expect(result).toEqual(true);
        });
        it("cannot change filter", function () {
            dashboardPageHandler.DashboardModel.Data({
                widget_definitions: [
                    { CanExtendFilter: ko.observable(false) },
                    { CanExtendFilter: ko.observable(false) },
                    { CanExtendFilter: ko.observable(false) }
                ]
            });
            var result = dashboardPageHandler.CanChangeFilter();

            expect(result).toEqual(false);
        });
    });

    describe(".UpdateLayoutConfig", function () {
        it("should update alayout configuration", function () {
            // prepare
            spyOn(dashboardPageHandler, 'GetLayoutFromView').and.returnValue('my-layout');
            spyOn(dashboardPageHandler.DashboardWidgetDefinitionHandler, 'Initial');
            spyOn(dashboardPageHandler, 'SetSaveActions');
            dashboardPageHandler.UpdateLayoutConfig();

            // assert
            expect(dashboardPageHandler.DashboardModel.Data().layout).toEqual('my-layout');
            expect(dashboardPageHandler.DashboardWidgetDefinitionHandler.Initial).toHaveBeenCalled();
            expect(dashboardPageHandler.SetSaveActions).toHaveBeenCalled();
        });
    });

    describe(".GetDeletingLayout", function () {
        it("should get layout (remove row, update height of the next row)", function () {
            // prepare
            var layout = {
                structure: [
                    { items: ['100%'], height: '50%' },
                    { items: ['50%', '50%'], height: '50%' }
                ],
                widgets: ['widget1', 'widget2', 'widget3']
            };
            spyOn($.fn, 'prevAll').and.returnValue($());
            spyOn($.fn, 'children').and.returnValue($('<div/>'));
            spyOn(dashboardPageHandler, 'GetLayoutFromView').and.returnValue(layout);
            var result = dashboardPageHandler.GetDeletingLayout('widget1');

            // assert
            expect(result).toEqual({
                structure: [
                    { items: ['50%', '50%'], height: '100%' }
                ],
                widgets: ['widget2', 'widget3']
            });
        });
        it("should get layout (remove row, update height of the previous row)", function () {
            // prepare
            var layout = {
                structure: [
                    { items: ['50%', '50%'], height: '50%' },
                    { items: ['100%'], height: '50%' }
                ],
                widgets: ['widget1', 'widget2', 'widget3']
            };
            spyOn($.fn, 'prevAll').and.returnValue($('<div/>'));
            spyOn($.fn, 'children').and.returnValue($('<div/>'));
            spyOn(dashboardPageHandler, 'GetLayoutFromView').and.returnValue(layout);
            var result = dashboardPageHandler.GetDeletingLayout('widget2');

            // assert
            expect(result).toEqual({
                structure: [
                    { items: ['50%', '50%'], height: '100%' }
                ],
                widgets: ['widget1', 'widget3']
            });
        });
        it("should get layout (remove column, update width of the next column)", function () {
            // prepare
            var layout = {
                structure: [
                    { items: ['15%', '20%', '25%', '40%'], height: '100%' }
                ],
                widgets: ['widget1', 'widget2', 'widget3', 'widget4']
            };
            spyOn($.fn, 'prevAll').and.returnValues($(), $('<div></div>'));
            spyOn($.fn, 'children').and.returnValue($('<div></div><div></div><div></div><div></div>'));
            spyOn(dashboardPageHandler, 'GetLayoutFromView').and.returnValue(layout);
            var result = dashboardPageHandler.GetDeletingLayout('widget2');

            // assert
            expect(result).toEqual({
                structure: [
                    { items: ['15%', '45%', '40%'], height: '100%' }
                ],
                widgets: ['widget1', 'widget3', 'widget4']
            });
        });
        it("should get layout (remove column, update width of the preious column)", function () {
            // prepare
            var layout = {
                structure: [
                    { items: ['15%', '20%', '25%', '40%'], height: '100%' }
                ],
                widgets: ['widget1', 'widget2', 'widget3', 'widget4']
            };
            spyOn($.fn, 'prevAll').and.returnValues($(), $('<div></div><div></div><div></div>'));
            spyOn($.fn, 'children').and.returnValue($('<div></div><div></div><div></div><div></div>'));
            spyOn(dashboardPageHandler, 'GetLayoutFromView').and.returnValue(layout);
            var result = dashboardPageHandler.GetDeletingLayout('widget4');

            // assert
            expect(result).toEqual({
                structure: [
                    { items: ['15%', '20%', '65%'], height: '100%' }
                ],
                widgets: ['widget1', 'widget2', 'widget3']
            });
        });
    });

    describe(".CreateDashboard", function () {
        it("should create & redirect", function () {
            spyOn(dashboardModel, 'CreateDashboard').and.returnValue($.when({}));
            spyOn(dashboardPageHandler.DashboardModel, 'SetData');
            spyOn(jQuery, 'localStorage').and.returnValue({});
            spyOn(jQuery, 'storageWatcher');
            spyOn(WC.Utility, 'RedirectUrlQuery');
            dashboardPageHandler.CreateDashboard({});

            // assert
            expect(dashboardPageHandler.QueryDefinitionHandler.ForcedSetData).toEqual(true);
            expect(dashboardPageHandler.QueryDefinitionHandler.IsExecutedParameters).toEqual(true);
            expect(dashboardPageHandler.DashboardModel.SetData).toHaveBeenCalled();
            expect(jQuery.localStorage).toHaveBeenCalled();
            expect(jQuery.storageWatcher).toHaveBeenCalled();
            expect(WC.Utility.RedirectUrlQuery).toHaveBeenCalled();
        });
    });

    describe(".ForceSaveDashboard", function () {
        var deferred;
        beforeEach(function () {
            deferred = {
                reject: $.noop,
                resolve: $.noop
            };
            spyOn(deferred, 'reject');
            spyOn(deferred, 'resolve');
            spyOn(toast, 'MakeSuccessTextFormatting');
            spyOn(dashboardPageHandler, 'ShowSaveProgressbar');
            spyOn(dashboardPageHandler, 'EnsureLayout');
            spyOn(dashboardPageHandler, 'GetChangeData').and.returnValue({ id: 'new-id' });
            spyOn(dashboardPageHandler, 'SaveDashboardCallback');
            spyOn(dashboardPageHandler, 'EndSaveProgressbar');
        });
        it("should save", function () {
            spyOn(dashboardPageHandler, 'UpdateDashboard').and.returnValue($.when());
            dashboardPageHandler.ForceSaveDashboard(deferred, {});

            // assert
            expect(deferred.reject).not.toHaveBeenCalled();
            expect(deferred.resolve).toHaveBeenCalled();
            expect(dashboardPageHandler.ShowSaveProgressbar).toHaveBeenCalled();
            expect(dashboardPageHandler.EnsureLayout).toHaveBeenCalled();
            expect(toast.MakeSuccessTextFormatting).toHaveBeenCalled();
            expect(dashboardPageHandler.SaveDashboardCallback).toHaveBeenCalled();
            expect(dashboardPageHandler.EndSaveProgressbar).toHaveBeenCalled();
        });
        it("should not save", function () {
            spyOn(dashboardPageHandler, 'UpdateDashboard').and.returnValue($.Deferred(function (d) {
                d.reject();
                return d.promise();
            }));
            dashboardPageHandler.ForceSaveDashboard(deferred, {});

            // assert
            expect(deferred.reject).toHaveBeenCalled();
            expect(deferred.resolve).not.toHaveBeenCalled();
            expect(dashboardPageHandler.ShowSaveProgressbar).toHaveBeenCalled();
            expect(dashboardPageHandler.EnsureLayout).toHaveBeenCalled();
            expect(toast.MakeSuccessTextFormatting).not.toHaveBeenCalled();
            expect(dashboardPageHandler.SaveDashboardCallback).not.toHaveBeenCalled();
            expect(dashboardPageHandler.EndSaveProgressbar).toHaveBeenCalled();
        });
    });

    describe(".ConfirmSave", function () {
        it("should get a confirm message for validated Dashbaord", function () {
            // prepare
            var fn = { callback: $.noop };
            dashboardModel.Data().is_validated(true);
            spyOn(popup, 'Confirm');
            spyOn(fn, 'callback');
            dashboardPageHandler.ConfirmSave(fn.callback, $.noop);

            // assert
            expect(popup.Confirm).toHaveBeenCalled();
            expect(fn.callback).not.toHaveBeenCalled();
        });
        it("should call saving function", function () {
            // prepare
            var fn = { callback: $.noop };
            dashboardModel.Data().is_validated(false);
            spyOn(popup, 'Confirm');
            spyOn(fn, 'callback');
            dashboardPageHandler.ConfirmSave(fn.callback, $.noop);

            // assert
            expect(popup.Confirm).not.toHaveBeenCalled();
            expect(fn.callback).toHaveBeenCalled();
        });
    });

    //handlers
    describe(".SaveQueryDefinition", function () {
        it("should do nothing when QueryDefinitionHandler.HasChanged is false", function () {
            spyOn(dashboardPageHandler.QueryDefinitionHandler, "HasChanged").and.returnValue(false);
            spyOn(dashboardPageHandler.QueryDefinitionHandler, "Validate").and.returnValue(false);

            dashboardPageHandler.SaveQueryDefinition();

            expect(dashboardPageHandler.QueryDefinitionHandler.Validate).toHaveBeenCalledTimes(0);
        });

        it("should show warning popup when not validate", function () {
            spyOn(dashboardPageHandler.QueryDefinitionHandler, "HasChanged").and.returnValue(true);
            spyOn(dashboardPageHandler.QueryDefinitionHandler, "Validate").and.returnValue({ valid: false });
            spyOn(popup, "Alert").and.returnValue($.noop);

            dashboardPageHandler.SaveQueryDefinition();

            expect(popup.Alert).toHaveBeenCalled();
        });

        it("should save and close filter editors when validate", function () {
            spyOn(dashboardPageHandler.QueryDefinitionHandler, "HasChanged").and.returnValue(true);
            spyOn(dashboardPageHandler.QueryDefinitionHandler, "Validate").and.returnValue({ valid: true });
            spyOn(dashboardPageHandler.QueryDefinitionHandler, "CloseAllFilterEditors").and.returnValue($.noop);
            spyOn(dashboardPageHandler, "ExecuteQueryDefinition").and.returnValue($.noop);

            dashboardPageHandler.SaveQueryDefinition();

            expect(dashboardPageHandler.QueryDefinitionHandler.CloseAllFilterEditors).toHaveBeenCalled();
            expect(dashboardPageHandler.ExecuteQueryDefinition).toHaveBeenCalled();
        });

    });

    describe(".ExecuteQueryDefinition", function () {
        it("should call by sequence", function () {
            spyOn(dashboardPageHandler, "SetDashboardFilters").and.returnValue($.noop);
            spyOn(dashboardPageHandler, "ReloadAllWidgets").and.returnValue($.noop);
            spyOn(dashboardPageHandler.QueryDefinitionHandler, "MarkAllAdhocAsApplied").and.returnValue($.noop);
            spyOn(dashboardPageHandler, "SetSaveActions").and.returnValue($.noop);

            dashboardPageHandler.ExecuteQueryDefinition();

            expect(dashboardPageHandler.SetDashboardFilters).toHaveBeenCalled();
            expect(dashboardPageHandler.ReloadAllWidgets).toHaveBeenCalled();
            expect(dashboardPageHandler.QueryDefinitionHandler.MarkAllAdhocAsApplied).toHaveBeenCalled();
            expect(dashboardPageHandler.SetSaveActions).toHaveBeenCalled();
        });
    });

    describe(".SetDashboardFilters", function () {
        it("should set filters to dashboardDetailsHandler", function () {
            spyOn(dashboardPageHandler.DashboardModel, "SetDashboardFilters").and.returnValue($.noop);
            spyOn(dashboardPageHandler.QueryDefinitionHandler, "ForcedUpdateData").and.returnValue($.noop);
            spyOn(dashboardPageHandler, "TransformFiltersData").and.returnValue({});

            dashboardPageHandler.SetDashboardFilters();

            expect(dashboardPageHandler.DashboardModel.SetDashboardFilters).toHaveBeenCalled();
            expect(dashboardPageHandler.TransformFiltersData).toHaveBeenCalled();
            expect(dashboardPageHandler.QueryDefinitionHandler.ForcedUpdateData).toHaveBeenCalled();
        });
    });

    describe(".TransformFiltersData", function () {

        it("should return empty array when filters is null", function () {
            var filters = null;
            var result = dashboardPageHandler.TransformFiltersData(filters);
            expect(result).toEqual([]);
        });

        it("should return query_steps when filters is not empty", function () {
            var filters = [{}, {}];
            var result = dashboardPageHandler.TransformFiltersData(filters);
            expect(result.length).toEqual(1);
            expect(result[0].queryblock_type).toEqual('query_steps');
            expect(result[0].query_steps).toEqual([{}, {}]);
        });

    });

    describe(".CanUpdateUserSpecific", function () {
        it("can update user specific", function () {
            // prepare
            spyOn(dashboardPageHandler.DashboardUserSpecificHandler, 'CanUpdate').and.returnValue(true);
            var result = dashboardPageHandler.CanUpdateUserSpecific();

            // assert
            expect(result).toEqual(true);
        });
    });

    describe(".HasPrivateNote", function () {
        it("should have a private note", function () {
            // prepare
            spyOn(dashboardPageHandler.DashboardUserSpecificHandler, 'HasPrivateNote').and.returnValue(true);
            var result = dashboardPageHandler.HasPrivateNote();

            // assert
            expect(result).toEqual(true);
        });
    });

    describe(".GetPrivateNote", function () {
        it("should get a private note", function () {
            // prepare
            spyOn(dashboardPageHandler.DashboardUserSpecificHandler, 'GetPrivateNote').and.returnValue('my-note');
            var result = dashboardPageHandler.GetPrivateNote();

            // assert
            expect(result).toEqual('my-note');
        });
    });

    describe(".InitialUserSpecific", function () {
        it("should initial", function () {
            // prepare
            spyOn(dashboardPageHandler.DashboardUserSpecificHandler, 'InitialPrivateNote');
            spyOn(dashboardPageHandler.DashboardUserSpecificHandler, 'InitialExecuteAtLogon');
            dashboardPageHandler.InitialUserSpecific();

            // assert
            expect(dashboardPageHandler.DashboardUserSpecificHandler.InitialPrivateNote).toHaveBeenCalled();
            expect(dashboardPageHandler.DashboardUserSpecificHandler.InitialExecuteAtLogon).toHaveBeenCalled();
        });
    });

    describe(".IsStarred", function () {
        it("should be true", function () {
            // prepare
            spyOn(dashboardPageHandler.DashboardUserSpecificHandler, 'IsStarred').and.returnValue(true);
            var result = dashboardPageHandler.IsStarred();

            // assert
            expect(result).toEqual(true);
        });
    });

    describe(".SetFavorite", function () {
        it("should set favorite", function () {
            // prepare
            spyOn(dashboardPageHandler.DashboardUserSpecificHandler, 'SetFavorite');
            dashboardPageHandler.SetFavorite(null, {});

            // assert
            expect(dashboardPageHandler.DashboardUserSpecificHandler.SetFavorite).toHaveBeenCalled();
        });
    });

    describe(".InitialLabel", function () {
        it("should initial", function () {
            // prepare
            spyOn(dashboardPageHandler.DashboardLabelHandler, 'Initial');
            dashboardPageHandler.InitialLabel();

            // assert
            expect(dashboardPageHandler.DashboardLabelHandler.Initial).toHaveBeenCalled();
        });
    });
    describe(".SaveLabels", function () {
        it("should confirm saving", function () {
            // prepare
            spyOn(dashboardPageHandler, 'ConfirmSave');
            dashboardPageHandler.SaveLabels([]);

            // assert
            expect(dashboardPageHandler.ConfirmSave).toHaveBeenCalled();
        });
    });

    describe(".InitialTag", function () {
        it("should initial", function () {
            // prepare
            spyOn(dashboardPageHandler.DashboardTagHandler, 'Initial');
            dashboardPageHandler.InitialTag();

            // assert
            expect(dashboardPageHandler.DashboardTagHandler.Initial).toHaveBeenCalled();
        });
    });

    describe(".ShowStatisticPopup", function () {
        it("should call DashboardStatisticHandler", function () {
            spyOn(dashboardPageHandler.DashboardStatisticHandler, 'ShowPopup');
            dashboardPageHandler.ShowStatisticPopup();
            expect(dashboardPageHandler.DashboardStatisticHandler.ShowPopup).toHaveBeenCalled();
        });
    });
    describe(".IsStatisticVisible", function () {
        it("should return true when dashboard is not Temporary", function () {
            spyOn(dashboardModel, 'IsTemporaryDashboard').and.returnValue(false);
            var result = dashboardPageHandler.IsStatisticVisible();
            expect(result).toBeTruthy();
        });
        it("should return false when dashboard is Temporary", function () {
            spyOn(dashboardModel, 'IsTemporaryDashboard').and.returnValue(true);
            var result = dashboardPageHandler.IsStatisticVisible();
            expect(result).toBeFalsy();
        });
    });

    describe(".SaveDescriptionDone", function () {
        var tests = [
            {
                title: 'should call toast when is_adhoc = false',
                is_adhoc: false,
                expected: 1
            },
            {
                title: 'should not call toast when is_adhoc = true',
                is_adhoc: true,
                expected: 0
            }
        ];

        $.each(tests, function (index, test) {
            it(test.title, function () {
                // initial
                spyOn(dashboardPageHandler.ItemDescriptionHandler, 'CloseEditPopup');
                spyOn(dashboardPageHandler, 'InitialBreadcrumb');
                spyOn(dashboardPageHandler, 'GetName').and.returnValue("");
                spyOn(dashboardModel, 'IsTemporaryDashboard').and.returnValue(test.is_adhoc);
                spyOn(dashboardModel, "Data").and.returnValue({
                    name: $.noop
                });
                spyOn(toast, 'MakeSuccessTextFormatting');

                // actions
                dashboardPageHandler.SaveDescriptionDone();

                // assert
                expect(dashboardPageHandler.ItemDescriptionHandler.CloseEditPopup).toHaveBeenCalled();
                expect(dashboardPageHandler.InitialBreadcrumb).toHaveBeenCalled();
                expect(dashboardPageHandler.GetName).toHaveBeenCalledTimes(test.expected);
                expect(toast.MakeSuccessTextFormatting).toHaveBeenCalledTimes(test.expected);
            });
        });
    });

    describe(".GetElementIdFromWidget", function () {
        it("should convert widgetId to elementId", function () {
            var widgetId = "widgetw2dd10e49544c081b978d586836617586-container";
            var result = dashboardPageHandler.GetElementIdFromWidget(widgetId);
            expect(result).toEqual('w2dd10e49544c081b978d586836617586');
        });
    });

    describe(".IsWidgetExists", function () {

        it("should return true when can get a widget from DashboardModel", function () {
            spyOn(dashboardPageHandler, 'GetElementIdFromWidget');
            spyOn(dashboardPageHandler.DashboardModel, 'GetWidgetById').and.returnValue({});

            var result = dashboardPageHandler.IsWidgetExists()

            expect(result).toBeTruthy();
        });

        it("should return false when can not get a widget from DashboardModel", function () {
            spyOn(dashboardPageHandler, 'GetElementIdFromWidget');
            spyOn(dashboardPageHandler.DashboardModel, 'GetWidgetById').and.returnValue(null);

            var result = dashboardPageHandler.IsWidgetExists()

            expect(result).toBeFalsy();
        });
    });
});
