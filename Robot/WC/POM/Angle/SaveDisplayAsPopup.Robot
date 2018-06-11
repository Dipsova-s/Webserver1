*** Variables ***
${popupSaveDisplayAs}           popupSaveAs
${txtSaveAsDisplayName}         css=#popupSaveAs .languageName
${chkAddToNewAngle}             IsAddToNewAngle
${txtSaveAsAngleName}           css=#popupSaveAs .languageAngleName
${btnCloseSaveAsDisplay}        btn-popupSaveAs0
${btnSubmitSaveAsDisplay}       btn-popupSaveAs1

*** Keywords ***
Input Display Name In Save Display As Popup
    [Arguments]    ${name}
    Input Text    ${txtSaveAsDisplayName}    ${name}

Get Display Name In Save Display As Popup
    ${name}    Get Value    ${txtSaveAsDisplayName}
    [Return]    ${name}

Input Angle Name In Save Angle As Popup
    [Arguments]    ${name}
    Input Text    ${txtSaveAsAngleName}    ${name}

Get Angle Name In Save Display As Popup
    ${name}    Get Value    ${txtSaveAsAngleName}
    [Return]    ${name}

Click Check Add To New Angle Checkbox
    Select Checkbox    ${chkAddToNewAngle}

Click Un-check Add To New Angle Checkbox
    Unselect Checkbox    ${chkAddToNewAngle}

Click Save Display As Button
    Click Element    ${btnSubmitSaveAsDisplay}
    Wait Until Ajax Complete
    Wait Progress Bar Closed

Close Save Display As Popup
    Click Element    ${btnCloseSaveAsDisplay}