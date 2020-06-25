(function (window) {

    var getMessages = function (data) {
        var messages = [];
        jQuery.each(data, function (index, value) {
            if (value && value.valid === false) {
                messages.push(validationHandler.GetValidationError(value, self.model));
            }
        });
        return messages.join(', ');
    };

    function FitlerQueryStepViewModel(queryStep, modelUri, checkValid) {
        "use strict";

        // initial
        var _self = {};
        var self = this;
        jQuery.extend(self, queryStep);
        jQuery.extend(_self, queryStep);
        self.model = modelUri;

        var getData = function (data) {
            data = ko.toJS(data);
            WC.ModelHelper.RemoveReadOnlyQueryStep(data);
            return data;
        };
        var validation = function () {
            var result = { valid: true };
            if (self.operator() !== enumHandlers.OPERATOR.HASVALUE.Value
                && self.operator() !== enumHandlers.OPERATOR.HASNOVALUE.Value
                && !self.arguments().length
                && !self.is_execution_parameter()) {
                result.valid = false;
                result.validation_details = {
                    field: self.field,
                    template: Localization.Error_FieldNoArgument,
                    warning_type: validationHandler.WARNINGTYPE.FIELD
                };
            }
            else if (WC.WidgetFilterHelper.IsBetweenGroupOperator(self.operator())) {
                var argsCount = jQuery.grep(self.arguments(), function (argument) { return argument && argument.argument_type; }).length;
                var isInvalidExecutionParameter = self.is_execution_parameter() && !(argsCount === 0 || argsCount === 2);
                var isInvalidArgument = !self.is_execution_parameter() && argsCount !== 2;
                if (isInvalidExecutionParameter || isInvalidArgument) {
                    result.valid = false;
                    result.validation_details = {
                        field: self.field,
                        template: Localization.Error_FieldContainsInvalidArguments,
                        warning_type: validationHandler.WARNINGTYPE.FIELD
                    };
                }
            }
            return result;
        };
        var includedEndDate = function () {
            return self.arguments().hasObject('included_end_date', true);
        };

        // implement
        WC.ModelHelper.ExtendValidProperty(self);
        self.operator = ko.observable(self.operator);
        self.arguments = ko.observableArray(WC.Utility.ToArray(self.arguments));
        self.is_execution_parameter = ko.observable(WC.Utility.ToBoolean(self.is_execution_parameter));

        // extend valid property
        self.valid_field = self.valid;
        if (checkValid === true && self.valid) {
            var validResult = validation();
            jQuery.extend(self, validResult);
        }
        self.valid = ko.observable(self.valid);

        // custom
        self.is_adhoc = ko.observable(WC.Utility.ToBoolean(self.is_adhoc));
        self.is_adhoc_filter = self.is_adhoc();
        self.edit_mode = ko.observable(WC.Utility.ToBoolean(self.edit_mode));
        self.is_applied = WC.Utility.ToBoolean(self.is_applied);
        self.step_type_index = 0;
        self.name = function (query) {
            return WC.WidgetFilterHelper.GetFilterText(ko.toJS(query || self), self.model);
        };
        self.warning = function () {
            var message = validationHandler.GetValidationError(ko.toJS(self), self.model);
            var messageArgs = getMessages(self.arguments());
            return message + (message && messageArgs ? ', ' : '') + messageArgs;
        };
        self.validate = function () {
            return validation();
        };
        self.undo = function () {
            self.operator(_self.operator);
            self.arguments(_self.arguments);
            self.is_execution_parameter(_self.is_execution_parameter);
        };
        self.data = function () {
            return getData(self);
        };
        self.raw = function () {
            return getData(_self);
        };
        self.is_changed = function (data) {
            var source = self.data();
            var compare = getData(data || {
                step_type: self.step_type,
                field: self.field,
                operator: _self.operator,
                arguments: _self.arguments,
                is_execution_parameter: _self.is_execution_parameter,
                execution_parameter_id: _self.execution_parameter_id
            });
            delete compare.execution_parameter_id;
            delete source.execution_parameter_id;
            return !jQuery.deepCompare(source, compare, true, false);
        };
        self.can_include_end_date = ko.observable(false);
        self.included_end_date = ko.observable(includedEndDate());
        self.included_end_date.subscribe(function (value) {
            self.arguments(jQuery.map(self.arguments(), function (arg, index) {
                delete arg.included_end_date;
                if (self.can_include_end_date() && index === 1 && value === true)
                    arg.included_end_date = value;
                return arg;
            }));
        });
    }

    function JumpQueryStepViewModel(queryStep, modelUri) {
        "use strict";

        // initial
        var _self = {};
        var self = this;
        jQuery.extend(self, queryStep);
        jQuery.extend(_self, queryStep);
        self.model = modelUri;

        var getData = function (data) {
            data = ko.toJS(data);
            WC.ModelHelper.RemoveReadOnlyQueryStep(data);
            return {
                step_type: data.step_type,
                followup: data.followup
            };
        };

        // implement
        WC.ModelHelper.ExtendValidProperty(self);
        self.valid = ko.observable(self.valid);

        // custom
        self.is_adhoc = ko.observable(WC.Utility.ToBoolean(self.is_adhoc));
        self.is_adhoc_filter = self.is_adhoc();
        self.edit_mode = ko.observable(false);
        self.is_applied = WC.Utility.ToBoolean(self.is_applied);
        self.step_type_index = 0;
        self.name = function () {
            return WC.WidgetFilterHelper.GetFilterText(ko.toJS(self), self.model);
        };
        self.warning = function () {
            return validationHandler.GetValidationError(ko.toJS(self), self.model);
        };
        self.validate = jQuery.noop;
        self.undo = jQuery.noop;
        self.data = function () {
            return getData(self);
        };
        self.is_changed = function (data) {
            var compare = getData(data || {
                step_type: self.step_type,
                followup: _self.followup
            });
            return !jQuery.deepCompare(self.data(), compare, false, false);
        };
    }

    function SortingQueryStepViewModel(queryStep, modelUri) {
        "use strict";

        // initial
        var _self = {};
        var self = this;
        jQuery.extend(self, queryStep);
        jQuery.extend(_self, queryStep);
        self.model = modelUri;

        var getData = function (data) {
            data = ko.toJS(data);
            WC.ModelHelper.RemoveReadOnlyQueryStep(data);
            return {
                step_type: data.step_type,
                sorting_fields: data.sorting_fields
            };
        };

        // implement
        self.is_adhoc = ko.observable(WC.Utility.ToBoolean(self.is_adhoc));
        self.is_applied = WC.Utility.ToBoolean(self.is_applied);
        self.step_type_index = 1;
        self.warning = function () {
            return getMessages(self.sorting_fields);
        };
        self.data = function () {
            return getData(self);
        };
        self.is_changed = function (data) {
            var compare = getData(data || {
                step_type: self.step_type,
                sorting_fields: _self.sorting_fields
            });
            return !jQuery.deepCompare(self.data(), compare, false, false);
        };
    }

    function AggregationQueryStepViewModel(queryStep, modelUri) {
        "use strict";

        // initial
        var _self = {};
        var self = this;
        jQuery.extend(self, queryStep);
        jQuery.extend(_self, queryStep);
        self.model = modelUri;

        var getData = function (data) {
            data = ko.toJS(data);
            WC.ModelHelper.RemoveReadOnlyQueryStep(data);
            return {
                step_type: data.step_type,
                aggregation_fields: data.aggregation_fields,
                grouping_fields: data.grouping_fields
            };
        };

        // implement
        self.is_adhoc = ko.observable(WC.Utility.ToBoolean(self.is_adhoc));
        self.is_applied = WC.Utility.ToBoolean(self.is_applied);
        self.step_type_index = 2;
        self.aggregation_fields = WC.Utility.ToArray(self.aggregation_fields);
        self.grouping_fields = WC.Utility.ToArray(self.grouping_fields);
        self.warning = function () {
            var message1 = getMessages(WC.Utility.ToArray(self.aggregation_fields));
            var message2 = getMessages(WC.Utility.ToArray(self.grouping_fields));
            return message1 + (message1 && message2 ? ', ' : '') + message2;
        };
        self.data = function () {
            return getData(self);
        };
        self.is_changed = function (data) {
            var compare = getData(data || {
                step_type: self.step_type,
                aggregation_fields: _self.aggregation_fields,
                grouping_fields: _self.grouping_fields
            });
            return !jQuery.deepCompare(self.data(), compare, false, false);
        };
    }

    function AggregationFieldViewModel(aggregation, modelUri, details, alias, selected) {
        "use strict";

        // initial
        var _self = {};
        var countFieldId = window.AggregationFieldViewModel.CountFieldId;
        var self = this;
        var extraData = {
            details: details,
            multi_lang_alias: WC.Utility.ToArray(alias),
            is_selected: WC.Utility.ToBoolean(selected)
        };
        jQuery.extend(self, aggregation, extraData);
        jQuery.extend(_self, aggregation, extraData);
        self.model = modelUri;

        var getData = function (data) {
            data = ko.toJS(data);
            WC.ModelHelper.RemoveReadOnlyQueryStep(data);
            var result = {
                field: data.field,
                operator: data.operator,
                source_field: data.source_field
            };
            if (countFieldId === data.field)
                delete result.source_field;
            return result;
        };
        var getDataField = function (data) {
            data = ko.toJS(data);
            return {
                field: data.field,
                field_details: JSON.stringify(data.details),
                multi_lang_alias: data.multi_lang_alias
            };
        };

        // implement
        WC.ModelHelper.ExtendValidProperty(self);
        self.valid = ko.observable(self.valid);
        self.field = ko.observable(self.field);
        self.operator = ko.observable(self.operator);
        self.source_field = self.source_field || self.field();

        // custom
        self.is_selected = ko.observable(self.is_selected);
        self.is_adhoc = ko.observable(WC.Utility.ToBoolean(self.is_adhoc));
        self.details = ko.observable(self.details);
        self.multi_lang_alias = ko.observableArray(self.multi_lang_alias);
        self.warning = function () {
            return validationHandler.GetValidationError(ko.toJS(self), self.model);
        };
        self.data = function () {
            return getData(self);
        };
        self.data_field = function () {
            return getDataField(self);
        };
        self.area = function (area) {
            if (typeof area === 'undefined')
                return self.details()[enumHandlers.FIELDDETAILPROPERTIES.AREA];
            else {
                var details = self.details();
                details[enumHandlers.FIELDDETAILPROPERTIES.AREA] = area;
                self.details(details);
            }
        };
        self.sorting = function (sorting) {
            if (typeof sorting === 'undefined')
                return self.details()[enumHandlers.FIELDDETAILPROPERTIES.SORTING];
            else {
                var details = self.details();
                details[enumHandlers.FIELDDETAILPROPERTIES.SORTING] = sorting;
                self.details(details);
            }
        };
        self.is_changed = function (data) {
            var compareData = ko.toJS(data || _self);
            return !jQuery.deepCompare(self.data(), getData(compareData), false, false)
                || !jQuery.deepCompare(self.data_field(), getDataField(compareData), false, false)
                || self.is_selected() !== compareData.is_selected;
        };
        self.is_count_field = function () {
            return self.field() === countFieldId;
        };
    }
    AggregationFieldViewModel.CountFieldId = 'count';
    AggregationFieldViewModel.Area = {
        Row: 'row',
        Column: 'column',
        Data: 'data'
    };
    AggregationFieldViewModel.Sorting = {
        Ascending: 'asc',
        Descending: 'desc',
        Unsorted: ''
    };
    window.AggregationFieldViewModel = AggregationFieldViewModel;

    window.QueryStepViewModel = function (queryStep, modelUri, checkValid) {
        "use strict";
        
        var self = this;
        var mappers = {};
        mappers[enumHandlers.FILTERTYPE.FILTER] = FitlerQueryStepViewModel;
        mappers[enumHandlers.FILTERTYPE.FOLLOWUP] = JumpQueryStepViewModel;
        mappers[enumHandlers.FILTERTYPE.SORTING] = SortingQueryStepViewModel;
        mappers[enumHandlers.FILTERTYPE.AGGREGATION] = AggregationQueryStepViewModel;
        queryStep = ko.toJS(queryStep || {});
        var viewModel = mappers[queryStep.step_type];
        if (viewModel) {
            jQuery.extend(self, new viewModel(queryStep, modelUri, checkValid));
        }
    };

    window.QueryStepViewModel_Tooltip = function () {
        var element = this;
        var template = kendo.template('#: name ## if (warning) { #<br><br><em>#: warning #</em># } #');
        var nameElement = element.find('.name-inner > span');
        var warningElement = element.find('.text-error');
        var data = {
            name: nameElement.text(),
            warning: warningElement.text()
        };
        var size = nameElement.get(0).getBoundingClientRect().width;
        var font1 = WC.HtmlHelper.GetFontCss(nameElement);
        var textSize1 = WC.Utility.MeasureText(data.name, font1);
        var font2 = WC.HtmlHelper.GetFontCss(warningElement);
        var textSize2 = WC.Utility.MeasureText(data.warning, font2);
        return textSize1 > size || textSize2 > size ? template(data) : '';
    };

})(window);