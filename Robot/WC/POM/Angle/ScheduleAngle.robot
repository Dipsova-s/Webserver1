*** Settings ***

*** Variables ***
${btnOkConfirmationpopupScheduleAngle}         css=#btn-popupScheduleAngle1
${popupScheduleAngle}        xpath=//div[@id='popupScheduleAngle']
${dropdownSelectTask}       //span[@id='taskDropdownList_ddlWrapper']/span/span[@class='k-select']/span
${ddlExistingTask}          taskDropdownList_ddlWrapper


*** Keywords ***
Select Task To Schedule
    [Arguments]     ${taskName}
    Select Dropdown By InnerText     ${ddlExistingTask}     ${taskName}

Wait Until Schedule Angle Popup Ready
    Wait Until Page Contains Element       ${popupScheduleAngle}
    Sleep        ${TIMEOUT_DROPDOWN}
    Wait Until Ajax Complete

Click Schedule Angle
    Click Element       ${btnOkConfirmationpopupScheduleAngle}