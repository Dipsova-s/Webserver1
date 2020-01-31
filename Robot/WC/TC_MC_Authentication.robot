*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup               Go To Authentication Page With Admin User
Suite Teardown            Logout MC Then Close Browser
Test Teardown             Reload Authentication Page
Force Tags          acc_mc

*** Variables ***
${AUTHENTICATION_PROVIDER}    ADFS_robot
${DEFAULT_ROLE}    EA2_800_ALL


*** Test Cases ***
Test Authentication
    [Documentation]     This test verifies authentication using invalid and valid trusted webservers
    ...                 Risk covered: This test covers the failures in the authentication module with all the possibilities 
    Input Invalid Trusted Webservers And Warning Should Be Shown
    Save Authenticate And Invalid Trusted Webservers Should Be Cleared
    Check Automatically create users for "ADFS" is ON and disabled
    Check default Is Set Local    local

Test Add New Authentication
    [Documentation]     This test add new authentication, verify and then delete the authentication
    ...                 Risk covered: This test covers the failures in the authentication module with all the possibilities 
    Add New Authentication    Active Directory Federation System Authentication Provider    ${AUTHENTICATION_PROVIDER}    test    ${DEFAULT_ROLE}    https://adfs.everyangle.com/adfs/services/trust/13/usernamemixed    https://ea2auth.everyangle.com/
    Verify New Authentication    ${AUTHENTICATION_PROVIDER}
    Delete Authentication Provider by ID    ${AUTHENTICATION_PROVIDER}