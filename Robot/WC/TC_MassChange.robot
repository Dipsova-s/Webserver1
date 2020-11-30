*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Search Page
Force Tags        	acc_wc

*** Variables ***
${TEST_VERIFY_PERSONAL_NOTE_TO_ANGLE_BY_SEARCH_PAGE}            Angle For General Test
${TEST_VERIFY_STARRED_TO_ANGLE_BY_SEARCH_PAGE}                  Angle For General Test
${TEST_VERIFY_TEMPLATE_TO_ANGLE_BY_SEARCH_PAGE}         [ROBOT] Test Verify Template To Angle Via Search Page
${TEST_VERIFY_PUBLISH_TO_ANGLE_BY_SEARCH_PAGE}          [ROBOT] Test Verify Publish To Angle Via Search Page
${TEST_VERIFY_VALIDATE_TO_ANGLE_BY_SEARCH_PAGE}         [ROBOT] Test Verify Validate To Angle Via Search Page

*** Test Cases ***
Verify Personal Note To Angle Via Search Page
    [Documentation]     This test verifies Personal note added to angle via Masschange
    [Tags]  acc_wc_aci  TC_C231392
    Set Personal Note To Angle Via Search Page    ${TEST_VERIFY_PERSONAL_NOTE_TO_ANGLE_BY_SEARCH_PAGE}

Verify Starred To Angle Via Search Page
    [Documentation]     This test verifies Angle set to starred via masschange
    [Tags]  acc_wc_aci  TC_C231392
    Set Starred To Angle Via Search Page    ${TEST_VERIFY_STARRED_TO_ANGLE_BY_SEARCH_PAGE}

Verify Template To Angle Via Search Page
    [Documentation]     This test verifies Angle set to template via masschange
    [Tags]  acc_wc_aci  TC_C231392
    Set Template To Angle Via Search Page    PD    ${TEST_VERIFY_TEMPLATE_TO_ANGLE_BY_SEARCH_PAGE}

Verify Publish To Angle Via Search Page
    [Documentation]     This test verifies Angle set to public via masschange
    [Tags]  acc_wc_aci  TC_C231392
    Set Publish To Angle Via Search Page    PD    ${TEST_VERIFY_PUBLISH_TO_ANGLE_BY_SEARCH_PAGE}

Verify Validate To Angle Via Search
    [Documentation]     This test verifies Angle validated via masschange
    [Tags]  TC_C231392
    Set Validate To Angle Via Search Page    PD    ${TEST_VERIFY_VALIDATE_TO_ANGLE_BY_SEARCH_PAGE}