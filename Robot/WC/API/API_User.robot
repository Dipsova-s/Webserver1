*** Settings ***
Resource            ${EXECDIR}/WC/API/API_Utility.robot

*** Keywords ***
Get User By Name
    [Arguments]   ${name}
    ${body}    Send GET    /users?sort=id&q=${name}
    ${users}    Get From Dictionary    ${body}    users
    Should Not Be Empty  ${users}
    ${user}  Get From List  ${users}  0
    [Return]    ${user}

Get User
    [Arguments]   ${path}
    ${body}    Send GET    ${path}
    [Return]    ${body}

Get User Roles
    [Arguments]   ${response}
    ${roles}    Get From Dictionary    ${response}    assigned_roles
    [Return]    ${roles}

Update User
    [Arguments]   ${path}  ${data}
    ${body}    Send PUT    ${path}  ${data}
    [Return]    ${body}

Update User Roles
    [Arguments]   ${path}  ${roles}
    ${data}  Set Variable  {"assigned_roles":${roles}}
    ${body}  Update User  ${path}  ${data}
    [Return]    ${body}