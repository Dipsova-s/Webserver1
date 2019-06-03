(function (win) {

    // Fixing grid does not show content fully
    // after you sorted the last page which number of items are less then 1 / 3 of page size

    var init = function () {
        MC.addPageReadyFunction(MC.ui.gridSorting);
        MC.addAjaxDoneFunction(MC.ui.gridSorting);
    };

    var isGridServerSortingIssue = function (grid) {
        return !(!grid
            // not virtual scroll
            || !grid.options.scrollable || !grid.options.scrollable.virtual
            // not server sorting
            || !grid.dataSource.options.serverSorting);
    };

    var isSortingIssue = function (gridSortId, grid) {
        return window[gridSortId] && grid.dataSource.totalPages() > 1;
    };

    var fixGridSortingIssue = function (grid) {
        var scrollTop = grid.virtualScrollable.verticalScrollbar.scrollTop();
        grid.virtualScrollable.verticalScrollbar.scrollTop(scrollTop - 1);
        setTimeout(function () {
            grid.virtualScrollable.verticalScrollbar.scrollTop(scrollTop);
        });
    };

    var gridSorting = function () {
        $('[data-role="grid"]').each(function () {
            var grid = $(this).data('kendoGrid');
            if (!isGridServerSortingIssue(grid)) {
                return;
            }

            var gridSortId = 'grid_sort_' + $.now();
            window[gridSortId] = false;
            grid.wrapper.attr('data-grid-sort', gridSortId);
            grid.wrapper.on('click', '[data-role="columnsorter"]', { gridSortId: gridSortId }, function (e) {
                window[e.data.gridSortId] = true;
            });

            grid.bind('dataBound', function (e) {
                var target = e.sender.wrapper.data('gridSort');
                if (isSortingIssue(target, e.sender)) {
                    fixGridSortingIssue(e.sender);
                }
                window[target] = false;
            });
        });
    };

    win.MC.ui.gridSorting = gridSorting;

    // for unit testing
    win.MC.ui.gridSorting.isGridServerSortingIssue = isGridServerSortingIssue;
    win.MC.ui.gridSorting.isSortingIssue = isSortingIssue;
    win.MC.ui.gridSorting.fixGridSortingIssue = fixGridSortingIssue;
    init();

})(window);
