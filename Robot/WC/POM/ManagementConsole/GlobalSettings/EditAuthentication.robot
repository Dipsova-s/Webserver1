*** Variables ***
${btnCreateAuthentication}              jquery=#SystemSettingsForm .btn[title="Authentication Provider Types"]
${ddlAuthenticationProviderTypes}       jquery=#popupAuthenticationProviderTypes .k-widget
${btnSubmit}                            css=.btnSubmit

${ddlAuthenticationProviderID}          jquery=#formAuthenticationProvider
${chkAuthenticationProviderID}          input[name="Id"]
${chkDescriptionAuthentication}         input[name="Description"]
${chkEnableAuthentication}              input[name="is_enabled"]
${chkAutoCreateUserAuthentication}      input[name="auto_create_users"]
${chkSetSyncRolesToGroups}              input[name="sync_roles_to_groups"]
${chkTargetAuthentication}              input[name="target"]
${chkIdentityAuthentication}            input[name="identity"]
${btnSaveAuthentication}                css=.btnSave

${btnEditAuthentication}                .btnGroupContainer
${btnDeleteAuthentication}              .btnGroupContainer .btnDelete
${ddlAuthenticationPopupConfirmation}    jquery=#popupConfirmation
${btnConfirmation}                      .btnSubmit

*** Keywords ***
Set Authentication Provider Type
    [Arguments]    ${text}
    Wait Until Page Contains Element    ${ddlAuthenticationProviderTypes}
    Select Dropdown By InnerText    ${ddlAuthenticationProviderTypes}    ${text}
    Click Element    ${btnSubmit}

Fill Authentication ID
    [Arguments]    ${ID}
    Wait Until Page Contains Element    ${ddlAuthenticationProviderID} ${chkAuthenticationProviderID}
    Input Text    ${ddlAuthenticationProviderID} ${chkAuthenticationProviderID}    ${ID}

Fill Authentication Description
    [Arguments]    ${Description}
    Input Text    ${ddlAuthenticationProviderID} ${chkDescriptionAuthentication}    ${Description}

Set Enable Authentication
    Select CheckBox    ${ddlAuthenticationProviderID} ${chkEnableAuthentication}

Set Auto Create User
    Select CheckBox    ${ddlAuthenticationProviderID} ${chkAutoCreateUserAuthentication}

Set Sync roles to groups
    Select Checkbox    ${ddlAuthenticationProviderID} ${chkSetSyncRolesToGroups}

Fill Authentication Target
    [Arguments]    ${Target}
    Input Text    ${ddlAuthenticationProviderID} ${chkTargetAuthentication}    ${Target}

Fill Authentication Identity
    [Arguments]    ${Identity}
    Input Text    ${ddlAuthenticationProviderID} ${chkIdentityAuthentication}    ${Identity}

Verify Authentication
    [Arguments]    ${ID}
    Wait Until Element Is Visible    ${btnCreateAuthentication}
    Page Should Contain Element    ${trRowInSystemAuthenticationGrid}:contains(${ID})

Delete Authentication
    [Arguments]    ${ID}
    Click Show Action Dropdown In Grid By Name     ${ID}    ${trRowInSystemAuthenticationGrid}
    Click Action In Grid By Name     ${ID}    ${trRowInSystemAuthenticationGrid}    ${btnActionDeleteCustomIcons}
    Wait Until Element Is Visible    ${ddlAuthenticationPopupConfirmation} ${btnConfirmation}
    Click Element    ${ddlAuthenticationPopupConfirmation} ${btnConfirmation}
    Wait Until Ajax Complete
    Wait Progress Bar Closed