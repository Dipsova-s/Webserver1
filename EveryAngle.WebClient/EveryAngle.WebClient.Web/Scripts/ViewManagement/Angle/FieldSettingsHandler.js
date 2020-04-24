var fieldSettingsHandler = new FieldSettingsHandler();

function FieldSettingsHandler() {
    "use strict";

    var self = this;
    var _self = {};

    /*BOF: Model Properties*/
    self.FieldSettings = null;
    self.IsNeedResetLayout = false;
    self.FIELDSETTINGTYPE = {
        PIVOT: 'pivot',
        CHART: 'chart',
        CHARTGAUGE: 'chart-gauge'
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
                Id: ChartOptionsHandler.ScaleType.Automatic,
                Text: Captions.Label_ChartOptions_AxisScale_Automatic,
                IsDefault: true
            },
            {
                Id: ChartOptionsHandler.ScaleType.Manual,
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
    self.HandlerValidation = {
        Valid: true,
        Angle: validationHandler.GetAngleValidation(null),
        Display: validationHandler.GetDisplayValidation(null)
    };

    self.Handler = null;
    /*EOF: Model Properties*/

    /*BOF: Model Methods*/
    // get field type of model field
    // params:
    // - obj: model field (ModelFieldModel) or field in field setting (self.FieldSettings.Field)
    _self.GetFieldType = function (obj) {
        return obj.fieldtype || obj.DataType;
    };

    // public method
    self.UpdateValidation = function () {
        self.HandlerValidation.Angle = validationHandler.GetAngleValidation(self.Handler.Models.Angle.Data());
        self.HandlerValidation.Display = validationHandler.GetDisplayValidation(self.Handler.Models.Display.Data(), self.Handler.Models.Angle.Data().model);
        self.HandlerValidation.Valid = self.HandlerValidation.Angle.Valid && self.HandlerValidation.Valid;
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

        field.CellFormatType = enumHandlers.DEVXPRESSFORMATTYPE.CUSTOM;
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

    self.SetFieldModel = function (field, defaultCaption, caption, sourceField, operatorValue, fieldName, cssClass, area, defaultOperator, fieldType, isSelected) { //NOSONAR
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
                if (fieldDetailObject[enumHandlers.FIELDDETAILPROPERTIES.AREA]) {
                    fieldArea = self.GetAreaByName(fieldDetailObject[enumHandlers.FIELDDETAILPROPERTIES.AREA]);
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
        self.SetFieldModel(fieldModel, defaultCaption, caption, sourceField, operatorValue, fieldName, cssClassField, fieldArea, '', dataType, true);
        self.SetFieldFormat(fieldModel, fieldDetailObject);
        self.SetSorting(fieldModel, fieldDetailObject.sorting);
        if (displayField) {
            fieldModel.Valid = displayField.valid !== false;
            fieldModel.ValidError = validationHandler.GetValidationError(displayField, self.Handler.Models.Angle.Data().model);
        }
        else {
            fieldModel.Valid = true;
            fieldModel.ValidError = '';
        }
        return fieldModel;
    };

    self.BuildFieldsSettings = function (options) {
        // update validation handler
        self.UpdateValidation();

        var displayType = self.Handler.Models.Display.Data().display_type;
        var componentId = self.Handler.ModelId;

        // pivot:1, chart:2
        var displayTypeEnum;

        var isDashBoard = self.Handler.DashBoardMode();
        var isReadOnly = false;
        var aggregationQuerySteps = self.Handler.Models.DisplayQueryBlock.GetQueryStepByType(enumHandlers.FILTERTYPE.AGGREGATION);
        var sortbySummaryInfo = [];
        var showTotalFor;
        var percentageSummaryType;
        var isIncludeSubtotals = false;
        var totalsLocation;

        // display_details
        var displayDetails = WC.Utility.ParseJSON(self.Handler.Models.Display.Data().display_details);

        if (displayType === enumHandlers.DISPLAYTYPE.PIVOT) {
            displayTypeEnum = 1;
            componentId = self.Handler.PivotId;
            isReadOnly = self.Handler.ReadOnly();
            showTotalFor = self.GetShowTotalForSetting(displayDetails);
            percentageSummaryType = self.GetPercentageSummaryTypeSetting(displayDetails);
            isIncludeSubtotals = self.GetIncludeSubtotalsSetting(displayDetails);
            totalsLocation = self.GetTotalsLocationSetting(displayDetails);
            sortbySummaryInfo = WC.Utility.ParseJSON(displayDetails.sort_by_summary_info, []);
        }
        else if (displayType === enumHandlers.DISPLAYTYPE.CHART) {
            displayTypeEnum = 0;

            if (!displayDetails.chart_type) {
                displayDetails = {
                    chart_type: enumHandlers.CHARTTYPE.COLUMNCHART.Code,
                    stack: false,
                    multi_axis: false
                };
            }
        }
        if (!displayDetails.count_index)
            displayDetails.count_index = 0;

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
        fieldSettingsModel.DefaultCurrency = userSettingModel.Data().default_currency;
        fieldSettingsModel.TotalForType = showTotalFor;
        fieldSettingsModel.IsIncludeSubTotals = isIncludeSubtotals;
        fieldSettingsModel.PercentageSummaryType = percentageSummaryType;
        fieldSettingsModel.DisplayDetails = JSON.stringify(displayDetails);
        fieldSettingsModel.Layout = layout;
        fieldSettingsModel.IsNeedResetLayout = self.IsNeedResetLayout;
        fieldSettingsModel.SortBySummaryInfo = sortbySummaryInfo;
        fieldSettingsModel.MaxPageSize = self.DetermineMaxPageSize(self.Handler.Models.Angle.Data().model, displayType);
        fieldSettingsModel.RequestsPerGroup = self.GetRequestsPerGroup(self.Handler.Models.Angle.Data().model);
        fieldSettingsModel.FirstDayOfWeek = WC.DateHelper.GetFirstDayOfWeek(self.Handler.Models.Angle.Data().model);
        fieldSettingsModel.TotalsLocation = totalsLocation;
        jQuery.extend(fieldSettingsModel, options);
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

            self.SetFieldModel(fieldModel, fieldCaption, fieldCaption, sourceField, operatorValue, fieldName, 'data', enumHandlers.FIELDSETTINGAREA.DATA, '', enumHandlers.FIELDTYPE.INTEGER, false);
            self.SetFieldFormat(fieldModel, {});
            fields.splice(Math.min(groupFieldCount + displayDetails.count_index, fields.length), 0, fieldModel);
        }

        fieldSettingsModel.Fields = JSON.stringify(fields);
        self.Handler.FieldSettings = new FieldSettingsModel(fieldSettingsModel);
    };
    self.GetShowTotalForSetting = function (displayDetails) {
        var showTotalFor = IsUndefindedOrNull(displayDetails.show_total_for)
            ? enumHandlers.PIVOTSHOWTOTALMODES[1].id
            : displayDetails.show_total_for;
        return parseInt(showTotalFor);
    };
    self.GetPercentageSummaryTypeSetting = function (displayDetails) {
        var percentageSummaryType = IsUndefindedOrNull(displayDetails.percentage_summary_type)
            ? enumHandlers.PERCENTAGESUMMARYTYPES[0].id
            : displayDetails.percentage_summary_type;
        return parseInt(percentageSummaryType);
    };
    self.GetIncludeSubtotalsSetting = function (displayDetails) {
        return displayDetails.include_subtotals || false;
    };
    self.GetTotalsLocationSetting = function (displayDetails) {
        return IsUndefindedOrNull(displayDetails.totals_location)
            ? enumHandlers.PIVOTTOTALSLOCATION.FAR.Value
            : displayDetails.totals_location;
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
        return currentModel && currentModel.id === 'EA4IT' && displayType === enumHandlers.DISPLAYTYPE.PIVOT ? systemSettingHandler.GetApplicationServerMaxPageSize() : systemSettingHandler.GetMaxPageSize();
    };
    self.ResetFieldSettings = function () {
        self.FieldSettings = new FieldSettingsModel(self.Handler.FieldSettings);
    };
    self.SetSorting = function (field, sortDirection) {
        sortDirection = sortDirection || '';

        var fieldDetails = WC.Utility.ParseJSON(field.FieldDetails);
        fieldDetails.sorting = sortDirection;

        field.FieldDetails = JSON.stringify(fieldDetails);
        field.SortDirection = sortDirection;
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
        if (fieldDetail.Area === enumHandlers.FIELDSETTINGAREA.DATA
            || window[target].FieldSettings.DisplayType === window[target].FieldSettings.ComponentType.CHART) {
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
            template = template.replace(/#CanFormat#/g, handler.Models.Result.Data().authorizations.change_field_collection ? '' : ' disabled');

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
            var canAddFilter = self.HandlerValidation.Angle.CanPostResult && self.HandlerValidation.Display.CanPostResult && handler.Models.Result.Data().authorizations.add_filter;
            template = template.replace(/#VisibleFilter#/g, '');
            template = template.replace(/#CanAddFilter#/g, canAddFilter ? '' : ' disabled');

            // format
            var canFormatField = self.HandlerValidation.Angle.CanPostResult && self.HandlerValidation.Display.CanPostResult && handler.Models.Result.Data().authorizations.change_field_collection;
            template = template.replace(/#VisibleFormat#/g, '');
            template = template.replace(/#CanFormat#/g, canFormatField ? '' : ' disabled');

            // info
            template = template.replace(/#VisibleViewInfo#/g, '');
            template = template.replace(/#CanViewInfo#/g, '');
        }

        return template;
    };
    self.ShowFieldOptionsMenu = function (element, internalId, target) {
        var isFieldSettingHandler = target === 'fieldSettingsHandler';
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
    };
    self.HideFieldOptionsMenu = function () {
        jQuery('.HeaderPopup').remove();
        jQuery('[id*=DHP_PW]').removeClass('pivotMenuVisible');
        jQuery('#FieldListArea .fieldListAreaInner').off('scroll');
    };

    // chart options
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

    // gauge
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
