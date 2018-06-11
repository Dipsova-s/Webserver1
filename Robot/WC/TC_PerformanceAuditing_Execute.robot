*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Resource            ${EXECDIR}/WC/API/API_Angle.robot
Resource            ${EXECDIR}/WC/API/API_Display.robot
Resource            ${EXECDIR}/WC/API/API_Result.robot
Force Tags          performance_s    audit_s

*** Test Cases ***
Verify Audit: Execute Angle action performance
    @{itemList1}    Execute Angle action performance    Current Server
    @{itemList2}    Execute Angle action performance    Base Server

    Performance Should Acceptable    5

    [Teardown]  Run Keywords  Clean Up Items     Current Server    ${itemList1}
    ...         AND           Clean Up Items     Base Server    ${itemList2}

*** Keywords ***
Execute Angle action performance
    [Arguments]    ${target}

    Run Keyword     Create Context: ${target}
    ${angleData}    Create Angle    /models/1    PREF_AUDIT_CREATE_ANGLE.json
    ${angleUri}     Get Uri From Response    ${angleData}
    ${displayUri}   Get Display Uri From Angle Response    ${angleData}    0
    @{itemList}     Create List    ${angleUri}

    : FOR    ${INDEX}     IN RANGE    0    ${API_SEED}
    \    Run Keyword      Create Context: ${target}
    \    Run Keyword    Start Clock: ${target}
    \    ${resultData}    Create Result    ${angleUri}    ${displayUri}
    \    Run Keyword    Stop Clock: ${target}
    \    ${resultUri}     Get Uri From Response    ${resultData}
    \    Append To List   ${itemList}    ${resultUri}

    [Return]    ${itemList}