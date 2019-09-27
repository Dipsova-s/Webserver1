*** Settings ***
Resource            ${EXECDIR}/WC/POM/ManagementConsole/Overview.robot
Resource            ${EXECDIR}/WC/POM/ManagementConsole/Users/AllUsers.robot
Resource            ${EXECDIR}/WC/POM/ManagementConsole/Users/EditUser.robot
Resource            ${EXECDIR}/WC/POM/ManagementConsole/Users/AddUser.robot

*** Keywords ***
Go To All Users Page
    Click Side Menu Users
    Click Side Menu All Users

Assign Role To User
    [Arguments]    ${userName}    ${roleName}
    Click Edit User Action By User Name    ${userName}
    Click Add Role To User
    Click Select Role By Role Name    ${roleName}
    Click Add Selected Role To User
    Click Save Role To User

Add Business Process To User
    [Arguments]    ${userName}    ${businessProcessName}
    Click Edit User Action By User Name    ${userName}
    Click Add Business Process To User    ${businessProcessName}
    Click Save Role To User

Clear Role From User
    [Arguments]    ${userName}
    Click Edit User Action By User Name    ${userName}
    ${numberCountRoleInGrid} =    Get Element Count    ${gridAssignRolesFirst}
    Run Keyword If    ${numberCountRoleInGrid} > 0    Click Remove First Role
    Click Save Role To User

Click Remove First Role
    Click Action In Grid By Index    0    ${gridAssignRolesFirst}    ${btnDeleteInGridAssignRoles}