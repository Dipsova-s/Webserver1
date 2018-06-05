/* M4-11519: Implemented export to csv */
function ExportModel(option) {
    "use strict";

    var self = this;
    //BOF: Properties
    jQuery.extend(self, option);
    self.FileName = ko.observable(self.FileName);
    //EOF: Properties
};

ExportModel.prototype.FieldMetaDataUri = '';
ExportModel.prototype.DatarowUri = '';
ExportModel.prototype.MaxPageSize = 0;
ExportModel.prototype.ExportRow = 0;
ExportModel.prototype.DisplayUri = '';
ExportModel.prototype.UserSettingUri = '';
ExportModel.prototype.ModelDataTimeStamp = 0;
ExportModel.prototype.FileName = ko.observable('');
ExportModel.prototype.ProgressId = '';
ExportModel.prototype.DataFieldUri = '';
ExportModel.prototype.CurrentFields = '';
ExportModel.prototype.DisplayType = '';
/* M4-11519: Implemented export to csv */
