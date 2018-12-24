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
        var targetOffset = target.offset();
        if (e.data && e.data.position === TOOLTIP_POSITION.BOTTOM) {
            // show at bottom
            tooltipLeft = targetOffset.left + (target.outerWidth() / 2) - (tooltipWidth / 2);
            tooltipTop = targetOffset.top + target.outerHeight();
        }
        else if (e.data && e.data.position === TOOLTIP_POSITION.RIGHT) {
            // show at right
            tooltipLeft = targetOffset.left + target.outerWidth() + 10;
            tooltipTop = targetOffset.top - 4;
        }
        else {
            // depends on your mouse
            tooltipLeft = e.pageX + tooltipWidth + 5 > jQuery(window).scrollLeft() + win.WC.Window.Width ? e.pageX - tooltipWidth - 5 : e.pageX + 5;
            if (tooltipLeft < 5) {
                tooltipLeft = 5;
            }
            tooltipTop = e.pageY + tooltipHeight + 5 > jQuery(window).scrollTop() + win.WC.Window.Height ? e.pageY - tooltipHeight - 5 : e.pageY + 5;
            if (tooltipTop < 5) {
                tooltipTop = 5;
            }
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
        var text, renderAs;

        if (target.is('[data-tooltip-function]')) {
            var tooltipFunction = window[target.attr('data-tooltip-function')];
            var tooltipArgument = target.attr('data-tooltip-argument');
            text = tooltipFunction.call(target, tooltipArgument);
            renderAs = target.data('type');
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

        if (e.data.showWhenNeed) {
            var font = WC.HtmlHelper.GetFontCss(target);
            var textSize = WC.Utility.MeasureText(text, font);
            if (textSize <= target.width()) {
                text = '';
            }
        }

        return {
            text: text,
            type: renderAs === 'html' ? 'html' : 'text'
        };
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
        }
    };

    jQuery.extend(win.WC.HtmlHelper, { Tooltip: wcTooltip });

})(window);