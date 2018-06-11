*** Settings ***
Resource            ${EXECDIR}/WC/API/API_Utility.robot

*** Keywords ***
Get Angle
    [Arguments]   ${path}
    ${body}    Send GET    ${path}

Create Angle
    [Arguments]   ${modelUri}    ${data}
    ${body}    Send POST    ${modelUri}/angles?redirect=no&multilingual=yes&accept_warnings=true    ${data}
    [Return]    ${body}

Update Angle
    [Arguments]   ${path}    ${data}
    ${body}    Send PUT    ${path}?multilingual=yes&accept_warnings=true    ${data}
    [Return]    ${body}

Delete Angle
    [Arguments]   ${path}
    Send DELETE    ${path}