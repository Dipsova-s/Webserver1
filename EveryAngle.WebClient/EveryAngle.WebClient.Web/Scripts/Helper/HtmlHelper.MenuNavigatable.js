(function (win) {
    "use strict";

    var lockedClassName = 'navigatorLocked';

    // get target element
    var getTargetElement = function (target) {
        return jQuery(target).filter(':visible');
    };

    // get available items
    var getAvailableItems = function (e) {
        return getTargetElement(e.data.target).find(e.data.itemSelector).filter(':visible:not(.' + e.data.disabledClassName + ')');
    };

    // get active index, return -1 if no active
    var getActiveElementIndex = function (items, selectedClassName) {
        var activeElementIndex = -1;
        items.each(function (index, item) {
            if (jQuery(item).hasClass(selectedClassName)) {
                activeElementIndex = index;
                return false;
            }
        });
        return activeElementIndex;
    };

    // get previous item index, return last index if no index and enableLoop
    var getPrevItemIndex = function (items, activeIndex, enableLoop) {
        if (!items[activeIndex - 1])
            return enableLoop ? items.length - 1 : activeIndex;
        else
            return activeIndex - 1;
    };

    // get next item index, return 0 index if no index and enableLoop
    var getNextItemIndex = function (items, activeIndex, enableLoop) {
        if (!items[activeIndex + 1])
            return enableLoop ? 0 : activeIndex;
        else
            return activeIndex + 1;
    };

    // check item is in view
    var isItemInView = function (item, itemHeight, targetBound) {
        var itemBound = {};
        itemBound.top = item.offset().top - itemHeight;
        itemBound.bottom = itemBound.top + itemHeight;

        return itemBound.top >= targetBound.top && itemBound.bottom <= targetBound.bottom;
    };

    // get target boundary
    var getTargetBoundary = function (target) {
        var offsetTop = target.offset().top;
        return {
            top: offsetTop,
            bottom: offsetTop + target.height()
        };
    };

    // on UP key
    var onPressUp = function (e, items, activeElementIndex) {
        var target = getTargetElement(e.data.target);
        var itemIndex = getPrevItemIndex(items, activeElementIndex, e.data.enableLoop);
        target.find(e.data.itemSelector).removeClass(e.data.selectedClassName);
        var item = items.eq(itemIndex).addClass(e.data.selectedClassName);

        // scroll to element
        var itemHeight = items.outerHeight();
        var targetBound = getTargetBoundary(target);
        if (!isItemInView(item, itemHeight, targetBound)) {
            var itemCount = items.length;
            var currentScrollTop = target.scrollTop();
            target.scrollTop(itemIndex === itemCount - 1 ? itemCount * itemHeight : currentScrollTop - itemHeight);
        }
    };

    // on DOWN key
    var onPressDown = function (e, items, activeElementIndex) {
        var target = getTargetElement(e.data.target);
        var itemIndex = getNextItemIndex(items, activeElementIndex, e.data.enableLoop);
        target.find(e.data.itemSelector).removeClass(e.data.selectedClassName);
        var item = items.eq(itemIndex).addClass(e.data.selectedClassName);

        // scroll to element
        var itemHeight = items.outerHeight();
        var targetBound = getTargetBoundary(target);
        if (!isItemInView(item, itemHeight, targetBound)) {
            var currentScrollTop = target.scrollTop();
            target.scrollTop(itemIndex === 0 ? 0 : currentScrollTop + itemHeight);
        }
    };

    // on ENTER key
    var onPressEnter = function (items, activeElementIndex) {
        if (activeElementIndex !== -1) {
            var itemSelected = items.eq(activeElementIndex);
            if (itemSelected.attr('href') && itemSelected[0].click)
                itemSelected[0].click();
            else
                itemSelected.trigger('click');
        }
    };

    // on ESC key
    var onPressEsc = function (e) {
        jQuery(e.data.handle).trigger('click');

        var target = getTargetElement(e.data.target);
        if (target.length) {
            jQuery(document).trigger('click');
        }
    };

    // when click handle
    var onHandleClicked = function (e) {
        var target = getTargetElement(e.data.target);
        var allItems = target.find(e.data.itemSelector);
        var items = allItems.not('.' + e.data.disabledClassName);
        var itemSelected = items.filter('.' + e.data.selectedClassName);
        if (!itemSelected.length && e.data.autoSelect)
            itemSelected = items.first();

        target.removeClass(lockedClassName);
        allItems.removeClass(e.data.selectedClassName);

        itemSelected.addClass(e.data.selectedClassName);
    };

    // while navigating the item
    var onKeyboardNavigating = function (e) {
        var target = getTargetElement(e.data.target);
        if (!target.length)
            return;

        // get available items
        var items = getAvailableItems(e);

        // get active element index
        var activeElementIndex = getActiveElementIndex(items, e.data.selectedClassName);

        var isLocked = target.hasClass(lockedClassName);

        switch (e.keyCode) {
            case 38:
                // UP
                if (!isLocked)
                    onPressUp(e, items, activeElementIndex);
                break;

            case 40:
                // DOWN
                if (!isLocked)
                    onPressDown(e, items, activeElementIndex);
                break;

            case 13:
                // ENTER
                onPressEnter(items, activeElementIndex);
                break;

            case 27:
                // ESC
                onPressEsc(e);
                break;

            default:
                break;
        }
    };

    // bind events
    var bindNavigatableEvents = function (namespace, data) {
        // initial click handle event
        jQuery(document)
            .off('click.' + namespace)
            .on('click.' + namespace, data.handle, data, onHandleClicked);

        // initial keyboard event
        jQuery(document)
            .off('keydown.' + namespace)
            .on('keydown.' + namespace, data, onKeyboardNavigating);
    };

    var lockMenu = function (target) {
        jQuery(target).addClass(lockedClassName);
    };

    var unlockMenu = function () {
        jQuery('.' + lockedClassName).removeClass(lockedClassName);
    };

    // MenuNavigatable class
    var menuNavigatable = function (handle, target, itemSelector, selectedClassName, disabledClassName) {
        // plug private function for testability
        this._getAvailableItems = getAvailableItems;
        this._getActiveElementIndex = getActiveElementIndex;
        this._getPrevItemIndex = getPrevItemIndex;
        this._getNextItemIndex = getNextItemIndex;
        this._isItemInView = isItemInView;
        this._getTargetBoundary = getTargetBoundary;
        this._onPressUp = onPressUp;
        this._onPressDown = onPressDown;
        this._onPressEnter = onPressEnter;
        this._onPressEsc = onPressEsc;
        this._onHandleClicked = onHandleClicked;
        this._onKeyboardNavigating = onKeyboardNavigating;
        this._bindNavigatableEvents = bindNavigatableEvents;
        this._data = {
            handle: handle,
            target: target,
            itemSelector: itemSelector,
            selectedClassName: WC.Utility.IfNothing(selectedClassName, 'active'),
            disabledClassName: WC.Utility.IfNothing(disabledClassName, 'disabled'),
            autoSelect: false,
            enableLoop: true
        };
        this._namespace = (handle + target).replace(/\W/g, '_');

        // bind events
        bindNavigatableEvents(this._namespace, this._data);
    };

    // helper
    menuNavigatable.prototype.LockMenu = lockMenu;
    menuNavigatable.prototype.UnlockMenu = unlockMenu;

    jQuery.extend(win.WC.HtmlHelper, { MenuNavigatable: menuNavigatable });

})(window);