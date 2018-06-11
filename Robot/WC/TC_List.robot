*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Search Page
Force Tags          acceptance     acc_wc

*** Variables ***
${TEST_CREATE_LIST_DISPLAY_FROM_PIVOT}      [ROBOT] Test Create List Display From Pivot
${TEST_VERIFY_QUICK_FILTER_OPTIONS}         [ROBOT] Test Verify Quick Filter Options
${TEST_RE_ADD_FIELD_TO_DISPLAY_LIST}        [ROBOT] Verify Re Add Field To Display List

*** Test Cases ***
Verify Create List Display From Pivot And Delete It Test
    Create List Display From Pivot And Delete It    List From Pivot

Verify Quick Filter Options
    Quick Filter Options For Number    Sales document schedule line    ${TEST_VERIFY_QUICK_FILTER_OPTIONS}    Quantity    "quantity"

Verify Add A Duplicate Field To Display List Test
    ${firstFieldId}         Set Variable       ServiceLevel
    ${firstFieldKeyword}    Set Variable       Service Level
    ${secondFieldId}        Set Variable       ExecutionStatus
    ${secondFieldKeyword}   Set Variable       Execution

    Create Angle From Object List And Save    PD    ${TEST_RE_ADD_FIELD_TO_DISPLAY_LIST}
    Add Column By Search And Add To List Display If Not Exist    ${firstFieldId}    ${firstFieldKeyword}
    Click Header by Data Field Angle Grid List Display    ${firstFieldId}
    Click Sort Descending From Head Column to List
    ${expect}    Get Cell Value From List Display    ${firstFieldId}    set
    Add Column By Search And Add To List Display    ${secondFieldKeyword}     ${secondFieldId}
    Add Column By Search And Add To List Display    ${firstFieldKeyword}      ${firstFieldId}
    ${result}    Get Cell Value From List Display    ${firstFieldId}    set
    Should Be Equal    ${expect}    ${result}
    Element Should Contain    ${headerLastColumn}    Service Level
    Back To Search And Delete Angle Are Created    ${TEST_RE_ADD_FIELD_TO_DISPLAY_LIST}