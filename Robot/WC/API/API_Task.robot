*** Settings ***
Resource            ${EXECDIR}/WC/API/API_Utility.robot

*** Keywords ***
Create Task
    [Arguments]    ${data}
    ${body}    Send POST    /tasks?redirect=no    ${data}
    [Return]    ${body}
