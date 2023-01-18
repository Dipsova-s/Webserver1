(function (win, $) {

    var date = {
        // time picker
        unixtimeToTimePicker: function (unixtime, outputUTC) {
            if (outputUTC !== true) {
                // set time (server) to time picker
                // - start_time
                // - end_time
                let ScheduleTimeZoneInfo = MC.util.getTimezoneInfo(false);
                return MC.util.unixtimeToScheduleTime(unixtime, false, ScheduleTimeZoneInfo);
            }
            else {
                // set time (utc) to timepicker
                // - restart_delay
                // - max_run_time
                let localTimeZoneInfo = MC.util.getTimezoneInfo(true);
                return MC.util.unixtimeToUserTime(unixtime, false, localTimeZoneInfo);
            }
        },
        timePickerToUnixTime: function (date, outputUTC) {
            if (outputUTC !== true) {
                // get unixtime from time picker (local)
                // - start_time
                // - end_time
                return MC.util.dateToUnixtime(date);
            }
            else {
                // get unixtime from time picker (utc)
                // - restart_delay
                // - max_run_time
                return MC.util.dateToUnixtime(date);
            }
        },
        unixtimeToScheduleTime: function (unixtime, isLog, ScheduleTimeZoneInfo) {
            //let ScheduleTimeZoneInfo = MC.util.getTimezoneInfo(false);
            let utcTime = unixtime;

            if (!isLog) {
                utcTime = unixtime + timezoneOffsetWithDst * 60;
            }
            return MC.util.ConvertTZ(new Date(utcTime * 1000), ScheduleTimeZoneInfo.name);
        },
        unixtimeToUserTime: function (unixtime, isLog, localTimeZoneInfo) {
            //let localTimeZoneInfo = MC.util.getTimezoneInfo(true);
            let utcTime = unixtime;
            if (!isLog) {
                utcTime = unixtime + timezoneOffsetWithDst * 60;
            }
            return MC.util.ConvertTZ(new Date(utcTime * 1000), localTimeZoneInfo.name);
        },
        // date to unix
        dateToUnixtime: function (date) {
            if (date)
                return Date.UTC(1970, 0, 1, date.getHours(), date.getMinutes(), date.getSeconds()) / 1000;
            else
                return null;
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
        getDisplayTimeForGrid: function (seconds, showDate) {
            if (seconds === null)
                return '';
            let ScheduleTimeZoneInfo = MC.util.getTimezoneInfo(false);
            let localTimeZoneInfo = MC.util.getTimezoneInfo(true);
            if (showDate) {
                let scheduleDate = MC.util.unixtimeToScheduleTime(seconds, true, ScheduleTimeZoneInfo);
                let localDate = MC.util.unixtimeToUserTime(seconds, true, localTimeZoneInfo)
                if (ScheduleTimeZoneInfo.abbr == localTimeZoneInfo.abbr) {
                    return kendo.format('{0:MM/dd/yyyy HH:mm:ss}', scheduleDate);
                }
                else {
                    return kendo.format('{0:MM/dd/yyyy HH:mm:ss} {1:[HH:mm:ss]}', scheduleDate, localDate);
                }
            }
            else {
                let scheduleDate = MC.util.unixtimeToScheduleTime(seconds, false, ScheduleTimeZoneInfo);
                let localDate = MC.util.unixtimeToUserTime(seconds, false, localTimeZoneInfo)
                if (ScheduleTimeZoneInfo.abbr == localTimeZoneInfo.abbr) {
                    return kendo.format('{0:HH:mm}', scheduleDate);
                }
                else {
                    return kendo.format('{0:HH:mm} {1:[HH:mm]}', scheduleDate, localDate);
                }
            }
        },
        getDisplayTime: function (seconds, isLogin) {
            if (seconds === null)
                return '';
            let ScheduleTimeZoneInfo = MC.util.getTimezoneInfo(false);
            let localTimeZoneInfo = MC.util.getTimezoneInfo(true);
            let scheduleDate = MC.util.ConvertTZ(new Date(seconds * 1000), ScheduleTimeZoneInfo.name);
            let LocalDate = MC.util.ConvertTZ(new Date(seconds * 1000), localTimeZoneInfo.name);
            if (ScheduleTimeZoneInfo.abbr == localTimeZoneInfo.abbr || isLogin) {
                return kendo.format('{0:MM/dd/yyyy HH:mm:ss} {1}', scheduleDate, ScheduleTimeZoneInfo.abbr);
            }
            else {
                return kendo.format('{0:MM/dd/yyyy HH:mm:ss} {1} {2:[HH:mm:ss} {3}]', scheduleDate, ScheduleTimeZoneInfo.abbr, LocalDate, localTimeZoneInfo.abbr);
            }
        },
        getTimezoneInfo: function (isLocal) {
            if (isLocal)
                return MC.util.getTimezoneInfoLocal();
            else
                return MC.util.getScheduleTimeZoneInfo();
        },
        getTimezoneInfoLocal: function () {
            var date = new Date();
            var offset = date.getTimezoneOffset();
            var name = jstz.determine().name();

            return {
                id: MC.util.getTimezoneId(offset),
                abbr: kendo.timezone.abbr(date, name),
                name: name,
                fullname: date.toString().split('(')[1].slice(0, -1),
                zone: (kendo.timezone.windows_zones.findObject('zone', name) || { other_zone: '' }).other_zone
            };
        },
        getScheduleTimeZoneInfo: function () {
            var serverInfo = kendo.timezone.windows_zones.filter(function (zone) {
                return zone.other_zone === scheduleTimeZone;
            })[0];

            var info = {
                id: MC.util.getTimezoneId(window.timezoneOffset),
                abbr: '',
                name: '',
                fullname: '',
                zone: '',
                location: timezoneName.substr(timezoneName.indexOf(') ') + 2)
            };
            if (serverInfo) {
                info.abbr = kendo.timezone.abbr(window.timezoneOffset === window.timezoneOffsetWithDst ? new Date(0) : new Date(), serverInfo.zone);
                info.name = serverInfo.zone;
                info.fullname = timezoneNameWithDst;
                info.zone = serverInfo.other_zone;
            }
            return info;
        },
        getTimezoneId: function (offset) {
            var hours = parseInt(offset / -60);
            var minutes = Math.abs((hours * 60) + offset);
            return kendo.format('UTC{0}{1}{2}', offset < 0 ? '+' : '', offset === 0 ? '' : hours, minutes !== 0 ? ':' + minutes : '');
        },
        getTimezoneText: function () {
            var localTimeZoneInfo = MC.util.getTimezoneInfo(true);
            var ScheduleTimeZoneInfo = MC.util.getTimezoneInfo(false);
            if (ScheduleTimeZoneInfo.abbr == localTimeZoneInfo.abbr) {
                return kendo.format('{0}', ScheduleTimeZoneInfo.name);
            }
            else {
                return kendo.format('{0} [{1}]', ScheduleTimeZoneInfo.name, localTimeZoneInfo.name);
            }
        },
        updateTimezoneColumnName: function (grid, datafield, child) {
            var child = $(kendo.format("#{0} th[data-field='{1}']", grid, datafield)).children(child);
            child.text(MC.util.getTimezoneColumnName(child.text()));
        },
        getTimezoneColumnName: function (columnName) {
            var localTimeZoneInfo = MC.util.getTimezoneInfo(true);
            var ScheduleTimeZoneInfo = MC.util.getTimezoneInfo(false);
            if (ScheduleTimeZoneInfo.abbr == localTimeZoneInfo.abbr) {
                return kendo.format('{0} {1}', columnName, ScheduleTimeZoneInfo.abbr, localTimeZoneInfo.abbr);
            }
            else {
                return kendo.format('{0} {1} [{2}]', columnName, ScheduleTimeZoneInfo.abbr, localTimeZoneInfo.abbr);
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
        showServerClock: function (target, timeFormat) {
            var container = $(target);
            var template = [
                Localization.MC_ScheduleTimeZoneLabel + ' <span class="serverLocation"></span><br />',
                '<span class="utcOffset"></span><span class="clock"></span>'
            ].join('');
            container.html(template);

            // general
            var scheduleTimeZoneInfo = MC.util.getTimezoneInfo(false);
            var utcOffset = kendo.format('{0}', scheduleTimeZoneInfo.abbr);
            container.find('.serverLocation').html(scheduleTimeZoneInfo.name);
            container.find('.utcOffset').text(utcOffset);

            // clock
            /*var clock = container.find('.clock');
            var setClock = function () {
                var currentDate = MC.util.unixtimeToServerTime(window.currentTimestamp - (window.timezoneOffsetWithDst * 60));
                clock.text(kendo.format(timeFormat, currentDate));
            };
            timeFormat = timeFormat || '{0:HH:mm:ss}';
            clearInterval(MC.util.showClockTimer);
            setClock();
            MC.util.showClockTimer = setInterval(setClock, 1000);*/
        },
        ConvertTZ: function (date, tzString) {
            return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", { timeZone: tzString }));
        }
    };
    $.extend(win.MC.util, date);

})(window, window.jQuery);