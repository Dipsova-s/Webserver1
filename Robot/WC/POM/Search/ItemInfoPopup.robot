*** Variables ***
${divItemInfoPopup}         css=#popupAngleInfo
${pgbItemInfoPopup}         css=#popupAngleInfo .k-loading-mask
${btnItemInfoEditMode}      css=#btn-popupAngleInfo1

${divDashboardItemInfoSection}       css=.dashboardInfoWidgetAngleSection
${btnDashboardItemInfoOk}            css=#btn-popupDashboardInfo0
${btnDashboardItemInfoEditMode}      css=#btn-popupDashboardInfo1

*** Keywords ***
Wait Item Info Popup Loaded
    Wait Until Page Does Not Contain Element    ${pgbItemInfoPopup}

Click Edit Mode Button Via Item Info Popup
    Wait Until Page Contains Element    ${btnItemInfoEditMode}
    Click Element    ${btnItemInfoEditMode}

Click Dashbaord Edit Mode Button Via Item Info Popup
    Sleep    ${TIMEOUT_GENERAL}
    Wait Until Page Contains Element    ${divDashboardItemInfoSection}
    Click Element    ${btnDashboardItemInfoEditMode}
    Wait Progress Bar Closed

Click Dashbaord Ok Button Via Item Info Popup
    Wait Until Page Contains Element    ${divDashboardItemInfoSection}
    Click Element    ${btnDashboardItemInfoOk}
