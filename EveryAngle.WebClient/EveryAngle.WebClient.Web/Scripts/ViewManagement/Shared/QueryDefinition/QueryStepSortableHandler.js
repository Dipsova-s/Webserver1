(function (handler) {
    "use strict";

    var isFilterMoved = false;
    
    handler.InitialSortable = function (container) {
        var self = this;

        // create drop target
        var dropTarget = self.CreateMoveFilter(container);

        // create sortable
        var element = container.find('.query-definition:last');
        var restore = function (e) {
            setTimeout(function () {
                dropTarget.removeClass('active focus');
                e.sender.element.find('.item').removeClass('item-disabled');
            }, 1);
        };
        var setDisableItems = function (items) {
            var found = false;
            items.each(function (index, item) {
                var dataitem = ko.dataFor(item);
                item = jQuery(item);

                if (found || self.IsJump(dataitem)) {
                    found = true;
                    item.addClass('item-disabled');
                }
            });
        };
        element.kendoSortable({
            container: container,
            placeholder: jQuery.proxy(self.CreateSortablePlaceholder, self),
            filter: '.item-sortable:not(.item-disabled)',
            ignore: '.filter-editor *',
            hint: jQuery.proxy(self.CreateSortableHint, self),

            start: function (e) {
                var data = ko.dataFor(e.item.get(0));
                isFilterMoved = false;

                // update hint size again
                e.sender.draggable.hint.css('visibility', 'hidden');
                setTimeout(function () {
                    e.sender.draggable.hint.children('.item').css('width', e.sender.element.outerWidth() - 2);
                    e.sender.draggable.hint.css('visibility', 'visible');
                });
                e.sender.draggable.currentTargetOffset.left = e.sender.element.offset().left + 1;
                e.sender.draggable.hint.css('left', e.sender.draggable.currentTargetOffset.left);

                // adhoc & has jump before cannot be moved to Angle
                if (self.CanMoveFilter(data))
                    dropTarget.addClass('active');

                // set disabled
                setDisableItems(e.item.prevAll());
                setDisableItems(e.item.nextAll());
            },
            end: restore,
            cancel: restore,
            change: function (e) {
                var prevCount = e.item.prevAll('.item-disabled').length;
                var oldIndex = prevCount + e.oldIndex;
                self.DestroyFilterEditor(self.Data()[oldIndex]);
                e.item.remove();

                if (!isFilterMoved) {
                    var newIndex = prevCount + e.newIndex;
                    self.Data.moveTo(oldIndex, newIndex);
                    self.CreateFilterEditor(self.Data()[newIndex]);
                }
            }
        });
        var sortable = element.data('kendoSortable');
        sortable.draggable.options.axis = 'y';
    };
    handler.CloneSortableItem = function (item) {
        return item.clone()
            .children(':not(.item-header)').remove().end()
            .find('[data-role="tooltip"]').removeAttr('data-role').end();
    };
    handler.CreateSortablePlaceholder = function (item) {
        var self = this;
        var placeholder = self.CloneSortableItem(item);
        placeholder.addClass('item-placeholder editmode');
        return placeholder;
    };
    handler.CreateSortableHint = function (item) {
        var self = this;
        var hint = self.CloneSortableItem(item);
        hint.addClass('editmode');
        hint.css('width', item.outerWidth() - 10);
        return jQuery('<ul class="query-definition hint" />').html(hint);
    };
    handler.CreateMoveFilter = function (container) {
        var self = this;

        var dropTarget = container.find('.query-definition-drop-area');
        if (!dropTarget.length)
            return dropTarget;

        dropTarget.kendoDropTarget({
            dragenter: function (e) {
                if (!dropTarget.hasClass('active'))
                    return;

                e.draggable.element.find('.item-placeholder').addClass('inactive');
                dropTarget.addClass('focus');
            },
            dragleave: function (e) {
                e.draggable.element.find('.item-placeholder').removeClass('inactive');
                dropTarget.removeClass('focus');
            },
            drop: function (e) {
                if (!dropTarget.hasClass('active'))
                    return;

                isFilterMoved = true;
                dropTarget.removeClass('active focus');

                // move filter to Angle
                var item = e.draggable.currentTarget;
                var queryStep = ko.dataFor(item.get(0));
                self.DestroyFilterEditor(queryStep);
                item.remove();

                popup.Confirm(
                    self.Texts().ConfirmMoveFilter,
                    jQuery.proxy(self.MoveFilter, self, queryStep),
                    jQuery.proxy(self.RefreshQuerySteps, self)
                );
            }
        });
        return dropTarget;
    };
    handler.MoveFilter = function (queryStep) {
        var self = this;

        // clone the moving filter
        var movedFilter = queryStep.data();
        movedFilter.is_adhoc = false;
        movedFilter.edit_mode = false;

        // remove it
        queryStep.is_applied = false;
        self.RemoveFilter(queryStep);
      
        // add to Angle
        self.Parent().AddQueryFilter(movedFilter);
        self.Parent().Save();
        jQuery('.block-overlay').css('display', 'none');
    };
    handler.CanSortFilter = function (data) {
        // can sorting/re-ordering a filter

        var self = this;
        var index = self.Data.indexOf(data);
        var hasSiblingFilter = self.IsFilter(self.Data()[index - 1]) || self.IsFilter(self.Data()[index + 1]);
        return hasSiblingFilter && self.Authorizations.CanChangeFilter();
    };
    handler.CanMoveFilter = function (data) {
        // can move a filter to parent (Angle)
        // before this filter should not have jump, adhoc or invalid stuft
        var self = this;
        var canMoveFilter = self.Parent() && self.Parent().CanSave();
        var hasJumpBefore = function () {
            var start = self.Data.indexOf(data) - 1;
            var foundJump = false;
            for (var i = start; i >= 0; i--) {
                if (self.IsJump(self.Data()[i])) {
                    foundJump = true;
                    break;
                }
            }
            return foundJump;
        };
        return WC.Utility.MatchAll(true, [
            canMoveFilter,
            !data.is_adhoc(),
            self.Validate().valid,
            !data.warning(),
            !hasJumpBefore()
        ]);
    };
}(QueryDefinitionHandler.prototype));