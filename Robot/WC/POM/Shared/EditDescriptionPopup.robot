*** Variables ***
${divEditDesciptionPopup}           jquery=#PopupDescriptionEditor
${pgbEditDesciptionPopup}           jquery=#PopupDescriptionEditor > .k-loading-mask
${btnCloseEditDesciptionPopup}      //span[@id="PopupDescriptionEditor_wnd_title"]/..//span[contains(@class, "k-i-close")]/..
${btnSaveEditDesciption}            jquery=.description-editor-popup .btn-primary
${btnAddLanguage}                   jquery=#PopupDescriptionEditor .languages .multiple-select-button
${divAddLanguages}                  jquery=.multiple-select-list .listview-item
${divSelectEditLanguages}           jquery=#PopupDescriptionEditor .languages .multiple-select-item
${txtEditName}                      jquery=#PopupDescriptionEditor .name
${txtEditDescription}               jquery=#PopupDescriptionEditor .description
${txtEditID}                        jquery=#PopupDescriptionEditor .item-id

*** Keywords ***
Wait Until Edit Description Popup Loaded
    Wait Until Ajax Complete
    Wait Until Page Contains Element    ${divEditDesciptionPopup}
    Wait Until Page Does Not Contain Element    ${pgbEditDesciptionPopup}

Click Add Language
    [Arguments]  ${language}
    Click Element  ${btnAddLanguage}
    Click Element  ${divAddLanguages}[data-id=${language}]

Select Edit Language
    [Arguments]  ${language}
    Click Element  ${divSelectEditLanguages}[data-id=${language}]

Delete Language
    [Arguments]  ${language}
    Click Element  ${divSelectEditLanguages}[data-id=${language}] .btn-remove

Has Language
    [Arguments]  ${language}
    Page Should Contain Element  ${divSelectEditLanguages}[data-id=${language}]

Has No Language
    [Arguments]  ${language}
    Page Should Not Contain Element  ${divSelectEditLanguages}[data-id=${language}]

Is Language Selected
    [Arguments]  ${language}
    ${count}  Get Element Count  ${divSelectEditLanguages}[data-id=${language}]
    ${isSelected}=  Set Variable If  ${count}>0  ${True}  ${False}
    [Return]  ${isSelected}

Input Edit Name
    [Arguments]  ${name}
    Input Text  ${txtEditName}  ${name}

Input Edit Description
    [Arguments]  ${name}
    Input kendo Text Editor  ${txtEditDescription}  ${name}

Click Save Edit Description
    Click Element  ${btnSaveEditDesciption}
    Wait Until Page Does Not Contain Element    ${divEditDesciptionPopup}
    Sleep  ${TIMEOUT_GENERAL}

Click Close Edit Description
    Click Element  ${btnCloseEditDesciptionPopup}
    Wait Until Page Does Not Contain Element    ${divEditDesciptionPopup}
    Sleep  ${TIMEOUT_GENERAL}

Check Languages Is ReadOnly Mode
    Page Should Contain Element   ${divSelectEditLanguages}.disabled

Check Name Is ReadOnly Mode
    Element Should Be Disabled  ${txtEditName}

Check Description Is ReadOnly Mode
    Page Should Contain Element   ${divEditDesciptionPopup} .k-editor-disabled

Check Id Is ReadOnly Mode
    Element Should Be Disabled  ${txtEditID}

Get Language Edit Description
    Wait Until Element Is Visible    ${divSelectEditLanguages}
    ${language}    Get Text    ${divSelectEditLanguages}
    [return]    ${language}

Get Name Edit Description
    Wait Until Element Is Visible    ${txtEditName}
    ${name}    Get Value    ${txtEditName}
    [return]    ${name}

Name Edit Description Should Contain
    [Arguments]    ${text}
    Textfield Value Should Be    ${txtEditName}    ${text}

Description Edit Description Should Contain
    [Arguments]    ${text}
    Textarea Value Should Be    ${txtEditDescription}    ${text}

Input ID
    [Arguments]  ${id}
    Input Text  ${txtEditID}  ${id}    

Edit Description Should Contain ID    
    [Arguments]    ${id}
    Textfield Value Should Be    ${txtEditID}    ${id}