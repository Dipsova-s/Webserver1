*** Variables ***
${divValidatingPopup}       css=#popupValidateSettings
${chkValidateAngle}          css=#ValidateCheckBox

*** Keywords ***
Wait Angle Validating Popup Loaded
    Sleep    ${TIMEOUT_GENERAL}

Wait Angle Validating Saved
    Wait Until Page Does Not Contain Element    ${divValidatingPopup}
    Wait Progress Bar Closed
    Wait Until Ajax Complete

Click Validate Angle
    Select Checkbox    ${chkValidateAngle}
    Wait Angle Validating Saved

Click Unvalidate Angle
    Unselect Checkbox    ${chkValidateAngle}
    Wait Angle Validating Saved