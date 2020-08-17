﻿function QueryStepView() { }
QueryStepView.prototype.GetFiltersAndJumpsTemplate = function () {
    return [
        '<div class="query-definition-wrapper" data-bind="css: { readonly: ReadOnly }">',
            '<ul class="query-definition">',
                '<!-- ko foreach: { data: Data, as: \'query\' } -->',
                '<!-- ko if: $parent.IsFilter(query) -->',
                '<li class="item item-filter" data-bind="css: { \'item-sortable\': $parent.CanSortFilter(query) || $parent.CanMoveFilter(query), \'item-warning\': query.warning(), editmode: query.edit_mode }, attr: { \'data-index\': $index }">',
                    '<div class="item-header displayNameContainer small">',
                        '<div class="front"></div>',
                        '<div class="name" data-role="tooltip" data-tooltip-function="QueryStepViewModel_Tooltip" data-type="html" data-tooltip-position="bottom">',
                            '<div class="name-inner">',
                                '<span class="textEllipsis" data-bind="text: query.name()"></span>',
                               '<!-- ko if: query.is_execution_parameter() -->',
                                '<i class="icon icon-parameterized" data-bind="css: { active: $parent.UseExecutionParameter(query) }"></i>',
                               '<!-- /ko -->',
                                '<!-- ko if: query.is_adhoc() -->',
                                '<i class="icon icon-adhoc sign-adhoc"></i>',
                                '<!-- /ko -->',
                            '</div>',
                            '<!-- ko if: query.warning() -->',
                            '<div class="text-error textEllipsis" data-bind="text: query.warning()"></div>',
                            '<!-- /ko -->',
                        '</div>',
                        '<div class="rear">',
                            '<a class="icon icon-info action-info" data-role="tooltip" data-tooltip-position="bottom" data-bind="click: $parent.ShowInfoFilterPopup.bind($parent, query), attr: { \'data-tooltip-text\': Localization.Info }"></a>',
                            '<!-- ko if: $parent.CanEditFilter(query) -->',
                            '<a class="icon icon-pencil action-edit" data-role="tooltip" data-tooltip-position="bottom" data-bind="click: function(data, event) { $parent.EditFilter(query, event); }, attr: { \'data-tooltip-text\': Localization.Edit }"></a>',
                            '<!-- /ko -->',
                            '<!-- ko if: $parent.CanRemoveFilter(query) -->',
                            '<a class="icon icon-close action-delete" data-role="tooltip" data-tooltip-position="bottom" data-bind="click: $parent.RemoveFilter.bind($parent, query), attr: { \'data-tooltip-text\': Localization.Delete }"></a>',
                            '<!-- /ko -->',
                        '</div>',
                    '</div>',
                    '<!-- ko ifnot: $parent.ReadOnly -->',
                    '<div class="filter-editor" data-bind="css: { hidden: !query.edit_mode() }">',
                        '<div class="form-row row-operator">',
                            '<div class="form-col form-col-body"><div class="query-operator k-dropdown-light"></div></div>',
                        '</div>',
                        '<div class="form-row row-arguments">',
                            '<div class="form-col form-col-body filter-editor-arguments"></div>',
                        '</div>',
                        '<!-- ko if: $parent.AllowExecutionParameter() -->',
                        '<div class="form-row row-execution-parameter">',
                            '<div class="form-col" data-bind="text: $parent.Texts().AskForExecutionParamter"></div>',
                            '<div class="form-col switch switch-success query-execution-parameter">',
                                '<label>',
                                    '<input type="checkbox" data-bind="checked: query.is_execution_parameter" />',
                                    '<span class="lever"></span>',
                                '</label>',
                            '</div>',
                        '</div>',
                        '<!-- /ko -->',
                    '</div>',
                   '<!-- /ko -->',
                '</li>',
                '<!-- /ko -->',
                '<!-- ko if: $parent.IsJump(query) -->',
                '<li class="item item-jump" data-bind="css: { \'item-error\': query.warning() }, attr: { \'data-index\': $index }">',
                    '<div class="item-header displayNameContainer small">',
                        '<div class="front">',
                            '<i class="icon icon-followup"></i>',
                        '</div>',
                        '<div class="name" data-role="tooltip" data-tooltip-function="QueryStepViewModel_Tooltip" data-type="html" data-tooltip-position="bottom">',
                            '<div class="name-inner">',
                                '<span class="textEllipsis" data-bind="text: query.name()"></span>',
                                '<!-- ko if: query.is_adhoc() -->',
                                '<i class="icon icon-adhoc sign-adhoc"></i>',
                                '<!-- /ko -->',
                            '</div>',
                            '<!-- ko if: query.warning() -->',
                            '<div class="text-error textEllipsis" data-bind="text: query.warning()"></div>',
                            '<!-- /ko -->',
                        '</div>',
                        '<div class="rear">',
                            '<a class="icon icon-info action-info" data-role="tooltip" data-tooltip-position="bottom" data-bind="click: $parent.ShowInfoJumpPopup.bind($parent, query), attr: { \'data-tooltip-text\': Localization.Info }"></a>',
                            '<!-- ko if: $parent.CanAddFilterFromJump(query) -->',
                            '<a class="icon icon-add-filter action-add-filter" data-role="tooltip" data-tooltip-position="bottom" data-bind="click: $parent.ShowAddFilterFromJumpPopup.bind($parent, query), css: { disabled: !$parent.CanAdd(query) }, attr: { \'data-tooltip-text\': Localization.AddFilterBeforeJump }"></a>',
                            '<!-- /ko -->',
                            '<!-- ko if: $parent.CanRemoveJump(query) -->',
                            '<a class="icon icon-close action-delete" data-role="tooltip" data-tooltip-position="bottom" data-bind="click: $parent.RemoveJump.bind($parent, query), attr: { \'data-tooltip-text\': Localization.Delete }"></a>',
                            '<!-- /ko -->',
                        '</div>',
                    '</div>',
                '</li>',
                '<!-- /ko -->',
                '<!-- /ko -->',
            '</ul>',
            '<!-- ko if: CanApply() -->',
            '<div class="btn-wrapper">',
                '<a class="float-right invisible"></a>',
                '<a class="btn btn-secondary btn-small btn-save" data-bind="click: Save, css: { disabled: !HasChanged(true, false) }, attr: { \'data-busy\': Localization.Saving }">',
                    '<span data-bind="text: Texts().ApplyButton"></span>',
                '</a>',
                '<a class="btn btn-ghost btn-small btn-cancel" data-bind="click: Cancel, css: { disabled: !HasChanged(false, false) }">',
                    '<span data-bind="text: Localization.Cancel"></span>',
                '</a>',
            '</div>',
            '<!-- /ko -->',
        '</div>'
    ].join('');
};

