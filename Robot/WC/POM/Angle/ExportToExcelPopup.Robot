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
${pgbExportToExcel}                 css=.popupExportExcel .k-loading-mask
${textDefaultHeaderFormat}          xpath=//div[text()='Header format']/following::div/descendant::span[@class='k-input']
${textExcelTemplate}                //div[contains(text(), 'Excel template')]/following::div/descendant::span[@class='k-input']
${ddlExcelTemplates}                css=[aria-owns="ExcelTemplate_listbox"]
${excelTemplatesCount}              //div[contains(@class, 'k-list-container')]/descendant::ul[@id='ExcelTemplate_listbox']/li[@role='option']//span[@class='name']

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
    Sleep  ${TIMEOUT_GENERAL}
    Wait Until Page Does Not Contain Element    ${pgbExportToExcel}
    Wait Until Page Contains Element    ${btnOKExportToExcel}
    Wait Until Element Is Visible    ${btnOKExportToExcel}
    Wait Until Ajax Complete

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

Check For The Correct Execute Parameter Filter Updated in the Summary Sheet In Excel File
    [Arguments]     ${excelFile}    ${expectedAngleFilter}     ${expectedDisplayFilter}
    Open Excel Document    ${excelFile}    doc2
    ${sheets}=	Get List Sheet Names
    ${sheetName1}    Set variable    Summary	
    ${sheetName2}    Set variable    New Display
    List Should Contain Value	${sheets}	Summary
    ${actualAngleFilter}     Read Excel Cell   9  2  ${sheetName1}  
    Should Contain      ${actualAngleFilter}     ${expectedAngleFilter[0]}
    Should Contain      ${actualAngleFilter}     ${expectedAngleFilter[1]}
    ${actualDisplayFilter}     Read Excel Cell   9  6  ${sheetName1}
    Should Contain      ${actualDisplayFilter}     ${expectedDisplayFilter[0]}
    Should Contain      ${actualDisplayFilter}     ${expectedDisplayFilter[1]}
    ${colName}     Read Excel Cell   1  1  ${sheetName2}
    Should Be Equal As Strings   ${colName}     ID 
    @{colData}=      Read Excel Column   1   1   100
    :FOR  ${var}  IN  @{colData}
    \   Should Contain Any   ${var}   /1    /2
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
    Input Excel File Name Should Be     ANGLE_Pivot_fields_contain_special_characters
    Input Excel Sheet Name Should Be    New pivot display

Selected Excel Template in Export to Excel Pop up Should Be
    [Arguments]     ${expectedExcelTemplate}
    ${actualExcelTemplate}  Selected Excel Template in Export to Excel Pop up
    Should Be Equal As Strings  ${actualExcelTemplate}  ${expectedExcelTemplate}

Selected Excel Template in Export to Excel Pop up
    ${getExcelTemplate}     Get Text    ${textExcelTemplate}
    [Return]    ${getExcelTemplate}

Selected Header Format in Export to Excel Pop up should Be
    [Arguments]     ${expectedDefaultHeaderFormat}
    Select Dropdown By InnerText    css=#HeaderFormat    ${expectedDefaultHeaderFormat}

Select Excel Template in Export to Excel Pop up To
    [Arguments]     ${excelTemplateName}
    Select Dropdown By InnerText     ${ddlExcelTemplates}    ${excelTemplateName}

Get Excel Templates Count in Export to Excel Pop up
    ${countExcelTemplates}     Get Element Count   ${excelTemplatesCount}
    [Return]    ${countExcelTemplates}

Get Excel Templates List in Export to Excel Pop up
    ${count}    Get Excel Templates Count in Export to Excel Pop up
    @{excelTemplatesList}   Create List
    :FOR    ${i}    IN RANGE    1   ${count} + 1
    \    ${nameExcelTemplate}    Get Element Attribute    (${excelTemplatesCount})[${i}]    innerHTML
    \    ${condition}   Run Keyword    Condition For Checking Substring [Use default]    ${nameExcelTemplate}
    \    ${nameExcelTemplateUpdated}      Run Keyword If    '${condition}' == 'True'      Update Excel Template String     ${nameExcelTemplate}
    \    ...                              ELSE      Set Variable     ${nameExcelTemplate}
    \    Append To List      ${excelTemplatesList}   ${nameExcelTemplateUpdated}
    [Return]    ${excelTemplatesList}

Update Excel Template String
    [Arguments]     ${string}
    ${updatedString}      Replace String     ${string}  [Use default]${SPACE}   ${EMPTY}
    [Return]    ${updatedString}

Contains Substring [Use default]
    [Arguments]     ${string}
    ${expectedString}   Set Variable    \[Use default\]
    ${updatedString}    Get Substring   ${string}   0   9
    ${returnStatus}     Run Keyword And Return Status   Should Be Equal As Strings  ${updatedString}    ${expectedString}
    [Return]    ${returnStatus}

Condition For Checking Substring [Use default]
    [Arguments]     ${nameExcelTemplate}
    ${returnStatus}     Run Keyword     Contains Substring [Use default]    ${nameExcelTemplate}
    [Return]    ${returnStatus}    

Get Angle Filters
    @{expectedAngleFilterResultList}      Create List
    :FOR  ${i}  IN RANGE   0   2
    \   ${expectedAngleFilterResult}=    Get Read Only Angle Filter Name By Index    ${i}
    \   Append To List      ${expectedAngleFilterResultList}    ${expectedAngleFilterResult}
    [Return]    ${expectedAngleFilterResultList}

Get Display Filters
    @{expectedDisplayFilterResultList}      Create List
    :FOR  ${i}  IN RANGE   0   2
    \   ${expectedDisplayFilterResult}=     Get Display Filter Name By Index    ${i}
    \   Append To List      ${expectedDisplayFilterResultList}    ${expectedDisplayFilterResult}
    [Return]    ${expectedDisplayFilterResultList}