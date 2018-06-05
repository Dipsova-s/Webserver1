(function (window) {
    "use strict";

    window.localizeTime = function (date, customFormat) {
        if (!IsNullOrEmpty(date) && date !== 'Invalid Date') {
            var format = kendo.toString(date, userSettingModel.GetUserTimeTemplate(customFormat));
            return format;
        }
        else {
            return 'null';
        }
    };

    window.SetUICuture = function (kendoCulture) {
        // set kendo ui culture if ui language is correct
        kendo.culture(kendoCulture);
        kendo.cultures.current.calendar.AM[0] = kendo.cultures.current.calendar.AM[0].toLowerCase();
        kendo.cultures.current.calendar.PM[0] = kendo.cultures.current.calendar.PM[0].toLowerCase();

        var decimalSeparator = userSettingModel.GetClientSettingByPropertyName(enumHandlers.CLIENT_SETTINGS_PROPERTY.GENERAL_DECIMAL_SEPERATOR) || '.';
        kendo.cultures.current.numberFormat['.'] = decimalSeparator;
        kendo.cultures.current.numberFormat.currency['.'] = decimalSeparator;
        kendo.cultures.current.numberFormat.percent['.'] = decimalSeparator;

        var groupSeparator = userSettingModel.GetClientSettingByPropertyName(enumHandlers.CLIENT_SETTINGS_PROPERTY.GENERAL_THOUSAND_SEPERATOR) || ',';
        kendo.cultures.current.numberFormat[','] = groupSeparator;
        kendo.cultures.current.numberFormat.currency[','] = groupSeparator;
        kendo.cultures.current.numberFormat.percent[','] = groupSeparator;
    };

})(window);
