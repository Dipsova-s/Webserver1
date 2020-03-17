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
    Set Personal Note To Angle Via Search Page    ${TEST_VERIFY_PERSONAL_NOTE_TO_ANGLE_BY_SEARCH_PAGE}

Verify Starred To Angle Via Search Page
    [Tags]  acc_wc_aci
    Set Starred To Angle Via Search Page    ${TEST_VERIFY_STARRED_TO_ANGLE_BY_SEARCH_PAGE}

Verify Template To Angle Via Search Page
    [Tags]  acc_wc_aci
    Set Template To Angle Via Search Page    PD    ${TEST_VERIFY_TEMPLATE_TO_ANGLE_BY_SEARCH_PAGE}

Verify Publish To Angle Via Search Page
    [Tags]  acc_wc_aci
    Set Publish To Angle Via Search Page    PD    ${TEST_VERIFY_PUBLISH_TO_ANGLE_BY_SEARCH_PAGE}

Verify Validate To Angle Via Search
    Set Validate To Angle Via Search Page    PD    ${TEST_VERIFY_VALIDATE_TO_ANGLE_BY_SEARCH_PAGE}