function BaseFilterEditor() { }

// general
BaseFilterEditor.prototype.Handler = null;
BaseFilterEditor.prototype.Data = null;
BaseFilterEditor.prototype.$Element = jQuery();
BaseFilterEditor.prototype.Initial = function (handler, queryStep, element) {
    var self = this;
    self.Handler = handler;
    self.Data = queryStep;
    self.$Element = element;

    self.CreateDropdownOperator();
    self.CreateArgumentsEditor();
};
BaseFilterEditor.prototype.CreateDropdownOperator = function () {
    var self = this;
    var element = self.$Element.find('.query-operator');
    var operators = self.GetOperators();
    var options = self.GetDropdownOperatorOptions();
    WC.HtmlHelper.DropdownList(element, operators, options);
};
BaseFilterEditor.prototype.GetDropdownOperatorOptions = function () {
    var self = this;
    return {
        dataTextField: enumHandlers.PROPERTIESNAME.TEXT,
        dataValueField: enumHandlers.PROPERTIESNAME.VALUE,
        value: self.Data.operator(),
        change: jQuery.proxy(self.DropdownOperatorChange, self)
    };
};
BaseFilterEditor.prototype.DropdownOperatorChange = function (e) {
    var self = this;
    var prevOperator = self.Data.operator();
    self.Data.operator(e.sender.value());
    self.TransferArguments(prevOperator);
    self.CreateArgumentsEditor();

    // update blocker size/position
    self.Handler.TriggerUpdateBlockUI();
};
BaseFilterEditor.prototype.GetOperators = function () {
    return [];
};
BaseFilterEditor.prototype.TransferArguments = function () {
    // transfer arguments if they are applicable
    var self = this;
    var maxArguments = self.GetMaxArguments();
    var operator = self.Data.operator();
    var supportArgumentTypes = self.GetSupportArgumentTypes(operator);
    var args = ko.toJS(self.Data.arguments());

    // transfering
    args = jQuery.map(args, function (argument) {
        if (jQuery.inArray(argument.argument_type, supportArgumentTypes) !== -1) {
            return argument;
        }
    });

    args.splice(maxArguments, args.length);
    self.Data.arguments(args);
};
BaseFilterEditor.prototype.GetSupportArgumentTypes = function (operator) {
    if (WC.WidgetFilterHelper.IsEqualGroupOperator(operator))
        return [enumHandlers.FILTERARGUMENTTYPE.VALUE, enumHandlers.FILTERARGUMENTTYPE.FIELD];

    if (WC.WidgetFilterHelper.IsListGroupOperator(operator)
        || WC.WidgetFilterHelper.IsBetweenGroupOperator(operator))
        return [enumHandlers.FILTERARGUMENTTYPE.VALUE];

    // no argument
    return [];
};
BaseFilterEditor.prototype.GetMaxArguments = function () {
    var self = this;
    var operator = self.Data.operator();
    var argumentLength = self.Data.arguments().length;
    if (WC.WidgetFilterHelper.IsEqualGroupOperator(operator))
        return Math.min(argumentLength, 1);
    if (WC.WidgetFilterHelper.IsBetweenGroupOperator(operator))
        return Math.min(argumentLength, 2);
    if (WC.WidgetFilterHelper.IsListGroupOperator(operator))
        return argumentLength;
    return 0;
};
BaseFilterEditor.prototype.CreateArgumentsEditor = function () {
    var self = this;
    var container = self.$Element.find('.filter-editor-arguments');
    var settings = self.GetArgumentSettings(self.Data.operator());
    self.DestroyArgumentsUI();
    container.html(settings.template);
    settings.callback.call(self, container);
};
BaseFilterEditor.prototype.GetArgumentSettings = function (operator) {
    var self = this;
    if (WC.WidgetFilterHelper.IsEqualGroupOperator(operator))
        return { template: self.GetSingleArgumentTemplate(), callback: self.InitialSingleArgumentUI };

    if (WC.WidgetFilterHelper.IsBetweenGroupOperator(operator))
        return { template: self.GetDoubleArgumentTemplate(), callback: self.InitialDoubleArgumentUI };

    if (WC.WidgetFilterHelper.IsListGroupOperator(operator))
        return { template: self.GetMultipleArgumentTemplate(), callback: self.InitialMultipleArgumentUI };

    return { template: self.GetNoArgumentTemplate(), callback: self.InitialNoArgumentUI };
};
BaseFilterEditor.prototype.SetElementCssClass = function (className) {
    var self = this;
    var classNames = [
        'filter-editor-none',
        'filter-editor-single',
        'filter-editor-double',
        'filter-editor-multiple'
    ];

    // exclude className
    var removeIndex = jQuery.inArray(className, classNames);
    classNames.splice(removeIndex, 1);

    // set/remove classes
    self.$Element.removeClass(classNames.join(' '));
    self.$Element.addClass(className);
};
BaseFilterEditor.prototype.GetInputArgumentValue = function (input) {
    return jQuery.trim(input.val());
};
BaseFilterEditor.prototype.GetObjectArgumentValue = function (value) {
    return WC.WidgetFilterHelper.ArgumentObject(value, enumHandlers.FILTERARGUMENTTYPE.VALUE);
};
BaseFilterEditor.prototype.GetObjectArgumentField = function (field) {
    return WC.WidgetFilterHelper.ArgumentObject(field, enumHandlers.FILTERARGUMENTTYPE.FIELD);
};
BaseFilterEditor.prototype.IsValidArgumentValue = function (value) {
    return value;
};
BaseFilterEditor.prototype.IsArgumentTypeValue = function (argument) {
    return argument && argument.argument_type === enumHandlers.FILTERARGUMENTTYPE.VALUE;
};

