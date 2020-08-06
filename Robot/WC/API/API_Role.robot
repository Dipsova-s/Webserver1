*** Settings ***
Resource            ${EXECDIR}/WC/API/API_Utility.robot

*** Keywords ***
Create Role
    [Arguments]  ${data}
    ${body}   Send POST   /system/roles?redirect=no   ${data}
    [Return]    ${body}

Get Role
    [Arguments]    ${uri}
    ${body}  Send GET  ${uri}

Delete Role
    [Arguments]  ${uri}
    Send DELETE  ${uri}

