var exportDrilldownExcelHtmlTemplate = function () {
    return [
        '<div id="ExportOptionArea" class="popupTabPanel">',
            '<div class="row" id="Filename">',
                '<div class="field">' + Captions.Label_Angle_Export_FileName + '</div>',
                '<div class="input"><input type="text" id="SaveFileName" class="eaText" maxlength="255" /></div>',
            '</div>',
            '<div class="row" id="Sheetname">',
                '<div class="field">' + Captions.Label_Angle_Export_SheetName + '</div>',
                '<div class="input"><input type="text" id="SaveSheetName" class="eaText" maxlength="31" /></div>',
            '</div>',
            '<div class="row" id="EnableDefinition">  ',
                '<div class="field">' + Captions.Label_Angle_Export_AddDefinitionSheet + '</div>',
                '<div class="input">',
                    '<label for="EnableDefinitionSheet">',
                        '<input type="checkbox" id="EnableDefinitionSheet" />',
                        '<span class="label">&nbsp;</span>',
                    '</label>',
                '</div>',
            '</div>',
        '</div>'
    ].join('');
};
