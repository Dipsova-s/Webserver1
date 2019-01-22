function Formatter(formatter, fieldType) {
    "use strict";

    if (typeof formatter === 'string') {
        formatter = { format: formatter };
    }

    jQuery.extend(this, {
        type: fieldType || enumHandlers.FIELDTYPE.TEXT,
        format: '',
        domain: {},

        order: null,
        year: null,
        month: null,
        day: null,
        datedelimiter: null,
        hour: null,
        second: null,
        timedelimiter: null,
        utc: null,

        decimals: null,
        thousandseparator: null,
        prefix: null,
        suffix: ''
    }, formatter);

    var temSuffix = [];

    // clean format
    if (typeof this.decimals === 'string') {
        this.decimals = parseInt(this.decimals, 10);
    }
    if (this.prefix && this.prefix === 'N') {
        this.prefix = null;
    }
    if (typeof this.thousandseparator !== 'boolean' && WC.FormatHelper.IsSupportThousandSeparator(fieldType)) {
        this.thousandseparator = false;
    }

    if (this.prefix) {
        temSuffix.push(this.prefix);
    }

    // verify field type
    if (this.type === enumHandlers.FIELDTYPE.INTEGER) {
        this.decimals = 0;
    }
    else if (this.type === enumHandlers.FIELDTYPE.CURRENCY) {
        this.format = userSettingModel.GetByName(enumHandlers.USERSETTINGS.DEFAULT_CURRENCY) || 'EUR';
        temSuffix.push(this.format);
    }
    else if (this.type === enumHandlers.FIELDTYPE.PERCENTAGE) {
        temSuffix.push('%');
    }

    this.suffix = temSuffix.join(' ');
};
function FieldFormatter(field, modelUri) {
    /// <summary>create FieldFormatter object</summary>
    /// <param name="field" type="Object">display field, model field or aggregation field</param>
    /// <param name="modelUri" type="String">model uri</param>
    /// <returns type="FieldFormatter"></returns>

    "use strict";

    this.field = field;
    this.model = modelUri;

    this.AddBaseField = function (baseField) {
        this._field = baseField;
    };
};

