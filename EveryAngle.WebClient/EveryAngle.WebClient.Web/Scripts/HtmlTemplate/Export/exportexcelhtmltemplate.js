var exportExcelHtmlTemplate = function () {
    return [
        '<div id="ExportOptionArea" class="popupTabPanel">',
            '<div class="row" id="NumberOfItem">',
                '<div class="field">' + Captions.Label_Angle_Export_NumberOfItems + '</div>',
                '<div class="input">',
                    '<label for="NumberOfRowsCustom" onclick="exportExcelHandler.NumberOfRowsCustomFocus()">',
                        '<input type="radio" id="NumberOfRowsCustom" name="NumberOfRows" value="custom" checked="checked" />',
                        '<span class="label"><input type="text" id="NumberOfItems" class="eaText" name="Item" onblur="exportExcelHandler.NumberOfRowsCustomBlur()" /></span>',
                    '</label>',
                    '<label for="NumberOfRowsDefault">',
                        '<input type="radio" id="NumberOfRowsDefault" name="NumberOfRows" value="allrow" />',
                        '<span class="label" data-bind="text: $data.TotalRow"></span>',
                    '</label>',
                '</div>',
            '</div>',
            '<div class="row" id="EnableSheet">',
                '<div class="field">' + Captions.Label_Angle_Export_AddSummarySheet + '</div>',
                '<div class="input">',
                    '<label for="EnableSummarySheet">',
                        '<input type="checkbox" id="EnableSummarySheet" data-bind="checked: $data.AddAngleSummary" />',
                        '<span class="label">&nbsp;</span>',
                    '</label>',
                '</div>',
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
            '<div class="row" id="HeaderFormat">',
                '<div class="field">' + Captions.Label_Angle_Export_HeaderFormat + '</div>',
                '<div class="input"><input type="text" id="HeaderFormatEnum" class="k-dropdown" /></div>',
            '</div>',
            '<div class="row" id="Filename">',
                '<div class="field">' + Captions.Label_Angle_Export_FileName + '</div>',
                '<div class="input"><input type="text" id="SaveFileName" class="eaText" data-bind="value: $data.FileName"  /></div>',
            '</div>',
            '<div class="row" id="Sheetname">',
                '<div class="field">' + Captions.Label_Angle_Export_SheetName + '</div>',
                '<div class="input"><input type="text" id="SaveSheetName" class="eaText" maxlength="31" data-bind="value: $data.SheetName" /></div>',
            '</div>',
            '<div class="row warningMessage">' + Localization.WarningExcelNotSupportedExportAsChart + '</div>',
        '</div>'
    ].join('');
};
