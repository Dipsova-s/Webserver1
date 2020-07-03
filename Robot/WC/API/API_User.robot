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

Import Users
    [Arguments]  ${users}  ${providerId}=local
    ${body}  Send GET  /system/authenticationproviders
    ${providers}  Get From Dictionary  ${body}  authentication_providers
    Should Not Be Empty  ${providers}
    :FOR  ${provider}  IN  @{providers}
    \  ${id}  Get From Dictionary  ${provider}  id
    \  Run Keyword If  "${id}"=="${providerId}"
    \  ...  Run Keywords  Enable User From Provider  ${provider}  ${users}
    \  ...  AND           Exit For Loop

Enable User From Provider
    [Arguments]  ${provider}  ${users}
    ${usersUri}  Get From Dictionary  ${provider}  users
    :FOR  ${user}  IN  @{users}
    \  Restore Created Context
    \  ${userData}  Send PUT  ${usersUri}/${user.name}  {"is_enabled":true}
    \  ${userUri}  Get From Dictionary  ${userData}  user
    \  Restore Created Context
    \  Update User Roles   ${userUri}  ${user.roles}
    \  Restore Created Context
    \  Update User Settings   ${userUri}/settings  {"default_language":"${user.language}"}