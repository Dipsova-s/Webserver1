*** Settings ***
Resource            ${EXECDIR}/WC/API/API_Utility.robot

*** Keywords ***
Update User Settings
    [Arguments]   ${path}   ${data}
    ${body}    Send PUT    ${path}     ${data}
    [Return]    ${body}