var enumHandlers = new EnumHandlers();

function EnumHandlers() {
    "use strict";

    var self = this;

    self.SORTDIRECTION = {
        ASC: -1,
        DESC: 1
    };

    self.ORIENTATION = {
        LANDSCAPE: 'landscape',
        PORTRAIT: 'portrait'
    };

    self.PAGEVIEWMODE = {
        FULL: 'full',
        COMPACT: 'compact'
    };

    self.PIVOTMODE = {
        FULL: 'full',
        DASHBOARD: 'dashboard'
    };

    self.PARAMETERS = {
        CACHING: 'caching',
        OFFSET: 'offset',
        LIMIT: 'limit',
        MULTILINGUAL: 'multilingual',
        ACCEPT_WARNINGS: 'accept_warnings',
        FORCED: 'forced',
        REDIRECT: 'redirect',
        SORT: 'sort',
        SORT_DIR: 'dir',
        FQ: 'fq',
        INCLUDE_FACETS: 'include_facets',
        Q: 'q',
        VIEWMODE: 'viewmode',
        CLASSES: 'classes'
    };

    // user settings
    self.CLIENT_SETTINGS_PROPERTY = {
        LAST_SEARCH_URL: 'last_search_url',
        LAST_CREATEANGLE_MODEL: 'last_createangle_model',
        SHOW_FACET_ANGLE_WARNINGS: 'show_facet_angle_warnings',
        DEFAULT_STARRED_FIELDS: 'default_Starred_Fields',
        DEFAULT_SUGGESTED_FIELDS: 'default_Suggested_Fields',
        GENERAL_DECIMAL_SEPERATOR: 'general_decimal_seperator',
        GENERAL_THOUSAND_SEPERATOR: 'general_thousand_seperator',
        FIELD_CHOOSER_VIEW_MODE: 'field_chooser_view_mode'
    };

    self.SEPARATOR_TEMPLATE = {
        COMMA: ',',
        DOT: '.',
        SINGLEQUOTE: "'",
        SPACE: ' ',
        SLASH: '/',
        COLON: ':',
        DASH: '-'
    };

    self.GENERAL_DEFAULT_SEPARATOR = {
        DECIMAL: self.SEPARATOR_TEMPLATE.DOT,
        SEPARATOR: self.SEPARATOR_TEMPLATE.COMMA
    };

    self.DATE_ORDER_TEMPLATE = {
        DMY: 'DMY',
        MDY: 'MDY',
        YMD: 'YMD'
    };

    self.DATE_DAY_TEMPLATE = {
        d: 'd',
        dd: 'dd'
    };

    self.DATE_MONTH_TEMPLATE = {
        M: 'M',
        MM: 'MM',
        MMM: 'MMM'
    };

    self.DATE_YEAR_TEMPLATE = {
        yy: 'yy',
        yyyy: 'yyyy'
    };

    self.DATEORDER = [
       { id: self.DATE_ORDER_TEMPLATE.DMY, name: [Localization.DateOrderTemplateDay, Localization.DateOrderTemplateMonth, Localization.DateOrderTemplateYear].join(' ') },
       { id: self.DATE_ORDER_TEMPLATE.MDY, name: [Localization.DateOrderTemplateMonth, Localization.DateOrderTemplateDay, Localization.DateOrderTemplateYear].join(' ') },
       { id: self.DATE_ORDER_TEMPLATE.YMD, name: [Localization.DateOrderTemplateYear, Localization.DateOrderTemplateMonth, Localization.DateOrderTemplateDay].join(' ') }
    ];

    self.DATESEPERATOR = [
       { id: self.SEPARATOR_TEMPLATE.SLASH, name: Captions.FormatSetting_Slash },
       { id: self.SEPARATOR_TEMPLATE.DOT, name: Captions.FormatSetting_FullStop },
       { id: self.SEPARATOR_TEMPLATE.SPACE, name: Captions.FormatSetting_Space },
       { id: self.SEPARATOR_TEMPLATE.DASH, name: Captions.FormatSetting_Dash }
    ];

    self.DEFAULT_DATE_TEMPLATE = {
        ORDER_FORMAT: self.DATE_ORDER_TEMPLATE.MDY,
        DAY_FORMAT: self.DATE_DAY_TEMPLATE.dd,
        MONTH_FORMAT: self.DATE_MONTH_TEMPLATE.MMM,
        YEAR_FORMAT: self.DATE_YEAR_TEMPLATE.yyyy,
        SEPARATOR: self.SEPARATOR_TEMPLATE.SLASH
    };


    self.DATE_SETTINGS_FORMAT = {
        ORDER_FORMAT: 'order',
        DAY_FORMAT: 'day',
        MONTH_FORMAT: 'month',
        YEAR_FORMAT: 'year',
        SEPARATOR: 'separator'
    };

    self.TIMESEPERATOR = [
       { id: self.SEPARATOR_TEMPLATE.DOT, name: Captions.FormatSetting_FullStop },
       { id: self.SEPARATOR_TEMPLATE.COLON, name: Captions.FormatSetting_Colon }
    ];

    self.TIME_TEMPLATE = {
        HHMM: 'HHmm',
        HMM: 'hmm',
        HHMMSS: 'HHmmss',
        HMMSS: 'hmmss',
        HH: 'HH',
        H: 'h',
        SS: 'ss',
        NONE: '',
        MM: 'mm'
    };

    self.TIME_SETTINGS_FORMAT = {
        HOUR_FORMAT: 'hour',
        SECOND_FORMAT: 'second',
        SEPARATOR: 'separator'
    };

    self.TIME_DEFUALT_TEMPLATE = {
        HOUR_FORMAT: self.TIME_TEMPLATE.HHMM,
        SEPARATOR: self.SEPARATOR_TEMPLATE.COLON
    };

    self.USERSETTINGS = {
        DEFAULT_ENUM: 'default_enum',
        DEFAULT_PERIOD: 'default_period',
        DEFAULT_TIME: 'default_time',
        DEFAULT_DATE: 'default_date',
        DEFAULT_LANGUAGES: 'default_language',
        DEFAULT_CURRENCY: 'default_currency',
        CLIENT_SETTINGS: 'client_settings',
        FORMAT_LOCALE: 'format_locale',
        DEFAULT_DECIMAL_PLACES: 'default_decimal_places',
        DECIMALS_NUMBERS: 'decimals_numbers',
        DECIMALS_CURRENCIES: 'decimals_currencies',
        DECIMALS_PERCENTAGES: 'decimals_percentages',
        DEFAULT_EXPORT_LINES: 'default_export_lines',
        SAP_FIELDS_IN_CHOOSER: 'sap_fields_in_chooser',
        SAP_FIELDS_IN_HEADER: 'sap_fields_in_header',
        COMPRESSED_LIST_HEADER: 'compressed_list_header',
        COMPRESSED_BP_BAR: 'compressed_bp_bar',
        DEFAULT_BUSINESS_PROCESSES: 'default_business_processes',
        AUTO_EXECUTE_ITEMS_ON_LOGIN: 'auto_execute_items_on_login',
        AUTO_EXECUTE_LAST_SEARCH: 'auto_execute_last_search',

        FORMAT_NUMBERS: 'format_numbers',
        FORMAT_CURRENCIES: 'format_currencies',
        FORMAT_PERCENTAGES: 'format_percentages',
        FORMAT_ENUM: 'format_enum',
        FORMAT_DATE: 'format_date',
        FORMAT_PERIOD: 'format_period',
        FORMAT_TIME: 'format_time'
    };

    // query steps type
    self.FILTERTYPE = {
        FILTER: 'filter',
        SQLFILTER: 'sqlfilter',
        FOLLOWUP: 'followup',
        AGGREGATION: 'aggregation',
        EXPRESSION_AGGREGATION: 'expression_aggregation',
        SORTING: 'sorting'
    };

    // privileges
    self.FRIENDLYNAMEMODE = {
        SHORTNAME: 'shortname',
        LONGNAME: 'longname',
        SHORTNAME_AND_LONGNAME: 'shortname_longname',
        FIELDSOURCE_AND_SHORTNAME: 'fieldsource_shortname',
        FIELDSOURCE_AND_LONGNAME: 'fieldsource_longname'
    };

    // id of 1st column on list view
    self.GENERAL = {
        ROWID: 'row_id'
    };

    // privileges
    self.PRIVILEGES = {
        ASSIGN: 'Assign',
        MANAGE: 'Manage',
        VALIDATE: 'Validate',
        VIEW: 'View',
        DENY: 'Deny'
    };

    // default fields
    self.DEFAULTFIELDS = {
        ID: 'ID',
        //DESCRIPTION: 'Description',
        OBJECTTYPE: 'ObjectType'
    };

    self.PRIMARYFIELDS = {
        ID: 'ID',
        OBJECTTYPE: 'ObjectType'
    };

    self.LISTDRILLDOWNDISPLAYFIELDS = {
        ROWID: self.GENERAL.ROWID,
        ID: 'id',
        NAME: 'short_name',
        FIELDSOURCE: 'source_name',
        FIELDTYPE: 'fieldtype',
        VALUE: 'value',
        FIELDSOURCETITLE: 'fieldSourceTitle',
        CATEGORY: 'category',
        TECHNINFO: 'technical_info'
    };

    // field types
    self.FIELDTYPE = {
        TEXT: 'text',
        ENUM: 'enumerated',
        BOOLEAN: 'boolean',
        DATE: 'date',
        DOUBLE: 'double',
        INTEGER: 'int',
        CURRENCY: 'currency',
        PERCENTAGE: 'percentage',
        PERIOD: 'period',
        STRING: 'string',
        NUMBER: 'number',
        TIME: 'time',
        TIMESPAN: 'timespan',
        DATETIME: 'datetime',
        DATETIME_WC: 'datetime_wc'
    };

    self.FIELDSETTING = {
        USEDEFAULT: "usedefault"
    };

    self.ENUMDISPLAYTYPE = {
        SHORTNAME: 'shn',
        LONGNAME: 'ln',
        SHORTNAMELONGNAME: 'shnln',
        SMART: 'smart'
    };

    self.TIMEFORMAT = {
        SECOND: 'second',
        HOUR: 'hour',
        HOURANDMINUTE: 'hhmm',
        DAY: 'day',
        DAYANDHOUR: 'ddhh',
        WEEK: 'week',
        WEEKANDDAY: 'wwdd'
    };

    self.DISPLAYUNITSFORMAT = {
        NONE: 'N',
        THOUSANDS: 'K',
        MILLIONS: 'M'
    };

    self.FIELDDETAILPROPERTIES = {
        FORMAT: 'format',
        PREFIX: 'prefix',
        DECIMALS: 'decimals',
        THOUSANDSEPARATE: 'thousandseparator',
        SORTING: 'sorting',
        PIVOTAREA: 'pivot_area',
        HOUR: 'hour',
        SECOND: 'second',
        SEPARATOR: 'separator',
        SUFFIX: 'suffix'
    };

    self.DEVXPRESSFORMATTYPE = {
        NONE: 0,
        NUMERIC: 1,
        DATETIME: 2,
        CUSTOM: 3
    };

    self.DECIMALSEPERATOR = [
        { id: self.SEPARATOR_TEMPLATE.COMMA, name: Captions.FormatSetting_Comma },
        { id: self.SEPARATOR_TEMPLATE.DOT, name: Captions.FormatSetting_FullStop }
    ];

    self.GENERALTHOUSANDSEPERATOR = [
         { id: self.SEPARATOR_TEMPLATE.COMMA, name: Captions.FormatSetting_Comma },
         { id: self.SEPARATOR_TEMPLATE.DOT, name: Captions.FormatSetting_FullStop },
         { id: self.SEPARATOR_TEMPLATE.SINGLEQUOTE, name: Captions.FormatSetting_Apostrophe },
         { id: self.SEPARATOR_TEMPLATE.SPACE, name: Captions.FormatSetting_Space }
    ];

    self.TIMEHOURSFORMAT = [
        { id: self.TIME_TEMPLATE.HH, name: 'HH' },
        { id: self.TIME_TEMPLATE.H, name: 'h' }
    ];

    self.TIMESECONDSFORMATLIST = [
        { id: self.TIME_TEMPLATE.NONE, name: Captions.FormatSetting_None },
        { id: self.TIME_TEMPLATE.SS, name: 'ss' }
    ];

    self.LISTFORMATENUM = [
        { Text: Localization.ListFormatEnumShortName, Value: self.ENUMDISPLAYTYPE.SHORTNAME },
        { Text: Localization.ListFormatEnumLongName, Value: self.ENUMDISPLAYTYPE.LONGNAME },
        { Text: Localization.ListFormatEnumShortName + ' (' + Localization.ListFormatEnumLongName + ')', Value: self.ENUMDISPLAYTYPE.SHORTNAMELONGNAME }
    ];
    self.LISTFORMATNUMBER = [
        { Text: Localization.ListFormatNumberMillion, Value: -6 },
        { Text: Localization.ListFormatNumberThousand, Value: -3 },
        { Text: Localization.ListFormatNumberZero, Value: 0 },
        { Text: Localization.ListFormatNumberOne, Value: 1 },
        { Text: Localization.ListFormatNumberTwo, Value: 2 },
        { Text: Localization.ListFormatNumberThree, Value: 3 },
        { Text: Localization.ListFormatNumberFour, Value: 4 },
        { Text: Localization.ListFormatNumberFive, Value: 5 },
        { Text: Localization.ListFormatNumberSix, Value: 6 }
    ];
    self.LISTFORMATINTEGER = [
        { Text: Localization.ListFormatNumberMillion, Value: -6 },
        { Text: Localization.ListFormatNumberThousand, Value: -3 }
    ];
    self.LISTFORMATPERCENTAGE = [
        { Text: Localization.ListFormatNumberZero, Value: 0 },
        { Text: Localization.ListFormatNumberOne, Value: 1 },
        { Text: Localization.ListFormatNumberTwo, Value: 2 },
        { Text: Localization.ListFormatNumberThree, Value: 3 },
        { Text: Localization.ListFormatNumberFour, Value: 4 },
        { Text: Localization.ListFormatNumberFive, Value: 5 },
        { Text: Localization.ListFormatNumberSix, Value: 6 }
    ];
    self.LISTFORMATDECIMALS = [
        { name: Localization.FormatSettingNoDecimal, id: 0 },
        { name: Localization.ListFormatNumberOne, id: 1 },
        { name: Localization.ListFormatNumberTwo, id: 2 },
        { name: Localization.ListFormatNumberThree, id: 3 },
        { name: Localization.ListFormatNumberFour, id: 4 },
        { name: Localization.ListFormatNumberFive, id: 5 },
        { name: Localization.ListFormatNumberSix, id: 6 }
    ];

    self.LISTFORMATPERIOD = [
        { Text: Localization.ListFormatPeriodDays, Value: self.TIMEFORMAT.DAY },
        { Text: Localization.LIstFormatPeriodWeeks, Value: self.TIMEFORMAT.WEEK }
    ];

    self.DISPLAYUNITS = [
        { name: Localization.FormatSettingDisplayUnitsNone, id: self.DISPLAYUNITSFORMAT.NONE },
        { name: Localization.FormatSettingDisplayUnitsThousands, id: self.DISPLAYUNITSFORMAT.THOUSANDS },
        { name: Localization.FormatSettingDisplayUnitsMillions, id: self.DISPLAYUNITSFORMAT.MILLIONS }
    ];

    // paremeters on search page
    self.SEARCHPARAMETER = {
        SORT: self.PARAMETERS.SORT,
        SORT_DIR: self.PARAMETERS.SORT_DIR,
        PAGE: 'page',
        PAGESIZE: 'pagesize',
        FQ: self.PARAMETERS.FQ,
        Q: self.PARAMETERS.Q,
        INCLUDE_FACETS: self.PARAMETERS.INCLUDE_FACETS,
        OFFSET: self.PARAMETERS.OFFSET,
        LIMIT: self.PARAMETERS.LIMIT,
        RELEVANCY: 'relevancy',
        VIEWMODE: 'viewmode',
        EDITID: 'editid'
    };

    self.ADVANCESEARCHPARAMETER = {
        CREATOR: 'creator',
        CREATED: 'created',
        EXECUTOR: 'executor',
        EXECUTED: 'executed',
        VALIDATOR: 'validator',
        VALIDATED: 'validated',
        CHANGER: 'changer',
        CHANGED: 'changed',
        DELETER: 'deleter',
        DELETED: 'deleted',
        TIMESEXECUTED: 'times_executed',
        ITEMNAME: 'item_name',
        ITEMDESCRIPTION: 'item_description',
        DISPLAYNAMES: 'display_names',
        DISPLAYDESCRIPTIONS: 'display_descriptions',
        BASECLASSES: 'base_classes',
        QUERYSTEPFIELDS: 'query_step_fields',
        QUERYSTEPFOLLOWUPS: 'query_step_followups',
        GROUPINGLABELNAMES: 'grouping_label_names',
        PRIVILEGELABELNAMES: 'privilege_label_names',
        ALLOWMOREDETAILS: 'allow_more_details',
        ALLOWFOLLOWUPS: 'allow_followups',
        IDS: 'ids',
        CREATOROPERATOR: 'creator_operator',
        CHANGEROPERATOR: 'changer_operator',
        EXECUTOROPERATOR: 'executor_operator',
        VALIDATOROPERATOR: 'validator_operator',
        NUMBEROFEXECUTEOPERATOR: 'number_execute_operator'
    };
    self.SEARCHFQPARAMETER = {
        BP: 'facetcat_bp'
    };

    // parameters on angle page
    self.ANGLEPARAMETER = {
        ANGLE: 'angle',
        DISPLAY: 'display',
        CREATENEW: 'isCreatedNewAngle',
        TEMPLATE: 'isTemplate',
        LISTDRILLDOWN: 'listdrilldown',
        FOLLOWUPS: 'followups',
        VIEWMODE: 'viewmode',
        EDITMODE: 'editmode',
        ASK_EXECUTION: 'parameterized',
        STARTTIMES: 'starttimes',
        EDITID: 'editid',
        TARGET: 'target'
    };

    self.ANGLETARGET = {
        PUBLISH: 'publish'
    };

    // action dropdown on search page
    self.SEARCHACTION = {
        EXECUTEDASHBOARD: { Text: Localization.ExecuteAsDashboard, Id: 'executeDashboard' },
        MASSCHANGE: { Text: Localization.MassChange, Id: 'massChange' },
        DELETE: { Text: Localization.Delete, Id: 'delete' },
        SELECTALL: { Text: Localization.SelectAll, Id: 'selectAll' },
        DESELECT: { Text: Localization.DeSelect, Id: 'deSelect' },
        UPLOADANGLES: { Text: Localization.UploadAngles, Id: 'uploadAngles' },
        CREATEEAPACKAGE: { Text: Localization.CreateEAPackage, Id: 'createEAPackage' },
        COPYANGLE: { Text: Localization.CopyAngle, Id: 'copyAngle' }
    };

    // action dropdown on angle page
    self.ANGLEACTION = {
        SAVE: { Text: Localization.SaveDisplay, Id: 'save' },
        SAVEAS: { Text: Localization.SaveAs, Id: 'saveAs' },
        COPYDISPLAY: { Text: Localization.CopyDisplay, Id: 'copydisplay' },
        PASTEDISPLAY: { Text: Localization.PasteDisplay, Id: 'pastedisplay' },
        EDITDISPLAY: { Text: Localization.EditDisplay, Id: 'editDisplay' },
        NEWDISPLAY: { Text: Localization.CreateNewDisplay, Id: 'newDisplay' },
        CREATELIST: { Text: Captions.Label_ActionDropdown_CreateList, Id: 'createList' },
        CREATECHART: { Text: Captions.Label_ActionDropdown_CreateChart, Id: 'createChart' },
        CREATEPIVOT: { Text: Captions.Label_ActionDropdown_CreatePivot, Id: 'createPivot' },
        EXPORTTOEXCEL: { Text: Localization.ExportToExcel, Id: 'exportToExcel' },
        EXPORTTOCSV: { Text: Localization.ExportToCSV, Id: 'exportToCSV' },
        ADDTODASHBOARD: { Text: Localization.AddToDashboard, Id: 'addToDashboard' },
        ADDFOLLOWUP: { Text: Localization.AddFollowUp, Id: 'addFollowup' },
        SCHEDULEANGLE: { Text: Localization.ScheduleAngle, Id: 'scheduleAngle' },
        FIND: { Text: Localization.Find, Id: 'find' },
        EXECUTEDISPLAY: { Text: Captions.Label_ActionDropdown_ExecuteDisplay, Id: 'exitEditMode' }
    };

    //action dropdown on dashboard page
    self.DASHBOARDACTION = {
        SAVE: { Text: Localization.SaveDashboard, Id: 'save' },
        SAVEAS: { Text: Localization.SaveAsDashboard, Id: 'saveAs' },
        EDIT: { Text: Localization.EditDashboard, Id: 'editDisplay' },
        EXECUTEDASHBOARD: { Text: Captions.Label_ActionDropdown_ExecuteDashboard, Id: 'exitEditMode' }
    };

    // Queryblock types
    self.QUERYBLOCKTYPE = {
        BASE_CLASSES: 'base_classes',
        BASE_ANGLE: 'base_angle',
        BASE_DISPLAY: 'base_display',
        QUERY_STEPS: 'query_steps'
    };

    // display type
    self.DISPLAYTYPE = {
        LIST: 'list',
        PIVOT: 'pivot',
        CHART: 'chart'
    };

    // display type
    self.PIVOTSHOWTOTALMODES = [
        { id: '0', name: Captions.Pivot_Option_DoNotShowTotals },
        { id: '1', name: Captions.Pivot_Option_ShowForRowsAndColumns },
        { id: '2', name: Captions.Pivot_Option_ShowForRows },
        { id: '3', name: Captions.Pivot_Option_ShowForColumns }
    ];

    //Chart display
    self.CHARTTYPE = {
        AREACHART: { Value: 3, Name: Localization.ChartAreaLabel, Code: 'area', Usage: 3 },
        BARCHART: { Value: 0, Name: Localization.ChartBarLabel, Code: 'bar', Usage: 2 },
        BUBBLECHART: { Value: 0, Name: Localization.ChartBubbleLabel, Code: 'bubble', Usage: 1 },
        COLUMNCHART: { Value: 1, Name: Localization.ChartColumnLabel, Code: 'column', Usage: 3 },
        DONUTCHART: { Value: 6, Name: Localization.ChartDonutLabel, Code: 'donut', Usage: 1 },
        LINECHART: { Value: 2, Name: Localization.ChartLineLabel, Code: 'line', Usage: 3 },
        PIECHART: { Value: 4, Name: Localization.ChartPieLabel, Code: 'pie', Usage: 1 },
        RADARCHART: { Value: 5, Name: Localization.ChartRadarLabel, Code: 'radarLine', Usage: 2 },
        SCATTERCHART: { Value: 5, Name: Localization.ChartScatterLabel, Code: 'scatter', Usage: 3 },
        GAUGE: { Value: 6, Name: Localization.ChartGaugeLabel, Code: 'gauge', Usage: 1 }
    };
    self.POSITION = {
        TOP: { Value: 0, Code: 'top' },
        BOTTOM: { Value: 1, Code: 'bottom' },
        LEFT: { Value: 2, Code: 'left' },
        RIGHT: { Value: 3, Code: 'right' },
        CENTER: { Value: 4, Code: 'center' },
        INSIDE: { Value: 5, Code: 'inside' },
        OUTSIDE: { Value: 6, Code: 'outside' },
        CUSTOM: { Value: 7, Code: 'custom' },
        ABOVE: { Value: 8, Code: 'above' },
        BELOW: { Value: 9, Code: 'below' },
        INSIDEBASE: { Value: 10, Code: 'insideBase' },
        INSIDEEND: { Value: 11, Code: 'insideEnd' },
        OUTSIDEEND: { Value: 12, Code: 'outsideEnd' }
    };
    self.PROPERTIESNAME = {
        TEXT: 'Text',
        VALUE: 'Value'
    };
    self.CRITERIA = {
        NOTEMPTY: 'notempty',
        EMPTY: 'empty',
        EQUAL: 'equal',
        NOTEQUAL: 'notequal',
        SMALLERTHAN: 'smallerthan',
        LARGERTHAN: 'largerthan'
    };
    self.KENDOUITYPE = {
        WINDOW: 'kendoWindow',
        GRID: 'kendoGrid',
        DATEPICKER: 'kendoDatePicker',
        DATETIMEPICKER: 'kendoCustomDateTimePicker',
        NUMERICTEXT: 'kendoNumericTextBox',
        NUMERICTEXT_CUSTOM: 'kendoCustomNumericTextBox',
        PERCENTAGETEXT: 'kendoPercentageTextBox',
        DROPDOWNLIST: 'kendoDropDownList',
        TIMEPICKER: 'kendoTimePicker',
        TIMESPANPICKER: 'kendoTimeSpanPicker',
        CHART: 'kendoChart',
        SPLITTER: 'kendoSplitter',
        EDITOR: 'kendoEditor',
        COLOURPICKER: 'kendoCustomColorPicker',
        RADIALGAUGE: 'kendoRadialGauge',
        AUTOCOMPLETE: 'kendoAutoComplete',
        COMBOBOX: 'kendoComboBox'
    };
    self.OPERATOR = {
        HASVALUE: { Text: Localization.OperatorHasValue, Value: 'has_value' },
        HASNOVALUE: { Text: Localization.OperatorHasNoValue, Value: 'has_no_value' },
        EQUALTO: { Text: Localization.OperatorIsEqualTo, Value: 'equal_to' },
        NOTEQUALTO: { Text: Localization.OperatorIsNotEqualTo, Value: 'not_equal_to' },
        ISIN: { Text: Localization.OperatorIsIn, Value: 'equal_to' },
        ISNOTIN: { Text: Localization.OperatorIsNotIn, Value: 'not_equal_to' },
        SMALLERTHAN: { Text: Localization.OperatorIsSmallerThan, Value: 'less_than' },
        GREATERTHAN: { Text: Localization.OperatorIsGreaterThan, Value: 'greater_than' },
        SMALLERTHANOREQUALTO: { Text: Localization.OperatorIsSmallerThanOrEqualTo, Value: 'less_than_or_equal' },
        GREATERTHANOREQUALTO: { Text: Localization.OperatorIsGreaterThanOrEqualTo, Value: 'greater_than_or_equal' },
        BETWEEN: { Text: Localization.OperatorIsBetween, Value: 'between' },
        NOTBETWEEN: { Text: Localization.OperatorIsNotBetween, Value: 'not_between' },
        INLIST: { Text: Localization.OperatorIsInList, Value: 'in_set' },
        NOTINLIST: { Text: Localization.OperatorIsNotInList, Value: 'not_in_set' },
        CONTAIN: { Text: Localization.OperatorContainsSubstring, Value: 'contains' },
        NOTCONTAIN: { Text: Localization.OperatorDoesNotContainSubstring, Value: 'does_not_contain' },
        STARTWITH: { Text: Localization.OperatorStartsWithSubstring, Value: 'starts_with' },
        NOTSTARTWITH: { Text: Localization.OperatorDoesNotStartWithSubstring, Value: 'does_not_start_with' },
        ENDON: { Text: Localization.OperatorEndsOnSubstring, Value: 'ends_on' },
        NOTENDON: { Text: Localization.OperatorDoesNotEndOnSubstring, Value: 'does_not_end_on' },
        MATCHPATTERN: { Text: Localization.OperatorMatchesPattern, Value: 'matches_pattern' },
        NOTMATCHPATTERN: { Text: 'does not matches pattern(s)', Value: 'does_not_match_pattern' },
        BEFORE: { Text: Localization.OperatorIsBefore, Value: 'less_than' },
        AFTER: { Text: Localization.OperatorIsAfter, Value: 'greater_than' },
        BEFOREORON: { Text: Localization.OperatorIsBeforeOrOn, Value: 'less_than_or_equal' },
        AFTERORON: { Text: Localization.OperatorIsAfterOrOn, Value: 'greater_than_or_equal' },
        RELATIVEBEFORE: { Text: Localization.OperatorIsRelativeBefore, Value: 'relative_before' },
        RELATIVEAFTER: { Text: Localization.OperatorIsRelativeAfter, Value: 'relative_after' },
        RELATIVEBETWEEN: { Text: Localization.OperatorIsRelativeBetween, Value: 'relative_between' },
        NOTRELATIVEBETWEEN: { Text: Localization.OperatorIsNotRelativeBetween, Value: 'not_relative_between' },
        BEFOREOREQUAL: { Text: Localization.OperatorIsBeforeOrOn, Value: 'less_than_or_equal' },
        AFTEROREQUAL: { Text: Localization.OperatorIsAfterOrOn, Value: 'greater_than_or_equal' }
    };
    self.QUERYSTEPOPERATOR = {
        DEFAULT: [
            { Id: '', Value: self.OPERATOR.HASVALUE.Value, Text: self.OPERATOR.HASVALUE.Text },
            { Id: '', Value: self.OPERATOR.HASNOVALUE.Value, Text: self.OPERATOR.HASNOVALUE.Text }
        ],
        GROUPONE: [
            { Id: '', Value: self.OPERATOR.EQUALTO.Value, Text: self.OPERATOR.EQUALTO.Text },
            { Id: '', Value: self.OPERATOR.NOTEQUALTO.Value, Text: self.OPERATOR.NOTEQUALTO.Text }
        ],
        GROUPTWO: [
            { Id: '', Value: self.OPERATOR.SMALLERTHAN.Value, Text: self.OPERATOR.SMALLERTHAN.Text },
            { Id: '', Value: self.OPERATOR.GREATERTHAN.Value, Text: self.OPERATOR.GREATERTHAN.Text },
            { Id: '', Value: self.OPERATOR.SMALLERTHANOREQUALTO.Value, Text: self.OPERATOR.SMALLERTHANOREQUALTO.Text },
            { Id: '', Value: self.OPERATOR.GREATERTHANOREQUALTO.Value, Text: self.OPERATOR.GREATERTHANOREQUALTO.Text }
        ],
        GROUPTHREE: [
            { Id: '', Value: self.OPERATOR.BETWEEN.Value, Text: self.OPERATOR.BETWEEN.Text },
            { Id: '', Value: self.OPERATOR.NOTBETWEEN.Value, Text: self.OPERATOR.NOTBETWEEN.Text },
            { Id: '', Value: self.OPERATOR.INLIST.Value, Text: self.OPERATOR.INLIST.Text },
            { Id: '', Value: self.OPERATOR.NOTINLIST.Value, Text: self.OPERATOR.NOTINLIST.Text }
        ],
        GROUPFOUR: [
            { Id: '', Value: self.OPERATOR.CONTAIN.Value, Text: self.OPERATOR.CONTAIN.Text },
            { Id: '', Value: self.OPERATOR.NOTCONTAIN.Value, Text: self.OPERATOR.NOTCONTAIN.Text },
            { Id: '', Value: self.OPERATOR.STARTWITH.Value, Text: self.OPERATOR.STARTWITH.Text },
            { Id: '', Value: self.OPERATOR.NOTSTARTWITH.Value, Text: self.OPERATOR.NOTSTARTWITH.Text },
            { Id: '', Value: self.OPERATOR.ENDON.Value, Text: self.OPERATOR.ENDON.Text },
            { Id: '', Value: self.OPERATOR.NOTENDON.Value, Text: self.OPERATOR.NOTENDON.Text },
            { Id: '', Value: self.OPERATOR.MATCHPATTERN.Value, Text: self.OPERATOR.MATCHPATTERN.Text }
        ],
        DATEONE: [
            { Id: '', Value: self.OPERATOR.BEFORE.Value, Text: self.OPERATOR.BEFORE.Text },
            { Id: '', Value: self.OPERATOR.AFTER.Value, Text: self.OPERATOR.AFTER.Text },
            { Id: '', Value: self.OPERATOR.BEFOREORON.Value, Text: self.OPERATOR.BEFOREORON.Text },
            { Id: '', Value: self.OPERATOR.AFTERORON.Value, Text: self.OPERATOR.AFTERORON.Text }
        ],
        DATETWO: [
            { Id: '', Value: self.OPERATOR.RELATIVEBEFORE.Value, Text: self.OPERATOR.RELATIVEBEFORE.Text },
            { Id: '', Value: self.OPERATOR.RELATIVEAFTER.Value, Text: self.OPERATOR.RELATIVEAFTER.Text },
            { Id: '', Value: self.OPERATOR.RELATIVEBETWEEN.Value, Text: self.OPERATOR.RELATIVEBETWEEN.Text },
            { Id: '', Value: self.OPERATOR.NOTRELATIVEBETWEEN.Value, Text: self.OPERATOR.NOTRELATIVEBETWEEN.Text }
        ],
        TIMEONE: [
            { Id: '', Value: self.OPERATOR.BEFORE.Value, Text: self.OPERATOR.BEFORE.Text },
            { Id: '', Value: self.OPERATOR.AFTER.Value, Text: self.OPERATOR.AFTER.Text },
            { Id: '', Value: self.OPERATOR.BEFOREORON.Value, Text: self.OPERATOR.BEFOREORON.Text },
            { Id: '', Value: self.OPERATOR.AFTERORON.Value, Text: self.OPERATOR.AFTERORON.Text }
        ],
        ENUMONE: [
            { Id: '', Value: self.OPERATOR.CONTAIN.Value, Text: Localization.OperatorContainsSubstringEnum },
            { Id: '', Value: self.OPERATOR.STARTWITH.Value, Text: Localization.OperatorStartsWithSubstringEnum },
            { Id: '', Value: self.OPERATOR.INLIST.Value, Text: self.OPERATOR.INLIST.Text },
            { Id: '', Value: self.OPERATOR.NOTINLIST.Value, Text: self.OPERATOR.NOTINLIST.Text },
            { Id: '', Value: self.OPERATOR.MATCHPATTERN.Value, Text: self.OPERATOR.MATCHPATTERN.Text }
        ],
        SIMPLIFYDATE: [
              { Id: '', Value: self.OPERATOR.EQUALTO.Value, Text: self.OPERATOR.EQUALTO.Text },
              { Id: '', Value: self.OPERATOR.BEFORE.Value, Text: self.OPERATOR.BEFORE.Text },
              { Id: '', Value: self.OPERATOR.AFTER.Value, Text: self.OPERATOR.AFTER.Text },
              { Id: '', Value: self.OPERATOR.BETWEEN.Value, Text: self.OPERATOR.BETWEEN.Text },
              { Id: '', Value: self.OPERATOR.RELATIVEBEFORE.Value, Text: self.OPERATOR.RELATIVEBEFORE.Text },
              { Id: '', Value: self.OPERATOR.RELATIVEAFTER.Value, Text: self.OPERATOR.RELATIVEAFTER.Text },
              { Id: '', Value: self.OPERATOR.RELATIVEBETWEEN.Value, Text: self.OPERATOR.RELATIVEBETWEEN.Text },
              { Id: '', Value: self.OPERATOR.HASNOVALUE.Value, Text: self.OPERATOR.HASNOVALUE.Text },
              { Id: '', Value: self.OPERATOR.HASVALUE.Value, Text: self.OPERATOR.HASVALUE.Text },
              { Id: '', Value: self.OPERATOR.NOTEQUALTO.Value, Text: self.OPERATOR.NOTEQUALTO.Text },
              { Id: '', Value: self.OPERATOR.BEFOREORON.Value, Text: self.OPERATOR.BEFOREORON.Text },
              { Id: '', Value: self.OPERATOR.AFTERORON.Value, Text: self.OPERATOR.AFTERORON.Text },
              { Id: '', Value: self.OPERATOR.INLIST.Value, Text: self.OPERATOR.INLIST.Text },
              { Id: '', Value: self.OPERATOR.NOTINLIST.Value, Text: self.OPERATOR.NOTINLIST.Text },
              { Id: '', Value: self.OPERATOR.NOTBETWEEN.Value, Text: self.OPERATOR.NOTBETWEEN.Text },
              { Id: '', Value: self.OPERATOR.NOTRELATIVEBETWEEN.Value, Text: self.OPERATOR.NOTRELATIVEBETWEEN.Text }
        ]

    };

    self.FIELDSETTINGAREA = {
        ROW: 0,
        COLUMN: 1,
        DATA: 3
    };

    self.POSTRESULTSTATUS = {
        SCHEDULED: { Text: Localization.ResultStatusScheduled, Value: 'scheduled' },
        RUNNING: { Text: Localization.ResultStatusRunning, Value: 'running' },
        FINISHED: { Text: Localization.ResultStatusFinished, Value: 'finished' }
    };

    self.DASHBOARDPARAMETER = {
        DASHBOARD: 'dashboard',
        NEW: 'new',
        VIEW: 'view',
        EDITMODE: 'editmode',
        ASK_EXECUTION: 'parameterized',
        EDITID: 'editid'
    };

    self.ITEMTYPE = {
        ANGLE: 'angle',
        DASHBOARD: 'dashboard',
        TEMPLATE: 'template'
    };

    self.VIEWMODELNAME = {
        RESULTMODEL: 'RESULTMODEL',
        QUERYBLOCK: 'QUERYBLOCK',
        FILTERSTEP: 'FILTERSTEP',
        FOLLOWUPSTEP: 'FOLLOWUPSTEP',
        AGGREGATIONSTEP: 'AGGREGATIONSTEP',
        SORTINGSTEP: 'SORTINGSTEP',
        BUSINESSPROCESS: 'BUSINESSPROCESS',
        SEARCHFACET: 'SEARCHFACET',
        SEARCHMODEL: 'SEARCHMODEL',
        USERMODEL: 'USERMODEL'
    };

    self.CHECKSTATE = {
        FALSE: 1,
        TRUE: 2,
        UNDEFINED: 3
    };

    self.ENTRIESNAME = {
        AUTHENTICATIONPROVIDERS: 'authentication_providers',
        BUSINESSPROCESSES: 'business_processes',
        COMMENTS: 'comments',
        DASHBOARDS: 'dashboards',
        DEFAULTUSERSETTINGS: 'default_user_settings',
        EXPORTITEMS: 'export_items',
        FIELDCATEGORIES: 'field_categories',
        IMPORTITEMS: 'import_items',
        INTERNALRESOURCES: 'internal_resources',
        ITEMS: 'items',
        LABELCATEGORIES: 'labelcategories',
        LABELS: 'labels',
        MODELSERVERS: 'model_servers',
        MODELS: 'models',
        PACKAGES: 'packages',
        RESULTS: 'results',
        SESSION: 'session',
        SESSIONS: 'sessions',
        SYSTEMACTIONS: 'system_actions',
        SYSTEMINFORMATION: 'system_information',
        SYSTEMLANGUAGES: 'system_languages',
        SYSTEMROLES: 'system_roles',
        SYSTEMSETTINGS: 'system_settings',
        SYSTEMCURRENCIES: 'system_currencies',
        TASKS: 'tasks',
        USERS: 'users',
        VERSIONS: 'versions',
        WEBCLIENTSETTINGS: 'webclient_settings',
        ABOUT: 'about',
        SYSTEMDATASTORES: 'system_datastores'
    };

    self.STORAGE = {
        WATCHER_PREFIX: '__watcher_'
    };
    self.STORAGE.WATCHER_DASHBOARD_WIDGETS_COUNT = self.STORAGE.WATCHER_PREFIX + 'dashboard_widgets_count_{uri}';
    self.STORAGE.WATCHER_DASHBOARD_PUBLICATIONS = self.STORAGE.WATCHER_PREFIX + 'dashboard_publications_{uri}';

    self.FINDPARAMETER = {
        Q: 'q',
        FIELDS: 'fields',
        STARTROW: 'start_row',
        DIRECTION: 'dir',
        CASESENSITIVE: 'case_sensitive',
        FORWARD: 'forward',
        BACKWARD: 'backward'
    };
    self.CSVHEADERENUM = {
        NO: { TEXT: Localization.ExportCSVNoHeader, VALUE: 'no_header' },
        SHORTNAME: { TEXT: Localization.ExportCSVEnumFormatShortName, VALUE: 'display' },
        ID: { TEXT: Localization.ExportCSVIdHeader, VALUE: 'id' },
        LONGNAME: { TEXT: Localization.ExportCSVEnumFormatLongName, VALUE: 'longname' }
    };
    self.CSVENQUOTEENUM = {
        NONE: { TEXT: Localization.ExportCSVEnquoteNone, VALUE: 'none' },
        ONLYSTRINGS: { TEXT: Localization.ExportCSVEnquoteOnlyStrings, VALUE: 'only_strings' },
        ALL: { TEXT: Localization.ExportCSVEnquoteAll, VALUE: 'all' }
    };
    self.LINESEPARATORENUM = {
        CRLF: 'CRLF',
        CR: 'CR',
        LF: 'LF'
    };
    self.CSVENUMFORMAT = {
        ID: { TEXT: Localization.ExportCSVEnumFormatId, VALUE: 'id' },
        ANGLE: { TEXT: Localization.ExportCSVEnumFormatAngle, VALUE: 'angle' },
        DISPLAY: { TEXT: Localization.ExportCSVEnumFormatDisplay, VALUE: 'display' }
    };
    self.CSVETIMEFORMAT = {
        HHmmss: { TEXT: 'HH:mm:ss', VALUE: 'HH:mm:ss' },
        Hmmss: { TEXT: 'H:mm:ss', VALUE: 'H:mm:ss' },
        Hmm: { TEXT: 'H:mm', VALUE: 'H:mm' },
        HHmm: { TEXT: 'HH:mm', VALUE: 'HH:mm' },
        hhmmss: { TEXT: 'hh:mm:ss', VALUE: 'hh:mm:ss' },
        hmmss: { TEXT: 'h:mm:ss', VALUE: 'h:mm:ss' },
        hmm: { TEXT: 'h:mm', VALUE: 'h:mm' },
        hhmm: { TEXT: 'hh:mm', VALUE: 'hh:mm' }
    };
    self.CSVDATEFORMAT = {
        yyyyMMdd: { TEXT: 'yyyy/MM/dd', VALUE: 'yyyy/MM/dd' },
        ddMMyyyy: { TEXT: 'dd/MM/yyyy', VALUE: 'dd/MM/yyyy' },
        MMddyyyy: { TEXT: 'MM/dd/yyyy', VALUE: 'MM/dd/yyyy' },
        Mdyyyy: { TEXT: 'M/d/yyyy', VALUE: 'M/d/yyyy' },
        dMyyyy: { TEXT: 'd/M/yyyy', VALUE: 'd/M/yyyy' },
        yyyyMd: { TEXT: 'yyyy/M/d', VALUE: 'yyyy/M/d' }
    };
    self.MASSCHANGELABELVIEWTYPE = {
        BP: 'business_process',
        SEARCH: 'search_label',
        PRIVILEGE: 'privilege_label'
    };
    self.DISPLAYTYPE_EXTRA = {
        DEFAULT: 'default',
        LIST: self.DISPLAYTYPE.LIST,
        CHART: self.DISPLAYTYPE.CHART,
        PIVOT: self.DISPLAYTYPE.PIVOT
    };
    self.VIEWMODETYPE = {
        SCHEMA: 'schema',
        BASIC: 'basic',
        DETAILS: 'details'
    };

    self.ANGLEPOPUPTYPE = {
        ANGLE: 'AngleDetail',
        DISPLAY: 'DisplayDetail'
    };

    self.FIELDCHOOSERNAME = {
        LISTDRILLDOWN: 'ListDrilldownGrid',
        FIELDCHOOSER: 'DisplayPropertiesGrid'
    };

    self.AGGREGATION = {
        COUNT: { Value: 'count', Text: Localization.Pivot_Bucket_Count },
        MIN: { Value: 'min', Text: Localization.Pivot_Bucket_Min },
        MAX: { Value: 'max', Text: Localization.Pivot_Bucket_Max },
        SUM: { Value: 'sum', Text: Localization.Pivot_Bucket_Sum },
        AVERAGE: { Value: 'average', Text: Localization.Pivot_Bucket_Average },
        AVERAGE_VALID: { Value: 'average_valid', Text: Localization.Pivot_Bucket_AverageValid },
        COUNT_VALID: { Value: 'count_valid', Text: Localization.Pivot_Bucket_CountValid }
    };

    self.DENYTYPE = {
        DENY: { Value: 'True', CssClass: 'deny' },
        PARTIAL: { Value: 'Partial', CssClass: 'denyPartial' }
    };

    self.PERCENTAGESUMMARYTYPES = [
       { id: '0', name: Captions.Pivot_Total_For_None },
       { id: '1', name: Captions.Pivot_Total_For_Row },
       { id: '2', name: Captions.Pivot_Total_For_Column },
       { id: '3', name: Localization.Total }
    ];

    self.FILTERARGUMENTFUNCTION = {
        OFFSET_DATE: 'offset_date'
    };

    self.FILTERARGUMENTTYPE = {
        VALUE: 'value',
        FIELD: 'field',
        FUNCTION: 'function'
    };

    self.FILTERARGUMENTTYPES = [
        { Value: self.FILTERARGUMENTTYPE.VALUE, Text: Captions.WidgetFilter_ArgumentType_Value },
        { Value: self.FILTERARGUMENTTYPE.FIELD, Text: Captions.WidgetFilter_ArgumentType_Field },
        { Value: self.FILTERARGUMENTTYPE.FUNCTION, Text: Captions.WidgetFilter_ArgumentType_Function }
    ];

    self.FILTERPERIODTYPE = {
        DAY: 'day',
        WEEK: 'week',
        MONTH: 'month',
        QUARTER: 'quarter',
        TRIMESTER: 'trimester',
        SEMESTER: 'semester',
        YEAR: 'year'
    };

    self.FILTERPERIODTYPES = [
        { Value: self.FILTERPERIODTYPE.DAY, Text: Captions.WidgetFilter_PeriodType_Days },
        { Value: self.FILTERPERIODTYPE.WEEK, Text: Captions.WidgetFilter_PeriodType_Weeks },
        { Value: self.FILTERPERIODTYPE.MONTH, Text: Captions.WidgetFilter_PeriodType_Months },
        { Value: self.FILTERPERIODTYPE.QUARTER, Text: Captions.WidgetFilter_PeriodType_Quarters },
        { Value: self.FILTERPERIODTYPE.TRIMESTER, Text: Captions.WidgetFilter_PeriodType_Trimesters },
        { Value: self.FILTERPERIODTYPE.SEMESTER, Text: Captions.WidgetFilter_PeriodType_Semesters },
        { Value: self.FILTERPERIODTYPE.YEAR, Text: Captions.WidgetFilter_PeriodType_Years }
    ];

    self.FILTERPERIODVALUES = [
        { Value: -1, Text: Captions.WidgetFilter_ArgumentPeriod_Last },
        { Value: 0, Text: Captions.WidgetFilter_ArgumentPeriod_This },
        { Value: 1, Text: Captions.WidgetFilter_ArgumentPeriod_Next }
    ];

    self.EqualGroupOperator = [
        self.OPERATOR.EQUALTO.Value,
        self.OPERATOR.NOTEQUALTO.Value,
        self.OPERATOR.SMALLERTHAN.Value,
        self.OPERATOR.GREATERTHAN.Value,
        self.OPERATOR.SMALLERTHANOREQUALTO.Value,
        self.OPERATOR.GREATERTHANOREQUALTO.Value,
        self.OPERATOR.RELATIVEAFTER.Value,
        self.OPERATOR.RELATIVEBEFORE.Value
    ];
    self.ListGroupOperator = [
        self.OPERATOR.INLIST.Value,
        self.OPERATOR.NOTINLIST.Value,
        self.OPERATOR.CONTAIN.Value,
        self.OPERATOR.NOTCONTAIN.Value,
        self.OPERATOR.STARTWITH.Value,
        self.OPERATOR.NOTSTARTWITH.Value,
        self.OPERATOR.ENDON.Value,
        self.OPERATOR.NOTENDON.Value,
        self.OPERATOR.MATCHPATTERN.Value,
        self.OPERATOR.NOTMATCHPATTERN.Value
    ];
    self.BetweenGroupOperator = [
        self.OPERATOR.BETWEEN.Value,
        self.OPERATOR.NOTBETWEEN.Value,
        self.OPERATOR.RELATIVEBETWEEN.Value,
        self.OPERATOR.NOTRELATIVEBETWEEN.Value
    ];

    self.DAYOFWEEK = {
        Sunday: 0,
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6
    };
}
