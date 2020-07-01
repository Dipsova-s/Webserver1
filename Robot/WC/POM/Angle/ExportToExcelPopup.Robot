*** Variables ***
${rdbNumberOfRows}                  NumberOfRows
${txtNumberOfItems}                 css=#NumberOfItems
${chkAddSummarySheet}               css=#EnableSummarySheet
${chkAddDefinitionSheet}            css=#EnableDefinitionSheet
${txtFileName}                      css=#SaveFileName
${txtSheetName}                     css=#SaveSheetName
${btnCancelExportToExcel}           btn-popupExportExcel0
${btnOKExportToExcel}               btn-popupExportExcel1
${btnOKExportDrilldownToExcel}      btn-popupExportDrilldownExcel1
${pgbExportToExcel}                 css=#popupExportToExcel .k-loading-mask
${textDefaultHeaderFormat}          xpath=//div[text()='Header format']/following::div/descendant::span[@class='k-input']

*** Keywords ***
Input Excel File Name
    [Arguments]    ${name}
    Input Text    ${txtFileName}    ${name}

Get Excel File Name
    ${fileName}    Get Value    ${txtFileName}
    [Return]  ${fileName}

Input Excel File Name Should Be
    [Arguments]    ${name}
    ${fileName}  Get Excel File Name
    Should Be Equal    ${fileName}    ${name}

Get Excel Sheet Name
    ${sheetName}    Get Value    ${txtSheetName}
    [Return]  ${sheetName}

Input Excel Sheet Name Should Be
    [Arguments]    ${name}
    ${fileName}  Get Excel Sheet Name
    Should Be Equal    ${fileName}    ${name}

Input Excel Sheet Name
    [Arguments]    ${name}
    Input Text    ${txtSheetName}    ${name}

Input Number Rows To Export
    [Arguments]    ${numberOfRows}
    Input Text    ${NumberOfRowsCustom}    ${numberOfRows}

Click Select Custom Rows To Export
    Select Radio Button    ${rdbNumberOfRows}    custom

Click Select All Rows To Export
    Select Radio Button    ${rdbNumberOfRows}    allrow

Click Check Add Summary Sheet
    Select Checkbox    ${chkAddSummarySheet}

Click Un-Check Add Summary Sheet
    Unselect Checkbox    ${chkAddSummarySheet}

Click Check Add Definition Sheet
    Select Checkbox    ${chkAddDefinitionSheet}

Click Un-Check Add Definition Sheet
    Unselect Checkbox    ${chkAddDefinitionSheet}

Click Export Excel Button
    Click Element    ${btnOKExportToExcel}
    Wait Progress Bar Closed

Click Export Drilldown To Excel Button
    Click Element    ${btnOKExportDrilldownToExcel}
    Wait Progress Bar Closed

Click Cancel Excel Button
    Click Element    ${btnCancelExportToExcel}

Wait Until Export To Excel Popup Loaded
    Wait Until Page Contains Element    ${btnOKExportToExcel}
    Wait Until Element Is Visible    ${btnOKExportToExcel}
    Wait Until Page Does Not Contain Element    ${pgbExportToExcel}

Wait Until Export Drilldown To Excel Popup Loaded
    Wait Until Page Contains Element    ${btnOKExportDrilldownToExcel}
    Wait Until Element Is Visible    ${btnOKExportDrilldownToExcel}

Wait Until Export Excel Popup Close
    Check And Wait Until Element Is Not Visible    ${btnOKExportDrilldownToExcel}

Check For The Selected Excel Template And The Existence Of Definitions Sheet In Excel File
    [Arguments]     ${excelFile}
    Open Excel Document    ${excelFile}    doc1
    ${sheets}=	Get List Sheet Names	
    List Should Contain Value	${sheets}	Definitions
    ${cellData}     Read Excel Cell   5  10  Summary
    Should Be Equal As Strings   ${cellData}     None
    Close All Excel Documents

Checkboxes Should Not Be Selected By Default
    [Arguments]     ${angleSummary}     ${angleDefinition}
    Run Keyword If    '${angleSummary}' == 'check'     Checkbox should be selected  ${chkAddSummarySheet}
    Run Keyword If    '${angleSummary}' == 'uncheck'     Checkbox should not be selected  ${chkAddSummarySheet}
    Run Keyword If    '${angleDefinition}' == 'check'     Checkbox should be selected  ${chkAddDefinitionSheet}
    Run Keyword If    '${angleDefinition}' == 'uncheck'     Checkbox should not be selected  ${chkAddDefinitionSheet}

Check For Default Selection For Header Format
    [Arguments]     ${expectedDefaultHeaderFormat}
    ${actualDefaultHeaderFormat}     Get Text  ${textDefaultHeaderFormat}
    Should Be Equal As Strings      ${actualDefaultHeaderFormat}     ${expectedDefaultHeaderFormat}

Check Default Excel Datastore values in Export to Excel
    Checkboxes Should Not Be Selected By Default   uncheck     uncheck
    Check For Default Selection For Header Format   ID
    Input Excel File Name Should Be     {modeltimestamp}{anglename:normalized}
    Input Excel Sheet Name Should Be    {displayname:normalized}