// no argument
BaseFilterEditor.prototype.GetNoArgumentTemplate = function () {
    return '';
};
BaseFilterEditor.prototype.InitialNoArgumentUI = function () {
    var self = this;
    self.SetElementCssClass('filter-editor-none');
};

// single argument
BaseFilterEditor.prototype.GetSingleArgumentTemplate = function () {
    return [
        '<div class="form-row">',
            '<div class="form-col form-col-body col-input col-input-value">',
                '<input class="input-argument-value" type="text" />',
                '<a class="icon icon-setting-horizontal btn-select-field" data-role="tooltip" data-tooltip-position="bottom" data-tooltip-text="' + Localization.CompareValue + '"></a>',
            '</div>',
            '<div class="form-col form-col-body col-input col-input-field hidden">',
                '<div class="input-argument-field">',
                    '<span class="input-argument-field-value textEllipsis" data-role="tooltip" data-tooltip-position="bottom" data-showwhenneed="true"></span>',
                    '<a class="icon icon-close btn-remove-field"></a>',
                    '<a class="icon icon-setting-horizontal btn-select-field" data-role="tooltip" data-tooltip-position="bottom" data-tooltip-text="' + Localization.CompareValue + '"></a>',
                '</div>',
            '</div>',
        '</div>'
    ].join('');
};
BaseFilterEditor.prototype.InitialSingleArgumentUI = function (container) {
    var self = this;
    self.SetElementCssClass('filter-editor-single');
    self.UpdateArgumentFieldUI(self.IsCompareField(self.Data.arguments()));
    container.find('.btn-select-field').off('click').on('click', jQuery.proxy(self.ShowCompareFieldPopup, self));
    container.find('.btn-remove-field').off('click').on('click', jQuery.proxy(self.RemoveCompareField, self));
};
BaseFilterEditor.prototype.SetSingleArgumentValue = function (input) {
    var self = this;
    var value = self.GetInputArgumentValue(input);
    if (self.IsValidArgumentValue(value))
        self.Data.arguments([self.GetObjectArgumentValue(value)]);
    else
        self.Data.arguments([]);
};

