
function FieldModel() {
    "use strict";
    var self = this;

    // Properties
    self.Index = 0;
    self.CellFormat = '';
    self.CellFormatType = enumHandlers.DEVXPRESSFORMATTYPE.NONE;
    self.Area = 3;
    self.SourceField ='';
    self.Caption = false;
    self.DefaultCaption = false;
    self.FieldName = '';
    self.Operator = enumHandlers.AGGREGATION.COUNT.Value;
    self.CssClass = false;
    self.InternalID = '';
    self.DataType = '';
    self.IsDomain = false;
    self.DomainURI = '';
    self.MayBeSorted = true;
    self.SortDirection = '';
    self.FieldDetails = null;
    self.MultiLangAlias = [];
    self.IsSelected = true;
    self.Valid = true;
    self.ValidError = '';
}
