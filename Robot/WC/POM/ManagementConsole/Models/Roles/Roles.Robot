*** Variables ***
${divRolesGrid}                       jquery=#RolesGridContainer tbody
${trRowInRolesGrid}                   jquery=#RolesGridContainer tbody tr
${btnEditRole}                        .btnGroupContainer>.btn
${btnActionEditRole}                  .btnGroupInner .btnEdit
${btnActionCopyRole}                  .btnGroupInner .btnCopy
${btnActionShowConsolidateRole}       .btnGroupInner .btnOpenWindow
${btnActionDeleteRole}                .btnGroupInner .btnDelete
${btnActionManageUser}                .btnGroupInner .btnManageUser

${txtRoleFilter}                       RolesGridFilterBox
${trRolesGrid}                         RolesGridContainer tbody tr
${tdUserCount}                        .columnNumber:eq(0)

#Copy role popup
${txtRoleName}                         RoleName
${btnSaveCopyRole}                     css=#popupCopyRole .btnSubmit
${btnCancelCopyRole}                   css=#popupCopyRole .btnClose

#Delete Role
${btnSaveDeleteRole}                   css=#popupConfirmation .btnSubmit

#Privileged Items
${ManagePrivateItems}                  manage_private_items

*** Keywords ***
Click Action On Role By Index
    [Arguments]    ${index}
    Click Show Action Dropdown In Grid By Index    ${index}    ${trRowInRolesGrid}
    Wait Until Page Contains   Edit
    Wait Until Page Contains   Copy
    Wait Until Page Contains   Show consolidated role
    Wait Until Page Contains   Delete

Click Edit Role By Role Name
    [Arguments]    ${roleName}
    Wait Until Page Contains Element    ${trRowInRolesGrid}
    Wait MC Progress Bar Closed
    Filter Role List By Rolename    ${roleName}
    Click Main Action In Grid By Name     ${roleName}    ${trRowInRolesGrid}    ${btnEditRole}
    Wait Until Ajax Complete
    Wait Until Page Contains    Access to client functionality

Click Edit Role Action By Role Name
    [Arguments]    ${roleName}
    Filter Role List By Rolename    ${roleName}
    Click Show Action Dropdown In Grid By Name    ${roleName}    ${trRowInRolesGrid}

Click Edit Role Action By Index
    [Arguments]    ${index}
    Wait Until Page Contains Element    ${trRowInRolesGrid}
    Wait MC Progress Bar Closed
    Filter Role List By Rolename    ${roleName}
    Click Action In Grid By Index     ${index}    ${trRowInRolesGrid}    ${btnActionEditRole}

Click Copy Role Action By Role Name
    [Arguments]    ${roleName}
    Click Action In Grid By Name     ${roleName}    ${trRowInRolesGrid}    ${btnActionCopyRole}
    Wait Until Page Contains   Copy role
    Wait Until Page Contains   New role Id
    Wait Until Page Contains   Copy to model
    Wait Until Ajax Complete

Click Copy Role Action By Index
    [Arguments]    ${index}
    Click Action In Grid By Index     ${index}    ${trRowInRolesGrid}    ${btnActionCopyRole}
    Wait Until Page Contains   Copy role
    Wait Until Page Contains   New role Id
    Wait Until Page Contains   Copy to model

Click Show Consolidate Role Action By Index
    [Arguments]    ${index}
    Click Action In Grid By Index     ${index}    ${trRowInRolesGrid}    ${btnActionShowConsolidateRole}

Click Delete Role Action By Role Name
    [Arguments]    ${roleName}
    Click Action In Grid By Name     ${roleName}    ${trRowInRolesGrid}    ${btnActionDeleteRole}
    Wait Until Page Contains    Confirmation

Click Delete Role Action By Index
    [Arguments]    ${index}
    Click Action In Grid By Index     ${index}    ${trRowInRolesGrid}    ${btnActionDeleteRole}

Filter Role List By Rolename
    [Arguments]    ${roleName}
    Wait Until Page Contains Element    ${txtRoleFilter}
    Input Text    ${txtRoleFilter}    ${roleName}
    Wait Until Page Does Not Contain    ${pgbFilterLoading}
    Wait Until Ajax Complete
    Wait MC Progress Bar Closed

#Copy role popup
Input Role Name
    [Arguments]    ${roleName}
    Wait Until Element Is Visible    ${txtRoleName}
    Input Text    ${txtRoleName}    ${roleName}

Save Copy Role
    Wait Until Element Is Visible    ${btnSaveCopyRole}
    Click Element    ${btnSaveCopyRole}
    Sleep    ${TIMEOUT_LARGEST}
    Wait MC Progress Bar Closed
    Wait Until Ajax Complete

Cancel Copy Role
    Click Element    ${btnCancelCopyRole}

Confirm Delete Role
    Wait Until Page Contains Element    ${btnSaveDeleteRole}
    Click Element    ${btnSaveDeleteRole}
    Wait MC Progress Bar Closed

Check Exiting Role And Remove
    [Arguments]    ${newRoleName}
    Wait Until Page Contains Element    ${txtRoleFilter}
    Input Text    ${txtRoleFilter}    ${newRoleName}
    Wait Until Ajax Complete
    ${chkRoleExist}    Is Element Visible    ${trRowInRolesGrid}:contains(${newRoleName})
    Run Keyword If    ${chkRoleExist} == True    Delete Exiting Role By Role Name    ${newRoleName}

Delete Exiting Role By Role Name
    [Arguments]    ${newRoleName}
    Click Edit Role Action By Role Name    ${newRoleName}
    Click Delete Role Action By Role Name    ${newRoleName}
    Confirm Delete Role
    Wait MC Progress Bar Closed

#Manage User
Click Manage Users Action
    [Arguments]    ${roleName}
    Click Action In Grid By Name     ${roleName}    ${trRowInRolesGrid}    ${btnActionManageUser}
    Wait Until Ajax Complete
    Wait MC Progress Bar Closed
    Wait Until Page Contains    Manage users
    Wait Until Page Contains Element    ${divManageUser}

Get Users Count By Role Name
    ${UserCount}    Execute Javascript    return $.trim($('#${trRolesGrid} ${tdUserCount}').text())
    [Return]    ${UserCount}

