(function (win, $) {

    var date = {
        // time picker
        unixtimeToTimePicker: function (unixtime, outputUTC) {
            if (outputUTC !== true) {
                // set time (server) to time picker
                // - start_time
                // - end_time
                return MC.util.unixtimeToLocalTime(unixtime);
            }
            else {
                // set time (utc) to timepicker
                // - restart_delay
                // - max_run_time
                return MC.util.unixtimeToServerTime(unixtime);
            }
        },
        timePickerToUnixTime: function (date, outputUTC) {
            if (outputUTC !== true) {
                // get unixtime from time picker (local)
                // - start_time
                // - end_time
                return MC.util.localDateToUnixtime(date);
            }
            else {
                // get unixtime from time picker (utc)
                // - restart_delay
                // - max_run_time
                return MC.util.dateToUnixtime(date);
            }
        },

        // unix to date
        unixtimeToLocalTime: function (unixtime) {
            var serverDate = MC.util.unixtimeToServerTime(unixtime);
            var localDateTimezone = (new Date()).getTimezoneOffset();
            return kendo.timezone.convert(serverDate, window.timezoneOffsetWithDst, localDateTimezone);
        },
        unixtimeToServerTime: function (unixtime) {
            var localDate = new Date(unixtime * 1000);
            var localDateTimezone = localDate.getTimezoneOffset();
            return kendo.timezone.convert(localDate, localDateTimezone, 0);
        },

        // date to unix
        dateToUnixtime: function (date) {
            if (date)
                return Date.UTC(1970, 0, 1, date.getHours(), date.getMinutes(), date.getSeconds()) / 1000;
            else
                return null;
        },
        localDateToUnixtime: function (date) {
            if (date) {
                var localDateTimezone = (new Date()).getTimezoneOffset();
                var serverDate = kendo.timezone.convert(date, localDateTimezone, window.timezoneOffsetWithDst);
                return MC.util.dateToUnixtime(serverDate);
            }
            else {
                return null;
            }
        },

        // date utilities
        localDateToUnixTimestamp: function (localDate) {
            var kendoDate = kendo.date.getDate(localDate);
            return kendo.date.toUtcTime(kendoDate) / 1000;
        },
        unixTimestampToDate: function (unixTimestamp) {
            return new Date(unixTimestamp * 1000);
        },

        // display
        getDisplayTimeUTC: function (seconds) {
            if (seconds == null)
                return '';

            var date = new Date(seconds * 1000);
            return kendo.format('{0:00}:{1:00}', date.getUTCHours(), date.getUTCMinutes());
        },
        getDisplayTimeLocal: function (seconds) {
            if (seconds == null)
                return '';

            var serverDate = MC.util.unixtimeToServerTime(seconds);
            return kendo.format('{0:HH:mm}', serverDate);
        },
        getTimezoneInfo: function (isLocal) {
            if (isLocal)
                return MC.util.getTimezoneInfoLocal();
            else
                return MC.util.getTimezoneInfoServer();
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
        getTimezoneInfoServer: function () {
            var serverInfo = kendo.timezone.windows_zones.filter(function (zone) {
                return zone.other_zone === timezoneId && timezoneName.indexOf(zone.territory) !== -1;
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
            var timezoneInfo = MC.util.getTimezoneInfo(false);
            return kendo.format('{0}, {1} ({2})', timezoneInfo.name, timezoneInfo.fullname, timezoneInfo.id);
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
                Localization.MC_ServerLocationLabel + ' <span class="serverLocation"></span><br />',
                Localization.MC_UtcOffsetLabel + ' <span class="utcOffset"></span><span class="clock"></span>'
            ].join('');
            container.html(template);

            // general
            var serverTimeInfo = MC.util.getTimezoneInfo(false);
            var utcOffset = kendo.format('{0} {1} {2}', serverTimeInfo.id !== 'UTC' ? serverTimeInfo.id.replace('UTC', '') : '0', Localization.MC_Hours, serverTimeInfo.abbr);
            container.find('.serverLocation').html(serverTimeInfo.location);
            container.find('.utcOffset').text(utcOffset);

            // clock
            var clock = container.find('.clock');
            var setClock = function () {
                var currentDate = MC.util.unixtimeToServerTime(window.currentTimestamp - (window.timezoneOffsetWithDst * 60));
                clock.text(kendo.format(timeFormat, currentDate));
            };
            timeFormat = timeFormat || '{0:HH:mm:ss}';
            clearInterval(MC.util.showClockTimer);
            setClock();
            MC.util.showClockTimer = setInterval(setClock, 1000);
        }
    };
    $.extend(win.MC.util, date);

})(window, window.jQuery);