*** Settings ***
Resource            ${EXECDIR}/WC/API/API_Utility.robot

*** Keywords ***
Enable Model Languages
    [Arguments]  ${uri}  ${languages}
    ${body}  Send PUT  ${uri}  {"active_languages":${languages}}
    [Return]    ${body}
