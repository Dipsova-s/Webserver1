*** Settings ***
Resource            ${EXECDIR}/WC/API/API_Utility.robot

*** Keywords ***
Get Dashboard
    [Arguments]   ${path}
    ${body}    Send GET    ${path}
    [Return]    ${body}

Create Dashboard
    [Arguments]   ${data}
    ${body}    Send POST    /dashboards?redirect=no&multilingual=yes&accept_warnings=true    ${data}
    [Return]    ${body}

Update Dashboard
    [Arguments]   ${path}    ${data}
    ${body}    Send PUT    ${path}?multilingual=yes&accept_warnings=true    ${data}
    [Return]    ${body}

Delete Dashboard
    [Arguments]   ${path}
    Send DELETE    ${path}