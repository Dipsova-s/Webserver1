*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go To User defaults Page With Admin User
Suite Teardown      Close Browser
Test Teardown       Go to User Defaults page in MC
Force Tags          acc_mc

*** Test Cases ***
Fill User defaults and verify the data saved successfully with given values
    [Documentation]     This test case is to verify the values changed by user in user defaults options are saved successfully and changes the data back to old values.
    [Tags]      TC_C40197   acc_mc_aci
    Get User defaults and store
    Fill all the User defaults fields
    Click on Save in User defaults
    Go to User Defaults page in MC
    Verify the field values in User defaults page
    Set User defaults fields and Save the values