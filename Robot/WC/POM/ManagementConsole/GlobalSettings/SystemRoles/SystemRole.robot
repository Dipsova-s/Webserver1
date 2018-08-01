*** Variables ***
${trSystemRowInRolesGrid}                   jquery=#SystemRolesGrid tbody tr
${btnEditSystemRole}                        .btnGroupContainer>.btn
${btnActionEditSystemRole}                  .btnGroupInner .btnEdit
${btnActionShowConsolidateSystemRole}       .btnGroupInner .btnOpenWindow
${btnActionDeleteSystemRole}                .btnGroupInner .btnDelete
${txtSystemRole}                             All system roles
${btnAddSystemRole}                         css=.gridToolbarBottom .btnAdd

#Delete System Role
${btnSaveDeleteSystemRole}                  css=#popupConfirmation .btnSubmit

*** Keywords ***
Wait All System Roles Page Ready
    Wait Until Page Contains    ${txtSystemRole}
    Wait MC Progress Bar Closed
    Sleep    ${TIMEOUT_LARGEST}
    Wait Until Ajax Complete

Click Add System Role
    Wait Until Page Contains Element    ${btnAddSystemRole}
    Click Element    ${btnAddSystemRole}
    Wait Edit System Role Page Ready

Click Action On System Role By Index
    [Arguments]    ${index}
    Click Show Action Dropdown In Grid By Index    ${index}    ${trSystemRowInRolesGrid}

Click Action On System Role By Role Name
    [Arguments]    ${roleName}
    Click Show Action Dropdown In Grid By Name    ${roleName}    ${trSystemRowInRolesGrid}

Click Edit System Role By Index
    [Arguments]    ${index}
    Click Action In Grid By Index     ${index}    ${trSystemRowInRolesGrid}    ${btnActionEditSystemRole}
    Wait Edit System Role Page Ready

Click Edit System Role By Role Name
    [Arguments]    ${roleName}
    Click Action In Grid By Name     ${roleName}    ${trSystemRowInRolesGrid}    ${btnEditSystemRole}
    Wait Edit System Role Page Ready

Click Show Consolidate System Role Action By Index
    [Arguments]    ${index}
    Click Show Action Dropdown In Grid By Index    ${index}    ${trSystemRowInRolesGrid}
    Click Action In Grid By Index     ${index}    ${trSystemRowInRolesGrid}    ${btnActionShowConsolidateSystemRole}

Click Show Consolidate System Role Action By Role Name
    [Arguments]    ${roleName}
    Click Show Action Dropdown In Grid By Name    ${roleName}    ${trSystemRowInRolesGrid}
    Click Action In Grid By Name     ${roleName}    ${trSystemRowInRolesGrid}    ${btnActionShowConsolidateSystemRole}

Click Delete System Role Action By Index
    [Arguments]    ${index}
    Click Show Action Dropdown In Grid By Index    ${index}    ${trSystemRowInRolesGrid}
    Click Action In Grid By Index     ${index}    ${trSystemRowInRolesGrid}    ${btnActionDeleteSystemRole}
    Wait Until Page Contains    Confirmation

Click Delete System Role Action By Role Name
    [Arguments]    ${roleName}
    Click Show Action Dropdown In Grid By Name    ${roleName}    ${trSystemRowInRolesGrid}
    Click Action In Grid By Name     ${roleName}    ${trSystemRowInRolesGrid}    ${btnActionDeleteSystemRole}
    Wait Until Page Contains    Confirmation

Confirm Delete System Role
    Wait Until Element Is Visible    ${btnSaveDeleteSystemRole}
    Click Element    ${btnSaveDeleteSystemRole}
    Wait All System Roles Page Ready

Click Manage Users Tab
    [Arguments]    ${roleName}    ${trSystemRowInRolesGrid}
    Click Action In Grid By Name     ${roleName}    ${trSystemRowInRolesGrid}    ${btnActionManageUser}
    Wait Until Ajax Complete
    Wait MC Progress Bar Closed
    Wait Until Page Contains Element    ${divManageUser}
