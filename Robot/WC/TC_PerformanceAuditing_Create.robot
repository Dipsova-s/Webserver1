*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Resource            ${EXECDIR}/WC/API/API_Angle.robot
Resource            ${EXECDIR}/WC/API/API_Display.robot
Suite Setup         Set Server Context Variables
Force Tags          performance_s    audit_s

*** Test Cases ***
Verify Audit: Create Angle action performance
    @{itemList1}    Create Angle action performance    Current Server
    @{itemList2}    Create Angle action performance    Base Server

    Performance Should Acceptable    5

    [Teardown]  Run Keywords  Clean Up Items     Current Server    ${itemList1}
    ...         AND           Clean Up Items     Base Server    ${itemList2}

Verify Audit: Create Display action performance
    @{itemList1}    Create Display action performance    Current Server
    @{itemList2}    Create Display action performance    Base Server

    Performance Should Acceptable    5

    [Teardown]  Run Keywords  Clean Up Items     Current Server    ${itemList1}
    ...         AND           Clean Up Items     Base Server    ${itemList2}

*** Keywords ***
Create Angle action performance
    [Arguments]    ${target}

    Run Keyword    Create Context: ${target}
    @{itemList}    Create List
    : FOR    ${INDEX}    IN RANGE    0    ${API_SEED}
    \    Run Keyword    Start Clock: ${target}
    \    ${angleData}    Create Angle    /models/1    PREF_AUDIT_CREATE_ANGLE.json
    \    Run Keyword    Stop Clock: ${target}
    \    ${angleUri}    Get Uri From Response    ${angleData}
    \    Append To List   ${itemList}    ${angleUri}

    [Return]    ${itemList}

Create Display action performance
    [Arguments]    ${target}

    Run Keyword    Create Context: ${target}
    ${angleData}    Create Angle    /models/1    PREF_AUDIT_CREATE_ANGLE.json
    ${angleUri}    Get Uri From Response    ${angleData}
    @{itemList}    Create List    ${angleUri}

    : FOR    ${INDEX}    IN RANGE    0    ${API_SEED}
    \    Run Keyword    Start Clock: ${target}
    \    Create Display    ${angleUri}    PREF_AUDIT_CREATE_DISPLAY.json
    \    Run Keyword    Stop Clock: ${target}

    [Return]    ${itemList}