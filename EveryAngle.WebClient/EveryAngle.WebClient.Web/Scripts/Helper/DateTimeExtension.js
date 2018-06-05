(function (window) {
    "use strict";

    jQuery.extend(window.WC.DateHelper, {
        UnixTimeToLocalDate: function (time) {
            return kendo.date.unixToDate(time);
        },
        UnixTimeToUtcDate: function (time) {
            return kendo.date.unixToUtcDate(time);
        },
        LocalDateToUtcDate: function (date) {
            return kendo.date.dateToUtcDate(date);
        },
        LocalDateToUnixTime: function (date, hasTime) {
            return kendo.date.dateToUnix(date, hasTime);
        },
        LocalTimeToUnixTime: function (date) {
            return kendo.date.timeToUnix(date);
        },
        GetCurrentUnixTime: function () {
            var date = kendo.date.dateToUtcDate(new Date(Math.floor(jQuery.now() / 1000) * 1000));
            return kendo.date.dateToUnix(date);
        },
        GetFirstDayOfWeek: function (modelUri) {
            // 0=Sun, 1=Mon, ..., 6=Sat
            var defaultFirstDayOfWeek = 1;

            var model = modelsHandler.GetModelByUri(modelUri);
            var firstDayOfWeek = enumHandlers.DAYOFWEEK[model.first_day_of_week];
            if (typeof firstDayOfWeek !== 'number')
                firstDayOfWeek = defaultFirstDayOfWeek;
            return firstDayOfWeek;
        }
    });

    window.ConvertUnixTimeStampToDateStringInAngleDetails = function (time) {
        var dateText = WC.FormatHelper.GetFormattedValue(enumHandlers.FIELDTYPE.DATE, time);
        var timeText = WC.FormatHelper.GetFormattedValue(enumHandlers.FIELDTYPE.TIME, time);
        if (dateText && timeText) {
            // display as "on DATE at TIME"
            return kendo.format(' ' + Localization.StatisticDateTime, dateText, timeText);
        }
        return '';
    };

    window.ConvertMsToSec = function (time) {
        var seconds = (time / 1000) % 60;
        return kendo.toString(seconds, "#.##");
    };

    window.ConvertMillisToMinutesAndSeconds = function (millis) {
        var timeSeparator = userSettingModel.GetTimeFormatTemplateBy(enumHandlers.TIME_SETTINGS_FORMAT.SEPARATOR);
        var minutes = Math.floor(millis / 60000);
        var seconds = ((millis % 60000) / 1000).toFixed(0);
        return minutes + timeSeparator + (seconds < 10 ? '0' : '') + seconds;
    };

    window.GetWeekOfYear = function (firstDayOfWeek, d) {
        var target = new Date(+d);
        var dayNr = target.getDay() - firstDayOfWeek;
        if (dayNr < 0)
            dayNr += 7;
        target.setDate(target.getDate() - dayNr + 3);
        var firstThursday = target.valueOf();
        target.setMonth(0, 1);
        var offset = firstDayOfWeek + 3;
        if (target.getDay() != offset) {
            target.setMonth(0, 1 + ((offset - target.getDay()) + 7) % 7);
        }
        return {
            w: 1 + Math.ceil((firstThursday - target) / 604800000),
            y: target.getFullYear()
        };
    };
})(window);