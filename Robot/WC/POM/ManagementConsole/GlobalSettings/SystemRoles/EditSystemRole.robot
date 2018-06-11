*** Variables ***
${btnSaveEditSystemRole}      css=.btnSave
${btnCancelEditSystemRole}    css=.btnBack

${roleId}               Id
${roleDescription}      Description

${rdoManageUserslAllow}                  jquery=input[name=manage_users][value=true]
${rdoManageUsersDeny}                    jquery=input[name=manage_users][value=false]
${rdoManageUsersUndefined}               jquery=input[name=manage_users][value=null]

${rdoManageSystemlAllow}                 jquery=input[name=manage_system][value=true]
${rdoManageSystemDeny}                   jquery=input[name=manage_system][value=false]
${rdoManageSystemUndefined}              jquery=input[name=manage_system][value=null]

${rdoAllowImpersonationAllow}            jquery=input[name=allow_impersonation][value=true]
${rdoAllowImpersonationDeny}             jquery=input[name=allow_impersonation][value=false]
${rdoAllowImpersonationUndefined}        jquery=input[name=allow_impersonation][value=null]

${rdoManagementAccessAllow}              jquery=input[name=has_management_access][value=true]
${rdoManagementAccessDeny}               jquery=input[name=has_management_access][value=false]


*** Keywords ***
Wait Edit System Role Page Ready
    Wait MC Progress Bar Closed
    Wait Until Ajax Complete
    Wait Until Element Is Visible    ${roleId}
    Wait Until Element Is Visible    ${roleDescription}

Click Save New System Role
    Wait Until Element Is Visible    ${btnSaveEditSystemRole}
    Click Element    ${btnSaveEditSystemRole}
    Wait Edit System Role Page Ready

Click Save Edit System Role
    Click Element    ${btnSaveEditSystemRole}
    Wait All System Roles Page Ready

Click Cancel Edit System Role
    Wait Until Element Is Visible    ${btnCancelEditSystemRole}
    Click Element    ${btnCancelEditSystemRole}
    Wait All System Roles Page Ready

Input System Role ID
    [Arguments]    ${id}
    Input Text    ${roleId}    ${id}

Input System Role Description
    [Arguments]    ${description}
    Input Text    ${roleDescription}    ${description}

#Set Privileges
Click Allow Manage User
    Wait Until Page Contains Element    ${rdoManageUserslAllow}
    Click Element    ${rdoManageUserslAllow}

Click Deny Manage User
    Wait Until Page Contains Element    ${rdoManageUsersDeny}
    Click Element    ${rdoManageUsersDeny}

Click Undefined Manage User
    Wait Until Page Contains Element    ${rdoManageUsersUndefined}
    Click Element    ${rdoManageUsersUndefined}

Click Allow Manage System
    Wait Until Page Contains Element    ${rdoManageSystemlAllow}
    Click Element    ${rdoManageSystemlAllow}

Click Deny Manage System
    Wait Until Page Contains Element    ${rdoManageSystemDeny}
    Click Element    ${rdoManageSystemDeny}

Click Undefined Manage System
    Wait Until Page Contains Element    ${rdoManageSystemUndefined}
    Click Element    ${rdoManageSystemUndefined}

Click Allow Impersonation
    Wait Until Page Contains Element    ${rdoAllowImpersonationAllow}
    Click Element    ${rdoAllowImpersonationAllow}

Click Deny Impersonation
    Wait Until Page Contains Element    ${rdoAllowImpersonationDeny}
    Click Element    ${rdoAllowImpersonationDeny}

Click Undefined Impersonation
    Wait Until Page Contains Element    ${rdoAllowImpersonationUndefined}
    Click Element    ${rdoAllowImpersonationUndefined}

Click Allow Management Access
    Wait Until Page Contains Element    ${rdoManagementAccessAllow}
    Click Element    ${rdoManagementAccessAllow}

Click Deny Management Access
    Wait Until Page Contains Element    ${rdoManagementAccessDeny}
    Click Element    ${rdoManagementAccessDeny}
