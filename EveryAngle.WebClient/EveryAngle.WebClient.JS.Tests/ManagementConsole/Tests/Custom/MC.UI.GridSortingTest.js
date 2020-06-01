/// <chutzpah_reference path="/../../Dependencies/custom/MC.ui.gridsorting.js" />

describe("MC.ui.gridsorting.js", function () {
    describe("MC.ui.gridsorting.isGridServerSortingIssue", function () {
        var tests = [
            {
                title: 'should be the grid sorting issue',
                grid: true,
                scrollable: { virtual: true },
                serverSorting: true,
                expected: true
            },
            {
                title: 'should not the grid sorting issue (grid = false)',
                grid: false,
                scrollable: { virtual: true },
                serverSorting: true,
                expected: false
            },
            {
                title: 'should not the grid sorting issue (virtual = false)',
                grid: true,
                scrollable: { virtual: false },
                serverSorting: true,
                expected: false
            },
            {
                title: 'should not the grid sorting issue (scrollable = false)',
                grid: true,
                scrollable: false,
                serverSorting: true,
                expected: false
            },
            {
                title: 'should not the grid sorting issue (serverSorting = false)',
                grid: true,
                scrollable: { virtual: true },
                serverSorting: false,
                expected: false
            }
        ];

        $.each(tests, function (index, test) {
            it(test.title, function () {
                var grid = !test.grid ? null : {
                    options: { scrollable: test.scrollable },
                    dataSource: {
                        options: { serverSorting: test.serverSorting }
                    }
                };
                var result = MC.ui.gridSorting.isGridServerSortingIssue(grid);

                expect(result).toEqual(test.expected);
            });
        });
    });

    describe("MC.ui.gridsorting.isSortingIssue", function () {

        beforeEach(function () {
            window['grid_sort_1'] = true;
        });

        var tests = [
            {
                title: 'should be the grid sorting issue',
                gridSortId: 'grid_sort_1',
                totalPages: 2,
                expected: true
            },
            {
                title: 'should be not the grid sorting issue (window.grid_sort_2 = false)',
                gridSortId: 'grid_sort_2',
                totalPages: 2,
                expected: false
            },
            {
                title: 'should be not the grid sorting issue (totalPages < 2)',
                gridSortId: 'grid_sort_1',
                totalPages: 1,
                expected: false
            }
        ];

        $.each(tests, function (index, test) {
            it(test.title, function () {
                var grid = {
                    dataSource: {
                        totalPages: function () { return test.totalPages; }
                    }
                };
                var result = MC.ui.gridSorting.isSortingIssue(test.gridSortId, grid);

                expect(!!result).toEqual(test.expected);
            });
        });
    });

    describe("MC.ui.gridsorting.fixGridSortingIssue", function () {

        var element;
        beforeEach(function () {
            element = $('<div style="width:100px;height:200px;overflow:auto;"><div style="width:100%;height:1000px;"></div></div>').appendTo('body');
            element.scrollTop(300);
        });

        afterEach(function () {
            element.remove();
        });

        it('should fix by scrolling content', function (done) {
            var grid = {
                virtualScrollable: {
                    verticalScrollbar: element
                }
            };
            MC.ui.gridSorting.fixGridSortingIssue(grid);
            expect(grid.virtualScrollable.verticalScrollbar.scrollTop()).toEqual(299);
            setTimeout(function () {
                expect(grid.virtualScrollable.verticalScrollbar.scrollTop()).toEqual(300);
                done();
            }, 10);
        });

    });

});