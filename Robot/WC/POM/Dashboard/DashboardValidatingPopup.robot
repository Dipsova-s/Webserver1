*** Variables ***
${divDashboardValidatingPopup}       css=#popupValidateSettings
${chkValidateDashboard}          css=#ValidateCheckBox

*** Keywords ***
Wait Dashboard Validating Popup Loaded
    Sleep    ${TIMEOUT_GENERAL}

Click Validate Dashboard
    Select Checkbox    ${chkValidateDashboard}
    Wait Until Page Does Not Contain Element    ${divDashboardValidatingPopup}
    Sleep    ${TIMEOUT_LARGEST}

Click Unvalidate Dashboard
    Unselect Checkbox    ${chkValidateDashboard}
    Wait Until Page Does Not Contain Element    ${divDashboardValidatingPopup}
    Sleep    ${TIMEOUT_LARGEST}