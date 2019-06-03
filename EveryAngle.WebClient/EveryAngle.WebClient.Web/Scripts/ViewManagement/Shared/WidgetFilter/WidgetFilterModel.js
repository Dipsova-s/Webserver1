function WidgetFilterModel(model, isCheckValidate) {
    "use strict";

    var self = this;

    jQuery.extend(self, new QueryStepModel(model, isCheckValidate));

    if (self.step_type === enumHandlers.FILTERTYPE.FILTER) {
        self.is_execution_parameter = ko.observable(!!self.is_execution_parameter);
        self.execution_parameter_id = WC.Utility.ToString(self.execution_parameter_id);
    }
    else if (self.step_type === enumHandlers.FILTERTYPE.FOLLOWUP) {
        self.is_execution_parameter = ko.observable(false);
        self.execution_parameter_id = '';
    }
}
