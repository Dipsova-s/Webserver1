function FilterTimespanEditor(handler, queryStep, element) {
    var self = this;

    self.GetOperators = function () {
        return ko.toJS([].concat(
            enumHandlers.QUERYSTEPOPERATOR.DEFAULT,
            enumHandlers.QUERYSTEPOPERATOR.GROUPONE,
            enumHandlers.QUERYSTEPOPERATOR.GROUPTWO,
            enumHandlers.QUERYSTEPOPERATOR.GROUPTHREE));
    };
    self.GetCompareFieldTarget = function () {
        return enumHandlers.FIELDTYPE.TIMESPAN;
    };

    // single argument
    self.InitialSingleArgumentUI = function (container) {
        // call base to perform argument type field
        self.parent.prototype.InitialSingleArgumentUI.call(self, container);
        var argument = self.Data.arguments()[0];
        var input = container.find('.input-argument-value');
        var ui = self.BindingTimeSpanTextbox(input);

        // set value to ui
        if (self.IsArgumentTypeValue(argument)) {
            ui.value(argument.value);
        }

        // events
        ui.bind('change', jQuery.proxy(self.SetSingleArgumentValue, self, input));
    };
    self.InitialDoubleArgumentUI = function (container) {
        // call base
        self.parent.prototype.InitialDoubleArgumentUI.call(self, container);
        container.find('.form-row').addClass('flex-wrap');

        var args = self.Data.arguments();
        var inputFrom = container.find('.input-argument-from');
        var inputTo = container.find('.input-argument-to');

        var uiFrom = self.BindingTimeSpanTextbox(inputFrom);
        var uiTo = self.BindingTimeSpanTextbox(inputTo);

        // set value to ui
        if (args[0])
            uiFrom.value(args[0].value);
        if (args[1])
            uiTo.value(args[1].value);

        // events
        uiFrom.bind('change', jQuery.proxy(self.SetDoubleArgumentValues, self, inputFrom, inputTo));
        uiTo.bind('change', jQuery.proxy(self.SetDoubleArgumentValues, self, inputFrom, inputTo));
    };
    self.InitialMultipleArgumentUI = function (container) {
        // call base
        self.parent.prototype.InitialMultipleArgumentUI.call(self, container);

        var input = container.find('.input-argument-typing');
        var ui = self.BindingTimeSpanTextbox(input);
        ui.dayPicker.element.off('keydown').on('keydown', jQuery.proxy(self.InputTypingKeyDown, self, input));
        ui.dayPicker.element.off('paste').on('paste', jQuery.proxy(self.parent.prototype.PasteListText, self));
        input.find('.action-add').off('click').on('click', jQuery.proxy(self.AddMultipleArgumentValue, self, input));
    };
    self.InputTypingKeyDown = function (inputTyping, e) {
        var self = this;
        if (e.which === 13) {
            var ui = jQuery(inputTyping).data('handler');
            ui.dayPicker.element.get(0).blur();
            self.AddMultipleArgumentValue(inputTyping);
            ui.value(null);
        }
    };
    self.AddMultipleArgumentValue = function (inputTyping) {
        // click action-add or enter key
        var self = this;
        var value = self.GetInputTypingValue(inputTyping);
        self.AddMultipleArgumentValues([value]);
        $(inputTyping).data('handler').value(null);
    };
    self.GetInputArgumentValue = function (input) {
        var handler = input.data('handler');
        return handler ? handler.value() : null;
    };
    self.IsValidArgumentValue = function (value) {
        return jQuery.isNumeric(value);
    };
    self.GetListGridOptions = function (data) {
        var options = self.parent.prototype.GetListGridOptions.call(self, data);
        var format = self.GetTimeSpanFormat();
        options.columns[0].template = function (e) {
            return kendo.toString(e.value, format);
        };
        return options;
    };
    self.TransformPastingList = function (list) {
        return jQuery.map(list, function (data) {
            return parseFloat(data);
        });
    };
    //Binding function
    self.BindingTimeSpanTextbox = function (input) {
        var dayFormat = '0 ' + Localization.Days;
        var timeFormat = self.GetTimeSpanPickerFormat();
        var timespanPicker = input.kendoTimeSpanPicker({
            dayPickerOptions: {
                format: dayFormat,
                spin: function (e) {
                    e.sender.value(e.sender.value());
                },
                comboBoxOptions: {
                    dataTextField: 'text',
                    dataValueField: 'value',
                    dataSource: self.GetInputTimeSpanDatasource(dayFormat)
                }
            },
            timePickerOptions: {
                format: timeFormat,
                parseFormats: [timeFormat]
            }
        }).data(enumHandlers.KENDOUITYPE.TIMESPANPICKER);

        return timespanPicker;
    };
    //helping functions
    self.GetTimeSpanFormat = function () {
        var timeSettings = WC.FormatHelper.GetUserDefaultFormatSettings(enumHandlers.FIELDTYPE.TIMESPAN);
        timeSettings.second = 'ss';
        return WC.FormatHelper.GetFormatter(timeSettings);
    };
    self.GetTimeSpanPickerFormat = function () {
        var timeSettings = WC.FormatHelper.GetUserDefaultFormatSettings(enumHandlers.FIELDTYPE.TIME);
        timeSettings.hour = 'HHmm';
        timeSettings.second = 'ss';
        return WC.FormatHelper.GetFormatter(timeSettings);
    };
    self.GetInputTimeSpanDatasource = function (format) {
        var i, data = [];
        for (i = 0; i <= 5; i++) {
            data.push({ value: i, text: kendo.toString(i, format) });
        }
        for (i = 10; i <= 50; i += 5) {
            data.push({ value: i, text: kendo.toString(i, format) });
        }
        for (i = 60; i <= 100; i += 10) {
            data.push({ value: i, text: kendo.toString(i, format) });
        }
        data.sortObject('value', enumHandlers.SORTDIRECTION.DESC);
        return data;
    };

    // constructor
    self.Initial(handler, queryStep, element);
}
FilterTimespanEditor.extend(BaseFilterEditor);