function FormatHelper() {
    "use strict";

    var self = this;
    var _self = {};

    self.CacheFormat = {};
    self.Captions = {
        PeriodDays: Localization.Days,
        PeriodWeeks: 'weeks'
    };

    /* private methods */
    _self.GetFormatNormalized = function (formatter) {
        /// <summary>normalize format for kendo.toString</summary>
        /// <param name="formatter" type="Formatter">format object</param>
        /// <returns type="String"></returns>

        if (!formatter.format && (formatter.type === enumHandlers.FIELDTYPE.DATETIME || formatter.type === enumHandlers.FIELDTYPE.DATETIME_WC)) {
            var dateFormatter = new Formatter(formatter);
            dateFormatter.type = enumHandlers.FIELDTYPE.DATE;

            var timeFormatter = new Formatter(formatter);
            timeFormatter.type = enumHandlers.FIELDTYPE.TIME;

            return _self.GetFormatNormalized(dateFormatter) + ' ' + _self.GetFormatNormalized(timeFormatter);
        }
        else if (!formatter.format && formatter.type === enumHandlers.FIELDTYPE.TIMESPAN) {
            var timespanFormats = ['[h]', 'mm'];
            if (formatter.second) {
                timespanFormats.push(formatter.second);
            }
            return timespanFormats.join(formatter.timedelimiter);
        }
        else if (formatter.type === enumHandlers.FIELDTYPE.TIME && formatter.hour) {
            // {"hour":"HHmm|hmm","timedelimiter":".|:","second":"ss or empty"}
            var timeFormat, timeSuffix;
            if (formatter.hour === enumHandlers.TIME_TEMPLATE.HMM) {
                timeFormat = ['h', 'mm'];
                timeSuffix = ' tt';
            }
            else {
                timeFormat = ['HH', 'mm'];
                timeSuffix = '';
            }

            if (formatter.second) {
                timeFormat.push(formatter.second);
            }

            return timeFormat.join(formatter.timedelimiter) + timeSuffix;
        }
        else if (formatter.type === enumHandlers.FIELDTYPE.DATE && formatter.order) {
            var formats = [];
            for (var i = 0; i < 3; i++) {
                if (formatter.order[i] === 'Y')
                    formats[i] = formatter.year;
                else if (formatter.order[i] === 'M')
                    formats[i] = formatter.month;
                else
                    formats[i] = formatter.day;
            }
            return formats.join(formatter.datedelimiter) + (formatter.utc ? ' UTC' : '');
        }
        else if (formatter.type === enumHandlers.FIELDTYPE.DATE && formatter.utc) {
            return formatter.format + ' UTC';
        }
        else if (formatter.type === enumHandlers.FIELDTYPE.PERIOD) {
            if (formatter.format === enumHandlers.TIMEFORMAT.DAY || formatter.format === enumHandlers.TIMEFORMAT.WEEK)
                return '0 ' + self.Captions.PeriodDays;
            else
                return formatter.format;
        }
        else if (self.IsNumberFieldType(formatter.type) && formatter.decimals !== null) {
            var format = '0';
            if (formatter.thousandseparator) {
                format = '#,##' + format;
            }

            var decimals = formatter.decimals;
            if (typeof decimals === 'string') {
                decimals = parseInt(decimals, 10);
            }
            if (decimals) {
                format += '.';
                if (decimals === 20) {
                    format += '####################';
                }
                else {
                    for (var j = 0; j < decimals; j++) {
                        format += '0';
                    }
                }
            }

            if (formatter.prefix) {
                format += ' ' + formatter.prefix;
            }

            if (formatter.type === enumHandlers.FIELDTYPE.CURRENCY) {
                format += ' ' + formatter.format;
            }
            else if (formatter.type === enumHandlers.FIELDTYPE.PERCENTAGE) {
                format += ' \\%';
            }
            return format;
        }
        else {
            return formatter.format;
        }
    };
    _self.SetFormatterCache = function (fieldObject) {
        /// <summary>Set field format to cache</summary>
        /// <param name="fieldObject" type="String|FieldFormatter">field type or FieldFormatter(display field, model field or aggregation field)</param>

        var cacheKey = _self.GetFormatterCacheKey(fieldObject);
        self.CacheFormat[cacheKey] = {
            format: self.GetFormatter(fieldObject)
        };

        if (fieldObject instanceof FieldFormatter) {
            self.CacheFormat[cacheKey].domain = self.GetEnumDataFromFieldFormatter(fieldObject);
        }
    };
    _self.GetFormatterCacheKey = function (fieldObject) {
        /// <summary>Get cache key</summary>
        /// <param name="fieldObject" type="String|FieldFormatter">field type or FieldFormatter(display field, model field or aggregation field)</param>
        /// <returns type="String"></returns>

        if (typeof fieldObject === 'string') {
            return fieldObject;
        }
        else {
            return fieldObject.model + '/' + _self.GetFieldIdFromFieldFormatter(fieldObject);
        }
    };
    _self.GetFieldIdFromFieldFormatter = function (fieldObject) {
        /// <summary>Get field id from FieldFormatter object</summary>
        /// <param name="fieldObject" type="FieldFormatter">FieldFormatter(display field, model field or aggregation field)</param>
        /// <returns type="String"></returns>

        return fieldObject.field.id || fieldObject.field.source_field || fieldObject.field.field;
    };
    _self.GetFieldFromFieldFormatter = function (fieldObject, fieldId) {
        return fieldObject._field ? fieldObject._field : modelFieldsHandler.GetFieldById(fieldId, fieldObject.model);
    };
    _self.GetFinalizeFormatAndValue = function (format, value, formatMetadata) {
        /// <summary>Finalize value</summary>
        /// <param name="format" type="String">format</param>
        /// <param name="value" type="Object">value</param>
        /// <param name="formatMetadata" type="Object" optional="true">default: {}, format metadata</param>
        /// <returns type="Object"></returns>

        var enumFormats = [
            enumHandlers.ENUMDISPLAYTYPE.SHORTNAME,
            enumHandlers.ENUMDISPLAYTYPE.LONGNAME,
            enumHandlers.ENUMDISPLAYTYPE.SHORTNAMELONGNAME,
            enumHandlers.ENUMDISPLAYTYPE.SMART
        ];
        var dateExtraFormats = ['T', 'S', 'Q'];
        if (jQuery.inArray(format, enumFormats) !== -1) {
            // enum
            formatMetadata = formatMetadata || {};
            var shortName;
            if (value != null && typeof value === 'object') {
                shortName = value.short_name || value.id;
                value = self.GetFormattedEnumValue(format, shortName, value.long_name || shortName);
            }
            else if (formatMetadata.domain) {
                var domainElement = WC.Utility.ToArray(formatMetadata.domain.elements).findObject('id', value);
                if (domainElement) {
                    shortName = domainElement.short_name || domainElement.id;
                    value = self.GetFormattedEnumValue(format, shortName, domainElement.long_name || shortName);
                }
            }
            format = '';
        }
        else if (value != null && format.substr(0, 2) === 'yy' && jQuery.inArray(format.split(' ')[1], dateExtraFormats) !== -1) {
            var formatType = format.split(' ')[1];
            // semester, quarter, trimester
            if (typeof value === 'number') {
                value = WC.DateHelper.UnixTimeToUtcDate(value);
            }
            else if (typeof value === 'string' && value) {
                value = new Date(value);
                value = WC.DateHelper.LocalDateToUtcDate(value);
            }

            if (formatType === 'T') {
                format += _self.GetTrimester(value);
            }
            else if (formatType === 'S') {
                format += _self.GetSemester(value);
            }
            else if (formatType === 'Q') {
                format += _self.GetQuarter(value);
            }
        }
        else if (format === 'boolean') {
            // boolean
            value = _self.GetFormattedBooleanValue(format, value);
            format = format.year + '';
        }
        else if (format.indexOf(self.Captions.PeriodDays) !== -1 || format.indexOf(self.Captions.PeriodWeeks) !== -1) {
            // period
            value = _self.GetFormattedPeriodValue(format, value);
        }
        else if (format.indexOf('M') !== -1 && format.indexOf('yy') !== -1 && value !== null) {
            // date or datetime
            var isUtc = format.indexOf(' UTC') !== -1;
            if (isUtc) {
                format = format.replace(' UTC', '');
            }
            if (typeof value === 'number') {
                if (isUtc) {
                    value = WC.DateHelper.UnixTimeToUtcDate(value);
                }
                else {
                    value = WC.DateHelper.UnixTimeToLocalDate(value);
                }
            }
            else if (typeof value === 'string' && value) {
                value = new Date(value);
                if (isUtc) {
                    value = WC.DateHelper.LocalDateToUtcDate(value);
                }
            }
        }
        else if (format.indexOf('[h]') !== -1) {
            // timespan
            // handle in kendo.core.extension.js
        }
        else if (format.toLowerCase().indexOf('h') !== -1 && format.indexOf('mm') !== -1 && value !== null) {
            // time
            if (typeof value === 'number') {
                value = WC.DateHelper.UnixTimeToUtcDate(value);
            }
        }
        else if (typeof value === 'object' && value !== null && value.c) {
            // currency
            value = value.a;
        }
        else if (format.indexOf('\\%') !== -1) {
            // percentage
            if (typeof value === 'number') {
                value = self.NumberToPercentages(value);
            }
        }

        // K & M
        if (typeof value === 'number') {
            if (self.IsFormatContainUnit(format, 'K')) {
                value = self.NumberToThousands(value);
            }
            else if (self.IsFormatContainUnit(format, 'M')) {
                value = self.NumberToMillions(value);
            }
        }

        return { format: format, value: value };
    };
    _self.GetFormattedBooleanValue = function (format, value) {
        /// <summary>Get boolean formatted value</summary>
        /// <param name="format" type="String">boolean's format</param>
        /// <param name="value" type="String">boolean's value</param>
        /// <returns type="String"></returns>

        if (value === true) {
            return Localization.Yes;
        }
        else if (value === false) {
            return Localization.No;
        }
        else {
            return '';
        }
    };
    _self.GetFormattedPeriodValue = function (format, value) {
        /// <summary>Get period formatted value</summary>
        /// <param name="format" type="String">period's format</param>
        /// <param name="value" type="String">period's value</param>
        /// <returns type="String"></returns>

        if (typeof value === 'number') {
            var formats = format.split(' ');
            if (formats[1] === self.Captions.PeriodWeeks) {
                value = Math.floor(value / 7);
            }
        }
        return value;
    };
    _self.SafeMultiply = function (number, multiply, addDecimals) {
        var tempNumber = parseFloat(number);
        if (isNaN(tempNumber)) {
            return number;
        }
        else {
            var decimals = tempNumber.getSafeDecimals(addDecimals);
            tempNumber = tempNumber * multiply;
            tempNumber = tempNumber.safeParse(decimals);
            return tempNumber;
        }
    };
    _self.SafeDivide = function (number, divide, addDecimals) {
        var tempNumber = parseFloat(number);
        if (isNaN(tempNumber)) {
            return number;
        }
        else {
            var decimals = tempNumber.getSafeDecimals(addDecimals);
            tempNumber = tempNumber / divide;
            tempNumber = tempNumber.safeParse(decimals);
            return tempNumber;
        }
    };
    _self.GetSemester = function (date) {
        if (date instanceof Date) {
            var month = date.getMonth() + 1;
            if (month <= 6)
                return 1;
            return 2;
        } return null;
    };
    _self.GetTrimester = function (date) {
        if (date instanceof Date) {
            var month = date.getMonth() + 1;
            if (month <= 4)
                return 1;
            if (month <= 8)
                return 2;
            return 3;
        } return null;
    };
    _self.GetQuarter = function (date) {
        if (date instanceof Date) {
            var month = date.getMonth() + 1;
            if (month <= 3)
                return 1;
            if (month <= 6)
                return 2;
            if (month <= 9)
                return 3;
            return 4;
        } return null;
    };

    /* public methods */
    self.GetFormatter = function (fieldObject) {
        /// <summary>Get field format from field type or field object</summary>
        /// <param name="fieldObject" type="String|Formatter|FieldFormatter">field type, Formatter or FieldFormatter(display field, model field or aggregation field)</param>
        /// <returns type="String"></returns>

        if (typeof fieldObject === 'string') {
            // is fieldtype
            return self.GetUserDefaultFormatter(fieldObject);
        }
        if (fieldObject instanceof Formatter) {
            return _self.GetFormatNormalized(fieldObject);
        }
        else {
            // is field object
            return self.GetFieldFormatter(fieldObject);
        }
    };
    self.GetUserDefaultFormatter = function (fieldType) {
        /// <summary>Get field format from field type (user settings)</summary>
        /// <param name="fieldType" type="String">field type</param>
        /// <returns type="String"></returns>

        var formatter = self.GetUserDefaultFormatSettings(fieldType);
        return _self.GetFormatNormalized(formatter);
    };
    self.GetUserDefaultFormatSettings = function (fieldType, isUtcDate) {
        /// <summary>Get user default settings</summary>
        /// <param name="fieldType" type="String">field type</param>
        /// <param name="isUtcDate" type="Boolean" optional="true">default: false, use for date type for mark as UTC date</param>
        /// <returns type="Formatter"></returns>

        var formatter = { format: '' };

        if (fieldType === enumHandlers.FIELDTYPE.BOOLEAN) {
            formatter = { format: 'boolean' };
        }
        else if (fieldType === enumHandlers.FIELDTYPE.ENUM) {
            formatter = { format: userSettingModel.GetByName(enumHandlers.USERSETTINGS.FORMAT_ENUM) || enumHandlers.ENUMDISPLAYTYPE.SHORTNAMELONGNAME };
        }
        else if (fieldType === enumHandlers.FIELDTYPE.PERIOD) {
            formatter = { format: userSettingModel.GetByName(enumHandlers.USERSETTINGS.FORMAT_PERIOD) || enumHandlers.TIMEFORMAT.DAY };
        }
        else if (fieldType === enumHandlers.FIELDTYPE.DATETIME || fieldType === enumHandlers.FIELDTYPE.DATETIME_WC) {
            var dateFormatter = self.GetUserDefaultFormatSettings(enumHandlers.FIELDTYPE.DATE, isUtcDate);
            var timeFormatter = self.GetUserDefaultFormatSettings(enumHandlers.FIELDTYPE.TIME, isUtcDate);

            self.CleanFormatter(dateFormatter);
            self.CleanFormatter(timeFormatter);

            jQuery.extend(formatter, dateFormatter, timeFormatter);
        }
        else if (fieldType === enumHandlers.FIELDTYPE.DATE) {
            formatter = JSON.parse(userSettingModel.GetByName(enumHandlers.USERSETTINGS.FORMAT_DATE) || JSON.stringify({
                order: enumHandlers.DEFAULT_DATE_TEMPLATE.ORDER_FORMAT,
                year: enumHandlers.DEFAULT_DATE_TEMPLATE.YEAR_FORMAT,
                month: enumHandlers.DEFAULT_DATE_TEMPLATE.MONTH_FORMAT,
                day: enumHandlers.DEFAULT_DATE_TEMPLATE.DAY_FORMAT,
                separator: enumHandlers.DEFAULT_DATE_TEMPLATE.SEPARATOR
            }));
            formatter.datedelimiter = formatter.separator;
            formatter.utc = !!isUtcDate;

            delete formatter.separator;
        }
        else if (fieldType === enumHandlers.FIELDTYPE.TIME
            || fieldType === enumHandlers.FIELDTYPE.TIMESPAN) {
            formatter = JSON.parse(userSettingModel.GetByName(enumHandlers.USERSETTINGS.FORMAT_TIME) || JSON.stringify({
                hour: enumHandlers.TIME_DEFUALT_TEMPLATE.HOUR_FORMAT,
                separator: enumHandlers.TIME_DEFUALT_TEMPLATE.SEPARATOR
            }));
            formatter.timedelimiter = formatter.separator;

            delete formatter.separator;
        }
        else if (self.IsNumberFieldType(fieldType)) {
            if (fieldType === enumHandlers.FIELDTYPE.CURRENCY) {
                formatter = JSON.parse(userSettingModel.GetByName(enumHandlers.USERSETTINGS.FORMAT_CURRENCIES) || JSON.stringify({
                    decimals: 0,
                    prefix: null,
                    thousandseparator: false
                }));
            }
            else if (fieldType === enumHandlers.FIELDTYPE.PERCENTAGE) {
                formatter = JSON.parse(userSettingModel.GetByName(enumHandlers.USERSETTINGS.FORMAT_PERCENTAGES) || JSON.stringify({
                    decimals: 0,
                    prefix: null,
                    thousandseparator: false
                }));
            }
            else {
                formatter = JSON.parse(userSettingModel.GetByName(enumHandlers.USERSETTINGS.FORMAT_NUMBERS) || JSON.stringify({
                    decimals: 0,
                    prefix: null,
                    thousandseparator: false
                }));
            }
        }

        return new Formatter(formatter, fieldType);
    };
    self.GetFieldFormatter = function (fieldObject) {
        /// <summary>Get field format from field object</summary>
        /// <param name="fieldObject" type="FieldFormatter">FieldFormatter(display field, model field or aggregation field)</param>
        /// <returns type="String"></returns>

        var formatter = self.GetFieldFormatSettings(fieldObject, true);
        return _self.GetFormatNormalized(formatter);
    };
    self.GetFieldFormatSettings = function (fieldObject, useDefaultSetting) {
        /// <summary>Get field format from field object</summary>
        /// <param name="fieldObject" type="FieldFormatter">FieldFormatter(display field, model field or aggregation field)</param>
        /// <returns type="Formatter"></returns>

        var field = null;
        var fieldDetails = null;
        if (fieldObject.field.id && fieldObject.field.user_specific) {
            fieldDetails = WC.Utility.ParseJSON(fieldObject.field.user_specific.user_settings);
            field = fieldObject.field;
        }
        else if (fieldObject.field.field === enumHandlers.AGGREGATION.COUNT.Value) {
            field = {
                id: enumHandlers.AGGREGATION.COUNT.Value,
                fieldtype: enumHandlers.FIELDTYPE.INTEGER,
                user_specific: { user_settings: '{}' }
            };
            fieldDetails = WC.Utility.ParseJSON(fieldObject.field.field_details);
        }
        else if (fieldObject.field.field && fieldObject.field.operator) {
            field = _self.GetFieldFromFieldFormatter(fieldObject, fieldObject.field.source_field);
            if (field) {
                fieldDetails = WC.Utility.ParseJSON(field.user_specific.user_settings);
            }
        }
        else if (fieldObject.field.field) {
            var displayFieldDetails = WC.Utility.ParseJSON(fieldObject.field.field_details);
            var modelFieldDetails = {};
            field = _self.GetFieldFromFieldFormatter(fieldObject, fieldObject.field.field);
            if (field) {
                modelFieldDetails = WC.Utility.ParseJSON(field.user_specific.user_settings);
            }
            fieldDetails = jQuery.extend(modelFieldDetails, displayFieldDetails);
        }

        var formatter = {};
        var fieldType = enumHandlers.FIELDTYPE.TEXT;
        if (field) {
            fieldType = field.fieldtype;
            var defaultUserSettings = self.GetUserDefaultFormatSettings(fieldType, true);
            if (self.IsContainFormatSettings(fieldDetails)) {
                if (fieldType === enumHandlers.FIELDTYPE.BOOLEAN) {
                    formatter = { format: 'boolean' };
                }
                else if (WC.FormatHelper.IsDateOrDateTime(fieldType)) {
                    formatter = fieldDetails;
                    formatter.utc = true;
                }
                else if (jQuery.inArray(fieldType, [enumHandlers.FIELDTYPE.ENUM, enumHandlers.FIELDTYPE.PERIOD, enumHandlers.FIELDTYPE.TIME, enumHandlers.FIELDTYPE.TIMESPAN]) !== -1
                    || self.IsNumberFieldType(fieldType)) {
                    formatter = fieldDetails;
                }
            }

            if (useDefaultSetting) {
                formatter = jQuery.extend({}, defaultUserSettings, formatter);
            }
        }

        return new Formatter(formatter, fieldType);
    };
    self.GetEnumDataFromFieldFormatter = function (fieldObject) {
        /// <summary>Get enum data</summary>
        /// <param name="fieldObject" type="FieldFormatter">FieldFormatter(display field, model field or aggregation field)</param>
        /// <returns type="Object"></returns>

        var fieldId = _self.GetFieldIdFromFieldFormatter(fieldObject);
        var field = modelFieldsHandler.GetFieldById(fieldId, fieldObject.model);
        if (field && field.domain) {
            var fieldDomain = modelFieldDomainHandler.GetFieldDomainByUri(field.domain);
            return fieldDomain || { elements: [] };
        }
        return {};
    };
    self.CleanFormatter = function (formatter) {
        /// <summary>Clean formatter object</summary>
        /// <param name="formatter" type="Formatter">format object</param>

        if (!formatter.format) {
            delete formatter.format;
        }
        if (jQuery.isEmptyObject(formatter.domain)) {
            delete formatter.domain;
        }
        if (formatter.order === null) {
            delete formatter.order;
            delete formatter.day;
            delete formatter.month;
            delete formatter.year;
            delete formatter.utc;
        }
        if (formatter.hour === null) {
            delete formatter.hour;
        }
        if (formatter.second === null) {
            delete formatter.second;
        }
        if (formatter.separator === null) {
            delete formatter.separator;
        }
        if (formatter.datedelimiter === null) {
            delete formatter.datedelimiter;
        }
        if (formatter.timedelimiter === null) {
            delete formatter.timedelimiter;
        }
        if (formatter.decimals === null) {
            delete formatter.decimals;
        }
        if (formatter.prefix === null) {
            delete formatter.prefix;
        }
        if (formatter.thousandseparator === null) {
            delete formatter.thousandseparator;
        }


        delete formatter.suffix;
        delete formatter.type;
    };
    self.ClearFormatCached = function () {
        /// <summary>Clear all cache format setting</summary>

        self.CacheFormat = {};
    };
    self.GetFormattedValue = function (formatObject, value, useCache, culture, onlynumber) {
        /// <summary>Get formatted value</summary>
        /// <param name="formatObject" type="String|Formatter|FieldFormatter">field type, Formatter or FieldFormatter</param>
        /// <param name="value" type="Object">value</param>
        /// <param name="useCache" type="Boolean" optional="true">default: false, use from cache?</param>
        /// <param name="culture" type="Object" optional="true">default: null, kendo.culture object</param>
        /// <param name="onlynumber" type="Boolean" optional="true">default: false, only show number</param>
        /// <returns type="String"></returns>

        var format;
        var formatMetadata = {};
        if (formatObject instanceof Formatter) {
            format = _self.GetFormatNormalized(formatObject);
            formatMetadata.domain = formatObject.domain || {};
        }
        else {
            if (useCache === true) {
                var cacheKey = _self.GetFormatterCacheKey(formatObject);
                formatMetadata = self.CacheFormat[cacheKey];
                if (!formatMetadata) {
                    _self.SetFormatterCache(formatObject);
                    formatMetadata = self.CacheFormat[cacheKey];
                }
                format = formatMetadata.format;
            }
            else {
                format = self.GetFormatter(formatObject);
                if (formatObject instanceof FieldFormatter) {
                    formatMetadata.domain = self.GetEnumDataFromFieldFormatter(formatObject);
                }
            }
        }

        // finalize format & value
        var formatted = _self.GetFinalizeFormatAndValue(format, value, formatMetadata);

        if (onlynumber === true) {
            formatted.format = formatted.format.split(' ')[0];
        }

        // do format
        return kendo.toString(formatted.value, formatted.format, culture);
    };
    self.GetFormattedEnumValue = function (format, shortName, longName) {
        /// <summary>Get enum formatted value</summary>
        /// <param name="format" type="String">enum's format</param>
        /// <param name="shortName" type="String">enum's short name</param>
        /// <param name="longName" type="String">enum's long name</param>
        /// <returns type="String"></returns>

        if (format === enumHandlers.ENUMDISPLAYTYPE.SMART && shortName === longName)
            format = enumHandlers.ENUMDISPLAYTYPE.SHORTNAME;

        if (format === enumHandlers.ENUMDISPLAYTYPE.LONGNAME)
            return longName;
        else if (format === enumHandlers.ENUMDISPLAYTYPE.SHORTNAME)
            return shortName;
        else
            return shortName + ' (' + longName + ')';
    };
    self.NumberToPercentages = function (number) {
        return _self.SafeMultiply(number, 100, -2);
    };
    self.PercentagesToNumber = function (number) {
        return _self.SafeDivide(number, 100, 2);
    };
    self.NumberToThousands = function (number) {
        return _self.SafeDivide(number, 1000, 3);
    };
    self.ThousandsToNumber = function (number) {
        return _self.SafeMultiply(number, 1000, -3);
    };
    self.NumberToMillions = function (number) {
        return _self.SafeDivide(number, 1000000, 6);
    };
    self.MillionsToNumber = function (number) {
        return _self.SafeMultiply(number, 1000000, -6);
    };
    self.IsContainFormatSettings = function (fieldDetails) {
        /// <summary>Check field is contains format setting</summary>
        /// <param name="fieldDetails" type="Object">field format settings</param>
        /// <returns type="Boolean"></returns>

        if (!fieldDetails)
            fieldDetails = {};

        var hasFormat = typeof fieldDetails[enumHandlers.FIELDDETAILPROPERTIES.FORMAT] === 'string';
        var hasNumberFormat = typeof fieldDetails[enumHandlers.FIELDDETAILPROPERTIES.DECIMALS] === 'number'
                            || typeof fieldDetails[enumHandlers.FIELDDETAILPROPERTIES.PREFIX] !== 'undefined'
                            || typeof fieldDetails[enumHandlers.FIELDDETAILPROPERTIES.THOUSANDSEPARATE] === 'boolean';
        var hasTimeFormat = fieldDetails[enumHandlers.FIELDDETAILPROPERTIES.HOUR]
                            || typeof fieldDetails[enumHandlers.FIELDDETAILPROPERTIES.SECOND] === 'string';

        return hasFormat || hasNumberFormat || hasTimeFormat;
    };
    self.IsNumberFieldType = function (fieldType) {
        /// <summary>Check field type is number</summary>
        /// <param name="fieldType" type="String">field type</param>
        /// <returns type="Boolean"></returns>

        var numberTypes = [
            enumHandlers.FIELDTYPE.CURRENCY, enumHandlers.FIELDTYPE.DOUBLE,
            enumHandlers.FIELDTYPE.INTEGER, enumHandlers.FIELDTYPE.NUMBER,
            enumHandlers.FIELDTYPE.PERCENTAGE
        ];
        return jQuery.inArray(fieldType, numberTypes) !== -1;
    };
    self.IsFieldTypeHasTime = function (fieldType) {
        /// <summary>Check field type has time</summary>
        /// <param name="fieldType" type="String">field type</param>
        /// <returns type="Boolean"></returns>

        return (fieldType === enumHandlers.FIELDTYPE.TIME
            || fieldType === enumHandlers.FIELDTYPE.TIMESPAN
            || fieldType === enumHandlers.FIELDTYPE.DATETIME);
    };
    self.IsSupportDecimal = function (fieldType) {
        /// <summary>Check is field type support decimal places</summary>
        /// <param name="fieldType" type="String">field type</param>
        /// <returns type="Boolean"></returns>

        return fieldType !== enumHandlers.FIELDTYPE.INTEGER && self.IsNumberFieldType(fieldType);
    };
    self.IsSupportThousandSeparator = function (fieldType) {
        /// <summary>Check is field type support thousand separator</summary>
        /// <param name="fieldType" type="String">field type</param>
        /// <returns type="Boolean"></returns>

        return self.IsNumberFieldType(fieldType);
    };
    self.IsSupportPrefix = function (fieldType) {
        /// <summary>Check is field type support prefix</summary>
        /// <param name="fieldType" type="String">field type</param>
        /// <returns type="Boolean"></returns>

        return self.IsNumberFieldType(fieldType);
    };
    self.IsDateOrDateTime = function (fieldType) {
        return fieldType === enumHandlers.FIELDTYPE.DATE || fieldType === enumHandlers.FIELDTYPE.DATETIME;
    };
    self.IsFormatContainUnit = function (format, unit) {
        var formatLength = format.length;
        var last2Chars = format.substr(formatLength - 2);
        return format.indexOf(' ' + unit + ' ') !== -1 || last2Chars === ' ' + unit;
    };
    self.GetWeekOfYear = function (weekStart, date, yearFormat) {
        var result = GetWeekOfYear(weekStart, date);
        result.y = ('' + result.y).substr(4 - yearFormat.length);
        return result;
    };
};
WC.FormatHelper = new FormatHelper();

