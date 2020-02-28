/*
* Author: Gaj
*
* CustomDateTimePicker extend from DateTimePicker
* separate date and time picker
*/

(function ($) {

    // shorten references to variables. this is better for uglification var kendo = window.kendo,
    var ui = kendo.ui;
    var Widget = ui.DateTimePicker;
    var extend = $.extend;

    // private function
    var getDateTimeWrapper = function (that) {
        that.wrapper.hide();
        return jQuery('<div class="custom-datetimepicker" />');
    };
    var createDatePicker = function (that) {
        that._wrapper.append('<input class="eaDatepicker fake-datepicker" />');
        var dateElement = that._wrapper.children('input.fake-datepicker');
        var dateOptions = extend({}, that.options);
        var defaultDateOptions = ui.DatePicker.prototype.options;

        dateOptions.ARIATemplate = defaultDateOptions.ARIATemplate;
        dateOptions.name = defaultDateOptions.name;
        if (dateOptions.dateFormat) {
            dateOptions.format = dateOptions.dateFormat;
        }
        dateOptions.change = function (e) {
            // update value to base ui
            var thisDate = e.sender.value();
            var baseDate = that.value() || that.timepicker.value();
            if (thisDate && baseDate) {
                baseDate.setFullYear(thisDate.getFullYear());
                baseDate.setMonth(thisDate.getMonth());
                baseDate.setDate(thisDate.getDate());
                if (!that.value()) {
                    that.value(baseDate);
                }
            }

            that.trigger('change');
        };
        dateOptions.open = function (e) {
            that.trigger('open');
        };
        dateOptions.close = function (e) {
            that.trigger('close');
        };
        that.datepicker = dateElement.kendoDatePicker(dateOptions).data('kendoDatePicker');
    };
    var createTimePicker = function (that) {
        that._wrapper.append('<input class="eaTimepicker fake-timepicker" />');
        var timeElement = that._wrapper.children('input.fake-timepicker');
        var timeOptions = extend({}, that.options);
        var defaultTimeOptions = ui.TimePicker.prototype.options;
        timeOptions.ARIATemplate = defaultTimeOptions.ARIATemplate;
        timeOptions.name = defaultTimeOptions.name;
        if (timeOptions.timeFormat) {
            timeOptions.format = timeOptions.timeFormat;
        }
        timeOptions.change = function (e) {
            // update value to base ui
            var thisDate = e.sender.value();
            var baseDate = that.value() || that.datepicker.value();
            if (thisDate && baseDate) {
                baseDate.setHours(thisDate.getHours());
                baseDate.setMinutes(thisDate.getMinutes());
                baseDate.setSeconds(thisDate.getSeconds());
                if (!that.value()) {
                    that.value(baseDate);
                }
            }

            that.trigger('change');
        };
        timeOptions.open = function (e) {
            that.trigger('open');
        };
        timeOptions.close = function (e) {
            that.trigger('close');
        };
        that.timepicker = timeElement.kendoTimePicker(timeOptions).data('kendoTimePicker');
        if (timeOptions.format.indexOf('(tt)')) {
            that._wrapper.addClass('time-suffix');
        }
    };
    var getValue = function (that) {
        if (that.datepicker.value() && that.timepicker.value()) {
            return Widget.fn.value.call(that);
        }
        else {
            return null;
        }
    };
    var setValue = function (that, value) {
        Widget.fn.value.call(that, value);

        // set value to fake ui
        var newValue = Widget.fn.value.call(that);
        that.datepicker.value(newValue);
        that.timepicker.value(newValue);
    };

    var CustomDateTimePicker = Widget.extend({

        init: function (element, options) {
            // base call to widget initialization
            var that = this;
            Widget.fn.init.call(that, element, options);

            // prepare wrapper
            var wrapper = getDateTimeWrapper(that);
            that.wrapper.after(wrapper);
            that._wrapper = wrapper;

            // create datepicker;
            createDatePicker(that);

            // create timepicker
            createTimePicker(that);

            // set state
            that.enable(!that.element.is(':disabled'));
        },

        options: {
            // the name is what it will appear as off the kendo namespace(i.e. kendo.ui.MyWidget).
            // The jQuery plugin would be jQuery.fn.kendoMyWidget.
            name: 'CustomDateTimePicker'
        },

        enable: function (flag) {
            var that = this;
            if (that.datepicker && that.timepicker) {
                that.datepicker.enable(flag);
                that.timepicker.enable(flag);
            }
        },

        value: function (value) {
            var that = this;
            if (typeof value === 'undefined') {
                // getter
                return getValue(that);
            }
            else {
                // setter
                setValue(that, value);
            }
        }

    });

    ui.plugin(CustomDateTimePicker);

})(jQuery);
