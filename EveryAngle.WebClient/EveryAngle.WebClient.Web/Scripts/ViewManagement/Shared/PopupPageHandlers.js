var popup = new Popup();

function Popup() {
    "use strict";

    var self = this;
    self.Current = null;
    self.OnResizeTimeout = null;
    self.OnCloseCallback = jQuery.noop;

    self.Initial = function () {
        if (jQuery(document).data('popup-initialzed'))
            return;

        jQuery(document).data('popup-initialzed', true);

        self.PageResize();
        jQuery(window).on('resize.popup', function () {
            self.PageResize();
        });
    };
    self.PageResize = function () {
        if (!jQuery.isReady)
            return;

        var wh = WC.Window.Height;
        var ww = WC.Window.Width;
        var isScreenMinHeight = wh <= 670;
        var safari = !Modernizr.touch && !!jQuery.browser.safari;
        jQuery('html').removeClass('screenMinHeight').addClass(isScreenMinHeight ? 'screenMinHeight' : '');

        jQuery('.k-window-content:visible').each(function () {
            var win = jQuery(this).data(enumHandlers.KENDOUITYPE.WINDOW);
            if (win) {
                if (safari) {
                    win.wrapper.css('height', '');
                    win.wrapper.height(win.wrapper.height());
                }
                if (win.options.center) {
                    win.center();
                }
                else if (!win.options.appendTo && win.options.position) {
                    win.wrapper.css('left', win.options.position.left);
                    win.wrapper.css('top', win.options.position.top);

                    var winOffset = win.wrapper.offset();
                    var winSize = {
                        width: win.wrapper.outerWidth(),
                        height: win.wrapper.outerHeight()
                    };
                    if (winSize.height + winOffset.top > wh)
                        win.wrapper.css('top', 0);
                    if (winSize.width + winOffset.left > ww)
                        win.wrapper.css('left', 0);
                }
                win.trigger('resize');
            }
        });
    };

    self.Show = function (options) {
        var onOpen = function (e) {
            e.sender.wrapper.css('opacity', 1);

            if (e.sender.options.draggable) {
                e.sender.wrapper.addClass('k-window-draggable');
            }

            e.sender.wrapper.addClass(e.sender.options.className + (e.sender.options.content ? '' : ' popup-initialized'));

            if (jQuery(e.sender.wrapper).hasClass('popup-initialized')) {
                self.PageResize();
            }

            // disable mobile scroller
            if (!e.sender.options.scrollable) {
                var mobileScroller = e.sender.element.data('kendoMobileScroller');
                if (mobileScroller) mobileScroller.destroy();
            }

            self.SetButtons(e.sender, e.sender.options.buttons);

            if (typeof options.open === 'function')
                options.open(e);
            if (typeof options.activate === 'function')
                options.activate(e);

            if (!e.sender.options.content) {
                e.sender.isPopupInitialized = true;
            }
        };
        var onClose = function (e) {
            if (typeof options.close === 'function')
                options.close(e);
        };
        var onRefresh = function (e) {
            if (e.sender.options.draggable) {
                jQuery(e.sender.wrapper).addClass('k-window-draggable');
            }
            jQuery(e.sender.wrapper).addClass('popup-initialized');

            self.PageResize();

            jQuery(e.sender.element).busyIndicator(false);

            if (typeof options.refresh === 'function') options.refresh(e);

            e.sender.isPopupInitialized = true;
        };
        var onResize = function (e) {
            e.sender.wrapper.removeClass('k-window-maximized');
            if (e.sender.options.isMaximized) {
                e.sender.wrapper.addClass('k-window-maximized');
                var buttonHeight = e.sender.wrapper.find('.k-window-buttons').outerHeight();
                var titleHeight = e.sender.wrapper.find('k-window-titlebar').outerHeight();
                e.sender.wrapper
                    .offset({
                        left: 0,
                        top: 0
                    })
                    .height(WC.Window.Height - titleHeight - buttonHeight - 42)
                    .width(WC.Window.Width);
            }

            if (typeof options.resize === 'function') options.resize(e);

            // fixed editor while resizing the popup
            jQuery('.k-editor:visible [data-role="editor"]', e.sender.element).each(function (k, v) {
                WC.HtmlHelper.Editor(v).trigger('select');
            });

            // set height grid
            jQuery('[data-role="grid"]:visible', e.sender.element).each(function (index, gridElement) {
                gridElement = jQuery(gridElement);
                gridElement.find('.k-grid-content').height(gridElement.innerHeight() - gridElement.children('.k-grid-header').outerHeight());
            });
        };

        if (!jQuery(options.element).length) {
            if (typeof options.element === 'string' && options.element.charAt(0) === '#') {
                options.element = options.element.substr(1);
            }
            else {
                options.element = 'popup' + jQuery.now();
            }
            options.element = jQuery('<div id="' + options.element + '" />').appendTo(options.appendTo || document.body);
            if (options.html) {
                options.element.html(options.html);
            }
        }

        var settings = jQuery.extend({
            html: '',
            animation: false,
            scrollable: true,
            className: '',
            minWidth: 300,
            minHeight: 200,
            title: false,
            pinned: false,
            center: true,
            modal: true,
            resizable: true,
            visible: true,
            actions: ["Maximize", "Close"],
            maximize: function (e) {
                e.sender.wrapper.find('.k-i-window-restore').attr('title', Localization.RestoreDown);
            },
            buttons: null
        }, options);

        settings.resize = onResize;
        settings.refresh = onRefresh;
        settings.activate = onOpen;
        delete settings.open;
        settings.close = onClose;

        var win = jQuery(settings.element).data(enumHandlers.KENDOUITYPE.WINDOW);
        if (typeof win === 'undefined' || win === null) {
            win = jQuery(settings.element).kendoWindow(settings).data(enumHandlers.KENDOUITYPE.WINDOW);
            win.wrapper.find('.k-i-window-maximize').attr('title', Localization.Maximize);
            win.wrapper.find('.k-i-close').attr('title', Localization.Close);

            if (typeof settings.content !== 'undefined')
                win.element.busyIndicator(true);
            else
                popup.PageResize();

            if (settings.center && win) {
                win.wrapper.css('top', 0);
                win.center();
            }
        }
        else {
            win.wrapper.css('opacity', 0);
            delete settings.resize;
            self.SetOptions(win, settings);

            if (settings.center) {
                win.center();
            }
            else if (settings.position) {
                win.wrapper.css(settings.position);
            }
            if (settings.visible) {
                setTimeout(function () {
                    if (win && win.wrapper.length) {
                        win.wrapper.css('opacity', 1);
                        win.open();
                    }
                }, 1);
            }
        }
        if (win.element) {
            win.element.off('keydown');
        }
        self.Current = win;

        return win;
    };
    self.SetOptions = function (win, options) {
        if (jQuery(win.wrapper).hasClass('popup-initialized')) {
            win.setOptions(options);
            self.SetButtons(win, options.buttons);
        }
    };
    self.SetButtons = function (win, buttons) {
        if (!win || !buttons)
            return;

        if (buttons.length > 0) {
            var wrapper = jQuery('.k-window-buttons', win.wrapper).length === 0 ? jQuery('<div class="k-window-buttons" />') : jQuery('.k-window-buttons', win.wrapper).empty(),
                inner = wrapper.append('<div class="k-window-buttons-inner" />').children(),
                winId = win.element.attr('id') || '';

            jQuery.each(buttons, function (k, v) {
                v.kendoWindow = win;
                jQuery('<a class="btn" />')
                    .attr('id', 'btn-' + winId + k)
                    .data('setting', v)
                    .click(function (e) {
                        var fn = jQuery.extend({}, e, jQuery(this).data('setting'));
                        if (typeof fn.click === 'string' && v.kendoWindow[fn.click]) {
                            v.kendoWindow[fn.click](fn);
                        }
                        else if (typeof fn.click === 'function') {
                            fn.click(fn, this);
                        }
                    })
                    .addClass(v.isPrimary ? 'btn-primary' : '')
                    .addClass(v.isSecondary ? 'btn-secondary' : '')
                    .addClass(!v.isPrimary && !v.isSecondary ? 'btn-ghost' : '')
                    .addClass(v.position ? 'float-' + v.position : '')
                    .addClass(v.className)
                    .append('<span>' + v.text + '</span>')
                    .appendTo(inner);
            });
            win.wrapper.addClass('k-window-with-buttons').append(wrapper);
        }
    };
    self.CanButtonExecute = function (button) {
        button = jQuery(button);
        return !button.hasClass('disabled') && !button.hasClass('executing') && !button.hasClass('btn-busy');
    };
    self.Destroy = function (e) {
        e.sender.destroy();
    };
    self.Close = function (obj) {
        if (typeof obj === 'undefined')
            return;

        obj = jQuery(obj);

        var win = obj.data(enumHandlers.KENDOUITYPE.WINDOW);
        if (!win) {
            win = obj.find('.k-window-content:first').data(enumHandlers.KENDOUITYPE.WINDOW);
        }
        if (win) {
            win.wrapper.css('opacity', '');
            win.close();
        }

        if (obj.length && obj.is(':visible')) {
            if (obj.hasClass('k-window')) {
                obj.hide();
            }
            else {
                obj.parents('.k-window:first').hide();
            }
        }
    };
    self.CloseAll = function () {
        if (typeof errorHandlerModel !== 'undefined') {
            errorHandlerModel.Enable(true);
            errorHandlerModel.Source(null);
        }
        jQuery('.k-window, .k-overlay').hide();
        progressbarModel.EndProgressBar();
    };

    self.Alert = function (title, message, options) {
        var settings = jQuery.extend({
            icon: 'alert'
        }, options);

        // close the exist popup
        self.Close('#popupNotification');

        var popupName = 'Notification',
            popupSettings = {
                title: title || 'Notification',
                element: '#popup' + popupName,
                className: 'popup' + popupName,
                width: 430,
                height: 269,
                minHeight: 150,
                draggable: false,
                resizable: false,
                animation: false,
                actions: [],
                buttons: [
                    {
                        text: Localization.Ok,
                        isPrimary: true,
                        click: 'close',
                        position: 'right'
                    }
                ],
                close: function (e) {
                    self.OnAlertPopupClose(e);
                },
                open: function (e) {
                    e.sender.wrapper.css('opacity', 1);
                    e.sender.toFront();
                }
            },
            win = popup.Show(popupSettings);

        if (win) {
            var messageElement = win.wrapper.find('.notificationMessages');
            messageElement.html(message || '');
            self.SetRemberSessionHtml(messageElement, settings.session_name);
            win.setOptions(settings);
            if (settings.buttons) {
                popup.SetButtons(win, settings.buttons);
            }
            else {
                popup.SetButtons(win, popupSettings.buttons);
            }
            win.wrapper.find('.notificationIcon').attr('class', 'notificationIcon ' + settings.icon);
        }
        return win;
    };
    self.OnAlertPopupClose = function (e) {
        if (errorHandlerModel) {
            errorHandlerModel.OnClickOkErrorCallback = jQuery.noop;
            errorHandlerModel.OnClickRetryErrorCallback = jQuery.noop;
            errorHandlerModel.Source(null);
        }

        self.OnCloseCallback.call();

        e.sender.wrapper.find('.notificationIcon').attr('class', 'notificationIcon alert');
        e.sender.wrapper.find('.notificationMessages').empty();
        self.OnCloseCallback = jQuery.noop;
    };
    self.SetRemberSessionHtml = function (container, sessionName) {
        if (sessionName) {
            container.append([
                '<div class="warningSession">',
                    '<label>',
                        '<input type="checkbox" />',
                        '<span class="label">' + Localization.PopupWarningRemberSession + '</span>',
                    '</label>',
                '</div>'
            ].join(''));

            container.find(':checkbox').on('click', function () {
                jQuery.localStorage(sessionName, this.checked);
            });
        }
    };
    self.Info = function (message, options) {
        var settings = jQuery.extend({
            icon: 'info'
        }, options);
        var win = self.Alert(Localization.Info_Title, message, settings);

        if (win) {
            win.wrapper.find('.notificationIcon').attr('class', 'notificationIcon ' + settings.icon);
        }

        return win;
    };
    self.Error = function (title, message, options) {
        var settings = jQuery.extend({
            icon: 'error',
            buttons: [
                {
                    text: Localization.Ok,
                    isPrimary: true,
                    click: 'close',
                    position: 'right'
                },
                {
                    text: Localization.Retry,
                    click: function (e) {
                        if (errorHandlerModel.OnClickRetryErrorCallback.toString() === jQuery.noop.toString()) {
                            if (typeof searchPageHandler !== 'undefined') {
                                searchPageHandler.InitialSearchPage(searchRetainUrlModel.ExternalChange);
                            }
                            else if (typeof anglePageHandler !== 'undefined') {
                                anglePageHandler.InitialAnglePage(anglePageHandler.ExecuteAngle);
                            }
                            else if (typeof dashboardHandler !== 'undefined') {
                                dashboardHandler.Initial(dashboardHandler.Execute);
                            }
                        }
                        else {
                            errorHandlerModel.OnClickRetryErrorCallback();
                        }

                        e.kendoWindow.close();
                    },
                    position: 'right',
                    className: 'btnRetry'
                }
            ]
        }, options);

        var win = self.Alert(title, message, settings);
        if (win) {
            win.wrapper.find('.notificationIcon').attr('class', 'notificationIcon ' + settings.icon);
        }

        return win;
    };
    self.Confirm = function (message, ok, cancel, options) {
        var settings = jQuery.extend({
            icon: 'confirm',
            buttons: [
                {
                    text: Captions.Button_Cancel,
                    click: function (e) {
                        if (typeof cancel === 'function')
                            cancel.call(this);
                        e.kendoWindow.close();
                    },
                    position: 'right'
                },
                {
                    text: Localization.Ok,
                    isPrimary: true,
                    click: function (e) {
                        if (typeof ok === 'function') ok.call(this);
                        e.kendoWindow.close();
                    },
                    position: 'right'
                }
            ]
        }, options);

        var win = self.Alert(Localization.Confirm_Title, message, settings);

        if (win) {
            win.wrapper.find('.notificationIcon').attr('class', 'notificationIcon ' + settings.icon);
        }

        return win;
    };

    // contructor
    self.Initial();
}
