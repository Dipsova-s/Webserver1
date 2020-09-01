var exportDrilldownExcelHtmlTemplate = function () {
    return [
        '<div id="ExportOptionArea" class="popupTabPanel">',
            '<div class="row" id="Filename">',
                '<div class="field">' + Captions.Label_Angle_Export_FileName + '</div>',
                '<div class="input"><input type="text" id="SaveFileName" class="eaText" maxlength="255" data-bind="value: $data.FileName"/></div>',
            '</div>',
            '<div class="row excel-templates" id="ExcelTemplates">',
                '<div class="field">' + Captions.ExcelTemplate + '</div>',
                '<div class="input"><input type="text" id="ExcelTemplate" class="k-dropdown" /></div>',
            '</div>',
            '<div class="row template-warning-message" id="template-warning-message-popup"></div>',
            '<div class="row" id="Sheetname">',
                '<div class="field">' + Captions.Label_Angle_Export_SheetName + '</div>',
                '<div class="input"><input type="text" id="SaveSheetName" class="eaText" maxlength="31" data-bind="value: $data.SheetName" /></div>',
            '</div>',
            '<div class="row" id="EnableDefinition">  ',
                '<div class="field">' + Captions.Label_Angle_Export_AddDefinitionSheet + '</div>',
                '<div class="input">',
                    '<label for="EnableDefinitionSheet">',
                        '<input type="checkbox" id="EnableDefinitionSheet" data-bind="checked: $data.AddAngleDefinition" />',
                        '<span class="label">&nbsp;</span>',
                    '</label>',
                '</div>',
            '</div>',
        '</div>'
    ].join('');
};
