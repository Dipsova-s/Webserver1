*** Variables ***
${divValidatingPopup}       css=#popupValidateSettings
${chkValidateAngle}          css=#ValidateCheckBox

*** Keywords ***
Wait Angle Validating Popup Loaded
    Sleep    ${TIMEOUT_GENERAL}

Click Validate Angle
    Select Checkbox    ${chkValidateAngle}
    Wait Until Page Does Not Contain Element    ${divValidatingPopup}
    Page Should Contain Toast Success
    Sleep    ${TIMEOUT_LARGEST}

Click Unvalidate Angle
    Unselect Checkbox    ${chkValidateAngle}
    Wait Until Page Does Not Contain Element    ${divValidatingPopup}
    Page Should Contain Toast Success
    Sleep    ${TIMEOUT_LARGEST}