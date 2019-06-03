/*
* Author: Gaj
*
* PercentageTextBox extend from NumericTextBox
* value = decimal value
* valueText = value * 100
* - convert value when call ui.value(value)
* - return (valueText / 100) when call ui.value()
*/

(function ($) {

    // shorten references to variables. this is better for uglification var kendo = window.kendo,
    var ui = kendo.ui;
    var Widget = ui.NumericTextBox;
    var SPIN = "spin";
    var activeElement = kendo._activeElement;

    var PercentageTextBox = Widget.extend({

        init: function (element, options) {
            // base call to widget initialization
            Widget.fn.init.call(this, element, options);
        },

        options: {
            // the name is what it will appear as off the kendo namespace(i.e. kendo.ui.MyWidget).
            // The jQuery plugin would be jQuery.fn.kendoMyWidget.
            name: 'PercentageTextBox'
            // other options go here
        },

        _step: function (step) {
            var that = this,
                element = that.element,
                value = that._parse(element.val()) || 0;

            if (activeElement() !== element[0]) {
                that._focusin();
            }

            var stepDecimals = that.options.step.getSafeDecimals();
            var valueDecimals = value.getSafeDecimals();
            value += that.options.step * step;
            value = value.safeParse(Math.max(stepDecimals, valueDecimals));

            that._update(that._adjust(value));

            that.trigger(SPIN);
        },

        value: function (value) {
            var that = this;
            var decimals;
            var result;
            if (typeof value === 'undefined') {
                // getter
                var currentValue = Widget.fn.value.call(that);
                if (currentValue === null || typeof currentValue === 'undefined')
                    return null;
                decimals = currentValue.getSafeDecimals(2);
                result = currentValue / 100;
                return result.safeParse(decimals);
            }
            else {
                // setter
                value = parseFloat(value);

                if (isNaN(value)) {
                    Widget.fn.value.call(that, null);
                }
                else {
                    decimals = value.getSafeDecimals(-2);
                    result = value * 100;
                    Widget.fn.value.call(that, result.safeParse(decimals));
                }
            }
        }

    });

    ui.plugin(PercentageTextBox);

})(jQuery);
