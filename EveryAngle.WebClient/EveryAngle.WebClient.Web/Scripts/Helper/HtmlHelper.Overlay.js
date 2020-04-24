(function (win) {
    "use strict";
    
    var className = 'block-overlay';
    var scrollClassName = 'block-overlay-scrollable';
    var scrollTop = 0;

    var update = function (visible, target) {
        // don't touch this if hidden
        target = jQuery(target);
        target.removeClass('disabled');
        if (!target.length)
            return;
        
        var scrollElement = target.closest('.' + scrollClassName);
        scrollElement.removeClass('active');
        var blockers = jQuery('.' + className);
        if (!visible) {
            if (target.is(blockers.data('target'))) {
                blockers.hide();
                blockers.removeData('target');
            }
            return;
        }

        scrollTop = scrollElement.scrollTop();
        target.addClass('disabled');
        scrollElement.addClass('active');
        blockers.show();
        blockers.data('target', target);
        var offset = target.offset();
        offset.top = Math.floor(offset.top);
        offset.left = Math.floor(offset.left);
        var scrollOffset = scrollElement.offset();
        scrollOffset.top = Math.floor(scrollOffset.top);
        scrollOffset.left = Math.floor(scrollOffset.left);
        var size = {
            width: Math.floor(scrollElement.outerWidth() + parseInt(scrollElement.css('margin-right'))),
            height: Math.floor(target.outerHeight())
        };

        var topHeight = Math.max(offset.top, scrollOffset.top);
        var midHeight = size.height - Math.max(0, scrollOffset.top - offset.top);

        // top, set height
        blockers.filter('.top').css('height', topHeight);

        // left, set top, width & height
        blockers.filter('.left').css({
            top: offset.top,
            width: offset.left,
            height: midHeight
        });

        // right, set top, width & height
        blockers.filter('.right').css({
            top: Math.max(offset.top, scrollOffset.top),
            left: offset.left + size.width,
            height: midHeight
        });

        // bottom, set top
        blockers.filter('.bottom').css('top', topHeight + midHeight);
    };

    var scroll = function (e) {
        var blockers = jQuery('.' + className);
        if (!blockers.is(':visible'))
            return;

        var target = blockers.data('target');
        var scrollElement = target.closest('.' + scrollClassName);
        var currentScrollTop = scrollElement.scrollTop();
        var getMaxScrollPosition = function () {
            return jQuery.map(target.prevAll(), function (prev) { return jQuery(prev).outerHeight(); }).sum();
        };
        if (currentScrollTop > scrollTop) {
            // scroll down - stop on bottommost
            var maxScrollDown = getMaxScrollPosition();
            maxScrollDown += Math.max(0, target.outerHeight() - scrollElement.outerHeight());
            if (currentScrollTop > maxScrollDown) {
                scrollElement.scrollTop(maxScrollDown);
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        }
        else {
            // scroll up - stop on topmost
            var maxScrollUp = getMaxScrollPosition();
            if (currentScrollTop < maxScrollUp) {
                scrollElement.scrollTop(maxScrollUp);
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        }
        WC.HtmlHelper.Overlay.Update(true, target);
    };

    var scrollOverlay = function (e) {
        var blockers = jQuery('.' + className);
        var target = blockers.data('target');
        var scrollElement = target.closest('.' + scrollClassName);
        var scrollPosition = scrollElement.scrollTop() - e.deltaFactor * e.deltaY;
        scrollElement.scrollTop(scrollPosition);
    };

    var resize = function () {
        var blockers = jQuery('.' + className);
        WC.HtmlHelper.Overlay.Update(blockers.is(':visible'), blockers.data('target'));
    };

    var create = function (scrollTarget) {
        // set scrollable target
        scrollTarget.addClass(scrollClassName);
        scrollTarget
            .off('scroll.blockers touchmove.blockers mousewheel.blockers')
            .on('scroll.blockers touchmove.blockers mousewheel.blockers', scroll);
        jQuery(window).off('resize.blockers').on('resize.blockers', resize);

        // blocker ui to prevent a user to perform another action
        if (jQuery('.' + className).length)
            return;

        jQuery('<div class="' + className + ' top" />').appendTo('body');
        jQuery('<div class="' + className + ' bottom" />').appendTo('body');
        jQuery('<div class="' + className + ' left" />').appendTo('body');
        jQuery('<div class="' + className + ' right" />').appendTo('body');

        jQuery('.' + className).off('mousewheel.overlay').on('mousewheel.overlay', scrollOverlay);
    };

    var overlay = {
        Create: create,
        Update: update,
        Resize: resize,
        Scroll: scroll,
        ScrollOverlay: scrollOverlay
    };

    jQuery.extend(win.WC.HtmlHelper, { Overlay: overlay });
})(window);