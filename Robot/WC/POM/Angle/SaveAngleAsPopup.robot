*** Variables ***
${divSaveAngleAsPopup}          css=.save-as-popup
${pgbSaveAngleAsPopup}          css=.save-as-popup .k-loading-mask
${btnAddLanguageSaveAngleAs}    css=.save-as-popup .multiple-select-button
${divAddLanguageSaveAngleAs}    css=.multiple-select-list .listview-item
${divEditLanguageSaveAngleAs}   css=.save-as-popup .multiple-select-item
${txtSaveAngleAsName}           css=.save-as-popup .name
${btnCloseSaveAngleAs}          css=.save-as-popup .k-i-close
${btnSubmitSaveAngleAs}         css=.save-as-popup .btn-save

*** Keywords ***
Wait Until Save Angle As Popup Loaded
    Wait Until Ajax Complete
    Wait Until Page Contains Element    ${divSaveAngleAsPopup}
    Wait Until Page Does Not Contain Element    ${pgbSaveAngleAsPopup}

Click Add Language In Save Angle As Popup
    [Arguments]  ${language}
    Click Element  ${btnAddLanguageSaveAngleAs}
    Click Element  ${divAddLanguageSaveAngleAs}[data-id=${language}]

Select Edit Language In Save Angle As Popup
    [Arguments]  ${language}
    Click Element  ${divEditLanguageSaveAngleAs}[data-id=${language}]

Delete Language In Save Angle As Popup
    [Arguments]  ${language}
    Click Element  ${divEditLanguageSaveAngleAs}[data-id=${language}] .btn-remove

Input Name In Save Angle As Popup
    [Arguments]    ${name}
    Input Text    ${txtSaveAngleAsName}    ${name}

Get Name In Save Angle As Popup
    ${name}    Get Value    ${txtSaveAngleAsName}
    [Return]    ${name}

Name Should Append Copy Text In Save Angle As Popup
    ${name}  Get Name In Save Angle As Popup
    Should End With    ${name}    (copy)

Name Should Not Append Copy Text In Save Angle As Popup
    ${name}  Get Name In Save Angle As Popup
    Should Not End With    ${name}    (copy)

Save Angle As
    Click Element    ${btnSubmitSaveAngleAs}
    Wait Until Ajax Complete
    Wait Progress Bar Closed

Close Save Angle As Popup
    Click Element    ${btnCloseSaveAngleAs}