*** Variables ***
${divSaveDashboardAsPopup}              css=.save-as-popup
${pgbSaveDashboardAsPopup}              css=.save-as-popup .k-loading-mask
${txtSaveDashboardAsName}               jquery=#PopupSaveAs .name
${btnSubmitSaveDashboardAs}             jquery=#btn-PopupSaveAs1

*** Keywords ***
Wait Until Save Dashboard As Popup Loaded
    Wait Until Page Contains Element    ${divSaveDashboardAsPopup}
    Wait Until Page Does Not Contain Element    ${pgbSaveDashboardAsPopup}

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

Input Name In Save Dashboard As Popup
    [Arguments]    ${name}
    Input Text    ${txtSaveDashboardAsName}    ${name}

Get Name In Save Dashboard As Popup
    ${name}    Get Value    ${txtSaveDashboardAsName}
    [Return]    ${name}

Name Should Append Copy Text In Save Dashboard As Popup
    ${name}  Get Name In Save Dashboard As Popup
    Should End With    ${name}    (copy)  

Name Should Not Append Copy Text In Save Angle As Popup
    ${name}  Get Name In Save Angle As Popup
    Should Not End With    ${name}    (copy)

Save Dashboard As
    Click Element    ${btnSubmitSaveDashboardAs}
    Wait Progress Bar Closed
    Page Should Contain Toast Success  

Close Save Angle As Popup
    Click Element    ${btnCloseSaveAngleAs}