*** Settings ***
Resource            ${EXECDIR}/WC/POM/ManagementConsole/AngleExports/ExcelTemplates.robot


*** Keywords ***
Go To ExcelTemplates Page
    Go To MC Page    /Angle%20exports/Excel%20templates/
    Wait For ExcelTemplates Page Ready

Verify Upload Excel Template In Excel Template Page
    [Arguments]     ${fileExcelTemplate}     ${excelFileName}
    Click Upload Excel Template      ${fileExcelTemplate}
    Wait For ExcelTemplates Page Ready
    Wait Until Page Contains Element      ${trRowInExcelTemplateGrid}:contains("${excelFileName}")
    Page Should Contain Element       ${trRowInExcelTemplateGrid}:contains("${excelFileName}")

Verify Download Excel Template In Excel Template Page
    [Arguments]     ${excelFileName}
    Click Show Action Dropdown In Grid By Name      ${excelFileName}     ${trRowInExcelTemplateGrid}
    Wait Until Ajax Complete
    Click Download Excel Template       ${excelFileName}
    ${files}    Wait Until Keyword Succeeds    1 min    2 sec    Download Should Be Done  1
    Download Should Contain File    ${excelFileName}

Verify Delete Excel Template In Excel Template Page
    [Arguments]     ${excelFileName}
    Click Show Action Dropdown In Grid By Name      ${excelFileName}     ${trRowInExcelTemplateGrid}
    Wait Until Ajax Complete
    Click Delete Excel Template       ${excelFileName}
    Page Should Not Contain       ${excelFileName}

Verify If Delete Button Disabled For Default Excel Template
    [Arguments]     ${DefaultExcelFileName}
    Click Show Action Dropdown In Grid By Name      ${DefaultExcelFileName}     ${trRowInExcelTemplateGrid}
    Page Should Contain Element	       //tr[@id='row-${DefaultExcelFileName}']/td[5]/div/div/a[contains(@class,'btn btnDelete disabled')]

Get Count Excel Templates
    ${excelTemplatesCount}     Count of Excel Templates
    [Return]    ${excelTemplatesCount}

Get List Excel Templates
    ${excelTemplatesList}     List of Excel Templates
    [Return]    ${excelTemplatesList}
    


