(function (handler) {
    "use strict";

    handler.IsSorintg = function (queryStep) {
        return queryStep && queryStep.step_type === enumHandlers.FILTERTYPE.SORTING;
    };
    handler.GetSorting = function () {
        var self = this;
        return self.GetQueryStepsByTypes([enumHandlers.FILTERTYPE.SORTING])[0] || null;
    };
    handler.RemoveSorting = function () {
        var self = this;
        self.Data.remove(function (step) {
            return self.IsSorintg(step);
        });
    };
    handler.SetSorting = function (data) {
        var self = this;
        self.RemoveSorting();
        var queryStep = jQuery.extend({
            is_adhoc: true,
            is_applied: true
        }, ko.toJS(data));
        self.Data.push(new QueryStepViewModel(queryStep, self.ModelUri));
    };
}(QueryDefinitionHandler.prototype));