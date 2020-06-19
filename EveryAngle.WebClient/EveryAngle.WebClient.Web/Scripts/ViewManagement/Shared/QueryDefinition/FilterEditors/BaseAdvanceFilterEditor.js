function BaseAdvanceFilterEditor() {}
BaseAdvanceFilterEditor.extend(BaseFilterEditor);

// general
BaseAdvanceFilterEditor.prototype.TransferArguments = function (prevOperator) {
    // transfer arguments if they are applicable
    var self = this;
    var maxArguments = self.GetMaxArguments();
    var operator = self.Data.operator();
    var supportArgumentTypes = self.GetSupportArgumentTypes(operator);
    var args = ko.toJS(self.Data.arguments());
    
    // convert relative value to function
    var isRelativeSource = self.IsRelativeOperator(prevOperator);
    if (isRelativeSource) {
        args = jQuery.map(args, function (argument) {
            return self.ConvertRelativeToFunctionArgument(argument);
        });
    }

    // transfering
    var isRelativeTarget = self.IsRelativeOperator(operator);
    args = jQuery.map(args, function (argument) {
        if (jQuery.inArray(argument.argument_type, supportArgumentTypes) !== -1) {
            if (isRelativeTarget) {
                // convert to relative argument
                argument = argument.argument_type === enumHandlers.FILTERARGUMENTTYPE.FUNCTION ? self.ConvertFunctionToRelativeArgument(argument) : null;
            }
            return argument;
        }
    });

    // update to model
    args.splice(maxArguments, args.length);
    self.Data.arguments(args);
};
BaseAdvanceFilterEditor.prototype.GetSupportArgumentTypes = function (operator) {
    var self = this;
    if (WC.WidgetFilterHelper.IsListGroupOperator(operator))
        return [enumHandlers.FILTERARGUMENTTYPE.VALUE];

    // relative operator, including argument = function because they can be transformed
    if (self.IsRelativeOperator(operator))
        return [enumHandlers.FILTERARGUMENTTYPE.VALUE, enumHandlers.FILTERARGUMENTTYPE.FUNCTION];

    if (WC.WidgetFilterHelper.IsEqualGroupOperator(operator)
    || WC.WidgetFilterHelper.IsBetweenGroupOperator(operator))
        return [enumHandlers.FILTERARGUMENTTYPE.VALUE, enumHandlers.FILTERARGUMENTTYPE.FIELD, enumHandlers.FILTERARGUMENTTYPE.FUNCTION];

    // no argument
    return [];
};
BaseAdvanceFilterEditor.prototype.UpdateDropdownOperator = function (hasTypeFunction) {
    var self = this;
    var operators = self.GetOperators();
    var operator = self.Data.operator();
    if (hasTypeFunction || self.IsRelativeOperator(operator)) {
        operators.removeObject(enumHandlers.PROPERTIESNAME.VALUE, enumHandlers.OPERATOR.BEFOREORON.Value);
        operators.removeObject(enumHandlers.PROPERTIESNAME.VALUE, enumHandlers.OPERATOR.AFTERORON.Value);
        if (operator === enumHandlers.OPERATOR.BEFOREORON.Value)
            operator = enumHandlers.OPERATOR.BEFORE.Value;
        else if (operator === enumHandlers.OPERATOR.AFTERORON.Value)
            operator = enumHandlers.OPERATOR.AFTER.Value;

        var itemEqualTo = operators.findObject(enumHandlers.PROPERTIESNAME.VALUE, enumHandlers.OPERATOR.EQUALTO.Value);
        itemEqualTo.Text = enumHandlers.OPERATOR.ISIN.Text;
        var itemNotEqualTo = operators.findObject(enumHandlers.PROPERTIESNAME.VALUE, enumHandlers.OPERATOR.NOTEQUALTO.Value);
        itemNotEqualTo.Text = enumHandlers.OPERATOR.ISNOTIN.Text;
    }
    self.UpdateDropdownOperatorForRTMS(operators);

    // update to model
    self.Data.operator(operator);

    // update operator dropdown
    var ddlOperator = WC.HtmlHelper.DropdownList(self.$Element.find('.query-operator[data-role="dropdownlist"]'));
    ddlOperator.setDataSource(operators);
    ddlOperator.value(operator);
    ddlOperator.refresh();
};
BaseAdvanceFilterEditor.prototype.UpdateDropdownOperatorForRTMS = function (ddlData) {
    var self = this;
    var model = modelsHandler.GetModelByUri(self.Handler.ModelUri);
    var isRealTimeModel = aboutSystemHandler.IsRealTimeModel(model.id);
    if (isRealTimeModel) {
        ddlData.removeObject(enumHandlers.PROPERTIESNAME.VALUE, enumHandlers.OPERATOR.RELATIVEBEFORE.Value);
        ddlData.removeObject(enumHandlers.PROPERTIESNAME.VALUE, enumHandlers.OPERATOR.RELATIVEAFTER.Value);
        ddlData.removeObject(enumHandlers.PROPERTIESNAME.VALUE, enumHandlers.OPERATOR.RELATIVEBETWEEN.Value);
        ddlData.removeObject(enumHandlers.PROPERTIESNAME.VALUE, enumHandlers.OPERATOR.NOTRELATIVEBETWEEN.Value);
    }
};
BaseAdvanceFilterEditor.prototype.GetArgumentDefaultTemplate = function (rowClassName) {
    return [
        '<div class="form-row form-row-argument ' + WC.Utility.ToString(rowClassName) + '">',
            '<div class="form-col form-col-header col-input-type">',
                '<input class="input-argument-type" type="text" />',
            '</div>',
            '<div class="form-col form-col-body col-input col-input-value">',
                '<input class="input-argument-value" type="text" />',
            '</div>',
            '<div class="form-col form-col-body col-input col-input-field hidden">',
                '<div class="input-argument-field">',
                    '<span class="input-argument-field-value textEllipsis" data-role="tooltip" data-tooltip-position="bottom" data-showwhenneed="true"></span>',
                    '<a class="icon icon-setting-horizontal btn-select-field" data-role="tooltip" data-tooltip-position="bottom" data-tooltip-text="' + Localization.CompareValue + '"></a>',
                '</div>',
            '</div>',
            '<div class="form-col form-col-body col-input col-input-period hidden">',
                '<input class="input-argument-period-value" type="text" />',
            '</div>',
        '</div>'
    ].join('');
};
BaseAdvanceFilterEditor.prototype.GetArgumentPreviewTemplate = function () {
    return [
        '<div class="form-row">',
            '<div class="form-col form-col-body col-argument-preview hidden"></div>',
        '</div>'
    ].join('');
};
BaseAdvanceFilterEditor.prototype.GetDefaultArgument = function (argumentType) {
    var self = this;
    if (argumentType === enumHandlers.FILTERARGUMENTTYPE.FIELD)
        return self.GetObjectArgumentField(null);

    if (argumentType === enumHandlers.FILTERARGUMENTTYPE.FUNCTION)
        return self.GetObjectArgumentFunction(enumHandlers.FILTERPERIODTYPES[0].Value, 0);

    return self.GetObjectArgumentValue(null);
};
BaseAdvanceFilterEditor.prototype.GetArgumentOrDefault = function (argument, type) {
    var self = this;
    return argument && argument.argument_type === type ? argument : self.GetDefaultArgument(type);
};
BaseAdvanceFilterEditor.prototype.SetArgumentCache = function (container, argument) {
    if (argument) {
        var dropdown = WC.HtmlHelper.DropdownList(container.find('input.input-argument-type[data-role]'));
        dropdown.options.cache[argument.argument_type] = jQuery.extend({}, argument);
    }
};
BaseAdvanceFilterEditor.prototype.InitialArgumentUI = function (container, argumentIndex) {
    var self = this;
    var argument = self.Data.arguments()[argumentIndex] || self.GetDefaultArgument(enumHandlers.FILTERARGUMENTTYPE.VALUE);

    // create ui
    self.CreateDropdownArgumentType(container, argument, argumentIndex);
    self.CreateInputFunction(container, argumentIndex);
    self.CreateInputValue(container, argumentIndex);
    self.CreateInputField(container, argumentIndex);
    
    // show/hide ui + set value + preview
    var hasTypeFunction = self.ContainArgumentFunction(self.Data.arguments());
    self.UpdateArgumentUI(container, argument, true, hasTypeFunction);
};
BaseAdvanceFilterEditor.prototype.CreateDropdownArgumentType = function (container, argument, argumentIndex) {
    // dropdown select argument type
    var self = this;

    // store data in cache
    WC.HtmlHelper.DropdownList(container.find('input.input-argument-type'), enumHandlers.FILTERARGUMENTTYPES, {
        dataValueField: 'Value',
        dataTextField: 'Text',
        value: argument.argument_type,
        select: jQuery.proxy(self.ArgumentTypeSelect, self, container, argumentIndex),
        change: jQuery.proxy(self.ArgumentTypeChange, self, container, argumentIndex),
        cache: {}
    });
    jQuery.each(enumHandlers.FILTERARGUMENTTYPES, function (index, type) {
        self.SetArgumentCache(container, self.GetArgumentOrDefault(argument, type.Value));
    });
};
BaseAdvanceFilterEditor.prototype.ArgumentTypeSelect = function (container, argumentIndex, e) {
    // show compare field popup if it is not set
    var self = this;

    // check comparing field
    var dataItem = e.sender.dataItem(e.item);
    var argument = e.sender.options.cache[enumHandlers.FILTERARGUMENTTYPE.FIELD];
    if (dataItem.Value === enumHandlers.FILTERARGUMENTTYPE.FIELD && !argument.field) {
        // stop changing this option, it will be set after field was selected
        self.ShowCompareFieldPopup(container, argumentIndex);
        e.preventDefault();
    }
};
BaseAdvanceFilterEditor.prototype.ArgumentTypeChange = function (container, argumentIndex, e) {
    var self = this;
    var argumentType = e.sender.value();

    // update agument from cache
    self.UpdateArgument(container, e.sender.options.cache[argumentType], argumentIndex);
};
BaseAdvanceFilterEditor.prototype.UpdateArgument = function (container, argument, argumentIndex) {
    var self = this;

    // update model
    var args = self.Data.arguments();
    args[argumentIndex] = argument;
    self.AdjustDoubleArguments(args, argumentIndex);
    var hasTypeFunction = self.ContainArgumentFunction(args);
    self.Data.arguments(self.IsValidAllArguments(args) ? args : []);

    // update to cache
    self.SetArgumentCache(container, argument);

    // show/hide ui
    self.UpdateArgumentUI(container, argument, false, hasTypeFunction);
};
BaseAdvanceFilterEditor.prototype.UpdateArgumentUI = function (container, argument, updateInput, hasTypeFunction) {
    var self = this;

    // operator dropdown data source
    self.UpdateDropdownOperator(hasTypeFunction);

    // show/hide
    if (argument.argument_type === enumHandlers.FILTERARGUMENTTYPE.FUNCTION) {
        if (updateInput)
            self.UpdateArgumentFunctionUI(container, argument);
        container.find('.col-input-period').removeClass('hidden');
        container.find('.col-input-value,.col-input-field').addClass('hidden');
    }
    else if (argument.argument_type === enumHandlers.FILTERARGUMENTTYPE.FIELD) {
        if (updateInput)
            self.UpdateArgumentFieldUI(container, argument);
        container.find('.col-input-field').removeClass('hidden');
        container.find('.col-input-value,.col-input-period').addClass('hidden');
    }
    else {
        if (updateInput)
            self.UpdateArgumentValueUI(container, argument);
        container.find('.col-input-value').removeClass('hidden');
        container.find('.col-input-period,.col-input-field').addClass('hidden');
    }

    // update preview text
    self.UpdateArgumentPreview();

    // update blocker size/position
    self.Handler.TriggerUpdateBlockUI();
};
BaseAdvanceFilterEditor.prototype.IsValidArgument = function (arg) {
    var self = this;
    return arg && (arg.argument_type !== enumHandlers.FILTERARGUMENTTYPE.VALUE || self.IsValidArgumentValue(arg.value));
};
BaseAdvanceFilterEditor.prototype.IsValidAllArguments = function (args) {
    var self = this;
    return jQuery.grep(args, function (arg) { return self.IsValidArgument(arg); }).length === args.length;
};
BaseAdvanceFilterEditor.prototype.UpdateArgumentPreview = function () {
    var self = this;
    var element = self.$Element.find('.col-argument-preview');
    var text = self.GetArgumentPreview();
    element.text(text);

    // show/hide
    if (text)
        element.removeClass('hidden');
    else
        element.addClass('hidden');
};
BaseAdvanceFilterEditor.prototype.GetArgumentPreview = function (filedType) {
    var self = this;
    var data = self.Data.data();
    if (self.IsRelativeOperator(data.operator)) {
        // convert to function argument before getting a preview
        var argumentMappers = {};
        argumentMappers[enumHandlers.OPERATOR.RELATIVEBEFORE.Value] = enumHandlers.OPERATOR.BEFORE.Value;
        argumentMappers[enumHandlers.OPERATOR.RELATIVEAFTER.Value] = enumHandlers.OPERATOR.AFTER.Value;
        argumentMappers[enumHandlers.OPERATOR.RELATIVEBETWEEN.Value] = enumHandlers.OPERATOR.BETWEEN.Value;
        argumentMappers[enumHandlers.OPERATOR.NOTRELATIVEBETWEEN.Value] = enumHandlers.OPERATOR.NOTBETWEEN.Value;
        data.operator = argumentMappers[data.operator];
        jQuery.each(data.arguments, function (index, arg) {
            data.arguments[index] = self.ConvertRelativeToFunctionArgument(arg);
        });
    }
    self.Handler.AdjustFilterArguments(data);
    var previewSettings = WC.WidgetFilterHelper.GetTranslatedSettings(data.arguments, data.operator, filedType, self.Handler.ModelUri);
    previewSettings.arguments.splice(0, 0, previewSettings.template);
    return kendo.format.apply(kendo, previewSettings.arguments);
};

