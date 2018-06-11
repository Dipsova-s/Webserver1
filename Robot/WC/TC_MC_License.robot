*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Open Browser in Sandbox Mode
Suite Teardown      Close Browser
Test Setup          Go To               ${URL_MC}
Test Teardown       Logout MC
Force Tags          MC    acc_mc

*** Variables ***
${ExpectedLicensedTo}      Product (OR.11.0010)


*** Test Cases ***
Test License
    Login To MC By Admin User
    Wait Until Overview Page Loaded
    Go To License Page
    ${LicensedTo}    Get Licensed To in License Page
    ${LicensedType}    Get Licensed Type in License Page
    Click Hyperlink Overview
    Wait Until Page Contains Element    ${btnOpenModelEA2_800}
    Click Open Model EA2_800 From Overview Page
    Should Start With    ${LicensedTo}    ${ExpectedLicensedTo}

