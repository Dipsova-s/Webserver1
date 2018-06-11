*** Settings ***
Resource            ${EXECDIR}/WC/API/API_Utility.robot

*** Keywords ***
Get Display
    [Arguments]   ${path}
    ${body}    Send GET    ${path}

Create Display
    [Arguments]   ${angleUri}    ${data}
    ${body}    Send POST    ${angleUri}/displays?redirect=no&multilingual=yes&accept_warnings=true    ${data}
    [Return]    ${body}

Update Display
    [Arguments]   ${path}    ${data}
    ${body}    Send PUT    ${path}?multilingual=yes&accept_warnings=true    ${data}
    [Return]    ${body}

Delete Display
    [Arguments]   ${path}
    Send DELETE    ${path}

Get Display From Angle Response
    [Arguments]    ${angle}    ${index}
    ${displays}    Get From Dictionary    ${angle}    display_definitions
    ${display}     Get From List    ${displays}    ${index}
    [Return]    ${display}

Get Display Uri From Angle Response
    [Arguments]    ${angle}    ${index}
    ${display}    Get Display From Angle Response    ${angle}    ${index}
    ${displayUri}    Get Uri From Response    ${display}
    [Return]    ${displayUri}