*** Variables ***
${rdoAddToExistingDashboard}     css=#exitingDashboardRadioButton
${btnCloseSaveDashboardPopup}    css=.k-i-close
${ddlExistingDashboard}          css=#dashboardDropdownlist_ddlWrapper
${btnSubmitAddToDashboard}       btn-popupAddToDashboard1

${btnCloseInfo}       btn-popupNotification0

*** Keywords ***
Click Add To Existing Dashboard
    Select Radio Button    createDashboardType    ExitingDashboard

Click Save Dashboard Button
    Click Element    ${btnSubmitAddToDashboard}
    Wait Progress Bar Closed

Close Save Dashboard Popup
    Click Element    ${btnCloseSaveDashboardPopup}

Click Close Info Button
    Wait Until Element Is Visible    ${btnCloseInfo}
    Click Element    ${btnCloseInfo}

Wait Add To Dashboard Popup Load
    Sleep    ${TIMEOUT_GENERAL}
    Wait Until Ajax Complete

Select Existing Dashboard To Add
    [Arguments]     ${dashboardName}
    Select Dropdown By Text    ${ddlExistingDashboard}    ${dashboardName}