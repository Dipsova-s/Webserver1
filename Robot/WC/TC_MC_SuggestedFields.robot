*** Settings ***
Resource                  ${EXECDIR}/resources/WCSettings.robot
Suite Setup               Go to MC Then Login With Admin User
Suite Teardown            Logout MC Then Close Browser
Test Setup                Go To EA2_800 Suggested Fields Page

*** Variables ***
${PDItemObject}           PD
${BusinessProcess}        S2D

*** Test Cases ***
Test Suggested Fields For Single Object
    [Tags]   acc_mc
    Set Suggested Fields For Single Object    ${PDItemObject}    ${BusinessProcess}
    Verify Suggested Fields After Set    ${PDItemObject}    ${BusinessProcess}
    Click Clear All Suggested Fields

Test Suggested Fields For Basic List
    [Tags]   acc_mc
    Set Suggested Fields For Basic List    ${PDItemObject}    ${BusinessProcess}
    Set Suggested Fields For Clear All Suggestion    ${PDItemObject}    ${BusinessProcess}

Test Suggested Fields For Default Template
    [Tags]   acc_mc
    Set Suggested Fields For Default Template    ${PDItemObject}    ${BusinessProcess}
    Set Suggested Fields For Clear All Suggestion    ${PDItemObject}    ${BusinessProcess}

Test Suggested Fields For All Template
    [Tags]   acc_mc
    Set Suggested Fields For All Template    ${PDItemObject}    ${BusinessProcess}
    Set Suggested Fields For Clear All Suggestion    ${PDItemObject}    ${BusinessProcess}

Validate General information in model's Suggested fields
    [Documentation]     This test is to validate General information in model's Suggested fields
    [Tags]   TC_C675   acc_mc_s

    Precondition-Clear all suggested fields for all objects
    Validate Total number of suggested fields in the model should be "0"
    Validate Number of objects that have suggested fields should be "0"
    Validate Number of objects that do not have suggested fields should be greater than zero
    Validate Suggested fields settings last changed should have username, date and time