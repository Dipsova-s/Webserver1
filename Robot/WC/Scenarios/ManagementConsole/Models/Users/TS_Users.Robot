*** Settings ***
Resource            ${EXECDIR}/WC/POM/ManagementConsole/Overview.robot
Resource            ${EXECDIR}/WC/POM/ManagementConsole/Users/AllUsers.robot
Resource            ${EXECDIR}/WC/POM/ManagementConsole/Users/EditUser.robot
Resource            ${EXECDIR}/WC/POM/ManagementConsole/Users/AddUser.robot


*** Variables ***
${providerName}    local


*** Keywords ***
Go To All Users Page With Admin User
    Go to MC Then Login With Admin User
    Go To All Users Page

Go To All Users Page
    Go To MC Page    /Users/All%20users/
    Wait Until All Users Page Ready

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

Add User
    Click Add User Popup
    Choose Provider Dropdown List    ${providerName}
    Wait Until Add Users Page Loaded
    Click Select All Available Users
    Click Add Selected Users
    Click Select All Selected Users
    Click DeSelect All Selected User
    Click Select All Selected Users
    Click Remove Selected Users
    Click DeSelect All Available User
    ${username}    Get First Available Username
    Set Test Variable     ${username}     ${username}
    Click Select First Available User
    Click Add Selected Users
    Click Save Add User
    Wait Until Add Users Page Loaded
    Click Cancel Button on Add User Page
    Wait MC Progress Bar Closed
    Filter User List By Username    ${username}

Delete User
    [Arguments]     ${username}
    Filter User List By Username        ${username}
    Click Select First Available User
    Click Action On User By Index       0
    Click Delete User Action By Index       0 

Users should not have <Model>_ALL role
    Select User EABasic
    Select User EAViewer
    Click on button Mass change
    Select radio button 'Remove roles'
    Select the role <Model>_ALL from 'Mass change' dropdown
    Click on 'Save' in Mass change popup
    Wait Until Element Is Visible  ${LocatorPopupClosepopup}
    Close Mass change report popup
    Wait Until Element Is Visible      ${LocatorUserEABasic}    