// argument type: function
BaseAdvanceFilterEditor.prototype.ContainArgumentFunction = function (args) {
    return args.hasObject('argument_type', enumHandlers.FILTERARGUMENTTYPE.FUNCTION);
};
BaseAdvanceFilterEditor.prototype.GetObjectArgumentFunction = function (type, value) {
    return WC.WidgetFilterHelper.ArgumentPeriodFunction(type, value);
};
BaseAdvanceFilterEditor.prototype.CreateInputFunction = function (container, argumentIndex) {
    var self = this;
    self.CreateInputFunctionValue(container, argumentIndex, self.SetInputFunction);
};
BaseAdvanceFilterEditor.prototype.CreateInputFunctionValue = function (container, argumentIndex, handler) {
    var self = this;
    var formatter = new Formatter({ decimals: 0, thousandseparator: true }, enumHandlers.FIELDTYPE.INTEGER);
    var format = WC.FormatHelper.GetFormatter(formatter);
    var inputUI = container.find('.input-argument-period-value').kendoPeriodPicker({
        change: jQuery.proxy(handler, self, container, argumentIndex),
        numericTextboxOptions: {
            canEmpty: false,
            format: format,
            messages: {
                text_last: Captions.WidgetFilter_ArgumentPeriod_Last.toLowerCase(),
                text_this: Captions.WidgetFilter_ArgumentPeriod_This.toLowerCase(),
                text_next: Captions.WidgetFilter_ArgumentPeriod_Next.toLowerCase()
            },
            comboBoxOptions: {
                dataTextField: 'text',
                dataValueField: 'value',
                dataSource: self.GetInputFunctionValueDataSource(format)
            }
        },
        dropdownListOptions: {
            dataSource: ko.toJS(enumHandlers.FILTERPERIODTYPES),
            defaultValue: enumHandlers.FILTERPERIODTYPES[0].Value
        }
    }).data('handler');

    // event
    inputUI.numericTextbox.element.off('input.editor').on('input.editor', jQuery.proxy(self.InputFunctionValueChange, self, inputUI));
};
BaseAdvanceFilterEditor.prototype.InputFunctionValueChange = function (inputUI) {
    var value = inputUI.numericTextbox.element.val();
    value = value.replace(/[^-\d]/, '');
    inputUI.numericTextbox.value(value);
    inputUI.numericTextbox.trigger('change');
    inputUI.numericTextbox.element.val(value);
};
BaseAdvanceFilterEditor.prototype.GetInputFunctionValueDataSource = function (format) {
    var i, data = [];
    for (i = -100; i <= -60; i += 10) {
        data.push({ value: i, text: kendo.toString(i, format) });
    }
    for (i = -50; i <= -10; i += 5) {
        data.push({ value: i, text: kendo.toString(i, format) });
    }
    for (i = -5; i <= -2; i++) {
        data.push({ value: i, text: kendo.toString(i, format) });
    }
    data.push({ value: -1, text: Captions.WidgetFilter_ArgumentPeriod_Last.toLowerCase() });
    data.push({ value: 0, text: Captions.WidgetFilter_ArgumentPeriod_This.toLowerCase() });
    data.push({ value: 1, text: Captions.WidgetFilter_ArgumentPeriod_Next.toLowerCase() });
    for (i = 2; i <= 5; i++) {
        data.push({ value: i, text: kendo.toString(i, '+' + format) });
    }
    for (i = 10; i <= 50; i += 5) {
        data.push({ value: i, text: kendo.toString(i, '+' + format) });
    }
    for (i = 60; i <= 100; i += 10) {
        data.push({ value: i, text: kendo.toString(i, '+' + format) });
    }

    data.sortObject('value', enumHandlers.SORTDIRECTION.DESC);
    return data;
};
BaseAdvanceFilterEditor.prototype.SetInputFunction = function (container, argumentIndex) {
    var self = this;
    var period = container.find('input.input-argument-period-value[data-role]').data('handler').period();

    // update model
    var argument = self.GetObjectArgumentFunction(period.type, period.value);
    self.UpdateArgument(container, argument, argumentIndex);
};
BaseAdvanceFilterEditor.prototype.UpdateArgumentFunctionUI = function (container, argument) {
    var period = {
        value: WC.WidgetFilterHelper.GetAdvanceArgumentValue(argument),
        type: WC.WidgetFilterHelper.GetAdvanceArgumentType(argument)
    };
    container.find('.input-argument-period-value[data-role]').data('handler').period(period);
};

