*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Search Page

*** Variables ***
${TEST_VERIFY_ANGLE_DETAILS}        Angle For General Test
${TEST_LAST_EXECUTION_TIME_NAME}    Angle For General Test
${TEST_VERIFY_ANGLE_DESCRIPTION_WITH_MULTI_LANGUAGES}    [ROBOT] Test Verify Angle Description With Multi Languages

*** Test Cases ***
Verify Angle Details Test
    [Tags]    smoke    smk_wc
    Verify Angle Details    ${TEST_VERIFY_ANGLE_DETAILS}

Last Angle Execute Time Angle Test
    [Tags]    smoke    smk_wc
    Verify Last Execute Time Angle     ${TEST_LAST_EXECUTION_TIME_NAME}

Verify Angle Description With Multi Languages
    [Tags]    acceptance    acc_wc
    Create Adhoc Angle From Object List    PD    ${TEST_VERIFY_ANGLE_DESCRIPTION_WITH_MULTI_LANGUAGES}
    Click Angle Detail Description Tab
    Input Angle Description    English Description
    Click Add Language Button
    Selct Dutch Language From Language List
    Input Angle Name    Dutch Angle Name
    Input Angle Description    Dutch Description
    Click Add Language Button
    Selct French Language From Language List
    Input Angle Name    French Angle Name
    Input Angle Description    French Description
    Click Save Angle
    Click Edit Angle
    Click Angle Detail Description Tab
    Select English Language On Angle
    Angle Name Should Be Equal    ${TEST_VERIFY_ANGLE_DESCRIPTION_WITH_MULTI_LANGUAGES}
    Angle Description Should Be Equal    English Description
    Select Dutch Language On Angle
    Angle Name Should Be Equal    Dutch Angle Name
    Angle Description Should Be Equal    Dutch Description
    Select French Language On Angle
    Angle Name Should Be Equal    French Angle Name
    Angle Description Should Be Equal    French Description
    Select English Language On Angle
    Input Angle Description    ${EMPTY}
    Click Save Angle
    Click Edit Angle
    Click Angle Detail Description Tab
    Angle English Language Should Be Available
    Click Delete French Language Button
    Click Save Angle
    Click Edit Angle
    Click Angle Detail Description Tab
    Angle French Language Should Not Available
    Close Angle Detail Popup
    Back To Search And Delete Angle Are Created    ${TEST_VERIFY_ANGLE_DESCRIPTION_WITH_MULTI_LANGUAGES}
