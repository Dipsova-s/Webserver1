*** Settings ***
Resource            ${EXECDIR}/WC/API/API_Utility.robot

*** Keywords ***
Enable Model Languages
    [Arguments]  ${uri}  ${languages}
    ${body}  Send PUT  ${uri}  {"active_languages":${languages}}
    [Return]    ${body}

Get Model
    [Arguments]  ${uri}
    ${body}  Send GET  ${uri}?caching=false
    [Return]    ${body}

Restart Model Server
    [Arguments]  ${uri}
    Send PUT  ${uri}/agent/modelinfo  {"servers":[{"id":"Server1","is_active":false}]}
    Sleep  1s
    Restore Created Context
    Send PUT  ${uri}/agent/modelinfo  {"servers":[{"id":"Server1","is_active":true}]}
    Wait Until Model Is Available  ${uri}

Check Model Is Available
    [Arguments]  ${uri}
    Restore Created Context
    ${data}  Get Model  ${uri}
    ${available}  Get From Dictionary  ${data}  available
    Should Be True  ${available}==${True}

Wait Until Model Is Available
    [Arguments]  ${uri}
    Sleep  2s
    Wait Until Keyword Succeeds  10 min  5 sec  Check Model Is Available  ${uri}