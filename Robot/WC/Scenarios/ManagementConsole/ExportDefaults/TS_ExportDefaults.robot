*** Settings ***
Resource        ${EXECDIR}/WC/POM/ManagementConsole/AutomationTasks/ExportDefaults/AllExportDefaults.robot

*** Keywords ***
Go To Export Defaults Link With Admin User
    Go to MC Then Login With Admin User
    Go To Export Defaults Link

Go To Export Defaults Link
    Go To MC Page    /Angle%20exports/Export%20defaults/

Check Count And Names of Export Defaults Link
    [Arguments]     ${expectedExportCSVDefaultName}      ${expectedExportExcelDefaultName}
    Count of Export Defaults Link
    Names of Export Defaults Link       ${expectedExportCSVDefaultName}      ${expectedExportExcelDefaultName}

Check Export Defaults Page
    [Arguments]     ${datastorePlugin}  ${expectedName1}    ${expectedName2}
    Wait Export Defaults Page Ready     ${datastorePlugin}  ${expectedName1}    ${expectedName2}