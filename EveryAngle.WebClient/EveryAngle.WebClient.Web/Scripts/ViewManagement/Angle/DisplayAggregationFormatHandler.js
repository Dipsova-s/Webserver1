function DisplayAggregationFormatHandler(handler, aggregation, field) {
    "use strict";

    var _self = {};
    _self.$container = jQuery();
    _self.aggregation = null;
    _self.values = {};

    var self = this;
    self.QueryDefinitionHandler = null;
    self.Aggregation = null;
    self.Field = null;
    self.Texts = ko.observable({
        HeaderAlias: '',
        HeaderOperator: '',
        HeaderUnit: Localization.FormatSettingDisplayUnits,
        HeaderDecimal: Localization.Decimal,
        HeaderFormat: Localization.Format,
        HeaderSecond: Captions.Label_FieldFormat_Seconds,
        HeaderThousandSeparator: Localization.UserSettingLabelThousandSeparator
    });
    self.Data = {
        alias: {
            value: ko.observable(null),
            valid: ko.observable(false),
            options: []
        },
        operator: {
            value: ko.observable(null),
            valid: ko.observable(false),
            options: []
        },
        unit: {
            value: ko.observable(null),
            valid: ko.observable(false),
            options: []
        },
        decimal: {
            value: ko.observable(null),
            valid: ko.observable(false),
            options: []
        },
        format: {
            value: ko.observable(null),
            valid: ko.observable(false),
            options: []
        },
        second: {
            value: ko.observable(null),
            valid: ko.observable(false),
            options: []
        },
        thousandseparator: {
            value: ko.observable(null),
            valid: ko.observable(false),
            options: []
        }
    };

    self.Initial = function (handler, aggregation, field) {
        _self.aggregation = aggregation;
        self.QueryDefinitionHandler = handler;
        self.Aggregation = new AggregationFieldViewModel(aggregation.data(), aggregation.model, aggregation.details(), aggregation.multi_lang_alias(), aggregation.is_selected());
        self.Field = field;
    };
    self.ShowPopup = function (title) {
        // show a popup
        var options = self.GetPopupOptions(title);
        popup.Show(options);
    };
    self.ClosePopup = function () {
        popup.Close('#PopupAggregationFormat');
    };
    self.GetPopupOptions = function (title) {
        return {
            element: '#PopupAggregationFormat',
            title: title,
            html: self.QueryDefinitionHandler.View.GetAggregationFormatTemplate(),
            className: 'aggregation-format-popup',
            scrollable: false,
            resizable: false,
            width: 350,
            height: 'auto',
            minHeight: 100,
            actions: ['Close'],
            buttons: [
                {
                    text: Localization.Ok,
                    isPrimary: true,
                    position: 'right',
                    className: 'disabled btn-apply',
                    click: self.Apply
                }
            ],
            open: self.ShowPopupCallback,
            close: popup.Destroy
        };
    };
    self.ShowPopupCallback = function (e) {
        _self.$container = e.sender.element;
        self.SetHeaderOperatorText(self.Aggregation);
        self.SetTexts(self.Texts());
        self.InitialData();
        self.InitialUI(_self.$container);
        WC.HtmlHelper.ApplyKnockout(self, _self.$container);
    };
    self.SetHeaderOperatorText = function (aggregation) {
        self.Texts().HeaderOperator = aggregation.area() === AggregationFieldViewModel.Area.Data
            ? Localization.Aggregation
            : Localization.Bucket;
    };
    self.SetTexts = jQuery.noop;
    self.InitialData = function () {
        // data & values
        self.SetData(self.Aggregation);
        self.UpdateValues(self.Aggregation);

        // alias
        var alias = self.QueryDefinitionHandler.GetAggregationName(self.Aggregation);
        self.Data.alias.value(alias);

        // thousandseparator
        self.Data.thousandseparator.value(self.GetThousandSeparatorValue(self.Aggregation.details()));
    };
    self.InitialUI = function (container) {
        // others
        self.UpdateUI(container);

        // add subscribers
        self.AddSubscribers();
    };
    self.AddSubscribers = function () {
        jQuery.each(self.Data, function (id, model) {
            _self.values[id] = model.value();
            model.value.subscribe(self.HasChanged);
        });
    };
    self.HasChanged = function () {
        var hasChanged = false;
        var button = _self.$container.closest('.k-window').find('.btn-apply').addClass('disabled');
        jQuery.each(self.Data, function (id, model) {
            if (model.value() !== _self.values[id]) {
                hasChanged = true;
                button.removeClass('disabled');
                return false;
            }
        });
        return hasChanged;
    };
    self.UpdateUI = function (container) {
        // operators
        self.CreateDropdown(container.find('.input-operator-value:last'), self.Data.operator, self.OperatorChanged);

        // unit
        self.CreateDropdown(container.find('.input-unit-value:last'), self.Data.unit, self.UnitChanged);

        // decimal
        self.CreateDropdown(container.find('.input-decimal-value:last'), self.Data.decimal, self.DecimalChanged);

        // format
        self.CreateDropdown(container.find('.input-format-value:last'), self.Data.format, self.FormatChanged);

        // second
        self.CreateDropdown(container.find('.input-second-value:last'), self.Data.second, self.SecondChanged);
    };
    self.CreateDropdown = function (element, model, onChanged) {
        var dropdown = WC.HtmlHelper.DropdownList(element, model.options, {
            change: onChanged
        });
        dropdown.value(model.value());
    };
    self.OperatorChanged = function (e) {
        var value = e.sender.value();
        var updateAlias = self.Data.alias.value() === self.QueryDefinitionHandler.GetAggregationName(self.Aggregation);
        self.Aggregation.operator(value);
        self.Aggregation.field(kendo.format('{0}_{1}', value, self.Aggregation.source_field));
        self.SetData(self.Aggregation);
        self.UpdateValues(self.Aggregation);
        if (updateAlias)
            self.Data.alias.value(self.QueryDefinitionHandler.GetAggregationName(self.Aggregation));
        self.UpdateUI(_self.$container);
    };
    self.UnitChanged = function (e) {
        var value = e.sender.value();
        var finalValue = dataTypeModel.GetCorrectPrefix(value, self.Aggregation.operator());
        self.SetDetails(enumHandlers.FIELDDETAILPROPERTIES.PREFIX, value, finalValue);
        self.UpdateValues(self.Aggregation);
    };
    self.DecimalChanged = function (e) {
        var value = e.sender.value();
        var finalValue = parseInt(value);
        self.SetDetails(enumHandlers.FIELDDETAILPROPERTIES.DECIMALS, value, finalValue);
        self.UpdateValues(self.Aggregation);
    };
    self.FormatChanged = function (e) {
        var value = e.sender.value();
        self.SetDetails(enumHandlers.FIELDDETAILPROPERTIES.FORMAT, value, value);
        self.UpdateValues(self.Aggregation);
    };
    self.SecondChanged = function (e) {
        var value = e.sender.value();
        self.SetDetails(enumHandlers.FIELDDETAILPROPERTIES.SECOND, value, value);
        self.UpdateValues(self.Aggregation);
    };
    self.SetDetails = function (property, value, finalValue) {
        var details = self.Aggregation.details();
        if (value !== enumHandlers.FIELDSETTING.USEDEFAULT && value !== null)
            details[property] = finalValue;
        else
            delete details[property];
        self.Aggregation.details(details);
    };
    self.ResetData = function () {
        jQuery.each(self.Data, function (_name, setting) {
            setting.valid(false);
            setting.options = [];
        });
    };
    self.SetData = function (aggregation) {
        // reset
        self.ResetData();
        
        var dataType = self.QueryDefinitionHandler.GetAggregationDataType(aggregation, self.Field.fieldtype);
        if (!aggregation.is_count_field()) {
            // alias
            self.Data.alias.valid(true);

            // operator
            if (aggregation.area() === AggregationFieldViewModel.Area.Data) {
                jQuery.each(enumHandlers.AGGREGATION, function (key, value) {
                    self.AddOperatorOption(value, self.Field.fieldtype, self.Data.operator.options);
                });
            }
            else {
                // if not aggreagation field
                self.Data.operator.options = self.GetOperatorsByType(dataType);
            }
            self.Data.operator.valid(true);
        }

        // unit
        if (WC.FormatHelper.IsNumberFieldType(dataType)) {
            self.Data.unit.valid(true);
            self.Data.unit.options = dataTypeModel.GetDisplayPrefixByBucket(aggregation.operator());
        }

        // decimals
        if (WC.FormatHelper.IsSupportDecimal(dataType)) {
            self.Data.decimal.valid(true);
            self.Data.decimal.options = self.AddUseDefaultOption(ko.toJS(enumHandlers.LISTFORMATDECIMALS));
        }

        // format
        if (dataTypeModel.IsEnumDataType(aggregation.operator(), dataType)) {
            self.Data.format.valid(true);
            self.Data.format.options = self.AddUseDefaultOption(ko.toJS(userSettingModel.Enums()));
        }

        // seconds
        if (WC.FormatHelper.IsSupportSeconds(dataType)) {
            self.Data.second.valid(true);
            self.Data.second.options = self.AddUseDefaultOption(ko.toJS(enumHandlers.TIMESECONDSFORMATLIST));
        }

        // thousandseparator
        if (WC.FormatHelper.IsSupportThousandSeparator(dataType)) {
            self.Data.thousandseparator.valid(true);
        }
    };
    self.UpdateValues = function (aggregation) {
        var details = aggregation.details();

        // operator
        self.Data.operator.value(aggregation.operator());

        // unit
        var prefix = userSettingsPanelHandler.GetPrefixDropdownValue(details[enumHandlers.FIELDDETAILPROPERTIES.PREFIX]);
        prefix = dataTypeModel.GetCorrectPrefix(prefix, aggregation.operator());
        self.Data.unit.value(prefix);

        // decimal
        var decimals = userSettingsPanelHandler.GetDecimalDropdownValue(details[enumHandlers.FIELDDETAILPROPERTIES.DECIMALS]);
        self.Data.decimal.value(decimals);  

        // format
        var format = userSettingsPanelHandler.GetEnumDropdownValue(details[enumHandlers.FIELDDETAILPROPERTIES.FORMAT]);
        self.Data.format.value(format);

        // second
        var seconds = userSettingsPanelHandler.GetSecondDropdownValue(details[enumHandlers.FIELDDETAILPROPERTIES.SECOND]);
        self.Data.second.value(seconds);
    };
    self.GetOperatorsByType = function (fieldType) {
        var options = [];
        var i, formatter;
        switch (fieldType) {
            case enumHandlers.FIELDTYPE.BOOLEAN:
                options = [
                    { id: 'individual', name: Localization.Pivot_Bucket_Individual }
                ];
                break;
            case enumHandlers.FIELDTYPE.TEXT:
                options = [
                    { id: 'individual', name: Localization.Pivot_Bucket_Individual },
                    { id: 'left1', name: Localization.Pivot_Bucket_FirstCharacter }
                ];
                for (i = 2; i <= 20; i++) {
                    options.push({ id: 'left' + i, name: kendo.format(Localization.Pivot_Bucket_FirstCharacters, i) });
                }
                options.push({ id: 'right1', name: Localization.Pivot_Bucket_LastCharacter });
                for (i = 2; i <= 20; i++) {
                    options.push({ id: 'right' + i, name: kendo.format(Localization.Pivot_Bucket_LastCharacters, i) });
                }
                break;
            case enumHandlers.FIELDTYPE.ENUM:
                options = [
                    { id: 'individual', name: Localization.Pivot_Bucket_Individual },
                    { id: 'left1', name: Localization.Pivot_Bucket_FirstCharacter }
                ];
                for (i = 2; i <= 20; i++) {
                    options.push({ id: 'left' + i, name: kendo.format(Localization.Pivot_Bucket_FirstCharacters, i) });
                }
                break;
            case enumHandlers.FIELDTYPE.DOUBLE:
            case enumHandlers.FIELDTYPE.CURRENCY:
            case enumHandlers.FIELDTYPE.PERCENTAGE:
                for (i = 3; i >= 1; i--) {
                    options.push({ id: 'power10_min' + i, name: kendo.toString(1 / Math.pow(10, i), 'n' + i) });
                }
                options.push({ id: 'power10_0', name: '1' });
                formatter = new Formatter({ prefix: null, thousandseparator: true }, enumHandlers.FIELDTYPE.INTEGER);
                for (i = 1; i <= 9; i++) {
                    options.push({ id: 'power10_' + i, name: WC.FormatHelper.GetFormattedValue(formatter, Math.pow(10, i)) });
                }
                break;
            case enumHandlers.FIELDTYPE.NUMBER:
            case enumHandlers.FIELDTYPE.INTEGER:
                options.push({ id: 'individual', name: '1' });
                formatter = new Formatter({ prefix: null, thousandseparator: true }, enumHandlers.FIELDTYPE.INTEGER);
                for (i = 1; i <= 9; i++) {
                    options.push({ id: 'power10_' + i, name: WC.FormatHelper.GetFormattedValue(formatter, Math.pow(10, i)) });
                }
                break;
            case enumHandlers.FIELDTYPE.DATE:
            case enumHandlers.FIELDTYPE.DATETIME:
            case enumHandlers.FIELDTYPE.PERIOD:
                options = [
                    { id: 'day', name: Localization.Pivot_Bucket_PerDay },
                    { id: 'week', name: Localization.Pivot_Bucket_PerWeek },
                    { id: 'month', name: Localization.Pivot_Bucket_PerMonth },
                    { id: 'quarter', name: Localization.Pivot_Bucket_PerQuarter },
                    { id: 'semester', name: Localization.Pivot_Bucket_PerSemester },
                    { id: 'year', name: Localization.Pivot_Bucket_PerYear }
                ];
                break;
            case enumHandlers.FIELDTYPE.TIMESPAN:
                options = [
                    { id: 'hour', name: Localization.Pivot_Bucket_PerHour },
                    { id: 'day', name: Localization.Pivot_Bucket_PerDay },
                    { id: 'week', name: Localization.Pivot_Bucket_PerWeek },
                    { id: 'month', name: Localization.Pivot_Bucket_PerMonth },
                    { id: 'quarter', name: Localization.Pivot_Bucket_PerQuarter },
                    { id: 'semester', name: Localization.Pivot_Bucket_PerSemester },
                    { id: 'year', name: Localization.Pivot_Bucket_PerYear }
                ];
                break;
            case enumHandlers.FIELDTYPE.TIME:
                options = [
                    { id: 'hour', name: Localization.Pivot_Bucket_PerHour }
                ];
                break;
            default:
                break;
        }
        return options;
    };
    self.AddOperatorOption = function (aggregation, fieldType, options) {
        // do not add count
        // do not add option 'SUM' if fieldtype is 'TIME'
        var isCountAggr = aggregation.Value === enumHandlers.AGGREGATION.COUNT.Value;
        var isSumAggr = aggregation.Value === enumHandlers.AGGREGATION.SUM.Value;
        var isTimeFieldType = fieldType === enumHandlers.FIELDTYPE.TIME;
        var isValidTimeAggr = isTimeFieldType && !isSumAggr;
        if (!isCountAggr && (isValidTimeAggr || !isTimeFieldType)) {
            options.push({ id: aggregation.Value, name: aggregation.Text });
        }
    };
    self.AddUseDefaultOption = function (formatList) {
        formatList.splice(0, 0, {
            name: Localization.FormatSetting_UseDefault,
            id: enumHandlers.FIELDSETTING.USEDEFAULT
        });
        return formatList;
    };
    self.IsAliasPlaceholder = function () {
        return self.Data.alias.value() === self.QueryDefinitionHandler.GetAggregationDefaultName(self.Aggregation);
    };
    self.GetMultiLangAlias = function () {
        var multiLangAlias = ko.toJS(_self.aggregation.multi_lang_alias());
        var alias = self.IsAliasPlaceholder() ? '' : self.Data.alias.value();
        var language = userSettingModel.GetByName(enumHandlers.USERSETTINGS.DEFAULT_LANGUAGES).toLowerCase();

        // remove
        var index = multiLangAlias.indexOfObject('lang', language);
        if (index !== -1)
            multiLangAlias.splice(index, 1);

        // add
        if (alias)
            multiLangAlias.push({ lang: language, text: alias });

        return multiLangAlias;
    };
    self.GetThousandSeparatorValue = function (details) {
        return typeof details[enumHandlers.FIELDDETAILPROPERTIES.THOUSANDSEPARATE] === 'boolean'
            ? details[enumHandlers.FIELDDETAILPROPERTIES.THOUSANDSEPARATE]
            : null;
    };
    self.Apply = function () {
        if (!self.HasChanged())
            return;

        self.SubmitData();
        self.ApplyCallback();
        self.ClosePopup();
    };
    self.ApplyCallback = jQuery.noop;
    self.SubmitData = function () {
        // alias
        var alias = self.GetMultiLangAlias();

        // thousandseparator
        var thousandseparator = self.Data.thousandseparator.value();
        self.SetDetails(enumHandlers.FIELDDETAILPROPERTIES.THOUSANDSEPARATE, thousandseparator, thousandseparator);

        // remove unnecessary
        var mappers = {};
        mappers['unit'] = enumHandlers.FIELDDETAILPROPERTIES.PREFIX;
        mappers['decimal'] = enumHandlers.FIELDDETAILPROPERTIES.DECIMALS;
        mappers['format'] = enumHandlers.FIELDDETAILPROPERTIES.FORMAT;
        mappers['second'] = enumHandlers.FIELDDETAILPROPERTIES.SECOND;
        mappers['thousandseparator'] = enumHandlers.FIELDDETAILPROPERTIES.THOUSANDSEPARATE;
        var details = self.Aggregation.details();
        jQuery.each(mappers, function (key, name) {
            if (!self.Data[key].valid())
                delete details[name];
        });
        
        // update to model
        _self.aggregation.operator(self.Aggregation.operator());
        _self.aggregation.field(self.Aggregation.field());
        _self.aggregation.multi_lang_alias(alias);
        _self.aggregation.details(details);
    };

    // constructor
    self.Initial(handler, aggregation, field);
}