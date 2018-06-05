function BucketModel() {
    "use strict";
    //BOF: View model properties
    var self = this;

    // Properties
    self.field_type = 'int';
    self.Operator = enumHandlers.AGGREGATION.COUNT.Value;
    self.source_field = 'objecttypeea';
    self.field = enumHandlers.AGGREGATION.COUNT.Value;
    //EOF: View modle methods
}
