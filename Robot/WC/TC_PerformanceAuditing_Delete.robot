*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Resource            ${EXECDIR}/WC/API/API_Angle.robot
Resource            ${EXECDIR}/WC/API/API_Display.robot
Suite Setup         Set Server Context Variables
Force Tags          performance_s    audit_s

*** Test Cases ***
Verify Audit: Delete Angle action performance
    @{itemList1}    Delete Angle action performance    Current Server
    @{itemList2}    Delete Angle action performance    Base Server

    Performance Should Acceptable    5

Verify Audit: Delete Display action performance
    @{itemList1}    Delete Display action performance    Current Server
    @{itemList2}    Delete Display action performance    Base Server

    Performance Should Acceptable    5

    [Teardown]  Run Keywords  Clean Up Items     Current Server    ${itemList1}
    ...         AND           Clean Up Items     Base Server    ${itemList2}

*** Keywords ***
Delete Angle action performance
    [Arguments]    ${target}

    @{itemList}    Create List
    : FOR    ${INDEX}    IN RANGE    0    ${API_SEED}
    \    Run Keyword    Create Context: ${target}
    \    ${angleData}    Create Angle    /models/1    PREF_AUDIT_CREATE_ANGLE.json
    \    ${angleUri}    Get Uri From Response    ${angleData}
    \    Append To List   ${itemList}    ${angleUri}

    : FOR    ${itemUri}    IN    @{itemList}
    \    Run Keyword    Create Context: ${target}
    \    Run Keyword    Start Clock: ${target}
    \    Delete Angle    ${itemUri}
    \    Run Keyword    Stop Clock: ${target}

    [Return]    ${itemList}

Delete Display action performance
    [Arguments]    ${target}

    Run Keyword    Create Context: ${target}
    ${angleData}    Create Angle    /models/1    PREF_AUDIT_CREATE_ANGLE.json
    ${angleUri}    Get Uri From Response    ${angleData}
    @{itemList}    Create List    ${angleUri}

    @{displayUriList}    Create List
    : FOR    ${INDEX}    IN RANGE    0    ${API_SEED}
    \    Run Keyword    Create Context: ${target}
    \    ${displayData}    Create Display    ${angleUri}    PREF_AUDIT_CREATE_DISPLAY.json
    \    ${displayUri}    Get Uri From Response    ${displayData}
    \    Append To List   ${displayUriList}    ${displayUri}

    : FOR    ${itemUri}    IN    @{displayUriList}
    \    Run Keyword    Create Context: ${target}
    \    Run Keyword    Start Clock: ${target}
    \    Delete Display    ${itemUri}
    \    Run Keyword    Stop Clock: ${target}

    [Return]    ${itemList}