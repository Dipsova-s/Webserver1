(function (window) {
    var helper = {
        // general
        GetType: function (details) {
            return details.chart_type;
        },
        IsStacked: function (details) {
            return details.stack;
        },
        IsMultiAxis: function (details) {
            return details.multi_axis;
        },
        GetMultiAxisType: function (index, type) {
            if (index === 0) {
                return type === enumHandlers.CHARTTYPE.LINECHART.Code
                    ? enumHandlers.CHARTTYPE.AREACHART.Code
                    : type;
            }
            else {
                if (type === enumHandlers.CHARTTYPE.AREACHART.Code)
                    return enumHandlers.CHARTTYPE.COLUMNCHART.Code;
                else if (type === enumHandlers.CHARTTYPE.COLUMNCHART.Code)
                    return enumHandlers.CHARTTYPE.LINECHART.Code;
                return type;
            }
        },
        GetMultiAxisStack: function (type) {
            return type === enumHandlers.CHARTTYPE.COLUMNCHART.Code
                || type === enumHandlers.CHARTTYPE.AREACHART.Code;
        },

        // radar
        IsRadarType: function (type) {
            return WC.Utility.ToString(type).indexOf('radar') !== -1;
        },
        GetRadar2ndType: function () {
            return 'radarArea';
        },

        // scatter + bubble
        IsScatterType: function (type) {
            return WC.Utility.ToString(type).indexOf(enumHandlers.CHARTTYPE.SCATTERCHART.Code) !== -1;
        },
        IsBubbleType: function (type) {
            return type === enumHandlers.CHARTTYPE.BUBBLECHART.Code;
        },
        IsScatterOrBubbleType: function (type) {
            return helper.IsBubbleType(type) || helper.IsScatterType(type);
        },
        GetScatterLineType: function () {
            return enumHandlers.CHARTTYPE.SCATTERCHART.Code + 'Line';
        },

        // dnut + pie
        IsDonutOrPieType: function (type) {
            return type === enumHandlers.CHARTTYPE.PIECHART.Code || type === enumHandlers.CHARTTYPE.DONUTCHART.Code;
        },

        // gauge
        IsGaugeType: function (type) {
            return type === enumHandlers.CHARTTYPE.GAUGE.Code;
        },
        GetGaugeDefault: function () {
            return {
                values: [0, 20, 40, 60, 80, 100],
                colors: ['#ed0000', '#eda100', '#4dc632', '#eda100', '#ed0000']
            };
        }
    };
    window.ChartHelper = helper;
})(window);