var dataTypeModel = new DataTypeModel();

function DataTypeModel() {
    "use strict";

    var self = this;

    //BOF: Methods
    self.GetCorrectPrefix = function (displayUnit, bucketValue) {
        if (displayUnit && displayUnit !== enumHandlers.DISPLAYUNITSFORMAT.NONE) {
            var availablePrefixs = self.GetDisplayPrefixByBucket(bucketValue);
            if (!availablePrefixs.hasObject('id', displayUnit)) {
                if (availablePrefixs.length === 2)
                    displayUnit = enumHandlers.DISPLAYUNITSFORMAT.NONE;
                if (availablePrefixs.length === 3)
                    displayUnit = enumHandlers.DISPLAYUNITSFORMAT.THOUSANDS;
            }
        }
        return displayUnit;
    };
    self.GetDisplayPrefixByBucket = function (bucketValue) {
        var displayUnits = ko.toJS(enumHandlers.DISPLAYUNITS);

        if (bucketValue.indexOf('power10_min') === 0) {
            // power10_minXX bucket
            displayUnits.removeObject('id', enumHandlers.DISPLAYUNITSFORMAT.THOUSANDS);
            displayUnits.removeObject('id', enumHandlers.DISPLAYUNITSFORMAT.MILLIONS);
        }
        else if (bucketValue.indexOf('power10_') === 0) {
            // power10_XX bucket
            var powerNumber = parseInt(bucketValue.replace('power10_', '').split('_')[0]);
            if (powerNumber < 3)
                displayUnits.removeObject('id', enumHandlers.DISPLAYUNITSFORMAT.THOUSANDS);
            if (powerNumber < 6)
                displayUnits.removeObject('id', enumHandlers.DISPLAYUNITSFORMAT.MILLIONS);
        }

        displayUnits.unshift({
            name: Localization.FormatSetting_UseDefault,
            id: enumHandlers.FIELDSETTING.USEDEFAULT
        });

        return displayUnits;
    };
    self.IsTextDataType = function (bucket, fieldType) {
        return fieldType === enumHandlers.FIELDTYPE.TEXT || (fieldType === enumHandlers.FIELDTYPE.ENUM && bucket !== 'individual');
    };
    self.IsEnumDataType = function (bucket, fieldType) {
        return fieldType === enumHandlers.FIELDTYPE.ENUM && bucket === 'individual';
    };
    self.IsIntegerBucket = function (bucketValue, fieldType) {
        bucketValue = (bucketValue ? bucketValue : '').toLowerCase();
        var isAverageBucket = bucketValue.indexOf(enumHandlers.AGGREGATION.AVERAGE.Value) !== -1;
        var isCountBucket = bucketValue.indexOf(enumHandlers.AGGREGATION.COUNT.Value) !== -1;
        return isCountBucket || (self.IsIntegerType(fieldType) && !isAverageBucket);
    };
    self.IsIntegerType = function (fieldType) {
        return fieldType === enumHandlers.FIELDTYPE.INTEGER || fieldType === enumHandlers.FIELDTYPE.PERIOD;
    };
    self.GetCorrectDataType = function (bucket, fieldType) {
        var dataType = fieldType;
        if (self.IsTextDataType(bucket, fieldType)) {
            dataType = enumHandlers.FIELDTYPE.TEXT;
        }
        else if (self.IsIntegerBucket(bucket, fieldType)) {
            // check is integer
            dataType = enumHandlers.FIELDTYPE.INTEGER;
        }
        else if (self.IsIntegerType(fieldType)) {
            // is integer but does not match 1st condition
            dataType = enumHandlers.FIELDTYPE.DOUBLE;
        }
        return dataType;
    };
    self.IsAggregationBucket = function (bucketValue) {
        bucketValue = (bucketValue || '').toLowerCase();
        var aggregationBuckets = [
            enumHandlers.AGGREGATION.COUNT.Value,
            enumHandlers.AGGREGATION.COUNT_VALID.Value,
            enumHandlers.AGGREGATION.MIN.Value,
            enumHandlers.AGGREGATION.MAX.Value,
            enumHandlers.AGGREGATION.SUM.Value,
            enumHandlers.AGGREGATION.AVERAGE.Value,
            enumHandlers.AGGREGATION.AVERAGE_VALID.Value
        ];
        return !bucketValue || jQuery.inArray(bucketValue, aggregationBuckets) !== -1;
    };
    self.GetPowerBucketSize = function (bucketValue) {
        var bucketSize, power;
        if (bucketValue.indexOf('power10_min') === 0) {
            power = parseInt(bucketValue.replace('power10_min', '').split('_')[0]);
            bucketSize = Math.pow(10, power * -1);
        }
        else {
            power = parseInt(bucketValue.replace('power10_', '').split('_')[0]);
            bucketSize = Math.pow(10, power);
        }
        return bucketSize;
    };
    //EOF: Methods
};
