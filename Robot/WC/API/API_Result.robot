*** Settings ***
Resource            ${EXECDIR}/WC/API/API_Utility.robot

*** Keywords ***
Get Result
    [Arguments]   ${path}
    ${body}    Send GET    ${path}

Create Result
    [Arguments]   ${angleUri}    ${displayUri}
    ${body}    Send POST    /results?redirect=no    {"query_definition":[{"queryblock_type":"base_angle","base_angle":"${angleUri}"},{"queryblock_type":"base_display","base_display":"${displayUri}"}]}
    [Return]    ${body}

Delete Result
    [Arguments]   ${path}
    Send DELETE    ${path}