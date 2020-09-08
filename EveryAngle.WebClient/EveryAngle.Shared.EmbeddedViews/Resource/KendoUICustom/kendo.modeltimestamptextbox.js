/*
* Author: Gaj
*
* ModelTimestampTextBox extend from NumericTextBox
* value = index value
* valueText = value + 1
* - convert value when call ui.value(value)
* - return (valueText - 1) when call ui.value()
*/

(function ($) {

    // shorten references to variables. this is better for uglification var kendo = window.kendo,
    var ui = kendo.ui;
    var Widget = ui.NumericTextBox;
 
    var ModelTimestampTextBox = Widget.extend({

        init: function (element, options) {
            // base call to widget initialization
            Widget.fn.init.call(this, element, options);
        },

        options: {
            // the name is what it will appear as off the kendo namespace(i.e. kendo.ui.MyWidget).
            // The jQuery plugin would be jQuery.fn.kendoMyWidget.
            name: 'ModelTimestampTextBox',

            // other options go here
            min: 0,
            max: 2147483646,
            step: 1,
            format: 'n0',
            decimals: 0,
            placeholder: 'Select column',
            messages: {
                none: 'None'
            }
        },

        _placeholder: function (value) {
            var that = this;
            if (value === '0')
                value = that.options.messages.none;
            Widget.fn._placeholder.call(that, value);
        },
        _focusin: function () {
            var that = this;
            if (that._value === 0) {
                that.element.val(that.options.messages.none);
            }
            Widget.fn._focusin.call(that);
            kendo.caret(that.element[0], that.element.val().length);
        },
        _blur: function () {
            var that = this;
            if (that.element.val() === that.options.messages.none)
                that.element.val(-1);
            Widget.fn._blur.call(that);
        },

        value: function (value) {
            var that = this;
            if (typeof value === 'undefined') {
                // getter
                return typeof that._value === 'number' ? that._value - 1 : that._value;
            }
            else {
                // setter
                that.options.min = -1;
                Widget.fn.value.call(that, value);
                if (typeof that._value === 'number')
                    Widget.fn.value.call(that, that._value + 1);
                that.options.min = 0;
            }
        },
        destroy: function () {
            var that = this;
            Widget.fn.destroy.call(that);
            that.wrapper.replaceWith(that.element.clone().show());
        }

    });

    ui.plugin(ModelTimestampTextBox);

})(jQuery);
