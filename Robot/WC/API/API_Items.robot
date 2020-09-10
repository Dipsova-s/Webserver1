*** Settings ***
Resource            ${EXECDIR}/WC/API/API_Utility.robot

*** Keywords ***
Get Items
    [Arguments]   ${query}
    ${body}    Send GET    /items?${query}
    [Return]    ${body}