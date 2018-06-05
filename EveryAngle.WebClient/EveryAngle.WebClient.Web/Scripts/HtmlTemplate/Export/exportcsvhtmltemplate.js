var exportCSVHtmlTemplate = function () {
    return [
        '<div id="export-csv-area" class="ExportOptionArea">',
            '<div class="row" id="file-name">',
                '<div class="field">' + Captions.SaveAsCSV_FileName + '</div>',
                '<div class="input">',
                    '<input type="text" id="file-name-text" class="eaText" data-bind="value: $data.FileName" />',
                '</div>',
            '</div>',
            '<fieldset>',
                '<legend>' + Captions.Label_CSV_Export_SectionFileOptions + '</legend>',
                '<div class="row" id="header-format">',
                    '<div class="field">' + Captions.Label_CSV_Export_HeaderRows + '</div>',
                    '<div class="input">',
                        '<div id="header-format-dropdownlist" class="eaDropdown"></div>',
                    '</div>',
                '</div>',
                '<div class="row" id="enquote-header">',
                    '<div class="field">' + Captions.Label_CSV_Export_EnquoteHeaders + '</div>',
                    '<div class="input">',
                        '<label>',
                        '<input type="radio" id="enquote-header-yes" name="EnquoteHeader" value="true" data-bind="checked: $data.EnquoteHeader.ForEditing" />',
                        '<span class="label">' + Localization.Yes + '</span>',
                        '</label>',
                        '<label>',
                        '<input type="radio" id="enquote-header-no" name="EnquoteHeader" value="false" data-bind="checked: $data.EnquoteHeader.ForEditing"/>',
                        '<span class="label">' + Localization.No + '</span>',
                        '</label>',
                    '</div>',
                '</div>',
                '<div class="row" id="enquote">',
                    '<div class="field">' + Captions.Label_CSV_Export_Enquote + '</div>',
                    '<div class="input">',
                        '<div id="enquote-dropdownlist" class="eaDropdown"></div>',
                    '</div>',
                '</div>',
                '<div class="row" id="enquote-character">',
                    '<div class="field">' + Captions.Label_CSV_Export_EnquoteCharacter + '</div>',
                    '<div class="input">',
                        '<input type="text" id="enquote-character-text" class="eaText" maxlength="1" data-bind="value: $data.EnquoteCharacter" placeholder="Double quote is default value" />',
                    '</div>',
                '</div>',
                '<div class="row" id="field-separator">',
                    '<div class="field">' + Captions.Label_CSV_Export_FieldSeparator + '</div>',
                    '<div class="input">',
                        '<input type="text" id="field-separator-text" class="eaText" maxlength="2" data-bind="value: $data.FieldSeparator" placeholder="\\t mean tab separator" />',
                    '</div>',
                '</div>',
                '<div class="row" id="line-separator">',
                    '<div class="field">' + Captions.Label_CSV_Export_LineSeparator + '</div>',
                    '<div class="input">',
                        '<div id="line-separator-dropdownlist" class="eaDropdown"></div>',
                    '</div>',
                '</div>',
            '</fieldset>',
            '<fieldset>',
                '<legend>' + Captions.Label_CSV_Export_SectionFormatOptions + '</legend>',
                '<div class="row" id="date-separator">',
                    '<div class="field">' + Captions.Label_CSV_Export_DateSeparator + '</div>',
                    '<div class="input">',
                        '<input type="text" id="date-separator-text" class="eaText" maxlength="1" data-bind="value: $data.DateSeparator" placeholder="\/ is default value" />',
                    '</div>',
                '</div>',
                '<div class="row" id="date-format">',
                    '<div class="field">' + Captions.Label_CSV_Export_DateFormat + '</div>',
                    '<div class="input">',
                         '<div id="date-format-dropdownlist" class="eaDropdown"></div>',
                    '</div>',
                '</div>',
                '<div class="row" id="time-separator">',
                    '<div class="field">' + Captions.Label_CSV_Export_TimeSeparator + '</div>',
                    '<div class="input">',
                        '<input type="text" id="time-separator-text" class="eaText" maxlength="1" data-bind="value: $data.TimeSeparator" placeholder=": is default value" />',
                    '</div>',
                '</div>',
                '<div class="row" id="time-format">',
                    '<div class="field">' + Captions.Label_CSV_Export_TimeFormat + '</div>',
                    '<div class="input">',
                         '<div id="time-format-dropdownlist" class="eaDropdown"></div>',
                    '</div>',
                '</div>',
                 '<div class="row" id="decimal-separator">',
                    '<div class="field">' + Captions.Label_CSV_Export_DecimalSeparator + '</div>',
                    '<div class="input">',
                        '<input type="text" id="decimal-separator-text" class="eaText" maxlength="1" data-bind="value: $data.DecimalSeparator" placeholder=". is default value" />',
                    '</div>',
                '</div>',
                '<div class="row" id="decimal">',
                    '<div class="field">' + Captions.Label_CSV_Export_Decimal + '</div>',
                    '<div class="input">',
                        '<input id="decimal-format-text" type="text" class="eaNumeric" />',
                    '</div>',
                '</div>',
                '<div class="row" id="bool-character">',
                    '<div class="field">' + Captions.Label_CSV_Export_BoolChars + '</div>',
                    '<div class="input">',
                        '<input type="text" id="true-character-text" class="eaText" data-bind="value: $data.TrueChar, attr: { placeholder: Captions.SaveAsCSV_BoolChars_True, title: Captions.SaveAsCSV_BoolChars_True }" />',
                        '<input type="text" id="false-character-text" class="eaText" data-bind="value: $data.FalseChar, attr: { placeholder: Captions.SaveAsCSV_BoolChars_False, title: Captions.SaveAsCSV_BoolChars_False }" />',
                    '</div>',
                '</div>',
                '<div class="row" id="enum-format">',
                    '<div class="field">' + Captions.Label_CSV_Export_EnumFormat + '</div>',
                    '<div class="input">',
                        '<div id="enum-format-dropdownlist" class="eaDropdown"></div>',
                    '</div>',
                '</div>',
                '<div class="row" id="add-model-date">',
                    '<div class="field">' + Captions.Label_CSV_Export_AddModelDate + '</div>',
                    '<div class="input">',
                        '<input id="add-model-date-at-column" type="text" class="eaNumeric" />', /* M4-13475: Changed model timestamp GUI from bool to int */
                    '</div>',
                '</div>',
            '</fieldset>',
    '</div>'
    ].join('');
}
