function ExportExcelModel(option) {
    "use strict";

    var self = this;
    ExportModel.call(self, option);
    self.HeaderFormats = [
        { VALUE: 'id', TEXT: Localization.ExportCSVEnumFormatId },
        { VALUE: 'display', TEXT: Localization.ListFormatEnumShortName },
        { VALUE: 'longname', TEXT: Localization.ListFormatEnumLongName }
    ];
    self.ExcelTemplates = [];
    self.TotalRow = ko.observable();
    self.HeaderFormat = ko.observable();
    self.SheetName = ko.observable('');
    self.TemplateFile = ko.observable('');
    self.AddAngleSummary = ko.observable();
    self.AddAngleDefinition = ko.observable();
    self.MaxRowsToExport = ko.observable(-1);
    self.ModelTimestampIndex = ko.observable();
    self.TechnicalInfo = ko.observable();
};
ExportExcelModel.prototype = new ExportModel();
ExportExcelModel.prototype.constructor = ExportExcelModel;