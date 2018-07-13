(function (win) {

    var fnCheckLoading;

    var getPopup = function () {
        return jQuery('.popup:visible:last').data('kendoWindow');
    };

    var setCenter = function () {
        var kPopup = getPopup();
        if (kPopup)
            kPopup.center();
    };

    var closePopup = function () {
        var kPopup = getPopup();
        if (kPopup)
            kPopup.close();
    };

    var requestStart = function () {
        fnCheckLoading = setTimeout(function () {
            MC.ui.loading.setLoader('loadingHide');
            var kPopup = getPopup();
            if (kPopup)
                kPopup.element.busyIndicator(true);
        }, 100);
    };

    var requestEnd = function () {
        clearTimeout(fnCheckLoading);

        var kPopup = getPopup();
        if (kPopup)
            kPopup.element.busyIndicator(false);
    };

    var setScrollableResize = function (win, options) {
        if (!win.__scrollable_resize) {
            win.bind('resize', function (e) {
                if (win.options.isMaximized === true && win.restoreOptions && !win.restoreOptions.height) {
                    var contentHeight = parseInt(win.element.find('.popupContent').css('height')) || 100;
                    var height = contentHeight + win.element.find('.popupToolbar').outerHeight() - 2;
                    win.restoreOptions.height = height + 'px';
                }
                else {
                    win.element.find('.popupContent').css('height', options.getHeight(win));
                    options.onResize(win);
                }
            });

            win.__scrollable_resize = true;
        }
    };
    var setScrollable = function (settings) {
        var options = jQuery.extend({
            element: null,
            getHeight: function (win) {
                return win.element.height() - win.element.find('.popupToolbar').outerHeight();
            },
            onResize: jQuery.noop
        }, settings);

        var win = jQuery(options.element).data('kendoWindow');
        if (win) {
            win.element.addClass('popupContentScrollable');

            MC.util.disableMobileScroller(win);

            setScrollableResize(win, options);

            var scrollElement = win.element.find('.popupContent');
            if (!scrollElement.data('__scrollable_scroll')) {
                win.element.find('.popupContent').on('scroll', function () {
                    MC.form.validator.hideErrorMessage();
                });
                scrollElement.data('__scrollable_scroll', true);
            }

            setTimeout(function () {
                var minHeight = parseInt(scrollElement.css('min-height')) || 100;
                win.wrapper.css('min-height', minHeight + win.element.find('.popupToolbar').outerHeight() - 2);

                win.trigger('resize');
            }, 100);
        }
    };

    var popup = function (obj) {
        if (typeof obj == 'undefined')
            obj = '[data-role="mcPopup"]';

        
        switch (obj) {
            case 'center':
                setCenter();
                break;

            case 'close':
                closePopup();
                break;

            case 'requestStart':
                requestStart();
                break;

            case 'requestEnd':
                requestEnd();
                break;

            case 'setScrollable':
                setScrollable(arguments[1]);
                break;

            case 'setTooltip':
                var kPopup = jQuery(arguments[1].element).data('kendoWindow');
                kPopup.wrapper.find('.k-i-maximize').attr('title', Localization.Maximize);
                kPopup.wrapper.find('.k-i-close').attr('title', Localization.Close);
                break;
            
            default:
                jQuery(obj).each(function (k, v) {
                    if (jQuery(v).data('popup')) return;

                    jQuery(v)
                    .data('popup', true)
                    .click(function () {
                        var element = jQuery(this);
                        if (!element.hasClass('disabled')) {
                            var target = element.attr('href') || element.data('target');
                            var kPopup = jQuery(target).data('kendoWindow');
                            if (kPopup) {
                                kPopup.setOptions({
                                    title: element.data('title') || element.attr('title') || ''
                                });
                                kPopup.center().open();
                                kPopup.wrapper.find('.k-i-maximize').attr('title', Localization.Maximize);
                                kPopup.wrapper.find('.k-i-close').attr('title', Localization.Close);
                            }
                        }
                        return false;
                    });

                    var metadata = jQuery(v).data();
                    var settings = jQuery.extend({
                        target: jQuery(v).attr('href') || null,
                        title: jQuery(v).attr('title') || '',
                        modal: true,
                        animation: false,
                        pinned: true,
                        minWidth: 400,
                        minHeight: 200,
                        actions: ["Maximize", "Close"],
                        maximize: function (e) {
                            e.sender.wrapper.find('.k-i-restore').attr('title', Localization.RestoreDown);
                        }

                    }, metadata);
                    if (typeof jQuery(settings.target).data('kendoWindow') == 'undefined') {
                        jQuery(settings.target).addClass('popup').kendoWindow(settings);
                        var p = jQuery('.popup[id="' + settings.target.substr(1) + '"]');
                        if (p.length > 1) {
                            jQuery(p).first().data('kendoWindow').destroy();
                        }

                        jQuery('[data-role="popup-close"]', settings.target).click(function () {
                            jQuery(this).parents('.popup:eq(0)').data('kendoWindow').close();
                            return false;
                        });
                    }
                });
        }
    };

    win.MC.ui.popup = popup;
    MC.addPageReadyFunction(MC.ui.popup);
    MC.addPageResizeFunction(function () {
        MC.ui.popup('center');
    });
    MC.addPageReadyFunction(MC.ui.popup);
    MC.addAjaxDoneFunction(MC.ui.popup);

})(window);
