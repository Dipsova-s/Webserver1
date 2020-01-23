*** Variables ***
${btnAddRole}                   css=#subRoles
${btnSaveRole}                  css=.btnSave

#Select role popup
${trRowInSelectRoleGrid}            AvailableRoleGridContainer tbody tr
${btnSaveSelectedRole}              css=.btnAddRoles

${divBusinessProcesses}             jquery=.businessProcesses .businessProcessesItem

${gridAssignRolesFirst}    jquery=#GridAssignRoles .k-grid-content tr
${btnDeleteInGridAssignRoles}    .btnDelete
*** Keywords ***

Click Add Role To User
    Wait Until Page Contains Element    ${btnAddRole}
    Click Element    ${btnAddRole}
    Wait Until Page Contains    Select roles to add

Click Add Selected Role To User
    Click Element    ${btnSaveSelectedRole}

Click Save Role To User
    Wait Until Element Is Visible    ${btnSaveRole}
    Click Element    ${btnSaveRole}
    Wait MC Progress Bar Closed
    Wait Until Page Contains   Add users
    Wait Until Page Contains   Mass change
    Sleep    ${TIMEOUT_GENERAL}

#Select role popup
Click Select Role By Role Name
    [Arguments]    ${roleName}
    Wait Until Page Contains Element    jquery=#${trRowInSelectRoleGrid}:contains(${roleName})
    Click Element    jquery=#${trRowInSelectRoleGrid}:contains(${roleName})

Click Add Business Process To User
    [Arguments]    ${businessProcessName}
    Wait Until Element Is Visible    ${divBusinessProcesses}:contains("${businessProcessName}")
    Click Element    ${divBusinessProcesses}:contains("${businessProcessName}")

Click Add Multiple Business Process To User
    [Arguments]    ${businessProcessName}   ${businessProcessName2}
    Click Add Business Process To User      ${businessProcessName}
    Click Add Business Process To User      ${businessProcessName2}
