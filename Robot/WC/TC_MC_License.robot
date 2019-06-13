*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Open Browser in Sandbox Mode
Suite Teardown      Close Browser
Test Setup          Go To               ${URL_MC}
Test Teardown       Logout MC
Force Tags          MC    acc_mc

*** Test Cases ***
Test License
    Login To MC By Admin User
    Wait Until Overview Page Loaded
    Go To License Page
    ${LicensedTo}    Get Licensed To in License Page
    ${LicensedExpiration}    Get Licensed Expiration Date in License Page
    ${LicensedType}    Get Licensed Type in License Page
    Click Hyperlink Overview
    Click Open Model EA2_800 From Overview Page
    ${ExpectedLicensedTo}    Get Licensed To in Overview Page
    ${ExpectedLicensedExpirationDate}    Get Licensed Expiration Date in Overview Page
    ${ExpectedLicensedType}    Get Licensed Type in Overview Page
    Should Start With    ${LicensedTo}    ${ExpectedLicensedTo}
    Should Start With    ${LicensedExpiration}    ${ExpectedLicensedExpirationDate}
    Should Start With    ${LicensedType}    ${ExpectedLicensedType}