QueryStepView.prototype.GetAggregationTemplate = function () {
    var self = this;
    return [
        '<div class="query-aggregation-wrapper">',
            self.GetAggregationOptionsTemplate(),
            '<ul class="accordion">',
                '<!-- ko if: AggregationOptions().chart_type === enumHandlers.CHARTTYPE.GAUGE.Code -->',
                '<li class="accordion-item query-aggregation-inner query-aggregation-gauge">',
                    '<div class="accordion-header open">',
                        '<i class="open-indicator icon icon-chevron-down"></i>',
                        '<i class="close-indicator icon icon-chevron-right"></i>',
                        '<span data-bind="text: Texts().AggregationHeaderGauge"></span>',
                    '</div>',
                    '<div class="accordion-body" data-bind="foreach: { data: [1, 2, 3, 4, 5, 6] }">',
                        '<div class="form-row row-gauge-value">',
                            '<div class="form-col form-col-header" data-bind="text: kendo.format(Localization.ChartGaugeAreaValue, $data)"></div>',
                            '<div class="form-col form-col-body">',
                                '<input data-bind="attr: { name: \'gauge-value\' + $data }" class="gauge-value"/>',
                            '</div>',
                        '</div>',
                        '<!-- ko if: $data !== 6 -->',
                        '<div class="form-row row-gauge-color">',
                            '<div class="form-col form-col-header" data-bind="text: Localization.ChartGaugeAreaColor"></div>',
                            '<div class="form-col form-col-body">',
                                '<input data-bind="attr: { name: \'gauge-color\' + $data }" class="gauge-color"/>',
                            '</div>',
                        '</div>',
                        '<!-- /ko -->',
                    '</div>',
                '</li>',
                '<!-- /ko -->',
                '<!-- ko if: AggregationOptions().chart_type !== enumHandlers.CHARTTYPE.GAUGE.Code -->',
                '<li class="accordion-item query-aggregation-inner query-aggregation-row">',
                    '<div class="accordion-header open">',
                        '<i class="open-indicator icon icon-chevron-down"></i>',
                        '<i class="close-indicator icon icon-chevron-right"></i>',
                        '<span data-bind="text: Texts().AggregationHeaderRow"></span>',
                        '<div class="accordion-toolbar">',
                            '<!-- ko if: CanAddAggregationField() -->',
                            '<a class="icon icon-plus action action-add-aggregation" data-role="tooltip" data-tooltip-position="bottom" data-bind="click: ShowAddAggregationFieldPopup.bind($root, AggregationFieldViewModel.Area.Row), attr: { \'data-tooltip-text\': Localization.Add }"></a>',
                            '<!-- /ko -->',
                        '</div>',
                    '</div>',
                    '<div class="accordion-body">',
                        '<ul class="query-aggregation">',
                            '<!-- ko foreach: { data: Aggregation, as: \'aggregation\' } -->',
                            '<!-- ko if: aggregation.area() === AggregationFieldViewModel.Area.Row -->',
                            self.GetAggregationItemTemplate(),
                            '<!-- /ko -->',
                            '<!-- /ko -->',
                        '</ul>',
                    '</div>',
                '</li>',
                '<li class="accordion-item query-aggregation-inner query-aggregation-column">',
                    '<div class="accordion-header open">',
                        '<i class="open-indicator icon icon-chevron-down"></i>',
                        '<i class="close-indicator icon icon-chevron-right"></i>',
                        '<span data-bind="text: Texts().AggregationHeaderColumn"></span>',
                        '<div class="accordion-toolbar">',
                            '<!-- ko if: CanAddAggregationField() -->',
                            '<a class="icon icon-plus action action-add-aggregation" data-role="tooltip" data-tooltip-position="bottom" data-bind="click: ShowAddAggregationFieldPopup.bind($root, AggregationFieldViewModel.Area.Column), attr: { \'data-tooltip-text\': Localization.Add }"></a>',
                            '<!-- /ko -->',
                        '</div>',
                    '</div>',
                    '<div class="accordion-body">',
                        '<ul class="query-aggregation">',
                            '<!-- ko foreach: { data: Aggregation, as: \'aggregation\' } -->',
                            '<!-- ko if: aggregation.area() === AggregationFieldViewModel.Area.Column -->',
                            self.GetAggregationItemTemplate(),
                            '<!-- /ko -->',
                            '<!-- /ko -->',
                        '</ul>',
                    '</div>',
                '</li>',
                '<!-- /ko -->',
                '<li class="accordion-item query-aggregation-inner query-aggregation-data">',
                    '<div class="accordion-header open">',
                        '<i class="open-indicator icon icon-chevron-down"></i>',
                        '<i class="close-indicator icon icon-chevron-right"></i>',
                        '<span data-bind="text: Texts().AggregationHeaderData"></span>',
                        '<div class="accordion-toolbar">',
                            '<!-- ko if: CanAddAggregationField() -->',
                            '<a class="icon icon-plus action action-add-aggregation" data-role="tooltip" data-tooltip-position="bottom" data-bind="click: ShowAddAggregationFieldPopup.bind($root, AggregationFieldViewModel.Area.Data), attr: { \'data-tooltip-text\': Localization.Add }"></a>',
                            '<!-- /ko -->',
                        '</div>',
                    '</div>',
                    '<div class="accordion-body">',
                        '<ul class="query-aggregation">',
                            '<!-- ko foreach: { data: Aggregation, as: \'aggregation\' } -->',
                            '<!-- ko if: aggregation.area() === AggregationFieldViewModel.Area.Data -->',
                            self.GetAggregationItemTemplate(),
                            '<!-- /ko -->',
                            '<!-- /ko -->',
                        '</ul>',
                    '</div>',
                '</li>',
                '<!-- /ko -->',
            '</ul>',
            '<!-- ko if: CanApplyAggregation() -->',
            '<div class="query-aggregation-buttons btn-wrapper">',
                '<a class="float-right invisible"></a>',
                '<a class="btn btn-secondary btn-small btn-save" data-bind="click: ApplyAggregation, css: { disabled: !HasAggregationChanged(true) }">',
                    '<span data-bind="text: Localization.Apply"></span>',
                '</a>',
            '</div>',
            '<!-- /ko -->',
        '</div>'
    ].join('');
};
QueryStepView.prototype.GetAggregationItemTemplate = function () {
    return [
        '<li class="item item-aggregation" data-bind="css: { \'item-sortable\': $parent.CanMoveAggregationField(), \'item-warning\': aggregation.warning() }">',
            '<div class="item-header displayNameContainer small">',
                '<!-- ko if: aggregation.is_count_field() -->',
                '<label class="count-field-wrapper" data-bind="css: { disabled: !$parent.CanChangeCountFieldState() }">',
                    '<input type="checkbox" data-bind="checked: aggregation.is_selected, disable: !$parent.CanChangeCountFieldState()"/>',
                    '<span class="label"></span>',
                '</label>',
                '<!-- /ko -->',
                '<!-- ko ifnot: aggregation.is_count_field() -->',
                '<div class="front"></div>',
                '<!-- /ko -->',
                '<div class="name"',
                    ' data-bind="click: $parent.ToggleCountField.bind($parent, aggregation)"',
                    ' data-role="tooltip" data-showwhenneed="true" data-type="text" data-tooltip-position="bottom">',
                    '<div class="name-inner">',
                        '<span class="textEllipsis">',
                            '<span class="caption" data-bind="text: $parent.GetAggregationName(aggregation)"></span>',
                            '<span class="hint" data-bind="text: $parent.GetAggregationHint(aggregation)"></span>',
                        '</span>',
                        '<!-- ko if: aggregation.is_adhoc() -->',
                        '<i class="icon icon-adhoc sign-adhoc"></i>',
                        '<!-- /ko -->',
                    '</div>',
                '</div>',
                '<div class="rear">',
                    '<!-- ko if: $parent.CanAddFilterFromAggregation(aggregation) -->',
                    '<a class="icon icon-filter action-filter" data-role="tooltip" data-tooltip-position="bottom" data-bind="click: $parent.AddFilterFromAggregation.bind($parent, aggregation), attr: { \'data-tooltip-text\': Localization.AddFilter }"></a>',
                    '<!-- /ko -->',
                    '<!-- ko if: $parent.CanEditAggregationFormat(aggregation) -->',
                    '<a class="icon icon-format action-format" data-role="tooltip" data-tooltip-position="bottom" data-bind="click: $parent.ShowEditAggregationFormatPopup.bind($parent, aggregation), attr: { \'data-tooltip-text\': Localization.ListHeaderPopupFormatFields }"></a>',
                    '<!-- /ko -->',
                    '<!-- ko if: $parent.CanAddReferenceLine(aggregation) -->',
                    '<a class="icon icon-reference action-reference-line" data-role="tooltip" data-tooltip-position="bottom" data-bind="click: $parent.ShowAddReferenceLinePopup.bind($parent, aggregation), attr: { \'data-tooltip-text\': Localization.ChartReferenceFieldName }"></a>',
                    '<!-- /ko -->',
                    '<!-- ko if: $parent.CanSortAggregationField(aggregation) -->',
                    '<a class="icon action-sorting" data-role="tooltip" data-tooltip-position="bottom" data-bind="',
                        'css: $parent.GetAggregationSortingClassName(aggregation), ',
                        'attr: { \'data-tooltip-text\': Localization.Sort }, ',
                        'click: $parent.SortAggregationField.bind($parent, aggregation)"></a>',
                    '<!-- /ko -->',
                    '<!-- ko if: $parent.HasAggregationFieldInfo(aggregation) -->',
                    '<a class="icon icon-info action-info" data-role="tooltip" data-tooltip-position="bottom" data-bind="click: $parent.ShowAggregationInfoPopup.bind($parent, aggregation), attr: { \'data-tooltip-text\': Localization.Info }"></a>',
                    '<!-- /ko -->',
                    '<!-- ko if: aggregation.valid() === false -->',
                    '<i class="icon validError" data-role="tooltip" data-tooltip-position="bottom" data-bind="text: aggregation.warning()"></i>',
                    '<!-- /ko -->',
                    '<!-- ko if: $parent.CanRemoveAggregationField(aggregation) -->',
                    '<a class="icon icon-close action-delete" data-role="tooltip" data-tooltip-position="bottom" data-bind="click: $parent.RemoveAggregationField.bind($parent, aggregation), attr: { \'data-tooltip-text\': Localization.Delete }"></a>',
                    '<!-- /ko -->',
                '</div>',
            '</div>',
        '</li>'
    ].join('');
};
QueryStepView.prototype.GetAggregationOptionsTemplate = function () {
    return [
        '<div class="query-aggregation-chart-type always-hide">',
            '<div class="form-row">',
                '<div class="form-col form-col-body">',
                    '<div class="chart-type"></div>',
                '</div>',
            '</div>',
        '</div>'
    ].join('');
};
QueryStepView.prototype.GetAggregationFormatTemplate = function () {
    return [
        '<div class="field-format-wrapper">',
            '<div class="form-row row-alias" data-bind="visible: Data.alias.valid">',
                '<div class="form-col form-col-header" data-bind="text: Texts().HeaderAlias"></div>',
                '<div class="form-col form-col-body">',
                    '<input type="text" class="input-alias-value" maxlength="255" data-bind="value: Data.alias.value, css: { placeholder: IsAliasPlaceholder() }" />',
                '</div>',
            '</div>',
            '<div class="form-row row-operator" data-bind="visible: Data.operator.valid">',
                '<div class="form-col form-col-header" data-bind="text: Texts().HeaderOperator"></div>',
                '<div class="form-col form-col-body">',
                    '<input type="text" class="input-operator-value k-dropdown" />',
                '</div>',
            '</div>',
            '<div class="form-row row-unit" data-bind="visible: Data.unit.valid">',
                '<div class="form-col form-col-header" data-bind="text: Texts().HeaderUnit"></div>',
                '<div class="form-col form-col-body">',
                    '<input type="text" class="input-unit-value k-dropdown" />',
                '</div>',
            '</div>',
            '<div class="form-row row-decimal" data-bind="visible: Data.decimal.valid">',
                '<div class="form-col form-col-header" data-bind="text: Texts().HeaderDecimal"></div>',
                '<div class="form-col form-col-body">',
                    '<input type="text" class="input-decimal-value k-dropdown" />',
                '</div>',
            '</div>',
            '<div class="form-row row-format" data-bind="visible: Data.format.valid">',
                '<div class="form-col form-col-header" data-bind="text: Texts().HeaderFormat"></div>',
                '<div class="form-col form-col-body">',
                    '<input type="text" class="input-format-value k-dropdown" />',
                '</div>',
            '</div>',
            '<div class="form-row row-second" data-bind="visible: Data.second.valid">',
                '<div class="form-col form-col-header" data-bind="text: Texts().HeaderSecond"></div>',
                '<div class="form-col form-col-body">',
                    '<input type="text" class="input-second-value k-dropdown" />',
                '</div>',
            '</div>',
            '<div class="form-row row-thousandseparator" data-bind="visible: Data.thousandseparator.valid">',
                '<div class="form-col form-col-body">',
                    '<input type="checkbox" name="thousand-separator" class="input-thousand-separator-value" value="true" data-bind="attr: { \'data-label\': Texts().HeaderThousandSeparator }, checked: Data.thousandseparator.value, IndeterminatableChange: Data.thousandseparator.value" />',
                '</div>',
            '</div>',
        '</div>'
    ].join('');
};