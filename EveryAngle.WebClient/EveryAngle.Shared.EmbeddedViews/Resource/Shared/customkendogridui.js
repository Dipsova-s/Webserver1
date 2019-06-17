function KendoGridSelection(gridId, options) {
    var self = this;
    var _self = {};

    // settings
    jQuery.extend(_self, {
        // kendo grid
        grid: null,

        // key of dataitem
        key: 'uid',

        // multiple | single
        selection: KendoGridSelection.SELECTION.SINGLE,

        // range selection
        rangeSelect: true,

        // selected items
        selected: [],

        // last select item
        last: null,

        // selected class name
        className: 'k-state-selected',

        // validate selectable
        // return false won't continue
        validateSelection: jQuery.noop,

        // callback while click row
        onSelecting: jQuery.noop,

        // callback after done selection
        onSelected: jQuery.noop
    }, options);

    _self.initial = function () {
        _self.grid = jQuery('#' + gridId).data('kendoGrid');
        if (_self.grid) {
            // set id field
            _self.grid.dataSource.options.schema.model.id = _self.key;

            _self.grid.bind('dataBound', _self.setSelection);
            _self.grid.content.on('click', 'tr:not(.k-no-data)', _self.selectRow);
            _self.grid.content.on('dblclick', 'tr:not(.k-no-data)', _self.forceSelectRow);

            // update key
            _self.setSelection();
        }
    };

    _self.getKeyValue = function (dataItem) {
        return dataItem[_self.key].replace(/\W+/g, '_');
    };

    _self.getDataItem = function (e) {
        var key = jQuery(e.currentTarget).data('key');
        var dataItem = _self.grid.dataSource.get(key);
        return dataItem ? dataItem.toJSON() : null;
    };

    _self.getRow = function (dataItem) {
        return _self.grid.items().filter('[data-key2="' + _self.getKeyValue(dataItem) + '"]');
    };

    _self.selectRow = function (e) {
        var dataItem = _self.getDataItem(e);
        if (dataItem && _self.validateSelection(e, dataItem))
            _self.updateSelection(e, dataItem, _self.selection, _self.isRangeSelection(e, dataItem));
    };

    _self.forceSelectRow = function (e) {
        var dataItem = _self.getDataItem(e);
        if (dataItem && _self.validateSelection(e, dataItem))
            _self.updateSelection(e, dataItem, KendoGridSelection.SELECTION.SINGLE, false);
    };

    _self.updateSelection = function (e, dataItem, selectionMode, isRangeSelection) {
        if (isRangeSelection) {
            // range selection
            _self.rangeSelection(e, dataItem);
        }
        else if (_self.selected.hasObject(_self.key, dataItem[_self.key])) {
            // de-select
            _self.removeSelectedItem(_self.getRow(dataItem), dataItem);
        }
        else {
            // selection
            _self.addSelectedItem(e, _self.getRow(dataItem), dataItem, selectionMode);
        }

        // update last selection
        _self.last = _self.selected.length ? dataItem : null;

        // callback
        _self.onSelected(_self.selected);
    };

    _self.isRangeSelection = function (e, dataItem) {
        // 1. press shift
        // 2. is multiple selection
        // 3. has at lease 1 selected item
        // 4. current select item is not the last selected item

        var isValidSetting = _self.rangeSelect && e.shiftKey && _self.selection === KendoGridSelection.SELECTION.MULTIPLE;
        var hasLastItem = _self.last && _self.last !== dataItem[_self.key] && _self.getRow(_self.last).length;
        return isValidSetting && hasLastItem;
    };

    _self.rangeSelection = function (e, dataItem) {
        var rows = _self.grid.items().not('.k-no-data');
        var dataItems = JSON.parse(JSON.stringify(_self.grid.dataItems()));
        var lastIndex = dataItems.indexOfObject(_self.key, _self.last[_self.key]);
        var isLastItemSelected = _self.selected.hasObject(_self.key, _self.last[_self.key]);
        var currentIndex = dataItems.indexOfObject(_self.key, dataItem[_self.key]);
        var start, stop, index;
        if (lastIndex < currentIndex) {
            // down
            start = isLastItemSelected ? lastIndex - rows.eq(lastIndex).prevUntil(':not(.' + _self.className + ')').length : lastIndex;
            stop = currentIndex;
        }
        else {
            // up
            start = currentIndex;
            stop = isLastItemSelected ? lastIndex + rows.eq(lastIndex).nextUntil(':not(.' + _self.className + ')').length : lastIndex;
        }
        _self.clearSelection();
        for (index = start; index <= stop; index++) {
            _self.addSelectedItem(null, rows.eq(index), dataItems[index], KendoGridSelection.SELECTION.MULTIPLE);
        }
    };

    _self.addSelectedItem = function (e, row, dataItem, selectionMode) {
        if (_self.validateSelection(e, dataItem)) {
            if (selectionMode !== KendoGridSelection.SELECTION.MULTIPLE) {
                _self.selected = [];
                _self.grid.items().removeClass(_self.className);
            }
            _self.selected.push(dataItem);

            row.addClass(_self.className);
            _self.onSelecting(row, dataItem);

        }
    };

    _self.removeSelectedItem = function (row, dataItem) {
        _self.selected.removeObject(_self.key, dataItem[_self.key]);
        row.removeClass(_self.className);
    };

    _self.setSelection = function () {
        var dataItems = _self.grid.dataItems();
        var rows = _self.grid.items().not('.k-no-data').removeClass(_self.className);

        // set key attributes
        rows.each(function (index, row) {
            jQuery(row)
                // key use for kendo filter
                .attr('data-key', dataItems[index][_self.key])

                // key2 use for jquery filter
                .attr('data-key2', _self.getKeyValue(dataItems[index]));
        });

        // selected
        jQuery.each(_self.selected, function (index, item) {
            rows.filter('[data-key2="' + _self.getKeyValue(item) + '"]').addClass(_self.className);
        });
    };

    _self.clearSelection = function () {
        _self.selected = [];
        _self.setSelection();
    };

    // public function
    self.GetSelection = function () {
        return _self.selected.distinct(_self.getKeyValue);
    };
    self.ClearSelection = _self.clearSelection;

    // initial function
    _self.initial();
}

KendoGridSelection.SELECTION = {
    MULTIPLE: 'multiple',
    SINGLE: 'single'
};

function InitialKendo() {
    window.kendo.ui.Grid.prototype._positionColumnResizeHandle = function () {
        var that = this;
        var lockedHead = that.lockedHeader ? that.lockedHeader.find("thead:first") : $();

        that.thead.add(lockedHead).on("mousemove.kendoGrid", "th", function () {
            var th = $(this);
            if (th.hasClass("k-group-cell") || th.hasClass("k-hierarchy-cell")) {
                return;
            }
            that._createResizeHandle(th.closest("div"), th);
        });
    };
}
if (window.kendo) {
    InitialKendo();
}