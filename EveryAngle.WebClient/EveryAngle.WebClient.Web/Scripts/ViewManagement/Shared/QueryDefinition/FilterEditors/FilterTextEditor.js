function FilterTextEditor(handler, queryStep, element) {
    var self = this;
    self.$Grid = null;

    // general
    self.GetOperators = function () {
        return ko.toJS([].concat(
            enumHandlers.QUERYSTEPOPERATOR.DEFAULT,
            enumHandlers.QUERYSTEPOPERATOR.GROUPONE,
            enumHandlers.QUERYSTEPOPERATOR.GROUPTWO,
            enumHandlers.QUERYSTEPOPERATOR.GROUPTHREE,
            enumHandlers.QUERYSTEPOPERATOR.GROUPFOUR));
    };

    // single argument
    self.InitialSingleArgumentUI = function (container) {
        // call base to perform argument type field
        self.parent.prototype.InitialSingleArgumentUI.call(self, container);

        var input = container.find('.input-argument-value');

        // set value to ui
        var argument = self.Data.arguments()[0];
        if (self.IsArgumentTypeValue(argument)) {
            input.val(argument.value);
        }

        // events
        input.off('keyup change').on('keyup change', jQuery.proxy(self.SetSingleArgumentValue, self, input));
    };

    // double argument
    self.InitialDoubleArgumentUI = function (container) {
        // call base
        self.parent.prototype.InitialDoubleArgumentUI.call(self, container);

        var inputFrom = container.find('.input-argument-from');
        var inputTo = container.find('.input-argument-to');

        // set value to ui
        var args = self.Data.arguments();
        if (args[0])
            inputFrom.val(args[0].value);
        if (args[1])
            inputTo.val(args[1].value);

        // events
        inputFrom.off('keyup change').on('keyup change', jQuery.proxy(self.SetDoubleArgumentValues, self, inputFrom, inputTo));
        inputTo.off('keyup change').on('keyup change', jQuery.proxy(self.SetDoubleArgumentValues, self, inputFrom, inputTo));
    };

    // compare field
    self.GetCompareFieldTarget = function () {
        return enumHandlers.FIELDTYPE.TEXT;
    };

    // constructor
    self.Initial(handler, queryStep, element);
}
FilterTextEditor.extend(BaseFilterEditor);