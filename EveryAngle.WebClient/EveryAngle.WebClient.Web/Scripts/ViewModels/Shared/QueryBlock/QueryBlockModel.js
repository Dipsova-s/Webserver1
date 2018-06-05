function QueryBlockModel(model) {
    "use strict";

    var self = this;

    jQuery.extend(self, {
        queryblock_type: '',
        valid: true
    }, ko.toJS(model));

    if (!self.queryblock_type) {
        self.valid = false;
        self.validation_details = {
            template: Localization.Error_QueryBlockTypePropertyMissing,
            warning_type: validationHandler.WARNINGTYPE.CUSTOM
        };
    }
    else if (self.queryblock_type === enumHandlers.QUERYBLOCKTYPE.BASE_CLASSES && !self.base_classes.length) {
        self.valid = false;
        self.validation_details = {
            template: Localization.Error_BaseClassesPropertyMissing,
            warning_type: validationHandler.WARNINGTYPE.CUSTOM
        };
    }
    else if (self.queryblock_type === enumHandlers.QUERYBLOCKTYPE.BASE_ANGLE && !self.base_angle) {
        self.valid = false;
        self.validation_details = {
            template: Localization.Error_BaseAnglePropertyMissing,
            warning_type: validationHandler.WARNINGTYPE.CUSTOM
        };
    }
    else if (self.queryblock_type === enumHandlers.QUERYBLOCKTYPE.BASE_DISPLAY && !self.base_display) {
        self.valid = false;
        self.validation_details = {
            template: Localization.Error_BaseDisplayPropertyMissing,
            warning_type: validationHandler.WARNINGTYPE.CUSTOM
        };
    }
    else if (self.queryblock_type === enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS) {
        if (!self.query_steps.length) {
            self.valid = false;
            self.validation_details = {
                template: Localization.Error_QueryStepsPropertyMissing,
                warning_type: validationHandler.WARNINGTYPE.CUSTOM
            };
        }
        else {
            jQuery.each(self.query_steps, function (index, step) {
                self.query_steps[index] = new QueryStepModel(step);
            });
        }
    }
}
