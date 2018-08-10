var fieldSettingsHandler = new FieldSettingsHandler();

function FieldSettingsHandler() {
	"use strict";

	var self = this;
	var _self = {};

	/*BOF: Model Properties*/
	self.CurrentFieldArea = null;
	self.IsChangeFieldsSetting = false;
	self.FieldSettings = null;
	self.IsNeedResetLayout = false;
	self.CollapseState = {};
	self.ThousandSeparator = ko.observable();
	self.FIELDSETTINGTYPE = {
		PIVOT: 'pivot',
		CHART: 'chart',
		CHARTGAUGE: 'chart-gauge'
	};
	self.CHARTSCALETYPE = {
		AUTOMATIC: 'automatic',
		MANUAL: 'manual'
	};
	self.CHARTGROUP = {
		GAUGE: 'gauge',
		RADAR: 'radar',
		PIE: 'pie',
		BOX: 'box'
	};
	self.CHARTOPTIONS = {
		axistitle: [
			{
				Id: 'show',
				Text: Captions.Label_ChartOptions_AxisTitle_Show,
				IsDefault: true
			},
			{
				Id: 'hide',
				Text: Captions.Label_ChartOptions_AxisTitle_Hide
			},
			{
				Id: 'show-x',
				Text: Captions.Label_ChartOptions_AxisTitle_ShowX
			},
			{
				Id: 'show-y',
				Text: Captions.Label_ChartOptions_AxisTitle_ShowY
			}
		],
		axistitlegauge: [
			{
				Id: 'show',
				Text: Captions.Label_ChartOptions_AxisTitle_Show,
				IsDefault: true
			},
			{
				Id: 'hide',
				Text: Captions.Label_ChartOptions_AxisTitle_Hide
			}
		],
		axisvalue: [
			{
				Id: 'show',
				Text: Captions.Label_ChartOptions_AxisValue_Show,
				IsDefault: true
			},
			{
				Id: 'hide',
				Text: Captions.Label_ChartOptions_AxisValue_Hide
			},
			{
				Id: 'show-x',
				Text: Captions.Label_ChartOptions_AxisValue_ShowX
			},
			{
				Id: 'show-y',
				Text: Captions.Label_ChartOptions_AxisValue_ShowY
			}
		],
		axisvalueradar: [
			{
				Id: 'show',
				Text: Captions.Label_ChartOptions_AxisValue_Show,
				IsDefault: true
			},
			{
				Id: 'hide',
				Text: Captions.Label_ChartOptions_AxisValue_Hide
			}
		],
		axisscale: [
			{
				Id: self.CHARTSCALETYPE.AUTOMATIC,
				Text: Captions.Label_ChartOptions_AxisScale_Automatic,
				IsDefault: true
			},
			{
				Id: self.CHARTSCALETYPE.MANUAL,
				Text: Captions.Label_ChartOptions_AxisScale_Manual
			}
		],
		datalabel: [
			{
				Id: 'show',
				Text: Captions.Label_ChartOptions_DataLabel_Show
			},
			{
				Id: 'show_values',
				Text: Captions.Label_ChartOptions_DataLabel_ShowValues
			},
			{
				Id: 'hide',
				Text: Captions.Label_ChartOptions_DataLabel_Hide
			},
			{
				Id: 'mouse',
				Text: Captions.Label_ChartOptions_DataLabel_Mouse,
				IsDefault: true
			}
		],
		datalabelgauge: [
			{
				Id: 'show',
				Text: Captions.Label_ChartOptions_DataLabel_Show,
				IsDefault: true
			},
			{
				Id: 'hide',
				Text: Captions.Label_ChartOptions_DataLabel_Hide
			}
		],
		gridline: [
			{
				Id: 'show',
				Text: Captions.Label_ChartOptions_Gridline_Show,
				IsDefault: true
			},
			{
				Id: 'show-x',
				Text: Captions.Label_ChartOptions_Gridline_ShowX
			},
			{
				Id: 'show-y',
				Text: Captions.Label_ChartOptions_Gridline_ShowY
			},
			{
				Id: 'hide',
				Text: Captions.Label_ChartOptions_Gridline_Hide
			}
		],
		gridlineradar: [
			{
				Id: 'show',
				Text: Captions.Label_ChartOptions_GridlineRadar_Show,
				IsDefault: true
			},
			{
				Id: 'hide',
				Text: Captions.Label_ChartOptions_GridlineRadar_Hide
			}
		],
		legend: [
			{
				Id: 'show',
				Text: Captions.Label_ChartOptions_Legend_Show,
				IsDefault: true
			},
			{
				Id: 'hide',
				Text: Captions.Label_ChartOptions_Legend_Hide
			}
		],
		gridlinetype: [
			{
				Id: 'arc',
				Text: Captions.Label_ChartOptions_GridlineType_Arc,
				IsDefault: true
			},
			{
				Id: 'line',
				Text: Captions.Label_ChartOptions_GridlineType_Line
			}
		],
		rangesgauge: [
			{
				Id: 'show',
				Text: Captions.Label_ChartOptions_Ranges_Show,
				IsDefault: true
			},
			{
				Id: 'hide',
				Text: Captions.Label_ChartOptions_Ranges_Hide
			}
		]
	};
	self.OptionAxisScaleId = 'axisscale';
	self.OptionAxisScaleRangesId = 'axisscale_ranges';

	self.Handler = null;
	/*EOF: Model Properties*/

	/*BOF: Model Methods*/

	// templates
	self.TemplateArea = function (settingType) {
		return [
			'<div class="fieldListArea" id="FieldListArea">',
			'<div class="displayOptionsWrapper">',
			'<label title="' + Localization.ChartType + '">' + Localization.ChartType + '</label>',
			'<div id="ChartType" class="eaDropdown eaDropdownSize40"></div>',
			'<a class="btn btnPrimary btnDisplayOptions" id="ButtonDisplayOptions" onclick="fieldSettingsHandler.ShowDisplayOptionsPopup(' + "'" + settingType + "'" + ')"><span>' + Captions.Button_ChartOptions + '</span></a>',
			'</div>',
			'<div class="fieldListAreaInner">',
			'<div class="gaugeChartSettingWrapper">',
			'<div class="gaugeSettingRow">',
			'<label>' + kendo.format(Localization.ChartGaugeAreaValue, 1) + '</label>',
			'<input id="gaugeValue1" class="eaNumeric" />',
			'<label>' + Localization.ChartGaugeAreaColor + '</label>',
			'<input id="gaugeColorPicker1" />',
			'</div>',
			'<div class="gaugeSettingRow">',
			'<label>' + kendo.format(Localization.ChartGaugeAreaValue, 2) + '</label>',
			'<input id="gaugeValue2" class="eaNumeric" />',
			'<label>' + Localization.ChartGaugeAreaColor + '</label>',
			'<input id="gaugeColorPicker2" class="eaColorPicker" />',
			'</div>',
			'<div class="gaugeSettingRow">',
			'<label>' + kendo.format(Localization.ChartGaugeAreaValue, 3) + '</label>',
			'<input id="gaugeValue3" class="eaNumeric" />',
			'<label>' + Localization.ChartGaugeAreaColor + '</label>',
			'<input id="gaugeColorPicker3" class="eaColorPicker" />',
			'</div>',
			'<div class="gaugeSettingRow">',
			'<label>' + kendo.format(Localization.ChartGaugeAreaValue, 4) + '</label>',
			'<input id="gaugeValue4" class="eaNumeric" />',
			'<label>' + Localization.ChartGaugeAreaColor + '</label>',
			'<input id="gaugeColorPicker4" class="eaColorPicker" />',
			'</div>',
			'<div class="gaugeSettingRow">',
			'<label>' + kendo.format(Localization.ChartGaugeAreaValue, 5) + '</label>',
			'<input id="gaugeValue5" class="eaNumeric" />',
			'<label>' + Localization.ChartGaugeAreaColor + '</label>',
			'<input id="gaugeColorPicker5" class="eaColorPicker" />',
			'</div>',
			'<div class="gaugeSettingRow">',
			'<label>' + kendo.format(Localization.ChartGaugeAreaValue, 6) + '</label>',
			'<input id="gaugeValue6" class="eaNumeric" />',
			'</div>',
			'</div>',
			'<div class="fieldListAreaItem rowArea" id="FieldListRowArea">',
			'<div class="fieldListAreaHeader">',
			'<h4>{TitleRowArea}</h4>',
			'<a id="AddRowAreaField" class="btn btnDefault addFieldButton" onclick="fieldSettingsHandler.ShowAddFieldPopup(\'row\');"><span>+</span></a>',
			'</div>',
			'<div class="fieldListAreaBody">',
			'<ul></ul>',
			'</div>',
			'</div>',
			'<div class="fieldListAreaItem columnArea" id="FieldListColumnArea">',
			'<div class="fieldListAreaHeader">',
			'<h4>{TitleColumnArea}</h4>',
			'<a id="AddColumnAreaField" class="btn btnDefault addFieldButton" onclick="fieldSettingsHandler.ShowAddFieldPopup(\'column\');"><span>+</span></a>',
			'</div>',
			'<div class="fieldListAreaBody">',
			'<ul></ul>',
			'</div>',
			'</div>',
			'<div class="fieldListAreaItem dataArea" id="FieldListDataArea">',
			'<div class="fieldListAreaHeader">',
			'<h4>{TitleDataArea}</h4>',
			'<a id="AddDataAreaField" class="btn btnDefault addFieldButton" onclick="fieldSettingsHandler.ShowAddFieldPopup(\'data\');"><span>+</span></a>',
			'</div>',
			'<div class="fieldListAreaBody">',
			'<ul></ul>',
			'</div>',
			'</div>',
			'</div>',
			'<div class="fieldListButton"><a id="btnFieldSettingApply" class="btn btnPrimary btnSmall disabled" onclick="fieldSettingsHandler.ApplySettings()"><span>' + Localization.Apply + '</span></a></div>',
			'</div>'
		].join('');
	};
	self.TemplateBucket = function () {
		return [
			'<div class="k-widget k-window-custom k-window-with-buttons k-window-arrow-w popupBucket" id="{BucketId}">',
			'<div class="k-header k-window-titlebar">',
			'<span class="k-window-title">{Title}</span>',
			'</div>',
			'<div class="k-content k-window-content">',
			'<div class="BucketOptionAliasArea {BucketAliasNameClass}">',
			'<label class="Title">{ShowAsIn}</label>',
			'<div class="BucketOption">',
			'<input id="BucketAliasName" type="text" class="eaText eaTextSize40" maxlength="255"></input>',
			'</div>',
			'</div>',
			'<label class="Title {BucketOptionClass}">{BucketOptionTitle}</label>',
			'<div class="BucketOption {BucketOptionClass}">',
			'<span id="BucketOptionDropDown" class="eaDropdown eaDropdownSize40"></span>',
			'</div>',

			'<label class="Title {BucketDisplayUnitClass}">' + Localization.FormatSettingDisplayUnits + '</label>',
			'<div class="BucketOption {BucketDisplayUnitClass}">',
			'<span id="BucketDisplayUnitDropDown" class="eaDropdown eaDropdownSize40"></span>',
			'</div>',

			'<label class="Title {BucketDecimalClass} bucketDecimal">' + Localization.Decimal + '</label>',
			'<div class="BucketOption {BucketDecimalClass} bucketDecimal">',
			'<span id="BucketDecimalDropDown" class="eaDropdown eaDropdownSize40"></span>',
			'</div>',

			'<label class="Title {BucketOptionFormatClass} bucketformat">' + Localization.Format + '</label>',
			'<div class="BucketOption {BucketOptionFormatClass} bucketformat">',
			'<span id="BucketFormatOptionDropDown" class="eaDropdown eaDropdownSize40"></span>',
			'</div>',

			'<label class="Title {SecondsOptionFormatClass} secondsformat">' + Captions.Label_FieldFormat_Seconds + '</label>',
			'<div class="SecondsOption {SecondsOptionFormatClass} secondsformat">',
			'<span id="SecondsFormatOptionDropDown" class="eaDropdown eaDropdownSize40"></span>',
			'</div>',

			'<div class="ThousandSeperateWrapper {ThousandSeperateClass}">',
			'<input type="checkbox" id="UseBucketThousandSeperate" name="thousandseparator" value="true" data-bind=\"checked: $root.ThousandSeparator, IndeterminatableChange: $root.ThousandSeparator\">',
			'<span class="textStatus">' + Localization.UserSettingLabelThousandSeparator + '</span>',
			'</div>',
			'</div>',
			'<div class="k-window-buttons">',
			'<div class="k-window-buttons-inner">',
			'<a class="btn btnRight btnSmall btnPrimary btnSetBucket" onclick="fieldSettingsHandler.HideFieldOptionsMenu();" ><span>' + Localization.Ok + '</span></a>',
			'</div>',
			'</div>',
			'</div>'
		].join('');
	};
	self.ChartTemplateOptions = function (chartType) {
		var template = [];
		var chartGroup = self.GetChartTypeGroup(chartType);

		template = template.concat([
			'<div class="k-widget k-window-custom k-window-with-buttons k-window-arrow-w popupChartOptions" id="PopupChartOptions">',
			'<div class="k-header k-window-titlebar">',
			'<span class="k-window-title">' + Captions.Title_ChartOptions + '</span>',
			'<div class="k-window-actions">',
			'<a role="button" class="k-window-action k-link" onclick="fieldSettingsHandler.RemoveDisplayOptionsPopup()"><span role="presentation" class="k-icon k-i-close"></span></a>',
			'</div>',
			'</div>',
			'<div class="k-content k-window-content">'
		]);

		if (chartGroup === self.CHARTGROUP.PIE) {
			template = template.concat(self.GetPieChartTemplateOptions());
		}
		else if (chartGroup === self.CHARTGROUP.RADAR) {
			template = template.concat(self.GetRadarChartTemplateOptions());
		}
		else if (chartGroup === self.CHARTGROUP.GAUGE) {
			template = template.concat(self.GetGuageChartTemplateOptions());
		}
		else {
			template = template.concat(self.GetBoxChartTemplateOptions());
		}

		template = template.concat([
			'</div>',
			'</div>'
		]);

		return template.join('');
	};
	self.GetPieChartTemplateOptions = function () {
		return [
			'<label class="Title">' + Captions.Label_ChartOptions_DataLabel + '</label>',
			'<div class="ChartOption">',
			'<span id="ChartOptionDropDownDataLabel" data-id="datalabel" class="eaDropdown eaDropdownSize40"></span>',
			'</div>',
			'<label class="Title">' + Captions.Label_ChartOptions_Legend + '</label>',
			'<div class="ChartOption">',
			'<span id="ChartOptionDropDownLegend" data-id="legend" class="eaDropdown eaDropdownSize40"></span>',
			'</div>'
		];
	};
	self.GetRadarChartTemplateOptions = function () {
		return [
			'<label class="Title">' + Captions.Label_ChartOptions_AxisValue + '</label>',
			'<div class="ChartOption">',
			'<span id="ChartOptionDropDownAxisValue" data-id="axisvalueradar" class="eaDropdown eaDropdownSize40"></span>',
			'</div>',
			'<label class="Title">' + Captions.Label_ChartOptions_DataLabel + '</label>',
			'<div class="ChartOption">',
			'<span id="ChartOptionDropDownDataLabel" data-id="datalabel" class="eaDropdown eaDropdownSize40"></span>',
			'</div>',
			'<label class="Title">' + Captions.Label_ChartOptions_Gridline + '</label>',
			'<div class="ChartOption">',
			'<span id="ChartOptionDropDownGridline" data-id="gridlineradar" class="eaDropdown eaDropdownSize40"></span>',
			'</div>',
			'<label class="Title">' + Captions.Label_ChartOptions_GridlineType + '</label>',
			'<div class="ChartOption">',
			'<span id="ChartOptionDropDownGridlineType" data-id="gridlinetype" class="eaDropdown eaDropdownSize40"></span>',
			'</div>',
			'<label class="Title">' + Captions.Label_ChartOptions_Legend + '</label>',
			'<div class="ChartOption">',
			'<span id="ChartOptionDropDownLegend" data-id="legend" class="eaDropdown eaDropdownSize40"></span>',
			'</div>'
		];
	};
	self.GetGuageChartTemplateOptions = function () {
		return [
			'<label class="Title">' + Captions.Label_ChartOptions_AxisTitle + '</label>',
			'<div class="ChartOption">',
			'<span id="ChartOptionDropDownAxisTitle" data-id="axistitlegauge" class="eaDropdown eaDropdownSize40"></span>',
			'</div>',
			'<label class="Title">' + Captions.Label_ChartOptions_DataLabel + '</label>',
			'<div class="ChartOption">',
			'<span id="ChartOptionDropDownDataLabel" data-id="datalabelgauge" class="eaDropdown eaDropdownSize40"></span>',
			'</div>',
			'<label class="Title">' + Captions.Label_ChartOptions_Ranges + '</label>',
			'<div class="ChartOption">',
			'<span id="ChartOptionDropDownRanges" data-id="rangesgauge" class="eaDropdown eaDropdownSize40"></span>',
			'</div>'
		];
	};
	self.GetBoxChartTemplateOptions = function () {
		return [
			'<label class="Title">' + Captions.Label_ChartOptions_AxisTitle + '</label>',
			'<div class="ChartOption">',
			'<span id="ChartOptionDropDownAxisTitle" data-id="axistitle" class="eaDropdown eaDropdownSize40"></span>',
			'</div>',
			'<label class="Title">' + Captions.Label_ChartOptions_AxisValue + '</label>',
			'<div class="ChartOption">',
			'<span id="ChartOptionDropDownAxisValue" data-id="axisvalue" class="eaDropdown eaDropdownSize40"></span>',
			'</div>',
			'<label class="Title">' + Captions.Label_ChartOptions_AxisScale + '</label>',
			'<div class="ChartOption">',
			'<span id="ChartOptionDropDownAxisScale" data-id="axisscale" class="eaDropdown eaDropdownSize40"></span>',
			'</div>',
			'<div id="ChartAxisScaleRanges"></div>',
			'<label class="Title">' + Captions.Label_ChartOptions_DataLabel + '</label>',
			'<div class="ChartOption">',
			'<span id="ChartOptionDropDownDataLabel" data-id="datalabel" class="eaDropdown eaDropdownSize40"></span>',
			'</div>',
			'<label class="Title">' + Captions.Label_ChartOptions_Gridline + '</label>',
			'<div class="ChartOption">',
			'<span id="ChartOptionDropDownGridline" data-id="gridline" class="eaDropdown eaDropdownSize40"></span>',
			'</div>',
			'<label class="Title">' + Captions.Label_ChartOptions_Legend + '</label>',
			'<div class="ChartOption">',
			'<span id="ChartOptionDropDownLegend" data-id="legend" class="eaDropdown eaDropdownSize40"></span>',
			'</div>',
			'<div class="ChartOption">',
			'<label><input type="checkbox" data-id="show_as_percentage" id="ShowAsPercentage" name="ShowAsPercentage" value="false"><span class="label">' + Captions.Label_ChartOptions_ShowAsPercentage + '</span></label>',
			'</div>'
		];
	};
	self.PivotTemplateOptions = function () {
		var template = [];

		template = template.concat([
			'<div class="k-widget k-window-custom k-window-with-buttons k-window-arrow-w popupChartOptions" id="PopupChartOptions">',
			'<div class="k-header k-window-titlebar">',
			'<span class="k-window-title">' + Captions.Title_ChartOptions + '</span>',
			'<div class="k-window-actions">',
			'<a role="button" class="k-window-action k-link" onclick="fieldSettingsHandler.RemoveDisplayOptionsPopup()"><span role="presentation" class="k-icon k-i-close"></span></a>',
			'</div>',
			'</div>',
			'<div class="k-content k-window-content">'
		]);

		template = template.concat([
			'<label class="Title">' + Captions.Pivot_Option_Totals + '</label>',
			'<div class="ChartOption">',
			'<span id="ShowTotalFor" class="eaDropdown eaDropdownSize40"></span>',
			'</div>',
			'<div class="ChartOption">',
			'<label><input type="checkbox" id="chkIncludeSubtotal" onclick="fieldSettingsHandler.ChangeIncludeSubtotals()" name="thousandseparator" value="true"><span class="label">' + Captions.Pivot_Option_IncludeSubtotals + '</span></label>',
			'</div>',
			'<label class="Title">' + Captions.Pivot_Option_Percentages + '</label>',
			'<div class="ChartOption">',
			'<span id="PercentageSummaryDropDown" class="eaDropdown eaDropdownSize40"></span>',
			'</div>'
		]);

		template = template.concat([
			'</div>',
			'</div>'
		]);

		return template.join('');
	};

	// private method

	// get field type of model field
	// params:
	// - obj: model field (ModelFieldModel) or field in field setting (self.FieldSettings.Field)
	_self.GetFieldType = function (obj) {
		return obj.fieldtype || obj.DataType;
	};

	// public method
	self.ChangeIncludeSubtotals = function () {
		var isTrue = jQuery("#chkIncludeSubtotal").prop('checked');
		self.FieldSettings.SetDisplayDetails({ include_subtotals: isTrue });
		self.SetApplyButtonStatus(true);
		self.IsNeedResetLayout = true;
	};
	self.ChangeIncludeSubtotalsControlStatus = function (isEnable) {
		if (isEnable) {
			jQuery("#chkIncludeSubtotal").prop('checked', false);
			jQuery("#chkIncludeSubtotal").attr("disabled", true);
			self.ChangeIncludeSubtotals();
		} else {
			jQuery("#chkIncludeSubtotal").removeAttr("disabled");
		}
	};
	self.SetTemplate = function (type) {
		var areaTemplate = self.TemplateArea(type);
		areaTemplate = areaTemplate.replace('{TitleRowArea}', Localization.PivotRowArea);
		areaTemplate = areaTemplate.replace('{TitleColumnArea}', Localization.PivotColumnArea);
		areaTemplate = areaTemplate.replace('{TitleDataArea}', Localization.PivotDataArea);

		jQuery('#FieldListArea').remove();
		jQuery('#AngleTableWrapper .displayWrapper').prepend(areaTemplate);

		self.UpdateSortableArea();

		// set class
		if (type === self.FIELDSETTINGTYPE.PIVOT) {
			jQuery('#FieldListArea').attr('class', 'fieldListArea fieldListAreaPivot');

		}
		else {
			if (type === self.FIELDSETTINGTYPE.CHARTGAUGE) {
				jQuery('#FieldListArea').attr('class', 'fieldListArea fieldListAreaChartGauge');
			}
			else {
				jQuery('#FieldListArea').attr('class', 'fieldListArea fieldListAreaChart');
			}

			self.CreateDropdownChartType();
		}
	};
	self.GetLocalizationTextByChartType = function (chartType, baseName) {
		var name = baseName;
		if (chartType === enumHandlers.CHARTTYPE.BARCHART.Code)
			name += '_Bar';
		else if (chartType === enumHandlers.CHARTTYPE.PIECHART.Code || chartType === enumHandlers.CHARTTYPE.DONUTCHART.Code)
			name += '_DonutPie';
		else if (chartType === enumHandlers.CHARTTYPE.RADARCHART.Code)
			name += '_Radar';
		else if (chartType === enumHandlers.CHARTTYPE.GAUGE.Code)
			name += '_Gauge';
		return Localization[name] || Localization[baseName];
	};
	self.GetAreaById = function (id) {
		if (id === enumHandlers.FIELDSETTINGAREA.ROW)
			return 'row';
		if (id === enumHandlers.FIELDSETTINGAREA.COLUMN)
			return 'column';
		if (id === enumHandlers.FIELDSETTINGAREA.DATA)
			return 'data';
	};
	self.GetAreaByName = function (name) {
		return enumHandlers.FIELDSETTINGAREA[name.toUpperCase()];
	};
	self.GetBucketTypeAreaById = function (id) {
		if (id === 0)
			return 'grouping_fields';
		else if (id === 1)
			return 'column_fields';
		else if (id === 3)
			return 'aggregation_fields';
	};
	self.GetAggregationFieldSettingBySourceField = function (sourceField) {
		return self.FieldSettings.GetFields().findObject('SourceField', sourceField);
	};
	self.InitialFieldsSetting = function () {
		self.Handler.InitialFieldsSetting();
	};
	self.InitialFieldsSettingDataArea = function (container) {
		// data area
		if (jQuery(container + ' .dataArea ul').data('kendoDraggable'))
			return;

		jQuery(container + ' .dataArea ul').kendoDraggable({
			axis: 'y',
			filter: 'li:not(.noDrag,.validError)',
			hint: function (item) {
				jQuery('#FieldListArea').data('state', {
					element: item,
					drag: {
						index: item.prevUntil().length,
						area: enumHandlers.FIELDSETTINGAREA.DATA,
						data: self.FieldSettings.GetFields()
					},
					drop: {
						index: null,
						area: enumHandlers.FIELDSETTINGAREA.DATA,
						data: self.FieldSettings.GetFields()
					}
				});

				if (jQuery('#FieldListArea .dataArea li').length <= 1)
					return;

				jQuery('#FieldListArea').find('.k-state-selected').removeClass('k-state-selected');
				item.addClass('k-state-selected');

				var helper = jQuery('<div class="draggingField" id="draggingField" />');

				return helper.append(item.clone().removeClass('k-state-selected'));
			},
			dragstart: function () {
				if (jQuery('#FieldListArea .dataArea li').length <= 1)
					return;

				jQuery('#FieldListArea .dataArea').addClass('k-state-dragging');
			},
			drag: function (e) {
				if (jQuery('#FieldListArea .dataArea li').length <= 1)
					return;

				var tbody = jQuery('#FieldListArea .dataArea ul'),
					tbodyOffset = tbody.offset(),
					dropLimitTop = tbodyOffset.top,
					dropLimitBottom = dropLimitTop + tbody.children().map(function () { return jQuery(this).outerHeight(); }).get().sum(),
					dropIndicator = jQuery('<span class="k-dirty" />'),
					y = e.clientY || e.y.client,
					dropIndex,
					state = jQuery('#FieldListArea').data('state');

				tbody.find('.k-dirty').remove();

				if (y <= dropLimitTop) {
					dropIndex = 0;
				}
				else if (y >= dropLimitBottom) {
					dropIndex = jQuery('li', tbody).length - 1;
					dropIndicator.addClass('revert');
				}
				else {
					dropIndex = Math.floor((y - dropLimitTop) / jQuery('#draggingField').outerHeight());
				}
				dropIndex = Math.max(0, dropIndex);
				tbody.children('li').eq(dropIndex).prepend(dropIndicator);

				state.drop.index = dropIndex;
				jQuery('#FieldListArea').data('state', state);
			},
			dragend: function () {

				if (jQuery('#FieldListArea .dataArea li').length <= 1)
					return;

				var state = jQuery('#FieldListArea').data('state'),
					row = jQuery('#FieldListArea .dataArea ul'),
					items = row.children();

				jQuery('.k-dirty', row).remove();
				jQuery('#draggingField').hide();

				if (state.drag.area !== state.drop.area || (state.drag.area === state.drop.area && state.drag.index !== state.drop.index)) {
					var dragElement = state.element;

					if (state.drop.index === items.length - 1 || items.length === 0) {
						row.append(dragElement);
					}
					else {
						row.children().eq(state.drop.index).before(dragElement);
					}

					// update drop data
					self.UpdateFieldsSettingDataByArea(enumHandlers.FIELDSETTINGAREA.DATA);
					self.UpdateFieldsSettingState();
					self.IsNeedResetLayout = true;
				}

				jQuery('#FieldListArea').find('.k-state-selected').removeClass('k-state-selected');
				jQuery('#FieldListArea .dataArea').removeClass('k-state-dragging');

				if (jQuery('#FieldListArea').hasClass('fieldListAreaChartGauge')) {
					self.SetGaugeChartMode(true);
				}

				jQuery(document).trigger('click.outside');

			}
		});
	};
	self.UpdateFieldsSettingDataByArea = function (area) {
		var areaName = self.GetAreaById(area),
			state = jQuery('#FieldListArea').data('state');

		jQuery('#FieldListArea .' + areaName + 'Area li').each(function (i, item) {
			jQuery.each(state.drop.data, function (index, field) {
				var fieldDetails = WC.Utility.ParseJSON(field.FieldDetails);
				fieldDetails.pivot_area = areaName;

				if (field.InternalID === item.id) {
					field.Bucket.field_type = self.GetBucketTypeAreaById(area);
					field.Area = area;
					field.Index = index;
					field.CssClass = areaName;
					field.FieldDetails = JSON.stringify(fieldDetails);
					index++;
				}
			});
		});
		jQuery('#FieldListArea').data('state', state);
	};
	self.UpdateFieldsSettingState = function () {

		self.UpdateSettingsAfterChange();

		self.SetApplyButtonStatus(true);
	};
	self.ShowAddFieldPopup = function (fieldArea) {
		if (!jQuery('#FieldListArea .' + fieldArea + 'Area .addFieldButton').hasClass('disabled')) {
			self.CurrentFieldArea = fieldArea;

			var angleBlocks = self.Handler.Models.Angle.Data().query_definition;
			var angleBaseClassBlock = angleBlocks.findObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.BASE_CLASSES);
			var angleQueryStepBlock = angleBlocks.findObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS);

			fieldsChooserHandler.ModelUri = self.Handler.Models.Angle.Data().model;
			fieldsChooserHandler.AngleClasses = angleBaseClassBlock ? angleBaseClassBlock.base_classes : [];
			fieldsChooserHandler.AngleSteps = angleQueryStepBlock ? angleQueryStepBlock.query_steps : [];
			fieldsChooserHandler.DisplaySteps = self.Handler.Models.DisplayQueryBlock.TempQuerySteps();
			fieldsChooserHandler.ShowPopup(fieldsChooserHandler.USETYPE.ADDAGGREGATION, fieldArea);
		}
	};
	self.ClearFieldSettings = function () {
		if (self.Handler) {
			self.Handler.FieldSettings = null;
		}
		self.FieldSettings = null;
	};

	// initial field, Appserver field -> field setting
	// params:
	// - data: field object from Appserver
	self.BuildAggregationFieldNameWithBucket = function (bucketValue, sourceField) {
		return bucketValue.toLowerCase() + "_" + sourceField;
	};
	self.GetFieldSettingModelByEAField = function (fieldJSON) {
		var fieldModel = new FieldModel();
		var currentArea = self.CurrentFieldArea;
		var fieldType = fieldJSON.fieldtype;
		var pivotArea = self.GetAreaByName(currentArea);
		var operatorValue = self.GetDefaultOperator(fieldType, pivotArea);
		var dataType = self.GetCorrectDataType(operatorValue, fieldType, pivotArea);
		var sourceField = fieldJSON.id;
		var fieldName = self.BuildAggregationFieldNameWithBucket(operatorValue, sourceField);
		var cssClassField = currentArea;
		var caption = self.GetFieldCaption(fieldJSON, operatorValue);
		var fieldDetails = {};

		// add new , field have only area
		fieldDetails[enumHandlers.FIELDDETAILPROPERTIES.PIVOTAREA] = currentArea;

		self.SetFieldDomain(fieldModel, fieldJSON);
		self.SetFieldModel(fieldModel, caption, caption, sourceField, operatorValue, fieldName, cssClassField, pivotArea, "", dataType);
		self.SetFieldFormat(fieldModel, fieldDetails);
		return fieldModel;

	};

	// get default operator
	// params:
	// - field: field object from Appserver
	// - area: area code
	self.GetDefaultOperator = function (fieldType, area) {
		if (area === enumHandlers.FIELDSETTINGAREA.DATA) {
			if (fieldType.toLowerCase() === enumHandlers.FIELDTYPE.TIME)
				return enumHandlers.AGGREGATION.AVERAGE.Value;
			else
				return enumHandlers.AGGREGATION.SUM.Value;
		}
		else {
			var operator;
			switch (fieldType.toLowerCase()) {
				case enumHandlers.FIELDTYPE.PERIOD:
				case enumHandlers.FIELDTYPE.TIMESPAN:
					operator = 'week';
					break;

				case enumHandlers.FIELDTYPE.DATE:
				case enumHandlers.FIELDTYPE.DATETIME:
					operator = 'quarter';
					break;

				case enumHandlers.FIELDTYPE.CURRENCY:
				case enumHandlers.FIELDTYPE.NUMBER:
				case enumHandlers.FIELDTYPE.INTEGER:
				case enumHandlers.FIELDTYPE.DOUBLE:
					operator = 'power10_3';
					break;

				case enumHandlers.FIELDTYPE.PERCENTAGE:
					operator = 'power10_1';
					break;

				case enumHandlers.FIELDTYPE.TIME:
					operator = 'hour';
					break;

				default:
					operator = 'individual';
			}
			return operator;
		}
	};

	self.GetCorrectDataType = function (bucket, fieldType, area) {
		if (area === enumHandlers.FIELDSETTINGAREA.DATA) {
			fieldType = dataTypeModel.GetCorrectDataType(bucket, fieldType);
		}
		return fieldType;
	};

	// create caption
	// params:
	// - fields: fields object from Appserver
	self.GetFieldCaption = function (field, operator) {
		if (!field)
			return '';

		var caption = '';
		var bucketDescription = self.GetBucketDescriptionByValue(operator);
		if (field.source) {
			var source = modelFieldSourceHandler.GetFieldSourceByUri(field.source);

			/* M4-12830: Show only the field name if source and field name are duplicated */
			if (source && source.short_name.toLowerCase() !== field.short_name.toLowerCase()) {
				caption = userFriendlyNameHandler.GetFriendlyName(source, enumHandlers.FRIENDLYNAMEMODE.SHORTNAME) + ' - ';
			}
		}

		caption += userFriendlyNameHandler.GetFriendlyName(field, enumHandlers.FRIENDLYNAMEMODE.SHORTNAME);

		return jQuery.trim(caption + ' ' + bucketDescription);
	};

	// create bucket description
	// params:
	// - operator: bucket operator
	self.GetBucketDescriptionByValue = function (operator) {
		operator = (operator || '').toLowerCase();

		var description;
		if (operator === 'none' || operator === 'individual')
			description = '';

		else if (operator === 'left1')
			description = Localization.Pivot_Bucket_FirstCharacter;
		else if (/^left\d+$/.test(operator))
			description = kendo.format(Localization.Pivot_Bucket_FirstCharacters, operator.replace('left', ''));

		else if (operator === 'right1')
			description = Localization.Pivot_Bucket_LastCharacter;
		else if (/^right\d+$/.test(operator))
			description = kendo.format(Localization.Pivot_Bucket_LastCharacters, operator.replace('right', ''));

		else if (/^power10_min\d+$/.test(operator)) {
			var powerNumber = operator.replace('power10_min', '');
			description = kendo.toString(1 / Math.pow(10, powerNumber), "n" + powerNumber);
		}
		else if (/^power10_\d+$/.test(operator)) {
			var formatter = new Formatter({ prefix: null, thousandseparator: true }, enumHandlers.FIELDTYPE.INTEGER);
			description = WC.FormatHelper.GetFormattedValue(formatter, Math.pow(10, operator.replace('power10_', '')));
		}

		else if (operator === 'hour')
			description = Localization.Pivot_Bucket_PerHour;
		else if (operator === 'day')
			description = Localization.Pivot_Bucket_PerDay;
		else if (operator === 'week')
			description = Localization.Pivot_Bucket_PerWeek;
		else if (operator === 'month')
			description = Localization.Pivot_Bucket_PerMonth;
		else if (operator === 'quarter')
			description = Localization.Pivot_Bucket_PerQuarter;
		else if (operator === 'trimester')
			description = Localization.Pivot_Bucket_PerTrimester;
		else if (operator === 'semester')
			description = Localization.Pivot_Bucket_PerSemester;
		else if (operator === 'year')
			description = Localization.Pivot_Bucket_PerYear;

		else if (operator === enumHandlers.AGGREGATION.MAX.Value)
			description = enumHandlers.AGGREGATION.MAX.Text;
		else if (operator === enumHandlers.AGGREGATION.MIN.Value)
			description = enumHandlers.AGGREGATION.MIN.Text;
		else if (operator === enumHandlers.AGGREGATION.SUM.Value)
			description = enumHandlers.AGGREGATION.SUM.Text;
		else if (operator === enumHandlers.AGGREGATION.AVERAGE.Value)
			description = enumHandlers.AGGREGATION.AVERAGE.Text;
		else if (operator === enumHandlers.AGGREGATION.AVERAGE_VALID.Value)
			description = enumHandlers.AGGREGATION.AVERAGE_VALID.Text;
		else if (operator === enumHandlers.AGGREGATION.COUNT_VALID.Value)
			description = enumHandlers.AGGREGATION.COUNT_VALID.Text;

		if (description)
			description = ' [' + description + ']';

		return description;
	};

	// set fields
	self.SetFields = function (fields) {
		if (typeof fields === 'string')
			fields = JSON.parse(fields);

		jQuery.each(fields, function (index, field) {
			self.SetField(field);
		});
	};

	// set field
	// params:
	// - field: field from field settings
	self.SetField = function (field) {
		var area = self.GetAreaById(field.Area);
		var btnDelete = '';
		var label;

		if (field.FieldName === enumHandlers.AGGREGATION.COUNT.Value) {
			var checkbox = jQuery('<input type="checkbox" id="chkCount" />')
				.prop('checked', field.IsSelected)
				.click(function (e) {
					e.stopPropagation();

					self.SelectedCountCheckbox();

					if (jQuery('#FieldListArea').hasClass('fieldListAreaChartGauge')) {
						self.SetGaugeChartMode(true);
					}
				});
			label = jQuery('<label />').click(function (e) {
				e.stopPropagation();
			}).append(checkbox).append('<span class="label">' + field.Caption + '</span>');
		}
		else {
			btnDelete = jQuery('<a class="btnDelete" />').on('click', field, function (e) {
				e.stopPropagation();

				self.RemoveField(e.data);
				self.UpdateSettingsAfterChange();
				self.SetApplyButtonStatus(true);
				if (jQuery('#FieldListArea').hasClass('fieldListAreaChartGauge')) {
					self.SetGaugeChartMode(true);
				}

				e.preventDefault();
			});
			label = jQuery([
				'<span class="fieldName">',
				'<span class="caption">' + htmlEncode(field.Caption) + '</span>',
				'<span class="hint">' + (field.Caption !== field.DefaultCaption ? field.DefaultCaption : '') + '</span>',
				'</span>'
			].join(''));
		}

		var list = jQuery('<li />')
			.attr({
				'id': field.InternalID,
				'class': 'itemField ' + WC.Utility.ToString(field.CssClass) + (!field.Valid ? ' validError' : (self.Handler.Models.Result.Data().authorizations.change_field_collection ? '' : ' noDrag')),
				'title': WC.Utility.ToString(field.ValidError)
			})
			.on('click', field, function (e) {
				e.stopPropagation();

				jQuery(document).trigger('click');
				if (e.data.Valid) {
					self.ShowFieldOptionsMenu(this, e.data.InternalID, 'fieldSettingsHandler');
				}

				e.preventDefault();
			})
			.append(label);

		// add field info icon
		if (field.FieldName !== enumHandlers.AGGREGATION.COUNT.Value) {
			var fielDetail = jQuery('<span />')
				.attr({
					'class': 'btnInfo'
				})
				.on('click', field, function (e) {
					e.stopPropagation();

					helpTextHandler.ShowHelpTextPopup(e.data.SourceField, helpTextHandler.HELPTYPE.FIELD, self.Handler.Models.Angle.Data().model);

					e.preventDefault();
				});

			list.append(fielDetail);
		}

		if (self.FieldSettings.DisplayType === self.FieldSettings.ComponentType.CHART
			&& field.Area === enumHandlers.FIELDSETTINGAREA.DATA) {
			var btnSort = jQuery('<a class="btnSort" />')
				.addClass(field.SortDirection)
				.on('click', field, function (e) {
					e.stopPropagation();

					if (!jQuery(this).hasClass('disabled')) {
						self.ApplySorting(e.data.InternalID);
					}

					e.preventDefault();
				});
			list.append(btnSort);
		}


		if (self.Handler.Models.Result.Data().authorizations.change_field_collection) {
			list.append(btnDelete);
		}

		jQuery('#FieldListArea .' + area + 'Area ul').append(list);
	};

	self.ClearSortBySummary = function (isUpdateHandler) {
		var fieldsSettingsDetails = JSON.parse(self.FieldSettings.DisplayDetails);
		delete fieldsSettingsDetails.sort_by_summary_info;
		var newDisplayDetails = JSON.stringify(fieldsSettingsDetails);

		// update to this
		self.FieldSettings.SortBySummaryInfo = [];
		self.FieldSettings.DisplayDetails = newDisplayDetails;

		// update to handler
		if (isUpdateHandler === true) {
			self.Handler.FieldSettings.SortBySummaryInfo = [];
			self.Handler.FieldSettings.DisplayDetails = newDisplayDetails;
		}
	};

	// add fields from field chooser
	// params:
	// - fields: fields object from Appserver
	self.AddFields = function (fields) {
		fields = JSON.parse(JSON.stringify(fields));

		// remove duplicated fields
		var area = self.GetAreaByName(self.CurrentFieldArea);
		jQuery.each(self.FieldSettings.GetFields(), function (index, item) {
			if (area !== enumHandlers.FIELDSETTINGAREA.DATA && item.Area !== enumHandlers.FIELDSETTINGAREA.DATA) {
				fields.removeObject('id', item.SourceField);
			}
		});

		if (!fields.length) {
			return;
		}

		//clear layout if add new field
		self.IsNeedResetLayout = true;

		modelFieldsHandler.SetFields(fields);

		jQuery('#FieldListArea').busyIndicator(true);
		modelFieldsHandler.LoadFieldsMetadata(fields)
			.done(function () {
				// clear fields in area before add
				if (self.Handler.Models.Display.Data().display_type === enumHandlers.DISPLAYTYPE.CHART) {
					var fieldsModel = self.FieldSettings.GetFields(area),
						chartFields, fieldLimit;
					if (area !== enumHandlers.FIELDSETTINGAREA.DATA) {
						fieldLimit = 1;
						chartFields = [fields[0]];
					}
					else {
						if (self.FieldSettings.GetDisplayDetails().multi_axis) {
							fieldLimit = 3;
						}
						else {
							fieldLimit = 2;
						}
						chartFields = fields.slice(0, fieldLimit - 1);
					}
					fields = chartFields;

					var removeFieldCount = fields.length + fieldsModel.length - fieldLimit;
					var index = fieldsModel.length - 1;
					while (removeFieldCount > 0) {
						if (fieldsModel[index].FieldName !== enumHandlers.AGGREGATION.COUNT.Value) {
							self.RemoveField(fieldsModel[index]);
							removeFieldCount--;
						}
						index--;
					}
				}

				var field;
				jQuery.each(fields, function (index, item) {
					field = self.GetFieldSettingModelByEAField(item);
					self.FieldSettings.AddField(field);
					self.SetField(field);
				});

				self.UpdateSettingsAfterChange();
				self.SetApplyButtonStatus(fields.length !== 0);
				if (jQuery('#FieldListArea').hasClass('fieldListAreaChartGauge')) {
					self.SetGaugeChartMode(true);
				}
				jQuery('#FieldListArea').busyIndicator(false);
			});
	};

	// remove field from ui
	// params:
	// - field: field from field settings
	self.RemoveField = function (field) {
		//clear layout if remove field
		self.IsNeedResetLayout = true;
		self.RemoveAllBucketPopup();
		self.HideFieldOptionsMenu();
		self.FieldSettings.DeleteField(field);
		jQuery('#' + field.InternalID).remove();
	};

    self.SetPeriodFormat = function (field) {
        if (field.Area === enumHandlers.FIELDSETTINGAREA.DATA)
            field.CellFormatType = enumHandlers.DEVXPRESSFORMATTYPE.NUMERIC;
        else
            field.CellFormatType = enumHandlers.DEVXPRESSFORMATTYPE.CUSTOM;

        field.CellFormat = '0';
	};

	self.SetTimeFormat = function (field, fieldDetails) {
		var fakeFieldTime = {
			field: field.SourceField,
			field_details: JSON.stringify(fieldDetails)
		};
		var fieldTimeFormatter = new FieldFormatter(fakeFieldTime, self.Handler.Models.Angle.Data().model);
		var fieldTimeSettings = WC.FormatHelper.GetFieldFormatSettings(fieldTimeFormatter, true);
		var timeFormat = WC.FormatHelper.GetFormatter(fieldTimeSettings);

		field.CellFormatType = enumHandlers.DEVXPRESSFORMATTYPE.DATETIME;
		field.CellFormat = timeFormat;
	};

	self.SetTimeSpanFormat = function (field, fieldDetails) {
		var fakeFieldTime = {
			field: field.SourceField,
			field_details: JSON.stringify(fieldDetails)
		};
		var fieldTimeFormatter = new FieldFormatter(fakeFieldTime, self.Handler.Models.Angle.Data().model);
		var fieldTimeSettings = WC.FormatHelper.GetFieldFormatSettings(fieldTimeFormatter, true);
		var timeFormat = WC.FormatHelper.GetFormatter(fieldTimeSettings);

		field.CellFormatType = enumHandlers.DEVXPRESSFORMATTYPE.CUSTOM;
		field.CellFormat = timeFormat;
	};

	self.SetDateFormat = function (field) {
		switch (field.Bucket.Operator) {
			case "trimester":
				field.CellFormat = "t";
				field.CellFormatType = enumHandlers.DEVXPRESSFORMATTYPE.CUSTOM;
				break;
			case "semester":
				field.CellFormat = "s";
				field.CellFormatType = enumHandlers.DEVXPRESSFORMATTYPE.CUSTOM;
				break;
			case "quarter":
				field.CellFormat = "q";
				field.CellFormatType = enumHandlers.DEVXPRESSFORMATTYPE.CUSTOM;
				break;
			case "year":
				var dateDefaultSettings = WC.FormatHelper.GetUserDefaultFormatSettings(enumHandlers.FIELDTYPE.DATE);
				field.CellFormat = dateDefaultSettings.year;
				field.CellFormatType = enumHandlers.DEVXPRESSFORMATTYPE.DATETIME;
				break;
			case "month":
				field.CellFormat = userSettingModel.GetMonthBucketTemplate();
				field.CellFormatType = enumHandlers.DEVXPRESSFORMATTYPE.DATETIME;
				break;
			case "week":
				field.CellFormat = WC.FormatHelper.GetUserDefaultFormatter(enumHandlers.FIELDTYPE.DATE);
				field.CellFormatType = enumHandlers.DEVXPRESSFORMATTYPE.CUSTOM;
				break;
			default:
				field.CellFormat = WC.FormatHelper.GetUserDefaultFormatter(enumHandlers.FIELDTYPE.DATE);
				field.CellFormatType = enumHandlers.DEVXPRESSFORMATTYPE.DATETIME;
				break;
		}
	};

	self.SetEnumFormat = function (field, format) {
		field.CellFormatType = enumHandlers.DEVXPRESSFORMATTYPE.CUSTOM;
		field.CellFormat = format;
	};

	self.GetStandardNumberFormat = function (formatter) {
		var format = WC.FormatHelper.GetFormatter(formatter);
		if (format.indexOf(' \\%') !== -1)
			format = format.replace(' \\%', ' %');

		var useDecimal = format.indexOf('.') !== -1;
		if (WC.FormatHelper.IsFormatContainUnit(format, 'K'))
			format = useDecimal ? format.replace('.', ',.') : format.replace(' K', ', K');
		else if (WC.FormatHelper.IsFormatContainUnit(format, 'M'))
			format = useDecimal ? format.replace('.', ',,.') : format.replace(' M', ',, M');

		return format;
	};
	self.SetNumberFormat = function (field, formatter) {
		if (field.Area === enumHandlers.FIELDSETTINGAREA.DATA) {
			field.CellFormatType = enumHandlers.DEVXPRESSFORMATTYPE.NUMERIC;
		}
		else {
			field.CellFormatType = enumHandlers.DEVXPRESSFORMATTYPE.CUSTOM;
		}
		field.CellFormat = self.GetStandardNumberFormat(formatter);
	};

	self.SetFieldFormat = function (field, fieldDetails) {
		field.CellFormatType = enumHandlers.DEVXPRESSFORMATTYPE.CUSTOM;
		field.CellFormat = '';

		var dataType = field.DataType;

		if (WC.FormatHelper.IsDateOrDateTime(dataType)) {
			self.SetDateFormat(field);
		}
		else if (dataType === enumHandlers.FIELDTYPE.TIME) {
			self.SetTimeFormat(field, fieldDetails);
		}
		else if (dataType === enumHandlers.FIELDTYPE.TIMESPAN) {
			self.SetTimeSpanFormat(field, fieldDetails);
		}
		else {
			var fakeFieldId = field.SourceField || field.FieldName;
			var modelUri = self.Handler.Models.Angle.Data().model;
			var eaFieldSettings = modelFieldsHandler.GetModelFieldSettings(fakeFieldId, modelUri);

			var fakeFieldSettings = jQuery.extend({}, eaFieldSettings, fieldDetails);
			var fakeField = {
				id: fakeFieldId,
				fieldtype: dataType,
				user_specific: {
					user_settings: JSON.stringify(fakeFieldSettings)
				}
			};

			var fieldFormatter = new FieldFormatter(fakeField, modelUri);
			var tempFormat = WC.FormatHelper.GetFieldFormatSettings(fieldFormatter, true);

			if (WC.FormatHelper.IsNumberFieldType(dataType)
				|| (dataType === enumHandlers.FIELDTYPE.PERIOD && field.Area === enumHandlers.FIELDSETTINGAREA.DATA)) {
				self.SetNumberFormat(field, tempFormat);
			}
			else if (dataTypeModel.IsEnumDataType(field.Bucket.Operator, dataType)) {
				self.SetEnumFormat(field, tempFormat.format);
			}
			else if (dataType === enumHandlers.FIELDTYPE.PERIOD) {
				self.SetPeriodFormat(field);
			}
		}
	};

	self.SetFieldDomain = function (field, eaField) {
		if (eaField && eaField.domain) {
			field.IsDomain = true;
			field.DomainURI = eaField.domain;

			// Get maybe sorted, default is true
			field.MayBeSorted = true;
			var domain = modelFieldDomainHandler.GetFieldDomainByUri(eaField.domain);
			if (domain && !domain.may_be_sorted) {
				field.MayBeSorted = false;
			}
		}
	};

	self.SetBucketModel = function (field, sourceField, fieldName, defaultOperator) {
		field.Bucket = new BucketModel();
		field.Bucket.field_type = self.GetBucketTypeAreaById(field.Area);

		if (fieldName.toLowerCase() === enumHandlers.AGGREGATION.COUNT.Value) {
			delete field.Bucket.source_field;
			field.Bucket.Operator = enumHandlers.AGGREGATION.COUNT.Value;
		}
		else {
			field.Bucket.source_field = sourceField;
			field.Bucket.Operator = defaultOperator || field.Operator;
		}
	};

	self.SetFieldModel = function (field, defaultCaption, caption, sourceField, operatorValue, fieldName, cssClass, area, defaultOperator, fieldType, isIncludedInPivotSettings, isSelected) {
		field.Area = area;
		field.SourceField = sourceField;
		field.InternalID = jQuery.GUID();
		field.Caption = caption;
		field.DefaultCaption = defaultCaption;
		field.FieldName = fieldName;
		field.CssClass = cssClass;
		field.DataType = fieldType;
		field.Operator = operatorValue;
		if (!IsNullOrEmpty(isSelected)) {
			field.IsSelected = isSelected;
		}
		self.SetBucketModel(field, sourceField, fieldName, defaultOperator);
	};

	self.GetFieldSettingModel = function (index, fieldJSON, isAggregationField) {
		var fieldModel = new FieldModel();

		var sourceField = fieldJSON.source_field;
		var operatorValue = fieldJSON.operator;
		var fieldName = fieldJSON.field;

		var cssClassField = '';
		var isNeedDefaultPosition = false;
		var fieldArea = enumHandlers.FIELDSETTINGAREA.DATA;
		var aliasName = '';
		var displayField = self.Handler.Models.Display.GetDisplayFieldByFieldName(fieldName);
		var modelUri = self.Handler.Models.Angle.Data().model;
		var fieldMetaDataObject = modelFieldsHandler.GetFieldById(fieldName, modelUri);
		var currentUserLang = userSettingModel.GetByName(enumHandlers.USERSETTINGS.DEFAULT_LANGUAGES);
		var fieldType = fieldMetaDataObject ? fieldMetaDataObject.fieldtype : null;

		// multi_lang_alias or alias
		if (displayField) {
			if (displayField.multi_lang_alias && displayField.multi_lang_alias.length) {
				fieldModel.MultiLangAlias = displayField.multi_lang_alias;
				var aliasNameForCurrentLang = fieldModel.MultiLangAlias.findObject('lang', currentUserLang);
				if (aliasNameForCurrentLang) {
					aliasName = aliasNameForCurrentLang.text;
				}
			}
			else if (displayField.alias) {
				aliasName = displayField.alias;
			}
		}

		// field_details
		var fieldDetailObject;
		if (displayField && displayField.field_details) {
			fieldDetailObject = WC.Utility.ParseJSON(displayField.field_details);

			if (!isAggregationField) {
				if (fieldDetailObject.pivot_area) {
					fieldArea = self.GetAreaByName(fieldDetailObject.pivot_area);
				}
				else {
					isNeedDefaultPosition = true;
				}
			}
		}
		else {
			fieldDetailObject = {};
			isNeedDefaultPosition = true;
		}

		// sorting
		if (isAggregationField && fieldDetailObject.sorting) {
			self.SortDirection = fieldDetailObject.sorting;
		}

		// area
		if (!isAggregationField && isNeedDefaultPosition) {
			if (index === 1) {
				fieldArea = enumHandlers.FIELDSETTINGAREA.ROW;
			}
			else {
				fieldArea = enumHandlers.FIELDSETTINGAREA.COLUMN;
			}
		}

		// css
		cssClassField += self.GetAreaById(fieldArea);

		var caption, defaultCaption;
		if (isAggregationField && fieldName === enumHandlers.AGGREGATION.COUNT.Value) {
			// set count field
			caption = enumHandlers.AGGREGATION.COUNT.Text;
			defaultCaption = enumHandlers.AGGREGATION.COUNT.Text;
		}
		else {
			// set caption and domain
			var modelUri = self.Handler.Models.Angle.Data().model;
			var eaField = modelFieldsHandler.GetFieldById(sourceField, modelUri);
			if (!fieldType && eaField) {
				fieldType = eaField.fieldtype;
			}
			defaultCaption = eaField ? self.GetFieldCaption(eaField, operatorValue) : fieldName;
			caption = aliasName || defaultCaption;
			self.SetFieldDomain(fieldModel, eaField);
		}

		// check field type
		var dataType = self.GetCorrectDataType(operatorValue, fieldType, fieldArea);

		fieldModel.Index = index;
		fieldModel.FieldDetails = JSON.stringify(fieldDetailObject);
		self.SetFieldModel(fieldModel, defaultCaption, caption, sourceField, operatorValue, fieldName, cssClassField, fieldArea, '', dataType, true, true);
		self.SetFieldFormat(fieldModel, fieldDetailObject);
		self.SetSorting(fieldModel, fieldDetailObject.sorting);
		if (displayField) {
			fieldModel.Valid = displayField.valid !== false;
			fieldModel.ValidError = validationHandler.GetValidationError(displayField, self.Handler.Models.Angle.Data().model);
		}
		else {
			fieldModel.Valid = true;
			fieldModel.ValidError = "";
		}
		return fieldModel;
	};

	self.BuildFieldsSettings = function (options) {

		var displayType = self.Handler.Models.Display.Data().display_type;
		var componentId = self.Handler.ModelId;

		// pivot:1, chart:2
		var displayTypeEnum;

		var isDashBoard = self.Handler.DashBoardMode();
		var isReadOnly = false;
		var queryFielsURI = self.Handler.Models.Result.Data().query_fields;
		var anglePrivilege = JSON.stringify(userModel.GetAnglePrivilegeByUri(self.Handler.Models.Angle.Data().uri));
		var aggregationQuerySteps = self.Handler.Models.DisplayQueryBlock.GetQueryStepByType(enumHandlers.FILTERTYPE.AGGREGATION);
		var sortbySummaryInfo = [];
		var isUseSavedDisplayData = false;

		// display_details
		var displayDetails = WC.Utility.ParseJSON(self.Handler.Models.Display.Data().display_details);

		if (displayType === enumHandlers.DISPLAYTYPE.PIVOT) {
			displayTypeEnum = 1;
			componentId = self.Handler.PivotId;
			isReadOnly = self.Handler.ReadOnly();

			if (typeof displayDetails.show_total_for === 'undefined')
				displayDetails.show_total_for = 1;
			var showTotalFor = displayDetails.show_total_for;

			if (typeof displayDetails.percentage_summary_type === 'undefined')
				displayDetails.percentage_summary_type = 0;
			var percentageSummaryType = displayDetails.percentage_summary_type;

			if (typeof displayDetails.include_subtotals === 'undefined')
				displayDetails.include_subtotals = false;
			var isIncludeSubtotals = displayDetails.include_subtotals;

			if (displayDetails.sort_by_summary_info !== undefined) {
				sortbySummaryInfo = JSON.parse(displayDetails.sort_by_summary_info);
			}

			isUseSavedDisplayData = !pivotPageHandler.IsUnSavePivot;
		}
		else if (displayType === enumHandlers.DISPLAYTYPE.CHART) {
			displayTypeEnum = 0;
		}

		if (self.Handler.Models.Display.Data().display_type === enumHandlers.DISPLAYTYPE.CHART && !displayDetails.chart_type) {
			displayDetails = {
				chart_type: enumHandlers.CHARTTYPE.COLUMNCHART.Code,
				stack: false,
				multi_axis: false
			};
		}

		if (!displayDetails.count_index) {
			displayDetails.count_index = 0;
		}

		var layout = self.IsNeedResetLayout ? null : displayDetails.layout || null;
		var fieldSettingsModel = new FieldSettingsModel();
		fieldSettingsModel.Id = self.FieldSettings === null ? jQuery.GUID() : self.FieldSettings.Id;
		fieldSettingsModel.ComponentId = componentId;
		fieldSettingsModel.CultureName = userSettingModel.GetUserLocalCultureName();
		fieldSettingsModel.DisplayType = displayTypeEnum;
		fieldSettingsModel.IsReadOnlyMode = isReadOnly;
		fieldSettingsModel.IsDashBoardMode = isDashBoard;
		fieldSettingsModel.IsCalledBack = false;
		fieldSettingsModel.QuerySteps = '';
		fieldSettingsModel.ResultUri = self.Handler.Models.Result.Data().uri;
		fieldSettingsModel.DataRowsUri = self.Handler.Models.Result.Data().data_rows;
		fieldSettingsModel.RowCount = self.Handler.Models.Result.Data().row_count || 0;
		fieldSettingsModel.QueryFieldsUri = queryFielsURI;
		fieldSettingsModel.AnglePrivilege = anglePrivilege;
		fieldSettingsModel.DefaultCurrency = userSettingModel.Data().default_currency;
		fieldSettingsModel.TotalForType = showTotalFor;
		fieldSettingsModel.IsIncludeSubTotals = isIncludeSubtotals;
		fieldSettingsModel.PercentageSummaryType = percentageSummaryType;
		fieldSettingsModel.DisplayDetails = JSON.stringify(displayDetails);
		fieldSettingsModel.Layout = layout;
		fieldSettingsModel.IsNeedResetLayout = self.IsNeedResetLayout;
		fieldSettingsModel.SortBySummaryInfo = sortbySummaryInfo;
		fieldSettingsModel.IsUseSavedDisplayData = isUseSavedDisplayData;
		fieldSettingsModel.MaxPageSize = self.DetermineMaxPageSize(self.Handler.Models.Angle.Data().model, displayType);
		fieldSettingsModel.RequestsPerGroup = self.GetRequestsPerGroup(self.Handler.Models.Angle.Data().model);
		fieldSettingsModel.FirstDayOfWeek = WC.DateHelper.GetFirstDayOfWeek(self.Handler.Models.Angle.Data().model);

		if (options) {
			jQuery.extend(fieldSettingsModel, options);
		}

		self.FieldSettings = fieldSettingsModel;

		// fields
		var fields = [], groupFieldCount = 0;
		if (aggregationQuerySteps.length) {
			if (aggregationQuerySteps[0].grouping_fields) {
				jQuery.each(aggregationQuerySteps[0].grouping_fields, function (index, groupingField) {
					var fieldModel = self.GetFieldSettingModel(index + 1, groupingField, false);
					fields.push(fieldModel);
					groupFieldCount++;
				});
			}
			jQuery.each(aggregationQuerySteps[0].aggregation_fields, function (index, aggregationfield) {
				var fieldModel = self.GetFieldSettingModel(index + 1, aggregationfield, true);
				fields.push(fieldModel);
			});
		}

		// check count is alway in field setting
		var countFieldModelIndex = fields.indexOfObject('FieldName', enumHandlers.AGGREGATION.COUNT.Value);
		if (countFieldModelIndex === -1) {
			var fieldModel = new FieldModel();
			var fieldName = enumHandlers.AGGREGATION.COUNT.Value;
			var sourceField = undefined;
			var fieldCaption = enumHandlers.AGGREGATION.COUNT.Text;
			var operatorValue = enumHandlers.AGGREGATION.COUNT.Value;

			self.SetFieldModel(fieldModel, fieldCaption, fieldCaption, sourceField, operatorValue, fieldName, 'data', enumHandlers.FIELDSETTINGAREA.DATA, '', enumHandlers.FIELDTYPE.INTEGER, false, false);
			self.SetFieldFormat(fieldModel, {});
			fields.splice(Math.min(groupFieldCount + displayDetails.count_index, fields.length), 0, fieldModel);
		}

		fieldSettingsModel.Fields = JSON.stringify(fields);
		self.Handler.FieldSettings = new FieldSettingsModel(fieldSettingsModel);

		// keep last chart scale info
		self.SetLastChartScaleInfo();
	};
	self.BuildFieldsSettingsHtml = function () {
		var type;
		if (displayModel.Data().display_type === enumHandlers.DISPLAYTYPE.PIVOT) {
			type = self.FIELDSETTINGTYPE.PIVOT;
		}
		else {
			var displayDetails = self.FieldSettings.GetDisplayDetails();
			if (displayDetails.chart_type === enumHandlers.CHARTTYPE.GAUGE.Code)
				type = self.FIELDSETTINGTYPE.CHARTGAUGE;
			else
				type = self.FIELDSETTINGTYPE.CHART;
		}
		self.SetTemplate(type);
		self.SetFields(self.FieldSettings.Fields);
		if (type !== self.FIELDSETTINGTYPE.PIVOT) {
			self.SetGaugeChartMode(type === self.FIELDSETTINGTYPE.CHARTGAUGE);
		}
		self.SetApplyButtonStatus(false);
		self.InitialFieldsSetting();
		self.InitialCountBehavior();
		self.UpdateSettingLayout();
		self.UpdateSortableArea();

		if (typeof self.CollapseState[self.Handler.Models.Display.Data().uri] === 'undefined') {
			self.CollapseState[self.Handler.Models.Display.Data().uri] = Modernizr.touch && !Modernizr.mouse;
		}
		if (self.CollapseState[self.Handler.Models.Display.Data().uri]) {
			jQuery('#AngleTableWrapper .displayWrapper').addClass('full');
			self.CollapseState[self.Handler.Models.Display.Data().uri] = true;
		}
		else {
			jQuery('#AngleTableWrapper .displayWrapper').removeClass('full');
			self.CollapseState[self.Handler.Models.Display.Data().uri] = false;
		}

		if (!self.Handler.Models.Result.Data().authorizations.change_field_collection) {
			jQuery('#FieldListArea .addFieldButton').addClass('disabled');

			jQuery('#ButtonDisplayOptions').addClass('disabled');
			var ddlChartType = WC.HtmlHelper.DropdownList('#ChartType');
			if (ddlChartType) {
				ddlChartType.enable(false);
			}

			var ddlShowTotoalFor = WC.HtmlHelper.DropdownList('#ShowTotalFor');
			if (ddlShowTotoalFor) {
				ddlShowTotoalFor.enable(false);
			}

			var ddlPercentageSummary = WC.HtmlHelper.DropdownList('#PercentageSummaryDropDown');
			if (ddlPercentageSummary) {
				ddlPercentageSummary.enable(false);
			}
		}

		//To disable display Options button
		self.SetDisplayOptionsButtonStatus();
	};
	self.GetRequestsPerGroup = function (modelUri) {
		// EA4IT model need to specific number of requests per group
		var currentModel = modelsHandler.GetModelByUri(modelUri);
		return currentModel && currentModel.id === 'EA4IT' ? 4 : 0;
	};
	self.DetermineMaxPageSize = function (modelUri, displayType) {
		// EA4IT model for pivot display need to send the MAX page size for request
		// 157K objects, for pagesize 1000 take 11 minutes but pagesize 5000 take 2.5 minutes
		var currentModel = modelsHandler.GetModelByUri(modelUri);
		return (currentModel && currentModel.id === 'EA4IT' && displayType === enumHandlers.DISPLAYTYPE.PIVOT) ? systemSettingHandler.GetApplicationServerMaxPageSize() : systemSettingHandler.GetMaxPageSize();
	};
	self.ShowLoadingIndicator = function () {
		jQuery('#FieldListArea').busyIndicator(true);
	};
	self.HideLoadingIndicator = function () {
		jQuery('#FieldListArea').busyIndicator(false);
	};
	self.ResetFieldSettings = function () {
		self.FieldSettings = new FieldSettingsModel(self.Handler.FieldSettings);
		self.BuildFieldsSettingsHtml();
		self.IsChangeFieldsSetting = false;
	};
	self.SetReadOnlyMode = function () {
		if (!self.Handler.Models.Display.Data().authorizations.update) {
			jQuery('#AngleTableWrapper .displayWrapper').addClass('full readonly');
		}
		else {
			jQuery('#AngleTableWrapper .displayWrapper').removeClass('full readonly');
		}
	};
	self.InitialCountBehavior = function () {
		var displayDetails = self.FieldSettings.GetDisplayDetails();
		var fields = self.FieldSettings.GetFields(enumHandlers.FIELDSETTINGAREA.DATA);
		var countField = fields.findObject('FieldName', enumHandlers.AGGREGATION.COUNT.Value);
		var countCheckbox = jQuery("#chkCount");

		if (countField) {
			countCheckbox.prop('checked', countField.IsSelected);
			var canSort = self.Handler.Models.Result.Data().authorizations.change_field_collection && countField.Valid;
			if (!canSort || !countField.IsSelected) {
				countCheckbox.parents('li:first').find('.btnSort').addClass('disabled');
			}
			else {
				countCheckbox.parents('li:first').find('.btnSort').removeClass('disabled');
			}
		}

		if (fields.length === 1) {
			countCheckbox.prop('disabled', true);
		}
		else {
			if (displayDetails.chart_type) {
				if (displayDetails.chart_type === enumHandlers.CHARTTYPE.BUBBLECHART.Code) {
					countCheckbox.prop('disabled', true);
				}
				else if (displayDetails.multi_axis) {
					countCheckbox.prop('disabled', fields.length <= 2);
				}
				else {
					countCheckbox.prop('disabled', fields.length <= 1);
				}
			}
			else {
				countCheckbox.prop('disabled', false);
			}
		}

		if (!self.Handler.Models.Result.Data().authorizations.change_field_collection) {
			countCheckbox.prop('disabled', true);
		}
	};
	self.ToggleFieldListArea = function () {
		self.Handler.ToggleFieldListArea();
	};
	self.ValidateDataArea = function () {
		var dataAreaWarningMessage = null;
		var dataAreaFields = self.FieldSettings.GetFields(enumHandlers.FIELDSETTINGAREA.DATA);
		if (dataAreaFields.length > 0) {
			var dataAreaCount = dataAreaFields.length;
			for (var i = 0; i < dataAreaCount; i++) {
				if (dataAreaFields.findObjects('FieldName', dataAreaFields[i].FieldName).length > 1) {
					dataAreaWarningMessage = Localization.FieldSettingWarningMessageNotAllowSameFieldSameBucketInDataArea;
					break;
				}
			}
		}
		return dataAreaWarningMessage;
	};
	self.ApplySettings = function () {

		if (jQuery('#btnFieldSettingApply').hasClass('disabled'))
			return;

		if (self.FieldSettings.GetFields().hasObject('Valid', false)) {
			popup.Alert(Localization.Warning_Title, Localization.Info_PleaseRemoveAllInvalidFieldsInAggArea);
			return;
		}

		var isChart = self.Handler.Models.Display.Data().display_type === enumHandlers.DISPLAYTYPE.CHART;
		if (isChart && (self.FieldSettings.GetFields(enumHandlers.FIELDSETTINGAREA.ROW).length > 1 || self.FieldSettings.GetFields(enumHandlers.FIELDSETTINGAREA.COLUMN).length > 1)) {
			popup.Alert(Localization.Warning_Title, Localization.Info_ChartCanHaveOnlyOneFieldInCategories);
			return;
		}

		self.SetApplyButtonStatus(false);

		if (!self.CheckValidateFieldSettings()) {
			self.IsNeedResetLayout = true;
			self.SetApplyButtonStatus(true);
			return;
		}

		if (self.IsNeedResetLayout)
			self.ClearSortBySummary(true);

		self.IsChangeFieldsSetting = false;

		var displayDetails = self.FieldSettings.GetDisplayDetails();
		var isGaugeChart = isChart && displayDetails.chart_type === enumHandlers.CHARTTYPE.GAUGE.Code;
		if (isGaugeChart) {
			var fields = self.FieldSettings.GetFields();
			jQuery.each(fields, function (index, field) {
				if (field.Area === enumHandlers.FIELDSETTINGAREA.ROW
					|| field.Area === enumHandlers.FIELDSETTINGAREA.COLUMN) {
					self.RemoveField(field);
				}
			});
			fields = self.FieldSettings.GetFields();
			self.FieldSettings.Fields = JSON.stringify(fields);
			self.BuildFieldsSettingsHtml();
			self.SetGaugeApplyValues();
		}

		// reordering fields
		self.SetPostQueryBlocks();
		self.SetFieldSettingsDetails();

		// update chart scale
		if (isChart)
			self.CheckChartScaleRanges();

		self.Handler.FieldSettings = new FieldSettingsModel(self.FieldSettings);

		if (window.anglePageHandler)
			anglePageHandler.UpdateAngleDisplayValidation();

		if (typeof anglePageHandler !== 'undefined' && anglePageHandler.IsEditMode())
			popup.Info(Localization.Info_FieldSettingsEditModeApplied);
		else if (isChart)
			self.Handler.GetChartResult();
		else
			self.Handler.GetPivotResult();
	};
	self.CheckValidateFieldSettings = function () {
		//check data area not allow dupicate field with same bucket
		if (fieldsChooserModel.FieldChooserType === 'data') {
			var dataAreaWarningMessage = self.ValidateDataArea();
			if (dataAreaWarningMessage) {
				popup.Alert(Localization.Warning_Title, dataAreaWarningMessage);
				return false;
			}
		}

		var displayDetails = self.FieldSettings.GetDisplayDetails();
		var rowFields = self.FieldSettings.GetFields(enumHandlers.FIELDSETTINGAREA.ROW);
		var columnFields = self.FieldSettings.GetFields(enumHandlers.FIELDSETTINGAREA.COLUMN);
		var dataFields = self.FieldSettings.GetFields(enumHandlers.FIELDSETTINGAREA.DATA).findObjects('IsSelected', true);
		var rowFieldCount = rowFields.length;
		var columnFieldCount = columnFields.length;
		var dataFieldCount = dataFields.length;

		if (self.Handler.Models.Display.Data().display_type === enumHandlers.DISPLAYTYPE.CHART) {
			if (displayDetails.chart_type !== enumHandlers.CHARTTYPE.GAUGE.Code && rowFieldCount === 0) {
				popup.Alert(Localization.Warning_Title, self.GetLocalizationTextByChartType(displayDetails.chart_type, 'Info_RequiredFieldInRowAreaChart'));
				return false;
			}

			if (displayDetails.chart_type === enumHandlers.CHARTTYPE.BUBBLECHART.Code) {
				if (dataFieldCount < 1 || dataFieldCount > 2) {
					popup.Alert(Localization.Warning_Title, Localization.Info_RequiredFieldsInBubbleChart);
					return false;
				}
			}
			else {
				if (displayDetails.multi_axis && dataFieldCount !== 2) {
					popup.Alert(Localization.Warning_Title, Localization.Info_RequiredFieldsInMultiAxis);
					return false;
				}
				else if (!displayDetails.multi_axis && dataFieldCount > 1) {
					popup.Alert(Localization.Warning_Title, self.GetLocalizationTextByChartType(displayDetails.chart_type, 'Info_PleaseRemoveOneFieldFromDataArea'));
					return false;
				}
			}

			var validFieldTypes = [
				enumHandlers.FIELDTYPE.CURRENCY, enumHandlers.FIELDTYPE.NUMBER, enumHandlers.FIELDTYPE.INTEGER,
				enumHandlers.FIELDTYPE.DOUBLE, enumHandlers.FIELDTYPE.PERCENTAGE,
				enumHandlers.FIELDTYPE.DATE, enumHandlers.FIELDTYPE.DATETIME,
				enumHandlers.FIELDTYPE.TIME, enumHandlers.FIELDTYPE.TIMESPAN, enumHandlers.FIELDTYPE.PERIOD
			];
			var isRowArea = rowFields.length && rowFields[0].Area === enumHandlers.FIELDSETTINGAREA.ROW;
			var isBubbleOrScatter = displayDetails.chart_type === enumHandlers.CHARTTYPE.BUBBLECHART.Code || displayDetails.chart_type === enumHandlers.CHARTTYPE.SCATTERCHART.Code;
			if (isRowArea && jQuery.inArray(rowFields[0].DataType, validFieldTypes) === -1 && isBubbleOrScatter) {
				popup.Alert(Localization.Warning_Title, displayDetails.chart_type + ' ' + Localization.Info_RequiredNumberOrDateFieldForChart);
				return false;
			}

			if (displayDetails.chart_type === enumHandlers.CHARTTYPE.GAUGE.Code) {
				var warningMessage = self.CheckValidateApplyGauge();
				if (warningMessage) {
					popup.Alert(Localization.Warning_Title, warningMessage);
					return false;
				}
			}
		}
		else {
			// check pivot must have one row area
			if (!rowFieldCount && !columnFieldCount) {
				popup.Alert(Localization.Warning_Title, Localization.Info_RequiredAtLeastOneFieldForPivot);
				return false;
			}
		}

		return true;
	};
	self.CheckValidateApplyGauge = function () {
		var guageValues = self.FieldSettings.GetDisplayDetails().GaugeValues;
		var isASC = self.CheckASCOrderGaugeValues(guageValues);
		var isValidated = false;

		for (var i = 1; i <= 5; i++) {
			if (isASC) {
				isValidated = guageValues[i - 1] <= guageValues[i];
			}
			else {
				isValidated = guageValues[i - 1] >= guageValues[i];
			}

			if (!isValidated) {
				jQuery("#gaugeValue" + i).addClass('k-invalid');
				break;
			}
			else {
				jQuery("#gaugeValue" + i).removeClass('k-invalid');
			}
		}

		return isValidated ? '' : Localization.Info_GaugeChartIncorrectOrder;
	};
	self.SetFieldsOrdering = function () {
		var field, fields = [], area, areaName, fieldDetails,
			currentFields = self.FieldSettings.GetFields();

		// ordering
		jQuery('#FieldListArea .fieldListAreaItem').each(function (areaIndex, areaElement) {
			if (jQuery(areaElement).hasClass('rowArea'))
				area = enumHandlers.FIELDSETTINGAREA.ROW;
			if (jQuery(areaElement).hasClass('columnArea'))
				area = enumHandlers.FIELDSETTINGAREA.COLUMN;
			if (jQuery(areaElement).hasClass('dataArea'))
				area = enumHandlers.FIELDSETTINGAREA.DATA;
			areaName = self.GetAreaById(area);

			jQuery(areaElement).find('li').each(function (index, element) {
				field = currentFields.findObject('InternalID', element.id);
				if (field) {
					fieldDetails = jQuery.extend({}, JSON.parse(field.FieldDetails), {
						pivot_area: areaName
					});
					field.Area = area;
					field.FieldDetails = JSON.stringify(fieldDetails);
					field.Index = index + 1;
					fields.push(field);
				}
			});
		});

		self.FieldSettings.Fields = JSON.stringify(fields);
	};
	self.SetPostQueryBlocks = function () {
		// all current display steps except aggregation
		var currentAggSteps = self.Handler.Models.DisplayQueryBlock.GetAggregationStepByFieldSetting(self.FieldSettings);
		var currentDisplaySteps = self.Handler.Models.DisplayQueryBlock.GetQueryStepByNotInType(enumHandlers.FILTERTYPE.AGGREGATION);
		currentDisplaySteps.push(currentAggSteps);

		var queryStepBlocks = [{ queryblock_type: enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS, query_steps: currentDisplaySteps }];
		self.Handler.Models.DisplayQueryBlock.SetDisplayQueryBlock(queryStepBlocks);
	};
	self.SetFieldSettingsDetails = function () {
		var fields = self.FieldSettings.GetFields();
		var fieldDetails = [];
		var canSortDataField = self.FieldSettings.CanSortDataField();
		var isPivot = self.Handler.Models.Display.Data().display_type === enumHandlers.DISPLAYTYPE.PIVOT;
		jQuery.each(fields, function (index, field) {
			// clear sorting
			if (!canSortDataField && !isPivot) {
				self.SetSorting(field, '');
			}
			if (field.IsSelected) {
				fieldDetails.push({
					multi_lang_alias: field.MultiLangAlias,
					field: field.FieldName,
					field_details: field.FieldDetails,
					valid: true
				});
			}
		});
		self.FieldSettings.Fields = JSON.stringify(fields);

		var currentCountFieldIndex = self.FieldSettings.GetFields(enumHandlers.FIELDSETTINGAREA.DATA).indexOfObject('FieldName', enumHandlers.AGGREGATION.COUNT.Value);
		self.FieldSettings.SetDisplayDetails({ count_index: currentCountFieldIndex });

		self.Handler.Models.Display.Data().display_details = self.FieldSettings.DisplayDetails;
		self.Handler.Models.Display.Data().fields = fieldDetails;
		self.Handler.Models.Display.Data.commit();
	};
	self.SetApplyButtonStatus = function (enable) {
		self.IsChangeFieldsSetting = enable;
		if (enable) {
			jQuery('#btnFieldSettingApply').removeClass('disabled');
		}
		else {
			jQuery('#btnFieldSettingApply').addClass('disabled');
		}
	};
	self.SelectedCountCheckbox = function () {
		var fields = self.FieldSettings.GetFields();
		var countField = fields.findObject('FieldName', enumHandlers.AGGREGATION.COUNT.Value);
		var countCheckbox = jQuery('#chkCount');

		self.SetSorting(countField, '');
		countField.IsSelected = countCheckbox.is(':checked');
		if (!countField.IsSelected) {
			countCheckbox.parents('li:first').find('.btnSort').addClass('disabled');
		}
		else {
			countCheckbox.parents('li:first').find('.btnSort').removeClass('disabled');
		}
		self.IsNeedResetLayout = true;
		self.FieldSettings.Fields = JSON.stringify(fields);

		self.SetApplyButtonStatus(true);
	};
	self.NeedToDisableDisplayOptions = function () {
		var isNeedToDisableDisplayOptions = false;
		if (self.Handler.Models.Display.Data().display_type === enumHandlers.DISPLAYTYPE.PIVOT) {
			var fields = self.FieldSettings.GetFields(enumHandlers.FIELDSETTINGAREA.DATA);
			jQuery.each(fields, function (index, field) {
				if (field.IsSelected && field.DataType === enumHandlers.FIELDTYPE.TIME) {
					isNeedToDisableDisplayOptions = true;
					return false;
				}
			});
		}
		return isNeedToDisableDisplayOptions;
	};
	self.SetDisplayOptionsButtonStatus = function () {
		if (self.NeedToDisableDisplayOptions()) {
			jQuery('#ButtonDisplayOptions').addClass('disabled');
			self.SetDefaultDisplayOption();
		}
		else
			jQuery('#ButtonDisplayOptions').removeClass('disabled');
	};
	self.SetDefaultDisplayOption = function () {
		self.FieldSettings.SetDisplayDetails({ show_total_for: 0, include_subtotals: false, percentage_summary_type: 0 });
	};
	self.UpdateSettingsAfterChange = function () {
		// update field setting model from ui
		var settings = {},
			container = jQuery('#FieldListArea'),
			dataArea, countField;

		if (!container.length)
			return;

		// display details
		settings.DisplayDetails = self.FieldSettings.GetDisplayDetails();
		if (!container.hasClass('fieldListAreaPivot')) {
			var isGaugeChart = container.hasClass('fieldListAreaChartGauge');
			var chartType = WC.HtmlHelper.DropdownList('#ChartType').list.find('.ChartTypeUsage span.active').attr('alt');
			if (chartType) {
				var chartDetails = chartType.split('_');
				if (chartDetails.length !== 0) {
					settings.DisplayDetails.chart_type = chartDetails[0];
					settings.DisplayDetails.stack = chartDetails[1] === 'stack';
					settings.DisplayDetails.multi_axis = chartDetails[1] === 'multi';

					if (isGaugeChart) {
						settings.DisplayDetails.GaugeValues = [];
						settings.DisplayDetails.GaugeColours = [];

						var uiName = jQuery("#gaugeValue1").data('role') === 'numerictextbox' ? enumHandlers.KENDOUITYPE.NUMERICTEXT : enumHandlers.KENDOUITYPE.PERCENTAGETEXT;
						for (var i = 1; i <= 6; i++) {
							settings.DisplayDetails.GaugeValues.push(jQuery("#gaugeValue" + i).data(uiName).value());

							if (i <= 5) {
								settings.DisplayDetails.GaugeColours.push(jQuery("#gaugeColorPicker" + i).data(enumHandlers.KENDOUITYPE.COLOURPICKER).value());
							}
						}
					}
					else {
						delete settings.DisplayDetails.GaugeValues;
						delete settings.DisplayDetails.GaugeColours;
					}
				}
			}
		}

		// fields
		self.SetFieldsOrdering();

		// check count in data area
		settings.Fields = self.FieldSettings.GetFields();
		dataArea = settings.Fields.findObjects('Area', enumHandlers.FIELDSETTINGAREA.DATA);
		countField = dataArea.findObject('FieldName', enumHandlers.AGGREGATION.COUNT.Value);
		if (dataArea.length === 1) {
			countField.IsSelected = true;
		}
		else {
			if (settings.DisplayDetails.chart_type) {
				var isBubbleChart = settings.DisplayDetails.chart_type === enumHandlers.CHARTTYPE.BUBBLECHART.Code;
				var isMultiAxis2Fields = settings.DisplayDetails.multi_axis && dataArea.length < 3;
				var isSingleAxis1Field = !settings.DisplayDetails.multi_axis && dataArea.length < 2;
				if (isBubbleChart || isMultiAxis2Fields || isSingleAxis1Field) {
					countField.IsSelected = true;
				}
			}
		}

		settings.Fields = JSON.stringify(settings.Fields);
		settings.DisplayDetails = JSON.stringify(settings.DisplayDetails);

		jQuery.extend(self.FieldSettings, settings);

		self.UpdateSortableArea();

		self.InitialCountBehavior();

		//To disable display Options button
		self.SetDisplayOptionsButtonStatus();
	};
	self.ShowConfirmDiscardSetting = function (callback, forceSkipConfirm) {
		if (typeof callback !== 'function')
			callback = jQuery.noop;
		if (typeof forceSkipConfirm !== 'boolean')
			forceSkipConfirm = false;

		if (self.IsChangeFieldsSetting && !forceSkipConfirm) {
			var confirmMsg = kendo.format(Localization.PopupConfirmDiscardChangeFieldSettingAndContinue, self.Handler.Models.Display.Data().display_type);
			popup.Confirm(confirmMsg, function () {
				self.ResetFieldSettings();
				setTimeout(function () {
					callback();
				}, 100);
			});
		}
		else {
			callback();
		}
	};
	self.CreateFieldFormatSettings = function (field, modelUri) {
		/// <summary>Create field format settings from FieldModel</summary>
		/// <param name="field" type="FieldModel">field model in field settings</param>
		/// <param name="modelUri" type="String">model uri</param>
		/// <returns type="Formatter"></returns>

		var displayField = { field: field.SourceField || field.FieldName, field_details: field.FieldDetails };
		var modelField = ko.toJS(modelFieldsHandler.GetFieldById(displayField.field, modelUri));
		modelField.fieldtype = field.DataType;
		var fieldFormatter = new FieldFormatter(displayField, modelUri);
		fieldFormatter.AddBaseField(modelField);
		return WC.FormatHelper.GetFieldFormatSettings(fieldFormatter, true);
	};

	// field menu
	self.GetTemplateFieldOptions = function (fieldDetail, target) {
		var handler = target === 'fieldSettingsHandler' ? window[target].Handler : window[target];
		var fieldId = fieldDetail.SourceField ? fieldDetail.SourceField : fieldDetail.FieldName;
		var field = modelFieldsHandler.GetFieldById(fieldId, handler.Models.Angle.Data().model);
		var isFieldValid = field && field.id;
		var popupId = 'PopupHeader' + fieldDetail.InternalID;
		var template = [
			'<div class="k-window-custom k-window-titleless HeaderPopup" id="#PopupHeaderID#" >',
			'<div class="k-content k-window-content">',
			'<div class="propertyFunction#VisibleSort#">',
			'<a class="sortAsc#CanSortAsc#" onclick="window[\'#Target#\'].FieldOptionClick(this, \'#FieldId#\')">' + Localization.ListHeaderPopupSortAscending + '</a>',
			'<a class="sortDesc#CanSortDesc#" onclick="window[\'#Target#\'].FieldOptionClick(this, \'#FieldId#\')">' + Localization.ListHeaderPopupSortDecending + '</a>',
			'</div>',
			'<div class="propertyFunction#VisibleFormat#">',
			'<a class="fieldFormat#CanFormat#" onclick="window[\'#Target#\'].FieldOptionClick(this, \'#FieldId#\')">' + Localization.ListHeaderPopupFormatFields + '</a>',
			'</div>',
			'<div class="propertyFunction#VisibleFilter#">',
			'<a class="addFilter#CanAddFilter#" onclick="window[\'#Target#\'].FieldOptionClick(this, \'#FieldId#\')">' + Localization.ListHeaderPopupAddFilter + '</a>',
			'</div>',
			'<div class="propertyFunction#VisibleViewInfo#">',
			'<a class="fieldInfo#CanViewInfo#" onclick="window[\'#Target#\'].FieldOptionClick(this, \'#FieldId#\')">' + Localization.ListHeaderPopupFieldInfo + '</a>',
			'</div>',
			'</div>',
			'</div>'
		].join('');

		template = template.replace(/#Target#/g, target);
		template = template.replace(/#FieldId#/g, fieldDetail.InternalID);
		template = template.replace(/#PopupHeaderID#/g, popupId);

		// hide sort in data area
		if (fieldDetail.Area === enumHandlers.FIELDSETTINGAREA.DATA || window[target].FieldSettings.DisplayType === window[target].FieldSettings.ComponentType.CHART) {
			// sorting
			template = template.replace(/#VisibleSort#/g, ' alwaysHide');
			template = template.replace(/#CanSortAsc#/g, ' alwaysHide');
			template = template.replace(/#CanSortDesc#/g, ' alwaysHide');
		}

		if (fieldId === enumHandlers.AGGREGATION.COUNT.Value) {
			// filter
			template = template.replace(/#VisibleFilter#/g, ' alwaysHide');
			template = template.replace(/#CanAddFilter#/g, ' alwaysHide');

			// format
			template = template.replace(/#VisibleFormat#/g, '');
			template = template.replace(/#CanFormat#/g, '');

			// info
			template = template.replace(/#VisibleViewInfo#/g, ' alwaysHide');
			template = template.replace(/#CanViewInfo#/g, ' alwaysHide');
		}
		else if (!isFieldValid) {
			// sorting
			template = template.replace(/#VisibleSort#/g, '');
			template = template.replace(/#CanSortAsc#/g, ' disabled');
			template = template.replace(/#CanSortDesc#/g, ' disabled');

			// filter
			template = template.replace(/#VisibleFilter#/g, '');
			template = template.replace(/#CanAddFilter#/g, ' disabled');

			// format
			template = template.replace(/#VisibleFormat#/g, '');
			template = template.replace(/#CanFormat#/g, ' disabled');

			// info
			template = template.replace(/#VisibleViewInfo#/g, '');
			template = template.replace(/#CanViewInfo#/g, ' disabled');
		}
		else {
			// sorting
			template = template.replace(/#VisibleSort#/g, '');
			var elementSorting = jQuery('.dxpgHeaderText[data-uid="' + fieldDetail.InternalID + '"]').next('.dxpgHeaderSort').children('img');
			if (!elementSorting.length) {
				template = template.replace(/#CanSortAsc#/g, ' disabled');
				template = template.replace(/#CanSortDesc#/g, ' disabled');
			}
			else {
				template = template.replace(/#CanSortAsc#/g, elementSorting.hasClass('dxPivotGrid_pgSortUpButton') ? ' disabled' : '');
				template = template.replace(/#CanSortDesc#/g, elementSorting.hasClass('dxPivotGrid_pgSortDownButton') ? ' disabled' : '');
			}

			// filter
			template = template.replace(/#VisibleFilter#/g, '');
			template = template.replace(/#CanAddFilter#/g, !handler.Models.Result.Data().authorizations.add_filter ? ' disabled' : '');

			// format
			template = template.replace(/#VisibleFormat#/g, '');
			template = template.replace(/#CanFormat#/g, '');

			// info
			template = template.replace(/#VisibleViewInfo#/g, '');
			template = template.replace(/#CanViewInfo#/g, '');
		}

		return template;
	};
	self.ShowFieldOptionsMenu = function (element, internalId, target) {
		var isFieldSettingHandler = target === 'fieldSettingsHandler';

		// check change before continue
		self.ShowConfirmDiscardSetting(function () {
			var field = window[target].FieldSettings.GetFieldByGuid(internalId);
			var html = self.GetTemplateFieldOptions(field, target);

			element = jQuery(element);
			self.HideFieldOptionsMenu();

			if (!jQuery('#PopupHeader' + internalId).length) {
				jQuery('body').append(html);
			}
			var currentHeaderPopup = jQuery('#PopupHeader' + internalId);
			currentHeaderPopup.removeClass('HeaderPopupField HeaderPopupView');
			currentHeaderPopup.addClass(isFieldSettingHandler ? 'HeaderPopupField' : 'HeaderPopupView');

			var elementPosition = element.offset();
			elementPosition.top += element.height() - 5;
			elementPosition.left += element.width() / 2;
			currentHeaderPopup
				.css(elementPosition)
				.show();

			WC.HtmlHelper.MenuNavigatable.prototype.UnlockMenu('.HeaderPopup');
			jQuery('.HeaderPopup a').removeClass('active');

			var popupWidth = currentHeaderPopup.width();
			var popupHeight = currentHeaderPopup.height();
			if (elementPosition.left + popupWidth > WC.Window.Width) {
				currentHeaderPopup.css('left', WC.Window.Width - popupWidth - 10);
			}
			if (elementPosition.top + popupHeight > WC.Window.Height) {
				currentHeaderPopup.css('top', WC.Window.Height - popupHeight - 10);
			}

			jQuery('#FieldListArea .fieldListAreaInner').off('scroll').on('scroll', function () {
				self.HideFieldOptionsMenu();
			});
		}, isFieldSettingHandler);
	};
	self.HideFieldOptionsMenu = function () {
		jQuery('.HeaderPopup').remove();
		jQuery('[id*=DHP_PW]').removeClass('pivotMenuVisible');
		jQuery('#FieldListArea .fieldListAreaInner').off('scroll');

		self.RemoveAllBucketPopup();
	};
	self.FieldOptionClick = function (element, internalId) {
		var field = self.FieldSettings.GetFieldByGuid(internalId);
		var fieldId = field.SourceField ? field.SourceField : field.FieldName;
		element = jQuery(element);
		if (!element.hasClass('disabled')) {
			jQuery('.HeaderPopup a').removeClass('active');
			element.addClass('active');

			if (element.hasClass('sortAsc') || element.hasClass('sortDesc')) {
				self.ShowConfirmDiscardSetting(function () {
					self.ApplyPivotSorting(element, field);
				});
			}
			else if (element.hasClass('fieldFormat')) {
				WC.HtmlHelper.MenuNavigatable.prototype.LockMenu('.HeaderPopup');
				self.ShowBucketPopup(element, internalId);
			}
			else if (element.hasClass('addFilter')) {
				self.ShowConfirmDiscardSetting(function () {
					quickFilterHandler.ShowAddFilterPopup(fieldId, self.Handler);
					self.HideFieldOptionsMenu();
				});
			}
			else if (element.hasClass('fieldInfo')) {
				helpTextHandler.ShowHelpTextPopup(fieldId, helpTextHandler.HELPTYPE.FIELD, self.Handler.Models.Angle.Data().model);
				self.HideFieldOptionsMenu();
			}
		}
	};

	// sorting
	self.ApplyPivotSorting = function (element, field) {
		if (self.Handler) {
			self.Handler.ApplyPivotSorting(element, field);
		}
	};
	self.ApplySorting = function (internalID) {
		var field = self.FieldSettings.GetFields().findObject('InternalID', internalID);
		if (field.IsSelected) {
			var sortDirection = field.SortDirection;
			if (!sortDirection)
				sortDirection = 'desc';
			else if (sortDirection === 'desc')
				sortDirection = 'asc';
			else
				sortDirection = '';

			var fields = self.FieldSettings.GetFields();
			jQuery.each(fields, function (index, field) {
				if (field.InternalID === internalID) {
					self.SetSorting(field, sortDirection);
				}
				else {
					self.SetSorting(field, '');
				}
			});

			self.FieldSettings.Fields = JSON.stringify(fields);

			// check change
			if (!self.IsChangeFieldsSetting) {
				self.SetApplyButtonStatus(true);
				self.ApplySettings();
			}
		}
	};
	self.SetSorting = function (field, sortDirection) {
		sortDirection = sortDirection || '';

		var fieldDetails = WC.Utility.ParseJSON(field.FieldDetails);
		fieldDetails.sorting = sortDirection;

		field.FieldDetails = JSON.stringify(fieldDetails);
		field.SortDirection = sortDirection;

		var element = jQuery('[id="' + field.InternalID + '"]');
		if (element.length) {
			var canSort = self.Handler.Models.Result.Data().authorizations.change_field_collection && field.Valid;
			if (!canSort || field.FieldName === enumHandlers.AGGREGATION.COUNT.Value && !field.IsSelected) {
				sortDirection += ' disabled';
			}
			element.find('.btnSort').attr('class', 'btnSort ' + sortDirection);
		}
	};
	self.BindBucketDropdown = function (field, popup, datas, defaultValue, isAutoUpdate, elementId) {
		var bucketDropDown = jQuery('#' + elementId);
		if (bucketDropDown.length) {
			var bucketDropDownOptions = WC.HtmlHelper.DropdownList(bucketDropDown, datas, {
				enable: elementId === 'BucketOptionDropDown' ? self.Handler.Models.Result.Data().authorizations.change_field_collection : true,
				value: defaultValue,
				change: function () {
					if (isAutoUpdate === false) {
						popup.find('.btnSetBucket').removeClass('disabled');
						var popupData = popup.data() || {};
						popupData.IsChangeFieldsSetting = true;
						if (elementId === "BucketOptionDropDown") {
							popupData.IsNeedResetLayout = true;
						}
						popup.data(popupData);
					}
					else {
						self.ApplyBucketSetting(popup.data('field'));
						self.SetApplyButtonStatus(true);
						if (elementId === "BucketOptionDropDown") {
							self.IsNeedResetLayout = true;
						}
					}

					if (elementId === "BucketOptionDropDown") {
						self.RebuildBucketOptions(field, popup, isAutoUpdate);
					}
				}
			});

			bucketDropDownOptions.value(defaultValue);

			if (elementId === "BucketOptionDropDown") {
				// set format
				var fieldFormatDetails = WC.Utility.ParseJSON(field.FieldDetails);
				var fields = self.FieldSettings.GetFields();
				var fieldModel = fields.findObject('InternalID', field.InternalID);
				fieldModel.FieldDetails = field.FieldDetails;
				self.SetFieldFormat(fieldModel, fieldFormatDetails);
				self.FieldSettings.Fields = JSON.stringify(fields);
			}
		}
	};
	self.RebuildBucketOptions = function (field, popup, isAutoUpdate) {
		var bucketValue = WC.HtmlHelper.DropdownList('#BucketOptionDropDown').value();
		var modelUri = self.Handler.Models.Angle.Data().model;
		var modelField = modelFieldsHandler.GetFieldById(field.SourceField || field.FieldName, modelUri);
		var fieldType = _self.GetFieldType(modelField || field);
		var dataType = self.GetCorrectDataType(bucketValue, fieldType, field.Area);
		var fieldDetails = WC.Utility.ParseJSON(field.FieldDetails);
		var formatOptions;
		if (field.DomainURI) {
			// if enum data type
			if (bucketValue !== 'individual') {
				jQuery(".bucketformat").addClass("alwaysHide");
			}
			else {
				jQuery(".bucketformat").removeClass("alwaysHide");
				formatOptions = self.GetBucketFormatOptions(dataType, field.Area, bucketValue, field.DomainURI);
				var fieldFormat = userSettingsHandler.GetEnumDropdownValue(fieldDetails[enumHandlers.FIELDDETAILPROPERTIES.FORMAT]);
				self.BindBucketDropdown(field, popup, formatOptions, fieldFormat, isAutoUpdate, 'BucketFormatOptionDropDown');
			}
		}
		else if (field.Area === enumHandlers.FIELDSETTINGAREA.DATA) {
			if (dataTypeModel.IsIntegerBucket(bucketValue, dataType) || dataType === enumHandlers.FIELDTYPE.TIME) {
				jQuery(".bucketDecimal").addClass("alwaysHide");
			}
			else {
				jQuery(".bucketDecimal").removeClass("alwaysHide");
				formatOptions = self.GetBucketFormatOptions(dataType, field.Area, bucketValue, field.DomainURI);
				var fieldDecimal = userSettingsHandler.GetDecimalDropdownValue(fieldDetails[enumHandlers.FIELDDETAILPROPERTIES.DECIMALS]);
				self.BindBucketDropdown(field, popup, formatOptions, fieldDecimal, isAutoUpdate, "BucketDecimalDropDown");
			}
		}

		var bucketDisplayUnitDropDown = WC.HtmlHelper.DropdownList('#BucketDisplayUnitDropDown');
		if (bucketDisplayUnitDropDown && !dataTypeModel.IsAggregationBucket(bucketValue)) {
			var existingDisplayUnitFormat = bucketDisplayUnitDropDown.value();
			var availablePrefixs = dataTypeModel.GetDisplayPrefixByBucket(bucketValue);
			var displayUnitFormat;
			if (availablePrefixs.hasObject('id', existingDisplayUnitFormat)) {
				displayUnitFormat = existingDisplayUnitFormat;
			}
			else {
				displayUnitFormat = WC.Utility.GetObjectValue(fieldDetails, enumHandlers.FIELDDETAILPROPERTIES.PREFIX, existingDisplayUnitFormat);
				if (existingDisplayUnitFormat !== enumHandlers.FIELDSETTING.USEDEFAULT) {
					displayUnitFormat = dataTypeModel.GetCorrectPrefix(displayUnitFormat, bucketValue);
				}
			}

			// set prefix dropdown
			self.BindBucketDropdown(field, popup, availablePrefixs, displayUnitFormat, isAutoUpdate, "BucketDisplayUnitDropDown");
		}
	};

	// bucket & format
	self.ShowBucketPopup = function (element, internalID, isAutoUpdate) {

		self.IndeterminatableCallback = null;

		var field = self.FieldSettings.GetFieldByGuid(internalID);
		var bucketId = 'bucket-' + field.InternalID;
		var template, fieldDecimal;
		var fieldDetails = JSON.parse(field.FieldDetails);
		var bucketOptions = self.GetBucketOptions(field);
		var bucketValue = field.Bucket.Operator;
		var fieldType = field.DataType;
		var isIntegerBucket = dataTypeModel.IsIntegerBucket(bucketValue, fieldType);
		var isAllowSetAlias = field.FieldName !== enumHandlers.AGGREGATION.COUNT.Value;
		var isNumberDataType = WC.FormatHelper.IsNumberFieldType(fieldType);
		var isHideSecondsOption = jQuery.inArray(fieldType, [enumHandlers.FIELDTYPE.TIME, enumHandlers.FIELDTYPE.TIMESPAN]) === -1;
		var isHideFomatElement = isNumberDataType || field.Area === enumHandlers.FIELDSETTINGAREA.DATA || bucketOptions.formats.length < 2;
		var isHideDecimalElement = !isNumberDataType || isIntegerBucket;

		template = self.TemplateBucket();
		template = template.replace('{BucketId}', bucketId);
		template = template.replace('{BucketOptionTitle}', field.Area === enumHandlers.FIELDSETTINGAREA.DATA ? Localization.Aggregation : Localization.Bucket);
		template = template.replace(/{BucketOptionFormatClass}/g, isHideFomatElement ? 'alwaysHide' : '');
		template = template.replace(/{BucketOptionClass}/g, !bucketOptions.options.length ? 'alwaysHide' : '');
		template = template.replace(/{BucketDisplayUnitClass}/g, !bucketOptions.units.length ? 'alwaysHide' : '');
		template = template.replace(/{BucketDecimalClass}/g, isHideDecimalElement ? 'alwaysHide' : '');
		template = template.replace(/{SecondsOptionFormatClass}/g, isHideSecondsOption ? 'alwaysHide' : '');
		template = template.replace('{ThousandSeperateClass}', !bucketOptions.thousand ? 'alwaysHide' : '');
		template = template.replace('{BucketAliasNameClass}', !isAllowSetAlias ? 'alwaysHide' : '');
		template = template.replace('{Title}', htmlEncode(field.Caption));

		if (self.Handler.Models.Display.Data().display_type === enumHandlers.DISPLAYTYPE.PIVOT) {
			template = template.replace('{ShowAsIn}', Localization.NameAsShowInPivot);
		}
		else {
			template = template.replace('{ShowAsIn}', Localization.NameAsShowInChart);
		}

		// clear bucket
		self.RemoveAllBucketPopup();
		self.RemoveDisplayOptionsPopup();

		// set html
		var popup = jQuery(template)
			.show()
			.data('field', field)
			.appendTo('body');
		ko.applyBindings(self, $('.popupBucket').get(0));

		// initial bucket options
		if (bucketOptions.options.length) {
			self.BindBucketDropdown(field, popup, bucketOptions.options, field.Bucket.Operator, isAutoUpdate, "BucketOptionDropDown");
		}

		if (bucketOptions.units.length) {
			var fieldPrefix = userSettingsHandler.GetPrefixDropdownValue(fieldDetails[enumHandlers.FIELDDETAILPROPERTIES.PREFIX]);
			fieldPrefix = dataTypeModel.GetCorrectPrefix(fieldPrefix, bucketValue);
			var availablePrefixs = dataTypeModel.GetDisplayPrefixByBucket(bucketValue);
			self.BindBucketDropdown(field, popup, availablePrefixs, fieldPrefix, isAutoUpdate, "BucketDisplayUnitDropDown");
		}

		// initial display unit
		if (isNumberDataType) {
			// initial decimals dropdown
			if (bucketOptions.formats.length) {
				fieldDecimal = userSettingsHandler.GetDecimalDropdownValue(fieldDetails[enumHandlers.FIELDDETAILPROPERTIES.DECIMALS]);
				self.BindBucketDropdown(field, popup, bucketOptions.formats, fieldDecimal, isAutoUpdate, "BucketDecimalDropDown");
			}
		}
		else {
			// initial decimals dropdown
			if (field.Area === enumHandlers.FIELDSETTINGAREA.DATA && bucketOptions.formats.length) {
				fieldDecimal = userSettingsHandler.GetDecimalDropdownValue(fieldDetails[enumHandlers.FIELDDETAILPROPERTIES.DECIMALS]);
				self.BindBucketDropdown(field, popup, bucketOptions.formats, fieldDecimal, isAutoUpdate, "BucketDecimalDropDown");
			}

			// if not number
			if (bucketOptions.formats.length) {
				var fieldFormat = userSettingsHandler.GetEnumDropdownValue(fieldDetails[enumHandlers.FIELDDETAILPROPERTIES.FORMAT]);
				self.BindBucketDropdown(field, popup, bucketOptions.formats, fieldFormat, isAutoUpdate, "BucketFormatOptionDropDown");
			}

			// hande bucket for enum
			if (field.DomainURI) {
				if (bucketValue !== 'individual') {
					jQuery(".bucketformat").addClass("alwaysHide");
				}
				else {
					jQuery(".bucketformat").removeClass("alwaysHide");
				}
			}

			// handle aggregration bucket
			if (field.Area === enumHandlers.FIELDSETTINGAREA.DATA) {
				if (isIntegerBucket || field.DataType === enumHandlers.FIELDTYPE.TIME || field.DataType === enumHandlers.FIELDTYPE.TIMESPAN) {
					jQuery(".bucketDecimal").addClass("alwaysHide");
				}
				else {
					jQuery(".bucketDecimal").removeClass("alwaysHide");
				}
			}
		}

		// initial seconds options
		if (bucketOptions.seconds.length) {
			var fieldFormatForSeconds = WC.Utility.GetObjectValue(fieldDetails, enumHandlers.FIELDDETAILPROPERTIES.SECOND);
			var secondValue = userSettingsHandler.GetSecondDropdownValue(fieldFormatForSeconds);
			self.BindBucketDropdown(field, popup, bucketOptions.seconds, secondValue, isAutoUpdate, "SecondsFormatOptionDropDown");
		}

		if (isAllowSetAlias) {
			jQuery('#BucketAliasName')
				.addClass(field.Caption === field.DefaultCaption ? 'placeholder' : '')
				.val(field.Caption)
				.on('keyup', function () {
					var caption = jQuery.trim(jQuery(this).val());
					if (field.DefaultCaption !== caption) {
						jQuery(this).removeClass('placeholder');
					}

					if (isAutoUpdate === false) {
						popup.find('.btnSetBucket').removeClass('disabled');

						var popupData = popup.data() || {};
						popupData.IsChangeFieldsSetting = true;
						popupData.AliasElement = jQuery('#BucketAliasName');
						popup.data(popupData);
					}
					else {
						self.ApplyBucketAlias(popup.data('field'), jQuery('#BucketAliasName'));
						self.SetApplyButtonStatus(true);
					}
				});
		}

		if (bucketOptions.thousand) {
			var thousandseparator = (fieldDetails && typeof fieldDetails.thousandseparator === 'boolean') ? fieldDetails.thousandseparator : null;
			self.ThousandSeparator(thousandseparator);

			self.IndeterminatableCallback = function () {
				if (isAutoUpdate === false) {
					popup.find('.btnSetBucket').removeClass('disabled');

					var popupData = popup.data() || {};
					popupData.IsChangeFieldsSetting = true;
					popup.data(popupData);
				}
				else {
					self.ApplyBucketSetting(popup.data('field'));
					self.SetApplyButtonStatus(true);
				}
			};
		}

		element = jQuery(element);
		var position = element.offset();
		var width = element.outerWidth();
		var popupHeight = popup.outerHeight();
		var popupOffsetTop = position.top + 32;
		var arrowClass = '';
		if (popupOffsetTop + popupHeight > WC.Window.Height) {
			arrowClass = 'k-window-arrow-sw';
			popupOffsetTop = popupOffsetTop - popupHeight + 52;
		}
		if (popupOffsetTop < 32) {
			arrowClass = 'k-window-arrow-mw';
			popupOffsetTop = position.top + 44 - (popupHeight * 0.6);
		}

		popup
			.css({
				left: position.left + width + 13,
				top: popupOffsetTop
			})
			.addClass(arrowClass);

	};
	self.RemoveAllBucketPopup = function () {
		jQuery('.popupBucket').each(function () {
			self.CleanFieldSettingsPopup(this);
		});
	};
	self.CleanFieldSettingsPopup = function (obj) {
		obj = jQuery(obj);
		obj.find('[data-role="dropdownlist"]').each(function () {
			var ddl = WC.HtmlHelper.DropdownList(this);
			ddl.list.parent('.k-animation-container').remove();
			ddl.list.remove();
			ddl.destroy();
		});
		obj.remove();
	};
	self.GetBucketFormatOptions = function (fieldType, area, operator, hasDomainUri) {
		var fieldFormat = [];
		var dataType = fieldType;
		if (area === enumHandlers.FIELDSETTINGAREA.DATA && !dataTypeModel.IsIntegerBucket(operator, fieldType)) {
			dataType = enumHandlers.FIELDTYPE.DOUBLE;
			fieldFormat = enumHandlers.LISTFORMATDECIMALS;
		}
		else {
			switch (fieldType) {
				case enumHandlers.FIELDTYPE.TEXT:
				case enumHandlers.FIELDTYPE.ENUM:
					if (hasDomainUri && operator === 'individual') {
						fieldType = enumHandlers.FIELDTYPE.ENUM;
						fieldFormat = userSettingModel.Enums();
					}
					break;
				case enumHandlers.FIELDTYPE.DOUBLE:
				case enumHandlers.FIELDTYPE.CURRENCY:
				case enumHandlers.FIELDTYPE.PERCENTAGE:
					fieldFormat = enumHandlers.LISTFORMATDECIMALS;
					break;
				case enumHandlers.FIELDTYPE.PERIOD:
					fieldFormat = userSettingModel.Periods;
					break;
				default:
					break;
			}
		}
		return self.AddUseDefaulToFormatList(dataType, ko.toJS(fieldFormat));
	};
	self.GetBucketOptionsBy = function (fieldType) {

		var options = [];
		var i, formatter;
		switch (fieldType) {
			case enumHandlers.FIELDTYPE.BOOLEAN:
				options = [
					{ id: 'individual', name: Localization.Pivot_Bucket_Individual }
				];
				break;
			case enumHandlers.FIELDTYPE.TEXT:
				options = [
					{ id: 'individual', name: Localization.Pivot_Bucket_Individual },
					{ id: 'left1', name: Localization.Pivot_Bucket_FirstCharacter }
				];
				for (i = 2; i <= 20; i++) {
					options.push({ id: 'left' + i, name: kendo.format(Localization.Pivot_Bucket_FirstCharacters, i) });
				}
				options.push({ id: 'right1', name: Localization.Pivot_Bucket_LastCharacter });
				for (i = 2; i <= 20; i++) {
					options.push({ id: 'right' + i, name: kendo.format(Localization.Pivot_Bucket_LastCharacters, i) });
				}
				break;
			case enumHandlers.FIELDTYPE.ENUM:
				options = [
					{ id: 'individual', name: Localization.Pivot_Bucket_Individual },
					{ id: 'left1', name: Localization.Pivot_Bucket_FirstCharacter }
				];
				for (i = 2; i <= 20; i++) {
					options.push({ id: 'left' + i, name: kendo.format(Localization.Pivot_Bucket_FirstCharacters, i) });
				}
				break;
			case enumHandlers.FIELDTYPE.DOUBLE:
			case enumHandlers.FIELDTYPE.CURRENCY:
			case enumHandlers.FIELDTYPE.PERCENTAGE:
				for (i = 3; i >= 1; i--) {
					options.push({ id: 'power10_min' + i, name: kendo.toString(1 / Math.pow(10, i), 'n' + i) });
				}
				options.push({ id: 'power10_0', name: '1' });
				formatter = new Formatter({ prefix: null, thousandseparator: true }, enumHandlers.FIELDTYPE.INTEGER);
				for (i = 1; i <= 9; i++) {
					options.push({ id: 'power10_' + i, name: WC.FormatHelper.GetFormattedValue(formatter, Math.pow(10, i)) });
				}
				break;
			case enumHandlers.FIELDTYPE.NUMBER:
			case enumHandlers.FIELDTYPE.INTEGER:
				options.push({ id: 'individual', name: '1' });
				formatter = new Formatter({ prefix: null, thousandseparator: true }, enumHandlers.FIELDTYPE.INTEGER);
				for (i = 1; i <= 9; i++) {
					options.push({ id: 'power10_' + i, name: WC.FormatHelper.GetFormattedValue(formatter, Math.pow(10, i)) });
				}
				break;
			case enumHandlers.FIELDTYPE.DATE:
			case enumHandlers.FIELDTYPE.DATETIME:
			case enumHandlers.FIELDTYPE.PERIOD:
				options = [
					{ id: 'day', name: Localization.Pivot_Bucket_PerDay },
					{ id: 'week', name: Localization.Pivot_Bucket_PerWeek },
					{ id: 'month', name: Localization.Pivot_Bucket_PerMonth },
					{ id: 'quarter', name: Localization.Pivot_Bucket_PerQuarter },
					{ id: 'trimester', name: Localization.Pivot_Bucket_PerTrimester },
					{ id: 'semester', name: Localization.Pivot_Bucket_PerSemester },
					{ id: 'year', name: Localization.Pivot_Bucket_PerYear }
				];
				break;
			case enumHandlers.FIELDTYPE.TIMESPAN:
				options = [
					{ id: 'hour', name: Localization.Pivot_Bucket_PerHour },
					{ id: 'day', name: Localization.Pivot_Bucket_PerDay },
					{ id: 'week', name: Localization.Pivot_Bucket_PerWeek },
					{ id: 'month', name: Localization.Pivot_Bucket_PerMonth },
					{ id: 'quarter', name: Localization.Pivot_Bucket_PerQuarter },
					{ id: 'trimester', name: Localization.Pivot_Bucket_PerTrimester },
					{ id: 'semester', name: Localization.Pivot_Bucket_PerSemester },
					{ id: 'year', name: Localization.Pivot_Bucket_PerYear }
				];
				break;
			case enumHandlers.FIELDTYPE.TIME:
				options = [
					{ id: 'hour', name: Localization.Pivot_Bucket_PerHour }
				];
				break;
		}
		return options;
	};
	self.GetBucketOptions = function (field) {
		var options = [], formats = [], thousand, displayUnits = [], seconds = [];
		var modelField = modelFieldsHandler.GetFieldById(field.SourceField, self.Handler.Models.Angle.Data().model);
		var bucketValue = field.Bucket.Operator;
		var fieldType = field.Area === enumHandlers.FIELDSETTINGAREA.DATA ? field.DataType : modelField.fieldtype;
		var isSupportDecimal = WC.FormatHelper.IsSupportDecimal(fieldType);
		var isIntegerBucket = dataTypeModel.IsIntegerBucket(bucketValue, fieldType);

		if (field.FieldName === enumHandlers.AGGREGATION.COUNT.Value) {
			thousand = true;
		}
		else {
			if (field.Area === enumHandlers.FIELDSETTINGAREA.DATA) {
				thousand = true;
				jQuery.each(enumHandlers.AGGREGATION, function (key, aggregation) {
					self.AddBucketOptionAggregation(aggregation, modelField.fieldtype, options);
				});
				if (isSupportDecimal || !isIntegerBucket) {
					formats = self.GetBucketFormatOptions(fieldType, field.Area, field.Bucket.Operator, field.DomainURI);
				}
			}
			else {
				// if not aggreagation field
				options = self.GetBucketOptionsBy(fieldType);
				thousand = WC.FormatHelper.IsSupportThousandSeparator(fieldType);
				formats = self.GetBucketFormatOptions(fieldType, field.Area, field.Bucket.Operator, field.DomainURI);
			}
		}

		// display unit
		if (WC.FormatHelper.IsNumberFieldType(fieldType)) {
			displayUnits = dataTypeModel.GetDisplayPrefixByBucket(field.Bucket.Operator);
		}

		if (fieldType === enumHandlers.FIELDTYPE.TIME || fieldType === enumHandlers.FIELDTYPE.TIMESPAN) {
			seconds = self.AddUseDefaulToFormatList(fieldType, enumHandlers.TIMESECONDSFORMATLIST.slice());
		}

		return {
			options: options,
			formats: formats,
			units: displayUnits,
			thousand: thousand,
			seconds: seconds
		};
	};
	self.AddBucketOptionAggregation = function (aggregation, fieldType, options) {
		// do not add count
		// do not add option 'SUM' if fieldtype is 'TIME'
		var isCountAggr = aggregation.Value === enumHandlers.AGGREGATION.COUNT.Value;
		var isSumAggr = aggregation.Value === enumHandlers.AGGREGATION.SUM.Value;
		var isTimeFieldType = fieldType === enumHandlers.FIELDTYPE.TIME;
		var isValidTimeAggr = isTimeFieldType && !isSumAggr;
		if (!isCountAggr && (isValidTimeAggr || !isTimeFieldType)) {
			options.push({ id: aggregation.Value, name: aggregation.Text });
		}
	};
	self.AddUseDefaulToFormatList = function (fieldType, formatList) {
		if (formatList.length) {
			switch (fieldType) {
				case enumHandlers.FIELDTYPE.ENUM:
				case enumHandlers.FIELDTYPE.TIME:
				case enumHandlers.FIELDTYPE.TIMESPAN:
				case enumHandlers.FIELDTYPE.NUMBER:
				case enumHandlers.FIELDTYPE.INTEGER:
				case enumHandlers.FIELDTYPE.DOUBLE:
				case enumHandlers.FIELDTYPE.CURRENCY:
				case enumHandlers.FIELDTYPE.PERCENTAGE:
					formatList.unshift({
						name: Localization.FormatSetting_UseDefault,
						id: enumHandlers.FIELDSETTING.USEDEFAULT
					});
					break;
				default:
					break;
			}
		}

		return formatList;
	};
	self.ApplyBucketAlias = function (field, aliasNameElement) {

		var captionElement = jQuery('#' + field.InternalID + ' .caption');
		var captionHintElement = jQuery('#' + field.InternalID + ' .hint');
		var aliasNameValue = jQuery.trim(aliasNameElement.val());
		var currentUserLang = userSettingModel.GetByName(enumHandlers.USERSETTINGS.DEFAULT_LANGUAGES);
		var aliasNameObject = field.MultiLangAlias.findObject('lang', currentUserLang);

		if (!aliasNameValue || aliasNameValue === field.DefaultCaption) {
			if (aliasNameObject) {
				field.MultiLangAlias.removeObject('lang', currentUserLang);
			}
			captionElement.text(field.DefaultCaption);
			captionHintElement.text('');
		}
		else {
			// set to multilang alias name
			if (aliasNameObject) {
				aliasNameObject.text = aliasNameValue;
			}
			else {
				field.MultiLangAlias.push({
					lang: currentUserLang,
					text: aliasNameValue
				});
			}
			captionHintElement.text(field.DefaultCaption);
			captionElement.text(aliasNameValue);
		}

		var fields = self.FieldSettings.GetFields();
		var fieldModel = fields.findObject('InternalID', field.InternalID);

		fieldModel.Caption = captionElement.text() || fieldModel.DefaultCaption;
		fieldModel.MultiLangAlias = field.MultiLangAlias;
		self.FieldSettings.Fields = JSON.stringify(fields);
	};
	self.ApplyBucketSetting = function (field) {

		var modelUri = self.Handler.Models.Angle.Data().model;
		var eaField = modelFieldsHandler.GetFieldById(field.SourceField || field.FieldName, modelUri);
		var bucketValue = field.FieldName === enumHandlers.AGGREGATION.COUNT.Value ? field.FieldName : WC.HtmlHelper.DropdownList('#BucketOptionDropDown').value();
		var fieldDetails = WC.Utility.ParseJSON(field.FieldDetails);
		var fieldType = eaField.fieldtype;
		var isIntegerBucket = dataTypeModel.IsIntegerBucket(bucketValue, fieldType);

		fieldDetails[enumHandlers.FIELDDETAILPROPERTIES.PIVOTAREA] = self.GetAreaById(field.Area);

		// format
		delete fieldDetails[enumHandlers.FIELDDETAILPROPERTIES.FORMAT];
		var formatDropdown = WC.HtmlHelper.DropdownList('#BucketFormatOptionDropDown');
		if (formatDropdown && bucketValue === 'individual') {
			var bucketOptionFormat = formatDropdown.value();
			if (bucketOptionFormat && bucketOptionFormat !== enumHandlers.FIELDSETTING.USEDEFAULT)
				fieldDetails[enumHandlers.FIELDDETAILPROPERTIES.FORMAT] = bucketOptionFormat;
		}

		// second
		delete fieldDetails[enumHandlers.FIELDDETAILPROPERTIES.SECOND];
		var secondDropdown = WC.HtmlHelper.DropdownList('#SecondsFormatOptionDropDown');
		if (secondDropdown) {
			var secondValue = secondDropdown.value();
			userSettingsHandler.SetSecondFormat(fieldDetails, secondValue);
		}

		delete fieldDetails[enumHandlers.FIELDDETAILPROPERTIES.PREFIX];
		var unitDropdown = WC.HtmlHelper.DropdownList('#BucketDisplayUnitDropDown');
		if (unitDropdown) {
			var displayUnitFormat = unitDropdown.value();
			if (displayUnitFormat !== enumHandlers.FIELDSETTING.USEDEFAULT) {
				fieldDetails[enumHandlers.FIELDDETAILPROPERTIES.PREFIX] = dataTypeModel.GetCorrectPrefix(displayUnitFormat, bucketValue);
			}
		}

		delete fieldDetails[enumHandlers.FIELDDETAILPROPERTIES.DECIMALS];
		var decimalDropdown = WC.HtmlHelper.DropdownList('#BucketDecimalDropDown');
		if (decimalDropdown && !isIntegerBucket) {
			var deimalFormat = decimalDropdown.value();
			if (deimalFormat !== enumHandlers.FIELDSETTING.USEDEFAULT)
				fieldDetails[enumHandlers.FIELDDETAILPROPERTIES.DECIMALS] = deimalFormat;
		}

		// thousand seperate
		var isbucketThousandSepeate = jQuery('#UseBucketThousandSeperate').data('state');
		if (isbucketThousandSepeate === enumHandlers.CHECKSTATE.TRUE)
			fieldDetails[enumHandlers.FIELDDETAILPROPERTIES.THOUSANDSEPARATE] = true;
		else if (isbucketThousandSepeate === enumHandlers.CHECKSTATE.FALSE)
			fieldDetails[enumHandlers.FIELDDETAILPROPERTIES.THOUSANDSEPARATE] = false;
		else
			delete fieldDetails[enumHandlers.FIELDDETAILPROPERTIES.THOUSANDSEPARATE];


		// alias
		var aliasNameValue = jQuery.trim(jQuery('#BucketAliasName').val() || '');

		if (field.FieldDetails !== JSON.stringify(fieldDetails) || field.Bucket.Operator !== bucketValue || aliasNameValue !== field.Caption) {

			self.IsChangeFieldsSetting = true;
			var fields = self.FieldSettings.GetFields();
			var fieldModel = fields.findObject('InternalID', field.InternalID);
			fieldModel.FieldDetails = JSON.stringify(fieldDetails);

			if (bucketValue !== enumHandlers.AGGREGATION.COUNT.Value) {
				var fieldName = self.BuildAggregationFieldNameWithBucket(bucketValue, field.Bucket.source_field);
				var defaultCaption = self.GetFieldCaption(modelFieldsHandler.GetFieldById(field.Bucket.source_field, modelUri) || { id: field.Bucket.source_field }, bucketValue);

				fieldModel.DataType = self.GetCorrectDataType(bucketValue, fieldType, fieldModel.Area);
				fieldModel.FieldName = fieldName;
				fieldModel.Bucket.FieldName = self.BuildAggregationFieldNameWithBucket(bucketValue, field.Bucket.source_field);
				fieldModel.Operator = bucketValue;
				fieldModel.Bucket.Operator = bucketValue;
				fieldModel.DefaultCaption = defaultCaption;
				fieldModel.Caption = aliasNameValue || defaultCaption;
			}

			self.SetFieldFormat(fieldModel, fieldDetails);

			jQuery('.popupBucket:visible').data('field', fieldModel);

			self.FieldSettings.Fields = JSON.stringify(fields);
			self.BuildFieldsSettingsHtml();
		}
	};
	self.UpdateSettingLayout = function () {
		if (!jQuery('#FieldListArea').length)
			return;

		var container = jQuery('#FieldListArea'),
			height = jQuery('#AngleTableWrapper').height(),
			chartTypeContainer = container.children('.displayOptionsWrapper'),
			buttonContainer = container.children('.fieldListButton');
		if (chartTypeContainer.is(':visible')) {
			height -= chartTypeContainer.outerHeight();
		}
		if (buttonContainer.is(':visible')) {
			height -= buttonContainer.outerHeight();
		}
		jQuery('#FieldListArea .fieldListAreaInner').height(height);

		var dataArea = jQuery('#FieldListDataArea');
		if (container.find('.gaugeChartSettingWrapper').is(':visible')) {
			dataArea.height(height - dataArea.position().top - 5);
		}
		else {
			dataArea.removeAttr('style');
		}
	};

	// chart
	self.CreateDropdownChartType = function () {
		var displayDetails = self.FieldSettings.GetDisplayDetails(),
			chartTypes = [];

		jQuery.each(enumHandlers.CHARTTYPE, function (key, item) {
			chartTypes.push({ Name: item.Name, Code: item.Code, Usage: item.Usage });
		});

		// clear old dropdown
		jQuery('[id="ChartType-list"]').remove();

		WC.HtmlHelper.DropdownList('#ChartType', chartTypes, {
			height: 390,
			dataTextField: "Name",
			dataValueField: "Code",
			valueTemplate: '#= chartTypeDropdownlistTemplate.ValueTemplate(data) #',
			template: '#= chartTypeDropdownlistTemplate.GenerateTemplate(data.Code, data.Usage, data.Name) #',
			value: displayDetails.chart_type,
			open: function (e) {
				e.sender._isSelecting = false;
			},
			select: function (e) {
				e.sender._isSelecting = true;
				e.preventDefault();
			},
			close: function (e) {
				var isSelecting = e.sender._isSelecting;
				e.sender._isSelecting = false;
				if (isSelecting)
					e.preventDefault();
			},
			enable: true
		});
		self.SetActiveChartType(displayDetails.chart_type + (displayDetails.multi_axis ? '_multi' : (displayDetails.stack ? '_stack' : '')));
	};
	self.OnChartTypeSelected = function (className) {
		if (!jQuery('.ChartTypeItemHeader .ChartTypeUsage > span').hasClass(className)) {
			self.SetApplyButtonStatus(true);
		}

		self.SetActiveChartType(className);
		self.SetGaugeChartMode(className === enumHandlers.CHARTTYPE.GAUGE.Code);

		// checking will reset chart options or not?
		var previousChartType = self.FieldSettings.GetDisplayDetails().chart_type;
		var currentChartType = className.split('_')[0];
		self.CheckChartTypeOptions(previousChartType, currentChartType);

		self.UpdateSettingsAfterChange();

		var ddlChartType = WC.HtmlHelper.DropdownList('#ChartType');
		if (ddlChartType) {
			ddlChartType._isSelecting = false;
			ddlChartType.close();
		}
	};
	self.SetActiveChartType = function (className) {
		// clear class name
		self.SetChartAreaCaptions('');

		var chartTypeDropdownList = WC.HtmlHelper.DropdownList('#ChartType');
		if (chartTypeDropdownList) {

			var chartType = className.split('_')[0];
			chartTypeDropdownList.value(chartType);

			// set class name
			self.SetChartAreaCaptions(chartType);

			chartTypeDropdownList.wrapper.find('.ChartTypeUsage > span').attr('class', className);
			chartTypeDropdownList.wrapper.find('.ChartTypeUsage > span').attr('title', chartTypeDropdownlistTemplate.GetChartHintByClassName(className));

			chartTypeDropdownList.list.find('.ChartTypeUsage > span').removeClass('active');
			chartTypeDropdownList.list.find('.ChartTypeUsage span.' + className).addClass('active');
		}
	};
	self.SetChartAreaCaptions = function (chartType) {
		jQuery('#FieldListArea .rowArea h4').text(self.GetLocalizationTextByChartType(chartType, 'ChartRowArea'));
		jQuery('#FieldListArea .columnArea h4').text(self.GetLocalizationTextByChartType(chartType, 'ChartColumnArea'));
		jQuery('#FieldListArea .dataArea h4').text(self.GetLocalizationTextByChartType(chartType, 'ChartDataArea'));

		var className = chartType ? ' area_' + chartType : chartType;
		jQuery('#FieldListArea .rowArea').attr('class', 'fieldListAreaItem rowArea' + className);
		jQuery('#FieldListArea .columnArea').attr('class', 'fieldListAreaItem columnArea' + className);
		jQuery('#FieldListArea .dataArea').attr('class', 'fieldListAreaItem dataArea' + className);
	};
	self.UpdateSortableArea = function () {
		if (self.FieldSettings.CanSortDataField()) {
			jQuery('#FieldListDataArea').addClass('areaFieldSortable');
		}
		else {
			jQuery('#FieldListDataArea').removeClass('areaFieldSortable');
		}
	};

	// chart options
	self.LastChartScaleInfo = {
		RowField: null,
		ColumnField: null,
		DataFields: []
	};
	self.ShowDisplayOptionsPopup = function (displayType) {
		self.RemoveAllBucketPopup();
		self.RemoveDisplayOptionsPopup();

		if (jQuery('#ButtonDisplayOptions').hasClass('disabled')) {
			return;
		}

		// set template
		var template;
		var isPivot = displayType === self.FIELDSETTINGTYPE.PIVOT;

		if (isPivot) {
			template = self.PivotTemplateOptions();
		}
		else {
			var currentOptions = self.FieldSettings.GetDisplayDetails();
			template = self.ChartTemplateOptions(currentOptions.chart_type);
		}

		// set html
		var popup = jQuery(template).appendTo('body');
		var element = jQuery('#ButtonDisplayOptions');

		if (isPivot) {
			self.CreatePivotDisplayOptions();
		}
		else {
			self.CreateChartDisplayOptions(popup);
		}

		// calculate position
		var position = element.offset();
		var width = element.outerWidth();
		var popupOffsetTop = position.top + 35;
		var bottomSpace = WC.Window.Height - position.top - 15;
		var topSpace = WC.Window.Height - bottomSpace + 20;
		var maxPopupHeight = Math.floor(Math.max(bottomSpace, topSpace));
		popup.find('.k-window-content').css('max-height', maxPopupHeight - 56);
		var popupHeight = popup.outerHeight();
		var css = {
			left: position.left + width + 13
		};
		var cssClass;
		if (topSpace > bottomSpace) {
			css.top = popupOffsetTop - popupHeight + 52;
			cssClass = 'k-window-arrow-sw';
		}
		else {
			css.top = popupOffsetTop;
			cssClass = '';
		}

		popup.css(css).addClass(cssClass);
	};
	self.RemoveDisplayOptionsPopup = function () {
		self.CleanFieldSettingsPopup('#PopupChartOptions');
	};
	self.CreatePivotDisplayOptions = function () {

		var displayDetails = self.FieldSettings.GetDisplayDetails();

		WC.HtmlHelper.DropdownList('#ShowTotalFor', enumHandlers.PIVOTSHOWTOTALMODES, {
			value: (!IsUndefindedOrNull(displayDetails.show_total_for) ? displayDetails.show_total_for : 1) + '',
			change: function (e) {
				self.SetApplyButtonStatus(true);
				self.IsNeedResetLayout = true;
				var showTotalForDropdownValue = parseInt(e.sender.value());
				self.FieldSettings.SetDisplayDetails({ show_total_for: showTotalForDropdownValue });
				self.ChangeIncludeSubtotalsControlStatus(showTotalForDropdownValue === 0);
			},
			enable: true
		});

		// Percentage drpodown
		WC.HtmlHelper.DropdownList('#PercentageSummaryDropDown', enumHandlers.PERCENTAGESUMMARYTYPES, {
			value: (displayDetails.percentage_summary_type || 0) + '',
			change: function (e) {
				self.SetApplyButtonStatus(true);
				self.IsNeedResetLayout = true;
				var percentageSummaryValue = parseInt(e.sender.value());
				self.FieldSettings.SetDisplayDetails({ percentage_summary_type: percentageSummaryValue });
			},
			enable: true
		});

		// set include subtotal
		if (typeof displayDetails.show_total_for !== 'undefined' && displayDetails.show_total_for === 0) {
			jQuery('#chkIncludeSubtotal').prop('disabled', true);
		}
		jQuery('#chkIncludeSubtotal').prop('checked', displayDetails.include_subtotals !== undefined ? displayDetails.include_subtotals : false);

	};
	self.CreateChartDisplayOptions = function (popup) {
		self.CheckChartScaleRanges();

		var currentOptions = self.FieldSettings.GetDisplayDetails();

		// initial ui
		popup.find('.eaDropdown').each(function (index, dropdown) {
			dropdown = jQuery(dropdown);

			var optionId = dropdown.data('id');
			var optionDefault = currentOptions[optionId] || null;
			var options = [];
			jQuery.each(self.CHARTOPTIONS[optionId], function (index, option) {
				options.push({
					id: option.Id,
					name: option.Text
				});

				if (option.IsDefault && !optionDefault) {
					optionDefault = option.Id;
				}
			});

			WC.HtmlHelper.DropdownList(dropdown, options, {
				value: optionDefault,
				change: function (e) {
					var optionId = e.sender.element.data('id');
					var currentOptions = self.FieldSettings.GetDisplayDetails();
					currentOptions[optionId] = e.sender.value();

					if (optionId === self.OptionAxisScaleId) {
						self.UpdateChartScaleRanges(currentOptions);
					}
					else {
						self.FieldSettings.SetDisplayDetails(currentOptions, true);
					}

					self.SetApplyButtonStatus(true);
				}
			});

			if (optionId === self.OptionAxisScaleId) {
				self.UpdateChartScaleRanges(currentOptions);
			}
		});

		popup.find('input[type="checkbox"]').each(function (index, checkbox) {
			checkbox = jQuery(checkbox);
			var checkboxId = checkbox.data('id');
			var defaultValue = !!currentOptions[checkboxId];
			checkbox.prop('checked', defaultValue);
			checkbox.change(function (e) {
				var optionId = jQuery(e.currentTarget).data('id');
				currentOptions[optionId] = e.target.checked;
				self.FieldSettings.SetDisplayDetails(currentOptions, true);
				self.SetApplyButtonStatus(true);
			});

			if (checkboxId === 'show_as_percentage' && !self.ChartCanShowAsPercentage(currentOptions))
				checkbox.parent().hide();
		});
	};
	self.ChartCanShowAsPercentage = function (currentOptions) {
		var supportChartTypes = [
			enumHandlers.CHARTTYPE.AREACHART.Code,
			enumHandlers.CHARTTYPE.BARCHART.Code,
			enumHandlers.CHARTTYPE.COLUMNCHART.Code,
			enumHandlers.CHARTTYPE.LINECHART.Code
		];
		var isSupportChartType = jQuery.inArray(currentOptions.chart_type, supportChartTypes) !== -1;
		var isSupportStackType = currentOptions.multi_axis || (!currentOptions.multi_axis && currentOptions.stack);

		return isSupportChartType && isSupportStackType;
	};
	self.GetChartTypeGroup = function (chartType) {
		if (jQuery.inArray(chartType, [enumHandlers.CHARTTYPE.GAUGE.Code]) !== -1) {
			return self.CHARTGROUP.GAUGE;
		}
		else if (jQuery.inArray(chartType, [enumHandlers.CHARTTYPE.RADARCHART.Code]) !== -1) {
			return self.CHARTGROUP.RADAR;
		}
		else if (jQuery.inArray(chartType, [enumHandlers.CHARTTYPE.PIECHART.Code, enumHandlers.CHARTTYPE.DONUTCHART.Code]) !== -1) {
			return self.CHARTGROUP.PIE;
		}
		else {
			return self.CHARTGROUP.BOX;
		}
	};
	self.CheckChartTypeOptions = function (previousChartType, currentChartType) {
		// reset chart options if switch to a difference type
		var previousChartGroup = self.GetChartTypeGroup(previousChartType);
		var currentChartGroup = self.GetChartTypeGroup(currentChartType);
		if ((previousChartGroup !== self.CHARTGROUP.GAUGE || currentChartGroup !== self.CHARTGROUP.GAUGE)
			&& (previousChartGroup !== self.CHARTGROUP.RADAR || currentChartGroup !== self.CHARTGROUP.RADAR)
			&& (previousChartGroup !== self.CHARTGROUP.PIE || currentChartGroup !== self.CHARTGROUP.PIE)
			&& (previousChartGroup !== self.CHARTGROUP.BOX || currentChartGroup !== self.CHARTGROUP.BOX)) {

			// clear exisitng chart options
			var displayDetails = self.FieldSettings.GetDisplayDetails();
			jQuery.each(displayDetails, function (key) {
				if (typeof self.CHARTOPTIONS[key] !== 'undefined') {
					delete displayDetails[key];
				}
			});

			// set default options
			var defaultOptions = self.GetChartOptionsByGroup(currentChartGroup);
			jQuery.each(defaultOptions, function (index, option) {
				displayDetails[option.name] = option.options.findObject('IsDefault', true).Id;
			});

			self.FieldSettings.SetDisplayDetails(displayDetails, true);
		}
	};
	self.GetChartOptionsByGroup = function (chartGroup) {
		if (chartGroup === self.CHARTGROUP.GAUGE) {
			return [
				{ name: 'axistitlegauge', options: self.CHARTOPTIONS.axistitlegauge },
				{ name: 'datalabelgauge', options: self.CHARTOPTIONS.datalabelgauge },
				{ name: 'rangesgauge', options: self.CHARTOPTIONS.rangesgauge }
			];
		}
		else if (chartGroup === self.CHARTGROUP.RADAR) {
			return [
				{ name: 'axisvalueradar', options: self.CHARTOPTIONS.axisvalueradar },
				{ name: 'datalabel', options: self.CHARTOPTIONS.datalabel },
				{ name: 'gridlineradar', options: self.CHARTOPTIONS.gridlineradar },
				{ name: 'gridlinetype', options: self.CHARTOPTIONS.gridlinetype },
				{ name: 'legend', options: self.CHARTOPTIONS.legend }
			];
		}
		else if (chartGroup === self.CHARTGROUP.PIE) {
			return [
				{ name: 'datalabel', options: self.CHARTOPTIONS.datalabel },
				{ name: 'legend', options: self.CHARTOPTIONS.legend }
			];
		}
		else {
			return [
				{ name: 'axistitle', options: self.CHARTOPTIONS.axistitle },
				{ name: 'axisvalue', options: self.CHARTOPTIONS.axisvalue },
				{ name: 'datalabel', options: self.CHARTOPTIONS.datalabel },
				{ name: 'gridline', options: self.CHARTOPTIONS.gridline },
				{ name: 'legend', options: self.CHARTOPTIONS.legend }
			];
		}
	};
	self.UpdateChartScaleRanges = function (currentOptions) {
		var scaleMode = currentOptions[self.OptionAxisScaleId] || self.CHARTSCALETYPE.AUTOMATIC;
		var rangeElement = jQuery('#ChartAxisScaleRanges').empty();
		if (scaleMode === self.CHARTSCALETYPE.AUTOMATIC) {
			delete currentOptions[self.OptionAxisScaleRangesId];
		}
		else {
			var canUseOldChartScale = self.CanUseCurrentChartScale();
			var savedChartScales = self.Handler.FieldSettings.GetDisplayDetails()[self.OptionAxisScaleRangesId];
			var defaultChartScales = self.GetChartScalesFromDisplay();
			var unsaveChartScales = currentOptions[self.OptionAxisScaleRangesId];
			currentOptions[self.OptionAxisScaleRangesId] = canUseOldChartScale ? jQuery.extend({}, defaultChartScales, savedChartScales, unsaveChartScales) : {};
			var scales = currentOptions[self.OptionAxisScaleRangesId];
			var dataFields = self.FieldSettings.GetFields(enumHandlers.FIELDSETTINGAREA.DATA).findObjects('IsSelected', true);

			jQuery.each(dataFields, function (index, field) {
				if (self.CanSetChartScale(index)) {
					var fieldFormatSettings = self.CreateChartScaleFormatSettings(field, self.Handler.Models.Angle.Data().model);
					var boundary = self.GetChartScaleBoundary(fieldFormatSettings, scales[field.FieldName]);
					var element = self.CreateChartScaleElement(rangeElement, index, field.Caption, fieldFormatSettings.suffix);
					self.CreateInputChartScales(fieldFormatSettings, field.FieldName, element.filter('input:eq(0)'), element.filter('input:eq(1)'), boundary.lower, boundary.upper);
				}
			});
		}
		self.FieldSettings.SetDisplayDetails(currentOptions, true);
		self.SetLastChartScaleInfo();
	};
	self.CanSetChartScale = function (index) {
		var isBubbleChartType = self.FieldSettings.GetDisplayDetails().chart_type === enumHandlers.CHARTTYPE.BUBBLECHART.Code;
		return index < 2 && (!isBubbleChartType || (isBubbleChartType && index === 0));
	};
	self.ApplyChartScaleRanges = function (isInputLower, inputLower, inputUpper, fieldId, fieldFormatter) {
		var valueLower = inputLower.value() || 0;
		var valueUpper = inputUpper.value() || 0;
		var delta = fieldFormatter.type === enumHandlers.FIELDTYPE.PERCENTAGE ? 0.01 : 1;

		if (isInputLower && valueUpper <= valueLower) {
			valueUpper = valueLower + delta;
		}
		else if (!isInputLower && valueUpper <= valueLower) {
			valueLower = valueUpper - delta;
		}

		inputLower.value(valueLower);
		inputUpper.value(valueUpper);

		if (fieldFormatter.prefix === enumHandlers.DISPLAYUNITSFORMAT.THOUSANDS) {
			valueLower = WC.FormatHelper.ThousandsToNumber(valueLower);
			valueUpper = WC.FormatHelper.ThousandsToNumber(valueUpper);
		}
		else if (fieldFormatter.prefix === enumHandlers.DISPLAYUNITSFORMAT.MILLIONS) {
			valueLower = WC.FormatHelper.MillionsToNumber(valueLower);
			valueUpper = WC.FormatHelper.MillionsToNumber(valueUpper);
		}

		var majorUnit = kendo.dataviz.autoMajorUnit(valueLower, valueUpper);
		if (fieldFormatter.type === enumHandlers.FIELDTYPE.INTEGER) {
			majorUnit = Math.max(1, Math.floor(majorUnit));
		}

		var scales = self.FieldSettings.GetDisplayDetails()[self.OptionAxisScaleRangesId] || {};
		scales[fieldId] = [valueLower, valueUpper, majorUnit];

		var setting = {};
		setting[self.OptionAxisScaleRangesId] = scales;
		self.FieldSettings.SetDisplayDetails(setting);
		self.SetApplyButtonStatus(true);
	};
	self.CanUseCurrentChartScale = function () {

		// field setting fields
		var currentDataFields = [];
		var currentOtherFields = [];
		jQuery.each(self.FieldSettings.GetFields(), function (index, field) {
			if (field.IsSelected) {
				if (field.Area === enumHandlers.FIELDSETTINGAREA.DATA) {
					currentDataFields.push({
						FieldName: field.FieldName,
						Area: field.Area
					});
				}
				else {
					currentOtherFields.push({
						FieldName: field.FieldName,
						Area: field.Area
					});
				}
			}
		});

		// chart fields
		var appliedDataFields = [];
		var appliedOtherFields = [];
		jQuery.each(self.Handler.FieldSettings.GetFields(), function (index, field) {
			if (field.IsSelected) {
				if (field.Area === enumHandlers.FIELDSETTINGAREA.DATA) {
					appliedDataFields.push({
						FieldName: field.FieldName,
						Area: field.Area
					});
				}
				else {
					appliedOtherFields.push({
						FieldName: field.FieldName,
						Area: field.Area
					});
				}
			}
		});

		return jQuery.deepCompare(currentDataFields, appliedDataFields, false, true) && jQuery.deepCompare(currentOtherFields, appliedOtherFields, false, false);
	};
	self.GetChartScalesFromDisplay = function () {
		var chartType = self.FieldSettings.GetDisplayDetails().chart_type;
		var isScatterOrBubble = self.Handler.IsScatterOrBubbleChartType(chartType);
		var dataFields = self.Handler.FieldSettings.GetFields(enumHandlers.FIELDSETTINGAREA.DATA).findObjects('IsSelected', true);
		var scales = {}, stack, boundary;
		jQuery.each(dataFields, function (index, field) {
			if (isScatterOrBubble) {
				stack = false;
			}
			else {
				var seriesChartType = self.Handler.GetMultiAxisChartType(index, chartType);
				stack = self.Handler.GetMultiAxisStack(seriesChartType);
			}
			boundary = self.Handler.CalculateValuesBoundary(self.Handler.Series, field.FieldName, stack);
			scales[field.FieldName] = [boundary.min, boundary.max, boundary.majorUnit];
		});
		return scales;
	};
	self.GetChartScaleBoundary = function (fieldFormatSettings, scale) {
		// use a default if no scale
		if (!scale) {
			scale = [0, 1, 1];
		}

		// convert scales by each settings
		var valueLower = scale[0];
		var valueUpper = scale[1];

		if (fieldFormatSettings.prefix === enumHandlers.DISPLAYUNITSFORMAT.THOUSANDS) {
			valueLower = WC.FormatHelper.NumberToThousands(valueLower);
			valueUpper = WC.FormatHelper.NumberToThousands(valueUpper);
		}
		else if (fieldFormatSettings.prefix === enumHandlers.DISPLAYUNITSFORMAT.MILLIONS) {
			valueLower = WC.FormatHelper.NumberToMillions(valueLower);
			valueUpper = WC.FormatHelper.NumberToMillions(valueUpper);
		}

		// handle decimal points
		var addDecimals = fieldFormatSettings.type === enumHandlers.FIELDTYPE.PERCENTAGE ? 2 : 0;
		valueLower = parseFloat(valueLower.toFixed(fieldFormatSettings.decimals + addDecimals));
		valueUpper = parseFloat(valueUpper.toFixed(fieldFormatSettings.decimals + addDecimals));

		// upper must greater than lower
		if (valueUpper <= valueLower) {
			valueUpper = valueLower + 1;
		}

		return {
			lower: valueLower,
			upper: valueUpper
		};
	};
	self.CreateChartScaleElement = function (container, index, caption, suffix) {
		var template = [
			'<label class="ExtendTitle" title="{1}">{1}</label>',
			'<input type="text" id="input{0}-1" class="eaNumeric noSpinners inputScale1{3}" />',
			'<span class="labelScale1{3}">{4}</span>',
			'<input type="text" id="input{0}-2" class="eaNumeric noSpinners inputScale2{3}" />',
			'<span class="labelScale2{3}">{2}</span>'
		].join('');
		var extendCssClass = suffix ? ' suffix' : '';
		var element = jQuery(kendo.format(template, index, caption, suffix, extendCssClass, Localization.To));
		container.append(element);
		return element;
	};
	self.CreateInputChartScales = function (fieldFormatSettings, fieldId, elementLower, elementUpper, valueLower, valueUpper) {
		var inputFormatter = new Formatter({
			decimals: fieldFormatSettings.decimals,
			thousandseparator: fieldFormatSettings.thousandseparator
		}, enumHandlers.FIELDTYPE.NUMBER);
		var format = WC.FormatHelper.GetFormatter(inputFormatter);
		var uiName = fieldFormatSettings.type === enumHandlers.FIELDTYPE.PERCENTAGE ? enumHandlers.KENDOUITYPE.PERCENTAGETEXT : enumHandlers.KENDOUITYPE.NUMERICTEXT;
		var inputLower, inputUpper;

		// 1st input
		var inputLowerChanged = function () {
			self.ApplyChartScaleRanges(true, inputLower, inputUpper, fieldId, fieldFormatSettings);
		};
		inputLower = elementLower[uiName]({
			value: valueLower,
			step: 1,
			spinners: false,
			format: format,
			decimals: fieldFormatSettings.decimals,
			change: inputLowerChanged,
			spin: inputLowerChanged
		}).data(uiName);

		// 2nd input
		var inputUpperChanged = function () {
			self.ApplyChartScaleRanges(false, inputLower, inputUpper, fieldId, fieldFormatSettings);
		};
		inputUpper = elementUpper[uiName]({
			value: valueUpper,
			step: 1,
			spinners: false,
			format: format,
			decimals: fieldFormatSettings.decimals,
			change: inputUpperChanged,
			spin: inputUpperChanged
		}).data(uiName);
	};
	self.CheckChartScaleRanges = function () {
		var currentChartScaleInfo = self.GetChartScaleInfo();
		var chartDetails = self.FieldSettings.GetDisplayDetails();
		if (!jQuery.deepCompare(self.LastChartScaleInfo, currentChartScaleInfo) && chartDetails[self.OptionAxisScaleId] !== self.CHARTSCALETYPE.AUTOMATIC) {
			self.SetChartToAutoScaleMode();
		}
	};
	self.SetChartToAutoScaleMode = function () {
		var chartDetails = self.FieldSettings.GetDisplayDetails();
		chartDetails[self.OptionAxisScaleId] = self.CHARTSCALETYPE.AUTOMATIC;
		delete chartDetails[self.OptionAxisScaleRangesId];
		self.FieldSettings.SetDisplayDetails(chartDetails, true);
	};
	self.GetChartScaleInfo = function () {
		var info = {
			RowField: null,
			ColumnField: null,
			DataFields: []
		};

		jQuery.each(self.FieldSettings.GetFields(), function (inde, field) {
			if (field.IsSelected) {
				if (field.Area === enumHandlers.FIELDSETTINGAREA.ROW) {
					info.RowField = field.FieldName;
				}
				else if (field.Area === enumHandlers.FIELDSETTINGAREA.COLUMN) {
					info.ColumnField = field.FieldName;
				}
				else {
					info.DataFields.push(field.FieldName);
				}
			}
		});

		return info;
	};
	self.SetLastChartScaleInfo = function () {
		self.LastChartScaleInfo = self.GetChartScaleInfo();
	};
	self.CreateChartScaleFormatSettings = function (field, modelUri) {
		var fieldFormatSettings = self.CreateFieldFormatSettings(field, modelUri);

		// specially for time & timespan
		if (fieldFormatSettings.type === enumHandlers.FIELDTYPE.TIMESPAN
			|| fieldFormatSettings.type === enumHandlers.FIELDTYPE.TIME) {
			var doubleFormatSettings = WC.FormatHelper.GetUserDefaultFormatSettings(enumHandlers.FIELDTYPE.DOUBLE);
			fieldFormatSettings.decimals = doubleFormatSettings.decimals;
			fieldFormatSettings.thousandseparator = doubleFormatSettings.thousandseparator;

			// add suffix for timespan
			if (fieldFormatSettings.type === enumHandlers.FIELDTYPE.TIMESPAN)
				fieldFormatSettings.suffix = window.textDays;
			else
				fieldFormatSettings.suffix = Captions.Label_FieldFormat_Seconds.toLowerCase();
		}
		return fieldFormatSettings;
	};

	// gauge
	self.SetGaugeChartMode = function (disabled) {
		if (disabled) {
			var dataField = self.FieldSettings.GetFields(enumHandlers.FIELDSETTINGAREA.DATA).findObject('IsSelected', true);
			var dataType = dataField.DataType;
			var formatter = new Formatter({ thousandseparator: true }, enumHandlers.FIELDTYPE.INTEGER);
			var formatTemplate = WC.FormatHelper.GetFormatter(formatter);

			var displayDetails = self.FieldSettings.GetDisplayDetails();
			var defaultColors = WC.Utility.ToArray(displayDetails.GaugeColours);
			if (!defaultColors.length)
				defaultColors = self.Handler.GAUGEDEFAULT.COLOURS.slice();

			var defaultValues = WC.Utility.ToArray(displayDetails.GaugeValues);
			if (!defaultValues.length)
				defaultValues = self.Handler.GAUGEDEFAULT.VALUES.slice();

			var uiName, uiAlternateName;
			if (dataType === enumHandlers.FIELDTYPE.PERCENTAGE) {
				uiName = enumHandlers.KENDOUITYPE.PERCENTAGETEXT;
				uiAlternateName = enumHandlers.KENDOUITYPE.NUMERICTEXT;
			}
			else {
				uiName = enumHandlers.KENDOUITYPE.NUMERICTEXT;
				uiAlternateName = enumHandlers.KENDOUITYPE.PERCENTAGETEXT;
			}

			var isUICreated = !!jQuery('#gaugeValue1').data('role');
			var getNumericeInput = function (index) {
				var uiInput = jQuery('#gaugeValue' + index).data(uiName);
				if (uiInput) {
					uiInput.setOptions({ format: formatTemplate });
					uiInput._blur();
				}
				else {
					uiInput = jQuery('#gaugeValue' + index).data(uiAlternateName);
					uiInput.destroy();
					uiInput.wrapper.replaceWith(uiInput.element.removeData('role').removeAttr('data-role'));
					uiInput = null;
				}
				return uiInput;
			};
			var createNumericeInput = function (index) {
				jQuery("#gaugeValue" + index)[uiName]({
					step: 1,
					format: formatTemplate,
					value: defaultValues[index - 1],
					change: self.OnGaugeSettingChanged,
					spin: self.OnGaugeSettingChanged
				}).data(uiName).element.keyup(self.OnGaugeSettingChanged);
			};
			var createColorInput = function (index) {
				var uiColor = jQuery("#gaugeColorPicker" + index).kendoCustomColorPicker({
					value: defaultColors[index - 1],
					change: self.OnGaugeSettingChanged,
					messages: {
						apply: Localization.Ok,
						cancel: Localization.Cancel
					}
				}).data(enumHandlers.KENDOUITYPE.COLOURPICKER);
				uiColor.wrapper.addClass('eaColorPicker');
			};

			for (var i = 1; i <= 6; i++) {
				var uiInput = null;
				if (isUICreated) {
					uiInput = getNumericeInput(i);
				}

				if (!uiInput) {
					createNumericeInput(i);
				}

				if (!isUICreated && i <= 5) {
					createColorInput(i);
				}
			}
			jQuery('#FieldListArea').attr('class', 'fieldListArea fieldListAreaChartGauge');
		}
		else {
			jQuery('#FieldListArea').attr('class', 'fieldListArea fieldListAreaChart');
		}

		self.UpdateSettingLayout();
	};
	self.OnGaugeSettingChanged = function () {
		self.UpdateGaugeSettings();
		self.SetApplyButtonStatus(true);
	};
	self.UpdateGaugeSettings = function () {
		self.FieldSettings.SetDisplayDetails(self.GetGaugeSettings());
	};
	self.GetGaugeSettings = function () {
		var settings = {
			GaugeValues: [],
			GaugeColours: []
		};

		var uiName = jQuery("#gaugeValue1").data('role') === 'numerictextbox' ? enumHandlers.KENDOUITYPE.NUMERICTEXT : enumHandlers.KENDOUITYPE.PERCENTAGETEXT;
		for (var i = 1; i <= 6; i++) {
			settings.GaugeValues.push(jQuery("#gaugeValue" + i).data(uiName).value());

			if (i <= 5)
				settings.GaugeColours.push(jQuery("#gaugeColorPicker" + i).data(enumHandlers.KENDOUITYPE.COLOURPICKER).value());
		}

		return settings;
	};
	self.SetGaugeApplyValues = function () {
		var details = self.FieldSettings.GetDisplayDetails();
		self.Handler.GaugeValues = details.GaugeValues.slice();
		self.Handler.GaugeColours = details.GaugeColours.slice();

	};
	self.CheckASCOrderGaugeValues = function (values) {
		var result = false;
		values = WC.Utility.ToArray(values);

		for (var i = 1; i <= 5; i++) {
			var valueOne = values[i - 1];
			var valueTwo = values[i];

			if (valueOne !== valueTwo) {
				result = valueOne < valueTwo;
			}
		}

		return result;
	};
	/*EOF: Model Methods*/
}