// argument type: value
BaseAdvanceFilterEditor.prototype.CreateInputValue = jQuery.noop;
BaseAdvanceFilterEditor.prototype.SetInputValue = function (container, argumentIndex) {
    var self = this;
    var input = container.find('input.input-argument-value[data-role]');
    var value = self.GetInputArgumentValue(input);

    // update model
    var argument = self.GetObjectArgumentValue(value);
    self.UpdateArgument(container, argument, argumentIndex);
};
BaseAdvanceFilterEditor.prototype.UpdateArgumentValueUI = jQuery.noop;

// argument type: field
BaseAdvanceFilterEditor.prototype.ShowCompareFieldPopup = function (container, argumentIndex) {
    var self = this;
    var target = self.GetCompareFieldTarget().toLowerCase();
    var sender = {
        FilterFor: self.Handler.FilterFor,
        GetData: self.Handler.GetData,
        SetCompareFieldFilter: jQuery.proxy(self.SetCompareField, self, container, argumentIndex),
        CompareInfo: {
            Index: self.Handler.Data.indexOf(self.Data)
        }
    };
    self.Handler.InitialAddFilterOptions();
    fieldsChooserHandler.ShowPopup(fieldsChooserHandler.USETYPE.ADDFILTER, target, sender);
};
BaseAdvanceFilterEditor.prototype.SetCompareField = function (container, argumentIndex, field) {
    var self = this;
    modelFieldsHandler.SetFields([field], self.Handler.ModelUri);

    // update dropdown value
    var ddlArgumentType = WC.HtmlHelper.DropdownList(container.find('input.input-argument-type[data-role]'));
    ddlArgumentType.value(enumHandlers.FILTERARGUMENTTYPE.FIELD);

    // update model
    var argument = self.GetObjectArgumentField(field.id);
    self.UpdateArgument(container, argument, argumentIndex);
    self.UpdateArgumentFieldUI(container, argument);
};
BaseAdvanceFilterEditor.prototype.CreateInputField = function (container, argumentIndex) {
    var self = this;
    container.find('.btn-select-field')
        .off('click')
        .on('click', jQuery.proxy(self.ShowCompareFieldPopup, self, container, argumentIndex));
};
BaseAdvanceFilterEditor.prototype.UpdateArgumentFieldUI = function (container, argument) {
    var self = this;
    var text = self.GetCompareFieldText(argument);
    container.find('.input-argument-field-value').text(text);
};

