function FilterPeriodEditor(handler, queryStep, element) {
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

        var input = container.find('.input-argument-value');
        var inputUI = self.BindingPeriodPicker(input, jQuery.proxy(self.SetSingleArgumentValue, self, input));

        // set value to ui
        var argument = self.Data.arguments()[0];
        if (self.IsArgumentTypeValue(argument)) {
            inputUI.value(argument.value);
        }

        // event 
        inputUI.numericTextbox.element.off('input.editor').on('input.editor', jQuery.proxy(self.OnInputTextChange, self, inputUI));
    };
    self.InitialDoubleArgumentUI = function (container) {
        // call base
        self.parent.prototype.InitialDoubleArgumentUI.call(self, container);
        container.find('.form-row').addClass('flex-wrap');

        var inputFrom = container.find('.input-argument-from');
        var inputTo = container.find('.input-argument-to');
        var inputFromUI = self.BindingPeriodPicker(inputFrom, jQuery.proxy(self.SetDoubleArgumentValues, self, inputFrom, inputTo));
        var inputToUI = self.BindingPeriodPicker(inputTo, jQuery.proxy(self.SetDoubleArgumentValues, self, inputFrom, inputTo));

        // set value to ui
        var args = self.Data.arguments();
        if (args[0])
            inputFromUI.value(args[0].value);
        if (args[1])
            inputToUI.value(args[1].value);

        // events
        inputFromUI.numericTextbox.element.off('input.editor').on('input.editor', jQuery.proxy(self.OnInputTextChange, self, inputFromUI));
        inputToUI.numericTextbox.element.off('input.editor').on('input.editor', jQuery.proxy(self.OnInputTextChange, self, inputToUI));
    };
    self.InitialMultipleArgumentUI = function (container) {
        // call base
        self.parent.prototype.InitialMultipleArgumentUI.call(self, container);

        var input = container.find('.input-argument-typing');
        var ui = self.BindingPeriodPicker(input, jQuery.noop);
        var combobox = ui.numericTextbox.wrapper.find('.k-input');
        var inputTyping = combobox.filter('input[data-role=customnumerictextbox]');
        inputTyping.off('keydown').on('keydown', jQuery.proxy(self.InputTypingKeyDown, self, input, combobox));
        inputTyping.off('paste').on('paste', jQuery.proxy(self.PasteListText, self));
    };
    self.GetInputArgumentValue = function (input) {
        return input.data('handler').value();
    };
    self.OnInputTextChange = function (inputUI) {
        var value = inputUI.numericTextbox.element.val();
        value = value.replace(/\D$/, '');
        inputUI.numericTextbox.value(value);
        inputUI.numericTextbox.trigger('change');
    };
    self.IsValidArgumentValue = function (value) {
        return jQuery.isNumeric(value);
    };
    self.TransformPastingList = function (list) {
        return jQuery.map(list, function (data) {
            return parseInt(data);
        });
    };
    self.GetListGridOptions = function (data) {
        var options = self.parent.prototype.GetListGridOptions.call(self, data);
        var formatter = new Formatter({ format: enumHandlers.TIMEFORMAT.DAY }, enumHandlers.FIELDTYPE.PERIOD);
        var format = WC.FormatHelper.GetFormatter(formatter);
        options.columns[0].template = function (e) {
            return kendo.toString(e.value, format);
        };
        return options;
    };
    self.InputTypingKeyDown = function (input, combobox, e) {
        var self = this;
        combobox.removeClass('required');
        var numericTextbox = self.GetNumericTextbox();
        numericTextbox.combobox.open();
        if (e.which === 13) {
            combobox.filter('input[data-role=customnumerictextbox]').get(0).blur();
            self.AddMultipleArgumentValue(input);
        }
    };
    self.AddMultipleArgumentValues = function (values) {
        self.parent.prototype.AddMultipleArgumentValues.call(self, values);
        var input = self.$Element.find('.input-argument-typing');
        var numericTextbox = self.GetNumericTextbox();
        var combobox = numericTextbox.wrapper.find('.k-input');
        var inputFormatted = combobox.filter('.k-formatted-value');
        if (!input.hasClass('required')) {
            combobox.removeClass('required');
            numericTextbox.value(null);
        }
        else {
            combobox.addClass('required');
        }
        inputFormatted.focus();
        setTimeout(function () {
            numericTextbox.combobox.close();
        }, 0);
    };
    self.GetNumericTextbox = function () {
        var input = self.$Element.find('.input-argument-typing');
        return input.data(enumHandlers.KENDOUITYPE.PERIODPICKER).numericTextbox;
    };

    //Binding function
    self.BindingPeriodPicker = function (input, fn) {
        var formatter = new Formatter({ decimals: 0, thousandseparator: true }, enumHandlers.FIELDTYPE.INTEGER);
        var format = WC.FormatHelper.GetFormatter(formatter);
        return input.kendoPeriodPicker({
            change: fn,
            numericTextboxOptions: {
                format: format,
                messages: {
                    text_last: Captions.WidgetFilter_ArgumentPeriod_Last.toLowerCase(),
                    text_this: Captions.WidgetFilter_ArgumentPeriod_This.toLowerCase(),
                    text_next: Captions.WidgetFilter_ArgumentPeriod_Next.toLowerCase()
                },
                comboBoxOptions: {
                    dataTextField: 'text',
                    dataValueField: 'value',
                    dataSource: ko.toJS(BaseAdvanceFilterEditor.prototype.GetInputFunctionValueDataSource(format))
                }
            },
            dropdownListOptions: {
                dataSource: ko.toJS(enumHandlers.FILTERPERIODTYPES),
                defaultValue: enumHandlers.FILTERPERIODTYPES[0].Value
            }
        }).data(enumHandlers.KENDOUITYPE.PERIODPICKER);
    };
    // constructor
    self.Initial(handler, queryStep, element);
}
FilterPeriodEditor.extend(BaseFilterEditor);