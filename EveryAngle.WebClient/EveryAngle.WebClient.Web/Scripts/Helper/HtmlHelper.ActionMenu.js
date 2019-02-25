(function (win) {
    "use strict";

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
        // always reset expanded state
        $(e.data.itemContainer).removeClass('open');

        // get size of sibling elements
        var target = jQuery(e.data.target);
        var siblingsWidth = e.data.calculateSiblingsWidth(target);

        // get  container size + check more button
        var containerWidth = target.parent().width();
        var availableSpace = containerWidth - siblingsWidth;
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
            jQuery(win).trigger('resize');
        }, 0);
    };

    // MenuNavigatable class
    var actionMenu = function (target, calculateSiblingsWidth) {
        // plug private function for testability
        this._data = {
            target: target,
            calculateSiblingsWidth: calculateSiblingsWidth,
            buttonElement: '.btnTools',
            itemContainer: '.popupAction',
            itemElement: '.actionDropdownItem'
        };
        this._namespace = target.replace(/\W/g, '_');

        // bind events
        bindActionMenuEvents(this._namespace, this._data);
    };

    // helper
    actionMenu.prototype.UpdateLayout = function (data) {
        onPageResized({ data: data });
    };

    jQuery.extend(win.WC.HtmlHelper, { ActionMenu: actionMenu });

})(window);
