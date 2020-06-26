*** Variables ***
${linksNameExportDefaults}           //span[text()='Export defaults']/following::li[contains(@id, 'ExportDefault')]/descendant::span[@class='sideMenuLabel']
${linkNameExportDefaultsCSV}        //span[text()='Export defaults']/following::li[contains(@id, 'ExportCsv')]/descendant::span[@class='sideMenuLabel']
${linkNameExportDefaultsExcel}      //span[text()='Export defaults']/following::li[contains(@id, 'ExportExcel')]/descendant::span[@class='sideMenuLabel']
${expectedElementLink1}              //a[contains(@data-parameters, '
${expectedElementLink2}              ')]
${btnSave}                           //a[text()='Save']

*** Keywords ***
Count of Export Defaults Link
    ${count}        Get Element Count        ${linksNameExportDefaults}
    Should Be True  ${count} == 2

Names of Export Defaults Link
    [Arguments]     ${expectedExportDefaultCSVName}   ${expectedExportDefaultExcelName}
    ${actualExportDefaultCSVName}      Get Text    ${linkNameExportDefaultsCSV}
    Should Be Equal As Strings      ${actualExportDefaultCSVName}    ${expectedExportDefaultCSVName}
    ${actualExportDefaultExcelName}      Get Text    ${linkNameExportDefaultsExcel}
    Should Be Equal As Strings      ${actualExportDefaultExcelName}    ${expectedExportDefaultExcelName}

Wait Export Defaults Page Ready
    [Arguments]     ${datastorePlugin}     ${expectedElementName1}  ${expectedElementName2}
    Click Link  ${expectedElementLink1}${datastorePlugin}${expectedElementLink2}
    Wait Until Page Contains    ${expectedElementName1}
    Wait Until Page Contains    ${expectedElementName2}
    Wait Until Page Contains Element     ${btnSave}
    Wait MC Progress Bar Closed
