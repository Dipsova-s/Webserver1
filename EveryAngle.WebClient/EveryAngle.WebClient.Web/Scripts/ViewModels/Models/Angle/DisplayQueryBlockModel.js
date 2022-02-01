var displayQueryBlockModel = new DisplayQueryBlockModel();
var displayQueryBlockModelForSplitScreen = new DisplayQueryBlockModel();

function DisplayQueryBlockModel(model) {
    "use strict";

    var self = this;
    /*BOF: Model Properties*/
    self.QuerySteps = ko.observableArray([]);
    self.TempQuerySteps = ko.observableArray([]);
    self.ExcuteParameters = ko.observable(null);
    /*EOF: Model Properties*/

    /*BOF: Model Methods*/
    self.CollectQueryBlocks = function (source) {
        var querySteps = [];
        var aggrStep = null;
        var baseQuerySteps;
        if (jQuery.isArray(source)) {
            baseQuerySteps = source;
        }
        else if (source === true) {
            baseQuerySteps = self.TempQuerySteps();
        }
        else {
            baseQuerySteps = self.QuerySteps();
        }

        jQuery.each(ko.toJS(baseQuerySteps), function (index, queryStep) {
            if (queryStep.step_type === enumHandlers.FILTERTYPE.FILTER) {
                querySteps.push({
                    step_type: queryStep.step_type,
                    field: queryStep.field,
                    operator: queryStep.operator,
                    arguments: queryStep.arguments,
                    valid: queryStep.valid !== false,
                    validation_details: queryStep.validation_details,
                    is_applied: queryStep.is_applied,
                    is_adhoc_filter: queryStep.is_adhoc_filter,
                    is_adhoc: queryStep.is_adhoc,
                    is_dashboard_filter: queryStep.is_dashboard_filter,
                    is_execution_parameter: queryStep.is_execution_parameter,
                    execution_parameter_id: queryStep.execution_parameter_id
                });
            }
            else if (queryStep.step_type === enumHandlers.FILTERTYPE.FOLLOWUP) {
                querySteps.push({
                    step_type: queryStep.step_type,
                    followup: queryStep.followup,
                    valid: queryStep.valid !== false,
                    validation_details: queryStep.validation_details,
                    is_applied: queryStep.is_applied,
                    is_adhoc_filter: queryStep.is_adhoc_filter,
                    is_adhoc: queryStep.is_adhoc
                });
            }
            else if (queryStep.step_type === enumHandlers.FILTERTYPE.SORTING) {
                querySteps.push({
                    step_type: queryStep.step_type,
                    sorting_fields: queryStep.sorting_fields,
                    valid: queryStep.valid !== false,
                    validation_details: queryStep.validation_details
                });
            }
            else if (queryStep.step_type === enumHandlers.FILTERTYPE.AGGREGATION) {
                aggrStep = {
                    step_type: queryStep.step_type,
                    aggregation_fields: queryStep.aggregation_fields.slice(),
                    valid: queryStep.valid !== false,
                    validation_details: queryStep.validation_details
                };
                if (queryStep.grouping_fields && queryStep.grouping_fields.length) {
                    aggrStep.grouping_fields = queryStep.grouping_fields.slice();
                }
            }
        });

        if (aggrStep) {
            querySteps.push(aggrStep);
        }

        if (!querySteps.length) {
            return [];
        }
        else {
            return [{
                queryblock_type: enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS,
                query_steps: querySteps
            }];
        }
    };
    self.SetDisplayQueryBlock = function (queryBlocks) {
        defaultValueHandler.CheckAndExtendProperties(queryBlocks, enumHandlers.VIEWMODELNAME.QUERYBLOCK, true);
        self.QuerySteps.removeAll();
        self.TempQuerySteps.removeAll();

        var queryStepBlock = WC.Utility.ToArray(queryBlocks).findObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS);
        if (queryStepBlock) {
            jQuery.each(queryStepBlock.query_steps, function (index, queryStep) {
                self.QuerySteps.push(new WidgetFilterModel(queryStep));
                self.TempQuerySteps.push(new WidgetFilterModel(queryStep));
            });
        }
    };
    self.UpdateExecutionParameters = function () {
        // update executed parameters
        var excuteParameters = self.ExcuteParameters();
        if (excuteParameters && excuteParameters.execution_parameters instanceof Array) {

            jQuery.each(self.QuerySteps(), function (index, queryStep) {
                var parameterStep = excuteParameters.execution_parameters.findObject('execution_parameter_id', queryStep.execution_parameter_id);

                if (queryStep.step_type === enumHandlers.FILTERTYPE.FILTER && queryStep.is_execution_parameter() && parameterStep) {
                    self.QuerySteps()[index].operator = parameterStep.operator;
                    self.QuerySteps()[index].arguments = parameterStep.arguments.slice();

                    self.TempQuerySteps()[index].operator = parameterStep.operator;
                    self.TempQuerySteps()[index].arguments = parameterStep.arguments.slice();
                }
            });

        }
    };
    self.CommitAll = function () {
        self.QuerySteps.removeAll();

        var aggrStep = null;
        jQuery.each(self.TempQuerySteps(), function (index, queryStep) {
            if (queryStep.step_type === enumHandlers.FILTERTYPE.AGGREGATION) {
                aggrStep = new WidgetFilterModel(queryStep);
            }
            else {
                self.QuerySteps.push(new WidgetFilterModel(queryStep));
            }
        });

        if (aggrStep) {
            self.QuerySteps.push(aggrStep);
        }
    };
    self.ResetAll = function () {
        self.TempQuerySteps.removeAll();

        var aggrStep = null;
        jQuery.each(self.QuerySteps(), function (index, queryStep) {
            if (queryStep.step_type === enumHandlers.FILTERTYPE.AGGREGATION) {
                aggrStep = new WidgetFilterModel(queryStep);
            }
            else {
                self.TempQuerySteps.push(new WidgetFilterModel(queryStep));
            }
        });

        if (aggrStep) {
            self.TempQuerySteps.push(aggrStep);
        }
    };
    self.GetFollowupQueryStep = function (followup, isTemp) {
        var querySteps = isTemp === true ? self.TempQuerySteps() : self.QuerySteps();
        return jQuery.grep(querySteps, function (queryStep) {
            return queryStep.step_type === enumHandlers.FILTERTYPE.FOLLOWUP
                && (!followup || followup && queryStep.followup === followup.id);
        });
    };
    self.GetSortingQueryStep = function () {
        return jQuery.grep(self.QuerySteps(), function (queryStep) {
            return queryStep.step_type === enumHandlers.FILTERTYPE.SORTING;
        });
    };
    self.GetQueryStepByType = function (type, querySteps) {
        var steps = IsNullOrEmpty(querySteps) ? self.QuerySteps() : querySteps;

        return jQuery.grep(steps, function (queryStep) { return queryStep.step_type === type; });
    };
    self.GetQueryStepByNotInType = function (type, querySteps) {
        var steps = IsNullOrEmpty(querySteps) ? self.QuerySteps() : querySteps;

        return jQuery.grep(steps, function (queryStep) { return queryStep.step_type !== type; });
    };
    self.GetPostedQueryStepByType = function (type) {
        var postedQueryBlocks = self.CollectQueryBlocks();
        return postedQueryBlocks.lenght === 0 ? [] : jQuery.grep(postedQueryBlocks[0].query_steps, function (queryStep) { return queryStep.step_type === type; });
    };
    self.GetAggregationStepByFieldSetting = function (fields) {
        var groupingFields = [];
        var aggregationFields = [];
        jQuery.each(fields, function (index, field) {
            if (!field.IsSelected)
                return;
            
            if (field.Area !== enumHandlers.FIELDSETTINGAREA.DATA) {
                // grouping fields section
                var groupingField = {
                    field: field.FieldName,
                    operator: field.Bucket.Operator,
                    source_field: field.Bucket.source_field
                };
                groupingFields.push(groupingField);
            }
            else {
                // aggreagation fields section
                var aggregationField = {
                    field: field.FieldName,
                    operator: field.Bucket.Operator,
                    source_field: field.Bucket.source_field
                };
                if (field.FieldName === enumHandlers.AGGREGATION.COUNT.Value)
                    delete aggregationField.source_field;
                aggregationFields.push(aggregationField);
            }
        });
        var aggregationJson = {
            step_type: enumHandlers.FILTERTYPE.AGGREGATION,
            aggregation_fields: aggregationFields
        };
        if (groupingFields.length)
            aggregationJson.grouping_fields = groupingFields;
        return new WidgetFilterModel(aggregationJson);
    };
    self.GetAggregationQueryStepByFieldId = function (fieldId) {
        var aggregationQuerySteps = self.GetQueryStepByType(enumHandlers.FILTERTYPE.AGGREGATION);
        var existingQueryStep = null;
        if (aggregationQuerySteps.length > 0) {
            var existingQuerySteps = jQuery.grep(aggregationQuerySteps[0].aggregation_fields, function (step) {
                return step.field.toLowerCase() === fieldId.toLowerCase();
            });
            if (existingQuerySteps.length > 0) {
                existingQueryStep = existingQuerySteps[0];
            } else {
                if (!IsNullOrEmpty(aggregationQuerySteps[0].grouping_fields)) {
                    existingQuerySteps = jQuery.grep(aggregationQuerySteps[0].grouping_fields, function (step) {
                        return step.field.toLowerCase() === fieldId.toLowerCase();
                    });
                    if (existingQuerySteps.length > 0) {
                        existingQueryStep = existingQuerySteps[0];
                    }
                }
            }
        }
        return existingQueryStep;
    };
    self.GetAllFollowupSteps = function (isTemp) {
        return self.GetFollowupQueryStep(null, isTemp);
    };
    /*EOF: Model Methods*/

    if (typeof model !== 'undefined') {
        self.SetDisplayQueryBlock(model);
    }
}
