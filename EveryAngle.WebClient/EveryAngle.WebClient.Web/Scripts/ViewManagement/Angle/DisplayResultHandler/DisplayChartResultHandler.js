function DisplayChartResultHandler(displayHandler) {
    "use strict";

    var _self = {};
    _self.$container = jQuery();

    var self = this;

    // chart types
    self.CreateTypeDropdown = function () {
        _self.$container.find('.query-aggregation-chart-type').removeClass('always-hide');
        var typeElement = _self.$container.find('.chart-type:last');
        var data = self.GetTypeDataSource();
        var valueTemplate = [
            '<div class="chart-type-wrapper">',
                '<div class="chart-icon #= Type #"></div>',
                '<div class="chart-name" data-role="tooltip" data-showwhenneed="true" data-tooltip-position="top">#= Hint #</div>',
            '</div>'
        ].join('');
        var itemTemplate = [
            '<div class="chart-type-wrapper selection">',
                '<div class="chart-name text-ellipsis">#= Name #</div>',
                '# for (var i = 0; i < Types.length; i++) { #',
                '<div class="chart-icon #= Types[i] ##= Types[i]===Type ? \' active\' : \'\' #"',
                ' data-type="#= Types[i] #"',
                ' data-role="tooltip" data-tooltip-position="bottom" data-tooltip-offset="10">#: Hints[i] #</div>',
                '# } #',
            '</div>'
        ].join('');
        var dropdown = WC.HtmlHelper.DropdownList(typeElement, data, {
            height: 300,
            dataTextField: 'Name',
            dataValueField: 'Code',
            valueTemplate: valueTemplate,
            template: itemTemplate,
            open: self.TypeDropdownOpen,
            select: self.TypeDropdownSelect,
            close: self.TypeDropdownClose
        });
        self.UpdateTypeDropdownValue(dropdown, false);
        dropdown.enable(self.DisplayHandler.QueryDefinitionHandler.CanChangeAggregationOptions());
        dropdown.wrapper.addClass('ignore');
        dropdown.popup.element.find('[role="listbox"]').addClass('ignore');
    };
    self.TypeDropdownOpen = function (e) {
        e.sender.popup.element.addClass('chart-type-dropdown');
        e.sender._isSelecting = false;
        e.sender.ul
            .off('click', '.chart-icon')
            .on('click', '.chart-icon', jQuery.proxy(self.TypeDropdownChange, self, e.sender));
    };
    self.TypeDropdownSelect = function (e) {
         e.sender._isSelecting = true;
         e.preventDefault();
    };
    self.TypeDropdownClose = function (e) {
         var isSelecting = e.sender._isSelecting;
        e.sender.refresh();
        e.sender._isSelecting = false;
        if (isSelecting)
            e.preventDefault();
    };
    self.TypeDropdownChange = function (dropdown, e) {
        var data = jQuery(e.currentTarget).data('type').split('_');
        self.SetType(data[0], data[1] === 'stack', data[1] === 'multi');
        self.UpdateTypeDropdownValue(dropdown, true);
        self.UpdateAggregationUI();
        dropdown.close();
    };
    self.UpdateTypeDropdownValue = function (dropdown, checkCountField) {
        // get dataItem and clear values
        var value = self.GetType();
        var dataItem = null;
        jQuery.each(dropdown.dataItems(), function (index, data) {
            if (data.Code === value) {
                dataItem = data;
            }
            else {
                data.Type = null;
                data.Hint = null;
            }
        });
        if (!dataItem)
            return;

        // set value
        if (self.IsMultiAxis()) {
            dataItem.Type = dataItem.Types[2];
            dataItem.Hint = dataItem.Hints[2];
        }
        else if (self.IsStacked()) {
            dataItem.Type = dataItem.Types[1];
            dataItem.Hint = dataItem.Hints[1];
        }
        else {
            dataItem.Type = dataItem.Types[0];
            dataItem.Hint = dataItem.Hints[0];
        }

        dropdown.value(value);
        dropdown._selectValue(dataItem);
        dropdown.refresh();
        if (checkCountField)
            self.DisplayHandler.QueryDefinitionHandler.UpdateCountField();
    };
    self.GetTypeDataSource = function () {
        var data = [];
        var typeMappers = ['', '_stack', '_multi'];
        jQuery.each(enumHandlers.CHARTTYPE, function (key, item) {
            var types = [], hints = [];
            for (var index = 0; index < item.Usage; index++) {
                types.push(item.Code + typeMappers[index]);
                hints.push(self.GetTypeHint(item.Code + typeMappers[index]));
            }
            data.push({ Name: item.Name, Code: item.Code, Type: null, Hint: null, Types: types, Hints: hints });
        });
        return data;
    };
    self.GetTypeHint = function (type) {
        var parts = type.split('_');
        var key = 'Chart_';
        key += parts[0] === enumHandlers.CHARTTYPE.RADARCHART.Code ? 'radar' : parts[0];
        if (parts[1] === 'multi')
            key += 3;
        else if (parts[1] === 'stack')
            key += 2;
        else
            key += 1;
        return Localization[key];
    };
    self.GetType = function () {
        return ChartHelper.GetType(self.DisplayHandler.QueryDefinitionHandler.AggregationOptions());
    };
    self.SetType = function (type, stack, multi) {
        var options = self.DisplayHandler.QueryDefinitionHandler.AggregationOptions();
        options.chart_type = type;
        options.stack = stack;
        options.multi_axis = multi;
        self.DisplayHandler.QueryDefinitionHandler.AggregationOptions(options);
    };
    self.IsStacked = function () {
        return ChartHelper.IsStacked(self.DisplayHandler.QueryDefinitionHandler.AggregationOptions());
    };
    self.IsMultiAxis = function () {
        return ChartHelper.IsMultiAxis(self.DisplayHandler.QueryDefinitionHandler.AggregationOptions());
    };
    self.GetLocalizationTextByType = function (type, baseName) {
        var name = baseName;
        if (type === enumHandlers.CHARTTYPE.BARCHART.Code)
            name += '_Bar';
        else if (ChartHelper.IsDonutOrPieType(type))
            name += '_DonutPie';
        else if (ChartHelper.IsRadarType(type))
            name += '_Radar';
        else if (ChartHelper.IsGaugeType(type))
            name += '_Gauge';
        return Localization[name] || Localization[baseName];
    };

    // gauge
    self.GetGaugeSettings = function () {
        var values = WC.Utility.ToArray(self.DisplayHandler.QueryDefinitionHandler.AggregationOptions().GaugeValues);
        var colors = WC.Utility.ToArray(self.DisplayHandler.QueryDefinitionHandler.AggregationOptions().GaugeColours);
        var defaultSettings = ChartHelper.GetGaugeDefault();
        return {
            values: values.length ? values : defaultSettings.values,
            colors: colors.length ? colors : defaultSettings.colors
        };
    };
    self.SetGaugeSettings = function (values, colors) {
        var options = self.DisplayHandler.QueryDefinitionHandler.AggregationOptions();
        options.GaugeValues = values;
        options.GaugeColours = colors;
        self.DisplayHandler.QueryDefinitionHandler.AggregationOptions(options);
    };
    self.SetGaugeColor = function (index, e) {
        var settings = self.GetGaugeSettings();
        settings.colors[index] = e.sender.value();
        self.SetGaugeSettings(settings.values, settings.colors);
    };
    self.SetGaugeValue = function (index, e) {
        var settings = self.GetGaugeSettings();
        settings.values[index] = e.sender.value();
        self.SetGaugeSettings(settings.values, settings.colors);
    };
    self.UpdateGaugeValues = function (values) {
        var settings = self.GetGaugeSettings();
        settings.values = values;
        self.SetGaugeSettings(settings.values, settings.colors);
        self.DisplayHandler.QueryDefinitionHandler.RefreshAggregationUI();
    };
    self.CheckGaugeUI = function () {
        // un/select fields in row/column area
        var isGaugeType = ChartHelper.IsGaugeType(self.GetType());
        jQuery.each(self.DisplayHandler.QueryDefinitionHandler.Aggregation(), function (index, aggregation) {
            if (aggregation.area() !== AggregationFieldViewModel.Area.Data)
                aggregation.is_selected(!isGaugeType);
        });

        // check valid UI
        if (self.IsValidUI())
            return;

        // refresh view
        self.ResetAggregationView();

        if (isGaugeType)
            self.InitialGaugeUI();
    };
    self.InitialGaugeUI = function () {
        var settings = self.GetGaugeSettings();
        var formatType, uiName;
        if (self.GetGaugeFieldType() === enumHandlers.FIELDTYPE.PERCENTAGE) {
            formatType = enumHandlers.FIELDTYPE.PERCENTAGE;
            uiName = enumHandlers.KENDOUITYPE.PERCENTAGETEXT;
        }
        else {
            formatType = enumHandlers.FIELDTYPE.INTEGER;
            uiName = enumHandlers.KENDOUITYPE.NUMERICTEXT;
        }
        var formatter = new Formatter({ thousandseparator: true, decimals: 0 }, formatType);
        var formatTemplate = WC.FormatHelper.GetFormatter(formatter);

        // values
        for (var i = 1; i <= 6; i++) {
            _self.$container.find('[name="gauge-value' + i + '"]')[uiName]({
                step: 1,
                format: formatTemplate,
                value: settings.values[i - 1],
                change: jQuery.proxy(self.SetGaugeValue, self, i - 1),
                spin: jQuery.proxy(self.SetGaugeValue, self, i - 1)
            });
        }

        // colors
        for (var j = 1; j <= 5; j++) {
            _self.$container.find('[name="gauge-color' + j + '"]').kendoCustomColorPicker({
                value: settings.colors[j - 1],
                change: jQuery.proxy(self.SetGaugeColor, self, j - 1),
                messages: {
                    apply: Localization.Ok,
                    cancel: Localization.Cancel
                }
            });
        }
    };
    self.GetGaugeFieldType = function () {
        var dataFields = ko.toJS(self.DisplayHandler.QueryDefinitionHandler.GetAggregationDataFields());
        var dataField = dataFields.findObject('is_selected', true) || {};
        var modelField = modelFieldsHandler.GetFieldById(dataField.source_field, dataField.model) || { fieldtype: enumHandlers.FIELDTYPE.INTEGER };
        return modelField.fieldtype;
    };
    self.ValidateGaugeType = function () {
        if (ChartHelper.IsGaugeType(self.GetType())) {
            var values = self.GetGaugeSettings().values;
            var isValidAsc = true;
            var isValidDesc = true;
            for (var i = 1; i < values.length; i++) {
                if (values[i - 1] > values[i]) {
                    isValidAsc = false;
                }
                if (values[i - 1] < values[i]) {
                    isValidDesc = false;
                }
            }

            if (!isValidAsc && !isValidDesc) {
                popup.Alert(Localization.Warning_Title, Localization.Info_GaugeChartIncorrectOrder);
                return false;
            }
        }
        return true;
    };

    // options
    self.ShowAggregationOptions = function () {
        if (!self.DisplayHandler.QueryDefinitionHandler.CanChangeAggregationOptions())
            return;

        var handler = new ChartOptionsHandler(self.DisplayHandler);
        handler.ShowPopup();
    };
    self.EnsureAggregationOptions = function () {
        var handler = new ChartOptionsHandler(self.DisplayHandler);
        handler.SetOptions();
    };
    self.CalculateValuesBoundary = function (fieldId, stack) {
        // TODO: this still uses old handler (chartHandler)
        return chartHandler.CalculateValuesBoundary(chartHandler.Series, fieldId, stack);
    };

    // aggregation
    self.InitialAggregationUI = function (container) {
        _self.$container = container;

        // chart type dropdown
        self.CreateTypeDropdown();
        self.UpdateAggregationUI();
    };
    self.UpdateAggregationUI = function () {
        self.SetAggregationTexts();
        self.CheckGaugeUI();
        self.DisplayHandler.QueryDefinitionHandler.InitialAggregationSortable(_self.$container);
    };
    self.IsValidUI = function () {
        var isGaugeType = ChartHelper.IsGaugeType(self.GetType());
        var fieldType = self.GetGaugeFieldType();
        var isGaugeView = _self.$container.find('.query-aggregation-gauge').length;
        var isNoneGaugeView = !isGaugeType && !isGaugeView;
        var isPercentageGuageView = isGaugeView && fieldType === enumHandlers.FIELDTYPE.PERCENTAGE && _self.$container.find('[data-role="percentagetextbox"]').length;
        var isNumericGuageView = isGaugeView && fieldType !== enumHandlers.FIELDTYPE.PERCENTAGE && _self.$container.find('[data-role="numerictextbox"]').length;
        return isNoneGaugeView || isPercentageGuageView || isNumericGuageView;
    };
    self.ResetAggregationView = function () {
        // trigger view
        var options = self.DisplayHandler.QueryDefinitionHandler.AggregationOptions();
        self.DisplayHandler.QueryDefinitionHandler.AggregationOptions({});
        self.DisplayHandler.QueryDefinitionHandler.AggregationOptions(options);

        // clean up
        WC.HtmlHelper.DestroyDropdownPopup();
    };
    self.SetAggregationTexts = function () {
        var type = self.GetType();
        var texts = jQuery.extend(
            {},
            self.DisplayHandler.QueryDefinitionHandler.Texts(),
            {
                AggregationTitle: Captions.Title_AggregationChart,
                AggregationHeaderGauge: Localization.ChartGaugeSetting,
                AggregationHeaderRow: self.GetLocalizationTextByType(type, 'ChartRowArea'),
                AggregationHeaderColumn: self.GetLocalizationTextByType(type, 'ChartColumnArea'),
                AggregationHeaderData: self.GetLocalizationTextByType(type, 'ChartDataArea'),
                AggregationConfirmDiscardChanges: kendo.format(Localization.PopupConfirmDiscardChangeFieldSettingAndContinue, self.DisplayHandler.Data().display_type)
            }
        );
        self.DisplayHandler.QueryDefinitionHandler.Texts(texts);
    };
    self.SetAggregationFormatTexts = function (texts) {
        texts.HeaderAlias = Localization.NameAsShowInChart;
    };
    self.CanSortField = function (aggregation) {
        var validTypes = [
            enumHandlers.CHARTTYPE.AREACHART.Code,
            enumHandlers.CHARTTYPE.BARCHART.Code,
            enumHandlers.CHARTTYPE.COLUMNCHART.Code,
            enumHandlers.CHARTTYPE.LINECHART.Code
        ];
        var isValidType = jQuery.inArray(self.GetType(), validTypes) !== -1;
        var isSupportArea = aggregation.area() === AggregationFieldViewModel.Area.Data;
        var isValidField = aggregation.valid() && aggregation.is_selected();
        return isValidType
            && isSupportArea
            && isValidField
            && self.DisplayHandler.QueryDefinitionHandler.Authorizations.CanChangeAggregation();
    };
    self.SortField = function (aggregation) {
        var sorting = aggregation.sorting();

        // clear all sorting
        jQuery.each(self.DisplayHandler.QueryDefinitionHandler.Aggregation(), function (index, field) {
            field.sorting('');
        });

        // update current sorting
        if (sorting === AggregationFieldViewModel.Sorting.Ascending)
            aggregation.sorting(AggregationFieldViewModel.Sorting.Unsorted);
        else if (sorting === AggregationFieldViewModel.Sorting.Descending)
            aggregation.sorting(AggregationFieldViewModel.Sorting.Ascending);
        else
            aggregation.sorting(AggregationFieldViewModel.Sorting.Descending);
    };
    self.GetAggregationSortingClassName = function (aggregation) {
        if (aggregation.sorting() === AggregationFieldViewModel.Sorting.Ascending)
            return 'icon-sort-asc';
        if (aggregation.sorting() === AggregationFieldViewModel.Sorting.Descending)
            return 'icon-sort-desc';
        return 'icon-sort-no';
    };
    self.GetAggregationFieldLimit = function (area) {
        if (ChartHelper.IsGaugeType(self.GetType()) && area !== AggregationFieldViewModel.Area.Data)
            return 0;

        // including a count field
        if (area === AggregationFieldViewModel.Area.Data)
            return self.IsMultiAxis() ? 3 : 2;

        return 1;
    };
    self.CanChangeCountFieldState = function () {
        return self.GetType() !== enumHandlers.CHARTTYPE.BUBBLECHART.Code
            && self.DisplayHandler.QueryDefinitionHandler.GetAggregationDataFields().length >= self.GetAggregationFieldLimit(AggregationFieldViewModel.Area.Data)
            && self.DisplayHandler.QueryDefinitionHandler.Authorizations.CanChangeAggregation();
    };
    self.CanAddReferenceLine = function (aggregation) {
        var chartAllowed = [
            enumHandlers.CHARTTYPE.COLUMNCHART.Code, enumHandlers.CHARTTYPE.LINECHART.Code,
            enumHandlers.CHARTTYPE.SCATTERCHART.Code, enumHandlers.CHARTTYPE.AREACHART.Code,
            enumHandlers.CHARTTYPE.BARCHART.Code, enumHandlers.CHARTTYPE.BUBBLECHART.Code
        ];
        var dataFields = self.DisplayHandler.QueryDefinitionHandler.GetAggregationDataFields().findObjects('is_selected', function (selected) { return selected(); });
        var isNotAllowed = self.GetType() === enumHandlers.CHARTTYPE.BUBBLECHART.Code && dataFields[dataFields.length-1] === aggregation;
        return chartAllowed.indexOf(self.GetType()) !== -1
            && aggregation.area() === AggregationFieldViewModel.Area.Data
            && aggregation.is_selected()
            && !isNotAllowed;
    };
    self.ShowAddReferenceLinePopup = function (aggregation) {
        var field = modelFieldsHandler.GetFieldById(aggregation.source_field, aggregation.model);

        if (!self.CanAddReferenceLine(aggregation) || !field)
            return;

        var targethandler = new TargetLineHandler(self.DisplayHandler.QueryDefinitionHandler, aggregation, field);
        targethandler.ShowPopup();

    };
    self.ValidateAggregation = function () {
        // has error
        if (self.DisplayHandler.QueryDefinitionHandler.HasErrorAggregationField()) {
            popup.Alert(Localization.Warning_Title, Localization.Info_PleaseRemoveAllInvalidFieldsInAggArea);
            return false;
        }

        // has a duplicate data field
        if (self.DisplayHandler.QueryDefinitionHandler.HasDuplicatedAggregationDataField()) {
            popup.Alert(Localization.Warning_Title, Localization.FieldSettingWarningMessageNotAllowSameFieldSameBucketInDataArea);
            return false;
        }

        // check chart fields
        var rowFields = ko.toJS(self.DisplayHandler.QueryDefinitionHandler.GetAggregationRowFields()).findObjects('is_selected', true);
        var columnFields = ko.toJS(self.DisplayHandler.QueryDefinitionHandler.GetAggregationColumnFields()).findObjects('is_selected', true);
        var dataFields = ko.toJS(self.DisplayHandler.QueryDefinitionHandler.GetAggregationDataFields()).findObjects('is_selected', true);
        if (!self.ValidateRowAndColumnFields(rowFields, columnFields)
            || !self.ValidateRowFields(rowFields)
            || !self.ValidateDataFields(dataFields)
            || !self.ValidateBubbleAndScatterRowField(rowFields[0])
            || !self.ValidateGaugeType()) {
            return false;
        }
        return true;
    };
    self.ValidateRowAndColumnFields = function (rowFields, columnFields) {
        if (rowFields.length > 1 || columnFields.length > 1) {
            popup.Alert(Localization.Warning_Title, Localization.Info_ChartCanHaveOnlyOneFieldInCategories);
            return false;
        }
        return true;
    };
    self.ValidateRowFields = function (rowFields) {
        var type = self.GetType();
        if (!ChartHelper.IsGaugeType(type) && !rowFields.length) {
            popup.Alert(Localization.Warning_Title, self.GetLocalizationTextByType(type, 'Info_RequiredFieldInRowAreaChart'));
            return false;
        }
        return true;
    };
    self.ValidateDataFields = function (dataFields) {
        var type = self.GetType();
        if (type === enumHandlers.CHARTTYPE.BUBBLECHART.Code) {
            if (dataFields.length < 1 || dataFields.length > 2) {
                popup.Alert(Localization.Warning_Title, Localization.Info_RequiredFieldsInBubbleChart);
                return false;
            }
        }
        else {
            var multiAxis = self.IsMultiAxis();
            if (multiAxis && dataFields.length !== 2) {
                popup.Alert(Localization.Warning_Title, Localization.Info_RequiredFieldsInMultiAxis);
                return false;
            }
            else if (!multiAxis && dataFields.length !== 1) {
                popup.Alert(Localization.Warning_Title, self.GetLocalizationTextByType(type, 'Info_PleaseRemoveOneFieldFromDataArea'));
                return false;
            }
        }
        return true;
    };
    self.ValidateBubbleAndScatterRowField = function (rowField) {
        var type = self.GetType();
        var validFieldTypes = [
            enumHandlers.FIELDTYPE.CURRENCY, enumHandlers.FIELDTYPE.NUMBER,
            enumHandlers.FIELDTYPE.INTEGER, enumHandlers.FIELDTYPE.PERIOD,
            enumHandlers.FIELDTYPE.DOUBLE, enumHandlers.FIELDTYPE.PERCENTAGE,
            enumHandlers.FIELDTYPE.DATE, enumHandlers.FIELDTYPE.DATETIME,
            enumHandlers.FIELDTYPE.TIME, enumHandlers.FIELDTYPE.TIMESPAN
        ];
        var field = rowField ? modelFieldsHandler.GetFieldById(rowField.source_field, rowField.model) : null;
        if (ChartHelper.IsScatterOrBubbleType(type) && field && jQuery.inArray(field.fieldtype, validFieldTypes) === -1) {
            popup.Alert(Localization.Warning_Title, type + ' ' + Localization.Info_RequiredNumberOrDateFieldForChart);
            return false;
        }
        return true;
    };
    self.OnAggregationChangeCallback = function (items, newArea, oldIndex, newIndex) {
        if (!items.length) {
            return;
        }

        items[0].area(newArea);
        if (oldIndex === newIndex) {
            self.DisplayHandler.QueryDefinitionHandler.Aggregation.moveTo(0, 1);
        }
    };

    // constructur
    self.Initial(displayHandler);
}
DisplayChartResultHandler.extend(BaseDisplayResultHandler);