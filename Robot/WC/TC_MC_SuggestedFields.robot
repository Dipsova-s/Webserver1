*** Settings ***
Resource                  ${EXECDIR}/resources/WCSettings.robot
Suite Setup               Go To Suggested Fields Page With Admin User
Suite Teardown            Logout MC Then Close Browser
Test Teardown             Reload Suggested Fields Page

*** Variables ***
${ObjectName}             PD
${BusinessProcess}        S2D

*** Test Cases ***
Test Suggested Fields For Single Object
    [Tags]   acc_mc
    Set Suggested Fields For Single Object    ${ObjectName}    ${BusinessProcess}
    Verify Suggested Fields After Set    ${ObjectName}    ${BusinessProcess}
    Click Clear All Suggested Fields

Test Suggested Fields For Basic List
    [Tags]   acc_mc
    Set Suggested Fields For Basic List    ${ObjectName}    ${BusinessProcess}
    Set Suggested Fields For Clear All Suggestion    ${ObjectName}    ${BusinessProcess}

Test Suggested Fields For Default Template
    [Tags]   acc_mc
    Set Suggested Fields For Default Template    ${ObjectName}    ${BusinessProcess}
    Set Suggested Fields For Clear All Suggestion    ${ObjectName}    ${BusinessProcess}

Test Suggested Fields For All Template
    [Tags]   acc_mc
    Set Suggested Fields For All Template    ${ObjectName}    ${BusinessProcess}
    Set Suggested Fields For Clear All Suggestion    ${ObjectName}    ${BusinessProcess}

Validate General information in model's Suggested fields
    [Documentation]     This test is to validate General information in model's Suggested fields
    [Tags]   TC_C675   acc_mc_s

    Precondition-Clear all suggested fields for all objects
    Validate Total number of suggested fields in the model should be "0"
    Validate Number of objects that have suggested fields should be "0"
    Validate Number of objects that do not have suggested fields should be greater than zero
    Validate Suggested fields settings last changed should have username, date and time