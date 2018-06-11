*** Settings ***
Resource            ${EXECDIR}/WC/POM/ManagementConsole/Models/ModelEA4IT.robot
Resource            ${EXECDIR}/WC/POM/ManagementConsole/Models/AllModels.robot
Resource            ${EXECDIR}/WC/POM/ManagementConsole/Models/Roles/Roles.robot
Resource            ${EXECDIR}/WC/POM/ManagementConsole/Users/AllUsers.robot
Resource            ${EXECDIR}/WC/POM/ManagementConsole/Users/EditUser.robot

*** Keywords ***
Verify Model EA4IT Is Present
    [Arguments]    ${ID}
    Wait Until Element Is Visible    ${trRowAllModelGrid}
    Page Should Contain Element    ${trRowAllModelGrid}:contains(${ID})

Verify Menu Item Under EA4IT Are Not Present
    Verify EAxtractor
    Verify Refresh Cycle
    Verify Content Parameters
    Verify Modules

Verify Role EA4IT_ALL Is Available
    [Arguments]    ${ID}
    Click Side Menu Models EA4IT Roles
    Wait Until Element Is Visible    ${trRowInRolesGrid}
    Page Should Contain Element    ${trRowInRolesGrid}:contains(${ID})

Verify EAAdmin User Has Role EA4IT
    [Arguments]    ${username}    ${role}
    Click Side Menu Users
    Click Side Menu All Users
    Filter User List By Username    ${username}
    Click Edit User By User Name
    Wait Until Element Is Visible    ${gridAssignRolesFirst}
    Page Should Contain Element    ${gridAssignRolesFirst}:contains(${role})

Verify Models EA4IT Is Exist
    Wait Until Page Contains    EA4IT

Create Angle From Object List And Save For EA4IT
    [Arguments]    ${object_name}    ${angleName}
    Select Model EA4IT For Create Angle
    Fill In Search Create Angle By Object List Popup    ${object_name}
    Select Business Process Other
    Click First Object from List
    Click Create New Angle from Object List Button
    Wait Angle Page Document Loaded
    Wait Angle Detail Document Loaded
    Input Angle Name    ${angleName}
    Click Angle Detail General Tab
    Select Business Process S2D
    Click Save Angle

Set Models Default Back To EA2_800
    [Arguments]    ${model}
    Select Model EA2_800 For Create Angle
    Click Close Create Angle Popup




