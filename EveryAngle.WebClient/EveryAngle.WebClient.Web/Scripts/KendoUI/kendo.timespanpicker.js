/*
* Author: Gaj
*
* TimeSpanPicker extend from NumericTextBox
*/

(function ($) {

    // shorten references to variables. this is better for uglification var kendo = window.kendo,
    var ui = kendo.ui;
    var Widget = ui.NumericTextBox;

    var getWrapper = function (element) {
        return jQuery(element).wrap('<div class="k-timespanpicker" />').parent();
    };

    var createPicker = function (name, that, wrapper, options) {
        var element = jQuery('<input />');
        wrapper.append(element);
        return element[name](options).data(name);
    };

    var createDayPicker = function (that, wrapper) {
        that.dayPicker = createPicker('kendoCustomNumericTextBox', that, wrapper, that.options.dayPickerOptions);
        that.dayPicker._negative = false;
        that.dayPicker._placeholder = function (value) {
            kendo.ui.NumericTextBox.fn._placeholder.call(this, value);
        };
        that.dayPicker.element.on('keypress', function (e) {
            var character = String.fromCharCode(e.which).toLowerCase();
            if (character === '-')
                that._setNegative(true);
            else if (character === '+')
                that._setNegative(false);
            that.dayPicker._keypress(e);
        });
        that.dayPicker.owner = that;
        that.dayPicker.bind('spin', that._uiChange);
        that.dayPicker.bind('change', that._uiChange);

        // create -/+ ui
        var signElement = $('<span class="k-select k-link k-numeric-sign"><span class="k-icon"></span></span>');
        signElement.on('click', function () {
            if (!signElement.parent().hasClass('k-state-disabled'))
                that._setNegative(signElement.children().hasClass('k-si-plus'));
        });
        that.dayPicker.wrapper.children('.k-numeric-wrap').prepend(signElement);
    };

    var createTimePicker = function (that, wrapper) {
        that.timePicker = createPicker('kendoTimePicker', that, wrapper, that.options.timePickerOptions);
        that.timePicker.owner = that;
        that.timePicker.bind('change', that._uiChange);
    };

    var TimeSpanPicker = Widget.extend({

        dayPicker: null,
        timePicker: null,

        init: function (element, options) {
            var that = this;

            // move element to new place
            var wrapper = getWrapper(element);
            var value = null;
            if (options && !isNaN(parseFloat(options.value))) {
                value = options.value;
                delete options.value;
            }

            // base call to widget initialization
            Widget.fn.init.call(that, element, options);

            // pickers
            createDayPicker(that, wrapper);
            createTimePicker(that, wrapper);
            that.wrapper.hide();
            that._setNegative(false);

            // set value
            if (value != null) {
                that.value(value);
            }

            // set state
            that.enable(!that.element.is(':disabled'));
        },

        options: {
            name: 'TimeSpanPicker',
            decimals: 20,

            // other options go here
            dayPickerOptions: {
                format: '0 days',
                decimals: 0,
                step: 1,
                min: 0,
                messages: {
                    text_last: null,
                    text_this: null,
                    text_next: null
                }
            },
            timePickerOptions: {
                format: 'HH:mm:ss',
                parseFormats: ['HH:mm:ss']
            }
        },

        _uiChange: function () {
            var ui = this;
            if (ui.options.name === ui.owner.timePicker.options.name) {
                if (ui.value() != null && ui.owner.dayPicker.value() === null)
                    ui.owner.dayPicker.value(0);
            }
            else if (ui.options.name === ui.owner.dayPicker.options.name && ui.value() !== null && ui.owner.timePicker.value() === null)
                ui.owner.timePicker.value(ui.owner._getTime(0, 0, 0));
            
            ui.owner.trigger('change');
        },

        _extractValues: function (value) {
            return kendo.date.getTimeSpan(value);
        },

        _getValue: function () {
            var that = this;
            var time = that.timePicker.value();
            var newTime = time ? that._getTime(time.getHours(), time.getMinutes(), time.getSeconds()) : null;
            return kendo.date.toTimeSpan(that.dayPicker.value(), newTime, that.dayPicker._negative);
        },

        _getTime: function (hours, minutes, seconds) {
            return new Date(1970, 0, 1, hours, minutes, seconds);
        },

        _setNegative: function (isNegative) {
            var that = this;
            var iconElement = that.dayPicker.wrapper.find('.k-numeric-sign .k-icon');
            if (isNegative) {
                that.dayPicker._negative = true;
                iconElement.removeClass('k-si-plus').addClass('k-si-minus').text('-');
            }
            else {
                that.dayPicker._negative = false;
                iconElement.removeClass('k-si-minus').addClass('k-si-plus').text('+');
            }
            that._updateDataSourceLabel(that.dayPicker._negative);
            that.dayPicker.trigger('change');
        },

        _updateDataSourceLabel: function (isNegative) {
            var that = this;
            var dataSource = that.dayPicker.combobox.dataSource;
            var format = that.dayPicker.options.format;
            var valueField = that.dayPicker.combobox.options.dataValueField;
            var labelField = that.dayPicker.combobox.options.dataTextField;
            var sign = isNegative ? '-' : '+';
            $.each(dataSource.data(), function (index, data) {
                data[labelField] = sign + kendo.toString(data[valueField], format);
            });
            dataSource.sort({ field: valueField, dir: 'desc' });
        },

        enable: function (flag) {
            var that = this;
            if (that.dayPicker && that.timePicker) {
                that.dayPicker.enable(flag);
                that.timePicker.enable(flag);
            }
        },

        value: function (value) {
            var that = this;
            if (typeof value == 'undefined') {
                // getter
                return that._getValue();
            }
            else {
                // setter
                var extracted = that._extractValues(value);
                if (extracted) {
                    that._setNegative(extracted.negative);
                    that.dayPicker.value(extracted.days);
                    that.timePicker.value(extracted.time);
                }
            }
        },

        destroy: function () {
            var that = this;
            if (that.dayPicker)
                that.dayPicker.destroy();
            if (that.timePicker)
                that.timePicker.destroy();
            Widget.fn.destroy.call(that);
        }

    });

    ui.plugin(TimeSpanPicker);

})(jQuery);
