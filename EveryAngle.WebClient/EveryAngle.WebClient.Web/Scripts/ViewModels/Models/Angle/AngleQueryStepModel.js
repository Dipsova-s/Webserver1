var angleQueryStepModel = new AngleQueryStepModel();

function AngleQueryStepModel() {
    "use strict";

    var self = this;
    /*BOF: Model Properties*/
    self.BaseClasses = ko.observable({});
    self.QuerySteps = ko.observableArray([]);
    self.TempQuerySteps = ko.observableArray([]);
    self.ExcuteParameters = ko.observable(null);
    /*EOF: Model Properties*/

    /*BOF: Model Methods*/
    self.GetClassName = function (classId) {
        var modelUri = angleInfoModel.Data() ? angleInfoModel.Data().model : '',
            classObj = modelClassesHandler.GetClassById(classId, modelUri) || { id: classId };
        return userFriendlyNameHandler.GetFriendlyName(classObj, enumHandlers.FRIENDLYNAMEMODE.SHORTNAME);
    };
    self.SetQueryStep = function (querySteps) {
        self.QuerySteps.removeAll();
        self.TempQuerySteps.removeAll();

        jQuery.each(ko.toJS(querySteps), function (index, queryStep) {
            self.QuerySteps.push(new WidgetFilterModel(queryStep));
            self.TempQuerySteps.push(new WidgetFilterModel(queryStep));
        });
    };
    self.GetQueryStep = function (querySteps) {
        querySteps = ko.toJS(typeof querySteps === 'undefined' ? self.QuerySteps() : querySteps);
        var queryDefinition = { queryblock_type: enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS, query_steps: [] };

        jQuery.each(querySteps, function (index, queryStep) {
            if (queryStep.step_type === enumHandlers.FILTERTYPE.FILTER) {
                var temp = {
                    step_type: queryStep.step_type,
                    field: queryStep.field,
                    operator: queryStep.operator,
                    arguments: queryStep.arguments,
                    valid: queryStep.valid !== false,
                    validation_details: queryStep.validation_details,
                    is_adhoc_filter: queryStep.is_adhoc_filter
                };
                if (queryStep.is_execution_parameter) {
                    temp.is_execution_parameter = queryStep.is_execution_parameter;
                    temp.execution_parameter_id = queryStep.execution_parameter_id;
                }
                queryDefinition.query_steps.push(temp);
            }
            else if (queryStep.step_type === enumHandlers.FILTERTYPE.FOLLOWUP) {
                queryDefinition.query_steps.push({
                    step_type: queryStep.step_type,
                    followup: queryStep.followup,
                    valid: queryStep.valid !== false,
                    validation_details: queryStep.validation_details,
                    is_adhoc_filter: queryStep.is_adhoc_filter
                });
            }
        });
        return !queryDefinition.query_steps.length ? [] : [queryDefinition];
    };
    self.CollectQueryBlocks = function (source) {
        var blocks = [];
        blocks.push(self.BaseClasses());

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

        var queryStepsBlock = self.GetQueryStep(baseQuerySteps);
        if (queryStepsBlock.length) {
            blocks.push(queryStepsBlock[0]);
        }

        return blocks;
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

        jQuery.each(ko.toJS(self.TempQuerySteps()), function (index, queryStep) {
            if (queryStep.step_type === enumHandlers.FILTERTYPE.FILTER) {
                self.QuerySteps.push(new WidgetFilterModel(queryStep));
            }
            else if (queryStep.step_type === enumHandlers.FILTERTYPE.FOLLOWUP) {
                self.QuerySteps.push(new WidgetFilterModel(queryStep));
            }
        });
    };
    self.ResetAll = function () {
        self.TempQuerySteps.removeAll();

        jQuery.each(self.QuerySteps(), function (index, queryStep) {
            if (queryStep.step_type === enumHandlers.FILTERTYPE.FILTER) {
                self.TempQuerySteps.push(new WidgetFilterModel(queryStep));
            }
            else if (queryStep.step_type === enumHandlers.FILTERTYPE.FOLLOWUP) {
                self.TempQuerySteps.push(new WidgetFilterModel(queryStep));
            }
        });
    };
    self.GetFollowupQueryStep = function (followup, isTemp) {
        var querySteps = isTemp === true ? self.TempQuerySteps() : self.QuerySteps();
        return jQuery.grep(querySteps, function (queryStep) {
            return queryStep.step_type === enumHandlers.FILTERTYPE.FOLLOWUP
                && (!followup || followup && queryStep.followup === followup.id);
        });
    };
    self.GetModelAuthorization = function () {
        var autorizations = [];
        jQuery.each(userModel.Privileges.ModelPrivileges, function (k, v) {
            if (v.model === angleInfoModel.Data().model) {
                jQuery.each(v.roles, function (index, role) {
                    var checkDuplicated = jQuery.grep(autorizations, function (autorization) {
                        return autorization.toLowerCase() === role.toLowerCase();
                    });

                    if (checkDuplicated.length === 0)
                        autorizations.push(role);
                });
            }
        });
        return autorizations;
    };
    /*EOF: Model Methods*/
}
