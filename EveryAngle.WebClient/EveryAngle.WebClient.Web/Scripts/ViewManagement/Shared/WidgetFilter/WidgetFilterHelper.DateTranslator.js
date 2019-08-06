(function (helper) {

    helper.GetBaseDate = function (date, argValueType, modelUri) {
        // get base date
        if (argValueType === enumHandlers.FILTERPERIODTYPE.DAY) {
            // do nothing
        }
        else if (argValueType === enumHandlers.FILTERPERIODTYPE.WEEK) {
            var firstDayOfWeek = WC.DateHelper.GetFirstDayOfWeek(modelUri);

            // start of week
            var mDifference = date.getDay() - firstDayOfWeek;
            if (mDifference < 0)
                mDifference += 7;

            date.setDate(date.getDate() - mDifference);
        }
        else {
            date.setDate(1);
            if (argValueType === enumHandlers.FILTERPERIODTYPE.QUARTER)
                date.setMonth(parseInt(date.getMonth() / 3) * 3);
            else if (argValueType === enumHandlers.FILTERPERIODTYPE.TRIMESTER)
                date.setMonth(parseInt(date.getMonth() / 4) * 4);
            else if (argValueType === enumHandlers.FILTERPERIODTYPE.SEMESTER)
                date.setMonth(parseInt(date.getMonth() / 6) * 6);
            else if (argValueType === enumHandlers.FILTERPERIODTYPE.YEAR)
                date.setMonth(0);
        }

        // set min time
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);

        return date;
    };

    helper.GetAddedDate = function (date, argValueType, argValueAdd) {
        if (argValueType === enumHandlers.FILTERPERIODTYPE.DAY)
            date.setDate(date.getDate() + argValueAdd);
        else if (argValueType === enumHandlers.FILTERPERIODTYPE.WEEK)
            date.setDate(date.getDate() + (argValueAdd * 7));
        else if (argValueType === enumHandlers.FILTERPERIODTYPE.MONTH)
            date.setMonth(date.getMonth() + argValueAdd);
        else if (argValueType === enumHandlers.FILTERPERIODTYPE.QUARTER)
            date.setMonth(date.getMonth() + (argValueAdd * 3));
        else if (argValueType === enumHandlers.FILTERPERIODTYPE.TRIMESTER)
            date.setMonth(date.getMonth() + (argValueAdd * 4));
        else if (argValueType === enumHandlers.FILTERPERIODTYPE.SEMESTER)
            date.setMonth(date.getMonth() + (argValueAdd * 6));
        else if (argValueType === enumHandlers.FILTERPERIODTYPE.YEAR)
            date.setFullYear(date.getFullYear() + argValueAdd);
        return date;
    };

    helper.GetLowerBoundDate = function (date, argValueType, argValueAdd, operator, modelUri) {
        // get base date
        date = this.GetBaseDate(date, argValueType, modelUri);

        // add by period
        if (operator === enumHandlers.OPERATOR.AFTER.Value)
            argValueAdd++;
        date = this.GetAddedDate(date, argValueType, argValueAdd);

        return date;
    };

    helper.GetUpperBoundDate = function (baseDate, argValueType, argValueAdd) {
        // add by period (+1 for upperbound)
        var date = this.GetAddedDate(baseDate, argValueType, argValueAdd + 1);

        // set max time
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);

        return date;
    };

    var getArgumentFormat = function (fieldType) {
        return fieldType === enumHandlers.FIELDTYPE.DATETIME ? helper.GetDateTimeFormat() : helper.GetDateFormat();
    };
    var getDateArgumentValue = function (value) {
        return value ? helper.ConvertUnixTimeToPicker(value) : null;
    };
    var isArgumentTypeFunctionFormat = function (isEqualOperator, argValueType) {
        return isEqualOperator && argValueType === enumHandlers.FILTERPERIODTYPE.DAY;
    };
    var isDayUpperBound = function (isEqualOperator, argValueType) {
        return isEqualOperator && argValueType !== enumHandlers.FILTERPERIODTYPE.DAY;
    };
    helper.GetTranslatedSettings = function (args, operator, fieldType, modelUri, modelDate) {
        var self = this;
        var canShowPreviewText = false;
        var settings = {
            template: '',
            arguments: []
        };

        var format = getArgumentFormat(fieldType);
        var formatDate = self.GetDateFormat();
        var isEqualOperator = jQuery.inArray(operator, [enumHandlers.OPERATOR.EQUALTO.Value, enumHandlers.OPERATOR.NOTEQUALTO.Value]) !== -1;
        jQuery.each(args, function (index, arg) {
            if (arg.argument_type === enumHandlers.FILTERARGUMENTTYPE.FIELD) {
                // argument type field can't be determined
                canShowPreviewText = false;
                return false;
            }
            else if (arg.argument_type === enumHandlers.FILTERARGUMENTTYPE.FUNCTION) {
                // argument type function need to calculate lower & upper bound
                canShowPreviewText = true;
                
                var argValueType = self.GetAdvanceArgumentType(arg);
                var argValueAdd = self.GetAdvanceArgumentValue(arg);
                var formatCustom = isArgumentTypeFunctionFormat(isEqualOperator, argValueType) ? formatDate : format;
                var lowerDate = self.GetLowerBoundDate(modelDate, argValueType, argValueAdd, operator, modelUri);

                // add a translated lower bound
                if (index === 0)
                    settings.arguments.push(kendo.toString(lowerDate, formatCustom));

                // add a translated upper bound for equal operator
                if (isDayUpperBound(isEqualOperator, argValueType)) {
                    var upperEqualDate = self.GetUpperBoundDate(lowerDate, argValueType, 0);
                    settings.arguments.push(kendo.toString(upperEqualDate, formatCustom));
                }

                // add a translated upper bound
                if (index === 1) {
                    var upperDate = self.GetUpperBoundDate(lowerDate, argValueType, 0);
                    settings.arguments.push(kendo.toString(upperDate, formatCustom));
                }
            }
            else {
                // normal argument type, convert to readable date
                var date = getDateArgumentValue(arg.value);
                settings.arguments.push(kendo.toString(date, format));
            }
        });

        if (canShowPreviewText)
            settings.template = self.GetTranslatedTemplate(operator, settings.arguments);

        return settings;
    };

    var isPreviewAsBetween = function (operator, translatedArgs) {
        return operator === enumHandlers.OPERATOR.BETWEEN.Value || (operator === enumHandlers.OPERATOR.EQUALTO.Value && translatedArgs.length === 2);
    };
    var isPreviewAsNotBetween = function (operator, translatedArgs) {
        return operator === enumHandlers.OPERATOR.NOTBETWEEN.Value || (operator === enumHandlers.OPERATOR.NOTEQUALTO.Value && translatedArgs.length === 2);
    };
    helper.GetTranslatedTemplate = function (operator, translatedArgs) {
        var template = '';
        if (isPreviewAsBetween(operator, translatedArgs))
            template = Localization.WidgetFilter_Preview_Between;
        else if (operator === enumHandlers.OPERATOR.EQUALTO.Value)
            template = Localization.WidgetFilter_Preview_Equal;
        else if (isPreviewAsNotBetween(operator, translatedArgs))
            template = Localization.WidgetFilter_Preview_NotBetween;
        else if (operator === enumHandlers.OPERATOR.NOTEQUALTO.Value)
            template = Localization.WidgetFilter_Preview_NotEqual;
        else if (operator === enumHandlers.OPERATOR.AFTER.Value)
            template = Localization.WidgetFilter_Preview_After;
        else if (operator === enumHandlers.OPERATOR.BEFORE.Value)
            template = Localization.WidgetFilter_Preview_Before;
        return template;
    };

})(WC.WidgetFilterHelper);