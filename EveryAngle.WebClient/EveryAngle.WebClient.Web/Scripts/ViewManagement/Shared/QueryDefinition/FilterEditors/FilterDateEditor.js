function FilterDateEditor(handler, queryStep, element) {
    var self = this;

    // general
    self.GetOperators = function () {
        return ko.toJS([].concat(
            enumHandlers.QUERYSTEPOPERATOR.SIMPLIFYDATE));
    };
    self.DropdownOperatorChange = function () {
        self.parent.prototype.DropdownOperatorChange.apply(self, arguments);
        var hasTypeFunction = self.ContainArgumentFunction(self.Data.arguments());
        self.UpdateDropdownOperator(hasTypeFunction);
    };
    self.SetElementCssClass = function () {
        self.parent.prototype.SetElementCssClass.apply(self, arguments);
        self.$Element.addClass('filter-advance-editor');
    };
    self.GetInputArgumentValue = function (input) {
        var date = input.data('handler').value();
        return self.ConvertDatePickerToUnixTime(date);
    };
    self.CreateInputValue = function (container, argumentIndex) {
        var input = container.find('.input-argument-value');
        input.kendoDatePicker({
            format: WC.WidgetFilterHelper.GetDateFormat(),
            max: new Date(9999, 12, 31),
            change: jQuery.proxy(self.SetInputValue, self, container, argumentIndex)
        });
    };
    self.IsValidArgumentValue = function (value) {
        return typeof value === 'number';
    };
    self.GetArgumentPreview = function () {
        return self.parent.prototype.GetArgumentPreview.call(self, enumHandlers.FIELDTYPE.DATE);
    };
    self.ConvertDatePickerToUnixTime = function (date) {
        return date ? WC.WidgetFilterHelper.ConvertDatePickerToUnixTime(date, false) : null;
    };
    self.UpdateArgumentValueUI = function (container, argument) {
        var input = container.find('.input-argument-value[data-role]');
        var value = argument.value ? WC.WidgetFilterHelper.ConvertUnixTimeToPicker(argument.value) : null;
        input.data('handler').value(value);
    };

    // multiple argument
    self.InitialMultipleArgumentUI = function (container) {
        self.parent.prototype.InitialMultipleArgumentUI.call(self, container);

        var inputTyping = container.find('.input-argument-typing');
        inputTyping.kendoDatePicker({
            format: WC.WidgetFilterHelper.GetDateFormat(),
            max: new Date(9999, 12, 31)
        });
    };
    self.GetListGridOptions = function (data) {
        var options = self.parent.prototype.GetListGridOptions.call(self, data);
        var format = WC.WidgetFilterHelper.GetDateFormat();
        options.columns[0].template = function (e) {
            var value = WC.WidgetFilterHelper.ConvertUnixTimeToPicker(e.value);
            return kendo.toString(value, format);
        };
        return options;
    };
    self.TransformPastingList = function (list) {
        var format = WC.WidgetFilterHelper.GetDateFormat();
        return jQuery.map(list, function (data) {
            var date = kendo.parseDate(jQuery.trim(data), format);
            return self.ConvertDatePickerToUnixTime(date);
        });
    };

    // compare field
    self.GetCompareFieldTarget = function () {
        return enumHandlers.FIELDTYPE.DATE;
    };

    // constructor
    self.Initial(handler, queryStep, element);
}
FilterDateEditor.extend(BaseAdvanceFilterEditor);