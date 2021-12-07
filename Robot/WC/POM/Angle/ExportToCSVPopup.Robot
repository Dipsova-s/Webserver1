*** Variables ***
${pgbExportToCSV}             css=#popupExportToCSV .k-loading-mask
${txtCSVFileName}                css=#file-name-text
${txtHeaderRows}                xpath=//div[@id='header-format']/descendant::span[@class='k-input']
${txtUseTextQualifier}             xpath=//div[@id='enquote']/descendant::span[@class='k-input']
${valueFieldDelimiter}              xpath=//div[@id='field-separator']/descendant::input[contains(@id,'field-separator')]
${radioUseTextQualifierOnHeaders1}   xpath=//div[@id='enquote-header']/descendant::input[contains(@id, 'yes')]
${radioUseTextQualifierOnHeaders2}   xpath=//div[@id='enquote-header']/descendant::input[contains(@id, 'no')]
${valueTextQualifier}               xpath=//div[@id='enquote-character']/descendant::input[contains(@id,'enquote-character')]
${valueLineDelimiter}               xpath=//div[@id='line-separator']/descendant::span[@class='k-input']
${valueDateSeparator}               xpath=//div[@id='date-separator']/descendant::input[contains(@id, 'date-separator')]
${valueTimeSeparator}               xpath=//div[@id='time-separator']/descendant::input[contains(@id, 'time-separator')]
${valueDecimalSeparator}            xpath=//div[@id='decimal-separator']/descendant::input[contains(@id, 'decimal-separator')]
${valueYesCharacter}                xpath=//div[@id='bool-character']/descendant::input[contains(@id, 'true')]
${valueNoCharacter}                 xpath=//div[@id='bool-character']/descendant::input[contains(@id, 'false')]
${txtDateFormat}                    xpath=//div[@id='date-format']/descendant::span[@class='k-input']
${txtTimeFormat}                    xpath=//div[@id='time-format']/descendant::span[@class='k-input']
${valueDecimals}                      xpath=//div[@id='decimal']/descendant::input[contains(@class, 'formatted')]
${txtSetFormat}                     xpath=//div[@id='enum-format']/descendant::span[@class='k-input']
${valueInsertModelDate}               xpath=//div[@id='add-model-date']/descendant::input[contains(@id, 'model-date')]

${btnOKExportToCSV}               btn-popupExportToCSV1
${btnOKExportDrilldownToCSV}      btn-popupExportDrilldownCSV1

*** Keywords ***
Wait Until Export To CSV Popup Loaded
    Sleep  ${TIMEOUT_GENERAL}
    Wait Until Page Does Not Contain Element    ${pgbExportToCSV}
    Wait Until Page Contains Element    ${btnOKExportToCSV}
    Wait Until Element Is Visible    ${btnOKExportToCSV}
    Wait Until Ajax Complete

Get CSV File Name
    ${fileName}    Get Value    ${txtCSVFileName}
    [Return]  ${fileName}

Input CSV File Name Should Be
    [Arguments]    ${name}
    ${fileName}  Get CSV File Name
    Should Be Equal    ${fileName}    ${name}

Input Header Rows Should Be
    [Arguments]     ${expectedHeaderRows}
    ${actualHeaderRows}    Get Text    ${txtHeaderRows}
    Should Be Equal As Strings  ${actualHeaderRows}    ${expectedHeaderRows}

Input Use Text Qualifier Should Be
    [Arguments]     ${expectedUseTextQualifier}
    ${actualUseTextQualifier}    Get Text    ${txtUseTextQualifier}
    Should Be Equal As Strings  ${actualUseTextQualifier}    ${expectedUseTextQualifier}

Input Field Delimiter Should Be
    [Arguments]     ${expectedFieldDelimiter}
    ${actualFieldDelimiter}    Get Value    ${valueFieldDelimiter}
    Should Be Equal As Strings  ${actualFieldDelimiter}    ${expectedFieldDelimiter}

Radio Button Yes for Use Text Qualifier on Headers Should Be
    [Arguments]     ${expectedUseTextQualifierHeaders1}
    ${actualUseTextQualifierHeaders1}    Get Value    ${radioUseTextQualifierOnHeaders1}
    Should Be Equal As Strings  ${actualUseTextQualifierHeaders1}    ${expectedUseTextQualifierHeaders1}

Radio Button No for Use Text Qualifier on Headers Should Be
    [Arguments]     ${expectedUseTextQualifierHeaders2}
    ${actualUseTextQualifierHeaders2}    Get Value    ${radioUseTextQualifierOnHeaders2}
    Should Be Equal As Strings  ${actualUseTextQualifierHeaders2}    ${expectedUseTextQualifierHeaders2}

Input Text Qualifier Should Be
    [Arguments]     ${expectedTextQualifier}
    ${actualTextQualifier}    Get Value    ${valueTextQualifier}
    Should Be Equal As Strings  ${actualTextQualifier}    ${expectedTextQualifier}

Input Line Delimiter Should Be
    [Arguments]     ${expectedLineDelimiter}
    ${actualLineDelimiter}    Get Text    ${valueLineDelimiter}
    Should Be Equal As Strings  ${actualLineDelimiter}    ${expectedLineDelimiter}

