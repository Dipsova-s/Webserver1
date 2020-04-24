(function (win) {
    "use strict";

    var createActionMenuItems = function (itemsSelector, dropdownSelector, data, callback) {
        // for large screen
        var target = jQuery(itemsSelector).empty();
        jQuery.each(data, function (index, action) {
            var item = jQuery('<a />')
                .attr('class', 'actionDropdownItem ' + action.Id + (action.Enable ? '' : ' disabled') + (action.Visible ? '' : ' alwaysHide'))
                .html('<span>' + action.Text + '</span>');
            item.on('click', jQuery.proxy(callback, null, item.get(0), action.Id));
            target.append(item);
        });

        // for small screen
        var dropdown = WC.HtmlHelper.DropdownList(dropdownSelector, data, {
            height: 500,
            dataValueField: 'Id',
            dataTextField: 'Text',
            template: '<div class="actionDropdownItem #: Id # #: Enable ? \'\' : \'disabled\' #"><span>#: Text #</span></div>',
            optionLabel: Localization.Actions,
            select: function (e) {
                var dataItem = e.sender.dataItem(e.item);
                callback(e.item.children('.actionDropdownItem').get(0), dataItem.Id);
                e.preventDefault();
            },
            open: function () {
                jQuery(window).off('resize.actiondropdown').on('resize.actiondropdown', function () {
                    dropdown.close();
                });
            },
            close: function () {
                jQuery(window).off('resize.actiondropdown');
            }
        });
        dropdown.dataSource.filter({
            field: 'Visible',
            operator: 'eq',
            value: true
        });
        if (dropdown.items().length)
            dropdown.wrapper.show();
        else
            dropdown.wrapper.hide();
    };

    var onDocumentClicked = function (e) {
        var currentTarget = jQuery(e.target);
        var target = jQuery(e.data.itemContainer);
        if (!currentTarget.is(target) && !currentTarget.closest(e.data.target).length) {
            target.removeClass('open');
        }
    };

    var onHandleClicked = function (e) {
        jQuery(e.currentTarget).next(e.data.itemContainer).toggleClass('open');
    };

    var onMenuClicked = function (e) {
        var currentTarget = jQuery(e.currentTarget);
        if (!currentTarget.hasClass('disabled')) {
            currentTarget.closest(e.data.itemContainer).removeClass('open');
        }
    };

    var onPageResized = function (e) {
        var itemContainer = jQuery(e.data.itemContainer);

        // always reset expanded state
        itemContainer.removeClass('open').css('width', '');

        if (itemContainer.is(':hidden') || !e.data.responsive) {
            return;
        }

        // get  container size + check more button
        var target = jQuery(e.data.target);
        var containerWidth = target.parent().width();
        var availableSpace = containerWidth;
        var buttonElement = target.find(e.data.buttonElement);
        buttonElement.removeClass('active');

        var itemElements = target.find(e.data.itemElement);
        itemElements.removeClass('more first').css('top', '');
        itemElements = itemElements.filter(':visible');

        var itemElementWidth = itemElements.outerWidth();
        var availableItemsCount = Math.floor(availableSpace / itemElementWidth);

        if (itemElements.length > availableItemsCount) {
            buttonElement.addClass('active');

            // needs more button
            var extraSpacing = 5, subtractOffset = -1;
            var baseOffset = (buttonElement.outerHeight() + extraSpacing) - subtractOffset;
            var offsetTop = baseOffset;
            var totalItemsAsIndex = Math.max(availableItemsCount - 1, 0);

            itemElements.slice(totalItemsAsIndex).addClass('more').each(function (index) {
                // set position of more items
                jQuery(this).css('top', offsetTop);
                offsetTop += baseOffset;

                // add class 'first' for border style
                if (index === 0) {
                    jQuery(this).addClass('first');
                }
            });
        }

        // set size of container
        target.width(Math.min(availableItemsCount, itemElements.length) * itemElementWidth);
    };

    // bind events
    var bindActionMenuEvents = function (namespace, data) {
        // initial click handle event
        jQuery(document)
            .off('click.actionmenu' + namespace)
            .on('click.actionmenu' + namespace, data, onDocumentClicked);

        jQuery(document)
            .off('click.actionmenu-handle' + namespace)
            .on('click.actionmenu-handle' + namespace, data.buttonElement, data, onHandleClicked);

        jQuery(document)
            .off('click.actionmenu-menu' + namespace)
            .on('click.actionmenu-menu' + namespace, data.itemElement, data, onMenuClicked);

        jQuery(win)
            .off('resize.actionmenu-' + namespace)
            .on('resize.actionmenu-' + namespace, data, onPageResized);

        setTimeout(function () {
            jQuery(win).trigger('resize.actionmenu-' + namespace);
        }, 0);
    };

    // MenuNavigatable class
    var actionMenu = function (target, responsive) {
        // plug private function for testability
        this._data = {
            target: target,
            responsive: WC.Utility.ToBoolean(responsive),
            buttonElement: '.btnTools',
            itemContainer: '.popupAction',
            itemElement: '.actionDropdownItem'
        };
        this._namespace = target.replace(/\W/g, '_');

        // bind events
        bindActionMenuEvents(this._namespace, this._data);
    };

    // helper
    actionMenu.CreateActionMenuItems = createActionMenuItems;

    jQuery.extend(win.WC.HtmlHelper, { ActionMenu: actionMenu });

})(window);
