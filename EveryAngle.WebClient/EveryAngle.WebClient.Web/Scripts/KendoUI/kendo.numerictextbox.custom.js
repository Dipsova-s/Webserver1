/*
* Author: Gaj
*
* CustomNumericTextBox extend from NumericTextBox and combine kendo combobox
*/

(function ($) {

    // shorten references to variables. this is better for uglification var kendo = window.kendo,
    var ui = kendo.ui;
    var Widget = ui.NumericTextBox;

    var getWrapper = function (element) {
        return jQuery(element).wrap('<div class="k-numerictextbox-custom" />').parent();
    };

    var createComboBox = function (that, wrapper) {
        var element = jQuery('<input />');
        wrapper.append(element);
        that.combobox = element.kendoComboBox(that.options.comboBoxOptions).data('kendoComboBox');
        that.combobox.numerictextbox = that;
        that.combobox.popup.__close = that.combobox.popup.close;
        that.combobox.popup.close = function (force) {
            if (force === true)
                that.combobox.popup.__close();
        };
        that.combobox.close = function () {
            that.combobox.popup.close(true);
        };
    };

    var CustomNumericTextBox = Widget.extend({

        init: function (element, options) {
            var that = this;

            // move element to new place
            var wrapper = getWrapper(element);

            // base call to widget initialization
            Widget.fn.init.call(that, element, options);

            // create combobox
            createComboBox(that, wrapper);

            // set value
            if (typeof that.options.value === 'number')
                that.value(that.options.value);
            else if (!that.options.can_empty)
                that.value(0);

            // change event
            that.bind('change', function (e) {
                e.sender.combobox.close();
            });

            // input event
            that.element.on('click', jQuery.proxy(that.combobox.open, that.combobox));
            that.element.on('keyup', jQuery.proxy(that._keyup, that));

            // css
            that._downArrow.css('touch-action', 'pan-x');
            that._downArrow.children().attr('class', 'k-icon k-i-arrow-w icon icon-caret-left');
            that._upArrow.css('touch-action', 'pan-x');
            that._upArrow.children().attr('class', 'k-icon k-i-arrow-e icon icon-caret-right');
        },

        options: {
            // the name is what it will appear as off the kendo namespace(i.e. kendo.ui.MyWidget).
            // The jQuery plugin would be jQuery.fn.kendoMyWidget.
            name: 'CustomNumericTextBox',

            // other options go here
            can_empty: true,
            comboBoxOptions: {
                animation: false,
                filter: 'startswith',
                noDataTemplate: null,
                clearButton: false,
                change: function (e) {
                    e.sender.numerictextbox.value(e.sender.value());
                    e.sender.numerictextbox.trigger('change');
                },
                filtering: function (e) {
                    var filter = e.filter;
                    if (filter.value && /^\d/g.test(filter.value)) {
                        filter.value = '+' + filter.value;
                    }
                }
            },
            messages: {
                text_last: 'last',
                text_this: 'this',
                text_next: 'next'
            }
        },

        _placeholder: function (value) {
            var that = this;
            if (value === '-1' && that.options.messages.text_last)
                value = that.options.messages.text_last;
            else if (value === '0' && that.options.messages.text_this)
                value = that.options.messages.text_this;
            else if (value === '1' && that.options.messages.text_next)
                value = that.options.messages.text_next;
            else if (value && value.charAt(0) !== '0' && value.charAt(0) !== '-')
                value = '+' + value;
            Widget.fn._placeholder.call(that, value);
        },

        _focusin: function () {
            var that = this;
            that.combobox.open();
            Widget.fn._focusin.call(that);
        },

        _focusout: function () {
            var that = this;
            that.combobox.close();
            Widget.fn._focusout.call(that);
        },

        _keydown: function (e) {
            var that = this;
            var key = e.keyCode;
            that._key = key;
            if (key == kendo.keys.DOWN) {
                that._step(-1);
            }
            else if (key == kendo.keys.UP) {
                that._step(1);
            }
            else if (key == kendo.keys.ENTER) {
                that._change(that.element.val());
                that._focusout();
            }
            else {
                that._typing = true;
            }
        },

        _keypress: function (e) {
            var that = this;
            var character = String.fromCharCode(e.which).toLowerCase();

            var textChars = [
                (that.options.messages.text_last || '').charAt(0).toLowerCase(),
                (that.options.messages.text_this || '').charAt(0).toLowerCase(),
                (that.options.messages.text_next || '').charAt(0).toLowerCase()
            ];
            var comboboxIndex = jQuery.inArray(character, textChars);
            if (comboboxIndex !== -1) {
                that.value(comboboxIndex - 1);
            }

            Widget.fn._keypress.call(that, e);
        },

        _keyup: function () {
            var that = this;
            var value = parseFloat(that.element.val());
            if (!isNaN(value))
                that.combobox.value(value);
        },

        _blur: function () {
            var that = this;
            
            if (!that.options.can_empty) {
                var value = that.element.val();
                if (!value)
                    that.element.val('0');
            }

            Widget.fn._blur.call(that);
        },

        value: function (value) {
            var that = this;
            if (typeof value == 'undefined') {
                // getter
                return Widget.fn.value.call(that);
            }
            else {
                // setter
                Widget.fn.value.call(that, value);
                if (that.combobox)
                    that.combobox.value(value);
            }
        },

        destroy: function () {
            var that = this;
            if (that.combobox)
                that.combobox.destroy();
            Widget.fn.destroy.call(that);
        }

    });

    ui.plugin(CustomNumericTextBox);

})(jQuery);
