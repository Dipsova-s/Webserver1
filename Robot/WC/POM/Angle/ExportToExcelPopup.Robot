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

Wait Until Export Drilldown To Excel Popup Loaded
    Wait Until Page Contains Element    ${btnOKExportDrilldownToExcel}
    Wait Until Element Is Visible    ${btnOKExportDrilldownToExcel}

Wait Unit Export Excel Popup Close
    Check And Wait Until Element Is Not Visible    ${btnOKExportDrilldownToExcel}

Check The Existence Of Definitions Sheet In Excel File
    [Arguments]     ${excelFile}
    Open Excel Document    ${excelFile}    doc1
    ${sheets}=	Get List Sheet Names	
    List Should Contain Value	${sheets}	Definitions
    Close All Excel Documents