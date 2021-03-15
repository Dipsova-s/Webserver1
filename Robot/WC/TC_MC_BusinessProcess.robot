*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to MC Then Login With Admin User
Suite Teardown      Logout MC Then Close Browser
Force Tags          acc_mc_s

*** Variables ***
${TEST_BUSINESS_PROCESS}    [ROBOT] Test Business Process
${BUSINESS_PROCESS_NAME}    TestBP
${BUSINESS_PROCESS_NAME2}    TestBP2
${TEST_USER}                EAPower

*** Test Cases ***

Create Multiple Business Processes and Add to User
    [Documentation]     This test creates multiple business process and adds the multiple business process to a user and then delete the multiple business process
    ...                 Risk Covered-This test covers failures while creating multiple business process and adding the process to user and while deleting the process
    [Tags]      TC_C17      TC_C18      acc_mc_aci_s
    Go to Business Process
    Create New Business Process    ${BUSINESS_PROCESS_NAME}
    Click Enable Business Process By Abbreviation    ${BUSINESS_PROCESS_NAME}
    Click Save Business Process Without Delete
    Create New Business Process    ${BUSINESS_PROCESS_NAME2}
    Click Enable Business Process By Abbreviation    ${BUSINESS_PROCESS_NAME2}
    Click Save Business Process Without Delete
    Go To All Users Page
    Add Business Process To User    ${TEST_USER}    ${BUSINESS_PROCESS_NAME}    True
    Add Business Process To User    ${TEST_USER}    ${BUSINESS_PROCESS_NAME2}   True
    Go to Business Process
    Delete Multiple Business Process    ${BUSINESS_PROCESS_NAME}    ${BUSINESS_PROCESS_NAME2}
    Page Should Not Contain Element    ${trRowInBusinessProcessGrid}:contains("${BUSINESS_PROCESS_NAME}")
