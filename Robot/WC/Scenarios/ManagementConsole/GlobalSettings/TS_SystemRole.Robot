*** Settings ***
Resource            ${EXECDIR}/WC/POM/ManagementConsole/Shared/MC_Comment.robot
Resource            ${EXECDIR}/WC/POM/ManagementConsole/Shared/MC_ConsolidatedRole.robot
Resource            ${EXECDIR}/WC/POM/ManagementConsole/GlobalSettings/SystemRoles/SystemRole.robot
Resource            ${EXECDIR}/WC/POM/ManagementConsole/GlobalSettings/SystemRoles/EditSystemRole.robot

*** Keywords ***
Go To System Roles Page
    Click Side Menu Global Settings
    Click Side Menu System Roles
    Wait All System Roles Page Ready

Create New Role And Set All Allowed
    [Arguments]    ${id}    ${description}
    ${chkIconExist}    Is Element Visible    ${trSystemRowInRolesGrid}:contains(${id})
    Run Keyword If    ${chkIconExist} == True    Delete Role    ${id}
    Create New Role    ${id}    ${description}

Create New Role
    [Arguments]    ${id}    ${description}
    Click Add System Role
    Input System Role ID    ${id}
    Input System Role Description    ${description}
    Click Save New System Role
    Click Allow Manage User
    Click Allow Manage System
    Click Save Edit System Role

Delete Role
    [Arguments]    ${id}
    Click Delete System Role Action By Role Name    ${id}
    Confirm Delete System Role

Verify Consolidated Role Of All Allowed
    [Arguments]    ${id}
    Click Show Consolidate System Role Action By Role Name    ${id}
    Wait Consolidated Role Loaded
    Click Expand All Roles
    Element Should Contain    ${popupConsoliDatedRole}    Manage system: allowed
    Element Should Contain    ${popupConsoliDatedRole}    Manage users: allowed
    Element Should Contain    ${popupConsoliDatedRole}    Allow impersonation: denied
    Element Should Contain    ${popupConsoliDatedRole}    Management access: allowed
    Click Close Consolidated Role Popup

Set Manage System To Undefined
    [Arguments]    ${id}
    Click Edit System Role By Role Name    ${id}
    Click Undefined Manage System
    Click Save Edit System Role

Verify Set Manage System To Undefined
    [Arguments]    ${id}
    Click Edit System Role By Role Name    ${id}
    Radio Button Should Be Set To    manage_system    null

Back To System Roles Page And Remove Role
    [Arguments]    ${id}
    Click Cancel Edit System Role
    Click Delete System Role Action By Role Name    ${id}
    Confirm Delete System Role

#Manage Users Senarios
Add User To System Role By Name
    [Arguments]    ${Role_Name}     ${FilterAvailableUser}
    Click Show Action Dropdown In Grid By Name    ${Role_Name}    ${trSystemRowInRolesGrid}
    Click Manage Users Tab    ${Role_Name}    ${trSystemRowInRolesGrid}
    Filter Available User By Keyword    ${FilterAvailableUser}
    Click Select All Available User
    Click Add User To Right Side
    Click Confirm Selected User To Role
