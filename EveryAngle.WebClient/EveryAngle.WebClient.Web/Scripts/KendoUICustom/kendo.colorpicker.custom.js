/*
* Author: Gaj
*
* CustomColorPicker extend from ColorPicker
* combine palette and flat picker
*/

(function ($) {

    var kendo = window.kendo;
    var ui = kendo.ui;
    var Widget = ui.ColorPicker;

    // private function
    var createCustomUI = function (that) {
        createPreview(that);
    };
    var createPreview = function (that) {
        var popup = that._getPopup();
        if (!popup.element.find('tfoot').length) {
            var tfoot = $([
                '<tfoot>',
                    '<tr>',
                        '<td colspan="' + that.options.columns + '"></td>',
                '</td>',
                '</tfoot>'
            ].join(''));

            var size = typeof that.options.tileSize == 'object' ? that.options.tileSize : {
                width: that.options.tileSize,
                height: that.options.tileSize - 1
            };
            that._previewElement = tfoot.find('.k-item').css(size).on('click', false);
            popup.element.find('table').append(tfoot);
        }

        setPreviewColor(that);
    };
    var setPreviewColor = function (that) {
        if ($.inArray(that.value(), that.options.palette) === -1) {
            that._previewElement.addClass('k-state-selected');
            that._previewElement.css('background-color', that.value());
            that._previewElement.attr({ 'aria-label': that.value(), 'aria-selected': true });
        }
        else {
            that._previewElement.removeClass('k-state-selected');
            that._previewElement.css('background-color', 'transparent');
            that._previewElement.attr({ 'aria-label': 'no select', 'aria-selected': false });
        }
    };
    var isMoreColorShown = function (that) {
        return that._morePopup && that._morePopup.wrapper.is(':visible');
    };
    var restoreCustomPopupEvent = function (popup) {
        if (popup._close) {
            // restore close method
            popup.close = popup._close;
            delete popup._close;

            // restore _mousedown method
            popup._mousedown = popup.__mousedown;
            delete popup.__mousedown;
        }
    };
    var showMoreColor = function (that) {
        if (isMoreColorShown(that)) {
            return false;
        }

        createMorePopup(that);
        createMorePicker(that);

        setMorePopupPosition(that);
        that._morePopup.open();
        that._morePicker.value(that.value());

        // custom event
        var popup = that._getPopup();
        if (!popup._close) {

            // custom close event
            popup._close = popup.close;
            popup.close = function (skipEffects, force) {
                if (force === true || isMoreColorShown(that)) {
                    this._close(skipEffects);
                    that._morePopup.close();
                }
            };

            // custom _mousedown event
            popup.__mousedown = popup._mousedown;
            popup._mousedown = function (e) {
                var target = $(e.target);
                if (isMoreColorShown(that)
                    && !target.parents('.k-window-custom-colorpicker').length
                    && !target.hasClass('k-slider-tooltip')
                    && !target.parents('.k-slider-tooltip').length) {
                    this.__mousedown(e);
                }
            };
        }
    };
    var createMorePopup = function (that) {
        if (!that._morePopup) {
            that._morePopup = $('<div><div></div></div>').appendTo('body')
                .kendoWindow({
                    animation: false,
                    draggable: true,
                    resizable: false,
                    title: that.options.messages.more_title,
                    close: function () {
                        var popup = that._getPopup();
                        popup._close();
                        restoreCustomPopupEvent(popup);

                        $(window).off('resize.custompicker');
                    }
                }).data('kendoWindow');

            that._morePopup.wrapper.addClass('k-window-draggable k-window-custom-colorpicker');
        }

        $(window)
            .off('resize.custompicker')
            .on('resize.custompicker', function () {
                setMorePopupPosition(that);
            });
    };
    var setMorePopupPosition = function (that) {
        that._morePopup.setOptions({ position: getMorePopupPosition(that) });
    };
    var getMorePopupPosition = function (that) {
        var popup = that._getPopup();
        var position = popup.wrapper.offset();
        var winHeight = $(window).height();
        position.left += popup.wrapper.outerWidth();
        position.top -= 100;
        if (position.top + 385 > winHeight) {
            position.top = winHeight - 385;
        }
        if (position.top < 0) {
            position.top = 0;
        }
        return position;
    };
    var createMorePicker = function (that) {
        if (!that._morePicker) {
            var picker = that._morePicker = that._morePopup.element.children()
                .kendoFlatColorPicker({
                    buttons: true,
                    preview: that.options.preview,
                    messages: that.options.messages
                })
                .data('kendoFlatColorPicker');

            picker.wrapper.find('.apply')
                .off('click')
                .on('click', function () {
                    that.value(picker.value());
                    that.trigger('change');
                    setPreviewColor(that);
                    that._getPopup().close(undefined, true);
                });

            picker.wrapper.find('.cancel')
                .off('click')
                .on('click', function () {
                    that._morePopup.close();
                });
        }
    };

    var CustomColorPicker = Widget.extend({

        init: function (element, options) {
            // base call to widget initialization
            var that = this;
            Widget.fn.init.call(that, element, options);
        },

        open: function () {
            var that = this;
            createCustomUI(that);
            Widget.fn.open.call(that);
        },

        close: function () {
            var that = this;
            Widget.fn.close.call(that);
        },

        toggle: function () {
            var that = this;
            
            if (!that._getPopup().visible()) {
                that.open();
            }
            else {
                that.close();
            }
        },

        _select: function (color, nohooks) {
            var that = this;
            Widget.fn._select.call(that, color, nohooks);

            setPreviewColor(that);
        },

        options: {
            name: 'CustomColorPicker',
            animation: false,
            palette: [
                '#ed0000', '#eda100', '#4dc632',
                '#a349a4', '#fff200', '#b5e61d',
                '#3f48cc', '#00a2e8', '#99d9ea'
            ],
            preview: true,
            columns: 3,
            tileSize: 27,
            input: false,
            view: "palette",
            views: ["gradient","palette"]
        }

    });

    ui.plugin(CustomColorPicker);

})(jQuery);
