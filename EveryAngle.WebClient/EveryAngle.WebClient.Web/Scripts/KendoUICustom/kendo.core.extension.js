(function (window, kendo, $) {

    // extend to kendo.date
    kendo.date.SEC_PER_DAY = 86400;
    kendo.date.unixToDate = function (unix) {
        return new Date(unix * 1000);
    };
    kendo.date.unixToUtcDate = function (time) {
        var date = this.unixToDate(time);
        return this.dateToUtcDate(date);
    };
    kendo.date.dateToUtcDate = function (date) {
        return kendo.timezone.convert(date, date.getTimezoneOffset(), 0);
    };
    kendo.date.dateToUnix = function (date, hasTime) {
        if (hasTime === false) {
            date = kendo.date.getDate(date);
        }
        return kendo.date.toUtcTime(date) / 1000;
    };
    kendo.date.timeToUnix = function (date) {
        var time = new Date(1970, 0, 1, date.getHours(), date.getMinutes(), date.getSeconds());
        return this.dateToUnix(time);
    };
    kendo.date.getTimeSpan = function (value) {
        if (isNaN(parseFloat(value)))
            return null;

        // cleanup number
        value = ('' + value).replace(/,/g, '');

        var isNegative = value[0] === '-';
        var valuePositive = isNegative ? value.substr(1) : value;
        var valueParts = valuePositive.split('.');
        var days = parseInt(valueParts[0]);

        if (typeof valueParts[1] !== 'undefined')
            valueParts[1] = '0.' + valueParts[1];
        else
            valueParts[1] = '0';

        var date = this.unixToDate(parseFloat(valueParts[1]) * this.SEC_PER_DAY);
        var time = this.dateToUtcDate(date);
        var addSecond = Math.round(time.getMilliseconds() / 1000);
        time.setSeconds(time.getSeconds() + addSecond);

        return {
            negative: isNegative,
            days: days,
            time: time
        };
    };
    kendo.date.toTimeSpan = function (days, time, negative) {
        if (typeof days === 'number' && time instanceof Date) {
            var part1 = days * (negative ? -1 : 1);
            var part2 = ('' + (this.dateToUnix(time) / this.SEC_PER_DAY)).replace('0.', '');
            return parseFloat(part1 + '.' + part2);
        }
        return null;
    };

    // extend kendo core
    var formatRegExp = /\{(\d+)(:[^\}]+)?\}/g;
    var isDurationFormat = function (fmt) {
        return typeof fmt === 'string' && fmt.toLowerCase().indexOf('h]') !== -1;
    };
    var formatDuration = function (value, fmt, culture) {
        if (!isNaN(parseFloat(value))) {
            var fotmat = fmt.replace('[h]', 'HH');
            var timespan = kendo.date.getTimeSpan(value);
            var days = (timespan.negative ? '-' : '') + timespan.days;

            return [days, window.textDays, kendo.__toString(timespan.time, fotmat)].join(' ');
        }
        return '';
    };

    kendo.__toString = kendo.toString;
    kendo.toString = function (value, fmt, culture) {
        if (isDurationFormat(fmt))
            return formatDuration(value, fmt, culture);
        return kendo.__toString.apply(kendo, arguments);
    };

    kendo.__format = kendo.format;
    kendo.format = function (fmt) {
        if (isDurationFormat(fmt)) {
            var values = arguments;
            return fmt.replace(formatRegExp, function (match, index, placeholderFormat) {
                var value = values[parseInt(index, 10) + 1];
                return kendo.toString(value, placeholderFormat ? placeholderFormat.substring(1) : '');
            });
        }
        return kendo.__format.apply(kendo, arguments);
    };

    kendo.ui.progress = function(container, toggle) {
        var mask = container.find(".k-loading-mask");

        if (toggle) {
            if (!mask.length) {
                mask = $("<div class='k-loading-mask'><span class='k-loading-text'>" + getLoadingIconSvg() + "</span><div class='k-loading-image'/><div class='k-loading-color'/></div>")
                    .width("100%").height("100%")
                    .prependTo(container)
                    .css({ top: container.scrollTop(), left: container.scrollLeft() });
            }
        } else if (mask) {
            mask.remove();
        }
    }

})(window, window.kendo, window.jQuery);