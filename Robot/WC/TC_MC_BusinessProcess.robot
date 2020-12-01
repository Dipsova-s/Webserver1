*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to MC Then Login With Admin User
Suite Teardown      Close Browser
Force Tags          acc_mc

*** Variables ***
${TEST_BUSINESS_PROCESS}    [ROBOT] Test Business Process
${BUSINESS_PROCESS_NAME}    TestBP
${BUSINESS_PROCESS_NAME2}    TestBP2
${TEST_USER}                EAPower

*** Test Cases ***
Create Business Process and Delete
    [Documentation]     This test creates business process and delete the business process
    ...                 Risk Covered-This test covers failures while creating business process and deleting the process
    Go to Business Process
    Create New Business Process    ${BUSINESS_PROCESS_NAME}
    Click Enable Business Process By Abbreviation    ${BUSINESS_PROCESS_NAME}
    Click Save Business Process Without Delete
    Delete Business Process    ${BUSINESS_PROCESS_NAME}
    Page Should Not Contain Element    ${trRowInBusinessProcessGrid}:contains("${BUSINESS_PROCESS_NAME}")

Create Business Process and Add to User
    [Documentation]     This test creates business process and adds the business process to a user and then delete the business process
    ...                 Risk Covered-This test covers failures while creating business process and adding the process to user and while deleting the process
    Go to Business Process
    Create New Business Process    ${BUSINESS_PROCESS_NAME}
    Click Enable Business Process By Abbreviation    ${BUSINESS_PROCESS_NAME}
    Click Save Business Process Without Delete
    Go To All Users Page
    Add Business Process To User    ${TEST_USER}    ${BUSINESS_PROCESS_NAME}    True
    Go to Business Process
    Delete Business Process    ${BUSINESS_PROCESS_NAME}
    Page Should Not Contain Element    ${trRowInBusinessProcessGrid}:contains("${BUSINESS_PROCESS_NAME}")

Create Multiple Business Processes and Add to User
    [Documentation]     This test creates multiple business process and adds the multiple business process to a user and then delete the multiple business process
    ...                 Risk Covered-This test covers failures while creating multiple business process and adding the process to user and while deleting the process
    [Tags]  acc_mc_aci
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
