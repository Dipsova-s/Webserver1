*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Open Browser in Sandbox Mode
Suite Teardown      Close Browser
Test Setup          Go To               ${URL_MC}
Test Teardown       Logout MC
Force Tags        	acceptance_unused

*** Variables ***
${TEST_BUSINESS_PROCESS}    [ROBOT] Test Delete Business Process
${BUSINESS_PROCESS_NAME}    TestDelBP
${TEST_USER}    EATestUserRole

*** Test Cases ***
Test Delete Business Process
    Login To MC By Admin User
    Wait Until Overview Page Loaded
    Create New Business Process    ${BUSINESS_PROCESS_NAME}
    Click Enable Business Process By Abbreviation    ${BUSINESS_PROCESS_NAME}
    Click Save Business Process Without Delete
    Click Default Business Process For User    ${BUSINESS_PROCESS_NAME}
    Delete Business Process    ${BUSINESS_PROCESS_NAME}
    Click Default Business Process For User    ${BUSINESS_PROCESS_NAME}
    Go To All Users Page
    Add Business Process To User    ${TEST_USER}    ${BUSINESS_PROCESS_NAME}
    Delete Business Process    ${BUSINESS_PROCESS_NAME}
    Page Should Contain Element    ${trRowInBusinessProcessGrid}:contains("${BUSINESS_PROCESS_NAME}")
    Go To All Users Page
    Add Business Process To User    ${TEST_USER}    ${BUSINESS_PROCESS_NAME}
    Delete Business Process    ${BUSINESS_PROCESS_NAME}
    Page Should Not Contain Element    ${trRowInBusinessProcessGrid}:contains("${BUSINESS_PROCESS_NAME}")