// double argument
BaseFilterEditor.prototype.GetDoubleArgumentTemplate = function () {
    return [
        '<div class="form-row">',
            '<div class="form-col form-col-body col-input col-input-value">',
                '<input class="input-argument-value input-argument-from" type="text" />',
            '</div>',
            '<div class="form-col col-label">',
                Localization.And,
            '</div>',
            '<div class="form-col form-col-body col-input col-input-value">',
                '<input class="input-argument-value input-argument-to" type="text" />',
            '</div>',
        '</div>'
    ].join('');
};
BaseFilterEditor.prototype.InitialDoubleArgumentUI = function () {
    var self = this;
    self.SetElementCssClass('filter-editor-double');
};
BaseFilterEditor.prototype.SetDoubleArgumentValues = function (inputFrom, inputTo) {
    var self = this;
    var valueFrom = self.GetInputArgumentValue(inputFrom);
    var valueTo = self.GetInputArgumentValue(inputTo);
    if (self.IsValidArgumentValue(valueFrom) && self.IsValidArgumentValue(valueTo)) {
        self.Data.arguments([
            self.GetObjectArgumentValue(valueFrom),
            self.GetObjectArgumentValue(valueTo)
        ]);
    }
    else {
        self.Data.arguments([]);
    }
};

// multiple argument
BaseFilterEditor.prototype.GetMultipleArgumentTemplate = function () {
    return [
        '<div class="form-row">',
            '<div class="form-col col-input col-input-value">',
                '<input class="input-argument-typing" type="text" />',
            '</div>',
            '<div class="form-col col-actions">',
                '<a class="icon icon-plus action-add"></a>',
                '<a class="icon icon-close action-remove"></a>',
                '<a class="icon icon-bin icon-bin-empty action-clear"></a>',
            '</div>',
            '<div class="form-col col-list">',
                '<div class="input-argument-list grid-custom-scroller"></div>',
            '</div>',
        '</div>'
    ].join('');
};
BaseFilterEditor.prototype.InitialMultipleArgumentUI = function (container) {
    var self = this;
    self.SetElementCssClass('filter-editor-multiple');
    var inputTyping = container.find('.input-argument-typing');

    // set value to ui
    self.IntialMultipleArgumentValues(self.Data.arguments());
    var gridOptions = self.GetListGridOptions(self.Data.arguments());
    self.$Grid = container.find('.input-argument-list')
        .kendoGrid(gridOptions)
        .data(enumHandlers.KENDOUITYPE.GRID);

    // fixed IE issue
    WC.HtmlHelper.EnableMouseScrolling(self.$Grid);

    // events
    inputTyping.off('keydown').on('keydown', jQuery.proxy(self.InputTypingKeyDown, self, inputTyping));
    inputTyping.off('paste').on('paste', jQuery.proxy(self.PasteListText, self));
    container.find('.action-add').off('click').on('click', jQuery.proxy(self.AddMultipleArgumentValue, self, inputTyping));
    container.find('.action-remove').off('click').on('click', jQuery.proxy(self.RemoveMultipleArgumentValues, self));
    container.find('.action-clear').off('click').on('click', jQuery.proxy(self.ClearMultipleArgumentValues, self));
};
BaseFilterEditor.prototype.IntialMultipleArgumentValues = function (args) {
    var self = this;
    args = args.distinct(function (argument) { return argument.value; });
    self.Data.arguments(args);
};
BaseFilterEditor.prototype.GetListGridOptions = function (data) {
    var self = this;
    return {
        height: 130,
        scrollable: {
            virtual: true
        },
        dataSource: self.GetListGridDataSource(data),
        selectable: 'multiple, row',
        columns: [
            {
                field: 'value',
                title: '',
                headerTemplate: '',
                template: '#: value #'
            }
        ],
        dataBound: jQuery.proxy(self.SetListStateButtons, self),
        change: jQuery.proxy(self.SetListStateButtons, self)
    };
};
BaseFilterEditor.prototype.GetListGridDataSource = function (data) {
    return new kendo.data.DataSource({
        data: data,
        pageSize: 50
    });
};
BaseFilterEditor.prototype.SetListStateButtons = function (e) {
    var self = this;
    var container = self.$Element.find('.filter-editor-arguments');
    if (e.sender.dataSource.data().length) {
        container.find('.action-clear').removeClass('disabled');
    }
    else {
        container.find('.action-clear').addClass('disabled');
    }

    if (e.sender.select().length) {
        container.find('.action-remove').removeClass('disabled');
    }
    else {
        container.find('.action-remove').addClass('disabled');
    }
};
BaseFilterEditor.prototype.GetInputTypingValue = function (inputTyping) {
    var self = this;
    return self.GetInputArgumentValue(inputTyping);
};
BaseFilterEditor.prototype.InputTypingKeyDown = function (inputTyping, e) {
    var self = this;
    inputTyping.removeClass('required');
    if (e.which === 13) {
        inputTyping.get(0).blur();
        self.AddMultipleArgumentValue(inputTyping);
    }
};
BaseFilterEditor.prototype.PasteListText = function (e) {
    // from paste event
    var self = this;

    WC.HtmlHelper.GetPastedText(e)
        .done(function (text) {
            var list = text.split('\n');
            setTimeout(function () {
                self.AddMultipleArgumentValues(self.TransformPastingList(list));
                jQuery(e.currentTarget).val('');
            }, 1);
        });
};
BaseFilterEditor.prototype.TransformPastingList = function (list) {
    return jQuery.map(list, function (data) { return jQuery.trim(data); });
};
BaseFilterEditor.prototype.AddMultipleArgumentValue = function (inputTyping) {
    // click action-add or enter key
    var self = this;
    var value = self.GetInputTypingValue(inputTyping);
    self.AddMultipleArgumentValues([value]);
};
BaseFilterEditor.prototype.AddMultipleArgumentValues = function (values) {
    var self = this;
    var currentValues = self.$Grid.dataSource.data();
    var args = self.GetAddingMultipleArguments(currentValues, values);
    var inputTyping = self.$Element.find('.input-argument-typing');

    // update to grid & model
    if (currentValues.length !== args.length) {
        self.$Grid.unbind('dataBound');
        self.$Grid.setDataSource(self.GetListGridDataSource(args));
        self.$Grid.bind('dataBound', jQuery.proxy(self.SetListStateButtons, self));
        self.$Grid.trigger('dataBound');
        self.$Grid.virtualScrollable.verticalScrollbar.scrollTop(self.$Grid.virtualScrollable.itemHeight * args.length);
        self.Data.arguments(args);
        inputTyping.val('').removeClass('required');
    }
    else if (inputTyping.val()) {
        inputTyping.addClass('required');
    }
    inputTyping.focus();
};
BaseFilterEditor.prototype.GetAddingMultipleArguments = function (currentValues, values) {
    var self = this;
    var duplicateValues = {};
    var args = [];

    // collect currect value for checking a duplcating values
    jQuery.each(currentValues, function (index, currentValue) {
        duplicateValues[currentValue.value] = true;
        args.push(self.GetObjectArgumentValue(currentValue.value));
    });

    // get valid values
    jQuery.each(values, function (index, value) {
        if (!duplicateValues[value] && self.IsValidArgumentValue(value)) {
            // add to newData if it's new
            duplicateValues[value] = true;
            args.push(self.GetObjectArgumentValue(value));
        }
    });
    return args;
};
BaseFilterEditor.prototype.RemoveMultipleArgumentValues = function () {
    // click action-remove
    var self = this;
    var items = self.$Grid.select();
    if (!items.length)
        return;

    // remove selecting rows
    self.$Grid.unbind('dataBound');
    items.each(function () {
        self.$Grid.removeRow(jQuery(this));
    });
    self.$Grid.bind('dataBound', jQuery.proxy(self.SetListStateButtons, self));
    self.$Grid.trigger('dataBound');

    // set buttons status
    if (self.$Grid.dataSource.data().length) {
        self.$Grid.select(self.$Grid.content.find('tr:first'));
    }

    // update arguments
    var args = jQuery.map(self.$Grid.dataSource.data(), function (data) {
        return self.GetObjectArgumentValue(data.value);
    });
    self.Data.arguments(args);
};
BaseFilterEditor.prototype.ClearMultipleArgumentValues = function () {
    // click action-clear
    var self = this;

    self.$Grid.setDataSource(self.GetListGridDataSource([]));
    self.Data.arguments([]);
};

