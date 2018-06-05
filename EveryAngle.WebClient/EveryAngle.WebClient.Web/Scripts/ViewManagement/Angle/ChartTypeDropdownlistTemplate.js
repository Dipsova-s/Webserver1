var chartTypeDropdownlistTemplate = new ChartTypeDropdownlistTemplate();

function ChartTypeDropdownlistTemplate() {
    "use strict";

    //BOF: Model Properties
    var self = this;
    self.Template = '';
    //EOF: Model Properties

    //BOF: Model Methods
    self.ValueTemplate = function (data) {
        return '<div class="ChartTypeItem ChartTypeItemHeader"><div class="ChartTypeUsage"><span></span></div><div class="ChartTypeName">' + data.Name + '</div></div>';
    };
    self.GenerateTemplate = function (chartType, usage, chartName) {
        var result = '<div class="ChartTypeItem"><div class="ChartTypeName">' + chartName + '</div><div class="ChartTypeUsage">';
        var chartStack = chartType + '_stack';
        var chartMulti = chartType + '_multi';

        for (var loop = 1; loop <= usage; loop++) {
            if (loop === 1)
                result += '<span alt="' + chartType + '" class="chartType ' + chartType + '" onclick="fieldSettingsHandler.OnChartTypeSelected(\'' + chartType + '\');" title="' + self.GetChartHint(chartType, loop) + '"></span>';
            else if (loop === 2)
                result += '<span alt="' + chartStack + '" class="chartType ' + chartStack + '" onclick="fieldSettingsHandler.OnChartTypeSelected(\'' + chartStack + '\');" title="' + self.GetChartHint(chartType, loop) + '"></span>';
            else if (loop === 3)
                result += '<span alt="' + chartMulti + '" class="chartType ' + chartMulti + '" onclick="fieldSettingsHandler.OnChartTypeSelected(\'' + chartMulti + '\');" title="' + self.GetChartHint(chartType, loop) + '"></span>';
        }

        result += '</div></div>';

        return result;
    };
    self.GetChartHint = function (chartType, loop) {
        var result = 'Chart_';

        jQuery.each(enumHandlers.CHARTTYPE, function (key, value) {
            if (value.Code === chartType) {
                if (chartType === enumHandlers.CHARTTYPE.RADARCHART.Code) {
                    result += ('radar' + loop);
                }
                else {
                    result += (value.Code + loop);
                }
                return false;
            }
        });

        return Localization[result];
    };
    self.GetChartHintByClassName = function (classname) {
        var result = 'Chart';
        var temps = classname.split('_');
        result += temps[0].charAt(0).toUpperCase() + temps[0].slice(1);

        if (temps.length > 1)
            result += temps[1] === 'stack' ? 2 : 3;
        else
            result += 1;

        return Localization[result];
    };
    //EOF: Model Methods
}