// relative operator
BaseAdvanceFilterEditor.prototype.IsRelativeOperator = function (operator) {
    return jQuery.inArray(operator, WC.WidgetFilterHelper.RelativeArguments) !== -1;
};
BaseAdvanceFilterEditor.prototype.GetArgumentRelativeTemplate = function (rowClassName) {
    return [
        '<div class="form-row form-row-argument ' + WC.Utility.ToString(rowClassName) + '">',
            '<div class="form-col form-col-header col-input-type">',
                '<input class="input-argument-type" type="text" />',
            '</div>',
            '<div class="form-col form-col-body col-input col-input-period">',
                '<input class="input-argument-period-value" type="text" />',
            '</div>',
        '</div>'
    ].join('');
};
BaseAdvanceFilterEditor.prototype.InitialRelativeArgumentUI = function (container, argumentIndex) {
    var self = this;
    var argument = self.Data.arguments()[argumentIndex];
    if (!argument) {
        argument = self.GetObjectArgumentValue(0);

        var args = self.Data.arguments();
        args[argumentIndex] = argument;
        self.Data.arguments(args);
    }

    // create ui
    self.CreateDropdownRelativeArgumentType(container, argument);
    self.CreateInputRelativeValue(container, argumentIndex);

    // set value + preview
    self.UpdateRelativeArgumentUI(container, argument, true);
};
BaseAdvanceFilterEditor.prototype.CreateDropdownRelativeArgumentType = function (container, argument) {
    var self = this;

    // dropdown select argument type
    var data = ko.toJS(enumHandlers.FILTERARGUMENTTYPES).findObjects('Value', enumHandlers.FILTERARGUMENTTYPE.FUNCTION);
    data[0].Value = enumHandlers.FILTERARGUMENTTYPE.VALUE;
    WC.HtmlHelper.DropdownList(container.find('input.input-argument-type'), data, {
        dataValueField: 'Value',
        dataTextField: 'Text',
        value: enumHandlers.FILTERARGUMENTTYPE.VALUE,
        enable: false,
        cache: {}
    });

    // set cache
    self.SetArgumentCache(container, argument);
};
BaseAdvanceFilterEditor.prototype.CreateInputRelativeValue = function (container, argumentIndex) {
    var self = this;
    self.CreateInputFunctionValue(container, argumentIndex, self.SetInputRelativeValue);
};
BaseAdvanceFilterEditor.prototype.SetInputRelativeValue = function (container, argumentIndex) {
    var self = this;
    var value = container.find('input.input-argument-period-value[data-role]').data('handler').value();

    // update model
    var argument = self.GetObjectArgumentValue(value);
    self.UpdateRelativeArgument(container, argument, argumentIndex);
};
BaseAdvanceFilterEditor.prototype.UpdateRelativeArgument = function (container, argument, argumentIndex) {
    var self = this;

    // update model
    var args = self.Data.arguments();
    args[argumentIndex] = argument;
    self.AdjustDoubleArguments(args, argumentIndex);
    self.Data.arguments(self.IsValidAllArguments(args) ? args : []);

    // show/hide ui
    self.UpdateRelativeArgumentUI(container, argument, false);
};
BaseAdvanceFilterEditor.prototype.UpdateRelativeArgumentUI = function (container, argument, updateInput) {
    var self = this;
    
    // operator dropdown data source
    self.UpdateDropdownOperator(true);

    // update ui
    if (updateInput)
        container.find('.input-argument-period-value[data-role]').data('handler').value(argument.value);

    // update preview text
    self.UpdateArgumentPreview();

    // update blocker size/position
    self.Handler.TriggerUpdateBlockUI();
};
BaseAdvanceFilterEditor.prototype.ConvertRelativeToFunctionArgument = function (argument) {
    var self = this;
    return self.GetObjectArgumentFunction(enumHandlers.FILTERPERIODTYPES[0].Value, argument.value);
};
BaseAdvanceFilterEditor.prototype.ConvertFunctionToRelativeArgument = function (argument) {
    var self = this;
    var value = WC.WidgetFilterHelper.GetAdvanceArgumentValue(argument);
    var unit = WC.WidgetFilterHelper.GetAdvanceArgumentType(argument);
    var days = enumHandlers.FILTERPERIODTYPES.findObject('Value', unit).Days;
    return self.GetObjectArgumentValue(value * days);
};

