function ChartOptionsHandler(displayHandler) {
    "use strict";

    var _self = {};
    _self.$container = jQuery();
    _self.axisScaleRangeValues = {};
    _self.showAsPercentageId = 'show_as_percentage';
    _self.values = {};

    var self = this;
    self.DisplayHandler = null;
    self.View = new ChartOptionsView();
    self.Data = {
        axistitle: {
            title: Captions.Label_ChartOptions_AxisTitle,
            value: ko.observable(null),
            valid: ko.observable(false),
            ui: ChartOptionsHandler.UI.Dropdown,
            options: [
                {
                    id: 'show',
                    name: Captions.Label_ChartOptions_AxisTitle_Show,
                    is_default: true
                },
                {
                    id: 'hide',
                    name: Captions.Label_ChartOptions_AxisTitle_Hide
                },
                {
                    id: 'show-x',
                    name: Captions.Label_ChartOptions_AxisTitle_ShowX
                },
                {
                    id: 'show-y',
                    name: Captions.Label_ChartOptions_AxisTitle_ShowY
                }
            ]
        },
        axistitlegauge: {
            title: Captions.Label_ChartOptions_AxisTitle,
            value: ko.observable(null),
            valid: ko.observable(false),
            ui: ChartOptionsHandler.UI.Dropdown,
            options: [
                {
                    id: 'show',
                    name: Captions.Label_ChartOptions_AxisTitle_Show,
                    is_default: true
                },
                {
                    id: 'hide',
                    name: Captions.Label_ChartOptions_AxisTitle_Hide
                }
            ]
        },
        axisvalue: {
            title: Captions.Label_ChartOptions_AxisValue,
            value: ko.observable(null),
            valid: ko.observable(false),
            ui: ChartOptionsHandler.UI.Dropdown,
            options: [
                {
                    id: 'show',
                    name: Captions.Label_ChartOptions_AxisValue_Show,
                    is_default: true
                },
                {
                    id: 'hide',
                    name: Captions.Label_ChartOptions_AxisValue_Hide
                },
                {
                    id: 'show-x',
                    name: Captions.Label_ChartOptions_AxisValue_ShowX
                },
                {
                    id: 'show-y',
                    name: Captions.Label_ChartOptions_AxisValue_ShowY
                }
            ]
        },
        axisvalueradar: {
            title: Captions.Label_ChartOptions_AxisValue,
            value: ko.observable(null),
            valid: ko.observable(false),
            ui: ChartOptionsHandler.UI.Dropdown,
            options: [
                {
                    id: 'show',
                    name: Captions.Label_ChartOptions_AxisValue_Show,
                    is_default: true
                },
                {
                    id: 'hide',
                    name: Captions.Label_ChartOptions_AxisValue_Hide
                }
            ]
        },
        axisscale: {
            title: Captions.Label_ChartOptions_AxisScale,
            value: ko.observable(null),
            valid: ko.observable(false),
            ui: ChartOptionsHandler.UI.Dropdown,
            options: [
                {
                    id: ChartOptionsHandler.ScaleType.Automatic,
                    name: Captions.Label_ChartOptions_AxisScale_Automatic,
                    is_default: true
                },
                {
                    id: ChartOptionsHandler.ScaleType.Manual,
                    name: Captions.Label_ChartOptions_AxisScale_Manual
                }
            ]
        },
        datalabel: {
            title: Captions.Label_ChartOptions_DataLabel,
            value: ko.observable(null),
            valid: ko.observable(false),
            ui: ChartOptionsHandler.UI.Dropdown,
            options: [
                {
                    id: 'show',
                    name: Captions.Label_ChartOptions_DataLabel_Show
                },
                {
                    id: 'show_values',
                    name: Captions.Label_ChartOptions_DataLabel_ShowValues
                },
                {
                    id: 'hide',
                    name: Captions.Label_ChartOptions_DataLabel_Hide
                },
                {
                    id: 'mouse',
                    name: Captions.Label_ChartOptions_DataLabel_Mouse,
                    is_default: true
                }
            ]
        },
        datalabelgauge: {
            title: Captions.Label_ChartOptions_DataLabel,
            value: ko.observable(null),
            valid: ko.observable(false),
            ui: ChartOptionsHandler.UI.Dropdown,
            options: [
                {
                    id: 'show',
                    name: Captions.Label_ChartOptions_DataLabel_Show,
                    is_default: true
                },
                {
                    id: 'hide',
                    name: Captions.Label_ChartOptions_DataLabel_Hide
                }
            ]
        },
        gridline: {
            title: Captions.Label_ChartOptions_Gridline,
            value: ko.observable(null),
            valid: ko.observable(false),
            ui: ChartOptionsHandler.UI.Dropdown,
            options: [
                {
                    id: 'show',
                    name: Captions.Label_ChartOptions_Gridline_Show,
                    is_default: true
                },
                {
                    id: 'show-x',
                    name: Captions.Label_ChartOptions_Gridline_ShowX
                },
                {
                    id: 'show-y',
                    name: Captions.Label_ChartOptions_Gridline_ShowY
                },
                {
                    id: 'hide',
                    name: Captions.Label_ChartOptions_Gridline_Hide
                }
            ]
        },
        gridlineradar: {
            title: Captions.Label_ChartOptions_Gridline,
            value: ko.observable(null),
            valid: ko.observable(false),
            ui: ChartOptionsHandler.UI.Dropdown,
            options: [
                {
                    id: 'show',
                    name: Captions.Label_ChartOptions_GridlineRadar_Show,
                    is_default: true
                },
                {
                    id: 'hide',
                    name: Captions.Label_ChartOptions_GridlineRadar_Hide
                }
            ]
        },
        legend: {
            title: Captions.Label_ChartOptions_Legend,
            value: ko.observable(null),
            valid: ko.observable(false),
            ui: ChartOptionsHandler.UI.Dropdown,
            options: [
                {
                    id: 'show',
                    name: Captions.Label_ChartOptions_Legend_Show,
                    is_default: true
                },
                {
                    id: 'hide',
                    name: Captions.Label_ChartOptions_Legend_Hide
                }
            ]
        },
        gridlinetype: {
            title: Captions.Label_ChartOptions_GridlineType,
            value: ko.observable(null),
            valid: ko.observable(false),
            ui: ChartOptionsHandler.UI.Dropdown,
            options: [
                {
                    id: 'arc',
                    name: Captions.Label_ChartOptions_GridlineType_Arc,
                    is_default: true
                },
                {
                    id: 'line',
                    name: Captions.Label_ChartOptions_GridlineType_Line
                }
            ]
        },
        rangesgauge: {
            title: Captions.Label_ChartOptions_Ranges,
            value: ko.observable(null),
            valid: ko.observable(false),
            ui: ChartOptionsHandler.UI.Dropdown,
            options: [
                {
                    id: 'show',
                    name: Captions.Label_ChartOptions_Ranges_Show,
                    is_default: true
                },
                {
                    id: 'hide',
                    name: Captions.Label_ChartOptions_Ranges_Hide
                }
            ]
        },
        show_as_percentage: {
            title: Captions.Label_ChartOptions_ShowAsPercentage,
            value: ko.observable(false),
            valid: ko.observable(false),
            ui: ChartOptionsHandler.UI.Checkbox,
            options: []
        }
    };
    self.Group = {
        Gauge: [
            'axistitlegauge',
            'datalabelgauge',
            'rangesgauge'
        ],
        Radar: [
            'axisvalueradar',
            'datalabel',
            'gridlineradar',
            'gridlinetype',
            'legend'
        ],
        Pie: [
            'datalabel',
            'legend'
        ],
        Box1: [
            'axistitle',
            'axisvalue',
            'axisscale',
            'datalabel',
            'gridline',
            'legend',
            'show_as_percentage'
        ],
        Box2: [
            'axistitle',
            'axisvalue',
            'axisscale',
            'datalabel',
            'gridline',
            'legend'
        ]
    };

    // general
    self.Initial = function (displayHandler) {
        self.DisplayHandler = displayHandler;
        self.SetValidOptions();
        self.SetValues();
    };
    self.GetType = function () {
        return ChartHelper.GetType(self.GetOptions());
    };
    self.GetOptions = function () {
        return self.DisplayHandler.QueryDefinitionHandler.AggregationOptions();
    };
    self.SetOptions = function () {
        // update values
        var options = self.GetOptions();        
        jQuery.each(self.Data, function (id, data) {
            if (data.valid()) {
                options[id] = data.value();
            }
            else
                delete options[id];
        });

        // update scale range values
        var data = self.Data[ChartOptionsHandler.AxisScaleId];
        if (!data.valid() || data.value() !== ChartOptionsHandler.ScaleType.Manual) {
            delete options[ChartOptionsHandler.AxisScaleRangesId];
        }
        else {
            options[ChartOptionsHandler.AxisScaleRangesId] = _self.axisScaleRangeValues;
        }

        // commit
        self.DisplayHandler.QueryDefinitionHandler.AggregationOptions(options);
    };
    self.GetValidOptions = function () {
        var type = self.GetType();
        if (ChartHelper.IsGaugeType(type))
            return self.Group.Gauge;
        if (ChartHelper.IsRadarType(type))
            return self.Group.Radar;
        if (ChartHelper.IsDonutOrPieType(type))
            return self.Group.Pie;
        if (self.CanShowAsPercentage())
            return self.Group.Box1;
        return self.Group.Box2;
    };
    self.SetValidOptions = function () {
        var options = self.GetValidOptions();
        jQuery.each(options, function (_index, option) {
            self.Data[option].valid(true);
        });
    };
    self.SetValues = function () {
        var options = self.GetOptions();
        jQuery.each(self.Data, function (id, data) {
            if (data.valid()) {
                var value = self.GetValueOrDefault(options[id], data);
                _self.values[id] = value;
                data.value(value);
            }
        });

        var axisScaleData = self.Data[ChartOptionsHandler.AxisScaleId];
        if (axisScaleData.valid()) {
            if (!self.CanUseAxisScaleRange()) {
                axisScaleData.value(ChartOptionsHandler.ScaleType.Automatic);
            }
            var rangeValues = options[ChartOptionsHandler.AxisScaleRangesId] || {};
            _self.values[ChartOptionsHandler.AxisScaleRangesId] = ko.toJS(rangeValues);
            _self.axisScaleRangeValues = ko.toJS(rangeValues);
        }
    };
    self.GetValueOrDefault = function (value, data) {
        if (typeof value === 'undefined')
            value = !data.options.length ? data.value() : data.options.findObject('is_default', true).id;
        return value;
    };
    self.CanShowAsPercentage = function () {
        var supportTypes = [
            enumHandlers.CHARTTYPE.AREACHART.Code,
            enumHandlers.CHARTTYPE.BARCHART.Code,
            enumHandlers.CHARTTYPE.COLUMNCHART.Code,
            enumHandlers.CHARTTYPE.LINECHART.Code
        ];
        var isSupportChartType = jQuery.inArray(self.GetType(), supportTypes) !== -1;
        var isSupportStackType = ChartHelper.IsMultiAxis(self.GetOptions()) || ChartHelper.IsStacked(self.GetOptions());
        return isSupportChartType && isSupportStackType;
    };
    self.HasChanged = function () {
        // check axis scale ranges
        var rawValue = _self.values[ChartOptionsHandler.AxisScaleRangesId] || {};
        var currentValue = _self.axisScaleRangeValues;
        var hasChanged = !jQuery.deepCompare(rawValue, currentValue, false, false);

        // check others
        jQuery.each(self.Data, function (id, model) {
            if (model.valid() && model.value() !== _self.values[id]) {
                hasChanged = true;
                return false;
            }
        });

        return hasChanged;
    };

    // popup
    self.ShowPopup = function () {
        if (jQuery('#PopupAggregationOptions').is(':visible'))
            return;

        var options = self.GetPopupOptions();
        popup.Show(options);
    };
    self.ClosePopup = function () {
        popup.Close('#PopupAggregationOptions');
    };
    self.OnPopupClose = function (e) {
        if (self.HasChanged()) {
            self.DisplayHandler.QueryDefinitionHandler.OpenAggregationPanel();
            self.SetOptions();
        }
        popup.Destroy(e);
    };
    self.GetPopupOptions = function () {
        var position = jQuery('.section-aggregation .action-options').offset();
        position.top -= 10;
        position.left += 25;
        return {
            element: '#PopupAggregationOptions',
            html: self.View.GetTemplate(self.Data),
            className: 'aggregation-options-popup',
            actions: [],
            width: 280,
            minHeight: 100,
            resizable: false,
            center: false,
            position: position,
            open: self.ShowPopupCallback,
            close: self.OnPopupClose
        };
    };
    self.ShowPopupCallback = function (e) {
        jQuery('.k-overlay').css('opacity', 0);
        _self.$container = e.sender.element;
        self.InitialUI();

        var space = 10;
        var popupBoundary = { top: e.sender.wrapper.offset().top };
        popupBoundary.bottom = popupBoundary.top + e.sender.wrapper.outerHeight();
        if (popupBoundary.bottom > WC.Window.Height - space) {
            e.sender.wrapper.css('top', popupBoundary.top - (popupBoundary.bottom - WC.Window.Height) - space);
        }
    };
    self.InitialUI = function () {
        var options = self.GetValidOptions();
        jQuery.each(options, function (_index, id) {
            var model = self.Data[id];
            var element = _self.$container.find('input[name="' + id + '"]');
            if (model.ui === ChartOptionsHandler.UI.Dropdown)
                self.CreateDropdown(element, model);
            else
                self.CreateCheckbox(element, model);
        });
    };

    // checkbox UI
    self.CreateCheckbox = function (element, model) {
        element
            .prop('checked', model.value())
            .off('change').on('change', jQuery.proxy(self.CheckboxChange, self, model.id));
        self.CheckShowAsPercentageUI(model);
    };
    self.CheckboxChange = function (id, e) {
        var value = e.currentTarget.checked;
        var model = self.Data[id];
        model.value(value);
        self.CheckShowAsPercentageUI(model);
    };
    self.CheckShowAsPercentageUI = function (model) {
        if (model.id !== _self.showAsPercentageId)
            return;

        if (model.value()) {
            _self.$container.find('.row-' + ChartOptionsHandler.AxisScaleId).hide();
            _self.$container.find('.row-' + ChartOptionsHandler.AxisScaleRangesId).hide();
        }
        else {
            _self.$container.find('.row-' + ChartOptionsHandler.AxisScaleId).show();
            _self.$container.find('.row-' + ChartOptionsHandler.AxisScaleRangesId).show();
        }
    };

    // dropdown UI
    self.CreateDropdown = function (element, model) {
        var dropdown = WC.HtmlHelper.DropdownList(element, model.options, {
            open: self.DropdownOpen,
            change: jQuery.proxy(self.DropdownChange, self, model.id)
        });
        dropdown.value(model.value());
        self.CheckAxisScaleRangesUI(model);
    };
    self.DropdownOpen = function (e) {
        e.sender.popup.element.addClass('aggregation-option-dropdown');
    };
    self.DropdownChange = function (id, e) {
        var value = e.sender.value();
        var model = self.Data[id];
        model.value(value);
        self.CheckAxisScaleRangesUI(model);
    };

    // axis scale ranges
    self.CheckAxisScaleRangesUI = function (model) {
        if (model.id !== ChartOptionsHandler.AxisScaleId)
            return;

        _self.$container.find('.row-' + ChartOptionsHandler.AxisScaleRangesId).remove();
        if (model.value() !== ChartOptionsHandler.ScaleType.Manual)
            return;

        self.CreateAxisScaleRangesUI();
    };
    self.CreateAxisScaleRangesUI = function () {
        var target = _self.$container.find('.row-' + ChartOptionsHandler.AxisScaleId);
        var dataFields = self.DisplayHandler.QueryDefinitionHandler.GetAggregationDataFields();
        var inputIndex = 0;
        var axisScaleRangeValues = self.GetAxisScaleRanges();
        jQuery.each(dataFields, function (index, dataField) {
            if (!self.CanSetAxisScaleRange(dataField))
                return;
            
            var fieldId = dataField.field();
            var settings = self.GetAxisScaleSettings(dataField);
            var boundary = self.GetAxisScaleBoundary(settings, axisScaleRangeValues[fieldId]);

            // create html
            var template = self.View.GetTemplateAxisScaleRange();
            var model = {
                id: ChartOptionsHandler.AxisScaleRangesId + '-' + inputIndex,
                name: ChartOptionsHandler.AxisScaleRangesId,
                title: self.DisplayHandler.QueryDefinitionHandler.GetAggregationName(dataField),
                connector: Localization.To,
                suffix: WC.Utility.ToString(settings.suffix)
            };
            var html = kendo.template(template)(model);
            var element = jQuery(html);
            target.after(element);

            // create UI
            var inputLower = element.find('input.axis-scale-range-lower');
            var inputUpper = element.find('input.axis-scale-range-upper');
            var onChange = jQuery.proxy(self.AxisScaleRangeInputChange, self, inputLower, inputUpper, settings, fieldId);
            self.CreateAxisScaleRangeInput(inputLower, settings, boundary.lower, onChange);
            self.CreateAxisScaleRangeInput(inputUpper, settings, boundary.upper, onChange);

            target = element;
            inputIndex++;
        });
    };
    self.CanSetAxisScaleRange = function (dataField) {
        var isBubbleChart = ChartHelper.IsBubbleType(self.GetType());
        return dataField.is_selected() && (dataField.is_count_field() || !isBubbleChart);
    };
    self.CanUseAxisScaleRange = function () {
        var rawFields = jQuery.map(self.DisplayHandler.QueryDefinitionHandler.GetRawAggregationData(), function (aggregation) {
            if (aggregation.is_selected() && aggregation.area() !== AggregationFieldViewModel.Area.Data)
                return aggregation.field();
        });
        var currentFields = jQuery.map(self.DisplayHandler.QueryDefinitionHandler.Aggregation(), function (aggregation) {
            if (aggregation.is_selected() && aggregation.area() !== AggregationFieldViewModel.Area.Data)
                return aggregation.field();
        });
        return rawFields.join(',') === currentFields.join(',');
    };
    self.GetAxisScaleRanges = function () {
        if (!self.CanUseAxisScaleRange())
            return {};

        var defaultRanges = self.GetAxisScaleRangesFromView();
        var savedRanges = self.GetOptions()[ChartOptionsHandler.AxisScaleRangesId];
        var unsaveRanges = _self.axisScaleRangeValues;
        var values = jQuery.extend({}, defaultRanges, savedRanges, unsaveRanges);
        var ranges = {};
        jQuery.each(self.DisplayHandler.QueryDefinitionHandler.GetAggregationDataFields(), function (_index, field) {
            var value = values[field.field()];
            if (field.is_selected() && value)
                ranges[field.field()] = value;
        });
        return ranges;
    };
    self.GetAxisScaleRangesFromView = function () {
        var type = self.GetType();
        var isScatterOrBubble = ChartHelper.IsScatterOrBubbleType(type);
        var dataFields = self.DisplayHandler.QueryDefinitionHandler.GetAggregationDataFields();
        var ranges = {};
        var axisIndex = 0;
        jQuery.each(dataFields, function (index, field) {
            if (!field.is_selected())
                return;

            var fieldId = field.field();
            var stack = false;
            if (!isScatterOrBubble) {
                var seriesType = ChartHelper.GetMultiAxisType(axisIndex, type);
                stack = ChartHelper.GetMultiAxisStack(seriesType);
            }
            var boundary = self.DisplayHandler.DisplayResultHandler.CalculateValuesBoundary(fieldId, stack);
            ranges[fieldId] = [boundary.min, boundary.max, boundary.majorUnit];
            axisIndex++;
        });
        return ranges;
    };
    self.GetAxisScaleSettings = function (dataField) {
        var settings = self.DisplayHandler.QueryDefinitionHandler.GetAggregationFieldFormatSettings(dataField);

        // specially for time & timespan
        if (settings.type === enumHandlers.FIELDTYPE.TIMESPAN
            || settings.type === enumHandlers.FIELDTYPE.TIME) {
            var doubleSettings = WC.FormatHelper.GetUserDefaultFormatSettings(enumHandlers.FIELDTYPE.DOUBLE);
            settings.decimals = doubleSettings.decimals;
            settings.thousandseparator = doubleSettings.thousandseparator;

            // add suffix for timespan
            if (settings.type === enumHandlers.FIELDTYPE.TIMESPAN)
                settings.suffix = window.textDays;
            else
                settings.suffix = Captions.Label_FieldFormat_Seconds.toLowerCase();
        }
        return settings;
    };
    self.GetAxisScaleBoundary = function (settings, scale) {
        // use a default if no scale
        scale = scale || [0, 1, 1];

        // convert scales by each settings
        var valueLower = scale[0];
        var valueUpper = scale[1];

        if (settings.prefix === enumHandlers.DISPLAYUNITSFORMAT.THOUSANDS) {
            valueLower = WC.FormatHelper.NumberToThousands(valueLower);
            valueUpper = WC.FormatHelper.NumberToThousands(valueUpper);
        }
        else if (settings.prefix === enumHandlers.DISPLAYUNITSFORMAT.MILLIONS) {
            valueLower = WC.FormatHelper.NumberToMillions(valueLower);
            valueUpper = WC.FormatHelper.NumberToMillions(valueUpper);
        }

        // handle decimal points
        var addDecimals = settings.type === enumHandlers.FIELDTYPE.PERCENTAGE ? 2 : 0;
        valueLower = parseFloat(valueLower.toFixed(settings.decimals + addDecimals));
        valueUpper = parseFloat(valueUpper.toFixed(settings.decimals + addDecimals));

        // upper must greater than lower
        if (valueUpper <= valueLower) {
            valueUpper = valueLower + 1;
        }

        return {
            lower: valueLower,
            upper: valueUpper
        };
    };
    self.CreateAxisScaleRangeInput = function (element, settings, value, onChange) {
        var uiName = settings.type === enumHandlers.FIELDTYPE.PERCENTAGE
            ? enumHandlers.KENDOUITYPE.PERCENTAGETEXT
            : enumHandlers.KENDOUITYPE.NUMERICTEXT;
        var formatter = new Formatter({
            decimals: settings.decimals,
            thousandseparator: settings.thousandseparator
        }, enumHandlers.FIELDTYPE.NUMBER);
        var format = WC.FormatHelper.GetFormatter(formatter);
        element[uiName]({
            value: value,
            step: 1,
            spinners: false,
            format: format,
            decimals: settings.decimals,
            change: onChange,
            spin: onChange
        });
    };
    self.AxisScaleRangeInputChange = function (inputLower, inputUpper, settings, fieldId, e) {
        var isInputLower = e.sender.element.hasClass('axis-scale-range-lower');
        var handlerLower = inputLower.data('handler');
        var handlerUpper = inputUpper.data('handler');
        var valueLower = WC.Utility.ToNumber(handlerLower.value());
        var valueUpper = WC.Utility.ToNumber(handlerUpper.value());
        var delta = settings.type === enumHandlers.FIELDTYPE.PERCENTAGE ? 0.01 : 1;

        // check value
        if (isInputLower && valueUpper <= valueLower) {
            valueUpper = valueLower + delta;
        }
        else if (!isInputLower && valueUpper <= valueLower) {
            valueLower = valueUpper - delta;
        }
        handlerLower.value(valueLower);
        handlerUpper.value(valueUpper);

        // transform value
        if (settings.prefix === enumHandlers.DISPLAYUNITSFORMAT.THOUSANDS) {
            valueLower = WC.FormatHelper.ThousandsToNumber(valueLower);
            valueUpper = WC.FormatHelper.ThousandsToNumber(valueUpper);
        }
        else if (settings.prefix === enumHandlers.DISPLAYUNITSFORMAT.MILLIONS) {
            valueLower = WC.FormatHelper.MillionsToNumber(valueLower);
            valueUpper = WC.FormatHelper.MillionsToNumber(valueUpper);
        }

        var majorUnit = kendo.dataviz.autoMajorUnit(valueLower, valueUpper);
        if (settings.type === enumHandlers.FIELDTYPE.INTEGER) {
            majorUnit = Math.max(1, Math.floor(majorUnit));
        }
        
        _self.axisScaleRangeValues[fieldId] = [valueLower, valueUpper, majorUnit];
    };

    // constructur
    self.Initial(displayHandler);
}

ChartOptionsHandler.UI = {
    Dropdown: 'dropdown',
    Checkbox: 'checkbox'
};
ChartOptionsHandler.ScaleType = {
    Automatic: 'automatic',
    Manual: 'manual'
};
ChartOptionsHandler.AxisScaleId = 'axisscale';
ChartOptionsHandler.AxisScaleRangesId = 'axisscale_ranges';