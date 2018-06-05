function DisplayFieldModel(model) {
    "use strict";

    var self = this;

    jQuery.extend(self, {
        field: '',
        field_details: {},
        valid: true
    }, ko.toJS(model));

    if (typeof self.field_details === 'string' || typeof self.field_details === 'undefined') {
        self.field_details = WC.Utility.ParseJSON(self.field_details);
    }

    if (!self.field) {
        self.valid = false;
        self.validation_details = {
            template: Localization.Error_FieldPropertyMissing,
            warning_type: validationHandler.WARNINGTYPE.CUSTOM
        };
    }
}
