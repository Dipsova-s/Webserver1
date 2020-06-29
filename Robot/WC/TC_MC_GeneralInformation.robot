*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to MC Then Login With Admin User
Suite Teardown      Logout MC Then Close Browser
Force Tags          acc_mc


*** Test Cases ***
Validate General information in model's Suggested fields
    [Documentation]     This test is to validate General information in model's Suggested fields
    [Tags]   TC_C675

    Click Side Menu Models
    Click Side Menu Models EA2_800
    Click Side Menu Suggested Fields
    Precondition-Clear all suggested fields for all objects
    Validate Total number of suggested fields in the model should be "0"
    Validate Number of objects that have suggested fields should be "0"
    Validate Number of objects that do not have suggested fields should be greater than zero
    Validate Suggested fields settings last changed should have username, date and time