Input Date Separator Should Be
    [Arguments]     ${expectedDateSeparator}
    ${actualDateSeparator}    Get Value    ${valueDateSeparator}
    Should Be Equal As Strings  ${actualDateSeparator}    ${expectedDateSeparator}

Input Time Separator Should Be
    [Arguments]     ${expectedTimeSeparator}
    ${actualTimeSeparator}    Get Value    ${valueTimeSeparator}
    Should Be Equal As Strings  ${actualTimeSeparator}    ${expectedTimeSeparator}

Input Decimal Separator Should Be
    [Arguments]     ${expectedDecimalSeparator}
    ${actualDecimalSeparator}    Get Value    ${valueDecimalSeparator}
    Should Be Equal As Strings  ${actualDecimalSeparator}    ${expectedDecimalSeparator}

Input Yes Character Should Be
    [Arguments]     ${expectedYesCharacter}
    ${actualYesCharacter}    Get Value    ${valueYesCharacter}
    Should Be Equal As Strings  ${actualYesCharacter}    ${expectedYesCharacter}

Input No Character Should Be
    [Arguments]     ${expectedNoCharacter}
    ${actualNoCharacter}    Get Value    ${valueNoCharacter}
    Should Be Equal As Strings  ${actualNoCharacter}    ${expectedNoCharacter}

Input Date Format Should Be
    [Arguments]     ${expectedDateFormat}
    ${actualDateFormat}    Get Text    ${txtDateFormat}
    Should Be Equal As Strings  ${actualDateFormat}    ${expectedDateFormat}

Input Time Format Should Be
    [Arguments]     ${expectedTimeFormat}
    ${actualTimeFormat}    Get Text    ${txtTimeFormat}
    Should Be Equal As Strings  ${actualTimeFormat}    ${expectedTimeFormat}

Input Decimals Should Be
    [Arguments]     ${expectedDecimals}
    ${actualDecimals}    Get Element Attribute    ${valueDecimals}  placeholder
    Should Be Equal As Strings  ${actualDecimals}    ${expectedDecimals}

Input Set Format Should Be
    [Arguments]     ${expectedSetFormat}
    ${actualSetFormat}    Get Text    ${txtSetFormat}
    Should Be Equal As Strings  ${actualSetFormat}    ${expectedSetFormat}

Input Insert Model Date Should Be
    [Arguments]     ${expectedInsertModelDate}
    ${actualInsertModelDate}    Get Value    ${valueInsertModelDate}
    Should Be Equal As Strings  ${actualInsertModelDate}    ${expectedInsertModelDate}

Input File Options Should Be
    [Arguments]     ${headerRows}   ${useTextQualifier}     ${fieldDelimiter}     ${useTextQualifierHeader1}    ${useTextQualifierHeader2}   ${textQualifier}    ${lineDelimiter}
    Input Header Rows Should Be     ${headerRows}
    Input Use Text Qualifier Should Be      ${useTextQualifier}
    Input Field Delimiter Should Be     ${fieldDelimiter}    
    Radio Button Yes for Use Text Qualifier on Headers Should Be    ${useTextQualifierHeader1}
    Radio Button No for Use Text Qualifier on Headers Should Be     ${useTextQualifierHeader2}
    Input Text Qualifier Should Be  ${textQualifier}
    Input Line Delimiter Should Be  ${lineDelimiter}

Input Format Options Should Be
    [Arguments]     ${dateSeparator}    ${timeSeparator}    ${decimalSeparator}     ${yesCharacter}     ${noCharacter}   ${dateFormat}   ${timeFormat}  ${decimals}   ${setFormat}    ${insertModelDate}
    Input Date Separator Should Be          ${dateSeparator}
    Input Time Separator Should Be          ${timeSeparator}
    Input Decimal Separator Should Be       ${decimalSeparator}
    Input Yes Character Should Be           ${yesCharacter}
    Input No Character Should Be            ${noCharacter}
    Input Date Format Should Be             ${dateFormat}
    Input Time Format Should Be             ${timeFormat}
    Input Decimals Should Be                ${decimals}
    Input Set Format Should Be              ${setFormat}
    Input Insert Model Date Should Be       ${insertModelDate}

Check Default CSV Datastore values in Export to CSV
    Input CSV File Name Should Be     ANGLE_Pivot_fields_contain_special_characters 
    Input File Options Should Be    ID in header    only strings    ;   true    false   "   CRLF
    Input Format Options Should Be  /   :   .   true    false   yyyy\/MM\/dd    HH\:mm\:ss  All decimals  ID  2

Click Export CSV Button
    Click Element    ${btnOKExportToCSV}
    Wait Progress Bar Closed

Wait Until Export CSV Popup Close
    Check And Wait Until Element Is Not Visible    ${btnOKExportDrilldownToCSV}

Get Formatted Date Time Stamp
    [Arguments]     ${unixModelDateTimeStamp}   ${expectedFormat}
    ${formattedmodelDateTimeStamp}  Evaluate  datetime.datetime.utcfromtimestamp(${unixModelDateTimeStamp}).strftime('${expectedFormat}')  modules=datetime
    [Return]    ${formattedmodelDateTimeStamp}