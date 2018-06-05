(function (win, $) {

    var grid = {
        setGridWidth: jQuery.setGridWidth,
        setGridRowId: function (grid, key) {
            var dataItems = grid.dataItems();
            grid.items().not('.k-no-data').each(function (index, item) {
                $(item).attr('id', 'row-' + dataItems[index][key]);
            });
        },
        sortableGrid: function (gridId, dragEndCallback) {
            if (typeof dragEndCallback == 'undefined')
                dragEndCallback = jQuery.noop;

            var selectedClass = 'k-state-selected';
            var gridElement = jQuery(gridId);
            var grid = gridElement.data('kendoGrid');
            if (grid) {
                var gridDataSource = grid.dataSource;
                var isSorting;

                grid.table.kendoDraggable({
                    filter: 'tbody tr .btnMove',
                    axis: 'y',
                    hint: function (item) {
                        item = item.parents('tr:first');
                        grid.element.data('dragIndex', item.prevUntil().length);

                        var helper = jQuery('<div class="k-grid k-widget drag-helper" id="dragHelper" />');
                        if (!item.hasClass(selectedClass)) {
                            item.addClass(selectedClass).siblings().removeClass(selectedClass);
                        }
                        var elements = item.parent().children('.' + selectedClass).clone(true);
                        item.siblings('.' + selectedClass).remove();
                        return helper.append(elements);
                    },
                    drag: function (e) {
                        var tbody = grid.content.find('tbody'),
                            tbodyOffset = tbody.offset(),
                            dropLimitTop = tbodyOffset.top,
                            dropLimitBottom = dropLimitTop + tbody.height(),
                            dropIndex,
                            dropIndicator = jQuery('<span class="k-dirty" />'),
                            y = e.clientY || e.y.client;

                        tbody.find('.k-dirty').remove();

                        if (y <= dropLimitTop) dropIndex = 0;
                        else if (y >= dropLimitBottom) {
                            dropIndex = jQuery('tr', tbody).length;
                            dropIndicator.addClass('revert');
                        }
                        else {
                            var itemHeight = jQuery('tr:first', tbody).height();
                            dropIndex = Math.floor((y - tbodyOffset.top) / itemHeight);
                        }
                        jQuery('tr:eq(' + (dropIndicator.hasClass('revert') ? (dropIndex - 1) : dropIndex) + ') td:eq(0)', tbody).prepend(dropIndicator);
                        grid.element.data('dropIndex', dropIndex);
                    },
                    dragend: function (e) {
                        var data = grid.element.data(),
                            rows = grid.content.find('tr');

                        rows.find('.k-dirty').remove();
                        rows.removeClass(selectedClass);
                        jQuery('#dragHelper').hide();

                        if (data.dragIndex != data.dropIndex && data.dragIndex != data.dropIndex - 1) {
                            var movedRow = rows.eq(data.dragIndex).css('opacity', 0);
                            if (data.dropIndex === rows.length) {
                                rows.eq(data.dropIndex - 1).after(movedRow).next()
                                    .animate({ opacity: 1 }, 100).animate({ opacity: 0.3 }, 100).animate({ opacity: 1 }, 300);
                            }
                            else {
                                rows.eq(data.dropIndex).before(movedRow).prev()
                                    .animate({ opacity: 1 }, 100).animate({ opacity: 0.3 }, 100).animate({ opacity: 1 }, 300);
                            }

                            MC.util.resetGridRows(rows);

                            dragEndCallback(movedRow, data.dragIndex, data.dropIndex);
                        }
                    }
                });
            }
        },
        gridScrollFixed: function (grid) {
            if (grid && !!jQuery.browser.msie) {
                var virtualScroll = grid.content.data('kendoVirtualScrollable');
                grid.content
                    .off('mousewheel.iefix')
                    .on('mousewheel.iefix', function (e) {
                        if (!grid.content.find('.k-loading-mask').length) {
                            virtualScroll.verticalScrollbar.scrollTop(virtualScroll.verticalScrollbar.scrollTop() - (e.deltaFactor * e.deltaY));
                            e.preventDefault();
                        }
                    });
            }
        },
        triggerResizeKendoGrid: function (timeout) {
            setTimeout(function () {
                kendo.resize(jQuery('.k-grid'));
            }, timeout || 250);
        },
        resetGridRows: function (rows) {
            rows.removeClass('k-alt').filter(':nth-child(even)').addClass('k-alt');
        }
    };
    $.extend(win.MC.util, grid);

})(window, window.jQuery);