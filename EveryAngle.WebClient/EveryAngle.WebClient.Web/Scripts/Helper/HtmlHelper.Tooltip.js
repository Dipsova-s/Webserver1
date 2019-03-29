(function (win) {
    "use strict";

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
        var tooltipLeft = e.pageX + tooltipWidth + 5 > jQuery(window).scrollLeft() + win.WC.Window.Width ? e.pageX - tooltipWidth - 5 : e.pageX + 5;
        if (tooltipLeft < 5) {
            tooltipLeft = 5;
        }
        var tooltipTop = e.pageY + tooltipHeight + 5 > jQuery(window).scrollTop() + win.WC.Window.Height ? e.pageY - tooltipHeight - 5 : e.pageY + 5;
        if (tooltipTop < 5) {
            tooltipTop = 5;
        }
        tooltip.css({
            left: tooltipLeft,
            top: tooltipTop
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
        var showWhenNeed = e.data.showWhenNeed;
        var text, renderAs;
        if (target.is('[data-tooltip-function]')) {
            var tooltipFunction = window[target.attr('data-tooltip-function')];
            var tooltipArgument = target.attr('data-tooltip-argument');
            text = tooltipFunction.call(window, tooltipArgument);
            renderAs = target.data('type');
            showWhenNeed = false;
        }
        else if (target.find('[data-tooltip-title]').length) {
            var dataTooltip = target.find('[data-tooltip-title]');
            text = dataTooltip.data('tooltip-title');
            renderAs = dataTooltip.data('type');
        }
        else if (!target.is('[data-role="tooltip"]') && target.find(ui.except).length) {
            text = '';
        }
        else {
            text = jQuery.trim(target.text());
            renderAs = target.data('type');
        }

        if (showWhenNeed) {
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

    var showTooltip = function (e) {
        var ui = win.WC.HtmlHelper.Tooltip;
        var tooltip = getTooltipElement(ui);
        clearTimeout(fnCheckTooltip);

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
        Create: function (key, selector, showWhenNeed) {
            if (typeof showWhenNeed === 'undefined') {
                showWhenNeed = false;
            }

            jQuery(document)
                .off('mouseover.' + key)
                .on('mouseover.' + key, selector, { selector: selector, showWhenNeed: showWhenNeed }, showTooltip)
                .off('mouseout.' + key)
                .on('mouseout.' + key, delayHideTooltip)
                .off('mousewheel.' + key + ' mousedown.' + key)
                .on('mousewheel.' + key + ' mousedown.' + key, hideTooltip);
        }
    };

    jQuery.extend(win.WC.HtmlHelper, { Tooltip: wcTooltip });

})(window);