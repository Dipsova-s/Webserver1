*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Initialize Download Path And Login MC With Admin User
Test Setup          Go To ExcelTemplates Page
Suite Teardown      Close Browser
Force Tags          smk_mc

*** Variables ***
${fileExcelTemplate}                ${EXECDIR}/resources/RobotEaExcelTemplate.xlsx
${excelTemplateName}                RobotEaExcelTemplate.xlsx
${defaultExcelTemplateName}         EveryAngle-Standard.xlsx


*** Test Cases ***
Check For User Should Not Be Able To Delete Default Excel Template
    [Documentation]     Verify If Delete button disabled for default excel template and User cannot delete.
    [Tags]    TC_C229336
    Verify If Delete Button Disabled For Default Excel Template     ${defaultExcelTemplateName}