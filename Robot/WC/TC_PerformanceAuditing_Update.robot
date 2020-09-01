*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Resource            ${EXECDIR}/WC/API/API_Angle.robot
Resource            ${EXECDIR}/WC/API/API_Display.robot
Suite Setup         Set Server Context Variables
Force Tags          performance_s    audit_s

*** Test Cases ***
Verify Audit: Update Angle action performance
    @{itemList1}    Update Angle action performance    Current Server
    @{itemList2}    Update Angle action performance    Base Server

    Performance Should Acceptable    5

    [Teardown]  Run Keywords  Clean Up Items     Current Server    ${itemList1}
    ...         AND           Clean Up Items     Base Server    ${itemList2}

Verify Audit: Update Display action performance
    @{itemList1}    Update Display action performance    Current Server
    @{itemList2}    Update Display action performance    Base Server

    Performance Should Acceptable    5

    [Teardown]  Run Keywords  Clean Up Items     Current Server    ${itemList1}
    ...         AND           Clean Up Items     Base Server    ${itemList2}

*** Keywords ***
Update Angle action performance
    [Arguments]    ${target}

    Run Keyword    Create Context: ${target}
    ${angleData}    Create Angle    /models/1    PREF_AUDIT_CREATE_ANGLE.json
    ${angleUri}    Get Uri From Response    ${angleData}
    @{itemList}    Create List    ${angleUri}

    : FOR    ${INDEX}    IN RANGE    0    ${API_SEED}
    \    Run Keyword    Start Clock: ${target}
    \    Update Angle    ${angleUri}    {"multi_lang_name":[{"lang":"en","text":"${INDEX}"}]}
    \    Run Keyword    Stop Clock: ${target}

    [Return]    ${itemList}

Update Display action performance
    [Arguments]    ${target}

    Run Keyword    Create Context: ${target}
    ${angleData}    Create Angle    /models/1    PREF_AUDIT_CREATE_ANGLE.json
    ${angleUri}    Get Uri From Response    ${angleData}
    @{itemList}    Create List    ${angleUri}
    ${displayUri}    Get Display Uri From Angle Response    ${angleData}    0

    : FOR    ${INDEX}    IN RANGE    0    ${API_SEED}
    \    Run Keyword    Start Clock: ${target}
    \    Update Display    ${displayUri}    {"multi_lang_name":[{"lang":"en","text":"${INDEX}"}]}
    \    Run Keyword    Stop Clock: ${target}

    [Return]    ${itemList}