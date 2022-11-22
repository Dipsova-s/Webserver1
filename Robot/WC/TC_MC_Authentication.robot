*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go To Authentication Page With Admin User
Suite Teardown      Close Browser
Test Teardown             Reload Authentication Page
Force Tags          acc_mc

*** Variables ***
${AUTHENTICATION_PROVIDER}    ADFS_robot
${DEFAULT_ROLE}    EA2_800_ALL


*** Test Cases ***
Test Authentication
    [Documentation]     This test verifies authentication using invalid and valid trusted webservers
    ...                 Risk covered: This test covers the failures in the authentication module with all the possibilities
    [Tags]  acc_mc_aci      TC_C561
    Input Invalid Trusted Webservers And Warning Should Be Shown
    Save Authenticate And Invalid Trusted Webservers Should Be Cleared
    Check Automatically create users for "ADFS" is ON and disabled 