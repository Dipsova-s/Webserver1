*** Settings ***
Resource            ${EXECDIR}/WC/API/API_Utility.robot

*** Keywords ***
Get Components
    ${body}    Send GET    /csm/componentservices
    [Return]    ${body}