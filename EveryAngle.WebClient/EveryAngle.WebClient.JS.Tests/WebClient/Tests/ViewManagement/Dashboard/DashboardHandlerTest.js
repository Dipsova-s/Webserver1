/// <reference path="/Dependencies/ViewModels/Models/User/usermodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/User/privileges.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ItemState/itemstateview.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ItemState/itemstatehandler.js" />
/// <reference path="/Dependencies/ViewManagement/Dashboard/dashboardstateview.js" />
/// <reference path="/Dependencies/ViewManagement/Dashboard/dashboardstatehandler.js" />
/// <reference path="/Dependencies/ViewModels/Models/Dashboard/dashboardmodel.js" />
/// <reference path="/Dependencies/ViewManagement/Dashboard/DashboardHandler.js" />

describe("DashboardHandler", function () {
    var dashboardHandler;

    beforeEach(function () {
        dashboardHandler = new DashboardHandler();
    });

    afterEach(function () {
        jQuery.localStorage(enumHandlers.ANGLEPARAMETER.ADHOCFILTERS, null);
    });

    describe(".SetValidFilters", function () {
        it("should not set the filter in local storage when no ResultModel", function () {
            var widgetElement = $('<div class="widget-display-column " />').data('ResultModel', null );
            dashboardHandler.SetValidFilters(widgetElement);
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
            dashboardHandler.SetValidFilters(widgetElement);
            var filter = jQuery.localStorage(enumHandlers.ANGLEPARAMETER.ADHOCFILTERS);
            expect(filter).toEqual(null);
        });

        it("should be set the valid filter in local storage when has valid filter", function () {
            var widgetElement = $('<div class="widget-display-column " />').data('ResultModel', {
                WidgetModel: {
                    GetExtendedFilters: function () {
                        return 'filter';
                    }
                }
            });
            dashboardHandler.SetValidFilters(widgetElement);
            var filter = jQuery.localStorage(enumHandlers.ANGLEPARAMETER.ADHOCFILTERS);
            expect(filter).toEqual('filter');
        });
    });

    describe(".GetActionDropdownItems", function () {
        it("check menu visibility on editmode = true", function () {
            spyOn(dashboardHandler, 'IsEditMode').and.returnValue(true);
            spyOn(dashboardModel, 'CanUpdateDashboard').and.returnValue(true);
            spyOn(dashboardModel, 'IsTemporaryDashboard').and.returnValue(true);

            // act
            var items = dashboardHandler.GetActionDropdownItems();

            // assert
            expect(items.length).toEqual(4);
            expect(items[0].Visible).toEqual(true);
            expect(items[1].Visible).toEqual(true);
            expect(items[2].Visible).toEqual(true);
            expect(items[3].Visible).toEqual(true);
        });

        it("check menu visibility on editmode = false", function () {
            spyOn(dashboardHandler, 'IsEditMode').and.returnValue(false);
            spyOn(dashboardModel, 'CanUpdateDashboard').and.returnValue(true);
            spyOn(dashboardModel, 'IsTemporaryDashboard').and.returnValue(true);

            // act
            var items = dashboardHandler.GetActionDropdownItems();

            // assert
            expect(items.length).toEqual(4);
            expect(items[0].Visible).toEqual(true);
            expect(items[1].Visible).toEqual(true);
            expect(items[2].Visible).toEqual(true);
            expect(items[3].Visible).toEqual(false);
        });

        it("check menu with a right authorization", function () {
            spyOn(dashboardHandler, 'IsEditMode').and.returnValue(false);
            spyOn(dashboardModel, 'CanUpdateDashboard').and.returnValue(true);
            spyOn(dashboardModel, 'IsTemporaryDashboard').and.returnValue(false);
            spyOn(privilegesViewModel, 'IsAllowExecuteDashboard').and.returnValue(true);

            // act
            var items = dashboardHandler.GetActionDropdownItems();

            // assert
            expect(items.length).toEqual(4);
            expect(items[0].Enable).toEqual(true);
            expect(items[1].Enable).toEqual(true);
            expect(items[2].Enable).toEqual(true);
            expect(items[3].Enable).toEqual(true);
        });

        it("check menu without a right authorization", function () {
            spyOn(dashboardHandler, 'IsEditMode').and.returnValue(false);
            spyOn(dashboardModel, 'CanUpdateDashboard').and.returnValue(false);
            spyOn(dashboardModel, 'IsTemporaryDashboard').and.returnValue(true);
            spyOn(privilegesViewModel, 'IsAllowExecuteDashboard').and.returnValue(false);

            // act
            var items = dashboardHandler.GetActionDropdownItems();

            // assert
            expect(items.length).toEqual(4);
            expect(items[0].Enable).toEqual(false);
            expect(items[1].Enable).toEqual(false);
            expect(items[2].Enable).toEqual(true);
            expect(items[3].Enable).toEqual(true);
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
                var result = !!dashboardHandler.CanAddNewRow(test.rowIndex, test.elementRowIndex, test.siblingColumnsCount);
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
                var result = !!dashboardHandler.CanMoveColumn(test.siblingColumnsCount, test.isCurrentWidget);
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".CreateDropToWidget", function () {
        it("should get element", function () {
            var offset = { left: 10, top: 5 };
            var size = { width: 100, height: 50 };
            var result = dashboardHandler.CreateDropToWidget($(), offset, size);

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
                var result = !!dashboardHandler.HaveDropToRowTop(test.rowIndex, test.elementRowIndex, test.elementSiblingColumnsCount);
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".CreateDropToRowTop", function () {
        it("should not get element", function () {
            var result = dashboardHandler.CreateDropToRowTop(null, null, null, null, false);

            // expect
            expect(result.length).toEqual(0);
        });

        it("should get element", function () {
            var offset = { left: 10, top: 30 };
            var size = { width: 100, height: 50 };
            var result = dashboardHandler.CreateDropToRowTop($(), offset, size, 0, true);

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
                var result = !!dashboardHandler.HaveDropToRowBottom(test.rowIndex, test.elementRowIndex, test.elementSiblingColumnsCount);
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".CreateDropToRowBottom", function () {
        it("should not get element", function () {
            var result = dashboardHandler.CreateDropToRowBottom(null, null, null, null, false);

            // expect
            expect(result.length).toEqual(0);
        });

        it("should get element", function () {
            var offset = { left: 10, top: 30 };
            var size = { width: 100, height: 50 };
            var result = dashboardHandler.CreateDropToRowBottom($(), offset, size, 0, true);

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
                var result = !!dashboardHandler.HaveDropToColumnLeft(test.isCurrentWidget, test.elementId, test.previousWidgetId);
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".CreateDropToColumnLeft", function () {
        it("should not get element", function () {
            var result = dashboardHandler.CreateDropToColumnLeft(null, null, null, null, false);

            // expect
            expect(result.length).toEqual(0);
        });

        it("should get element", function () {
            var offset = { left: 20, top: 30 };
            var size = { width: 100, height: 50 };
            var result = dashboardHandler.CreateDropToColumnLeft($(), offset, size, 0, true);

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
                var result = !!dashboardHandler.HaveDropToColumnRight(test.isCurrentWidget, test.elementId, test.nextWidgetId);
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".CreateDropToColumnRight", function () {
        it("should not get element", function () {
            var result = dashboardHandler.CreateDropToColumnRight(null, null, null, null, false);

            // expect
            expect(result.length).toEqual(0);
        });

        it("should get element", function () {
            var offset = { left: 20, top: 30 };
            var size = { width: 100, height: 50 };
            var result = dashboardHandler.CreateDropToColumnRight($(), offset, size, 0, true);

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
});
