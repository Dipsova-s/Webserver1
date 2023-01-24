(function (win, $) {

    var date = {
        // time picker
        unixtimeToTimePicker: function (unixtime, outputUTC) {
            if (outputUTC !== true) {
                let ScheduleTimeZoneInfo = MC.util.getTimezoneInfo(false);
                return MC.util.unixtimeToTime(unixtime, false, ScheduleTimeZoneInfo);
            }
            else {
                let localTimeZoneInfo = MC.util.getTimezoneInfo(true);
                return MC.util.unixtimeToTime(unixtime, false, localTimeZoneInfo);
            }
        },
        timePickerToUnixTime: function (date) {
            if (date)
                return Date.UTC(1970, 0, 1, date.getHours(), date.getMinutes(), date.getSeconds()) / 1000;
            else
                return null;
        },
        unixtimeToTime: function (unixtime, isLog, localTimeZoneInfo) {
            let utcTime = unixtime;
            if (!isLog) {
                utcTime = unixtime + timezoneOffsetWithDst * 60;
            }
            return MC.util.ConvertTZ(new Date(utcTime * 1000), localTimeZoneInfo.name);
        },
        dateStringToTimestamp: function (dateString) {
            var date = new Date(dateString ? dateString : '');
            var timestamp = kendo.date.toUtcTime(date);
            return !isNaN(timestamp) ? timestamp / 1000 : null;
        },
        getDisplayTimeUTC: function (seconds) {
            if (seconds === null)
                return '';

            var date = new Date(seconds * 1000);
            return kendo.format('{0:00}:{1:00}', date.getUTCHours(), date.getUTCMinutes());
        },
        getDisplayTimeForGrid: function (seconds, isLog) {
            if (seconds === null)
                return '';
            let scheduleTimeZoneInfo = MC.util.getTimezoneInfo(false);
            let localTimeZoneInfo = MC.util.getTimezoneInfo(true);
            let scheduleDate = MC.util.unixtimeToTime(seconds, isLog, scheduleTimeZoneInfo);
            let localDate = MC.util.unixtimeToTime(seconds, isLog, localTimeZoneInfo);
            let scheduleDateWithOutTime = new Date(scheduleDate.getFullYear(), scheduleDate.getMonth(), scheduleDate.getDate());
            let localDateWithOutTime = new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate());
            if (isLog) {
                if (scheduleTimeZoneInfo.abbr == localTimeZoneInfo.abbr) {
                    return kendo.format('{0:MM/dd/yyyy HH:mm:ss}', scheduleDate);
                }
                else {
                    if (scheduleDateWithOutTime.getTime() === localDateWithOutTime.getTime())
                        return kendo.format('{0:MM/dd/yyyy HH:mm:ss} {1:[HH:mm]}', scheduleDate, localDate);
                    else if (scheduleDateWithOutTime < localDateWithOutTime)
                        return kendo.format('{0:MM/dd/yyyy HH:mm:ss} {1:[HH:mm}<sup>+1</sup>]', scheduleDate, localDate);
                    else
                        return kendo.format('{0:MM/dd/yyyy HH:mm:ss} {1:[HH:mm}<sup>-1</sup>]', scheduleDate, localDate);
                }
            }
            else {
                if (scheduleTimeZoneInfo.abbr == localTimeZoneInfo.abbr) {
                    return kendo.format('{0:HH:mm}', scheduleDate);
                }
                else {
                    if (scheduleDateWithOutTime.getTime() === localDateWithOutTime.getTime())
                        return kendo.format('{0:HH:mm} {1:[HH:mm]}', scheduleDate, localDate);
                    else if (scheduleDateWithOutTime < localDateWithOutTime)
                        return kendo.format('{0:HH:mm} {1:[HH:mm}<sup>+1</sup>]', scheduleDate, localDate);
                    else
                        return kendo.format('{0:HH:mm} {1:[HH:mm}<sup>-1</sup>]', scheduleDate, localDate);
                }
            }
        },
        getDisplayTime: function (seconds, isLogin) {
            if (seconds === null)
                return '';
            let scheduleTimeZoneInfo = MC.util.getTimezoneInfo(false);
            let localTimeZoneInfo = MC.util.getTimezoneInfo(true);
            let scheduleDate = MC.util.ConvertTZ(new Date(seconds * 1000), scheduleTimeZoneInfo.name);
            let localDate = MC.util.ConvertTZ(new Date(seconds * 1000), localTimeZoneInfo.name);
            let scheduleDateWithOutTime = new Date(scheduleDate.getFullYear(), scheduleDate.getMonth(), scheduleDate.getDate());
            let localDateWithOutTime = new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate());
            if (scheduleTimeZoneInfo.abbr === localTimeZoneInfo.abbr || isLogin) {
                return kendo.format('{0:MM/dd/yyyy HH:mm:ss} {1}', scheduleDate, scheduleTimeZoneInfo.abbr);
            }
            else {
                if (scheduleDateWithOutTime.getTime() === localDateWithOutTime.getTime())
                    return kendo.format('{0:MM/dd/yyyy HH:mm:ss} {1} {2:[HH:mm:ss} {3}]', scheduleDate, scheduleTimeZoneInfo.abbr, localDate, localTimeZoneInfo.abbr);
                else if (scheduleDateWithOutTime < scheduleDateWithOutTime)
                    return kendo.format('{0:MM/dd/yyyy HH:mm:ss} {1} {2:[HH:mm:ss}<sup>+1</sup> {3}]', scheduleDate, scheduleTimeZoneInfo.abbr, localDate, localTimeZoneInfo.abbr);
                else
                    return kendo.format('{0:MM/dd/yyyy HH:mm:ss} {1} {2:[HH:mm:ss}<sup>-1</sup> {3}]', scheduleDate, scheduleTimeZoneInfo.abbr, localDate, localTimeZoneInfo.abbr);
            }
        },
        getTimezoneInfo: function (isLocal) {
            if (isLocal)
                return MC.util.getTimezoneInfoLocal();
            else
                return MC.util.getScheduleTimeZoneInfo();
        },
        getTimezoneInfoLocal: function () {
            let date = new Date();
            let offset = date.getTimezoneOffset();
            let name = jstz.determine().name();
            if (name === 'UTC') {
                name = 'Etc/GMT'
            }

            return {
                id: MC.util.getTimezoneId(offset),
                abbr: kendo.timezone.abbr(date, name),
                name: name,
                zone: (kendo.timezone.windows_zones.findObject('zone', name) || { other_zone: '' }).other_zone
            };
        },
        getScheduleTimeZoneInfo: function () {
            let serverInfo = kendo.timezone.windows_zones.filter(function (zone) {
                return zone.other_zone === scheduleTimeZone;
            })[0];

            let info = {
                id: MC.util.getTimezoneId(window.timezoneOffset),
                abbr: '',
                name: '',
                fullname: '',
                zone: ''
            };
            if (serverInfo) {
                info.abbr = kendo.timezone.abbr(window.timezoneOffset === window.timezoneOffsetWithDst ? new Date(0) : new Date(), serverInfo.zone);
                info.name = serverInfo.zone;
                info.zone = serverInfo.other_zone;
            }
            return info;
        },
        getTimezoneId: function (offset) {
            let hours = parseInt(offset / -60);
            let minutes = Math.abs((hours * 60) + offset);
            return kendo.format('UTC{0}{1}{2}', offset < 0 ? '+' : '', offset === 0 ? '' : hours, minutes !== 0 ? ':' + minutes : '');
        },
        getTimezoneText: function () {
            let localTimeZoneInfo = MC.util.getTimezoneInfo(true);
            let scheduleTimeZoneInfo = MC.util.getTimezoneInfo(false);
            if (scheduleTimeZoneInfo.abbr == localTimeZoneInfo.abbr) {
                return kendo.format('{0}', scheduleTimeZoneInfo.name);
            }
            else {
                return kendo.format('{0} [{1}]', scheduleTimeZoneInfo.name, localTimeZoneInfo.name);
            }
        },
        updateTimezoneColumnName: function (grid, datafield, child) {
            let childElement = $(kendo.format("#{0} th[data-field='{1}']", grid, datafield)).children(child);
            childElement.text(MC.util.getTimezoneColumnName(childElement.text()));
        },
        getTimezoneColumnName: function (columnName) {
            let localTimeZoneInfo = MC.util.getTimezoneInfo(true);
            let scheduleTimeZoneInfo = MC.util.getTimezoneInfo(false);
            if (scheduleTimeZoneInfo.abbr == localTimeZoneInfo.abbr) {
                return kendo.format('{0} {1}', columnName, scheduleTimeZoneInfo.abbr, localTimeZoneInfo.abbr);
            }
            else {
                return kendo.format('{0} {1} [{2}]', columnName, scheduleTimeZoneInfo.abbr, localTimeZoneInfo.abbr);
            }
        },
        readableDate: function (time) {
            time = parseInt(time / 1000);

            var days = parseInt(time / 86400);
            time = time - (days * 86400);

            var hours = parseInt(time / 3600);
            time = time - (hours * 3600);

            var minutes = parseInt(time / 60);
            time = time - (minutes * 60);

            days = Math.max(0, days);
            hours = Math.max(0, hours);
            minutes = Math.max(0, minutes);

            var contents = [];
            if (days)
                contents.push(days + ' ' + Localization.MC_Day);
            if (hours || days)
                contents.push(hours + ' ' + Localization.MC_Hr);
            contents.push(minutes + ' ' + Localization.MC_Mins);

            return contents.join(' ');
        },
        showServerClock: function (target) {
            var container = $(target);
            var template = [
                Localization.MC_ScheduleTimeZoneLabel + ' <span class="serverLocation"></span><br />',
                '<span class="utcOffset"></span>'
            ].join('');
            container.html(template);

            // general
            var scheduleTimeZoneInfo = MC.util.getTimezoneInfo(false);
            var utcOffset = kendo.format('{0}', scheduleTimeZoneInfo.abbr);
            container.find('.serverLocation').html(scheduleTimeZoneInfo.name);
            container.find('.utcOffset').text(utcOffset);
        },
        ConvertTZ: function (date, tzString) {
            return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", { timeZone: tzString }));
        }
    };
    $.extend(win.MC.util, date);

})(window, window.jQuery);