*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Open Browser in Sandbox Mode
Suite Teardown      Close Browser
Test Setup          Go To               ${URL_MC}
Test Teardown       Logout MC
Force Tags          MC    smk_mc

*** Variables ***
${TEST_BUSINESS_PROCESS}    [ROBOT] Test Business Process
${BUSINESS_PROCESS_NAME}    TestBP
${TEST_USER}                EAPower

*** Test Cases ***
Test Business Process
    Login To MC By Admin User
    Wait Until Overview Page Loaded
    Go to Business Process
    Create New Business Process    ${BUSINESS_PROCESS_NAME}
    Click Enable Business Process By Abbreviation    ${BUSINESS_PROCESS_NAME}
    Click Save Business Process Without Delete
    Go To All Users Page
    Add Business Process To User    ${TEST_USER}    ${BUSINESS_PROCESS_NAME}
    Go to Business Process
    Delete Business Process    ${BUSINESS_PROCESS_NAME}
    Page Should Not Contain Element    ${trRowInBusinessProcessGrid}:contains("${BUSINESS_PROCESS_NAME}")