// clean up
BaseFilterEditor.prototype.Destroy = function () {
    var self = this;
    self.DestroyOperatorDropdown();
    self.DestroyArgumentsUI();
};
BaseFilterEditor.prototype.DestroyOperatorDropdown = function () {
    var self = this;
    WC.HtmlHelper.DestroyDropdownList(self.$Element.find('.query-operator[data-role="dropdownlist"]'));
};
BaseFilterEditor.prototype.DestroyArgumentsUI = function () {
    var self = this;
    self.$Element.find('.filter-editor-arguments [data-role="dropdownlist"]').each(function (index, element) {
        WC.HtmlHelper.DestroyDropdownList(element);
    });
};

// compare field
BaseFilterEditor.prototype.IsCompareField = function (stepArguments) {
    return stepArguments[0] && stepArguments[0].argument_type === enumHandlers.FILTERARGUMENTTYPE.FIELD;
};
BaseFilterEditor.prototype.ShowCompareFieldPopup = function () {
    var self = this;
    var target = self.GetCompareFieldTarget().toLowerCase();
    var sender = {
        FilterFor: self.Handler.FilterFor,
        GetData: self.Handler.GetData,
        SetCompareFieldFilter: jQuery.proxy(self.SetCompareField, self),
        CompareInfo: {
            Index: self.Handler.Data.indexOf(self.Data)
        }
    };
    self.Handler.InitialAddFilterOptions();
    fieldsChooserHandler.ShowPopup(fieldsChooserHandler.USETYPE.ADDFILTER, target, sender);
};
BaseFilterEditor.prototype.GetCompareFieldTarget = function () {
    return '';
};
BaseFilterEditor.prototype.SetCompareField = function (field) {
    var self = this;
    modelFieldsHandler.SetFields([field], self.Handler.ModelUri);
    self.Data.arguments([self.GetObjectArgumentField(field.id)]);
    self.UpdateArgumentFieldUI(true);
};
BaseFilterEditor.prototype.RemoveCompareField = function () {
    var self = this;
    self.Data.arguments([]);
    self.UpdateArgumentFieldUI(false);
};
BaseFilterEditor.prototype.UpdateArgumentFieldUI = function (visible) {
    var self = this;
    var container = self.$Element.find('.filter-editor-arguments');
    if (visible) {
        // show input field
        var text = self.GetCompareFieldText(self.Data.arguments()[0]);
        container.find('.col-input-field').removeClass('hidden');
        container.find('.input-argument-field-value').text(text);

        // hide input value
        container.find('.col-input-value').addClass('hidden');
        container.find('.input-argument-value').val('');
    }
    else {
        // hide input field
        container.find('.col-input-field').addClass('hidden');
        container.find('.input-argument-field-value').text('');

        // show input value
        container.find('.col-input-value').removeClass('hidden');
        container.find('.input-argument-value').val('');
    }
};
BaseFilterEditor.prototype.GetCompareFieldText = function (argument) {
    var self = this;
    return argument && argument.field ? WC.WidgetFilterHelper.GetFilterFieldName(argument.field, self.Handler.ModelUri) : '';
};