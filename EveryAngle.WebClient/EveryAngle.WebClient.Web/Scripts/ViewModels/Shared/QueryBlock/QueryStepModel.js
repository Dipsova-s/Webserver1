function QueryStepModel(model, isCheckValidate) {
    "use strict";

    var self = this;
    var defaultModelName;

    model = ko.toJS(model || {});
    jQuery.extend(self, model);

    // default value handling
    if (self.step_type === enumHandlers.FILTERTYPE.FILTER) {
        defaultModelName = enumHandlers.VIEWMODELNAME.FILTERSTEP;
    }
    else if (self.step_type === enumHandlers.FILTERTYPE.FOLLOWUP) {
        defaultModelName = enumHandlers.VIEWMODELNAME.FOLLOWUPSTEP;
    }
    else if (self.step_type === enumHandlers.FILTERTYPE.SORTING) {
        defaultModelName = enumHandlers.VIEWMODELNAME.SORTINGSTEP;
    }
    else if (self.step_type === enumHandlers.FILTERTYPE.AGGREGATION) {
        defaultModelName = enumHandlers.VIEWMODELNAME.AGGREGATIONSTEP;
    }
    defaultValueHandler.CheckAndExtendProperties(self, defaultModelName);
    
    if (self.step_type === enumHandlers.FILTERTYPE.AGGREGATION
        && self.step_type.grouping_fields && !self.step_type.grouping_fields.length) {
        delete self.step_type.grouping_fields;
    }
    else if (self.step_type === enumHandlers.FILTERTYPE.FILTER) {
        self.arguments = WC.Utility.ToArray(self.arguments);

        if (typeof self.valid === 'undefined')
            self.valid = true;
        if (self.valid !== false && isCheckValidate !== false) {
            if (self.operator !== enumHandlers.OPERATOR.HASVALUE.Value && self.operator !== enumHandlers.OPERATOR.HASNOVALUE.Value
                && !self.arguments.length
                && !self.is_execution_parameter) {
                self.valid = false;
                self.validation_details = {
                    field: self.field,
                    template: Localization.Error_FieldNoArgument,
                    warning_type: validationHandler.WARNINGTYPE.FIELD
                };
            }
            else if (self.operator === enumHandlers.OPERATOR.BETWEEN.Value || self.operator === enumHandlers.OPERATOR.NOTBETWEEN.Value
                || self.operator === enumHandlers.OPERATOR.RELATIVEBETWEEN.Value || self.operator === enumHandlers.OPERATOR.NOTRELATIVEBETWEEN.Value) {
                var argsCount = self.arguments.length;
                if ((self.is_execution_parameter && !(argsCount === 0 || argsCount === 2))
                    || (!self.is_execution_parameter && argsCount !== 2)) {
                    self.valid = false;
                    self.validation_details = {
                        field: self.field,
                        template: Localization.Error_FieldContainsInvalidArguments,
                        warning_type: validationHandler.WARNINGTYPE.FIELD
                    };
                }
            }
        }
    }
    else if (self.step_type === enumHandlers.FILTERTYPE.FOLLOWUP) {
        if (typeof self.valid === 'undefined')
            self.valid = true;
    }
}
