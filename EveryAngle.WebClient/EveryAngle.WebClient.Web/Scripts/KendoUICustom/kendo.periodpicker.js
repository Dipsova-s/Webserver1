/*
* Author: Gaj
*
* PeriodPicker extend from NumericTextBox and DropdownList
*/

(function ($) {

    // shorten references to variables. this is better for uglification var kendo = window.kendo,
    var ui = kendo.ui;
    var Widget = ui.Widget;

    var getWrapper = function (element) {
        return jQuery(element).wrap('<div class="k-periodpicker" />').parent();
    };

    var setClassControl = function (element) {
        element.addClass('k-periodpicker-control');
    };

    var createPicker = function (name, that, wrapper, options) {
        var element = jQuery('<input />');
        wrapper.append(element);
        var control = element[name](options).data(name);
        return control;
    };

    var createNumericTextbox = function (that, wrapper) {
        that.numericTextbox = createPicker('kendoCustomNumericTextBox', that, wrapper, that.options.numericTextboxOptions);
        that.numericTextbox._placeholder = function (value) {
            kendo.ui.NumericTextBox.fn._placeholder.call(this, value);
        };
        that.numericTextbox.owner = that;
        that.numericTextbox.bind('spin', that._uiChange);
        that.numericTextbox.bind('change', that._uiChange);
        setClassControl(that.numericTextbox.wrapper.parent());
    };

    var createDropdownList = function (that, wrapper) {
        that.dropdownList = createPicker('kendoDropDownList', that, wrapper, that.options.dropdownListOptions);
        that.dropdownList.owner = that;
        that.dropdownList.bind('change', that._uiChange);
        setClassControl(that.dropdownList.wrapper);
    };

    var isValidValue = function (that, value) {
        return jQuery.isNumeric(value) || value === null && that.numericTextbox.options.canEmpty;
    };

    var PeriodPicker = Widget.extend({

        numericTextbox: null,
        dropdownList: null,

        init: function (element, options) {
            var that = this;

            // base call to widget initialization
            Widget.fn.init.call(that, element, options);
            that.bind('change', that.options.change);

            // move element to new place
            var wrapper = getWrapper(element);
            wrapper.children().addClass('hidden');

            // pickers
            createNumericTextbox(that, wrapper);
            createDropdownList(that, wrapper);

            //if (options && options.change && typeof options.change === 'function') {
            //    that.options.change = options.change;
            //}
        },

        options: {
            name: 'PeriodPicker',
            change: jQuery.noop,

            numericTextboxOptions: {
                step: 1,
                decimals: 0,
                format: '0'
            },

            dropdownListOptions: {
                dataTextField: 'Text',
                dataValueField: 'Value',
                dataDayField: 'Days',
                index: 0,
                defaultValue: ''
            }
        },

        _uiChange: function () {
            var ui = this;
            if (ui.options.name === ui.owner.numericTextbox.options.name) {
                if (ui.value() !== null && ui.owner.dropdownList.value() === null)
                    ui.owner.dropdownList.value(ui.owner.options.dropdownListOptions.defaultValue);
            }
            else if (ui.options.name === ui.owner.dropdownList.options.name) {
                if (ui.value() !== null && ui.owner.numericTextbox.value() === null)
                    ui.owner.numericTextbox.value(0);
            }
            ui.owner.trigger('change');

            var value = ui.owner.value();
            ui.owner.element.val(value);
        },
        
        enable: function (enable) {
            var that = this;
            if (that.numericTextbox && that.dropdownList) {
                that.numericTextbox.enable(enable);
                that.dropdownList.enable(enable);
            }
        },

        value: function (value) {
            var that = this;
            if (typeof value === 'undefined') {
                // getter
                var numberValue = that.numericTextbox.value();
                var typeDataItem = that.dropdownList.dataItem();
                var totalDays = typeDataItem ? typeDataItem[that.options.dropdownListOptions.dataDayField] : null;
                return numberValue !== null && totalDays !== null ? totalDays * numberValue : null;
            }
            else {
                // setter
                if (isValidValue(that, value))
                    that.numericTextbox.value(value);
                that.dropdownList.value(that.options.dropdownListOptions.defaultValue);
            }
        },

        period: function (object) {
            var that = this;
            if (typeof object === 'undefined') {
                // getter
                return {
                    value: that.numericTextbox.value(),
                    type: that.dropdownList.value()
                };
            }
            else if (jQuery.isPlainObject(object)) {
                // setter
                if (isValidValue(that, object.value))
                    that.numericTextbox.value(object.value);

                if (object.type !== null) {
                    that.dropdownList.value(object.type);
                }
            }
        },

        destroy: function () {
            var that = this;
            if (that.numericTextbox)
                that.numericTextbox.destroy();
            if (that.dropdownList)
                that.dropdownList.destroy();
            Widget.fn.destroy.call(that);
        }

    });

    ui.plugin(PeriodPicker);

})(jQuery);
