*** Variables ***
${txtAssignTrustedWebservers}           ReFormatTrustedWebservers_tag
${trRowInSystemAuthenticationGrid}      jquery=#SystemAuthenticationGrid tbody tr

${chkEnableSystemAuthentication}        input[name="IsEnabled"]
${chkAutoCreateUser}                    input[name="IsAutoCreateUsers"]
${rdoSetDefaultSyetemAuthentication}    input[name="IsDefaultProvider"]
${ddlDefaultRoles}                      .k-multiselect-wrap
${btnSaveAuthentication}                css=.btnSave
${btnCancelAuthentication}              css=.btnBack

${btnCreateAuthentication}              jquery=#SystemSettingsForm .btn[title="Authentication Provider Types"]



*** Keywords ***
Wait Until Authentication Page Loaded
    Sleep    ${TIMEOUT_GENERAL}
    Wait MC Progress Bar Closed
    Wait Until Page Contains Element    ${trRowInSystemAuthenticationGrid} ${rdoSetDefaultSyetemAuthentication}

Wait Until Authentication Edit Page Loaded
    Sleep    ${TIMEOUT_GENERAL}
    Wait MC Progress Bar Closed
    Wait Until Page Contains Element    ${ddlAuthenticationProviderID} ${chkEnableAuthentication}

Input Trusted Webservers
    [Arguments]    ${IP}
    Input Text    ${txtAssignTrustedWebservers}    ${IP}
    Press Key    ${txtAssignTrustedWebservers}    \\13
    Capture Page Screenshot
    #Press Key    ${txtAssignTrustedWebservers}    \\9

#Check CssClass not_valid is Exist
Get Invalid Input Trusted Webservers
    ${isValid}    Is Element Has CssClass    ${txtAssignTrustedWebservers}    not_valid
    [Return]    ${isValid}

#Get Validate Input Trusted Webservers
#    ${isInvalid}    Is Element Has CssClass    ${txtAssignTrustedWebservers}    not_valid
#    ${isValid}    Execute JavaScript    return "${isInvalid}"!="True"
#    [Return]    ${isValid}

Get Enabled Authentication Count
    ${countEnabled}    Get Elements Count    jquery=${chkEnableSystemAuthentication}:checked
    [Return]    ${countEnabled}

Get Enabled Auto Create Users Count
    ${countEnabled}    Get Elements Count    jquery=${chkAutoCreateUser}:checked
    [Return]    ${countEnabled}

Get Enabled Default Authentication Count
    ${countEnabled}    Get Elements Count    jquery=${rdoSetDefaultSyetemAuthentication}:checked
    [return]    ${countEnabled}

Click Enable System Authentication By ID
    [Arguments]    ${ID}
    Click Action In Grid By Name     ${ID}    ${trRowInSystemAuthenticationGrid}    ${chkEnableSystemAuthentication}

Click Enable Auto Create User By ID
    [Arguments]    ${ID}
    Click Action In Grid By Name     ${ID}    ${trRowInSystemAuthenticationGrid}    ${chkAutoCreateUser}

Click Set Default System Authentication By ID
    [Arguments]    ${ID}
    Click Action In Grid By Name     ${ID}    ${trRowInSystemAuthenticationGrid}    ${rdoSetDefaultSyetemAuthentication}

Set Default Roles To System Authentication By ID
    [Arguments]    ${roleName}
    ${countEnabled} =    Get Elements Count    ${ddlAuthenticationProviderID} ${ddlDefaultRoles}:contains(${roleName})
    Run Keyword If    "${countEnabled}" == "0"    Set Default Roles   ${roleName}

Set Default Roles
    [Arguments]   ${roleName}
    Select Dropdown By InnerText    ${ddlAuthenticationProviderID} ${ddlDefaultRoles}    ${roleName}

Remove Default Roles To System Authentication By ID
    [Arguments]    ${ID}    ${roleName}
    Wait Until Page Contains Element    ${trRowInSystemAuthenticationGrid}:contains(${ID}) ${ddlDefaultRoles}
    Click Element    ${trRowInSystemAuthenticationGrid}:contains(${ID}) ${ddlDefaultRoles} span:contains(${roleName}) + .k-select

Check Default Role Is Exist
    [Arguments]    ${ID}    ${roleName}
    Element Should Contain    ${trRowInSystemAuthenticationGrid}:contains(${ID}) ${ddlDefaultRoles}    ${roleName}

Check Default Role Is Not Exist
    [Arguments]    ${ID}    ${roleName}
    Element Should Not Contain    ${trRowInSystemAuthenticationGrid}:contains(${ID}) ${ddlDefaultRoles}    ${roleName}

Click Save Authentication
    Wait Until Page Contains Element    ${btnSaveAuthentication}
    Wait Until Element Is Visible    ${btnSaveAuthentication}
    Click Element    ${btnSaveAuthentication}
    Wait Until Authentication Page Loaded

Check Automatically create users already selected by ID
    Checkbox Should Be Selected    ${ddlAuthenticationProviderID} ${chkAutoCreateUserAuthentication}:checked
    Wait Until Element Is Visible    ${btnCancelAuthentication}
    Click Element    ${btnCancelAuthentication}

Create new Authenticate AD type
    Click Element    ${btnCreateAuthentication}

Check Exiting Authentication And Remove by Id
    [Arguments]    ${ID}
    ${chkAuthenticationExist}    Is Element Visible    ${trRowInSystemAuthenticationGrid}:contains(${ID})
    Run Keyword If    ${chkAuthenticationExist} == True    Delete Authentication Provider by ID    ${ID}


