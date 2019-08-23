*** Variables ***
${divValidatingPopup}       css=#popupValidateSettings
${chkValidateAngle}          css=#ValidateCheckBox

*** Keywords ***
Wait Angle Validating Popup Loaded
    Sleep    ${TIMEOUT_GENERAL}

Click Validate Angle
    Select Checkbox    ${chkValidateAngle}
    Page Should Contain Toast Success
    Wait Until Page Does Not Contain Element    ${divValidatingPopup}
    Sleep    ${TIMEOUT_LARGEST}

Click Unvalidate Angle
    Unselect Checkbox    ${chkValidateAngle}
    Page Should Contain Toast Success
    Wait Until Page Does Not Contain Element    ${divValidatingPopup}
    Sleep    ${TIMEOUT_LARGEST}