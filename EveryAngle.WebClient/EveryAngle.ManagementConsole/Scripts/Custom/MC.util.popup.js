(function (win, $) {

    // private methods for notification popup
    var createNotifyPopup = function (popupId) {
        var popup = $('#' + popupId).data('kendoWindow');
        if (!popup) {
            $('body').append('<div class="popup" id="' + popupId + '">'
                + '<div class="popupContent"></div>'
                + '<div class="popupToolbar"></div>'
                + '</div>');
            popup = $('#' + popupId).kendoWindow().data('kendoWindow');
        }
        return popup;
    };
    var setNotifyButtons = function (popup, buttons) {
        var container = popup.element.find('.popupToolbar').empty();
        $.each(buttons, function (index, button) {
            container.append(button);
        });
    };
    var showNotifyPopup = function (popup, message, options) {
        // hide validation tooltip
        MC.form.validator.hideErrorMessage();

        // extend with default settings
        var settings = jQuery.extend({
            minWidth: 400,
            minHeight: 150,
            modal: true,
            animation: false,
            actions: [],
            pinned: true,
            resizable: false
        }, options);

        // show popup
        popup.setOptions(settings);
        popup.open();
        popup.center();
        popup.element.find(".popupContent").html(message);

        // set scrollable content
        MC.ui.popup('setScrollable', { element: '#' + popup.element.attr('id') });
    };

    var popup = {
        showDescriptionPopup: function (obj) {
            MC.ui.popup('setScrollable', {
                element: '#popupDescriptionTemplate',
                getHeight: function (win) {
                    return Math.min(win.element.find('.popupContent').height('auto').outerHeight(), 400);
                },
                onResize: function (win) {
                    win.wrapper.height(win.element.find('.popupContent').height() + win.element.find('.popupToolbar').outerHeight() + 40);
                }
            });

            var win = $('#popupDescriptionTemplate').data('kendoWindow');
            win.setOptions({
                resizable: false,
                actions: ["Close"]
            });

            jQuery('#popupDescriptionTemplate .popupContent').html(jQuery(obj).next('textarea').val());
        },
        showPopupAbout: function (aboutUri) {
            // hide menu
            $('html').trigger('click');

            // display default indicator
            disableLoading();

            var popupElement = jQuery('#popupAbout');
            popupElement.empty().busyIndicator(true);
            MC.ajax
                .request({
                    url: aboutUri
                })
                .fail(function () {
                    var kPopup = popupElement.data('kendoWindow');
                    if (kPopup)
                        kPopup.close();
                })
                .done(function (data) {
                    popupElement.html(data);

                    var kPopup = jQuery('#popupAbout').data('kendoWindow');
                    if (kPopup) {
                        kPopup.setOptions({
                            resizable: false,
                            actions: ["Close"]
                        });

                        kPopup.bind('close', function () {
                            $('.k-overlay').off('click.close');
                        });

                        jQuery('.k-overlay').one('click.close', function () {
                            kPopup.close();
                        });
                    }
                })
                .always(function () {
                    popupElement.busyIndicator(false);
                });
        },
        showPopupOK: function (title, message, eventOkButton, width, height) {
            var popupId = 'popupConfirmAction';
            var popup = createNotifyPopup(popupId);

            var submitButton = $('<a class="btn btnPrimary btnSubmit">' + Localization.Ok + '</a>');
            if (typeof eventOkButton === 'function') {
                submitButton.on('click', function () {
                    eventOkButton();
                });
            }
            else if (typeof eventOkButton === 'string' && eventOkButton) {
                submitButton.attr('onclick', eventOkButton);
            }
            else {
                submitButton.on('click', function () {
                    popup.close();
                });
            }
            setNotifyButtons(popup, [submitButton]);

            showNotifyPopup(popup, message, {
                title: title,
                width: width,
                height: height
            });

            return popup;
        },
        showPopupAlert: function (message, width, height) {
            var popupId = 'popupAlertAction';
            var popup = createNotifyPopup(popupId);

            var okButton = $('<a class="btn btnPrimary btnSubmit">' + Localization.Ok + '</a>');
            okButton.on('click', function () {
                popup.close();
            });
            setNotifyButtons(popup, [okButton]);

            showNotifyPopup(popup, message, {
                title: Localization.Alert_Title,
                width: width || 500,
                height: height
            });

            return popup;
        },
        showPopupConfirmation: function (message, eventOkButton, eventCancelButton, width, height) {
            var popupId = 'popupConfirmation';
            var popup = createNotifyPopup(popupId);
            var setButtonHandler = function (button, handler) {
                if (typeof handler === 'function') {
                    button.on('click', function () {
                        handler();
                        popup.close();
                    });
                }
                else if (typeof handler === 'string' && handler) {
                    button.on('click', function () {
                        window[handler]();
                        popup.close();
                    });
                }
                else {
                    button.on('click', function () {
                        popup.close();
                    });
                }
            };

            //add confirm button
            var submitButton = $('<a class="btn btnPrimary btnSubmit">' + Localization.Ok + '</a>');
            setButtonHandler(submitButton, eventOkButton);

            //add cancel button
            var cancelButton = $('<a class="btn btnConfirmCancel">' + Localization.Cancel + '</a>');
            setButtonHandler(cancelButton, eventCancelButton);

            // set all popup
            setNotifyButtons(popup, [submitButton, cancelButton]);

            showNotifyPopup(popup, message, {
                title: Localization.Confirm_Title,
                width: width || 500,
                height: height
            });

            return popup;
        },
        disableMobileScroller: function (win) {
            var mobileScroller = win.element.data('kendoMobileScroller');
            if (mobileScroller) {
                mobileScroller.destroy();
                win.element.data('handler', win);
            }
        }
    };
    $.extend(win.MC.util, popup);

})(window, window.jQuery);