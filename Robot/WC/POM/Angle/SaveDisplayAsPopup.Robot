*** Variables ***
${divSaveDisplayAsPopup}          css=.save-as-popup
${pgbSaveDisplayAsPopup}          css=.save-as-popup .k-loading-mask
${btnAddLanguageSaveDisplayAs}    css=.save-as-popup .multiple-select-button
${divAddLanguageSaveDisplayAs}    css=.multiple-select-list .listview-item
${divEditLanguageSaveDisplayAs}   css=.save-as-popup .multiple-select-item
${txtSaveDisplayAsName}           css=.save-as-popup .name
${chkAddToNewAngleDisplayAs}      css=.save-as-popup .chk-new-angle
${txtSaveDisplayAsAngleName}      css=.save-as-popup .angle-name
${btnCloseSaveDisplayAs}          css=.save-as-popup .k-i-close
${btnSubmitSaveDisplayAs}         css=.save-as-popup .btn-save
${btnCancelSaveDisplayAs}         css=.save-as-popup .btn-ghost  

*** Keywords ***
Wait Until Save Display As Popup Loaded
    Wait Until Ajax Complete
    Wait Until Page Contains Element    ${divSaveDisplayAsPopup}
    Wait Until Page Does Not Contain Element    ${pgbSaveDisplayAsPopup}

Click Add Language In Save Display As Popup
    [Arguments]  ${language}
    Click Element  ${btnAddLanguageSaveDisplayAs}
    Click Element  ${divAddLanguageSaveDisplayAs}[data-id=${language}]

Select Edit Language In Save Display As Popup
    [Arguments]  ${language}
    Click Element  ${divEditLanguageSaveDisplayAs}[data-id=${language}]

Delete Language In Save Display As Popup
    [Arguments]  ${language}
    Click Element  ${divEditLanguageSaveDisplayAs}[data-id=${language}] .btn-remove

Input Name In Save Display As Popup
    [Arguments]    ${name}
    Input Text    ${txtSaveDisplayAsName}    ${name}

Get Name In Save Display As Popup
    ${name}    Get Value    ${txtSaveDisplayAsName}
    [Return]    ${name}

Name Should Append Copy Text In Save Display As Popup
    ${name}  Get Name In Save Display As Popup
    Should End With    ${name}    (copy)

Name Should Not Append Copy Text In Save Display As Popup
    ${name}  Get Name In Save Display As Popup
    Should Not End With    ${name}    (cop

Input Angle Name In Save Display As Popup
    [Arguments]    ${name}
    Input Text    ${txtSaveDisplayAsAngleName}    ${name}

Get Angle Name In Save Display As Popup
    ${name}    Get Value    ${txtSaveDisplayAsAngleName}
    [Return]    ${name}

Angle Name Should Append Copy Text In Save Display As Popup
    ${name}  Get Angle Name In Save Display As Popup
    Should End With    ${name}    (copy)

Angle Name Should Not Append Copy Text In Save Display As Popup
    ${name}  Get Angle Name In Save Display As Popup
    Should Not End With    ${name}    (copy)

Select Add To New Angle Checkbox
    Select Checkbox  ${chkAddToNewAngleDisplayAs}

Unselect Add To New Angle Checkbox
    Unselect Checkbox  ${chkAddToNewAngleDisplayAs}

Add To New Angle Checkbox Should Be Selected
    Checkbox Should Be Selected  ${chkAddToNewAngleDisplayAs}

Add To New Angle Checkbox Should Be Disabled
    Element Should Be Disabled  ${chkAddToNewAngleDisplayAs}

Save Display As Popup Should Contain A Warning
    Element Should Contain    ${divSaveDisplayAsPopup}    Only this Display will be added to your new Angle

Save Display As
    Click Element    ${btnSubmitSaveDisplayAs}
    Wait Until Ajax Complete
    Wait Progress Bar Closed

Cancel Save Display As
    Click Element    ${btnCancelSaveDisplayAs} 

Close Save Display As Popup
    Click Element    ${btnCloseSaveDisplayAs}