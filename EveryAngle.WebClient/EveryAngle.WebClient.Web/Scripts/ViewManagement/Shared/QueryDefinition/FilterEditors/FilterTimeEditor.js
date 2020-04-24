function FilterTimeEditor(handler, queryStep, element) {
    var self = this;

    self.GetOperators = function () {
        return ko.toJS([].concat(
            enumHandlers.QUERYSTEPOPERATOR.DEFAULT,
            enumHandlers.QUERYSTEPOPERATOR.GROUPONE,
            enumHandlers.QUERYSTEPOPERATOR.TIMEONE,
            enumHandlers.QUERYSTEPOPERATOR.GROUPTHREE));
    };
    self.GetCompareFieldTarget = function () {
        return enumHandlers.FIELDTYPE.TIME;
    };
    // single argument
    self.InitialSingleArgumentUI = function (container) {
        // call base to perform argument type field
        self.parent.prototype.InitialSingleArgumentUI.call(self, container);

        var input = container.find('.input-argument-value');
        self.BindingTimeTextbox(input, jQuery.proxy(self.SetSingleArgumentValue, self, input));

        // set value to ui
        var argument = self.Data.arguments()[0];
        if (self.IsArgumentTypeValue(argument)) {
            input.data(enumHandlers.KENDOUITYPE.TIMEPICKER).value(WC.WidgetFilterHelper.ConvertUnixTimeToPicker(argument.value));
        }
    };
    self.InitialDoubleArgumentUI = function (container) {
        // call base
        self.parent.prototype.InitialDoubleArgumentUI.call(self, container);

        var inputFrom = container.find('.input-argument-from');
        var inputTo = container.find('.input-argument-to');
        self.BindingTimeTextbox(inputFrom, jQuery.proxy(self.SetDoubleArgumentValues, self, inputFrom, inputTo));
        self.BindingTimeTextbox(inputTo, jQuery.proxy(self.SetDoubleArgumentValues, self, inputFrom, inputTo));

        // set value to ui
        var args = self.Data.arguments();
        if (args[0])
            inputFrom.data(enumHandlers.KENDOUITYPE.TIMEPICKER).value(WC.WidgetFilterHelper.ConvertUnixTimeToPicker(args[0].value));
        if (args[1])
            inputTo.data(enumHandlers.KENDOUITYPE.TIMEPICKER).value(WC.WidgetFilterHelper.ConvertUnixTimeToPicker(args[1].value));
    };
    self.InitialMultipleArgumentUI = function (container) {
        // call base
        self.parent.prototype.InitialMultipleArgumentUI.call(self, container);

        var input = container.find('.input-argument-typing');
        self.BindingTimeTextbox(input, jQuery.noop);
        jQuery(input).on('blur keydown', function (e) {
            var isBlurInput = e.type === 'blur';
            var isEnterInput = e.type === 'keydown' && e.keyCode === 13;
            if (isBlurInput || isEnterInput) {
                self.FriendlyInputTimePicker(this);
            }
        });
    };
    self.GetInputArgumentValue = function (input) {
        var date = input.data('handler').value();
        return self.ConvertDatePickerToUnixTime(date);
    };
    self.IsValidArgumentValue = function (value) {
        return jQuery.isNumeric(value);
    };
    self.TransformPastingList = function (list) {
        return jQuery.map(list, function (data) {
            var time = self.ParseTime(data);
            var date = new Date(new Date(0).toDateString() + ' ' + time);
            return self.ConvertDatePickerToUnixTime(date);
        });
    };
    self.GetListGridOptions = function (data) {
        var options = self.parent.prototype.GetListGridOptions.call(self, data);
        var format = self.GetTimeFormat();
        options.columns[0].template = function (e) {
            return kendo.toString(WC.WidgetFilterHelper.ConvertUnixTimeToPicker(e.value), format);
        };
        return options;
    };

    //Binding function
    self.BindingTimeTextbox = function (input, fn) {
        var format = self.GetTimeFormat();
        input[enumHandlers.KENDOUITYPE.TIMEPICKER]({
            format: format,
            parseFormats: [format],
            change: fn
        });

    };
    //helping functions
    self.ConvertDatePickerToUnixTime = function (date) {
        return date ? WC.WidgetFilterHelper.ConvertTimePickerToUnixTime(date, true) : null;
    };
    self.FriendlyInputTimePicker = function (obj) {
        var input = jQuery(obj);
        var inputValue = input.val();
        var timePicker = input.data(enumHandlers.KENDOUITYPE.TIMEPICKER);
        if (timePicker && inputValue) {
            timePicker.value(self.ParseTime(inputValue));
        }
        if (!timePicker.value()) {
            input.val('');
        }
    };
    self.ParseTime = function (data) {
        var timeSeparator = userSettingModel.GetTimeFormatTemplateBy(enumHandlers.TIME_SETTINGS_FORMAT.DELEMITER);
        var inputParts = data.split(timeSeparator);
        for (var i = 0; i < 3; i++) {
            if (typeof inputParts[i] === 'undefined')
                inputParts[i] = '00';
            inputParts[i] = parseInt(inputParts[i], 10);
            var checkInputParts = [
                isNaN(inputParts[i]),
                inputParts[i] < 0,
                i === 0 && inputParts[i] >= 24,
                i !== 0 && inputParts[i] >= 60
            ];
            if (WC.Utility.MatchAny(true, checkInputParts)) {
                inputParts[i] = '--';
                break;
            }
            else {
                inputParts[i] = kendo.toString(inputParts[i], '00');
            }
        }
        return inputParts.join(timeSeparator);
    };
    self.GetTimeFormat = function () {
        var timeSettings = WC.FormatHelper.GetUserDefaultFormatSettings(enumHandlers.FIELDTYPE.TIME);
        timeSettings.second = 'ss';
        return WC.FormatHelper.GetFormatter(timeSettings);
    };
    // constructor
    self.Initial(handler, queryStep, element);
}
FilterTimeEditor.extend(BaseFilterEditor);