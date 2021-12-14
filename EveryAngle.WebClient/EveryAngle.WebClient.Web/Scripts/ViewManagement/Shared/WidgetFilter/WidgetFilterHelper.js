WC.WidgetFilterHelper = new WidgetFilterHelper();

function WidgetFilterHelper() {
    "use strict";

    var self = this;

    self.FILTERFOR = {
        ANGLE: 'Angle',
        DISPLAY: 'Display',
        DASHBOARD: 'Dashboard'
    };
    self.NoAgruments = [
        enumHandlers.OPERATOR.HASVALUE.Value,
        enumHandlers.OPERATOR.HASNOVALUE.Value
    ];
    self.EqualArguments = [
        enumHandlers.OPERATOR.EQUALTO.Value,
        enumHandlers.OPERATOR.NOTEQUALTO.Value,
        enumHandlers.OPERATOR.SMALLERTHAN.Value,
        enumHandlers.OPERATOR.GREATERTHAN.Value,
        enumHandlers.OPERATOR.SMALLERTHANOREQUALTO.Value,
        enumHandlers.OPERATOR.GREATERTHANOREQUALTO.Value,
        enumHandlers.OPERATOR.BEFORE.Value,
        enumHandlers.OPERATOR.AFTER.Value,
        enumHandlers.OPERATOR.BEFOREORON.Value,
        enumHandlers.OPERATOR.AFTERORON.Value,
        enumHandlers.OPERATOR.AFTEROREQUAL.Value
    ];
    self.BetweenArguments = [
        enumHandlers.OPERATOR.BETWEEN.Value,
        enumHandlers.OPERATOR.NOTBETWEEN.Value
    ];

    self.ListArguments = [
        enumHandlers.OPERATOR.INLIST.Value,
        enumHandlers.OPERATOR.NOTINLIST.Value
    ];
    self.ContainArguments = [
        enumHandlers.OPERATOR.CONTAIN.Value,
        enumHandlers.OPERATOR.NOTCONTAIN.Value,
        enumHandlers.OPERATOR.STARTWITH.Value,
        enumHandlers.OPERATOR.NOTSTARTWITH.Value,
        enumHandlers.OPERATOR.ENDON.Value,
        enumHandlers.OPERATOR.NOTENDON.Value,
        enumHandlers.OPERATOR.MATCHPATTERN.Value,
        enumHandlers.OPERATOR.NOTMATCHPATTERN.Value
    ];

    self.IsEqualGroupOperator = function (operator) {
        return jQuery.inArray(operator, enumHandlers.EqualGroupOperator) !== -1;
    };
    self.IsListGroupOperator = function (operator) {
        return jQuery.inArray(operator, enumHandlers.ListGroupOperator) !== -1;
    };
    self.IsBetweenGroupOperator = function (operator) {
        return jQuery.inArray(operator, enumHandlers.BetweenGroupOperator) !== -1;
    };

    self.IsFilterOrJumpQueryStep = function (queryStepType) {
        return queryStepType === enumHandlers.FILTERTYPE.FILTER || queryStepType === enumHandlers.FILTERTYPE.FOLLOWUP;
    };

    self.IsBetweenArgumentComparable = function (operator, argumentValues) {
        argumentValues = WC.Utility.ToArray(argumentValues);
        return self.IsBetweenGroupOperator(operator)
            && argumentValues.length === 2
            && !argumentValues.hasObject('argument_type', enumHandlers.FILTERARGUMENTTYPE.FIELD)
            && argumentValues[0].argument_type === argumentValues[1].argument_type;
    };

    self.AdjustFilterArguments = function (operator, argumentValues, modelUri) {
        if (self.IsBetweenArgumentComparable(operator, argumentValues)) {
            var value1 = self.GetArgumentValue(argumentValues[0], modelUri);
            var value2 = self.GetArgumentValue(argumentValues[1], modelUri);
            if (value1 > value2) {
                var tempValue = argumentValues[0];
                argumentValues[0] = argumentValues[1];
                argumentValues[1] = tempValue;

                // transfer included_end_date
                if (argumentValues[1].argument_type === enumHandlers.FILTERARGUMENTTYPE.VALUE && argumentValues[0].included_end_date) {
                    argumentValues[1].included_end_date = true;
                }
                delete argumentValues[0].included_end_date;
            }
        }
        return argumentValues;
    };

    self.GetDefaultFilterOperator = function (fieldType) {
        var defaultFilterOperator;
        switch (fieldType) {
            case enumHandlers.FIELDTYPE.BOOLEAN:
                defaultFilterOperator = enumHandlers.OPERATOR.EQUALTO;
                break;

            case enumHandlers.FIELDTYPE.ENUM:
                defaultFilterOperator = enumHandlers.OPERATOR.INLIST;
                break;

            case enumHandlers.FIELDTYPE.TEXT:
                defaultFilterOperator = enumHandlers.OPERATOR.CONTAIN;
                break;

            case enumHandlers.FIELDTYPE.CURRENCY:
            case enumHandlers.FIELDTYPE.NUMBER:
            case enumHandlers.FIELDTYPE.DOUBLE:
            case enumHandlers.FIELDTYPE.INTEGER:
            case enumHandlers.FIELDTYPE.PERCENTAGE:
            case enumHandlers.FIELDTYPE.PERIOD: /* M4-10744: Change 'peroid' operator to use same as 'integer' operator */
            case enumHandlers.FIELDTYPE.TIMESPAN:
                defaultFilterOperator = enumHandlers.OPERATOR.GREATERTHAN;
                break;

            case enumHandlers.FIELDTYPE.DATE:
            case enumHandlers.FIELDTYPE.DATETIME:
            case enumHandlers.FIELDTYPE.TIME:
                defaultFilterOperator = enumHandlers.OPERATOR.AFTER;
                break;

            default:
                defaultFilterOperator = enumHandlers.OPERATOR.HASVALUE;
                break;
        }
        return defaultFilterOperator;
    };

    self.GetDefaultFilterOperatorArguments = function (fieldType) {
        var defaultFilterArguments = [];
        switch (fieldType) {
            case enumHandlers.FIELDTYPE.BOOLEAN:
                defaultFilterArguments = [self.ArgumentObject(true, enumHandlers.FILTERARGUMENTTYPE.VALUE)];
                break;

            case enumHandlers.FIELDTYPE.CURRENCY:
            case enumHandlers.FIELDTYPE.NUMBER:
            case enumHandlers.FIELDTYPE.PERCENTAGE:
                defaultFilterArguments = [self.ArgumentObject(0, enumHandlers.FILTERARGUMENTTYPE.VALUE)];
                break;

            case enumHandlers.FIELDTYPE.DATE:
            case enumHandlers.FIELDTYPE.DATETIME:
                var unixtime = self.ConvertDatePickerToUnixTime(kendo.date.today());
                defaultFilterArguments = [self.ArgumentObject(unixtime, enumHandlers.FILTERARGUMENTTYPE.VALUE)];
                break;

            default:
                defaultFilterArguments = [];
        }
        return defaultFilterArguments;
    };

    self.ConvertOperatorToCriteria = function (operator, fieldType, isExtraOperator) {
        var outResult = null;
        var isDateTime = WC.FormatHelper.IsDateOrDateTime(fieldType) || fieldType === enumHandlers.FIELDTYPE.TIME;

        switch (operator) {
            case enumHandlers.OPERATOR.HASVALUE.Value:
                outResult = enumHandlers.OPERATOR.HASVALUE.Text;
                break;
            case enumHandlers.OPERATOR.HASNOVALUE.Value:
                outResult = enumHandlers.OPERATOR.HASNOVALUE.Text;
                break;
            case enumHandlers.OPERATOR.SMALLERTHAN.Value:
                outResult = isDateTime ? Localization.OperatorIsBefore : enumHandlers.OPERATOR.SMALLERTHAN.Text;
                break;
            case enumHandlers.OPERATOR.GREATERTHAN.Value:
                outResult = isDateTime ? Localization.OperatorIsAfter : enumHandlers.OPERATOR.GREATERTHAN.Text;
                break;
            case enumHandlers.OPERATOR.SMALLERTHANOREQUALTO.Value:
                outResult = isDateTime ? enumHandlers.OPERATOR.BEFOREORON.Text : enumHandlers.OPERATOR.SMALLERTHANOREQUALTO.Text;
                break;
            case enumHandlers.OPERATOR.GREATERTHANOREQUALTO.Value:
                outResult = isDateTime ? enumHandlers.OPERATOR.AFTERORON.Text : enumHandlers.OPERATOR.GREATERTHANOREQUALTO.Text;
                break;
            case enumHandlers.OPERATOR.EQUALTO.Value:
                outResult = isExtraOperator ? enumHandlers.OPERATOR.ISIN.Text : enumHandlers.OPERATOR.EQUALTO.Text;
                break;
            case enumHandlers.OPERATOR.NOTEQUALTO.Value:
                outResult = isExtraOperator ? enumHandlers.OPERATOR.ISNOTIN.Text : enumHandlers.OPERATOR.NOTEQUALTO.Text;
                break;
            case enumHandlers.OPERATOR.BETWEEN.Value:
                outResult = enumHandlers.OPERATOR.BETWEEN.Text;
                break;
            case enumHandlers.OPERATOR.NOTBETWEEN.Value:
                outResult = enumHandlers.OPERATOR.NOTBETWEEN.Text;
                break;
            case enumHandlers.OPERATOR.INLIST.Value:
                outResult = enumHandlers.OPERATOR.INLIST.Text;
                break;
            case enumHandlers.OPERATOR.NOTINLIST.Value:
                outResult = enumHandlers.OPERATOR.NOTINLIST.Text;
                break;
            case enumHandlers.OPERATOR.CONTAIN.Value:
                outResult = fieldType === enumHandlers.FIELDTYPE.ENUM ? Localization.OperatorContainsSubstringEnum : enumHandlers.OPERATOR.CONTAIN.Text;
                break;
            case enumHandlers.OPERATOR.NOTCONTAIN.Value:
                outResult = enumHandlers.OPERATOR.NOTCONTAIN.Text;
                break;
            case enumHandlers.OPERATOR.STARTWITH.Value:
                outResult = fieldType === enumHandlers.FIELDTYPE.ENUM ? Localization.OperatorStartsWithSubstringEnum : enumHandlers.OPERATOR.STARTWITH.Text;
                break;
            case enumHandlers.OPERATOR.NOTSTARTWITH.Value:
                outResult = enumHandlers.OPERATOR.NOTSTARTWITH.Text;
                break;
            case enumHandlers.OPERATOR.ENDON.Value:
                outResult = enumHandlers.OPERATOR.ENDON.Text;
                break;
            case enumHandlers.OPERATOR.NOTENDON.Value:
                outResult = enumHandlers.OPERATOR.NOTENDON.Text;
                break;
            case enumHandlers.OPERATOR.MATCHPATTERN.Value:
                outResult = enumHandlers.OPERATOR.MATCHPATTERN.Text;
                break;
            default:
                break;
        }
        return outResult;
    };

    self.GetFieldTypeFormatter = function (field, formatterType, operator) {
        var formatter;
        if (WC.FormatHelper.IsNumberFieldType(formatterType)) {
            var decimals = WC.FormatHelper.IsSupportDecimal(formatterType) ? 20 : 0;
            formatter = new Formatter({ decimals: decimals, thousandseparator: true, prefix: null }, formatterType);
        }
        else if (formatterType === enumHandlers.FIELDTYPE.PERIOD) {
            formatter = new Formatter({ format: enumHandlers.TIMEFORMAT.DAY }, formatterType);
        }
        else if (formatterType === enumHandlers.FIELDTYPE.DATETIME) {
            formatter = new Formatter({ format: self.GetDateTimeFormat(true) }, formatterType);
        }
        else if (formatterType === enumHandlers.FIELDTYPE.TIME) {
            formatter = new Formatter({ format: self.GetTimeFormat() }, formatterType);
        }
        else if (formatterType === enumHandlers.FIELDTYPE.TIMESPAN) {
            formatter = new Formatter({ format: self.GetTimeSpanFormat() }, formatterType);
        }
        else if (formatterType === enumHandlers.FIELDTYPE.ENUM) {
            formatter = new Formatter({ format: enumHandlers.ENUMDISPLAYTYPE.SMART }, formatterType);
            var unuseFieldDomainOperators = [
                enumHandlers.OPERATOR.CONTAIN.Value,
                enumHandlers.OPERATOR.NOTCONTAIN.Value,
                enumHandlers.OPERATOR.STARTWITH.Value,
                enumHandlers.OPERATOR.NOTSTARTWITH.Value,
                enumHandlers.OPERATOR.MATCHPATTERN.Value
            ];
            if (jQuery.inArray(operator, unuseFieldDomainOperators) === -1) {
                var modelUri = modelFieldsHandler.GetModelUriFromData(field);
                formatter.domain = WC.FormatHelper.GetEnumDataFromFieldFormatter(new FieldFormatter(field, modelUri));
            }
        }
        else {
            formatter = WC.FormatHelper.GetUserDefaultFormatSettings(formatterType, true);
        }
        return formatter;
    };

    self.ConvertFilterToFilterText = function (queryStep, field) {
        var modelUri = modelFieldsHandler.GetModelUriFromData(field);
        var fieldType = field.fieldtype;
        var operator = queryStep.operator;
        var argumentValues = self.AdjustFilterArguments(operator, WC.Utility.ToArray(queryStep.arguments), modelUri);
        var isBetweenOperator = self.IsBetweenGroupOperator(operator);

        // connector
        var connectorText = self.GetFilterConnectorText(operator);

        // suffix
        var argumentTypeValues = argumentValues.findObjects('argument_type', enumHandlers.FILTERARGUMENTTYPE.VALUE);
        var suppressSuffix = isBetweenOperator && argumentTypeValues.length && argumentTypeValues.length !== argumentValues.length;
        var suffixText = !suppressSuffix ? self.GetFilterSuffixText(fieldType, operator, argumentValues) : '';

        // formatted text
        var formatterType = fieldType === enumHandlers.FIELDTYPE.PERIOD ? enumHandlers.FIELDTYPE.INTEGER : fieldType;
        var formatter = self.GetFieldTypeFormatter(field, formatterType, operator);
        var argumentTexts = self.GetArgumentTexts(formatter, argumentValues, modelUri);

        // format arguments
        var formatArgs = ['{2}{0}{1}{3}', argumentTexts.join(connectorText), suffixText, '', ''];
        if (self.IsListGroupOperator(operator) && argumentValues.length) {
            formatArgs[3] = '(';
            formatArgs[4] = ')';
        }

        return kendo.format.apply(kendo, formatArgs);
    };

    self.GetArgumentValue = function (arg, modelUri) {
        if (!arg)
            return null;

        if (arg.argument_type === enumHandlers.FILTERARGUMENTTYPE.FUNCTION) {
            var value = self.GetAdvanceArgumentValue(arg);
            var modelDate = self.GetDefaultModelDataDate(modelUri);
            var valueType = self.GetAdvanceArgumentType(arg);
            var date = self.GetLowerBoundDate(modelDate, valueType, value, enumHandlers.OPERATOR.EQUALTO.Value, modelUri);
            return self.ConvertDatePickerToUnixTime(date);
        }

        if (arg.argument_type === enumHandlers.FILTERARGUMENTTYPE.FIELD)
            return arg.field;

        return arg.value;
    };

    self.CanUseAdvanceArgument = function (fieldType, operator) {
        return WC.FormatHelper.IsDateOrDateTime(fieldType)
            && (jQuery.inArray(operator, self.EqualArguments) !== -1 || jQuery.inArray(operator, self.BetweenArguments) !== -1);
    };
    self.GetAdvanceArgumentType = function (argumentValue) {
        return jQuery.extend({ value: enumHandlers.FILTERPERIODTYPES[0].Value }, argumentValue.parameters.findObject('name', 'period_type')).value;
    };
    self.GetAdvanceArgumentValue = function (argumentValue) {
        return parseFloat(jQuery.extend({ value: 0 }, argumentValue.parameters.findObject('name', 'periods_to_add')).value);
    };

    self.GetFilterConnectorText = function (operator) {
        var isBetweenOperator = self.IsBetweenGroupOperator(operator);
        var isListOperator = self.IsListGroupOperator(operator);
        var connectorText;
        if (isListOperator)
            connectorText = ', ';
        else if (isBetweenOperator)
            connectorText = ' ' + Localization.And + ' ';
        else
            connectorText = '';
        return connectorText;
    };

    self.GetFilterSuffixText = function (fieldType, operator, args) {
        var suffixText = '';
        if (args.length) {
            var isListOperator = self.IsListGroupOperator(operator);
          if (fieldType === enumHandlers.FIELDTYPE.PERIOD && !isListOperator && args.hasObject('argument_type', enumHandlers.FILTERARGUMENTTYPE.VALUE))
                suffixText = ' ' + Captions.WidgetFilter_PeriodType_Days.toLowerCase();
        }
        return suffixText;
    };

    self.GetEnumText = function (id, shortName, longName, format) {
        shortName = (shortName || '').replace(/</g, '&lsaquo;').replace(/>/g, '&rsaquo;');
        longName = (longName || '').replace(/</g, '&lsaquo;').replace(/>/g, '&rsaquo;');
        return WC.FormatHelper.GetFormattedEnumValue(format || enumHandlers.ENUMDISPLAYTYPE.SMART, shortName, longName);
    };

    self.GetDateFormat = function () {
        return userSettingModel.GetUserDateTemplate();
    };

    self.GetTimeFormat = function () {
        var timeSettings = WC.FormatHelper.GetUserDefaultFormatSettings(enumHandlers.FIELDTYPE.TIME);
        timeSettings.second = 'ss';
        return WC.FormatHelper.GetFormatter(timeSettings);
    };

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

    self.GetDateTimeFormat = function (utcOutput) {
        return self.GetDateFormat() + ' ' + self.GetTimeFormat() + (utcOutput === true ? ' UTC' : '');
    };

    self.GetFilterFieldName = function (fieldId, modelUri) {
        var fieldMetaData = modelFieldsHandler.GetFieldById(fieldId, modelUri) || { id: fieldId };
        return userFriendlyNameHandler.GetFriendlyName(fieldMetaData, enumHandlers.FRIENDLYNAMEMODE.FIELDSOURCE_AND_LONGNAME);
    };

    self.GetFilterText = function (data, modelUri, hideFieldName) {
        if (data.step_type === enumHandlers.FILTERTYPE.FILTER) {
            var fieldMetaData = WC.Utility.IfNothing(modelFieldsHandler.GetFieldById(data.field, modelUri), { id: data.field });

            var fieldName = hideFieldName === true ? '' : self.GetFilterFieldName(data.field, modelUri);
            var isAdvanceArgument = self.CanUseAdvanceArgument(fieldMetaData.fieldtype, data.operator);
            var args = WC.Utility.ToArray(data.arguments);
            var argumentType = args[0] ? args[0].argument_type : null;
            var isExtraOperator = isAdvanceArgument && argumentType === enumHandlers.FILTERARGUMENTTYPE.FUNCTION;
            var operatorText = self.ConvertOperatorToCriteria(data.operator, fieldMetaData.fieldtype, isExtraOperator);
            var valueText = !fieldMetaData.uri ? '' : self.ConvertFilterToFilterText(data, fieldMetaData);

            return jQuery.trim(kendo.format('{0} {1} {2}', fieldName, operatorText, valueText));
        }
        else if (data.step_type === enumHandlers.FILTERTYPE.FOLLOWUP) {
            var followup = modelFollowupsHandler.GetFollowupById(data.followup, modelUri);
            return followup ? WC.Utility.IfNothing(followup.long_name, data.followup) : WC.Utility.IfNothing(data.followup, '');
        }
        return '';
    };

    self.ConvertFieldType = function (field) {
        var outResult = null;

        if (field.fieldtype === enumHandlers.FIELDTYPE.TEXT) {
            if (field.domain !== undefined && field.domain !== null) {
                outResult = enumHandlers.FIELDTYPE.ENUM;
            }
            else {
                outResult = field.fieldtype;
            }
        }
        else {
            outResult = field.fieldtype;
        }

        return outResult;
    };

    self.ConvertCriteriaToOperator = function (selectedCritetia) {
        var outResult = '';
        if (selectedCritetia === enumHandlers.OPERATOR.HASVALUE.Value
            || selectedCritetia === enumHandlers.CRITERIA.NOTEMPTY) {
            outResult = enumHandlers.OPERATOR.HASVALUE.Value;
        }
        else if (selectedCritetia === enumHandlers.OPERATOR.HASNOVALUE.Value
            || selectedCritetia === enumHandlers.CRITERIA.EMPTY) {
            outResult = enumHandlers.OPERATOR.HASNOVALUE.Value;
        }
        else if (selectedCritetia === enumHandlers.OPERATOR.EQUALTO.Value
            || selectedCritetia === enumHandlers.CRITERIA.EQUAL) {
            outResult = enumHandlers.OPERATOR.EQUALTO.Value;
        }
        else if (selectedCritetia === enumHandlers.OPERATOR.NOTEQUALTO.Value
            || selectedCritetia === enumHandlers.CRITERIA.NOTEQUAL) {
            outResult = enumHandlers.OPERATOR.NOTEQUALTO.Value;
        }
        else if (selectedCritetia === enumHandlers.OPERATOR.BEFORE.Value
            || selectedCritetia === enumHandlers.OPERATOR.SMALLERTHAN.Value
            || selectedCritetia === enumHandlers.CRITERIA.SMALLERTHAN) {
            outResult = enumHandlers.OPERATOR.SMALLERTHAN.Value;
        }
        else if (selectedCritetia === enumHandlers.OPERATOR.AFTER.Value
            || selectedCritetia === enumHandlers.OPERATOR.GREATERTHAN.Value
            || selectedCritetia === enumHandlers.CRITERIA.LARGERTHAN) {
            outResult = enumHandlers.OPERATOR.GREATERTHAN.Value;
        }
        else if (selectedCritetia === enumHandlers.OPERATOR.BEFOREORON.Value
            || selectedCritetia === enumHandlers.OPERATOR.SMALLERTHANOREQUALTO.Value
            || selectedCritetia === enumHandlers.OPERATOR.BEFOREORON.Value) {
            outResult = enumHandlers.OPERATOR.SMALLERTHANOREQUALTO.Value;
        }
        else if (selectedCritetia === enumHandlers.OPERATOR.AFTERORON.Value
            || selectedCritetia === enumHandlers.OPERATOR.GREATERTHANOREQUALTO.Value
            || selectedCritetia === enumHandlers.OPERATOR.AFTEROREQUAL.Value) {
            outResult = enumHandlers.OPERATOR.GREATERTHANOREQUALTO.Value;
        }
        else {
            outResult = selectedCritetia;
        }
        return outResult;
    };

    self.GetDefaultModelDataDate = function (modelUri) {
        var date;
        if (resultModel.Data() && resultModel.Data().original_modeldata_timestamp) {
            date = new Date(resultModel.Data().original_modeldata_timestamp);
        }
        else {
            var currentInstance = modelCurrentInstanceHandler.GetCurrentModelInstance(modelUri);
            if (currentInstance && currentInstance.modeldata_timestamp) {
                date = WC.DateHelper.UnixTimeToLocalDate(currentInstance.modeldata_timestamp);
            }
            else {
                date = kendo.date.today();
            }
        }

        return date;
    };

    self.IsValidArguments = function (arg) {
        return !WC.Utility.ToArray(arg).hasObject('valid', false);
    };

    self.GetInvalidCssClass = function (data) {
        var isInvalid = data.valid === false;
        if (data.step_type === enumHandlers.FILTERTYPE.FILTER
            && (isInvalid || !self.IsValidArguments(data.arguments)))
            return 'validWarning';
        else if (data.step_type === enumHandlers.FILTERTYPE.FOLLOWUP && isInvalid)
            return 'validError';
        else
            return '';
    };

    self.GetArgumentTexts = function (formatter, argumentObjects, modelUri) {
        var argumentValue = [];
        jQuery.each(argumentObjects, function (index, argumentObject) {
            if (!argumentObject)
                return;

            if (argumentObject.argument_type === enumHandlers.FILTERARGUMENTTYPE.FUNCTION)
                argumentValue.push(self.GetArgumentPeriodText(argumentObject.parameters));
            else if (argumentObject.argument_type === enumHandlers.FILTERARGUMENTTYPE.FIELD)
                argumentValue.push(self.GetFilterFieldName(argumentObject.field, modelUri));
            else
                argumentValue.push(WC.FormatHelper.GetFormattedValue(formatter, argumentObject.value));
        });

        return argumentValue;
    };

    self.GetArgumentPeriodText = function (parameters) {
        //value
        var periodValue = self.GetAdvanceArgumentValue({ parameters: parameters });
        var periodValueObject = enumHandlers.FILTERPERIODVALUES.findObject('Value', periodValue);
        var periodText;
        if (periodValueObject) {
            periodText = periodValueObject.Text;
        }
        else {
            var prefix = periodValue < 0 ? Captions.WidgetFilter_ArgumentPeriod_Last : Captions.WidgetFilter_ArgumentPeriod_Next;
            periodText = prefix + ' ' + Math.abs(periodValue);
        }

        // type
        var periodType = self.GetAdvanceArgumentType({ parameters: parameters });
        var periodTypeObject = enumHandlers.FILTERPERIODTYPES.findObject('Value', periodType);
        var periodTypeText = periodTypeObject ? periodTypeObject.Text : periodType;

        // set name
        return kendo.format('{0} {1}', periodText, periodTypeText).toLowerCase();
    };

    self.ArgumentObject = function (value, argumentType) {
        var argumentObject = {
            argument_type: argumentType
        };

        if (argumentType === enumHandlers.FILTERARGUMENTTYPE.VALUE)
            argumentObject.value = value;
        else
            argumentObject.field = value;

        return argumentObject;
    };
    self.ArgumentPeriodFunction = function (periodType, periodValue) {
        var argumentValue = {
            argument_type: enumHandlers.FILTERARGUMENTTYPE.FUNCTION,
            name: enumHandlers.FILTERARGUMENTFUNCTION.OFFSET_DATE,
            parameters: [{
                name: 'period_type',
                value: periodType
            }]
        };

        argumentValue.parameters.push({
            name: 'periods_to_add',
            value: WC.Utility.ToNumber(periodValue)
        });
        return argumentValue;
    };

    //------------------------------ New code -----------
    self.IsDateTimeWithRelative = function (fieldType, operator) {
        return WC.FormatHelper.IsDateOrDateTime(fieldType)
            && (operator === enumHandlers.OPERATOR.RELATIVEAFTER.Value || operator === enumHandlers.OPERATOR.RELATIVEBEFORE.Value);
    };
    self.ConvertUnixTimeToPicker = function (unixTime) {
        return WC.DateHelper.UnixTimeToUtcDate(unixTime);
    };

    self.ConvertDatePickerToUnixTime = function (localDate, hasTime) {
        return WC.DateHelper.LocalDateToUnixTime(localDate, hasTime);
    };

    self.ConvertTimePickerToUnixTime = function (localTime) {
        return WC.DateHelper.LocalTimeToUnixTime(localTime);
    };

}
