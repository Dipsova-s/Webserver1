*** Settings ***
Resource            ${EXECDIR}/WC/POM/ManagementConsole/Models/Roles/Roles.robot
Resource            ${EXECDIR}/WC/POM/ManagementConsole/Models/Roles/EditRole.robot
Resource            ${EXECDIR}/WC/POM/ManagementConsole/Models/Roles/Privileges.robot
Resource            ${EXECDIR}/WC/POM/ManagementConsole/Overview.robot
Resource            ${EXECDIR}/WC/POM/ManagementConsole/Models/Roles/ManageUser.robot

*** Keywords ***
Go To Role Tab Under Model EA2_800
    Click Side Menu Models
    Click Side Menu Models EA2_800
    Click Side Menu Models EA2_800 Roles

Create Role By Copy Role
    [Arguments]    ${roleName}    ${newRoleName}
    Check Exiting Role And Remove    ${newRoleName}
    Click Edit Role Action By Role Name    ${roleName}
    Click Copy Role Action By Role Name    ${roleName}
    Input Role Name    ${newRoleName}
    Save Copy Role
    Wait MC Progress Bar Closed

Set Role To Deny Administrator Privileges And Export Data
    [Arguments]    ${roleName}
    Click Edit Role By Role Name    ${roleName}
    Wait Edit Role Page Loaded
    Scroll Vertical     ${mainContent}     235
    Wait MC Progress Bar Closed
    Click Deny Manage Model
    Click Deny Manage Privilege Item
    Click Deny Exprot Data
    Click Save Edit Role
    Wait MC Progress Bar Closed

Delete Role By Role Name
    [Arguments]    ${roleName}
    Click Edit Role Action By Role Name    ${roleName}
    Click Delete Role Action By Role Name    ${roleName}
    Confirm Delete Role
    Wait MC Progress Bar Closed
    Wait Until Element Does Not Contain    ${divRolesGrid}    ${roleName}

#Manage Users Senarios
Filter Role By Role Name
    [Arguments]    ${roleName}
    Filter Role List By Rolename    ${roleName}

Add User To Role Name
    [Arguments]    ${Role_Name}     ${FilterAvailableUser}
    Click Show Action Dropdown In Grid By Name    ${Role_Name}    ${trRowInRolesGrid}
    Click Manage Users Action    ${Role_Name}
    Filter Available User By Keyword    ${FilterAvailableUser}
    Click Select All Available User
    Click Add User To Right Side
    Click Confirm Selected User To Role

Verify Users Count After Added
    [Arguments]    ${roleName}    ${UserCount}
    Filter Role By Role Name    ${roleName}
    ${UserInRole}    Get Users Count By Role Name
    Should Be Equal    ${UserCount}    ${UserInRole}