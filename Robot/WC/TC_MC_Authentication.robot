*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup               Go To Authentication Page With Admin User
Suite Teardown            Logout MC Then Close Browser
Test Teardown             Reload Authentication Page
Force Tags          MC    acc_mc

*** Variables ***
${AUTHENTICATION_PROVIDER}    ADFS_robot
${DEFAULT_ROLE}    EA2_800_ALL

*** Test Cases ***
Test Authentication
    Input Invalid Trusted Webservers And Warning Should Be Shown
    Save Authenticate And Invalid Trusted Webservers Should Be Cleared
    Check Automatically create users for "ADFS" is ON and disabled
    Check default Is Set Local    local

Test Add New Authentication
    Add New Authentication    Active Directory Federation System Authentication Provider    ${AUTHENTICATION_PROVIDER}    test    ${DEFAULT_ROLE}    https://adfs.everyangle.com/adfs/services/trust/13/usernamemixed    https://ea2auth.everyangle.com/
    Verify New Authentication    ${AUTHENTICATION_PROVIDER}
    Delete Authentication Provider by ID    ${AUTHENTICATION_PROVIDER}




#*****Comment because ADFS can't save without default role*********
#    Input Invalid Trusted Webservers And Warning Should Be Shown
#    Save Authenticate And Invalid Trusted Webservers Should Be Cleared
#    Check Both Local And Domain Are Enabled
#    Save Local Role "EA2_800_ALL" To System Authentication
#    Reload Authentication Page And Role "EA2_800_ALL" Should Be Their
#    Remove Local Role "EA2_800_ALL" From System Authentication