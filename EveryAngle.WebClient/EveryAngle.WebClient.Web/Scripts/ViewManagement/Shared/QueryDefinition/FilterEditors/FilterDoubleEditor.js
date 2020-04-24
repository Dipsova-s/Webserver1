function FilterDoubleEditor(handler, queryStep, element) {
    var self = this;

    self.GetOperators = function () {
        return ko.toJS([].concat(
            enumHandlers.QUERYSTEPOPERATOR.DEFAULT,
            enumHandlers.QUERYSTEPOPERATOR.GROUPONE,
            enumHandlers.QUERYSTEPOPERATOR.GROUPTWO,
            enumHandlers.QUERYSTEPOPERATOR.GROUPTHREE));
    };
    self.GetCompareFieldTarget = function () {
        return enumHandlers.FIELDTYPE.NUMBER;
    };

    // single argument
    self.InitialSingleArgumentUI = function (container) {
        // call base to perform argument type field
        self.parent.prototype.InitialSingleArgumentUI.call(self, container);

        var input = container.find('.input-argument-value');
        var inputUI = self.BindingNumericTextbox(input, jQuery.proxy(self.SetSingleArgumentValue, self, input));

        // set value to ui
        var argument = self.Data.arguments()[0];
        if (self.IsArgumentTypeValue(argument)) {
            input.data(enumHandlers.KENDOUITYPE.NUMERICTEXT).value(argument.value);
        }

        // event
        var inputTyping = container.find('.input-argument-value[data-role="numerictextbox"]');
        inputTyping.off('keyup').on('keyup', jQuery.proxy(self.OnInputTextChange, self, inputUI, input));
    };
    self.InitialDoubleArgumentUI = function (container) {
        // call base
        self.parent.prototype.InitialDoubleArgumentUI.call(self, container);

        var inputFrom = container.find('.input-argument-from');
        var inputTo = container.find('.input-argument-to');
        var inputFromUI = self.BindingNumericTextbox(inputFrom, jQuery.proxy(self.SetDoubleArgumentValues, self, inputFrom, inputTo));
        var inputToUI = self.BindingNumericTextbox(inputTo, jQuery.proxy(self.SetDoubleArgumentValues, self, inputFrom, inputTo));

        // set value to ui
        var args = self.Data.arguments();
        if (args[0])
            inputFrom.data(enumHandlers.KENDOUITYPE.NUMERICTEXT).value(args[0].value);
        if (args[1])
            inputTo.data(enumHandlers.KENDOUITYPE.NUMERICTEXT).value(args[1].value);

        // events
        var inputTypingFrom = container.find('.input-argument-from[data-role="numerictextbox"]');
        inputTypingFrom.off('keyup').on('keyup', jQuery.proxy(self.OnInputTextChange, self, inputFromUI, inputFrom));

        var inputTypingTo = container.find('.input-argument-to[data-role="numerictextbox"]');
        inputTypingTo.off('keyup').on('keyup', jQuery.proxy(self.OnInputTextChange, self, inputToUI, inputTo));
    };
    self.InitialMultipleArgumentUI = function (container) {
        // call base
        self.parent.prototype.InitialMultipleArgumentUI.call(self, container);

        var input = container.find('.input-argument-typing');
        self.BindingNumericTextbox(input, jQuery.noop);
    };
    self.GetInputArgumentValue = function (input) {
        return input.data(enumHandlers.KENDOUITYPE.NUMERICTEXT).value();
    };
    self.IsValidArgumentValue = function (value) {
        return jQuery.isNumeric(value);
    };
    self.TransformPastingList = function (list) {
        return jQuery.map(list, function (data) {
            return parseFloat(data);
        });
    };
    self.GetListGridOptions = function (data) {
        var decimals = 20;
        var options = self.parent.prototype.GetListGridOptions.call(self, data);
        var formatter = new Formatter({ decimals: decimals, thousandseparator: true }, enumHandlers.FIELDTYPE.NUMBER);
        var format = WC.FormatHelper.GetFormatter(formatter);
        options.columns[0].template = function (e) {
            return kendo.toString(e.value, format);
        };
        return options;
    };

    //Binding function
    self.BindingNumericTextbox = function (input, fn) {
        var decimals = 20;
        var formatter = new Formatter({ decimals: decimals, thousandseparator: true }, enumHandlers.FIELDTYPE.NUMBER);
        var format = WC.FormatHelper.GetFormatter(formatter);
        var step = 1;

        return input[enumHandlers.KENDOUITYPE.NUMERICTEXT]({
            step: step,
            format: format,
            decimals: decimals,
            change: fn,
            spin: fn
        }).data(enumHandlers.KENDOUITYPE.NUMERICTEXT);
    };

    // constructor
    self.Initial(handler, queryStep, element);
}
FilterDoubleEditor.extend(BaseFilterEditor);