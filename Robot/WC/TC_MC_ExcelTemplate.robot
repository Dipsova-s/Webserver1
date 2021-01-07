*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Initialize Download Path And Login MC With Admin User
Test Setup          Go To ExcelTemplates Page
Suite Teardown      Close Browser
Test Teardown       Empty Download Directory
Force Tags          acc_mc_s

*** Variables ***
${fileExcelTemplate}                ${EXECDIR}/resources/RobotEaExcelTemplate.xlsx
${excelTemplateName}                RobotEaExcelTemplate.xlsx
${defaultExcelTemplateName}         EveryAngle-Standard.xlsx


*** Test Cases ***
Verify If User Can Upload, Download and Delete excel template
    [Documentation]     Verify the user is able to upload, download and delete excel template in excel template page.
    [Tags]    TC_C229336
    Verify Upload Excel Template In Excel Template Page      ${fileExcelTemplate}    ${excelTemplateName}  
    Verify Download Excel Template In Excel Template Page    ${excelTemplateName}
    Verify Delete Excel Template In Excel Template Page      ${excelTemplateName}


Check For User Should Not Be Able To Delete Default Excel Template
    [Documentation]     Verify If Delete button disabled for default excel template and User cannot delete.
    [Tags]    TC_C229336
    Verify If Delete Button Disabled For Default Excel Template     ${defaultExcelTemplateName}