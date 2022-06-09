(function (win) {
    "use strict";

    win.TOOLTIP_POSITION = {
        BOTTOM: 'bottom',
        RIGHT: 'right',
        TOP: 'top',
        LEFT: 'left'
    };

    var fnCheckTooltip;

    var getTooltipElement = function (ui) {
        var tooltip = jQuery(ui.element);
        if (!tooltip.length) {
            tooltip = jQuery('<div class="k-grid-tooltip" />').attr('id', ui.element.substr(1)).appendTo('body');
        }
        return tooltip;
    };

    var setTooltipPosition = function (tooltip, e) {
        var tooltipWidth = tooltip.outerWidth();
        var tooltipHeight = tooltip.outerHeight();
        var tooltipLeft;
        var tooltipTop;
        var target = jQuery(e.currentTarget);
        var tooltipPosition = target.data('tooltip-position') || e.data && e.data.position;
        var cursorOffset = target.data('tooltip-offset') || e.data && e.data.offset || 0;
        var targetOffset = target[0];
        if (tooltipPosition === TOOLTIP_POSITION.BOTTOM) {
            // show at bottom
            tooltipLeft = Math.max(5, targetOffset.offsetLeft + (target.outerWidth() / 2) - (tooltipWidth / 2));
            tooltipTop = targetOffset.offsetTop + target.outerHeight() + 8 + cursorOffset;
            tooltip.addClass('k-window-arrow-n');
        }
        else if (tooltipPosition === TOOLTIP_POSITION.TOP) {
            // show at top
            tooltipLeft = Math.max(5, targetOffset.offsetLeft + (target.outerWidth() / 2) - (tooltipWidth / 2));
            tooltipTop = targetOffset.offsetTop - target.outerHeight() - cursorOffset;
            tooltip.addClass('k-window-arrow-s');
        }
        else if (tooltipPosition === TOOLTIP_POSITION.LEFT) {
            // show at left
            tooltipLeft = targetOffset.offsetLeft - target.outerWidth() - cursorOffset;
            tooltipTop = Math.max(5, targetOffset.offsetTop + (target.outerHeight() / 2) - (tooltipHeight / 2));
            tooltip.addClass('k-window-arrow-e');
        }
        else if (tooltipPosition === TOOLTIP_POSITION.RIGHT) {
            // show at right
            tooltipLeft = targetOffset.offsetLeft + target.outerWidth() + 8 + cursorOffset;
            tooltipTop = Math.max(5, targetOffset.offsetTop + (target.outerHeight() / 2) - (tooltipHeight / 2));
            tooltip.addClass('k-window-arrow-w');
        }
        else {
            // depends on your mouse
            tooltipLeft = Math.max(5, e.pageX + tooltipWidth + 5 > jQuery(window).scrollLeft() + win.WC.Window.Width ? e.pageX - tooltipWidth - 5 : e.pageX + 5);
            tooltipTop = Math.max(5, e.pageY + tooltipHeight + 5 > jQuery(window).scrollTop() + win.WC.Window.Height ? e.pageY - tooltipHeight - 5 : e.pageY + 5);
        }

        // z-index
        var zIndex = 999;
        tooltip.siblings().each(function () {
            var elementIndex = parseInt(jQuery(this).css('z-index'));
            if (!isNaN(elementIndex) && elementIndex > zIndex)
                zIndex = elementIndex;
        });

        tooltip.css({
            left: tooltipLeft,
            top: tooltipTop,
            'z-index': zIndex + 1
        });
    };

    var onShow = function (tooltip, e, animateTime) {
        setTooltipPosition(tooltip, e);

        if (!animateTime) {
            tooltip.stop(true, true).show();
        }
        else {
            tooltip.stop(true, true).fadeIn(animateTime);
        }
    };

    var getTooltipInfo = function (e, ui) {
        var target = jQuery(e.currentTarget);
        var showWhenNeed = e.data.showWhenNeed || target.is('[data-showwhenneed]');

        var text, renderAs;
        if (target.is('[data-tooltip-function]')) {
            var tooltipFunction = window[target.attr('data-tooltip-function')];
            var tooltipArgument = target.attr('data-tooltip-argument');
            text = tooltipFunction.call(target, tooltipArgument);
            renderAs = target.data('type');
            showWhenNeed = false;
        }
        else if (target.is('[data-tooltip-title]')) {
            text = target.data('tooltip-title');
            renderAs = target.data('type');
        }
        else if (!target.is('[data-role="tooltip"]') && target.find(ui.except).length) {
            text = '';
        }
        else if (target.is('[data-tooltip-text]')) {
            text = target.attr('data-tooltip-text');
            renderAs = target.data('type');
        }
        else {
            text = jQuery.trim(target.text());
            renderAs = target.data('type');
        }

        var disableClassName = target.attr('data-tooltip-disable-class');
        if (disableClassName && target.hasClass(disableClassName)) {
            text = '';
        }
        else if (showWhenNeed) {
            var elementSize = e.currentTarget.getBoundingClientRect().width;
            text = getTooltipTextWhenNeeded(target, text, elementSize);
        }

        return {
            text: text,
            type: renderAs === 'html' ? 'html' : 'text'
        };
    };

    var getTooltipTextWhenNeeded = function (target, text, elementSize) {
        var font = WC.HtmlHelper.GetFontCss(target);
        var letterSpacing = parseFloat(target.css('letter-spacing') || 0) * text.length;
        var textSize = WC.Utility.MeasureText(text, font) + letterSpacing;
        var acceptedError = -1;

        if (elementSize - textSize >= acceptedError) {
            text = '';
        }
        return text;
    };

    var setClassName = function (tooltip, className) {
        tooltip.attr('class', 'k-grid-tooltip ' + className);
    };

    var showTooltip = function (e) {
        var ui = win.WC.HtmlHelper.Tooltip;
        var tooltip = getTooltipElement(ui);
        clearTimeout(fnCheckTooltip);
        setClassName(tooltip, e.data.className);

        var target = jQuery(e.currentTarget);
        var info = getTooltipInfo(e, ui);

        tooltip[info.type](ui.maxchars && info.text.length > ui.maxchars - 4 ? info.text.substr(0, ui.maxchars - 4) + '...' : info.text);

        if (!info.text || target.find(e.data.selector).length) {
            tooltip.stop(true, true).hide();
        }
        else if (tooltip.is(':visible')) {
            onShow(tooltip, e, 0);
        }
        else {
            fnCheckTooltip = setTimeout(function () {
                onShow(tooltip, e, 100);
            }, 500);
        }
    };

    var hideTooltip = function () {
        clearTimeout(fnCheckTooltip);

        var ui = win.WC.HtmlHelper.Tooltip;
        var tooltip = getTooltipElement(ui);
        tooltip.stop(true, true).fadeOut(100);
    };

    var delayHideTooltip = function () {
        clearTimeout(fnCheckTooltip);

        fnCheckTooltip = setTimeout(function () {
            hideTooltip();
        }, 500);
    };

    var wcTooltip = {
        element: '#tooltip',
        except: 'select, input:visible, textarea',
        maxchars: 5000,
        Create: function (key, selector, showWhenNeed, position, tooltipClassName) {
            showWhenNeed = WC.Utility.ToBoolean(showWhenNeed);
            jQuery(document)
                .off('mouseover.' + key)
                .on('mouseover.' + key, selector, { selector: selector, showWhenNeed: showWhenNeed, position: position, className: tooltipClassName || '' }, showTooltip)
                .off('mouseout.' + key)
                .on('mouseout.' + key, delayHideTooltip)
                .off('mousewheel.' + key + ' mousedown.' + key)
                .on('mousewheel.' + key + ' mousedown.' + key, hideTooltip);
        },
        GetTooltipTextWhenNeeded: getTooltipTextWhenNeeded
    };

    jQuery.extend(win.WC.HtmlHelper, { Tooltip: wcTooltip });
    win.WC.HtmlHelper.Tooltip.Create('global', '[data-role="tooltip"]');
    win.WC.HtmlHelper.Tooltip.Create('kendo.dropdown', '.k-widget.k-dropdown:not(.ignore) .k-input', true);
    win.WC.HtmlHelper.Tooltip.Create('kendo.dropdownlist', '[role="listbox"]:not(.ignore) .k-item', true);

})(window);