// single argument
BaseAdvanceFilterEditor.prototype.GetSingleArgumentTemplate = function () {
    var self = this;
    if (!self.IsRelativeOperator(self.Data.operator())) {
        return [
            self.GetArgumentDefaultTemplate(),
            self.GetArgumentPreviewTemplate()
        ].join('');
    }
    else {
        return [
            self.GetArgumentRelativeTemplate(),
            self.GetArgumentPreviewTemplate()
        ].join('');
    }
};
BaseAdvanceFilterEditor.prototype.InitialSingleArgumentUI = function (container) {
    var self = this;
    self.SetElementCssClass('filter-editor-single');
    if (!self.IsRelativeOperator(self.Data.operator())) {
        self.InitialArgumentUI(container.find('.form-row-argument'), 0);
    }
    else {
        self.InitialRelativeArgumentUI(container.find('.form-row-argument'), 0);
    }
};

// double argument
BaseAdvanceFilterEditor.prototype.GetDoubleArgumentTemplate = function () {
    var self = this;
    if (!self.IsRelativeOperator(self.Data.operator())) {
        return [
            self.GetArgumentDefaultTemplate('form-row-argument-from'),
            self.GetArgumentDefaultTemplate('form-row-argument-to'),
            self.GetArgumentPreviewTemplate()
        ].join('');
    }
    else {
        return [
            self.GetArgumentRelativeTemplate('form-row-argument-from'),
            self.GetArgumentRelativeTemplate('form-row-argument-to'),
            self.GetArgumentPreviewTemplate()
        ].join('');
    }
};
BaseAdvanceFilterEditor.prototype.InitialDoubleArgumentUI = function (container) {
    var self = this;
    self.SetElementCssClass('filter-editor-double');
    if (!self.IsRelativeOperator(self.Data.operator())) {
        self.InitialArgumentUI(container.find('.form-row-argument-from'), 0);
        self.InitialArgumentUI(container.find('.form-row-argument-to'), 1);
    }
    else {
        self.InitialRelativeArgumentUI(container.find('.form-row-argument-from'), 0);
        self.InitialRelativeArgumentUI(container.find('.form-row-argument-to'), 1);
    }
};
BaseAdvanceFilterEditor.prototype.AdjustDoubleArguments = function (args, argumentIndex) {
    var self = this;
    var isDoubleArgument = WC.WidgetFilterHelper.IsBetweenGroupOperator(self.Data.operator());
    var anotherArgumentIndex = argumentIndex === 1 ? 0 : 1;
    if (isDoubleArgument && !args[anotherArgumentIndex]) {
        // update another argument
        var anotherContainer = self.$Element.find('.form-row-argument').eq(anotherArgumentIndex);
        var dropdown = WC.HtmlHelper.DropdownList(anotherContainer.find('input.input-argument-type[data-role]'));
        args[anotherArgumentIndex] = dropdown.options.cache[dropdown.value()];
    }
};