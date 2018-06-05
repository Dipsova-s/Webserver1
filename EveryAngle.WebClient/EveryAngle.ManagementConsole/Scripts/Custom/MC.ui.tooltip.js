(function (win) {

var tooltip = {
    element: '#tooltip',
    target: '[data-role="tooltip"], .k-grid td:not(.noTooltip), .k-grid th:not(.noTooltip), .k-list > li, .logTooltip > li, .k-progressbar > .k-progress-status-wrap, #ServerStatusMenu .k-in',
    except: 'select, input:visible, textarea, .btnGroupContainer, [data-tooltip-title]',
    maxchars: 5000,
    init: function () {
        MC.addPageReadyFunction(this.tooltip);
    },
    tooltip: function () {
        var ui = MC.ui.tooltip;
        var fnCheckTooltip;
        var tooltip = jQuery(ui.element);
        var setTooltipPosition = function (e) {
            var tooltipWidth = tooltip.outerWidth();
            var tooltipHeight = tooltip.outerHeight();
            var tooltipLeft = e.pageX + tooltipWidth + 20 > $(window).scrollLeft() + MC.util.window.width ? e.pageX - tooltipWidth - 20 : e.pageX + 5;
            if (tooltipLeft < 5) tooltipLeft = 5;
            var tooltipTop = e.pageY + tooltipHeight + 20 > $(window).scrollTop() + MC.util.window.height ? e.pageY - tooltipHeight - 20 : e.pageY + 5;
            if (tooltipTop < 5) tooltipTop = 5;
            tooltip.css({
                left: tooltipLeft,
                top: tooltipTop
            });
        };
        var onShow = function (e, animateTime) {
            setTooltipPosition(e);

            if (!animateTime) {
                tooltip.stop(true, true).show();
            }
            else {
                tooltip.stop(true, true).fadeIn(animateTime);
            }
        };
        var hideTooltip = function (animation) {
            if (animation)
                tooltip.stop(true, true).fadeOut(100);
            else
                tooltip.stop(true, true).hide();
        };

        if (!tooltip.length) {
            tooltip = jQuery('<div class="k-tooltip-custom" />').attr('id', ui.element.substr(1)).appendTo('body');
            tooltip.on('mouseover', function () {
                hideTooltip(false);
            });
        }
        jQuery(document)
            .on('mouseover', ui.target, function (e) {
                clearTimeout(fnCheckTooltip);

                var target = jQuery(e.currentTarget),
                    text, renderAs;
                if (target.find('[data-tooltip-title]').length) {
                    var dataTooltip = target.find('[data-tooltip-title]');
                    var dataTitle = dataTooltip.data('tooltip-title');
                    text = MC.util.getController(dataTitle)(dataTooltip) || dataTitle;
                    renderAs = dataTooltip.data('type');
                }
                else if (!target.is('[data-role="tooltip"]') && target.find(ui.except).length) {
                    text = '';
                }
                else {
                    text = jQuery.trim(target.text());
                    renderAs = target.data('type');
                }
                tooltip[renderAs === 'html' ? 'html' : 'text'](ui.maxchars && text.length > ui.maxchars - 4 ? text.substr(0, ui.maxchars - 4) + '...' : text);

                if (!text || target.find(ui.target).length) {
                    hideTooltip(false);
                    return;
                }

                if (tooltip.is(':visible')) {
                    onShow(e, 0);
                }
                else {
                    fnCheckTooltip = setTimeout(function () {
                        onShow(e, 100);
                    }, 500);
                }
            })
            .on('mouseout', ui.target, function () {
                clearTimeout(fnCheckTooltip);

                fnCheckTooltip = setTimeout(function () {
                    hideTooltip(true);
                }, 500);
            })
            .on('mousewheel mousedown', function () {
                clearTimeout(fnCheckTooltip);
                hideTooltip(true);
            });
    }
};

win.MC.ui.tooltip = jQuery.extend({}, tooltip);
win.MC.ui.tooltip.init();

})(window);
