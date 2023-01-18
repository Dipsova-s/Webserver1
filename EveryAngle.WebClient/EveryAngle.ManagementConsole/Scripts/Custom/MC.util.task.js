(function (win) {

    var getTriggerValue = function (data, property) {
        /// <summary>get trigger value from task data</summary>
        /// <param name="data" type="Object">task data</param>
        /// <param name="property" type="String">name of trigger</param>
        /// <returns type="Object"></returns>

        var trigger = MC.util.task.getTrigger(data);
        if (trigger && trigger[property] !== null)
            return trigger[property];
        return null;
    };

    var task = {
        getTrigger: function (data) {
            /// <summary>get trigger from task data</summary>
            /// <param name="data" type="Object">task data</param>
            /// <returns type="Object"></returns>

            var triggers = data.Triggers || data.triggers || [];
            if (triggers.length)
                return triggers[0];
            return null;
        },
        getTriggerType: function (data) {
            /// <summary>get trigger type from task data</summary>
            /// <param name="data" type="Object">task data</param>
            /// <returns type="String"></returns>

            return getTriggerValue(data, 'trigger_type');
        },
        isTriggerExternal: function (data) {
            /// <summary>check task data is external</summary>
            /// <param name="data" type="Object">task data</param>
            /// <returns type="Boolean"></returns>

            var triggerType = this.getTriggerType(data);
            return triggerType === 'external';
        },
        isTriggerSchedule: function (data) {
            /// <summary>check task data is schedule</summary>
            /// <param name="data" type="Object">task data</param>
            /// <returns type="Boolean"></returns>

            var triggerType = this.getTriggerType(data);
            return triggerType === 'schedule';
        },
        isTriggerEvent: function (data) {
            /// <summary>check task data is event</summary>
            /// <param name="data" type="Object">task data</param>
            /// <returns type="Boolean"></returns>

            var triggerType = this.getTriggerType(data);
            return triggerType === 'event';
        },
        getTriggerDays: function (data) {
            /// <summary>get trigger days from task data</summary>
            /// <param name="data" type="Object">task data</param>
            /// <returns type="Array"></returns>

            return getTriggerValue(data, 'days') || [];
        },
        getTriggerDayStatus: function (days, index) {
            /// <summary>get trigger day status from task data</summary>
            /// <param name="days" type="Array">days to trigger</param>
            /// <param name="index" type="Number">day index</param>
            /// <returns type="Object"></returns>

            return (days[index] && days[index].active) || false;
        },
        getDaysCheckbox: function (data) {
            /// <summary>get trigger days as html string</summary>
            /// <param name="data" type="Object">task data</param>
            /// <returns type="String"></returns>

            var days = [
                { label: 'S', value: 'S' },
                { label: 'M', value: 'M' },
                { label: 'T', value: 'T' },
                { label: 'W', value: 'W' },
                { label: 'T', value: 'TH' },
                { label: 'F', value: 'F' },
                { label: 'S', value: 'Sat' }
            ];
            var triggerDays = this.getTriggerDays(data);
            var template = "<div class=\"cellDays\" data-role=\"customcheckbox\">";
            jQuery.each(days, function (index, day) {
                var isActive = MC.util.task.getTriggerDayStatus(triggerDays, index);
                template += "<input name=\"Day_" + data.id + "\" type=\"checkbox\" class=\"continue_with_days\" disabled=\"disabled\" data-label=\"" + day.label + "\" value=\"" + day.value + "\"" + (isActive ? ' checked=\"checked\"' : '') + " />";
            });
            template += "</div>";
            return template;
        },
        getTriggerExternalUrl: function (data) {
            /// <summary>get trigger url from task data</summary>
            /// <param name="data" type="Object">task data</param>
            /// <returns type="String"></returns>

            var isExternal = this.isTriggerExternal(data);
            var uri = getTriggerValue(data, 'TriggerUri');
            var token = getTriggerValue(data, 'token');
            return isExternal && uri && token ? kendo.format('{0}?token={1}', uri, token) : '';
        },
        isContinuous: function (data) {
            /// <summary>get trigger continuous from task data</summary>
            /// <param name="data" type="Object">task data</param>
            /// <returns type="Boolean"></returns>

            return getTriggerValue(data, 'continuous') || false;
        },
        getStartTime: function (data) {
            /// <summary>get trigger start time from task data</summary>
            /// <param name="data" type="Object">task data</param>
            /// <returns type="Number"></returns>

            return getTriggerValue(data, 'start_time');
        },
        getEndTime: function (data) {
            /// <summary>get trigger end time from task data</summary>
            /// <param name="data" type="Object">task data</param>
            /// <returns type="Number"></returns>

            return getTriggerValue(data, 'end_time');
        },
        getRestartDelay: function (data) {
            /// <summary>get trigger restart delay from task data</summary>
            /// <param name="data" type="Object">task data</param>
            /// <returns type="Number"></returns>

            return getTriggerValue(data, 'restart_delay');
        },
        setTimePickerPreview: function (timePicker) {
            var element = timePicker.element;
            var value = timePicker.value();

            // find description label if not found => not set the value
            var descriptionLabel = element.closest('p').find('.descriptionLabel');

            if (value) {
                var scheduleTime = MC.util.timePickerToUnixTime(value, false);
                var userTime = MC.util.unixtimeToTimePicker(scheduleTime, true);
                var localTimeZoneInfo = MC.util.getTimezoneInfo(true);
                var ScheduleTimeZoneInfo = MC.util.getTimezoneInfo(false);
                if (ScheduleTimeZoneInfo.abbr != localTimeZoneInfo.abbr) {
                    descriptionLabel.removeClass('hidden');
                    descriptionLabel.find('.serverTimeValue').text(kendo.format('{0:HH:mm}', userTime));
                } else {
                    descriptionLabel.addClass('hidden');
                    descriptionLabel.find('.serverTimeValue').text('');
                }
            }
            else {
                descriptionLabel.addClass('hidden');
            }
        }
    };
    win.MC.util.task = task;

})(window);