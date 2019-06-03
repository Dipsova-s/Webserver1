function ChartHandler(elementId, container) {
    "use strict";

    var self = this;
    var _self = {};

    /*BOF: Model Properties*/
    self.Chart = null;
    self.Data = {
        fields: [],
        rows: [],
        header: []
    };
    self.FontDefault = '12px Arial,Helvetica,sans-serif';
    self.LabelShortenSize = 20;
    self.MINAXIS = 15;
    self.FILTERRANGE = {
        CURRENT: 50,
        DEFAULT: 50,
        MIN: 40,
        START: 0
    };
    self.FitLayout = false;
    self.MAXNAVIGATORSIZE = 80;
    self.MOVESPEED = 50;
    self.MinimunRotateCategory = 5;

    self.FieldMetadata = {};
    self.Series = [];

    self.Groups = {};
    self.GroupIndex = -1;
    self.GroupField = '';

    self.Categories = [];
    self.CategoryFieldValueTypeOf = '';
    self.CategoryIndex = 0;
    self.CategoryField = '';
    self.CategoryVisible = {};

    self.ValueVisible = [];

    self.AggergateFields = [];

    self.UpdateLayoutChecker = null;
    self.UpdateLayoutCheckerLast = null;
    self.CurrentPage = 0;
    self.MiniCharts = {
        List: [],
        Perpage: 15,
        ScrollTrigger: 0,
        ScrollEnable: false
    };
    self.TEXT_NULL = 'null';

    self.ReadOnly = ko.observable(false);
    self.DashBoardMode = ko.observable(false);
    self.Models = {
        Angle: angleInfoModel,
        Display: displayModel,
        DisplayQueryBlock: displayQueryBlockModel,
        Result: resultModel
    };
    self.FieldSettings = null;
    self.VALUETYPE = {
        CATEGORY: 'category',
        GROUP: 'group',
        VALUE: 'value'
    };
    self.Container = typeof container === 'undefined' ? '#ChartWrapper' : container;
    self.ElementId = typeof elementId === 'undefined' ? '#chart' : elementId;
    self.ModelId = 'chart_' + self.ElementId.substr(1);
    self.GaugeValues = [];
    self.GaugeColours = [];
    self.GAUGEDEFAULT = {
        VALUES: [0, 20, 40, 60, 80, 100],
        COLOURS: ['#ed0000', '#eda100', '#4dc632', '#eda100', '#ed0000']
    };
    self.GaugeLabels = {};
    self.THEME = {
        BACKGROUND: '#ffffff',
        POINTERCOLOR: '#f35800',
        COLOURS: []
    };

    if (window.kendo && window.kendo.dataviz.ui.themes[window.kendoTheme]) {
        kendo.dataviz.ui.themes[window.kendoTheme].gauge.pointer.color = '#333333';
        kendo.dataviz.ui.themes[window.kendoTheme].chart.seriesColors = seriesColors;
        self.THEME.POINTERCOLOR = kendo.dataviz.ui.themes[window.kendoTheme].gauge.pointer.color || '#f35800';
        self.THEME.COLOURS = kendo.dataviz.ui.themes[window.kendoTheme].chart.seriesColors;
        if (kendo.dataviz.ui.themes[window.kendoTheme].chart.chartArea
            && kendo.dataviz.ui.themes[window.kendoTheme].chart.chartArea.background) {
            self.THEME.BACKGROUND = kendo.dataviz.ui.themes[window.kendoTheme].chart.chartArea.background || '#ffffff';
        }
    }

    // register this handler in global scope
    window[self.ModelId] = self;

    /*EOF: Model Properties*/

    /*BOF: Model Methods*/
    self.GetChartDisplay = function (isValidDisplay) {
        // make sure that chart details is correct
        var displayDetails = JSON.stringify(self.GetDisplayDetails());
        if (!self.Models.Display.Data().is_upgraded && self.Models.Display.Data().display_details !== displayDetails) {
            self.Models.Display.Data().upgrades_properties.push('display_details');
        }
        self.Models.Display.Data().display_details = displayDetails;
        self.Models.Display.Data.commit();

        if (!self.DashBoardMode()) {
            var chartTemplate = '<div id="ChartMainWrapper" class="displayWrapper">'
                + '<div class="fieldListToggleButton" onclick="fieldSettingsHandler.ToggleFieldListArea();"></div>'
                + '<div id="ChartArea" class="displayArea">'
                + '<div id="ChartWrapper"></div>'
                + '</div>'
                + '</div>';
            jQuery('#AngleTableWrapper').html(chartTemplate);

            anglePageHandler.SetWrapperHeight();

            fieldSettingsHandler.Handler = self;
            fieldSettingsHandler.SetReadOnlyMode();
            fieldSettingsHandler.BuildFieldsSettings();
            fieldSettingsHandler.BuildFieldsSettingsHtml();
            fieldSettingsHandler.UpdateSettingsAfterChange();
        }
        else {
            var fieldSetting = new FieldSettingsHandler();
            fieldSetting.Handler = self;
            fieldSetting.BuildFieldsSettings();
        }

        var container = jQuery(self.Container);
        container.css('background-color', self.THEME.BACKGROUND);

        if (isValidDisplay !== false) {
            self.ShowLoadingIndicator();

            // chart view
            self.Data = {
                fields: [],
                rows: [],
                metadata: []
            };
            jQuery.when(self.CheckUpgradeDisplay())
                .then(function () {
                    return self.Load(self.Models.Result.Data().data_rows);
                })
                .done(self.GenerateChart)
                .always(self.HideLoadingIndicator);
        }
        else {
            self.CheckUpgradeDisplay();
            measurePerformance.SetEndTime();
        }
    };

    self.ShowLoadingIndicator = function () {
        var container = jQuery(self.Container);
        container.busyIndicator(true);
        if (!self.DashBoardMode()) {
            container.children('.k-loading-mask').height(container.parent().height());
            fieldSettingsHandler.ShowLoadingIndicator();
        }
    };

    self.HideLoadingIndicator = function () {
        var container = jQuery(self.Container);
        container.find('.pivotAreaContainer').busyIndicator(false);
        container.busyIndicator(false);
        if (!self.DashBoardMode()) {
            fieldSettingsHandler.HideLoadingIndicator();
        }
    };

    self.CheckUpgradeDisplay = function () {
        if (!self.Models.Display.Data().is_upgraded && self.Models.Display.Data().display_details !== self.FieldSettings.DisplayDetails) {
            self.Models.Display.Data().display_details = self.FieldSettings.DisplayDetails;
            self.Models.Display.Data().upgrades_properties.push('display_details');
            self.Models.Display.Data.commit();
        }

        var currentDisplay = self.Models.Display.Data();
        var sourceDisplay = self.DashBoardMode() ? currentDisplay : historyModel.Get(currentDisplay.uri, false);
        var upgradeData = displayUpgradeHandler.GetUpgradeDisplayData(currentDisplay, sourceDisplay);
        return displayUpgradeHandler.UpgradeDisplay(self, currentDisplay.uri, upgradeData);
    };

    self.GetChartSettings = function () {
        if (!self.FieldSettings) {
            return false;
        }

        var displayDetails = self.FieldSettings.GetDisplayDetails();
        var options = {};

        var chartGroup = fieldSettingsHandler.GetChartTypeGroup(displayDetails.chart_type);
        if (chartGroup === fieldSettingsHandler.CHARTGROUP.GAUGE) {
            self.SetGaugeChartSettings(options, displayDetails);
        }
        else if (chartGroup === fieldSettingsHandler.CHARTGROUP.RADAR) {
            self.SetRadarChartSettings(options, displayDetails);
        }
        else if (chartGroup === fieldSettingsHandler.CHARTGROUP.PIE) {
            self.SetPieChartSettings(options, displayDetails);
        }
        else {
            self.SetDefaultChartSettings(options, displayDetails);
        }

        return options;
    };
    self.SetGaugeChartSettings = function (options, displayDetails) {
        // default
        options.axistitlegauge = { show: true };
        options.datalabelgauge = { show: true };
        options.rangesgauge = { show: true };

        // axistitlegauge
        var axistitlegaugeVisible = displayDetails['axistitlegauge'];
        options.axistitlegauge.show = axistitlegaugeVisible === 'show';

        // datalabelgauge
        var datalabelgaugeVisible = displayDetails['datalabelgauge'];
        options.datalabelgauge.show = datalabelgaugeVisible === 'show';

        // rangesgauge
        var rangesVisible = displayDetails['rangesgauge'];
        options.rangesgauge.show = rangesVisible === 'show';
    };
    self.SetRadarChartSettings = function (options, displayDetails) {
        // default
        options.axisvalueradar = { show: true };
        options.datalabel = { show: false, show_values: false, mouse: true };
        options.gridlinetype = { type: 'arc' };
        options.gridlineradar = { show: true };
        options.legend = { show: true };

        // axisvalueradar
        var axisvalueradarVisibility = displayDetails['axisvalueradar'];
        options.axisvalueradar.show = axisvalueradarVisibility === 'show';

        // datalabel
        var datalabelVisibility = displayDetails['datalabel'];
        if (datalabelVisibility === 'show') {
            options.datalabel.show = true;
            options.datalabel.show_values = false;
            options.datalabel.mouse = false;
        }
        if (datalabelVisibility === 'show_values') {
            options.datalabel.show = true;
            options.datalabel.show_values = true;
            options.datalabel.mouse = false;
        }
        else if (datalabelVisibility === 'hide') {
            options.datalabel.show = false;
            options.datalabel.show_values = false;
            options.datalabel.mouse = false;
        }
        else if (datalabelVisibility === 'mouse') {
            options.datalabel.show = false;
            options.datalabel.show_values = false;
            options.datalabel.mouse = true;
        }

        // gridlinetype
        var gridlineType = displayDetails['gridlinetype'];
        options.gridlinetype.type = gridlineType;

        // gridline
        var gridlineVisibility = displayDetails['gridlineradar'];
        options.gridlineradar.show = gridlineVisibility === 'show';

        // legend
        var legendVisibility = displayDetails['legend'];
        options.legend.show = legendVisibility === 'show';
    };
    self.SetPieChartSettings = function (options, displayDetails) {
        // default
        options.datalabel = { show: false, show_values: false, mouse: true };
        options.legend = { show: true };

        // datalabel
        var datalabelVisibility = displayDetails['datalabel'];
        if (datalabelVisibility === 'show') {
            options.datalabel.show = true;
            options.datalabel.show_values = false;
            options.datalabel.mouse = false;
        }
        else if (datalabelVisibility === 'show_values') {
            options.datalabel.show = true;
            options.datalabel.show_values = true;
            options.datalabel.mouse = false;
        }
        else if (datalabelVisibility === 'hide') {
            options.datalabel.show = false;
            options.datalabel.show_values = false;
            options.datalabel.mouse = false;
        }
        else if (datalabelVisibility === 'mouse') {
            options.datalabel.show = false;
            options.datalabel.show_values = false;
            options.datalabel.mouse = true;
        }

        // legend
        var legendVisibility = displayDetails['legend'];
        options.legend.show = legendVisibility === 'show';
    };
    self.SetDefaultChartSettings = function (options, displayDetails) {
        // default
        options.axistitle = { x: true, y: true };
        options.axisvalue = { x: true, y: true };
        options.datalabel = { show: false, show_values: false, mouse: true };
        options.gridline = { x: true, y: true };
        options.legend = { show: true };
        options.show_as_percentage = false;

        // axistitle
        var axistitleVisibility = displayDetails['axistitle'];
        if (axistitleVisibility === 'show') {
            options.axistitle.x = true;
            options.axistitle.y = true;
        }
        else if (axistitleVisibility === 'hide') {
            options.axistitle.x = false;
            options.axistitle.y = false;
        }
        else if (axistitleVisibility === 'show-x') {
            options.axistitle.x = true;
            options.axistitle.y = false;
        }
        else if (axistitleVisibility === 'show-y') {
            options.axistitle.x = false;
            options.axistitle.y = true;
        }

        // axisvalue
        var axisvalueVisibility = displayDetails['axisvalue'];
        if (axisvalueVisibility === 'show') {
            options.axisvalue.x = true;
            options.axisvalue.y = true;
        }
        else if (axisvalueVisibility === 'hide') {
            options.axisvalue.x = false;
            options.axisvalue.y = false;
        }
        else if (axisvalueVisibility === 'show-x') {
            options.axisvalue.x = true;
            options.axisvalue.y = false;
        }
        else if (axisvalueVisibility === 'show-y') {
            options.axisvalue.x = false;
            options.axisvalue.y = true;
        }

        // axisscale
        if (displayDetails[fieldSettingsHandler.OptionAxisScaleId] === fieldSettingsHandler.CHARTSCALETYPE.MANUAL) {
            options[fieldSettingsHandler.OptionAxisScaleRangesId] = displayDetails[fieldSettingsHandler.OptionAxisScaleRangesId];
        }

        // datalabel
        var datalabelVisibility = displayDetails['datalabel'];
        if (datalabelVisibility === 'show') {
            options.datalabel.show = true;
            options.datalabel.show_values = false;
            options.datalabel.mouse = false;
        }
        else if (datalabelVisibility === 'show_values') {
            options.datalabel.show = true;
            options.datalabel.show_values = true;
            options.datalabel.mouse = false;
        }
        else if (datalabelVisibility === 'hide') {
            options.datalabel.show = false;
            options.datalabel.show_values = false;
            options.datalabel.mouse = false;
        }
        else if (datalabelVisibility === 'mouse') {
            options.datalabel.show = false;
            options.datalabel.show_values = false;
            options.datalabel.mouse = true;
        }

        // gridline
        var gridlineVisibility = displayDetails['gridline'];
        if (gridlineVisibility === 'show') {
            options.gridline.x = true;
            options.gridline.y = true;
        }
        else if (gridlineVisibility === 'hide') {
            options.gridline.x = false;
            options.gridline.y = false;
        }
        else if (gridlineVisibility === 'show-x') {
            options.gridline.x = true;
            options.gridline.y = false;
        }
        else if (gridlineVisibility === 'show-y') {
            options.gridline.x = false;
            options.gridline.y = true;
        }

        // legend
        var legendVisibility = displayDetails['legend'];
        options.legend.show = legendVisibility === 'show';
        // show as percentage
        options.show_as_percentage = displayDetails["show_as_percentage"];
    };

    self.InitialFieldsSetting = function () {
        if (jQuery('#ChartMainWrapper .rowArea ul').data('kendoDraggable')) {
            return;
        }

        // row & column area
        jQuery('#ChartMainWrapper .rowArea ul, #ChartMainWrapper .columnArea ul').kendoDraggable({
            axis: 'y',
            filter: 'li:not(.noDrag,.validError)',
            hint: function (item) {
                jQuery('#FieldListArea').find('.k-state-selected').removeClass('k-state-selected');
                item.addClass('k-state-selected');

                jQuery('#FieldListArea').data('state', {
                    element: item,
                    drag: {
                        area: !item.parents('.rowArea').length ? enumHandlers.FIELDSETTINGAREA.COLUMN : enumHandlers.FIELDSETTINGAREA.ROW,
                        data: fieldSettingsHandler.FieldSettings.GetFields()
                    },
                    drop: {
                        area: null,
                        data: fieldSettingsHandler.FieldSettings.GetFields()
                    }
                });

                var helper = jQuery('<div class="draggingField" id="draggingField" />');

                return helper.append(item.clone().removeClass('k-state-selected'));
            },
            dragstart: function () {
                fieldSettingsHandler.RemoveAllBucketPopup();
                jQuery('#FieldListArea .rowArea, #FieldListArea .columnArea').addClass('k-state-dragging');
            },
            dragend: function () {
                jQuery('#FieldListArea .rowArea, #FieldListArea .columnArea').removeClass('k-state-dragging');
                jQuery('#FieldListArea').find('.k-state-selected').removeClass('k-state-selected');

                jQuery(document).trigger('click.outside');
            }
        });

        jQuery('#ChartMainWrapper [id="FieldListArea"]').kendoDropTargetArea({
            filter: '#ChartMainWrapper [id="FieldListArea"] .rowArea ul, #ChartMainWrapper [id="FieldListArea"] .columnArea ul',
            dragenter: function (e) {
                var state = jQuery('#FieldListArea').data('state');
                if (state.drag.area === enumHandlers.FIELDSETTINGAREA.DATA) {
                    return;
                }

                state.drop.area = !e.dropTarget.parents('#FieldListArea .rowArea').length ? enumHandlers.FIELDSETTINGAREA.COLUMN : enumHandlers.FIELDSETTINGAREA.ROW;
                jQuery('#FieldListArea').data('state', state);
            },
            drop: function () {
                var state = jQuery('#FieldListArea').data('state');
                if (state.drag.area === enumHandlers.FIELDSETTINGAREA.DATA) {
                    return;
                }

                if (state.drop.area !== null && state.drop.area !== state.drag.area) {
                    // update layout
                    var area0 = jQuery('#FieldListArea .rowArea li'),
                        area1 = jQuery('#FieldListArea .columnArea li');

                    jQuery('#FieldListArea .rowArea ul').append(area1.removeClass('column').addClass('row'));
                    jQuery('#FieldListArea .columnArea ul').append(area0.removeClass('column').addClass('row'));

                    // update drop data
                    fieldSettingsHandler.UpdateFieldsSettingDataByArea(enumHandlers.FIELDSETTINGAREA.ROW);
                    fieldSettingsHandler.UpdateFieldsSettingDataByArea(enumHandlers.FIELDSETTINGAREA.COLUMN);

                    fieldSettingsHandler.UpdateFieldsSettingState();
                }
            }
        });

        // initial data area
        fieldSettingsHandler.InitialFieldsSettingDataArea('#ChartMainWrapper');
    };
    self.Load = function (datarowUri) {
        var maxPageSize = systemSettingHandler.GetMaxPageSize();
        var pageSize = Math.ceil(self.Models.Result.Data().row_count / maxPageSize);
        datarowUri = directoryHandler.ResolveDirectoryUri(datarowUri);
        var getDataRow = function (params) {
            return GetDataFromWebService(datarowUri, params).done(self.LoadSuccess);
        };
        var deferred = [], i;
        self.Series = [];
        var fieldNames = [];
        jQuery.each(self.FieldSettings.GetFields(), function (index, field) {
            if (field.IsSelected)
                fieldNames.push(field.FieldName);
        });

        for (i = 0; i < pageSize; i++) {
            var params = {};
            params[enumHandlers.PARAMETERS.OFFSET] = i * maxPageSize;
            params[enumHandlers.PARAMETERS.LIMIT] = maxPageSize;
            params['fields'] = fieldNames.join(',');

            deferred.pushDeferred(getDataRow, [params]);
        }

        return jQuery.whenAll(deferred, true, false)
            .fail(function (requests) {
                if (requests instanceof Array)
                    requests = requests[0];
                if (requests instanceof Array)
                    requests = requests[0];

                if (self.DashBoardMode()) {
                    var widgetDisplayElementId = self.ElementId.slice(1);
                    var widgetContainer = jQuery(self.ElementId + '-container');
                    var chartType = self.GetDisplayDetails().chart_type;
                    self.RemoveWidgetChart(widgetDisplayElementId, widgetContainer, chartType);
                    self.Models.Result.RetryPostResult(requests.responseText);
                }
                else {
                    self.Models.Result.SetRetryPostResultToErrorPopup(requests.status);
                }
            })
            .done(self.GenerateChartDatasource);
    };
    self.RemoveWidgetChart = function (widgetDisplayElementId, widgetContainer, chartType) {

        if (self.IsDonutOrPieChartType(chartType)) {
            var chartItems = widgetContainer.find('.k-chart');
            jQuery.each(chartItems, function (index, chartItem) {
                chartItem = jQuery(chartItem);
                var chartObject = chartItem.data(enumHandlers.KENDOUITYPE.CHART);
                if (chartObject)
                    chartObject.destroy();
            });
            widgetContainer.find('.chartWrapper').empty().attr('id', widgetDisplayElementId);
        }
        else {
            var widgetDisplay = widgetContainer.find('.widgetDisplay');
            var chartObject = widgetDisplay.data(enumHandlers.KENDOUITYPE.CHART) || widgetDisplay.data(enumHandlers.KENDOUITYPE.RADIALGAUGE);
            if (chartObject)
                chartObject.destroy();

            widgetDisplay.detach().appendTo(widgetContainer);
            widgetContainer.find('.widgetDisplay').empty();
            widgetContainer.find('.chartWrapper').remove();
            widgetContainer.find('.navigatorWrapper').remove();
        }

    };
    self.LoadSuccess = function (data) {
        self.Data.fields = data.fields;
        self.Data.header = data.header;
        return self.Data.rows.push.apply(self.Data.rows, data.rows);
    };
    self.GenerateChartDatasource = function () {
        var data = self.Data;
        if (data.fields && data.fields.length) {
            var aggrStep = self.Models.DisplayQueryBlock.GetQueryStepByType(enumHandlers.FILTERTYPE.AGGREGATION)[0];

            self.Categories = [];
            self.Series = [];
            self.Groups = {};
            self.FieldMetadata = {};

            var rowAreas = self.FieldSettings.GetFields(enumHandlers.FIELDSETTINGAREA.ROW);
            var columnAreas = self.FieldSettings.GetFields(enumHandlers.FIELDSETTINGAREA.COLUMN);

            self.CategoryField = rowAreas.length ? rowAreas[0].FieldName : '';
            self.GroupField = columnAreas.length ? columnAreas[0].FieldName : '';
            self.AggergateFields = aggrStep.aggregation_fields.slice();

            var categoryFieldName = WC.Utility.ConvertFieldName(self.CategoryField);
            var sortCategoryFieldName = categoryFieldName + '_sortindex';

            self.CategoryIndex = jQuery.inArray(self.CategoryField, data.fields);
            self.GroupIndex = self.GroupField ? jQuery.inArray(self.GroupField, data.fields) : -1;

            // metadata
            var modelUri = self.Models.Angle.Data().model;
            var getSourceFieldData = function (sourceField, aggrField) {
                return modelFieldsHandler.GetFieldById(sourceField, modelUri) || self.Models.Result.GetDataFieldById(aggrField);
            };
            jQuery.each(data.fields, function (index, field) {
                var domainElements, fieldField, groupField;
                if (index === self.CategoryIndex || index === self.GroupIndex) {
                    groupField = aggrStep.grouping_fields.findObject('field', field, false);
                    fieldField = getSourceFieldData(groupField.source_field, groupField.field);
                    domainElements = self.GetDomainElementsForCustomSort(groupField.operator, fieldField.domain);
                }
                else {
                    domainElements = [];
                }

                // create Formatter
                var fieldSettingData = self.FieldSettings.GetFieldByFieldName(field);
                var formatter = self.GetChartFormatter(fieldSettingData);

                self.FieldMetadata[field] = {};
                self.FieldMetadata[field]['domain_elements'] = domainElements;
                self.FieldMetadata[field]['formatter'] = formatter;
                self.FieldMetadata[field]['bucket'] = fieldSettingData.Bucket.Operator;
            });

            // field value
            jQuery.each(data.rows, function (rowIndex, row) {
                var series = {};

                jQuery.each(row.field_values, function (valueIndex, fieldValue) {
                    var fieldName = WC.Utility.ConvertFieldName(data.fields[valueIndex]);
                    var generateSeries = self.GenerateSeries(fieldValue, self.FieldMetadata[data.fields[valueIndex]]);
                    series[fieldName] = generateSeries.value;
                    series[fieldName + '_label'] = generateSeries.label;
                    series[fieldName + '_color'] = generateSeries.color;

                    if (generateSeries.pattern) {
                        series[fieldName + '_pattern'] = generateSeries.pattern;
                        series['is_pattern'] = generateSeries.is_pattern;
                    }
                });

                self.Series.push(series);
            });

            // set sort field
            // set color
            self.SetSortSeries();

            // transfer sortindex of category field
            var fieldSorting = self.GetSortingFieldInfo();
            if (fieldSorting) {
                var categorySumAggr = self.TransferSortindex(categoryFieldName, fieldSorting);
                categorySumAggr.sortObject('sum', fieldSorting.dir === 'asc' ? enumHandlers.SORTDIRECTION.ASC : enumHandlers.SORTDIRECTION.DESC);

                // assign sortindex
                jQuery.each(self.Series, function (index, serie) {
                    serie[sortCategoryFieldName] = categorySumAggr.indexOfObject('label', serie[categoryFieldName + '_label']);
                });
            }

            // set category
            self.Series = self.GetSortObject(self.Series, {
                field: sortCategoryFieldName,
                dir: 'asc'
            });
            var serieDataCache = {};
            var checkDuplicateField = self.GetCheckCategoryProperty(categoryFieldName, fieldSorting);
            jQuery.each(self.Series, function (i, item) {
                if (!serieDataCache[item[checkDuplicateField]]) {
                    self.Categories.push(jQuery.extend({}, item, {
                        value: item[categoryFieldName],
                        label: item[categoryFieldName + '_label']
                    }));
                    serieDataCache[item[checkDuplicateField]] = true;
                }
            });

            // set grouping
            var groupingField = WC.Utility.ConvertFieldName(self.GroupField || self.CategoryField);
            jQuery.each(self.Series, function (index, serie) {
                if (!self.Groups[serie[groupingField]]) {
                    self.Groups[serie[groupingField]] = {
                        value: serie[groupingField],
                        label: serie[groupingField + '_label'],
                        index: serie[groupingField + '_sortindex'],
                        color: serie[groupingField + '_color']
                    };
                }
            });
        }
    };
    self.TransferSortindex = function (categoryFieldName, fieldSorting) {
        var categorySumAggr = [];
        jQuery.each(self.Series, function (index, serie) {
            var categoryLabel = serie[categoryFieldName + '_label'];
            var categorySumAggrIndex = categorySumAggr.indexOfObject('label', categoryLabel);
            var categoryValue = serie[fieldSorting.field];
            if (categorySumAggrIndex === -1) {
                categorySumAggr.push({
                    label: categoryLabel,
                    sum: categoryValue
                });
            }
            else {
                categorySumAggr[categorySumAggrIndex].sum += categoryValue;
            }
        });

        return categorySumAggr;
    };
    self.GetCheckCategoryProperty = function (categoryFieldName, useSortingProperty) {
        if (useSortingProperty) {
            return categoryFieldName + '_sortindex';
        }
        else {
            var dataType = self.FieldMetadata[categoryFieldName] ? self.FieldMetadata[categoryFieldName].formatter.type : enumHandlers.FIELDTYPE.TEXT;
            if (dataType === enumHandlers.FIELDTYPE.ENUM)
                return categoryFieldName;
            else
                return categoryFieldName + '_label';
        }
    };

    self.GetChartFormatter = function (fieldSettingData) {
        var formatter = null;
        var fieldId = fieldSettingData.SourceField ? fieldSettingData.SourceField : fieldSettingData.FieldName;
        var displayField = {
            field: fieldId,
            field_details: fieldSettingData.FieldDetails
        };
        var modelUri = self.Models.Angle.Data().model;
        var fieldFormatter = new FieldFormatter(displayField, modelUri);

        if (displayField.field === enumHandlers.AGGREGATION.COUNT.Value) {
            var countFormatter = WC.FormatHelper.GetFieldFormatSettings(fieldFormatter, true);
            formatter = new Formatter({
                format: WC.FormatHelper.GetFormatter(countFormatter)
            }, fieldSettingData.DataType);

            // set null to use a format
            formatter.decimals = null;
        }
        else if (WC.FormatHelper.IsNumberFieldType(fieldSettingData.DataType)) {
            var numberFormatter = fieldSettingsHandler.CreateFieldFormatSettings(fieldSettingData, modelUri);

            // set correct prefix
            numberFormatter.prefix = dataTypeModel.GetCorrectPrefix(numberFormatter.prefix, fieldSettingData.Bucket.Operator);

            formatter = new Formatter({}, fieldSettingData.DataType);
            formatter.format = WC.FormatHelper.GetFormatter(numberFormatter);

            // set null to use a format
            formatter.decimals = null;
        }
        else if (fieldSettingData.DataType === enumHandlers.FIELDTYPE.PERIOD) {
            formatter = new Formatter({
                format: '#'
            }, enumHandlers.FIELDTYPE.PERIOD);
            if (fieldSettingData.Area === enumHandlers.FIELDSETTINGAREA.DATA) {
                formatter.type = enumHandlers.FIELDTYPE.INTEGER;
            }
            // set null to use a format
            formatter.decimals = null;
        }
        else if (WC.FormatHelper.IsDateOrDateTime(fieldSettingData.DataType)) {
            var dateFormatter = WC.FormatHelper.GetFieldFormatSettings(fieldFormatter, true);
            formatter = new Formatter({
                format: jQuery.inArray(fieldSettingData.CellFormat, ['q', 't', 's']) !== -1 ? dateFormatter.year + ' ' + fieldSettingData.CellFormat.toUpperCase() : fieldSettingData.CellFormat
            }, fieldSettingData.DataType);
        }
        else if (jQuery.inArray(fieldSettingData.DataType, [enumHandlers.FIELDTYPE.TIME, enumHandlers.FIELDTYPE.TIMESPAN, enumHandlers.FIELDTYPE.TEXT, enumHandlers.FIELDTYPE.BOOLEAN]) !== -1) {
            formatter = new Formatter({
                format: fieldSettingData.CellFormat
            }, fieldSettingData.DataType);
        }
        else if (fieldSettingData.DataType === enumHandlers.FIELDTYPE.ENUM) {
            formatter = new Formatter({
                format: fieldSettingData.CellFormat,
                domain: WC.FormatHelper.GetEnumDataFromFieldFormatter(fieldFormatter)
            }, fieldSettingData.DataType);
        }

        return formatter;
    };

    self.SetSortSeries = function () {
        if (self.Series.length) {
            jQuery.each(self.FieldMetadata, function (field, metadata) {
                var fieldName = WC.Utility.ConvertFieldName(field);
                var sortFieldName = fieldName + '_sortindex';
                var compareField = self.GetCompareField(metadata, fieldName);

                if (metadata.domain_elements.length) {
                    self.SetSortSeriesFromMetaData(metadata, fieldName, sortFieldName);
                }
                else {
                    self.SetSortSeriesFromData(metadata, fieldName, sortFieldName, compareField);
                }

                self.Series = self.GetSortObject(self.Series, {
                    field: sortFieldName,
                    dir: 'asc'
                });

                self.SetColorToSeries(fieldName, compareField);
            });
        }
    };

    self.SetSortSeriesFromMetaData = function (metadata, fieldName, sortFieldName) {
        var sortValues = {};
        jQuery.each(metadata.domain_elements, function (i, item) {
            sortValues[item.id] = i;
        });
        jQuery.each(self.Series, function (i, item) {
            if (typeof sortValues[item[fieldName]] === 'undefined') {
                item[sortFieldName] = -1;
            }
            else {
                item[sortFieldName] = sortValues[item[fieldName]];
            }
        });
    };

    self.SetSortSeriesFromData = function (metadata, fieldName, sortFieldName, compareField) {
        var sortOption = { dir: 'asc' };
        var sortIndex = 0;
        var isEnumerated = metadata.formatter.type === enumHandlers.FIELDTYPE.ENUM;

        if (isEnumerated) {
            sortOption.field = fieldName + '_label';
            sortOption.compare = function (a, b) {
                var x = a[fieldName + '_label'];
                var y = b[fieldName + '_label'];
                if (x !== y) {
                    if (x === 'null')
                        return -1;
                    if (y === 'null')
                        return 1;

                    if (x === '~NotInSet')
                        return -1;
                    if (y === '~NotInSet')
                        return 1;
                }

                return x.localeCompare(y);
            };
        }
        else {
            sortOption.field = fieldName;
        }

        var serieData = self.GetSortObject(self.Series, sortOption);


        jQuery.each(serieData, function (i, item) {
            item[sortFieldName] = sortIndex;

            if (serieData[i + 1] && serieData[i + 1][compareField] !== item[compareField]) {
                sortIndex++;
            }
        });
        self.Series = serieData;
    };

    self.GetCompareField = function (metadata, fieldName) {
        if (metadata.domain_elements.length
            || metadata.formatter.type === enumHandlers.FIELDTYPE.ENUM
            || WC.FormatHelper.IsDateOrDateTime(metadata.formatter.type))
            return fieldName + '_label';
        else
            return fieldName;
    };

    self.SetColorToSeries = function (fieldName, compareField) {
        var colorIndex = 0;
        var cacheColors = {};
        jQuery.each(self.Series, function (i, serie) {
            if (!serie[fieldName + '_color']) {
                serie[fieldName + '_color'] = cacheColors[serie[compareField]] || self.THEME.COLOURS[colorIndex];
                if (!cacheColors[serie[compareField]]) {
                    cacheColors[serie[compareField]] = serie[fieldName + '_color'];
                    colorIndex++;
                }
                if (!self.THEME.COLOURS[colorIndex]) {
                    colorIndex = 0;
                }
            }
        });
    };

    self.GetSortingFieldInfo = function () {
        var fieldSettingData = self.FieldSettings.GetFields(enumHandlers.FIELDSETTINGAREA.DATA).findObject('SortDirection', function (dir) { return dir; });
        if (fieldSettingData) {
            return {
                field: WC.Utility.ConvertFieldName(fieldSettingData.FieldName),
                dir: fieldSettingData.SortDirection
            };
        }
        else {
            return null;
        }
    };
    self.GetDomainElementsForCustomSort = function (operator, domainUri) {
        if (operator === 'individual' && domainUri) {
            var domain = modelFieldDomainHandler.GetFieldDomainByUri(domainUri);
            if (domain && !domain.may_be_sorted) {
                return domain.elements;
            }
        }

        return [];
    };
    self.GetSortObject = function (data, sortOptions) {
        var dataSource = new kendo.data.DataSource({ data: data.slice() });
        dataSource.sort(sortOptions);

        var sortedData = [];
        jQuery.each(dataSource.view(), function (index, item) {
            sortedData[index] = item.toJSON();
        });

        return sortedData;
    };
    self.GenerateSeries = function (fieldValue, metadata) {
        var color = '';
        var pattern = '';
        var formatter = metadata.formatter;
        var value = self.GetFieldValue(fieldValue, formatter.type);
        var label = self.GetFormattedValue(metadata, value);

        if (formatter.domain.elements) {
            var domainElement = formatter.domain.elements.findObject('id', value) || {};
            color = self.GetDomainElementColor(domainElement.color);
            pattern = domainElement.pattern;
        }

        return {
            value: value,
            label: label,
            color: color,
            pattern: pattern,
            is_pattern: !!pattern
        };
    };
    self.GetFormattedValue = function (metadata, value) {
        if (value !== null) {
            if (metadata.bucket.indexOf('power10') === 0) {
                return self.GetRangeBucketLabel(metadata.formatter, metadata.bucket, value);
            }
            else if (metadata.bucket === 'week'
                && (metadata.formatter.type === enumHandlers.FIELDTYPE.DATE || metadata.formatter.type === enumHandlers.FIELDTYPE.DATETIME)) {
                var yearFormat = metadata.formatter.format.indexOf('yyyy') !== -1 ? 'yyyy' : 'yy';
                return self.GetWeekOfYear(value, yearFormat);
            }
            else if (metadata.formatter.type === enumHandlers.FIELDTYPE.PERIOD) {
                return self.GetPeriodRangeBucketLabel(metadata.formatter.format, metadata.bucket, value);
            }
        }
        else if (metadata.formatter.type === enumHandlers.FIELDTYPE.ENUM) {
            return 'null';
        }
        return WC.FormatHelper.GetFormattedValue(metadata.formatter, value);
    };
    self.GetDomainElementColor = function (color) {
        return color ? '#' + color.substr(2) : '';
    };
    self.GetRangeBucketLabel = function (formatter, bucket, value) {
        var bucketSize = dataTypeModel.GetPowerBucketSize(bucket);
        if (formatter.type === enumHandlers.FIELDTYPE.PERCENTAGE) {
            bucketSize = WC.FormatHelper.PercentagesToNumber(bucketSize);
        }

        var lowerLabel = WC.FormatHelper.GetFormattedValue(formatter, value);
        var upperLabel = WC.FormatHelper.GetFormattedValue(formatter, value + bucketSize);
        return kendo.format('[{0}..{1}>', lowerLabel, upperLabel);
    };
    self.GetPeriodRangeBucketLabel = function (format, bucket, value) {
        var label;
        var periodRangeFormatSetting = self.GetPeriodRangeFormatSetting(bucket);

        value /= periodRangeFormatSetting.divide;
        var lowerValue = kendo.toString(value, format);

        if (periodRangeFormatSetting.supportRange) {
            var upperValue = kendo.toString(value + 1, format);
            label = kendo.format('[{0} {2}..{1} {2}>', lowerValue, upperValue, periodRangeFormatSetting.unitText);
        }
        else {
            label = kendo.format('{0} {1}', lowerValue, periodRangeFormatSetting.unitText);
        }

        return label;
    };
    self.GetPeriodRangeFormatSetting = function (bucket) {
        var setting = { divide: 1, supportRange: true, unitText: Localization['Period_Unit_' + bucket] };
        if (bucket === enumHandlers.FILTERPERIODTYPE.WEEK) {
            setting.divide = 7;
        }
        else if (bucket === enumHandlers.FILTERPERIODTYPE.MONTH) {
            setting.divide = 30.43685;
        }
        else if (bucket === enumHandlers.FILTERPERIODTYPE.QUARTER) {
            setting.divide = 91.31055;
        }
        else if (bucket === enumHandlers.FILTERPERIODTYPE.TRIMESTER) {
            setting.divide = 121.7474;
        }
        else if (bucket === enumHandlers.FILTERPERIODTYPE.SEMESTER) {
            setting.divide = 182.6211;
        }
        else if (bucket === enumHandlers.FILTERPERIODTYPE.YEAR) {
            setting.divide = 365.2422;
        }
        else {
            setting.supportRange = false;
        }
        return setting;
    };

    self.GetWeekOfYear = function (value, yearFormat) {
        var modelUri = self.Models.Angle.Data().model;
        var weekStart = WC.DateHelper.GetFirstDayOfWeek(modelUri);
        var result = WC.FormatHelper.GetWeekOfYear(weekStart, value, yearFormat);
        return kendo.format(Localization.WeekFormat, result.w, result.y);
    };
    self.GetFieldValue = function (fieldValue, fieldType) {
        var result = fieldValue;
        switch (fieldType) {
            case enumHandlers.FIELDTYPE.DATE:
            case enumHandlers.FIELDTYPE.DATETIME:
                if (typeof fieldValue === 'number') {
                    result = WC.DateHelper.UnixTimeToUtcDate(fieldValue);
                }
                break;
            case enumHandlers.FIELDTYPE.CURRENCY:
                if (fieldValue instanceof Object) {
                    result = fieldValue.a;
                }
                break;
            default:
                break;
        }

        return result;
    };
    self.GenerateChart = function () {
        self.Chart = null;

        var displayDetail = self.FieldSettings.GetDisplayDetails();
        var container = jQuery(self.Container);
        var header = container.find('.widgetDisplayHeader');
        var option = {
            Type: displayDetail.chart_type === enumHandlers.CHARTTYPE.SCATTERCHART.Code && displayDetail.stack ? self.GetScatterLineChartType() : displayDetail.chart_type,
            Stack: displayDetail.stack,
            MultiAxis: displayDetail.multi_axis,
            Label: self.GetChartLabelRotation(displayDetail.chart_type),
            ValueAxis: {
                Visible: !self.IsRadarChartType(displayDetail.chart_type)
            }
        };

        // prepare html
        if (header.length) {
            header = header.clone(true);
        }
        container.removeClass('navigatable').empty();
        container.append(header);

        // no result
        if (!self.Models.Result.Data().row_count) {
            self.CreateEmptyChart();
            return;
        }

        if (self.IsDonutOrPieChartType(displayDetail.chart_type)) {
            self.CreateDonutOrPieChart(option);
        }
        else {
            container.append('<div class="chartWrapper fitChartWrapper"><div id="' + self.ElementId.substr(1) + '" class="widgetDisplay k-chart"></div></div>');

            if (displayDetail.chart_type === enumHandlers.CHARTTYPE.RADARCHART.Code || displayDetail.chart_type === enumHandlers.CHARTTYPE.GAUGE.Code) {
                container.addClass('navigatable');
                option.Navigator = false;
            }
            self.SetChartOptionAndBinding(self.ElementId.substr(1), option);

            container.find('.chartWrapper').scrollTop(jQuery(self.ElementId).height());
        }
    };
    self.CreateEmptyChart = function () {
        var container = jQuery(self.Container);

        container.append('<div class="chartWrapper"><div id="' + self.ElementId.substr(1) + '" class="widgetDisplay"></div></div>');
        var rowArea = self.FieldSettings.GetFields(enumHandlers.FIELDSETTINGAREA.ROW);
        var categoryCaption = rowArea.length ? rowArea[0].Caption : '';
        var dataArea = self.FieldSettings.GetFields(enumHandlers.FIELDSETTINGAREA.DATA).findObjects('IsSelected', true);
        var titleFont = self.GetTitleFont();
        var chartOptions = {
            theme: window.kendoTheme,
            title: {
                text: ' '
            },
            categoryAxis: {
                title: { text: categoryCaption, font: titleFont },
                labels: { visible: false },
                majorGridLines: { visible: false },
                minorGridLines: { visible: false },
                axisCrossingValues: [-Infinity, Infinity]
            },
            valueAxes: [
                {
                    title: { text: '', font: titleFont },
                    labels: { visible: false },
                    majorGridLines: { visible: false },
                    minorGridLines: { visible: false }
                }
            ]
        };
        if (dataArea.length) {
            jQuery.each(dataArea, function (index, dataField) {
                chartOptions.valueAxes[index] = jQuery.extend({}, chartOptions.valueAxes[0]);
                chartOptions.valueAxes[index].title.text = dataField.Caption;
            });
        }

        self.Chart = jQuery(self.ElementId).kendoChart(chartOptions).data(enumHandlers.KENDOUITYPE.CHART);
        measurePerformance.SetEndTime();
        self.UpdateLayout(0);
    };
    self.CreateDonutOrPieChart = function (option) {
        var container = jQuery(self.Container);
        var groupCategories = [];
        var categoryField = WC.Utility.ConvertFieldName(self.CategoryField);
        var rowArea = self.FieldSettings.GetFields(enumHandlers.FIELDSETTINGAREA.ROW);
        var categoryCaption = rowArea.length ? rowArea[0].Caption : '';

        var loadMore = function (groups, showLoading) {
            self.MiniCharts.ScrollEnable = false;
            var chartWrapper = container.find('.chartWrapper');
            if (self.MiniCharts.List.length > 0 && showLoading) {
                chartWrapper.append('<div class="chartLoading" />');
                container.find('.chartLoading').busyIndicator(true);
            }

            var elements = [], chartId, chartIndex = container.find('.k-chart-item').length;
            jQuery.each(groups, function (index, groupCategory) {
                chartId = self.ElementId.substr(1) + '_' + chartIndex;
                container.find('.chartWrapper').append('<div class="k-chart-item"><div id="' + chartId + '"></div></div>');
                option.CategoryValue = groupCategory.CategoriesId === self.TEXT_NULL ? null : groupCategory.CategoriesId;
                option.Tooltip = { Template: '#= category #, #= value #' };

                var categoryName = IsNullOrEmpty(groupCategory.CategoriesName) ? self.TEXT_NULL : groupCategory.CategoriesName.toString() + ' ';
                option.Title = categoryCaption + (categoryName ? '\n' + categoryName : '');
                option.TitleAlignment = 'left';

                option.AdjustLayout = false;
                option.Navigator = false;
                self.SetChartOptionAndBinding(chartId, option);
                elements.push('#' + chartId);
                jQuery('#' + chartId).css('opacity', 0);
                chartIndex++;
            });
            if (container.find('.chartWrapper .k-chart-item').length < 2) {
                container.find('.chartWrapper .k-chart-item').removeClass('k-chart-item');
            }

            self.UpdateLayout(0, false);
            setTimeout(function () {
                var chart;
                jQuery.each(elements, function (k, v) {
                    chart = jQuery(v).data(enumHandlers.KENDOUITYPE.CHART);
                    chart.dataSource.read();
                    chart.__createCustomLegend();
                    chart.redraw();
                    chart.options.transitions = false;
                    jQuery(v).animate({ opacity: 1 }, function () {
                        if (k === elements.length - 1) {
                            self.MiniCharts.ScrollEnable = true;
                            container.find('.chartLoading').remove();
                            self.UpdateLayout(0);

                            chartWrapper.trigger('scroll');
                        }
                    });
                });
            }, showLoading ? 200 : 0);
        };

        if (self.GroupField) {
            jQuery.each(self.Series, function (index, chartSeries) {
                if (chartSeries[self.AggergateFields[0].field]) {
                    var compareValue;
                    if (!IsNullOrEmpty(chartSeries[categoryField])) {
                        compareValue = chartSeries[categoryField].toString().toLowerCase();
                    }
                    else {
                        compareValue = self.TEXT_NULL;
                    }

                    var findCategory = groupCategories.hasObject('CategoriesId', function (category) {
                        return category.toString().toLowerCase() === compareValue;
                    });
                    if (!findCategory) {
                        groupCategories.push({
                            CategoriesId: IsNullOrEmpty(chartSeries[categoryField]) ? self.TEXT_NULL : chartSeries[categoryField],
                            CategoriesName: chartSeries[categoryField + '_label']
                        });
                    }
                }
            });
            self.MiniCharts.List = groupCategories;
            self.MiniCharts.ScrollEnable = true;

            container.addClass('navigatable').append('<div class="chartWrapper minichart" />');

            var element = container.find('.chartWrapper');
            element.scroll(function () {
                if (!self.MiniCharts.List.length)
                    return;

                var lastScroll = element.scrollTop();
                if (!self.MiniCharts.ScrollEnable) {
                    if (element.data('lastScroll')) {
                        element.scrollTop(jQuery(this).data('lastScroll'));
                    }
                }
                else if (self.MiniCharts.ScrollEnable && lastScroll + element.innerHeight() > this.scrollHeight - 100) {
                    element.data('lastScroll', lastScroll);
                    loadMore(self.MiniCharts.List.splice(0, self.MiniCharts.Perpage), true);
                }
            });

            //scroll area can use on touch device only (because laptop and pc can scroll by wheel mouse)
            if (Modernizr.touch) {
                new kendo.UserEvents(element, {
                    global: true,
                    move: function (e) {
                        element.scrollTop(element.scrollTop() - e.y.delta);
                        e.preventDefault();
                    }
                });
            }

            var loadNextPage = self.MiniCharts.List.length % self.MiniCharts.Perpage !== 0;
            loadMore(self.MiniCharts.List.splice(0, self.MiniCharts.Perpage), false);
            if (loadNextPage) {
                loadMore(self.MiniCharts.List.splice(0, self.MiniCharts.Perpage), true);
            }
        }
        else {
            container.append('<div class="chartWrapper"><div id="' + self.ElementId.substr(1) + '"></div></div>');
            option.Navigator = false;
            option.Transition = self.Categories.length <= 200;
            self.SetChartOptionAndBinding(self.ElementId.substr(1), option);
        }
    };
    self.SetChartOptionAndBinding = function (elementId, initialOption) {
        if (initialOption.Type !== enumHandlers.CHARTTYPE.GAUGE.Code) {
            var rowArea = self.FieldSettings.GetFields(enumHandlers.FIELDSETTINGAREA.ROW),
                columnArea = self.FieldSettings.GetFields(enumHandlers.FIELDSETTINGAREA.COLUMN),
                dataArea = self.FieldSettings.GetFields(enumHandlers.FIELDSETTINGAREA.DATA).findObjects('IsSelected', true),
                categoryFieldSource = null, groupFieldSource = null,
                categoryFieldSourceType = null, groupFieldSourceType = null,
                aggFieldSource = null, aggFieldSourceType = null;

            if (rowArea.length === 1) {
                categoryFieldSource = rowArea[0].Caption;
                categoryFieldSourceType = rowArea[0].DataType;
            }
            else if (rowArea.length > 1) {
                /* M4-14047: Show warning pop-up when categories or series area had one more field, and not render chart */
                popup.Alert(Localization.Warning_Title, Localization.WarningCategoriesOrSeriesInChartHadMoreThanOne);
                return;
            }

            if (columnArea.length === 1) {
                groupFieldSource = columnArea[0].Caption;
                groupFieldSourceType = columnArea[0].DataType;
            }
            else if (columnArea.length > 1) {
                /* M4-14047: Show warning pop-up when categories or series area had one more field, and not render chart */
                popup.Alert(Localization.Warning_Title, Localization.WarningCategoriesOrSeriesInChartHadMoreThanOne);
                return;
            }

            if (dataArea.length) {
                aggFieldSource = dataArea[0].Caption;
                aggFieldSourceType = dataArea[0].DataType;
            }

            var option = jQuery.extend(true, {
                DataType: {
                    CategoryFieldType: categoryFieldSourceType ? self.ConvertCategoryFieldType(categoryFieldSourceType) : null,
                    GroupFieldType: groupFieldSourceType ? self.ConvertCategoryFieldType(groupFieldSourceType) : null
                },
                FieldSource: {
                    CategoryField: categoryFieldSource,
                    GroupField: groupFieldSource,
                    CategoryFieldType: categoryFieldSourceType,
                    GroupFieldType: groupFieldSourceType,
                    AggField: aggFieldSource,
                    AggFieldType: aggFieldSourceType
                }
            }, initialOption);

            self.BindingChart(elementId, option);
        }
        else {
            self.BindingGauge(elementId);
        }
    };
    self.BindingChart = function (elementId, option) {
        var setting = jQuery.extend(true, {
            AdjustLayout: true,
            Transition: true,
            Navigator: true,
            Title: ' ',
            TitleAlignment: 'center',
            Series: self.Series,
            Type: enumHandlers.CHARTTYPE.BARCHART.Code,
            Stack: false,
            Legend: { Visible: true, Position: enumHandlers.POSITION.TOP.Code },
            DataType: { CategoryFieldType: enumHandlers.FIELDTYPE.STRING, GroupFieldType: enumHandlers.FIELDTYPE.STRING },
            FieldSource: {
                CategoryField: null, CategoryFieldType: null,
                GroupField: null, GroupFieldType: null,
                AggField: null, AggFieldType: null
            },
            Label: { Rotation: 0 },
            CategoryValue: 0,
            ValueAxis: { Visible: true }
        }, option);

        var categoryField = WC.Utility.ConvertFieldName(self.CategoryField);
        var groupField = WC.Utility.ConvertFieldName(self.GroupField);
        var container = jQuery(self.Container);
        var categoryLabelTemplate = self.GetCategoryLabelTemplate();
        var isDonutOrPieChart = self.IsDonutOrPieChartType(setting.Type);
        var dataSource = self.GetChartDataSource(setting);
        var modelField = dataSource.schema.model.fields;

        // calculate default range
        if (setting.AdjustLayout && setting.Navigator && !self.FitLayout) {
            var filterRangeLimit = Math.floor((container.width() - 100) / self.MINAXIS);
            if (filterRangeLimit < self.FILTERRANGE.DEFAULT) {
                self.FILTERRANGE.DEFAULT = Math.max(self.FILTERRANGE.MIN, filterRangeLimit);
            }
        }

        // set start and size
        var displayDetail = self.FieldSettings.GetDisplayDetails();
        if (displayDetail.range) {
            self.FILTERRANGE.START = displayDetail.range.start || 0;
            if (self.FILTERRANGE.START >= self.Categories.length) {
                self.FILTERRANGE.START = 0;
            }
            self.FILTERRANGE.CURRENT = Math.min(displayDetail.range.size || self.FILTERRANGE.DEFAULT, self.Categories.length);
        }
        else {
            self.FILTERRANGE.START = 0;
            self.FILTERRANGE.CURRENT = Math.min(self.FILTERRANGE.DEFAULT, self.Categories.length);
        }

        var rowArea = self.FieldSettings.GetFields(enumHandlers.FIELDSETTINGAREA.ROW);
        var rowCaption = rowArea.length ? rowArea[0].Caption : '';

        var titleFont = self.GetTitleFont();
        var nav = null;
        var chartOptions = {
            theme: window.kendoTheme,
            autoBind: false,
            transitions: setting.Transition,
            title: { text: setting.Title, font: titleFont, align: setting.TitleAlignment },
            dataSource: new kendo.data.DataSource(dataSource),
            seriesDefaults: {
                type: setting.Type === enumHandlers.CHARTTYPE.RADARCHART.Code && setting.Stack ? self.GetRadar2ndChartType() : setting.Type,
                stack: setting.Stack,
                markers: { size: 6 }
            },
            categoryAxis: [
                {
                    type: 'category',
                    justified: false,
                    labels: { visible: false }
                },
                {
                    type: 'category',
                    justified: false,
                    title: { text: rowCaption, font: titleFont },
                    labels: { template: categoryLabelTemplate, rotation: setting.Label.Rotation },
                    line: { visible: false },
                    majorGridLines: { visible: true }
                }
            ],
            legend: {
                visible: groupField || isDonutOrPieChart ? true : false
            },
            seriesHover: function (e) {
                _self.SeriesHover(e, setting.Type);
            },
            seriesClick: function (e) {
                if (e.originalEvent.type !== 'contextmenu') {
                    self.DrilldownChart(e, setting);
                }
            },
            legendItemClick: function (e) {
                e.preventDefault();
            },
            drag: function (e) {
                if (!Modernizr.touch && nav) {
                    _self.PanChart(e, setting.Type);
                }
            },
            dragEnd: function () {
                if (!Modernizr.touch && nav) {
                    _self.UpdateNavigatorSelection(nav);
                }
            }
        };

        var categoryCrossingValues = self.GetCategoryCrossingValues(modelField[categoryField]);
        if (setting.MultiAxis) {
            self.SetChartOptionsMultiAxis(chartOptions, setting, categoryCrossingValues);
        }
        else {
            self.SetChartOptionsSingleAxis(chartOptions, setting, categoryCrossingValues);
        }

        chartOptions.__customlegend = false;
        if (chartOptions.legend.visible) {
            chartOptions.__customlegend = true;
            jQuery.extend(chartOptions, {
                plotArea: {
                    margin: {
                        right: 150
                    }
                },
                legend: { visible: false }
            });
        }

        if (setting.AdjustLayout) {
            chartOptions.dataBound = function () {
                self.UpdateLayout(0, false);
            };
        }

        self.Chart = jQuery('#' + elementId)
            .removeData().empty()
            .addClass('k-chart')
            .kendoChart(chartOptions)
            .data(enumHandlers.KENDOUITYPE.CHART);

        if (self.Chart.options.__customlegend) {
            self.Chart.__createCustomLegend = _self.CreateCustomChartLegend;
        }
        else {
            self.Chart.__createCustomLegend = jQuery.noop;
        }

        // clean navigator
        nav = container.find('.navigator').data(enumHandlers.KENDOUITYPE.CHART);
        if (nav) {
            nav.destroy();
        }
        container.find('.navigatorWrapper').remove();
        if (setting.Navigator) {
            container.addClass('navigatable');

            nav = _self.CreateChartNavigator(container, setting.Type, dataSource, chartOptions);
        }

        if (setting.AdjustLayout) {
            if (setting.Navigator) {
                _self.UpdateChartFilter(setting.Type);

                nav.dataSource.read();
            }
            else {
                self.Chart.dataSource.sort(dataSource.sort);

                self.Chart.__createCustomLegend();
            }

            // disable animation
            self.Chart.options.transitions = false;
        }

        measurePerformance.SetEndTime();
    };
    _self.CreateCustomChartLegend = function (cleanElement) {
        var chart = this;
        var plotArea = chart._plotArea || chart.plotArea;
        if (typeof cleanElement === 'undefined')
            cleanElement = true;

        var chartSettings = self.GetChartSettings();
        if (!chartSettings) {
            return;
        }

        if (!chartSettings.legend.show) {
            chart.options.plotArea.margin.right = 0;
        }
        else if (plotArea) {
            var legendWrapper, legendElement;
            if (cleanElement) {
                legendElement = self.CreateChartLegendElement(chart);
                legendWrapper = self.CreateChartLegendWrapper(chart, legendElement);
            }
            else {
                var container = chart.wrapper.parent();
                legendElement = container.find('.k-legend-custom').css({ height: '' });
                legendWrapper = container.find('.k-legend-custom-wrapper').css({ width: '', height: '' });
            }

            // adjust legend layout
            self.AdjustChartLegendLayout(legendWrapper, legendElement, chart, plotArea);
        }
    };
    self.CreateDrilldownChartLegend = function (legendElement, chart, legendData) {
        if (self.CanDrilldown()) {
            legendElement.addClass('drilldown');
            legendElement.children('li').on('click', { chart: chart, groups: legendData }, self.DrilldownChartLegend);
        }
    };
    self.GetLegendData = function (chart) {
        var groups = [];
        var groupsCache = {};
        var groupData;
        jQuery.each(chart.options.series, function (index, serie) {
            if (typeof serie.name !== 'undefined') {
                groupData = self.Groups[serie.name];
                if (!groupData) {
                    jQuery.each(self.Groups, function (indexGroup, value) {
                        if (value.label === serie.name) {
                            groupData = value;
                            return false;
                        }
                    });
                }
                if (groupData && !groupsCache[groupData.value]) {
                    groups.push(groupData);
                    groupsCache[groupData.value] = true;
                }
            }
            else {
                var categoryField = WC.Utility.ConvertFieldName(self.CategoryField);
                var groupField = WC.Utility.ConvertFieldName(self.GroupField);
                jQuery.each(serie.data, function (indexData, value) {
                    groupData = self.Groups[value[groupField || categoryField]];
                    if (groupData && !groupsCache[groupData.value]) {
                        groups.push(groupData);
                        groupsCache[groupData.value] = true;
                    }
                });
            }
        });

        groups.sortObject('index', enumHandlers.SORTDIRECTION.ASC);

        return groups;
    };
    self.CreateChartLegendElement = function (chart) {
        var legendData = self.GetLegendData(chart);

        var html = '';
        jQuery.each(legendData, function (index, value) {
            if (typeof value !== 'undefined') {
                var label = htmlEncode(value.label);
                html += '<li title="' + value.label + '" data-index="' + index + '"><span style="background-color: ' + value.color + '"></span>' + label + '</li>';
            }
        });

        var legendElement = jQuery('<ul class="k-legend-custom" />').html(html);

        // support drilldown on legend
        self.CreateDrilldownChartLegend(legendElement, chart, legendData);

        return legendElement;
    };
    self.CreateChartLegendWrapper = function (chart, legendElement) {
        var legendWrapper = jQuery('<div class="k-legend-custom-wrapper" />');
        legendWrapper.append(self.CreateChartLegendHeader());
        legendWrapper.append(legendElement);

        chart.wrapper.parent().find('.k-legend-custom-wrapper').remove();
        chart.wrapper.parent().append(legendWrapper);

        return legendWrapper;
    };
    self.CreateChartLegendHeader = function () {
        var legendFields = self.FieldSettings.GetFields(enumHandlers.FIELDSETTINGAREA.COLUMN);
        if (!legendFields.length) {
            legendFields = self.FieldSettings.GetFields(enumHandlers.FIELDSETTINGAREA.ROW);
        }

        var legendTitleElement;
        if (legendFields.length) {
            legendTitleElement = jQuery('<h3 title="' + htmlEncode(legendFields[0].Caption) + '"><span>' + htmlEncode(legendFields[0].Caption) + '</span></h3>');
            legendTitleElement.append(
                jQuery('<a class="btnInfo"></a>').on('click', legendFields[0], function (e) {
                    helpTextHandler.ShowHelpTextPopup(e.data.SourceField, helpTextHandler.HELPTYPE.FIELD, self.Models.Angle.Data().model);
                })
            );
        }
        else {
            legendTitleElement = '';
        }
        return legendTitleElement;
    };
    self.AdjustChartLegendLayout = function (legendWrapper, legendElement, chart, plotArea) {
        var wrapperWidth = chart.wrapper.width();
        var legendSize = 150;
        if (chart.wrapper.width() / 2 < legendSize) {
            legendSize = Math.floor(wrapperWidth / 2);
        }
        chart.options.plotArea.margin.right = legendSize;

        var parentSize = chart.wrapper.parent().width();
        var legendPosition = wrapperWidth - legendSize;
        if (parentSize > wrapperWidth) {
            legendPosition += (parentSize - wrapperWidth) / 2;
        }

        var chartHeight = chart.wrapper.height() - plotArea.box.y1 - 5;
        var legendHeight = Math.min(chartHeight, legendWrapper.height());
        var legendTitleHeight = legendWrapper.children('h3').outerHeight() || 0;
        legendWrapper.css({
            top: parseFloat(chart.wrapper.css('margin-top')) + Math.max((chartHeight - legendHeight) / 2, plotArea.box.y1) - 5,
            left: legendPosition - 2,
            width: legendSize
        });
        legendElement.height(legendHeight - legendTitleHeight);
        legendWrapper.find('h3 > span').css('max-width', legendSize - 16);
        legendWrapper.find('h3 > .btnInfo').hide();
    };
    self.GetCategoryCrossingValues = function (dataSourceField) {
        var minAxisCrossingValue, maxAxisCrossingValue;
        if (self.Categories.length) {
            if (dataSourceField && WC.FormatHelper.IsDateOrDateTime(dataSourceField.type)) {
                minAxisCrossingValue = new Date(-8640000000000000);
                maxAxisCrossingValue = new Date(8640000000000000);
            }
            else {
                minAxisCrossingValue = -Infinity;
                maxAxisCrossingValue = Infinity;
            }
        }
        else {
            minAxisCrossingValue = 0;
            maxAxisCrossingValue = 0;
        }
        return [minAxisCrossingValue, maxAxisCrossingValue];
    };

    _self.PanChart = function (e, baseChartType) {
        var delta = Math.round(e.originalEvent.x.initialDelta / self.MOVESPEED);
        if (delta !== 0) {
            var newStart = Math.max(0, self.FILTERRANGE.START - delta);
            self.FILTERRANGE.START = Math.min(self.Categories.length - self.FILTERRANGE.CURRENT, newStart);
            self.SaveChartRange();
            _self.UpdateChartFilter(baseChartType);
        }
    };
    _self.UpdateNavigatorSelection = function (nav) {
        var filter = self.GetFilter(self.FILTERRANGE.START, self.FILTERRANGE.CURRENT);
        nav.options.categoryAxis.select.from = filter.filters[0].filters[0].index;
        nav.options.categoryAxis.select.to = filter.filters[0].filters[1].index;
        nav.redraw();
    };
    _self.CreateChartNavigator = function (container, baseChartType, dataSource, options) {
        dataSource = ko.toJS(dataSource);
        options = ko.toJS(options);

        container.append('<div class="navigatorWrapper noClicked"><div class="toggleButton"></div><div class="navigator"></div></div>');
        container.find('.toggleButton').click(function () {
            var parent = jQuery(this).parent();
            parent.removeClass('noClicked');
            if (parent.hasClass('hidden')) {
                parent.removeClass('hidden');
            }
            else {
                parent.addClass('hidden');
            }
            self.UpdateLayout(10);
        });

        var filter = self.GetFilter(self.FILTERRANGE.START, self.FILTERRANGE.CURRENT);
        var categoryField = WC.Utility.ConvertFieldName(self.CategoryField);

        // prepare data source
        delete options.seriesClick;
        delete options.legendItemClick;
        delete options.drag;
        delete options.dragEnd;
        delete options.zoom;
        delete options.dataSource;
        delete options.dataBound;
        delete options.plotArea;

        // no need grouping
        if (dataSource.group) {
            delete dataSource.group;
        }

        jQuery.extend(true, options, {
            dataSource: new kendo.data.DataSource(dataSource),
            renderAs: 'svg',
            transitions: false,
            title: { visible: false },
            seriesDefaults: {
                markers: { size: 2 },
                type: enumHandlers.CHARTTYPE.AREACHART.Code,
                stack: false
            },
            tooltip: { visible: false },
            legend: { visible: false },
            selectEnd: function (e) {
                var start = Math.max(0, e.from);
                var length = Math.min(e.to - start + 1, self.Categories.length);

                if (self.FILTERRANGE.START !== start || self.FILTERRANGE.CURRENT !== length) {
                    self.FILTERRANGE.START = start;
                    self.FILTERRANGE.CURRENT = length;
                    self.SaveChartRange();
                    _self.UpdateChartFilter(baseChartType);
                }
            }
        });
        options.categoryAxis = jQuery.extend({}, options.categoryAxis instanceof Array ? options.categoryAxis[1] || options.categoryAxis[0] : options.categoryAxis, {
            categories: jQuery.map(self.Categories, function (e) { return e.value; }),
            title: { visible: false },
            labels: { visible: false },
            line: { visible: false },
            majorGridLines: { visible: false },
            minorGridLines: { visible: false },
            select: {
                from: filter.filters[0].filters[0].index,
                to: filter.filters[0].filters[1].index,
                mousewheel: { zoom: 'right' }
            }
        });
        delete options.categoryAxis.justified;

        jQuery.each(options.series, function (index, serie) {
            jQuery.extend(options.series[index], {
                overlay: { gradient: 'none' },
                type: enumHandlers.CHARTTYPE.AREACHART.Code,
                stack: false,
                field: serie.field || WC.Utility.ConvertFieldName(self.AggergateFields[index].field),
                categoryField: serie.categoryField || categoryField,
                aggregate: 'sum'
            });
            if (options.series[index].xField) {
                options.series[index].categoryField = options.series[index].xField;
            }

            delete options.series[index].xField;
            delete options.series[index].yField;
            delete options.series[index].sizeField;
        });

        delete options.xAxes;
        delete options.xAxis;
        delete options.yAxes;
        delete options.yAxis;

        var axisSettings = {
            title: { visible: false },
            labels: { visible: false },
            line: { visible: false },
            majorGridLines: { visible: false },
            minorGridLines: { visible: false },
            visible: false
        };
        var nav = container.find('.navigator').kendoChart(options).data(enumHandlers.KENDOUITYPE.CHART);
        if (nav.options.valueAxes) {
            jQuery.each(nav.options.valueAxes, function (index) {
                jQuery.extend(nav.options.valueAxes[index], axisSettings);
            });
        }
        else {
            nav.options.valueAxes = jQuery.extend({}, axisSettings);
        }
        if (nav.options.valueAxis) {
            jQuery.each(nav.options.valueAxis, function (index) {
                jQuery.extend(nav.options.valueAxis[index], axisSettings);
            });
        }
        else {
            nav.options.valueAxis = jQuery.extend({}, axisSettings);
        }
        return nav;
    };
    _self.UpdateChartFilter = function (baseChartType) {
        var filter = self.GetFilter(self.FILTERRANGE.START, self.FILTERRANGE.CURRENT);
        var filterItems = self.GetCategoriesByFilter(filter);
        self.Chart.dataSource.filter(filter);

        // reorder category
        var categoryField = WC.Utility.ConvertFieldName(self.CategoryField);
        if (self.Chart.options.categoryAxis instanceof Array) {
            jQuery.each(self.Chart.options.categoryAxis, function (index, categoryAxis) {
                categoryAxis.categories = filterItems.slice();
                if (categoryAxis.dataItems) {
                    var dataItemsSorted = self.GetSortObject(categoryAxis.dataItems, { field: categoryField + '_sortindex', dir: 'asc' });
                    categoryAxis.dataItems = dataItemsSorted;
                }
            });
        }
        else {
            self.Chart.options.categoryAxis.categories = filterItems.slice();
            if (self.Chart.options.categoryAxis.dataItems) {
                var dataItemsSorted = self.GetSortObject(self.Chart.options.categoryAxis.dataItems, { field: categoryField + '_sortindex', dir: 'asc' });
                self.Chart.options.categoryAxis.dataItems = dataItemsSorted;
            }
        }

        // bubble or scatter
        if (self.IsScatterOrBubbleChartType(baseChartType)) {
            var scatterOrBubbleBoundary = self.CalculateScatterAndBubbleBoundary();
            if (self.Chart.options.xAxis instanceof Array) {
                jQuery.extend(self.Chart.options.xAxis[index], scatterOrBubbleBoundary);
            }
            else {
                jQuery.extend(self.Chart.options.xAxis, scatterOrBubbleBoundary);
            }
        }

        // find min/max of value axis
        var chartSetting = self.GetChartSettings();
        if (!chartSetting.show_as_percentage) {
            var dataItems = self.GetDataItemsFromView(self.Chart);
            var chartScaleSettings = chartSetting[fieldSettingsHandler.OptionAxisScaleRangesId] || {};
            jQuery.each(self.Chart._sourceSeries, function (index, serie) {
                var isStack = serie.stack;
                if (self.IsScatterOrBubbleChartType(baseChartType)) {
                    isStack = false;
                }
                var seriesField = serie.field || serie.yField;
                var axisValueSettings;
                if (chartScaleSettings[seriesField]) {
                    axisValueSettings = {
                        min: chartScaleSettings[seriesField][0],
                        max: chartScaleSettings[seriesField][1],
                        majorUnit: chartScaleSettings[seriesField][2]
                    };
                }
                else {
                    axisValueSettings = self.CalculateValuesBoundary(dataItems, seriesField, isStack);
                }

                if (self.Chart.options.valueAxis instanceof Array) {
                    jQuery.extend(self.Chart.options.valueAxis[index], axisValueSettings);
                }
                else {
                    jQuery.extend(self.Chart.options.valueAxis, axisValueSettings);
                }

                if (self.Chart.options.yAxis instanceof Array) {
                    jQuery.extend(self.Chart.options.yAxis[index], axisValueSettings);
                }
                else {
                    jQuery.extend(self.Chart.options.yAxis, axisValueSettings);
                }
            });
        }

        // group color
        if (self.GroupField) {
            var groupData;
            jQuery.each(self.Chart.options.series, function (index, serie) {
                groupData = self.Groups[serie.name];
                if (!groupData) {
                    jQuery.each(self.Groups, function (indexGroup, value) {
                        if (value.label === serie.name) {
                            groupData = value;
                            return false;
                        }
                    });
                }
                if (groupData && groupData.color) {
                    serie.color = groupData.color;
                }
            });
        }

        self.Chart.__createCustomLegend();

        self.Chart.redraw();
    };
    _self.SeriesHover = function (e) {
        if (self.CanDrilldown()) {
            setTimeout(function () {
                e.element.css('cursor', 'pointer');
                e.sender.wrapper.find('circle').css('cursor', 'pointer');
                if (self.IsDonutOrPieChartType(e.series.type)
                    || e.series.type === enumHandlers.CHARTTYPE.BARCHART.Code
                    || e.series.type === enumHandlers.CHARTTYPE.COLUMNCHART.Code) {
                    e.element.next().css('cursor', 'pointer');
                }
            }, 1);
        }
    };
    self.BindingGauge = function (elementId) {
        self.GaugeLabels = {};
        var rangeValues = [],
            displayDetails = self.FieldSettings.GetDisplayDetails(),
            isASC = fieldSettingsHandler.CheckASCOrderGaugeValues(displayDetails.GaugeValues);

        var aggField = self.AggergateFields[0].field;
        var pointerValue = self.Series[0][aggField];
        var minGaugeValue = displayDetails.GaugeValues.min();
        var maxGaugeValue = displayDetails.GaugeValues.max();
        var i;

        // if pointer value is not in range
        if (pointerValue < minGaugeValue || pointerValue > maxGaugeValue) {
            var rangeDelta = pointerValue < 0 ? -1 : 1;
            var maxRange = self.CalculateGaugeValueBoundary(pointerValue) * rangeDelta;

            if (JSON.stringify(displayDetails.GaugeValues) === JSON.stringify(self.GAUGEDEFAULT.VALUES)) {
                // if user does not change a default values then re-calculate new ranges
                displayDetails.GaugeValues = [];
                maxGaugeValue = maxRange * rangeDelta;
                var rangeSpace = maxGaugeValue / 5;
                for (i = 0; i < 5; i++) {
                    displayDetails.GaugeValues.push(i * rangeSpace);
                }
                displayDetails.GaugeValues.push(maxGaugeValue);
                if (rangeDelta === -1) {
                    displayDetails.GaugeValues.reverse();
                }
                self.GaugeValues = displayDetails.GaugeValues.slice();

                self.FieldSettings.SetDisplayDetails({
                    GaugeValues: self.GaugeValues.slice()
                });

                if (!self.DashBoardMode()) {
                    fieldSettingsHandler.FieldSettings.SetDisplayDetails({
                        GaugeValues: self.GaugeValues.slice()
                    });
                    fieldSettingsHandler.BuildFieldsSettingsHtml();
                }
                isASC = true;
            }
            else {
                // M4-27325 fix disappearing colors
                var rationalNumber = pointerValue < minGaugeValue ? -1 : 1;

                // if user changed but values not in range then add extra range
                maxRange = maxRange * rationalNumber;
                if (maxRange < displayDetails.GaugeValues[0]) {
                    displayDetails.GaugeValues.splice(0, 0, maxRange);
                    displayDetails.GaugeColours.splice(0, 0, '#fffff');
                }
                else {
                    displayDetails.GaugeValues.push(maxRange);
                    displayDetails.GaugeColours.push('#ffffff');
                }
            }

            minGaugeValue = displayDetails.GaugeValues.min();
            maxGaugeValue = displayDetails.GaugeValues.max();
        }

        var delta = (isASC ? 1 : -1) * ((maxGaugeValue - minGaugeValue) / 1000);
        var rangeCount = displayDetails.GaugeValues.length - 1;
        for (i = 0; i < rangeCount; i++) {
            var rangeValue = {};

            if (displayDetails.GaugeValues[i] !== displayDetails.GaugeValues[i + 1]) {
                rangeValue = {
                    from: displayDetails.GaugeValues[i] + (i === 0 ? 0 : delta),
                    to: displayDetails.GaugeValues[i + 1],
                    color: displayDetails.GaugeColours[i]
                };
            }

            rangeValues.push(rangeValue);
        }

        var gaugePointerColor = self.THEME.POINTERCOLOR;
        var field = self.FieldSettings.GetFieldByFieldName(aggField);
        var valueSettings = JSON.stringify({
            FieldId: field.FieldName,
            FieldType: field.DataType,
            Bucket: field.Bucket.Operator,
            Index: 0,
            Axes: null
        });
        var gaugeOption = {
            theme: window.kendoTheme,
            gaugeArea: {
                margin: { top: 5, bottom: 50, left: 5, right: 5 }
            },
            pointer: {
                value: pointerValue
            },
            scale: {
                reverse: !isASC,
                minorTicks: {
                    visible: false
                },
                startAngle: 0,
                endAngle: 180,
                min: minGaugeValue,
                max: maxGaugeValue,
                labels: {
                    template: '#= window[\'' + self.ModelId + '\'].GetGaugeLabel(value, ' + valueSettings + ') #'
                },
                ranges: rangeValues
            },
            __ranges: rangeValues.slice()
        };

        self.Chart = jQuery('#' + elementId).kendoRadialGauge(gaugeOption).data(enumHandlers.KENDOUITYPE.RADIALGAUGE);
        measurePerformance.SetEndTime();

        // initial label status
        var labelCount = self.Chart.scale.labelsCount();
        var loop;
        for (loop = 0; loop < labelCount; loop++) {
            self.GaugeLabels[self.Chart.scale.labels[loop].value] = {
                size: WC.Utility.MeasureText(self.Chart.scale.labels[loop].text, self.FontDefault),
                visible: true
            };
        }

        if (self.CanDrilldown()) {
            self.Chart.wrapper.css('cursor', 'pointer').on('click', function () {
                self.DrilldownChart(null, { Type: enumHandlers.CHARTTYPE.GAUGE.Code });
            });
        }

        var aggrField = self.FieldSettings.GetFields(enumHandlers.FIELDSETTINGAREA.DATA).findObject('IsSelected', true);
        var aggrFieldCaption = WC.Utility.GetObjectValue(aggrField, 'Caption', '');
        self.Chart.wrapper.after('<div class="k-tooltip-custom gaugePointerLabel">'
            + '<span class="k-tooltip-label" style="background-color:' + gaugePointerColor + ';border-color:' + gaugePointerColor + '">' + self.Series[0][aggField + '_label'] + '</span>'
            + '<span class="gaugeCaption" title="' + aggrFieldCaption + '">' + aggrFieldCaption + '</span>'
            + '</div>');

        self.UpdateLayout(0, true);
        self.Chart.options.transitions = false;
    };
    self.GetTitleFont = function () {
        return self.FontDefault.replace(/\d{2}px/, '14px');
    };
    self.GetChartDataSource = function (setting) {
        var categoryField = WC.Utility.ConvertFieldName(self.CategoryField);
        var groupField = WC.Utility.ConvertFieldName(self.GroupField);
        var isDonutOrPieChart = self.IsDonutOrPieChartType(setting.Type);

        if (self.IsRadarChartType(setting.Type) && groupField) {
            var categoryFieldName;
            if (WC.FormatHelper.IsDateOrDateTime(setting.FieldSource.CategoryFieldType))
                categoryFieldName = self.CategoryField + '_label';
            else
                categoryFieldName = self.CategoryField;
            var groupFieldName, groupFieldValue;
            if (WC.FormatHelper.IsDateOrDateTime(setting.FieldSource.GroupFieldType)) {
                groupFieldName = self.GroupField + '_label';
                groupFieldValue = 'label';
            }
            else {
                groupFieldName = self.GroupField;
                groupFieldValue = 'value';
            }
            jQuery.each(self.Categories, function (index, category) {
                var dataCategory = self.Series.findObjects(categoryFieldName, category[categoryFieldName]);
                jQuery.each(self.Groups, function (groupValue, grouping) {
                    if (!dataCategory.hasObject(groupFieldName, grouping[groupFieldValue])) {
                        var newSerie = {};
                        newSerie[self.GroupField] = grouping.value;
                        newSerie[self.GroupField + '_label'] = grouping.label;
                        newSerie[self.GroupField + '_sortindex'] = grouping.index;
                        newSerie[self.GroupField + '_color'] = grouping.color;
                        newSerie[self.CategoryField] = category[self.CategoryField];
                        newSerie[self.CategoryField + '_label'] = category[self.CategoryField + '_label'];
                        newSerie[self.CategoryField + '_sortindex'] = category[self.CategoryField + '_sortindex'];
                        newSerie[self.CategoryField + '_color'] = category[self.CategoryField + '_color'];
                        newSerie[self.AggergateFields[0].field] = 0;
                        newSerie[self.AggergateFields[0].field + '_label'] = "0";
                        newSerie[self.AggergateFields[0].field + '_sortindex'] = 0;
                        self.Series.push(newSerie);
                    }
                });
            });
        }

        var dataSource = {
            data: self.Series
        };
        var modelField = {};

        if (setting.DataType.GroupFieldType && !isDonutOrPieChart) {
            modelField[categoryField] = { type: self.ConvertCategoryFieldType(setting.FieldSource.CategoryFieldType) };
            modelField[groupField] = { type: self.ConvertCategoryFieldType(setting.DataType.GroupFieldType) };

            var groupFieldSortDir = 'asc';
            var isColumnOrAreaChart = setting.Type === enumHandlers.CHARTTYPE.COLUMNCHART.Code || setting.Type === enumHandlers.CHARTTYPE.AREACHART.Code;
            if ((setting.Type === enumHandlers.CHARTTYPE.COLUMNCHART.Code && setting.Stack) || (isColumnOrAreaChart && setting.MultiAxis)) {
                groupFieldSortDir = 'desc';
            }

            dataSource.group = [{
                field: groupField,
                dir: groupFieldSortDir
            }];
            dataSource.sort = [
                { field: categoryField + '_sortindex', dir: 'asc' },
                { field: groupField + '_sortindex', dir: 'asc' }
            ];
        }
        else if (setting.DataType.GroupFieldType && isDonutOrPieChart) {
            modelField[groupField] = { type: self.ConvertCategoryFieldType(setting.FieldSource.GroupFieldType) };

            dataSource.sort = [
                { field: groupField + '_sortindex', dir: 'asc' }
            ];
            dataSource.filter = {
                field: categoryField,
                operator: 'eq',
                value: setting.CategoryValue
            };
        }
        else if (!setting.DataType.GroupFieldType) {
            modelField[categoryField] = { type: self.ConvertCategoryFieldType(setting.FieldSource.CategoryFieldType) };

            dataSource.sort = [
                { field: categoryField + '_sortindex', dir: 'asc' }
            ];
        }

        dataSource.schema = {
            model: { fields: modelField }
        };

        return dataSource;
    };
    self.SetChartOptionsMultiAxis = function (chartOptions, setting, axisCrossingValues) {
        var colorSeries = [];
        var categorySeries = [];
        var dataField = {};
        var defaultColors = self.THEME.COLOURS;
        var colorIndex = 0;
        var categoryField = WC.Utility.ConvertFieldName(self.CategoryField);
        var groupField = WC.Utility.ConvertFieldName(self.GroupField);
        var aggFields = self.AggergateFields;
        var titleFont = self.GetTitleFont();
        var isScatter = self.IsScatterChartType(setting.Type);
        var chartSettings = self.GetChartSettings();

        chartOptions.series = [];
        chartOptions.valueAxes = [];
        chartOptions.yAxes = [];

        // seriesColors
        jQuery.each(self.Series, function (i, series) {
            if (jQuery.inArray(series[groupField + '_label'], categorySeries) === -1) {
                categorySeries.push(series[groupField + '_label']);

                if (colorIndex > 5) {
                    colorIndex = 0;
                }

                colorSeries.push(defaultColors[colorIndex]);
                colorIndex++;
            }
        });
        chartOptions.seriesColors = colorSeries;

        jQuery.each(aggFields, function (i, aggField) {
            var seriesChartType = self.GetMultiAxisChartType(i, setting.Type);
            dataField = self.FieldSettings.GetFieldByFieldName(aggField.field);

            var valueSettings = JSON.stringify({
                FieldId: dataField.FieldName,
                FieldType: dataField.DataType,
                Bucket: dataField.Bucket.Operator,
                Index: i,
                Axes: self.VALUETYPE.VALUE
            });

            var templateTooltip = self.ConvertTooltipTemplate(groupField, setting.Type, dataField.DataType, aggField.field, chartSettings.datalabel.show_values);
            if (isScatter) {
                chartOptions.series.push({
                    type: self.GetScatterLineChartType(),
                    name: '#= group.value #',
                    xField: categoryField,
                    yField: aggField.field,
                    yAxis: aggField.field + '_axis',
                    visibleInLegend: i === 0 ? true : false,
                    colorField: (groupField || categoryField) + '_color',
                    tooltip: {
                        visible: true,
                        template: templateTooltip
                    },
                    labels: {
                        visible: false,
                        template: templateTooltip
                    }
                });


                chartOptions.yAxes.push({
                    name: aggField.field + '_axis',
                    title: { text: dataField.Caption, font: titleFont },
                    visible: true,
                    labels: {
                        template: '#= window[\'' + self.ModelId + '\'].GetAxesLabel(data, ' + valueSettings + ') #'
                    }
                });
            }
            else {
                var isStack = self.GetMultiAxisStack(seriesChartType);
                var seriePosition;
                var customLabel;
                if (isStack && (seriesChartType === enumHandlers.CHARTTYPE.BARCHART.Code || seriesChartType === enumHandlers.CHARTTYPE.COLUMNCHART.Code)) {
                    seriePosition = 'center';
                    customLabel = self.VisualLabel;
                }

                var seriesData = {
                    type: seriesChartType,
                    name: '#= group.value #',
                    field: aggField.field,
                    categoryField: categoryField,
                    width: 1,
                    axis: aggField.field + '_axis',
                    visibleInLegend: i === 0 ? true : false,
                    colorField: (groupField || categoryField) + '_color',
                    tooltip: {
                        visible: true,
                        template: templateTooltip
                    },
                    labels: {
                        position: seriePosition,
                        visual: customLabel,
                        visible: false,
                        template: templateTooltip
                    }
                };

                var valueAxes = {
                    name: aggField.field + '_axis',
                    title: { text: dataField.Caption + ' (' + seriesChartType + ' chart)', font: titleFont },
                    visible: true,
                    axisCrossingValues: [0, -Infinity]
                };

                if (chartSettings.show_as_percentage) {
                    seriesData.stack = { type: "100%" };
                }
                else {
                    seriesData.stack = isStack;
                    valueAxes.labels = {
                        template: '#= window[\'' + self.ModelId + '\'].GetAxesLabel(data, ' + valueSettings + ') #'
                    };
                }

                chartOptions.series.push(seriesData);
                chartOptions.valueAxes.push(valueAxes);
            }
        });

        if (isScatter) {
            dataField = self.FieldSettings.GetFieldByFieldName(self.CategoryField);
            var valueSettings = JSON.stringify({
                FieldId: dataField.FieldName,
                FieldType: dataField.DataType,
                Bucket: dataField.Bucket.Operator,
                Index: 0,
                Axes: self.VALUETYPE.CATEGORY
            });
            chartOptions.xAxes = [
                {
                    title: { text: dataField.Caption, font: titleFont },
                    visible: setting.ValueAxis.Visible,
                    labels: {
                        template: '#= window[\'' + self.ModelId + '\'].GetAxesLabel(data, ' + valueSettings + ') #',
                        rotation: setting.Label.Rotation
                    }
                }
            ];
        }

        if (chartOptions.xAxes) {
            if (chartOptions.xAxes instanceof Array) {
                jQuery.each(chartOptions.xAxes, function (index, xAxes) {
                    xAxes.axisCrossingValues = axisCrossingValues;
                });
            }
            else {
                chartOptions.xAxes.axisCrossingValues = axisCrossingValues;
            }
        }

        if (chartOptions.categoryAxis instanceof Array) {
            jQuery.each(chartOptions.categoryAxis, function (index, categoryAxis) {
                categoryAxis.axisCrossingValues = axisCrossingValues;
            });
        }
        else {
            chartOptions.categoryAxis.axisCrossingValues = axisCrossingValues;
        }
    };
    self.SetChartOptionsSingleAxis = function (chartOptions, setting, axisCrossingValues) {
        var categoryField = WC.Utility.ConvertFieldName(self.CategoryField);
        var groupField = WC.Utility.ConvertFieldName(self.GroupField);
        var aggFields = self.AggergateFields;
        var aggFieldName1 = WC.Utility.ConvertFieldName(aggFields[0].field);
        var titleFont = self.GetTitleFont();
        var chartSettings = self.GetChartSettings();

        var dataField = self.FieldSettings.GetFields(enumHandlers.FIELDSETTINGAREA.DATA).findObject('IsSelected', true);
        var valueSettings = JSON.stringify({
            FieldId: dataField.FieldName,
            FieldType: dataField.DataType,
            Bucket: dataField.Bucket.Operator,
            Index: 0,
            Axes: self.VALUETYPE.VALUE
        });

        var templateTooltip = self.ConvertTooltipTemplate(setting.FieldSource.GroupFieldType, setting.Type, setting.FieldSource.CategoryFieldType, aggFieldName1, chartSettings.datalabel.show_values);
        chartOptions.series = [
            {
                tooltip: {
                    visible: true,
                    template: templateTooltip
                },
                labels: {
                    visible: false,
                    template: templateTooltip
                }
            }
        ];

        if (setting.Type === enumHandlers.CHARTTYPE.AREACHART.Code && setting.Stack) {
            chartOptions.series[0].opacity = 1;
        }

        if (!self.IsScatterOrBubbleChartType(setting.Type)) {
            var isDonutOrPieChart = self.IsDonutOrPieChartType(setting.Type);

            if (chartOptions.seriesDefaults.stack && (setting.Type === enumHandlers.CHARTTYPE.BARCHART.Code || setting.Type === enumHandlers.CHARTTYPE.COLUMNCHART.Code)) {
                chartOptions.series[0].labels.zIndex = 2;
                chartOptions.series[0].labels.position = 'center';
                chartOptions.series[0].labels.visual = self.VisualLabel;
            }
            chartOptions.series[0].field = aggFieldName1;
            chartOptions.series[0].categoryField = isDonutOrPieChart && groupField ? groupField : categoryField;
            chartOptions.series[0].width = 1;
            chartOptions.series[0].colorField = (groupField || categoryField) + '_color';

            chartOptions.valueAxes = [
                {
                    title: { text: dataField.Caption, font: titleFont },
                    visible: setting.ValueAxis.Visible,
                    axisCrossingValues: [0, -Infinity]
                }
            ];



            // seriesColors for radar chart
            if (self.IsRadarChartType(setting.Type)) {
                chartOptions.seriesColors = [];
                jQuery.each(self.Groups, function (index, chartGroup) {
                    chartOptions.seriesColors[chartGroup.index] = chartGroup.color;
                });

                // remove undefined order
                chartOptions.seriesColors = chartOptions.seriesColors.filter(function (color) {
                    return typeof color !== 'undefined'
                });

                if (!groupField) {
                    delete chartOptions.series[0].colorField;
                }

                if (chartOptions.categoryAxis instanceof Array) {
                    chartOptions.categoryAxis = chartOptions.categoryAxis[1];
                    chartOptions.categoryAxis.title.visible = false;
                }
                chartOptions.title.text = chartOptions.categoryAxis.title.text;
                chartOptions.plotArea = { margin: { bottom: 20 } };
            }
            else if (isDonutOrPieChart) {
                chartOptions.series[0].labels.align = 'circle';
                chartOptions.series[0].labels.position = 'outsideEnd';

                if (chartOptions.categoryAxis instanceof Array) {
                    chartOptions.categoryAxis = chartOptions.categoryAxis[1];
                }
            }
        }
        else if (setting.Type === enumHandlers.CHARTTYPE.BUBBLECHART.Code) {
            chartOptions.series[0].labels.position = 'center';
            chartOptions.series[0].labels.visual = self.VisualLabel;
            chartOptions.series[0].xField = categoryField;
            chartOptions.series[0].yField = aggFieldName1;
            chartOptions.series[0].sizeField = aggFields.length === 2 ? WC.Utility.ConvertFieldName(aggFields[1].field) : aggFieldName1;
            chartOptions.series[0].categoryField = groupField || '';
            chartOptions.series[0].colorField = (groupField || categoryField) + '_color';

            chartOptions.yAxes = [
                {
                    name: aggFieldName1,
                    title: { text: dataField.Caption, font: titleFont },
                    visible: setting.ValueAxis.Visible,
                    labels: {
                        template: '#= window[\'' + self.ModelId + '\'].GetAxesLabel(data, ' + valueSettings + ') #'
                    },
                    axisCrossingValues: [0, -Infinity]
                }
            ];

            dataField = self.FieldSettings.GetFields(enumHandlers.FIELDSETTINGAREA.ROW).findObject('IsSelected', true);
            valueSettings = JSON.stringify({
                FieldId: dataField.FieldName,
                FieldType: dataField.DataType,
                Bucket: dataField.Bucket.Operator,
                Index: 0,
                Axes: self.VALUETYPE.CATEGORY
            });

            var bubbleBoundary = self.CalculateScatterAndBubbleBoundary();
            chartOptions.xAxes = [
                {
                    majorUnit: bubbleBoundary.majorUnit,
                    min: bubbleBoundary.min,
                    max: bubbleBoundary.max,
                    name: dataField.FieldName,
                    title: { text: dataField.Caption, font: titleFont },
                    visible: setting.ValueAxis.Visible,
                    labels: {
                        template: '#= window[\'' + self.ModelId + '\'].GetAxesLabel(data, ' + valueSettings + ') #',
                        rotation: setting.Label.Rotation
                    }
                }
            ];
        }
        else if (self.IsScatterChartType(setting.Type)) {
            chartOptions.series[0].xField = categoryField;
            chartOptions.series[0].yField = aggFieldName1;
            chartOptions.series[0].colorField = (groupField || categoryField) + '_color';

            chartOptions.yAxes = [
                {
                    name: aggFieldName1,
                    title: { text: dataField.Caption, font: titleFont },
                    visible: setting.ValueAxis.Visible,
                    labels: {
                        template: '#= window[\'' + self.ModelId + '\'].GetAxesLabel(data, ' + valueSettings + ') #'
                    },
                    axisCrossingValue: -Infinity
                }
            ];

            dataField = self.FieldSettings.GetFields(enumHandlers.FIELDSETTINGAREA.ROW).findObject('IsSelected', true);
            valueSettings = JSON.stringify({
                FieldId: dataField.FieldName,
                FieldType: dataField.DataType,
                Bucket: dataField.Bucket.Operator,
                Index: 0,
                Axes: self.VALUETYPE.CATEGORY
            });

            var scatterBoundary = self.CalculateScatterAndBubbleBoundary();
            chartOptions.xAxes = [
                {
                    majorUnit: scatterBoundary.majorUnit,
                    min: scatterBoundary.min,
                    max: scatterBoundary.max,
                    name: categoryField,
                    title: { text: dataField.Caption, font: titleFont },
                    visible: setting.ValueAxis.Visible,
                    labels: {
                        template: '#= window[\'' + self.ModelId + '\'].GetAxesLabel(data, ' + valueSettings + ') #',
                        rotation: setting.Label.Rotation
                    }
                }
            ];
        }

        if (chartOptions.xAxes) {
            if (chartOptions.xAxes instanceof Array) {
                jQuery.each(chartOptions.xAxes, function (index, xAxes) {
                    xAxes.axisCrossingValues = axisCrossingValues;
                });
            }
            else {
                chartOptions.xAxes.axisCrossingValues = axisCrossingValues;
            }
        }

        if (chartSettings.show_as_percentage && setting.Stack) {
            chartOptions.seriesDefaults.stack = { type: '100%' };
        }
        else if (!self.IsScatterOrBubbleChartType(setting.Type)) {
            chartOptions.valueAxes[0].labels = {
                template: '#= window[\'' + self.ModelId + '\'].GetAxesLabel(data, ' + valueSettings + ') #'
            };
        }

    };
    self.VisualLabel = function (e) {
        var box = e.createVisual();
        var setLabelPositionX = function (areabound, textWidth) {
            if (box.children[1]._position.x < areabound.x1) {
                box.children[1]._position.x = areabound.x1 + 2;
            }
            else if (box.children[1]._position.x + textWidth > areabound.x2 - 2) {
                box.children[1]._position.x = areabound.x2 - textWidth - 2;
                if (box.children[1]._position.x < areabound.x1) {
                    box.children[1]._position.x = areabound.x1 + 2;
                }
            }
        };
        var setLabelPositionY = function (areabound, textHeight) {
            if (box.children[1]._position.y < areabound.y1) {
                box.children[1]._position.y = areabound.y1 + 2;
            }
            else if (box.children[1]._position.y + textHeight > areabound.y2) {
                box.children[1]._position.y = areabound.y2 - textHeight - 2;
                if (box.children[1]._position.y < areabound.y1) {
                    box.children[1]._position.y = areabound.y1 + 2;
                }
            }
        };

        if (e.rect.origin.x && e.rect.origin.y && self.Chart && box.children[1]) {
            var plotArea = self.Chart._plotArea || self.Chart.plotArea;
            if (plotArea) {
                var areabound = {
                    x1: plotArea.axisY.box.x2,
                    x2: plotArea.axisX.box.x2,
                    y1: plotArea.axisY.box.y1,
                    y2: plotArea.axisX.box.y1
                };
                var textWidth = WC.Utility.MeasureText(e.text, e.options.font);
                var textHeight = 12;

                // check x
                setLabelPositionX(areabound, textWidth);

                // check y
                setLabelPositionY(areabound, textHeight);
            }
        }
        return box;
    };
    self.CanDrilldown = function () {
        return self.Models.Result.Data().authorizations.change_field_collection;
    };
    self.DrilldownChart = function (e, setting) {
        if (!self.CanDrilldown())
            return;

        var rowDetails = [];
        var columnDetails = [];
        switch (setting.Type) {
            case enumHandlers.CHARTTYPE.GAUGE.Code:
                // do nothing
                break;

            case enumHandlers.CHARTTYPE.BARCHART.Code:
            case enumHandlers.CHARTTYPE.COLUMNCHART.Code:
            case enumHandlers.CHARTTYPE.LINECHART.Code:
            case enumHandlers.CHARTTYPE.AREACHART.Code:
            case enumHandlers.CHARTTYPE.RADARCHART.Code:
            case enumHandlers.CHARTTYPE.BUBBLECHART.Code:
            case enumHandlers.CHARTTYPE.SCATTERCHART.Code:
            case enumHandlers.CHARTTYPE.SCATTERCHART.Code + 'Line':
                var categoryfieldValue = self.IsScatterOrBubbleChartType(setting.Type) ? e.value.x : e.category;
                if (categoryfieldValue && WC.FormatHelper.IsDateOrDateTime(setting.FieldSource.CategoryFieldType)) {
                    categoryfieldValue = new Date(categoryfieldValue);
                }
                rowDetails.push({
                    FieldName: setting.FieldSource.CategoryField,
                    FieldValue: categoryfieldValue
                });

                if (setting.FieldSource.GroupField) {
                    var fieldValue;
                    if (e.series.name === self.TEXT_NULL) {
                        fieldValue = null;
                    }
                    else if (WC.FormatHelper.IsDateOrDateTime(setting.FieldSource.GroupFieldType)) {
                        fieldValue = new Date(e.series.name);
                    }
                    else {
                        fieldValue = e.series.name;
                    }
                    columnDetails.push({
                        FieldName: setting.FieldSource.GroupField,
                        FieldValue: fieldValue
                    });
                }
                break;
            case enumHandlers.CHARTTYPE.PIECHART.Code:
            case enumHandlers.CHARTTYPE.DONUTCHART.Code:
                if (!setting.FieldSource.GroupField) {
                    rowDetails.push({
                        FieldName: setting.FieldSource.CategoryField,
                        FieldValue: e.dataItem[e.series.categoryField]
                    });
                }
                else {
                    rowDetails.push({
                        FieldName: setting.FieldSource.CategoryField,
                        FieldValue: e.dataItem[WC.Utility.ConvertFieldName(self.CategoryField)]
                    });
                    columnDetails.push({
                        FieldName: setting.FieldSource.GroupField,
                        FieldValue: e.dataItem[e.series.categoryField]
                    });
                }

                break;

            default:
                break;
        }

        self.Models.Display.CreateDrilldown(rowDetails, columnDetails, self);
    };
    self.DrilldownChartLegend = function (e) {
        var dataIndex = jQuery(e.currentTarget).data('index');
        var groupField = self.FieldSettings.GetFieldByFieldName(self.GroupField);
        var value = e.data.groups[dataIndex].value;

        var rowDetails = [];
        var columnDetails = [];

        if (self.IsDonutOrPieChartType(self.FieldSettings.GetDisplayDetails().chart_type)) {
            var categoryField = self.FieldSettings.GetFieldByFieldName(self.CategoryField);
            if (groupField) {
                var chartFilter = e.data.chart.dataSource.filter().filters[0];
                rowDetails = [{
                    FieldName: categoryField.Caption,
                    FieldValue: chartFilter.value
                }];
                columnDetails = [{
                    FieldName: groupField.Caption,
                    FieldValue: value
                }];
            }
            else {
                rowDetails = [{
                    FieldName: categoryField.Caption,
                    FieldValue: value
                }];
            }
        }
        else {
            columnDetails = [{
                FieldName: groupField.Caption,
                FieldValue: value
            }];
        }

        self.Models.Display.CreateDrilldown(rowDetails, columnDetails, self);
    };
    self.GetNumberBoundary = function (data, majorUnit, isIntegerType) {
        var PRECISION = 6;
        var autoMajorUnit = kendo.dataviz.autoMajorUnit;
        var round = function (value, precision) {
            var power = Math.pow(10, precision || 0);
            return Math.round(value * power) / power;
        };
        var remainderClose = function (value, divisor, ratio) {
            var remainder = round(Math.abs(value % divisor), PRECISION),
                threshold = divisor * (1 - ratio);

            return remainder === 0 || remainder > threshold;
        };

        if (!data.length)
            data = [0];
        var minValue = Math.min(0, data.min());
        var maxValue = Math.max(0, data.max());

        // major unit
        if (typeof majorUnit === 'undefined')
            majorUnit = autoMajorUnit(minValue, maxValue);

        if (isIntegerType) {
            majorUnit = Math.max(1, Math.floor(majorUnit));
            minValue = Math.min(0, Math.floor(minValue));
            maxValue = Math.max(0, Math.ceil(maxValue));
        }
        if (minValue < 0 && remainderClose(minValue, majorUnit, 1 / 3)) {
            minValue -= majorUnit;
        }

        if (maxValue > 0 && remainderClose(maxValue, majorUnit, 1 / 3)) {
            maxValue += majorUnit;
        }

        var result = { min: 0, max: 0, majorUnit: majorUnit };
        while (result.min > minValue) {
            result.min -= result.majorUnit;
        };
        while (result.max < maxValue) {
            result.max += result.majorUnit;
        };
        if (result.min === result.max)
            result.max += result.majorUnit;

        // fix js bug, e.g. 0.05+0.01 -> 0.060000000000000005
        var majorUnitDecimals = majorUnit.getSafeDecimals();
        var minDecimals = minValue.getSafeDecimals();
        var maxDecimals = maxValue.getSafeDecimals();

        result.min = result.min.safeParse(Math.max(majorUnitDecimals, minDecimals));
        result.max = result.max.safeParse(Math.max(majorUnitDecimals, maxDecimals));

        return result;
    };
    self.GetDateBoundary = function (data, bucket) {
        var result = {};
        result.type = 'date';

        if (!data.length)
            data = [new Date(1980, 0, 1)];

        result.min = new Date(data.min());
        result.max = new Date(data.max());

        var labelCount = self.FILTERRANGE.CURRENT;
        var dateDiff = new Date(result.max - result.min);

        var getMonthMajorUnit = function (interval) {
            var monthCount = ((dateDiff.getFullYear() - 1970) * 12) + dateDiff.getMonth() + 1;
            var monthStep = Math.ceil(monthCount / labelCount / interval);
            if (monthStep > 1) {
                if (interval === 3 && monthStep % 2 !== 0)
                    return getMonthMajorUnit(2);
                else if (interval === 4)
                    monthStep = Math.ceil(monthStep / 3) * 3;
                else if (interval === 6 && monthStep % 2 !== 0)
                    monthStep++;
            }
            return monthStep * interval;
        };
        var getIntervalName = function (bucket) {
            if (bucket === 'day' || bucket === 'week')
                return 'Date';
            else if (bucket === 'year')
                return 'FullYear';
            else
                return 'Month';
        };
        var getLabelCount = function (name, step) {
            var testDate = new Date(result.min);
            var count = 0;
            var setFn = 'set' + name;
            var getFn = 'get' + name;
            while (testDate < result.max) {
                testDate[setFn](testDate[getFn]() + step);
                count++;
            }
            return count;
        };

        var intervalName = getIntervalName(bucket);
        if (bucket === 'day') {
            var dayCount = Math.max(dateDiff.getTime() / 86400, 1);
            result.majorUnit = Math.ceil(dayCount / labelCount);
            result.baseUnit = 'days';
        }
        else if (bucket === 'week') {
            var weekCount = Math.max(dateDiff.getTime() / 604800, 1);
            result.majorUnit = Math.ceil(weekCount / labelCount);
            result.baseUnit = 'weeks';
        }
        else if (bucket === 'month') {
            result.majorUnit = getMonthMajorUnit(1);
            result.baseUnit = 'months';
        }
        else if (bucket === 'quarter') {
            result.majorUnit = getMonthMajorUnit(3);
            result.baseUnit = 'months';
        }
        else if (bucket === 'trimester') {
            result.majorUnit = getMonthMajorUnit(4);
            result.baseUnit = 'months';
        }
        else if (bucket === 'semester') {
            result.majorUnit = getMonthMajorUnit(6);
            result.baseUnit = 'months';
        }
        else if (bucket === 'year') {
            var yearCount = Math.max(dateDiff.getFullYear() - 1970, 1);
            result.majorUnit = Math.ceil(yearCount / labelCount);
            result.baseUnit = 'years';
        }
        result.labelCount = getLabelCount(intervalName, result.majorUnit);

        if (result.min.toString() === result.max.toString()) {
            result.max['set' + intervalName](result.max['get' + intervalName]() + result.majorUnit);
        }

        return result;
    };
    self.CalculateScatterAndBubbleBoundary = function () {
        var result = {};
        var categoryField = self.FieldSettings.GetFieldByFieldName(self.CategoryField);
        if (categoryField) {
            var filter = self.GetFilter(self.FILTERRANGE.START, self.FILTERRANGE.CURRENT);
            var categoryValues = self.GetCategoriesByFilter(filter);

            if (categoryField.DataType === enumHandlers.FIELDTYPE.TIME) {
                result = self.GetNumberBoundary(categoryValues, 3600, true);
                result.min = Math.max(result.min, 0);
                result.max = Math.min(result.max, 82800);
            }
            else if (WC.FormatHelper.IsDateOrDateTime(categoryField.DataType)) {
                result = self.GetDateBoundary(categoryValues, categoryField.Bucket.Operator);
            }
            else if (categoryField.Bucket.Operator.indexOf('power10_') !== -1) {
                var majorUnit = dataTypeModel.GetPowerBucketSize(categoryField.Bucket.Operator);
                if (categoryField.DataType === enumHandlers.FIELDTYPE.PERCENTAGE)
                    majorUnit = WC.FormatHelper.PercentagesToNumber(majorUnit);
                result = self.GetNumberBoundary(categoryValues, majorUnit, false);
            }
        }
        return result;
    };
    self.CalculateValuesBoundary = function (data, valueField, isStacked) {
        var result = { min: 0, max: 0, majorUnit: 1 };
        var field = self.FieldSettings.GetFieldByFieldName(valueField);
        var fieldType = enumHandlers.FIELDTYPE.INTEGER;
        if (field) {
            fieldType = field.DataType;
        }
        var valueAxesData;
        if (!isStacked) {
            valueAxesData = jQuery.map(data, function (serieData) {
                return serieData[valueField];
            });
        }
        else {
            var valueAxesDataCache = {};
            var valueAxesDataMinusCache = {};
            jQuery.each(data, function (index, serieData) {
                if (typeof valueAxesDataCache[serieData[self.CategoryField]] === 'undefined') {
                    valueAxesDataCache[serieData[self.CategoryField]] = 0;
                    valueAxesDataMinusCache[serieData[self.CategoryField]] = 0;
                }

                var value = serieData[valueField] || 0;
                if (value >= 0) {
                    valueAxesDataCache[serieData[self.CategoryField]] += value;
                }
                else {
                    valueAxesDataMinusCache[serieData[self.CategoryField]] += value;
                }
            });
            valueAxesData = [];
            jQuery.each(valueAxesDataMinusCache, function (category, value) {
                valueAxesData.push(value);
            });
            jQuery.each(valueAxesDataCache, function (category, value) {
                valueAxesData.push(value);
            });
        }

        jQuery.extend(result, self.GetNumberBoundary(valueAxesData, undefined, fieldType === enumHandlers.FIELDTYPE.INTEGER));

        return result;
    };
    self.CalculateGaugeValueBoundary = function (value) {
        var pointerString = Math.floor(value).toString();
        var firstNumber = pointerString.charAt(0);
        var numberLength = pointerString.length;
        var rangeDelta = 1;
        if (firstNumber === '-') {
            rangeDelta = -1;
            numberLength--;
            firstNumber = pointerString.charAt(1);
        }
        var maxRange;
        if (firstNumber < 2) {
            maxRange = 2;
        }
        else if (firstNumber < 5) {
            maxRange = 5;
        }
        else {
            maxRange = 10;
        }
        return maxRange * Math.pow(10, numberLength - 1) * rangeDelta;
    };
    self.GetAxesLabel = function (data, settings) {
        var value = typeof data === 'number' ? data : data.value;

        if (settings.Axes === self.VALUETYPE.VALUE
            && self.ValueVisible[settings.Index] && self.ValueVisible[settings.Index][value] === false) {
            return '';
        }
        if (settings.Axes === self.VALUETYPE.CATEGORY
            && self.CategoryVisible.length
            && !self.CategoryVisible[value]) {
            return '';
        }

        var fieldSetting = self.FieldSettings.GetFieldByFieldName(settings.FieldId);
        var fieldName = fieldSetting.FieldName;
        return self.GetFormattedValue(self.FieldMetadata[fieldName], value);
    };
    self.GetGaugeLabel = function (value, settings) {
        if (self.GaugeLabels[value] && self.GaugeLabels[value].visible === false) {
            return '';
        }
        else {
            return self.GetAxesLabel(value, settings);
        }
    };
    self.GetCategoryLabel = function (dataItem, value) {
        if (self.CategoryVisible[value] === false) {
            return '';
        }

        var categoryField = WC.Utility.ConvertFieldName(self.CategoryField);
        if (dataItem) {
            return dataItem[categoryField + '_label'];
        }
        else {
            return value;
        }
    };
    self.GetDivideValue = function (bucket) {
        var result = 1;

        if (bucket === 'quarter')
            result = 3;
        else if (bucket === 'trimeter')
            result = 4;
        else if (bucket === 'semeter')
            result = 6;

        return result;
    };
    self.MustPostNewResult = function () {
        // clean steps
        var stepsFilterFollowup = [];
        var postedQuery = WC.Utility.ToArray(ko.toJS(self.Models.Result.Data().posted_display));
        var stepsPostedFilterFollowup = [];
        jQuery.each(ko.toJS(self.Models.DisplayQueryBlock.CollectQueryBlocks()), function (index, block) {
            block = WC.ModelHelper.RemoveReadOnlyQueryBlock(block);
            if (block.queryblock_type === enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS) {
                jQuery.each(block.query_steps, function (indexStep, step) {
                    if (WC.WidgetFilterHelper.IsFilterOrJumpQueryStep(step.step_type)) {
                        stepsFilterFollowup.push(step);
                    }
                });
            }
        });
        jQuery.each(postedQuery, function (index, block) {
            block = WC.ModelHelper.RemoveReadOnlyQueryBlock(block);
            if (block.queryblock_type === enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS) {
                jQuery.each(block.query_steps, function (indexStep, step) {
                    if (WC.WidgetFilterHelper.IsFilterOrJumpQueryStep(step.step_type)) {
                        stepsPostedFilterFollowup.push(step);
                    }
                });
            }
        });

        // clean fields and format not affect to post result
        var fields = self.Models.Display.CleanNotAffectPostNewResultFieldProperties(self.Models.Display.Data().fields);
        var postedFields = self.Models.Display.CleanNotAffectPostNewResultFieldProperties(self.Models.Result.Data().display_fields);

        return !jQuery.deepCompare(stepsFilterFollowup, stepsPostedFilterFollowup, false, false) || !jQuery.deepCompare(fields, postedFields, false);
    };
    self.GetChartResult = function (isResetZoom) {
        // apply new chart
        requestHistoryModel.SaveLastExecute(self, self.GetChartResult, arguments);

        var postNewResult = self.MustPostNewResult();

        // reset range selection
        self.CheckResetChartRange();

        if (postNewResult) {
            // post new query  block to get result
            var option = { customQueryBlocks: ko.toJS(self.Models.DisplayQueryBlock.CollectQueryBlocks()) };

            progressbarModel.ShowStartProgressBar(Localization.ProgressBar_PostResult, false);

            var oldDisplayModel = historyModel.Get(self.Models.Display.Data().uri);
            progressbarModel.CancelCustomHandler = true;
            progressbarModel.CancelFunction = function () {
                WC.Ajax.AbortAll();
                self.Models.Display.LoadSuccess(oldDisplayModel);
                self.Models.Result.LoadSuccess(oldDisplayModel.results);
                historyModel.Save();
                self.Models.Result.GetResult(self.Models.Result.Data().uri)
                    .then(self.Models.Result.LoadResultFields)
                    .done(function () {
                        self.Models.Result.ApplyResult();
                    });
            };

            jQuery.when(self.Models.Result.PostResult(option))
                .then(function () {
                    historyModel.Save();
                    return self.Models.Result.GetResult(self.Models.Result.Data().uri);
                })
                .then(self.Models.Result.LoadResultFields)
                .done(function () {
                    self.Models.Result.ApplyResult();
                });
        }
        else {
            // save history
            historyModel.Save();
            resultModel.SetLatestRenderInfo();

            self.ApplyChartWithOldData();
        }
    };
    self.ApplyChartWithOldData = function () {
        var container = jQuery(self.Container);

        container.busyIndicator(true);
        setTimeout(function () {
            if (self.Data.rows.length) {
                var isSameFieldOrder = true,
                    indexField = 0,
                    fields = [], fieldsData = [];

                jQuery.each(self.FieldSettings.GetFields(), function (index, field) {
                    if (field.IsSelected) {
                        fields.push(field.FieldName);
                        fieldsData.push({ field: field.FieldName, index: indexField });

                        if (field.FieldName.toLowerCase() !== self.Data.fields[indexField].toLowerCase()) {
                            isSameFieldOrder = false;
                        }
                        if (!isSameFieldOrder) {
                            fieldsData[fieldsData.length - 1].index = jQuery.inArray(field.FieldName, self.Data.fields);
                        }
                        indexField++;
                    }
                });
                if (!isSameFieldOrder) {
                    var fieldValues;
                    jQuery.each(self.Data.rows, function (index, row) {
                        fieldValues = [];
                        jQuery.each(fieldsData, function (indexValue, value) {
                            fieldValues.push(row.field_values[value.index]);
                        });
                        row.field_values = fieldValues;
                    });
                    self.Data.fields = fields;
                }
            }

            self.GenerateChartDatasource(self.Data, self.Models.DisplayQueryBlock.CollectQueryBlocks()[0].query_steps);
            self.GenerateChart();
            container.busyIndicator(false);
        }, 100);
    };
    self.GetMultiAxisChartType = function (index, chartType) {
        var result = '';

        if (index === 0) {
            if (chartType === enumHandlers.CHARTTYPE.LINECHART.Code) {
                result = enumHandlers.CHARTTYPE.AREACHART.Code;
            }
            else {
                result = chartType;
            }
        }
        else {
            if (chartType === enumHandlers.CHARTTYPE.AREACHART.Code)
                result = enumHandlers.CHARTTYPE.COLUMNCHART.Code;
            else if (chartType === enumHandlers.CHARTTYPE.COLUMNCHART.Code)
                result = enumHandlers.CHARTTYPE.LINECHART.Code;
            else if (chartType === enumHandlers.CHARTTYPE.LINECHART.Code)
                result = chartType;
        }

        return result;
    };
    self.GetMultiAxisStack = function (chartType) {
        var result = false;

        if (chartType === enumHandlers.CHARTTYPE.COLUMNCHART.Code
            || chartType === enumHandlers.CHARTTYPE.AREACHART.Code) {
            result = true;
        }

        return result;
    };
    self.GetFilter = function (start, length) {
        var categoryField = WC.Utility.ConvertFieldName(self.CategoryField);
        var filterField = categoryField + '_sortindex';
        var filter = {
            logic: 'and',
            filters: []
        };

        if (self.Categories.length > 0) {
            var stop = Math.min(start + length - 1, self.Categories.length - 1);
            var v1 = self.Categories[start][filterField];
            var v2 = self.Categories[stop][filterField];

            filter.filters = [{
                logic: 'and',
                filters: [
                    {
                        field: filterField,
                        operator: 'gte',
                        value: v1 > v2 ? v2 : v1,
                        index: start
                    },
                    {
                        field: filterField,
                        operator: 'lte',
                        value: v1 > v2 ? v1 : v2,
                        index: stop
                    }
                ]
            }];
        }
        else {
            filter.filters = [{
                logic: 'and',
                filters: [
                    {
                        field: categoryField,
                        operator: 'neq',
                        value: null,
                        index: 0
                    },
                    {
                        field: categoryField,
                        operator: 'neq',
                        value: null,
                        index: 0
                    }
                ]
            }];
        }

        return filter;
    };
    self.GetCategoriesByFilter = function (filter) {
        var customCategories = [];
        if (self.Categories.length) {
            for (var i = filter.filters[0].filters[0].index; i <= filter.filters[0].filters[1].index; i++) {
                customCategories.push(self.Categories[i].value);
            }
        }
        return customCategories;
    };
    self.GetCategoryLabelTemplate = function () {
        return '#= window[\'' + self.ModelId + '\'].GetCategoryLabel(dataItem, value) #';
    };
    self.ConvertTooltipTemplate = function (groupFieldType, chartType, fieldType, aggField, showValues) {
        var categoryField = WC.Utility.ConvertFieldName(self.CategoryField);
        var groupFieldName = self.GroupField ? WC.Utility.ConvertFieldName(self.GroupField) : '';
        var agg1FieldName = WC.Utility.ConvertFieldName(self.AggergateFields[0].field);
        var agg2FieldName = self.AggergateFields.length > 1 ? WC.Utility.ConvertFieldName(self.AggergateFields[1].field) : '';
        var results;

        if (!groupFieldType) {
            if (chartType === enumHandlers.CHARTTYPE.BUBBLECHART.Code && self.AggergateFields.length === 2) {
                if (showValues) {
                    results = [
                        '# if (dataItem["' + agg1FieldName + '"] !== null || dataItem["' + agg2FieldName + '"] !== null) { #',
                        '#: dataItem["' + agg1FieldName + '_label"] + \' : \' + dataItem["' + agg2FieldName + '_label"] #',
                        '# } #'
                    ];
                }
                else {
                    results = [
                        '# if (dataItem["' + agg1FieldName + '"] !== null || dataItem["' + agg2FieldName + '"] !== null) { #',
                        '#: window[\'' + self.ModelId + '\'].ConvertAggregateValue(value.x, "' + self.VALUETYPE.CATEGORY + '")',
                        ' + \': \' + dataItem["' + agg1FieldName + '_label"]',
                        ' + \': \' + dataItem["' + agg2FieldName + '_label"] #',
                        '# } #'
                    ];
                }
            }
            else {
                aggField = WC.Utility.ConvertFieldName(aggField);
                if (showValues) {
                    results = [
                        '# if (dataItem["' + aggField + '"] !== null) { #',
                        '#: dataItem["' + aggField + '_label"] #',
                        '# } #'
                    ];
                }
                else {
                    results = [
                        '# if (dataItem["' + aggField + '"] !== null) { #',
                        '#: dataItem["' + categoryField + '_label"]',
                        ' + \': \' + dataItem["' + aggField + '_label"] #',
                        '# } #'
                    ];
                }
            }
        }
        else {
            if (self.IsDonutOrPieChartType(chartType)) {
                if (showValues) {
                    results = [
                        '# if (dataItem["' + agg1FieldName + '"] !== null) { #',
                        '#: dataItem["' + agg1FieldName + '_label"] #',
                        '# } #'
                    ];
                }
                else {
                    results = [
                        '# if (dataItem["' + agg1FieldName + '"] !== null) { #',
                        '#: dataItem["' + categoryField + '_label"]',
                        ' + \', \' + dataItem["' + groupFieldName + '_label"]',
                        ' + \': \' + dataItem["' + agg1FieldName + '_label"] #',
                        '# } #'
                    ];
                }
            }
            else if (self.IsScatterOrBubbleChartType(chartType)) {
                if (chartType === enumHandlers.CHARTTYPE.BUBBLECHART.Code && self.AggergateFields.length === 2) {
                    if (showValues) {
                        results = [
                            '# if (dataItem["' + agg1FieldName + '"] !== null || dataItem["' + agg2FieldName + '"] !== null) { #',
                            '#: window[\'' + self.ModelId + '\'].ConvertAggregateValue(dataItem["' + agg1FieldName + '"], "' + self.VALUETYPE.VALUE + '", series.yField)',
                            ' + \': \' + window[\'' + self.ModelId + '\'].ConvertAggregateValue(dataItem["' + agg2FieldName + '"], "' + self.VALUETYPE.VALUE + '", "' + agg1FieldName + '") #',
                            '# } #'
                        ];
                    }
                    else {
                        results = [
                            '# if (dataItem["' + agg1FieldName + '"] !== null || dataItem["' + agg2FieldName + '"] !== null) { #',
                            '#: window[\'' + self.ModelId + '\'].ConvertAggregateValue(value.x, "' + self.VALUETYPE.CATEGORY + '")',
                            ' + \', \' + window[\'' + self.ModelId + '\'].ConvertAggregateValue(dataItem["' + groupFieldName + '"], "' + self.VALUETYPE.GROUP + '")',
                            ' + \': \' + window[\'' + self.ModelId + '\'].ConvertAggregateValue(dataItem["' + agg1FieldName + '"], "' + self.VALUETYPE.VALUE + '", series.yField)',
                            ' + \': \' + window[\'' + self.ModelId + '\'].ConvertAggregateValue(dataItem["' + agg2FieldName + '"], "' + self.VALUETYPE.VALUE + '", "' + agg1FieldName + '") #',
                            '# } #'
                        ];
                    }
                }
                else {
                    if (showValues) {
                        results = [
                            '# if (value.y !== null) { #',
                            '#: window[\'' + self.ModelId + '\'].ConvertAggregateValue(value.y, "' + self.VALUETYPE.VALUE + '", series.yField) #',
                            '# } #'
                        ];
                    }
                    else {
                        results = [
                            '# if (value.y !== null) { #',
                            '#: window[\'' + self.ModelId + '\'].ConvertAggregateValue(value.x, "' + self.VALUETYPE.CATEGORY + '")',
                            ' + \': \' + window[\'' + self.ModelId + '\'].ConvertAggregateValue(dataItem["' + groupFieldName + '"], "' + self.VALUETYPE.GROUP + '")',
                            ' + \': \' + window[\'' + self.ModelId + '\'].ConvertAggregateValue(value.y, "' + self.VALUETYPE.VALUE + '", series.yField) #',
                            '# } #'
                        ];
                    }
                }
            }
            else if (chartType === enumHandlers.CHARTTYPE.RADARCHART.Code && !self.FieldSettings.GetDisplayDetails().stack) {
                if (showValues) {
                    results = [
                        '# if (value !== null) { #',
                        '#: window[\'' + self.ModelId + '\'].ConvertAggregateValue(value, "' + self.VALUETYPE.VALUE + '", series.field) #',
                        '# } #'
                    ];
                }
                else {
                    results = [
                        '# if (value !== null) { #',
                        '#: (dataItem ? dataItem["' + categoryField + '_label"] : \'\')',
                        ' + \', \' + window[\'' + self.ModelId + '\'].ConvertAggregateValue(series.name, "' + self.VALUETYPE.GROUP + '")',
                        ' + \': \' + window[\'' + self.ModelId + '\'].ConvertAggregateValue(value, "' + self.VALUETYPE.VALUE + '", series.field) #',
                        '# } #'
                    ];
                }
            }
            else {
                if (showValues) {
                    results = [
                        '# if (value !== null) { #',
                        '#: window[\'' + self.ModelId + '\'].ConvertAggregateValue(value, "' + self.VALUETYPE.VALUE + '", series.field) #',
                        '# } #'
                    ];
                }
                else {
                    results = [
                        '# if (value !== null) { #',
                        '#: window[\'' + self.ModelId + '\'].ConvertAggregateValue(category, "' + self.VALUETYPE.CATEGORY + '")',
                        ' + \', \' + window[\'' + self.ModelId + '\'].ConvertAggregateValue(series.name, "' + self.VALUETYPE.GROUP + '")',
                        ' + \': \' + window[\'' + self.ModelId + '\'].ConvertAggregateValue(value, "' + self.VALUETYPE.VALUE + '", series.field) #',
                        '# } #'
                    ];
                }
            }
        }

        return results.join('');
    };
    self.GetAggregateValueField = function (valueType, field) {
        if (valueType === self.VALUETYPE.VALUE) {
            return field || self.AggergateFields[0].field;
        }
        else if (valueType === self.VALUETYPE.GROUP) {
            return self.GroupField;
        }
        else {
            return self.CategoryField;
        }
    };
    self.ConvertAggregateValue = function (value, valueType, field) {
        var isEmpty = typeof value === 'string' && !value;
        var isNull = value === null || value === self.TEXT_NULL;
        var valueField = self.GetAggregateValueField(valueType, field);
        var metadata = self.FieldMetadata[valueField];
        if (metadata.formatter.type === enumHandlers.FIELDTYPE.ENUM) {
            if (isNull) {
                return self.GetFormattedValue(metadata, null);
            }
            else if (isEmpty)
                return '';
        }
        else if (isEmpty || isNull) {
            return self.TEXT_NULL;
        }
        else if (typeof value === 'string' && WC.FormatHelper.IsDateOrDateTime(metadata.formatter.type)) {
            value = new Date(value);
        }

        return self.GetFormattedValue(metadata, value);
    };
    self.ConvertCategoryFieldType = function (fieldType) {
        var result;

        switch (fieldType) {
            case enumHandlers.FIELDTYPE.DOUBLE:
            case enumHandlers.FIELDTYPE.NUMBER:
            case enumHandlers.FIELDTYPE.INTEGER:
            case enumHandlers.FIELDTYPE.PERCENTAGE:
            case enumHandlers.FIELDTYPE.CURRENCY:
            case enumHandlers.FIELDTYPE.PERIOD:
            case enumHandlers.FIELDTYPE.TIME:
            case enumHandlers.FIELDTYPE.TIMESPAN:
                result = enumHandlers.FIELDTYPE.NUMBER;
                break;
            case enumHandlers.FIELDTYPE.BOOLEAN:
                result = enumHandlers.FIELDTYPE.BOOLEAN;
                break;
            case enumHandlers.FIELDTYPE.DATE:
            case enumHandlers.FIELDTYPE.DATETIME:
                result = enumHandlers.FIELDTYPE.DATE;
                break;
            default:
                result = enumHandlers.FIELDTYPE.STRING;
                break;
        }

        return result;
    };
    self.UpdateLayout = function (delay, triggerResizing) {
        if (!jQuery(self.Container).find('.chartWrapper').length) {
            return;
        }

        clearTimeout(self.UpdateLayoutChecker);
        clearTimeout(self.UpdateLayoutCheckerLast);
        var container = jQuery(self.Container);
        var charts = container.find('.k-chart');
        var legend = container.find('.k-legend-custom-wrapper');

        var chart = charts.data(enumHandlers.KENDOUITYPE.CHART) || charts.data(enumHandlers.KENDOUITYPE.RADIALGAUGE) || null;
        if (!chart) {
            return;
        }
        var type = charts.hasClass('k-gauge') ? enumHandlers.CHARTTYPE.GAUGE.Code : chart.options.seriesDefaults.type;

        // specific delay
        if (type === enumHandlers.CHARTTYPE.GAUGE.Code || self.IsRadarChartType(type)) {
            delay = 0;
        }
        else if (typeof delay === 'undefined') {
            delay = 10;
        }

        // call resize after adjust or not?
        if (typeof triggerResizing === 'undefined') {
            triggerResizing = true;
        }

        var updateLayout = function () {
            if (!self.FieldSettings)
                return;

            // adjust custom control
            if (!self.DashBoardMode())
                fieldSettingsHandler.UpdateSettingLayout();

            // clear labels visibility
            self.ValueVisible = [];
            self.CategoryVisible = {};

            var chartWrapper = container.find('.chartWrapper');
            var header = container.find('.widgetDisplayHeader');
            var headerHeight = header.height() || 0;
            var nav = container.find('.navigatorWrapper');
            var chartNav = nav.children('.navigator');
            var navHeight, areaHeight;
            var legendSize = legend.width() || 0;

            if (!self.DashBoardMode()) {
                areaHeight = WC.Window.Height - (anglePageHandler.IsCompactResult ? 0 : jQuery('#AngleTopBar').outerHeight() + jQuery('#AngleField').outerHeight());
                jQuery('#ChartArea').height(areaHeight);
            }
            else {
                if (container.attr('id') === 'widgetMaximizeWrapper') {
                    areaHeight = container.height();
                }
                else {
                    areaHeight = container.parent().height();
                }
            }
            areaHeight -= headerHeight;

            // hide navigator when it's fit (run once)
            if (nav.hasClass('noClicked') && self.FILTERRANGE.CURRENT >= self.Categories.length) {
                nav.addClass('hidden');
            }

            if (nav.length) {
                chartNav.height(Math.min(areaHeight * 0.15, self.MAXNAVIGATORSIZE));
                navHeight = nav.height();
            }
            else {
                navHeight = 0;
            }
            chartWrapper.height(areaHeight - navHeight);
            container.height(areaHeight + headerHeight);

            var areaWith = container.width() - 10;
            var css = {
                width: areaWith - 20,
                height: areaHeight - navHeight - 10,
                marginTop: ''
            };

            var chartSettings = self.GetChartSettings();
            if (!self.Models.Result.Data().row_count) {
                self.UpdateEmptyChartType();
            }
            else if (self.IsDonutOrPieChartType(type)) {
                self.UpdateDonutOrPieChartType(charts, chartSettings, css, legendSize);
            }
            else if (self.IsRadarChartType(type)) {
                self.UpdateRadarChartType(chart, chartSettings, css, areaHeight, legendSize);
                if (!triggerResizing) {
                    self.UpdateLayoutCheckerLast = setTimeout(function () {
                        kendo.resize(charts);
                    }, 1);
                }
            }
            else if (type === enumHandlers.CHARTTYPE.GAUGE.Code) {
                self.UpdateGaugeChartType(chart, chartSettings, css, areaHeight);
            }
            else {
                self.UpdateBoxChartType(chart, chartSettings, type, css, legendSize);
            }

            if (chart) {
                css.width = Math.floor(css.width);
                css.height = Math.floor(css.height);

                if (chartWrapper.hasClass('minichart')) {
                    chartWrapper.height(areaHeight + 3);
                }
                charts.css(css);
                if (nav.length) {
                    chartNav.css({
                        width: areaWith,
                        height: navHeight - 10
                    });
                    var navObj = chartNav.data(enumHandlers.KENDOUITYPE.CHART);
                    if (navObj) {
                        var filter = self.GetFilter(self.FILTERRANGE.START, self.FILTERRANGE.CURRENT);
                        navObj.options.categoryAxis.select.from = filter.filters[0].filters[0].index;
                        navObj.options.categoryAxis.select.to = filter.filters[0].filters[1].index;
                    }
                }

                if (triggerResizing) {
                    if (legend.length) {
                        charts.filter(':not(.navigator)').each(function (index, element) {
                            jQuery(element).data(enumHandlers.KENDOUITYPE.CHART).__createCustomLegend(false);
                        });
                    }

                    chartWrapper.css('overflow', 'hidden');
                    kendo.resize(charts);
                    chartWrapper.css('overflow', '');

                    if (chartWrapper.hasClass('minichart')) {
                        chartWrapper.trigger('scroll');
                    }

                    var guageLabel = chart.wrapper.next('.gaugePointerLabel');
                    if (guageLabel.length) {
                        chart.wrapper.children().css({
                            height: css.height,
                            width: css.width
                        });
                        var containerSize = chart.wrapper.parent().width();
                        var chartSize = chart.element.width();
                        guageLabel.css({
                            width: Math.max(containerSize, chartSize),
                            left: 0,
                            top: css.marginTop + chart.pointers[0].bbox.origin.y + chart.pointers[0].bbox.size.height + 10,
                            bottom: 'auto'
                        });
                    }

                    if (type !== enumHandlers.CHARTTYPE.GAUGE.Code) {
                        // if use visual label
                        // check have bubble or stack bar or stack column
                        jQuery.each(chart.options.series, function (index, serie) {
                            var isBubbleChart = serie.type === enumHandlers.CHARTTYPE.BUBBLECHART.Code;
                            var isBarChart = serie.stack && serie.type === enumHandlers.CHARTTYPE.BARCHART.Code;
                            var isColumnChart = serie.stack && serie.type === enumHandlers.CHARTTYPE.COLUMNCHART.Code;
                            if (isBubbleChart || isBarChart || isColumnChart) {
                                self.UpdateLayoutCheckerLast = setTimeout(function () {
                                    kendo.resize(charts);
                                });
                                return false;
                            }
                        });
                    }
                }
            }
        };

        if (legend.length) {
            charts.filter(':not(.navigator)').each(function (index, element) {
                jQuery(element).data(enumHandlers.KENDOUITYPE.CHART).__createCustomLegend(false);
            });
        }

        if (delay) {
            self.UpdateLayoutChecker = setTimeout(function () {
                updateLayout();
            }, delay);
        }
        else {
            updateLayout();
        }
    };
    self.UpdateEmptyChartType = function () {
        // do nothing
    };
    self.UpdateBoxChartType = function (chart, chartSettings, type, css, legendSize) {
        if (self.FitLayout) {
            css.width += 30;
            css.height += 16;
        }

        var textHeight = 15;

        // if size over this value the scrollbar will be shown
        var areaSize = 400;

        // if size over this value the scrollbar will be shown
        var altAreaSize = 200;

        var otherSize, minSize, barSize;
        var noStackBarSize = self.FitLayout ? 1 : 5;
        var valueData = self.GetValueLabelData(chart);
        var valueLabelSize1 = valueData.length ? valueData[0].size : 0;
        var valueCount = valueData.length ? valueData[0].values.length : 0;
        var categoryField = WC.Utility.ConvertFieldName(self.CategoryField);
        var categoryData = self.GetCategoriesLabelData(chart);
        var categoryCount = categoryData.labels.length;
        var isMultiAxis = chart._originalOptions.series.length === 2;
        var legendCount;
        var isScatterOrBubble = self.IsScatterOrBubbleChartType(type);
        var isBarChart = type === enumHandlers.CHARTTYPE.BARCHART.Code;
        var xAxis, yAxis;
        if (isScatterOrBubble) {
            xAxis = chart.options.xAxis;
            yAxis = chart.options.yAxis;
        }
        else if (isBarChart) {
            xAxis = chart.options.valueAxis;
            yAxis = chart.options.categoryAxis;
        }
        else {
            xAxis = chart.options.categoryAxis;
            yAxis = chart.options.valueAxis;
        }

        // datalabel
        jQuery.each(chart.options.series, function (index, serie) {
            serie.tooltip.visible = chartSettings.datalabel.mouse;
            serie.labels.visible = chartSettings.datalabel.show;
        });

        if (self.GroupField && chartSettings.legend.show) {
            if (!legendSize) {
                legendSize = 150;
            }
            legendCount = chart.dataSource.view().length;
        }
        else {
            legendCount = 0;
        }
        var xAxisSettings = {
            yWidth: 0,
            xWidth: 0,
            legendSize: legendSize,
            aditionalSize: chartSettings.axistitle.y ? 50 : 30,
            rotation: 0,
            title: chartSettings.axistitle.x,
            line: chartSettings.gridline.x,
            label: chartSettings.axisvalue.x ? 'show' : 'hide'
        };
        var yAxisSettings = {
            yHeight: 0,
            xHeight: 0,
            labelSize: chartSettings.axistitle.x ? 20 : 0,
            aditionalSize: 50,
            rotation: 0,
            title: chartSettings.axistitle.y,
            line: chartSettings.gridline.y,
            label: chartSettings.axisvalue.y ? 'show' : 'hide'
        };
        var isCategoryDateDataType = false;
        if (chart.dataSource.options.schema.model
            && chart.dataSource.options.schema.model.fields[categoryField]
            && WC.FormatHelper.IsDateOrDateTime(chart.dataSource.options.schema.model.fields[categoryField].type)) {
            isCategoryDateDataType = true;
        }

        if (isBarChart) {
            // y-axis
            barSize = self.GroupField && !isMultiAxis
                && !chart.options.seriesDefaults.stack
                ? noStackBarSize * legendCount : self.MINAXIS;
            if (self.FitLayout && barSize < self.MINAXIS) {
                barSize = self.MINAXIS;
            }

            yAxisSettings.xHeight = valueLabelSize1;
            otherSize = yAxisSettings.xHeight + yAxisSettings.labelSize + yAxisSettings.aditionalSize;
            minSize = Math.max(areaSize - otherSize, barSize * categoryCount);
            if (self.FitLayout) {
                yAxisSettings.yHeight = css.height - otherSize;
            }
            else {
                yAxisSettings.yHeight = Math.max(minSize, css.height - otherSize);
            }

            if (self.FitLayout && yAxisSettings.yHeight / categoryCount < textHeight) {
                yAxisSettings.line = false;
                if (yAxisSettings.label === 'show') {
                    yAxisSettings.label = isCategoryDateDataType ? 'show-bound' : 'hide';
                }
            }

            // x-axis
            xAxisSettings.yWidth = yAxisSettings.label !== 'hide' ? categoryData.size : textHeight;
            otherSize = xAxisSettings.yWidth + xAxisSettings.legendSize + xAxisSettings.aditionalSize;
            minSize = Math.max(altAreaSize - otherSize, self.MINAXIS * valueCount);
            if (self.FitLayout) {
                xAxisSettings.xWidth = css.width - otherSize;
            }
            else {
                xAxisSettings.xWidth = Math.max(minSize, css.width - otherSize);
            }
            if (valueLabelSize1 * valueCount > xAxisSettings.xWidth) {
                xAxisSettings.rotation = 270;
            }
            else {
                xAxisSettings.rotation = 360;
            }
            if (self.FitLayout && xAxisSettings.xWidth / valueCount < textHeight) {
                xAxisSettings.line = false;
                if (xAxisSettings.label === 'show') {
                    xAxisSettings.label = 'show-bound';
                }
            }

            // y-axis again
            if (self.FitLayout && xAxisSettings.xWidth / valueCount <= 1) {
                yAxisSettings.label = 'hide';
            }
        }
        else {
            // x-axis
            if (isMultiAxis) {
                xAxisSettings.aditionalSize *= 2;
                xAxisSettings.yWidth = valueLabelSize1 + (valueData.length > 1 ? valueData[1].size : 0);
            }
            else {
                xAxisSettings.yWidth = valueLabelSize1;
            }

            barSize = self.MINAXIS;
            if (self.GroupField && !isMultiAxis && !chart.options.seriesDefaults.stack && type === enumHandlers.CHARTTYPE.COLUMNCHART.Code) {
                barSize = noStackBarSize * legendCount;
            }

            if (self.FitLayout && barSize < self.MINAXIS) {
                barSize = self.MINAXIS;
            }

            otherSize = xAxisSettings.yWidth + xAxisSettings.legendSize + xAxisSettings.aditionalSize;
            minSize = Math.max(areaSize - otherSize, barSize * categoryCount);
            if (self.FitLayout) {
                xAxisSettings.xWidth = css.width - otherSize;
            }
            else {
                xAxisSettings.xWidth = Math.max(minSize, css.width - otherSize);
            }

            if (categoryData.size * categoryCount > xAxisSettings.xWidth) {
                xAxisSettings.rotation = 270;
            }
            else {
                xAxisSettings.rotation = 0;
            }
            if (self.FitLayout && xAxisSettings.xWidth / categoryCount < textHeight) {
                xAxisSettings.line = false;
                if (xAxisSettings.label === 'show') {
                    xAxisSettings.label = isCategoryDateDataType ? 'show-bound' : 'hide';
                }
            }

            // y-axis
            yAxisSettings.xHeight = xAxisSettings.rotation !== 0 && xAxisSettings.label !== 'hide' ? categoryData.size : textHeight;
            otherSize = yAxisSettings.xHeight + yAxisSettings.labelSize + yAxisSettings.aditionalSize;
            minSize = Math.max(altAreaSize - otherSize, self.MINAXIS * valueCount);
            if (self.FitLayout) {
                yAxisSettings.yHeight = css.height - otherSize;
            }
            else {
                yAxisSettings.yHeight = Math.max(minSize, css.height - otherSize);
            }

            if (self.FitLayout
                && (yAxisSettings.yHeight / valueCount < textHeight || xAxisSettings.xWidth / categoryCount <= 1)) {
                yAxisSettings.line = false;
                if (yAxisSettings.label === 'show') {
                    yAxisSettings.label = xAxisSettings.xWidth / categoryCount <= 1 ? 'hide' : 'show-bound';
                }
            }

            // x-axis again
            if (self.FitLayout && yAxisSettings.yHeight / valueCount <= 1) {
                xAxisSettings.label = 'hide';
            }
        }

        css.width = xAxisSettings.yWidth + xAxisSettings.xWidth + xAxisSettings.legendSize + xAxisSettings.aditionalSize;
        css.height = yAxisSettings.yHeight + yAxisSettings.xHeight + yAxisSettings.labelSize + yAxisSettings.aditionalSize;

        var updateValueAxis = function (valueAxis, setting) {
            if (valueAxis instanceof Array) {
                jQuery.each(valueAxis, function (index, axis) {
                    axis.title.visible = setting.title;
                    axis.labels.visible = setting.label !== 'hide';
                    axis.labels.rotation = setting.rotation;
                    axis.majorGridLines.visible = setting.line;
                    if (setting.label === 'show-bound') {
                        self.ValueVisible[index] = {};
                        jQuery.each(valueData[index].values, function (i, value) {
                            self.ValueVisible[index][value] = i === 0 || i === valueData[index].values.length - 1;
                        });
                    }
                });
            }
            else {
                valueAxis.title.visible = setting.title;
                valueAxis.labels.visible = setting.label !== 'hide';
                valueAxis.labels.rotation = setting.rotation;
                valueAxis.majorGridLines.visible = setting.line;
                if (setting.label === 'show-bound') {
                    self.ValueVisible[0] = {};
                    jQuery.each(valueData[0].values, function (i, value) {
                        self.ValueVisible[0][value] = i === 0 || i === valueData[0].values.length - 1;
                    });
                }
            }
        };
        var updateCategoryAxis = function (categoryAxis, setting) {
            if (categoryAxis instanceof Array) {
                jQuery.each(categoryAxis, function (index, axis) {
                    axis.labels.rotation = setting.rotation;
                    if (index !== 0) {
                        axis.title.visible = setting.title;
                        axis.labels.visible = setting.label !== 'hide';
                        axis.majorGridLines.visible = setting.line;
                    }
                    else {
                        axis.labels.visible = false;
                    }
                });
            }
            else {
                categoryAxis.title.visible = setting.title;
                categoryAxis.labels.rotation = setting.rotation;
                categoryAxis.labels.visible = setting.label !== 'hide';
                categoryAxis.majorGridLines.visible = setting.line;
            }
            if (setting.label === 'show-bound') {
                var filter = self.GetFilter(self.FILTERRANGE.START, self.FILTERRANGE.CURRENT);
                var filterItems = self.GetCategoriesByFilter(filter);
                jQuery.each(filterItems, function (i, value) {
                    self.CategoryVisible[value] = i === 0 || i === filterItems.length - 1;
                });
            }
        };

        if (isBarChart) {
            updateValueAxis(xAxis, xAxisSettings);
            updateCategoryAxis(yAxis, yAxisSettings);
        }
        else {
            updateValueAxis(yAxis, yAxisSettings);
            updateCategoryAxis(xAxis, xAxisSettings);
        }

        // set dash line
        self.SetChartPatternStyle(chart);
    };
    self.UpdateDonutOrPieChartType = function (charts, chartSettings, css, legendSize) {
        var areaSize = (chartSettings.datalabel.show) ? 400 : 200,
            chartPerRow = 1;

        if (charts.length > 1) {
            css.width += 10;
            css.height += 10;

            if (self.FitLayout && areaSize > css.width) {
                areaSize = css.width;
            }

            chartPerRow = Math.min(charts.length, Math.floor(css.width / areaSize));
            if (chartPerRow > 1) {
                var width;

                // 1st calculation
                if (chartPerRow > charts.length && css.width / chartPerRow < areaSize) {
                    width = css.width / (chartPerRow - 1);
                }
                else {
                    width = css.width / chartPerRow;
                }

                // get correct width
                if (Math.ceil(charts.length / chartPerRow) * width <= css.height) {
                    css.width += 20;
                }

                // 2nd calculation
                if (chartPerRow > charts.length && css.width / chartPerRow < areaSize) {
                    css.width = css.width / (chartPerRow - 1);
                }
                else {
                    css.width = css.width / chartPerRow;
                }
            }
            else {
                css.width += 20;
                css.height += 20;
                if (css.width < areaSize) {
                    css.width = areaSize;
                }
            }
        }
        else {
            if (self.FitLayout) {
                css.width += 30;
                if (areaSize > css.width) {
                    areaSize = css.width;
                }
            }

            if (css.width < areaSize) {
                css.width = areaSize;
            }
        }
        var minSize = Math.min(css.height, css.width);
        css.width = minSize;
        if (charts.length > chartPerRow) {
            css.height = minSize;
        }

        // calculate chart size
        var textHeight = 20;
        var minChartSize = 20;
        var distance = 15;
        if (chartSettings.datalabel.show) {
            if (self.GroupField && chartSettings.legend.show) {
                if (!legendSize) {
                    legendSize = 150;
                }
            }
            else {
                legendSize = 0;
            }
        }

        // apply options
        charts.each(function (index, element) {
            var chartObject = jQuery(element).data(enumHandlers.KENDOUITYPE.CHART);
            if (chartObject) {
                // datalabel
                jQuery.each(chartObject.options.series, function (index, serie) {
                    serie.tooltip.visible = chartSettings.datalabel.mouse;
                    serie.labels.visible = chartSettings.datalabel.show;
                    serie.labels.distance = distance;
                    if (chartSettings.datalabel.show) {
                        var labelData = self.GetDonutOrPieLabelData(chartObject);
                        if (labelData.labels.length > 2) {
                            serie.padding = Math.min(minSize - minChartSize, labelData.size + distance);
                        }
                        else {
                            serie.padding = textHeight * labelData.labels.length;
                        }
                    }
                    else {
                        delete serie.size;
                    }
                });

                if (!chartObject.options.title.margin) {
                    chartObject.options.title.margin = { left: 0 };
                }
                var titleSize = WC.Utility.MeasureText(chartObject.options.title.text, chartObject.options.title.font);
                chartObject.options.title.margin.left = Math.max(-5, ((css.width - titleSize) / 2) - 10);
            }
        });
    };
    self.UpdateGaugeChartType = function (chart, chartSettings, css, areaHeight) {
        // size minimun size
        var areaSize;
        if (self.FitLayout) {
            css.width += 20;
            css.height -= 20;
            areaSize = 150;
        }
        else {
            areaSize = 300;
            areaHeight -= 20;
        }

        css.height = Math.min(css.height, css.width - 50);
        if (css.width < areaSize) {
            css.width = areaSize;
        }
        if (css.height < areaSize) {
            css.height = areaSize;
        }
        css.marginTop = Math.max(0, (areaHeight - css.height) / 2);

        // datalabelgauge
        chart.options.scale.labels.visible = chartSettings.datalabelgauge.show;

        // axistitlegauge
        var gaugeCaption = chart.wrapper.next('.gaugePointerLabel').find('.gaugeCaption');
        if (gaugeCaption.length) {
            if (chartSettings.axistitlegauge.show) {
                gaugeCaption.show();
            }
            else {
                gaugeCaption.hide();
            }
        }

        // ranges
        if (chartSettings.rangesgauge.show) {
            chart.options.scale.ranges = chart.options.__ranges;
        }
        else {
            chart.options.scale.ranges = [];
        }

        if (chart.options.scale.labels.visible) {
            // set label visible
            // (i) some gauge contain 5 and some 6 labels
            var labelCount = chart.scale.labelsCount();
            var loop, loopCount = Math.ceil(labelCount / 2);
            var isPairLabel = labelCount % 2 === 0;
            var radiusSize = Math.min(css.width / 2, css.height - 70) * 0.7;
            var radiusReduceRatio = 0.9;
            for (loop = 0; loop < loopCount; loop++) {
                if (loop === loopCount - 1) {
                    if (isPairLabel) {
                        radiusSize *= 0.55;
                    }
                    else {
                        // increase radius if it's the top & only 1 label
                        radiusSize *= 1.5;
                    }
                }

                var label = self.GaugeLabels[chart.scale.labels[loop].value];
                label.visible = label.size < radiusSize;

                label = self.GaugeLabels[chart.scale.labels[labelCount - loop - 1].value];
                label.visible = label.size < radiusSize;

                // reduce radius a bit
                radiusSize *= radiusReduceRatio;
            }
        }

        clearTimeout(self.CheckRenderGauge);
        self.CheckRenderGauge = setTimeout(function () {
            chart.redraw();
        }, 200);
    };
    self.UpdateRadarChartType = function (chart, chartSettings, css, areaHeight, legendSize) {
        if (css.width <= css.height) {
            css.width += 30;
        }

        var textHeight = 15;
        var categoryData = self.GetCategoriesLabelData(chart);
        var boxMinSize = 150;
        var categoryCount = self.Categories.length;
        if (self.GroupField && chartSettings.legend.show) {
            if (!legendSize) {
                legendSize = 150;
            }
        }
        else {
            legendSize = 0;
        }

        var xAxisSettings = {
            chartSize: 0,
            labelSize: chartSettings.axisvalueradar.show ? categoryData.size * 2 : 0,
            legendSize: legendSize,
            aditionalSize: 100,
            label: chartSettings.axisvalueradar.show,
            line: chartSettings.gridlineradar.show,
            max: 50 + legendSize
        };
        var yAxisSettings = {
            chartSize: 0,
            labelSize: chartSettings.axisvalueradar.show ? textHeight * 2 : 0,
            titleSize: 20,
            aditionalSize: 100,
            max: 100
        };

        // datalabel
        jQuery.each(chart.options.series, function (index, serie) {
            serie.tooltip.visible = chartSettings.datalabel.mouse;
            serie.labels.visible = chartSettings.datalabel.show;
        });

        // x & y
        var xOtherSize, yOtherSize, boxSize;
        var calculateSizeXY = function () {
            var xLabelSize = xAxisSettings.label ? xAxisSettings.labelSize : 0;
            var yLabelSize = yAxisSettings.label ? yAxisSettings.labelSize : 0;
            xOtherSize = xLabelSize + xAxisSettings.legendSize + xAxisSettings.aditionalSize;
            yOtherSize = yLabelSize + yAxisSettings.titleSize + yAxisSettings.aditionalSize;
            xAxisSettings.chartSize = css.width - xOtherSize;
            yAxisSettings.chartSize = css.height - yOtherSize;

            boxSize = Math.min(xAxisSettings.chartSize, yAxisSettings.chartSize);
            if (boxSize < boxMinSize) {
                xAxisSettings.label = false;
                xOtherSize -= xLabelSize;
                yOtherSize -= yLabelSize;
                boxSize = Math.min(css.width - xOtherSize, css.height - yOtherSize);
                if (boxSize < boxMinSize) {
                    xAxisSettings.line = false;
                }
            }
        };

        // do calculation
        calculateSizeXY();

        if (categoryCount > 4) {
            // check labels spacing (2 * PI * R)
            var r = boxSize / 2;
            var circleSize = 2 * Math.PI * r;
            var labelSpaceRatio = circleSize / (categoryData.size * categoryCount);
            var compareRatio = categoryCount <= 15 && categoryCount % 2 === 0 ? 0.75 : 1.2;
            if (labelSpaceRatio <= compareRatio) {
                xAxisSettings.label = false;
                if (labelSpaceRatio <= 0.25) {
                    xAxisSettings.line = false;
                }
            }

            // calculate again
            calculateSizeXY();
        }

        css.width = Math.max(xAxisSettings.max, boxSize + xOtherSize);
        css.height = Math.max(yAxisSettings.max, boxSize + yOtherSize);
        css.marginTop = Math.max(0, (areaHeight - css.height - 30) / 2);

        chart.options.valueAxis.title.visible = false;
        chart.options.valueAxis.majorGridLines.type = chartSettings.gridlinetype.type;
        chart.options.categoryAxis.labels.rotation = 0;
        chart.options.categoryAxis.labels.visible = xAxisSettings.label;
        chart.options.categoryAxis.majorGridLines.visible = xAxisSettings.line;
    };
    self.UpdateFitableLayout = function (chart, fit, newFontSize) {
        var newFont = self.FontDefault.replace(/\d{2}px/, newFontSize + 'px');
        var titleFont = newFont;
        if (!fit) {
            newFont = self.FontDefault;
            titleFont = self.GetTitleFont();
        }

        jQuery.extend(true, chart.options, {
            seriesDefaults: { labels: { font: newFont } },
            title: { font: titleFont },
            scale: { labels: { font: newFont } },
            legend: { labels: { font: newFont } }
        });

        if (chart.options.categoryAxis instanceof Array) {
            jQuery.each(chart.options.categoryAxis, function (index, category) {
                jQuery.extend(true, category, {
                    title: { font: titleFont },
                    labels: { font: newFont }
                });
            });
        }
        else if (chart.options.categoryAxis instanceof Object) {
            jQuery.extend(true, chart.options.categoryAxis, {
                title: { font: titleFont },
                labels: { font: newFont }
            });
        }

        if (chart.options.series instanceof Array) {
            jQuery.each(chart.options.series, function (index, serie) {
                jQuery.extend(true, serie, {
                    title: { font: titleFont },
                    labels: { font: newFont }
                });
            });
        }
        else if (chart.options.series instanceof Object) {
            jQuery.extend(true, chart.options.series, {
                title: { font: titleFont },
                labels: { font: newFont }
            });
        }

        if (chart.options.valueAxis instanceof Array) {
            jQuery.each(chart.options.valueAxis, function (index, axis) {
                jQuery.extend(true, axis, {
                    title: { font: titleFont },
                    labels: { font: newFont }
                });
            });
        }
        else if (chart.options.valueAxis instanceof Object) {
            jQuery.extend(true, chart.options.valueAxis, {
                title: { font: titleFont },
                labels: { font: newFont }
            });
        }

        if (chart.options.xAxis instanceof Array) {
            jQuery.each(chart.options.xAxis, function (index, axis) {
                jQuery.extend(true, axis, {
                    title: { font: titleFont },
                    labels: { font: newFont }
                });
            });
        }
        else if (chart.options.xAxis instanceof Object) {
            jQuery.extend(true, chart.options.xAxis, {
                title: { font: titleFont },
                labels: { font: newFont }
            });
        }

        if (chart.options.yAxis instanceof Array) {
            jQuery.each(chart.options.yAxis, function (index, axis) {
                jQuery.extend(true, axis, {
                    title: { font: titleFont },
                    labels: { font: newFont }
                });
            });
        }
        else if (chart.options.yAxis instanceof Object) {
            jQuery.extend(true, chart.options.yAxis, {
                title: { font: titleFont },
                labels: { font: newFont }
            });
        }

        if (fit) {
            chart.wrapper.parent().css('font', newFont);
            chart.wrapper.next('.gaugePointerLabel').children().css('font', newFont);
        }
        else {
            chart.wrapper.parent().css('font', '');
            chart.wrapper.next('.gaugePointerLabel').children().css('font', '');
        }
    };
    self.GetCategoriesLabelData = function (chart) {
        var i, text = '', category;
        var labels = [];
        var categryCount;
        if (self.IsScatterOrBubbleChartType(chart.options.seriesDefaults.type)) {
            var categories = self.CalculateScatterAndBubbleBoundary();
            if (typeof categories.min === 'number' && typeof categories.max === 'number') {
                categryCount = ((categories.max - categories.min) / categories.majorUnit) + 1;
            }
            else if (typeof categories.labelCount === 'number') {
                categryCount = categories.labelCount;
            }
            else {
                var plotArea = chart._plotArea || chart.plotArea;
                categryCount = plotArea ? plotArea.axisX.labelsCount() : self.FILTERRANGE.CURRENT;
            }
        }
        else {
            categryCount = self.FILTERRANGE.CURRENT;
        }
        for (i = 0; i < categryCount; i++) {
            category = self.Categories[i + self.FILTERRANGE.START];
            if (category) {
                labels.push(category);
                text += category.label + '\n';
            }
            else {
                labels.push('');
            }
        }
        return {
            labels: labels,
            size: WC.Utility.MeasureText(text, self.FontDefault) + 3
        };
    };
    self.GetValueLabelData = function (chart) {
        var chartScaleSettings = self.GetChartSettings()[fieldSettingsHandler.OptionAxisScaleRangesId] || {};
        var data = [];
        var dataItems = self.GetDataItemsFromView(chart);
        var templates;
        if (self.IsScatterOrBubbleChartType(chart.options.seriesDefaults.type)) {
            templates = chart.options.yAxis;
        }
        else {
            templates = chart.options.valueAxis;
        }
        if (!(templates instanceof Array)) {
            templates = [templates];
        }
        jQuery.each(WC.Utility.ToArray(chart._sourceSeries), function (index, serie) {
            var seriesField = serie.field || serie.yField;
            var axisValueSettings;
            if (chartScaleSettings[seriesField]) {
                axisValueSettings = {
                    min: chartScaleSettings[seriesField][0],
                    max: chartScaleSettings[seriesField][1],
                    majorUnit: chartScaleSettings[seriesField][2]
                };
            }
            else {
                axisValueSettings = self.CalculateValuesBoundary(dataItems, seriesField, serie.stack);
            }

            data[index] = {};
            data[index].labels = [];
            data[index].values = [];
            var isBreak = false;
            while (!isBreak) {
                data[index].values.push(axisValueSettings.min);
                if (templates[index].labels.template) {
                    data[index].labels.push(kendo.template(templates[index].labels.template).call(kendo, axisValueSettings.min));
                }
                else if (templates[index].labels.format) {
                    data[index].labels.push(kendo.format(templates[index].labels.format, axisValueSettings.min));
                }
                else {
                    data[index].labels.push(axisValueSettings.min);
                }
                axisValueSettings.min += axisValueSettings.majorUnit;

                if (axisValueSettings.min >= axisValueSettings.max) {
                    data[index].values.push(axisValueSettings.min);
                    if (templates[index].labels.template) {
                        data[index].labels.push(kendo.template(templates[index].labels.template).call(kendo, axisValueSettings.min));
                    }
                    else if (templates[index].labels.format) {
                        data[index].labels.push(kendo.format(templates[index].labels.format, axisValueSettings.min));
                    }
                    else {
                        data[index].labels.push(axisValueSettings.min);
                    }
                    isBreak = true;
                }
            }
            data[index].size = WC.Utility.MeasureText(data[index].labels.join('\n'), self.FontDefault) + 3;
        });
        return data;
    };
    self.GetDonutOrPieLabelData = function (chart) {
        var dataItems = self.GetDataItemsFromView(chart);
        var template = chart.options.series[0].labels.template;
        var result = {
            size: 0,
            labels: []
        };

        jQuery.each(dataItems, function (index, dataItem) {
            result.labels.push(kendo.template(template).call(kendo, { dataItem: dataItem }));
        });
        result.size = WC.Utility.MeasureText(result.labels.join('\n'), self.FontDefault) + 3;

        return result;
    };
    self.GetDataItemsFromView = function (chart) {
        var dataItems = [];
        if (self.GroupField && !self.IsDonutOrPieChartType(chart.options.seriesDefaults.type)) {
            jQuery.each(chart.dataSource.view(), function (indexView, dataView) {
                jQuery.merge(dataItems, dataView.items);
            });
        }
        else {
            dataItems = chart.dataSource.view();
        }

        return dataItems;
    };
    self.GetDisplayDetails = function () {
        var display = self.Models.Display.Data();
        var displayDetails = {};
        if (display) {
            displayDetails = WC.Utility.ParseJSON(display.display_details);
        }

        // common datails
        if (!displayDetails.chart_type) {
            displayDetails.chart_type = enumHandlers.CHARTTYPE.COLUMNCHART.Code;
        }
        if (!displayDetails.stack) {
            displayDetails.stack = false;
        }
        if (!displayDetails.multi_axis) {
            displayDetails.multi_axis = false;
        }

        // chart options
        var chartOptionGroup = fieldSettingsHandler.GetChartTypeGroup(displayDetails.chart_type);
        var chartOptions = fieldSettingsHandler.GetChartOptionsByGroup(chartOptionGroup);
        jQuery.each(chartOptions, function (index, option) {
            if (typeof displayDetails[option.name] === 'undefined') {
                displayDetails[option.name] = option.options.findObject('IsDefault', true).Id;
            }
        });

        // range
        if (self.IsChartNavigatable(displayDetails.chart_type)) {
            if (!displayDetails.range) {
                displayDetails.range = { start: 0, size: self.FILTERRANGE.DEFAULT };
            }
        }
        else {
            delete displayDetails.range;
        }

        // gauge
        if (displayDetails.chart_type === enumHandlers.CHARTTYPE.GAUGE.Code) {
            if (!displayDetails.GaugeValues || !displayDetails.GaugeValues.length) {
                displayDetails.GaugeValues = self.GAUGEDEFAULT.VALUES.slice();
            }
            if (!displayDetails.GaugeColours || !displayDetails.GaugeColours.length) {
                displayDetails.GaugeColours = self.GAUGEDEFAULT.COLOURS.slice();
            }
        }
        else {
            delete displayDetails.GaugeValues;
            delete displayDetails.GaugeColours;
        }

        return displayDetails;
    };
    self.IsChartNavigatable = function (type) {
        var isChartNavigatable;
        switch (type) {
            case enumHandlers.CHARTTYPE.AREACHART.Code:
            case enumHandlers.CHARTTYPE.BARCHART.Code:
            case enumHandlers.CHARTTYPE.COLUMNCHART.Code:
            case enumHandlers.CHARTTYPE.LINECHART.Code:
            case enumHandlers.CHARTTYPE.SCATTERCHART.Code:
            case enumHandlers.CHARTTYPE.BUBBLECHART.Code:
                isChartNavigatable = true;
                break;

            default:
                isChartNavigatable = false;
                break;
        }
        return isChartNavigatable;
    };
    self.SaveChartRange = function () {
        var displayDetails = self.FieldSettings.GetDisplayDetails();

        if (!self.IsChartNavigatable(displayDetails.chart_type)) {
            delete displayDetails.range;
        }
        else if (self.FILTERRANGE.CURRENT >= self.Categories.length) {
            displayDetails.range = {
                start: 0,
                size: Number.MAX_VALUE
            };
        }
        else {
            if (!displayDetails.range) {
                displayDetails.range = {};
            }
            displayDetails.range.start = self.FILTERRANGE.START;
            displayDetails.range.size = self.FILTERRANGE.CURRENT;
        }

        self.Models.Display.Data().display_details = JSON.stringify(displayDetails);
        self.Models.Display.Data.commit();

        self.FieldSettings.SetDisplayDetails(displayDetails, true);

        if (!self.DashBoardMode()) {
            fieldSettingsHandler.FieldSettings.SetDisplayDetails(displayDetails, true);
        }
    };
    self.CheckResetChartRange = function () {
        var resetChartRange = function () {
            self.FILTERRANGE.START = 0;
            self.FILTERRANGE.CURRENT = self.FILTERRANGE.DEFAULT;
            self.SaveChartRange();
        };
        var displayDetails = self.FieldSettings.GetDisplayDetails();
        if (!self.IsChartNavigatable(displayDetails.chart_type)) {
            resetChartRange();
        }
        else {
            // clean fields and format not affect to post result
            var fields = self.Models.Display.CleanNotAffectPostNewResultFieldProperties(self.Models.Display.Data().fields);
            var postedFields = self.Models.Display.CleanNotAffectPostNewResultFieldProperties(self.Models.Result.Data().display_fields);

            // check change aggregation in data area
            jQuery.each(fields, function (index, field) {
                var fieldDetails = WC.Utility.ParseJSON(field.field_details);
                var areaId = fieldSettingsHandler.GetAreaByName(fieldDetails.pivot_area);
                if (areaId === enumHandlers.FIELDSETTINGAREA.DATA) {
                    var fieldId = field.field;
                    field.field = fieldId.substr(fieldId.indexOf('_') + 1);
                }
            });

            jQuery.each(postedFields, function (index, field) {
                var fieldDetails = WC.Utility.ParseJSON(field.field_details);
                var areaId = fieldSettingsHandler.GetAreaByName(fieldDetails.pivot_area);
                if (areaId === enumHandlers.FIELDSETTINGAREA.DATA) {
                    var fieldId = field.field;
                    field.field = fieldId.substr(fieldId.indexOf('_') + 1);
                }
            });

            if (!jQuery.deepCompare(fields, postedFields, false)) {
                resetChartRange();
            }
        }
    };
    self.GetChartTypeByCode = function (code) {
        var result = null;

        jQuery.each(enumHandlers.CHARTTYPE, function (k, v) {
            if (v.Code === code) {
                result = v;
                return false;
            }
        });

        return result;
    };
    self.GetChartLabelRotation = function (code) {
        var option = {};

        switch (code) {
            case enumHandlers.CHARTTYPE.BARCHART.Code:
            case enumHandlers.CHARTTYPE.COLUMNCHART.Code:
            case enumHandlers.CHARTTYPE.LINECHART.Code:
            case enumHandlers.CHARTTYPE.AREACHART.Code:
            case enumHandlers.CHARTTYPE.BUBBLECHART.Code:
            case enumHandlers.CHARTTYPE.SCATTERCHART.Code:
                option.Label = { Rotation: 270 };
                break;
            case enumHandlers.CHARTTYPE.PIECHART.Code:
            case enumHandlers.CHARTTYPE.DONUTCHART.Code:
                break;
            case enumHandlers.CHARTTYPE.RADARCHART.Code:
                option.Label = { Rotation: 0 };
                break;
            default:
                break;
        }

        return option.Label;
    };
    self.ToggleFieldListArea = function () {
        if (!jQuery('#ChartMainWrapper').hasClass('full')) {
            fieldSettingsHandler.CollapseState[self.Models.Display.Data().uri] = true;
            jQuery('#ChartMainWrapper').addClass('full');
            self.UpdateLayout(0);
        }
        else {
            fieldSettingsHandler.CollapseState[self.Models.Display.Data().uri] = false;
            jQuery('#ChartMainWrapper').removeClass('full');
            self.UpdateLayout(0);
        }
    };
    self.GeneratePercentageTemplate = function (value, decimalPlace) {
        value = value === self.TEXT_NULL ? null : value;
        var result = null;

        if (!IsNullOrEmpty(value) || value === 0)
            result = kendo.format('{0:P' + decimalPlace.toString() + '}', parseFloat(value));

        return result;
    };
    self.GetSecondChartType = function (chartTypeCode) {
        var chartType;
        if (chartTypeCode === enumHandlers.CHARTTYPE.AREACHART.Code) {
            chartType = enumHandlers.CHARTTYPE.COLUMNCHART.Code;
        }
        else {
            chartType = '';
        }
        return chartType;
    };
    self.SetChartPatternStyle = function (chart) {
        var field = self.FieldSettings.GetFieldByFieldName(self.GroupField);
        if (field && field.DomainURI) {
            var groupField = WC.Utility.ConvertFieldName(self.GroupField);
            jQuery.each(chart.options.series, function (index, serie) {
                if (serie.data.length && serie.data[0][groupField + '_pattern']) {
                    serie.dashType = 'dash';
                }
            });
        }
    };

    // check chart
    self.GetRadar2ndChartType = function () {
        return 'radarArea';
    };
    self.IsRadarChartType = function (type) {
        return type.indexOf('radar') !== -1;
    };
    self.GetScatterLineChartType = function () {
        return enumHandlers.CHARTTYPE.SCATTERCHART.Code + 'Line';
    };
    self.IsScatterChartType = function (type) {
        return type.indexOf(enumHandlers.CHARTTYPE.SCATTERCHART.Code) !== -1;
    };
    self.IsScatterOrBubbleChartType = function (type) {
        return type === enumHandlers.CHARTTYPE.BUBBLECHART.Code || self.IsScatterChartType(type);
    };
    self.IsDonutOrPieChartType = function (type) {
        return type === enumHandlers.CHARTTYPE.PIECHART.Code || type === enumHandlers.CHARTTYPE.DONUTCHART.Code;
    };

    /*EOF: Model Methods*/
}
var chartHandler = new ChartHandler();