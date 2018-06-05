var displayQueryBlockModel = new DisplayQueryBlockModel();

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
                    is_adhoc_filter: queryStep.is_adhoc_filter,
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
                    is_adhoc_filter: queryStep.is_adhoc_filter
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
            var parematerIndex = 0;
            jQuery.each(self.QuerySteps(), function (index, queryStep) {
                if (queryStep.step_type === enumHandlers.FILTERTYPE.FILTER && queryStep.is_execution_parameter()) {
                    var parameterStep = excuteParameters.execution_parameters[parematerIndex];
                    if (parameterStep) {
                        self.QuerySteps()[index].operator = parameterStep.operator;
                        self.QuerySteps()[index].arguments = parameterStep.arguments.slice();

                        self.TempQuerySteps()[index].operator = parameterStep.operator;
                        self.TempQuerySteps()[index].arguments = parameterStep.arguments.slice();

                        parematerIndex++;
                    }
                    else {
                        return false;
                    }
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
                && (!followup || (followup && queryStep.followup === followup.id));
        });
    };
    self.GetSortingQueryStep = function () {
        return jQuery.grep(self.QuerySteps(), function (queryStep) { return queryStep.step_type === enumHandlers.FILTERTYPE.SORTING });
    };
    self.GetQueryStepByType = function (type, querySteps) {
        var steps = IsNullOrEmpty(querySteps) ? self.QuerySteps() : querySteps;

        return jQuery.grep(steps, function (queryStep) { return queryStep.step_type === type });
    };
    self.GetQueryStepByNotInType = function (type, querySteps) {
        var steps = IsNullOrEmpty(querySteps) ? self.QuerySteps() : querySteps;

        return jQuery.grep(steps, function (queryStep) { return queryStep.step_type !== type });
    };
    self.GetPostedQueryStepByType = function (type) {
        var postedQueryBlocks = self.CollectQueryBlocks();
        return postedQueryBlocks.lenght === 0 ? [] : jQuery.grep(postedQueryBlocks[0].query_steps, function (queryStep) { return queryStep.step_type === type });
    };
    self.GetAggregationStepByFieldSetting = function (fieldSettings) {
        var fieldSettingObject = JSON.parse(fieldSettings.Fields);
        var grouping_fields_section = [];
        var aggregation_fields_section = [];
        jQuery.each(fieldSettingObject, function (index, fieldSettingElement) {
            if (fieldSettingElement.IsSelected) {
                var existingQuerystepField = self.GetAggregationQueryStepByFieldId(fieldSettingElement.FieldName);
                if (fieldSettingElement.Area !== enumHandlers.FIELDSETTINGAREA.DATA) {
                    // grouping section    
                    if (existingQuerystepField !== null) {
                        existingQuerystepField.field = fieldSettingElement.FieldName;
                        existingQuerystepField.operator = fieldSettingElement.Bucket.Operator;
                        grouping_fields_section.push(existingQuerystepField);
                    }
                    else {
                        grouping_fields_section.push({
                            field: fieldSettingElement.FieldName,
                            operator: fieldSettingElement.Bucket.Operator,
                            source_field: fieldSettingElement.Bucket.source_field
                        });
                    }
                }
                else {
                    // aggreagation section 
                    if (existingQuerystepField !== null) {
                        existingQuerystepField.field = fieldSettingElement.FieldName;
                        existingQuerystepField.operator = fieldSettingElement.Bucket.Operator;
                        aggregation_fields_section.push(existingQuerystepField);
                    }
                    else {
                        aggregation_fields_section.push({
                            field: fieldSettingElement.FieldName,
                            operator: fieldSettingElement.Bucket.Operator,
                            source_field: fieldSettingElement.Bucket.source_field
                        });
                    }
                }
            }
        });
       
        var aggregationJson = {
            step_type: enumHandlers.FILTERTYPE.AGGREGATION,
            aggregation_fields: aggregation_fields_section
        };

        if (grouping_fields_section.length) {
            aggregationJson.grouping_fields = grouping_fields_section;
        }

        return new WidgetFilterModel(aggregationJson);
    };
    self.GetAggregationQueryStepByFieldId = function (fieldId) {
        var aggregationQuerySteps = self.GetQueryStepByType(enumHandlers.FILTERTYPE.AGGREGATION);
        var existingQueryStep = null;
        if (aggregationQuerySteps.length > 0) {

            var existingQuerySteps = jQuery.grep(aggregationQuerySteps[0].aggregation_fields, function (step, index) {
                return step.field.toLowerCase() === fieldId.toLowerCase();
            });
            if (existingQuerySteps.length > 0) {
                existingQueryStep = existingQuerySteps[0];
            } else {
                if (!IsNullOrEmpty(aggregationQuerySteps[0].grouping_fields)) {
                    existingQuerySteps = jQuery.grep(aggregationQuerySteps[0].grouping_fields, function (step, index) {
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
    self.DeleteQueryStep = function (index, queryStep, event) {
        
        if (queryStep.is_adhoc_filter) {
            var oldQueryStep = [];
            jQuery.each(self.QuerySteps(), function (index, step) {
                oldQueryStep.push(new WidgetFilterModel(ko.toJS(step)));
            });
            var oldQueryStepTemp = [];
            jQuery.each(self.TempQuerySteps(), function (index, step) {
                oldQueryStepTemp.push(new WidgetFilterModel(ko.toJS(step)));
            });

            if (queryStep.step_type === enumHandlers.FILTERTYPE.FOLLOWUP) {
                var i, isAggrRemoved = false;
                for (i = self.TempQuerySteps().length - 1; i >= index; i--) {
                    if (self.TempQuerySteps()[i].step_type === enumHandlers.FILTERTYPE.AGGREGATION) {
                        isAggrRemoved = true;
                    }
                    self.TempQuerySteps.remove(self.TempQuerySteps()[i]);
                }
                if (!isAggrRemoved) {
                    self.TempQuerySteps.remove(function (query) {
                        return query.step_type === enumHandlers.FILTERTYPE.AGGREGATION;
                    });
                }
            }
            else {
                self.TempQuerySteps.remove(self.TempQuerySteps()[index]);
            }
            self.CommitAll();

            if (angleInfoModel.IsTemporaryAngle()) {
                var queryBlocks = jQuery.grep(displayModel.Data().query_blocks, function (queryBlock) { return queryBlock.queryblock_type === enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS });
                if (queryBlocks.length > 0) {
                    queryBlocks[0].query_steps.splice(index, 1);

                    if (queryBlocks[0].query_steps.length === 0) {
                        displayModel.Data().query_blocks = [];
                        /* M4-11731: Always set 'Keep active display filters' checked when display as ad-hoc display (still don't show if display had jump) */
                        
                    }

                    displayModel.Data.commit();
                }
            }

            progressbarModel.ShowStartProgressBar(Localization.ProgressBar_PostResult, false);

            var oldDisplayModel = historyModel.Get(displayModel.Data().uri);
            progressbarModel.CancelCustomHandler = true;
            progressbarModel.CancelFunction = function () {
                self.QuerySteps(oldQueryStep);
                self.TempQuerySteps(oldQueryStepTemp);

                WC.Ajax.AbortAll();
                displayModel.LoadSuccess(oldDisplayModel);
                resultModel.LoadSuccess(oldDisplayModel.results);
                historyModel.Save();
                resultModel.GetResult(resultModel.Data().uri)
                    .then(resultModel.LoadResultFields)
                    .done(function () {
                        resultModel.ApplyResult();
                    });
            };

            // refresh resule grid after add query step
            var queryblocks = self.CollectQueryBlocks();
            if (queryblocks !== null && queryblocks.length > 0) {
                queryblocks =  jQuery.grep(queryblocks[0].query_steps, function (n) {
                    return (n.valid !== false);
                });
                queryblocks = [
                    {
                        queryblock_type: enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS,
                        query_steps: queryblocks
                    }
                ]
            }

            var lastFollowup = null;
            if (queryStep.step_type === enumHandlers.FILTERTYPE.FOLLOWUP) {
                var followupSteps = self.GetQueryStepByType(enumHandlers.FILTERTYPE.FOLLOWUP, self.TempQuerySteps());
                if (followupSteps.length) {
                    lastFollowup = followupSteps[followupSteps.length - 1];
                }
                else {
                    followupSteps = angleQueryStepModel.GetFollowupQueryStep();
                    if (followupSteps.length) {
                        lastFollowup = followupSteps[followupSteps.length - 1];
                    }
                }
            }

            jQuery.when(lastFollowup ? followupPageHandler.GetDefaultJumpTemplate(lastFollowup.followup) : null)
            .done(function (jumpDisplay) {
                if (jumpDisplay) {
                    var displayData = historyModel.Get(displayModel.Data().uri);
                    displayData.display_details = jumpDisplay.display_details;
                    displayData.query_blocks = followupPageHandler.GetQueryBlockFromJumpTemplate(queryblocks, jumpDisplay.query_blocks);
                    displayData.display_type = jumpDisplay.display_type;
                    displayData.fields = jumpDisplay.fields;
                    delete displayData.results;
                    
                    historyModel.Set(displayModel.Data().uri, displayData);
                    historyModel.Set(displayModel.Data().uri + historyModel.OriginalVersionSuffix, displayData);

                    anglePageHandler.KeepHistory = false;
                    anglePageHandler.ExecuteAngle();
                }
                else {
                    resultModel.PostResult({ customQueryBlocks: queryblocks })
                        .then(function () {
                            historyModel.Save();
                            return resultModel.GetResult(resultModel.Data().uri);
                        })
                        .then(function () {
                            if (queryStep.step_type === enumHandlers.FILTERTYPE.FOLLOWUP) {
                                return displayModel.GetDefaultListFields(resultModel.Data())
                                    .done(function (fields) {
                                        displayModel.Data().query_blocks = self.CollectQueryBlocks(true);
                                        displayModel.Data().display_type = enumHandlers.DISPLAYTYPE.LIST;
                                        displayModel.Data().fields = fields;
                                        displayModel.Data.commit();
                                    });
                            }
                            else {
                                return resultModel.LoadResultFields();
                            }
                        })
                        .done(function () {
                            resultModel.ApplyResult();
                        });
                }
            });
        }
    };
    /*EOF: Model Methods*/

    if (typeof model !== 'undefined') {
        self.SetDisplayQueryBlock(model);
    }
}
