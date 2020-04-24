(function (handler) {
    "use strict";

    handler.CloneAggregationSortableItem = function (item) {
        return item.clone()
            .children(':not(.item-header)').remove().end()
            .find('[data-role="tooltip"]').removeAttr('data-role').end();
    };

    handler.CreateAggregationSortablePlaceholder = function (item) {
        var self = this;
        var placeholder = self.CloneAggregationSortableItem(item);
        placeholder.addClass('item-placeholder');
        return placeholder;
    };

    handler.CreateAggregationSortableHint = function (item) {
        var self = this;
        var hint = self.CloneAggregationSortableItem(item);
        hint.css('width', item.outerWidth());
        return jQuery('<ul class="query-aggregation hint" />').html(hint);
    };

    handler.GetPreviousItemCount = function (itemArea) {
        var self = this;
        var rowCount = self.GetAggregationRowFields().length;
        var columnCount = self.GetAggregationColumnFields().length;
        var result = 0;
        if (itemArea === AggregationFieldViewModel.Area.Column) {
            result = rowCount;
        }
        else if (itemArea === AggregationFieldViewModel.Area.Data) {
            result = rowCount + columnCount;
        }

        return result;
    };

    handler.OnAggregationSortableChange = function (e) {
        if (e.action === 'receive') {
            return;
        }

        var self = this;
        var dataItem = ko.dataFor(e.item.get(0));
        var itemArea = dataItem.area();
        var previousItemCount = self.GetPreviousItemCount(itemArea);
        var oldIndex = e.oldIndex + previousItemCount;
        var newIndex = e.newIndex + previousItemCount;
        var oldItems;
        if (e.action !== 'sort') {
            var newArea;
            var previousItems = e.item.prevAll('.item').length;
            if (itemArea === AggregationFieldViewModel.Area.Column) {
                newArea = AggregationFieldViewModel.Area.Row;
                newIndex = previousItems;
            }
            else {
                newArea = AggregationFieldViewModel.Area.Column;
                newIndex = previousItems + self.GetPreviousItemCount(newArea) - 1;
            }

            oldItems = self.GetAggregationFieldsByArea(newArea);
            dataItem.area(newArea);
        }

        e.item.remove();
        self.Aggregation.moveTo(oldIndex, newIndex);

        // callback
        if (oldItems)
            self.OnAggregationChangeCallback(oldItems, itemArea, oldIndex, newIndex);

        // check count field
        if (itemArea === AggregationFieldViewModel.Area.Data)
            self.UpdateCountField();

        // expand container
        self.OpenAggregationAreaPanel(dataItem.area());
        setTimeout(self.TriggerUpdateBlockUI, 100);
    };
    handler.OnAggregationSortableStart = function (e) {
        e.sender.options.container.addClass('expand-all');
        e.item.closest('.query-aggregation-inner').addClass('active');
    };
    handler.OnAggregationSortableStop = function (e) {
        e.sender.options.container.removeClass('expand-all');
        e.sender.options.container.closest('.accordion').find('.query-aggregation-inner').removeClass('active');
    };
    handler.OnAggregationSortableMove = function (e) {
        e.sender.options.container.closest('.accordion').find('.query-aggregation-inner').removeClass('active');
        e.target.closest('.query-aggregation-inner').addClass('active');
    };

    handler.CreateDragDropSection = function (container, selector, connector) {
        var self = this;

        var element = container.find(selector);
        if (!element.length || element.data('kendoSortable')) {
            return;
        }

        element.kendoSortable({
            container: container,
            connectWith: connector,
            placeholder: jQuery.proxy(self.CreateAggregationSortablePlaceholder, self),
            filter: 'li.item-sortable',
            cursor: 'move',
            hint: jQuery.proxy(self.CreateAggregationSortableHint, self),
            start: jQuery.proxy(self.OnAggregationSortableStart, self),
            end: jQuery.proxy(self.OnAggregationSortableStop, self),
            cancel: jQuery.proxy(self.OnAggregationSortableStop, self),
            move: jQuery.proxy(self.OnAggregationSortableMove, self),
            change: jQuery.proxy(self.OnAggregationSortableChange, self)
        });
        var sortable = element.data('kendoSortable');
        sortable.draggable.options.axis = 'y';
    };

    handler.InitialAggregationSortable = function (container) {
        var self = this;
        self.CreateDragDropSection(container.find('.accordion'), '.query-aggregation-row .query-aggregation', '.query-aggregation-column .query-aggregation');
        self.CreateDragDropSection(container.find('.accordion'), '.query-aggregation-column .query-aggregation', '.query-aggregation-row .query-aggregation');
        self.CreateDragDropSection(container.find('.query-aggregation-data .accordion-body'), '.query-aggregation', null);
    };

    handler.OnAggregationChangeCallback = jQuery.noop;

}(QueryDefinitionHandler.prototype));