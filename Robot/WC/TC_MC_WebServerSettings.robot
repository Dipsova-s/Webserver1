*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Open Browser in Sandbox Mode
Suite Teardown      Close Browser
Test Setup          Go To               ${URL_MC}
Test Teardown       Logout MC
Force Tags          MC    smk_mc


*** Test Cases ***
Test Basic Web Server Settings
    Login To MC By Admin User
    Wait Until Overview Page Loaded
    Go To Web Server Settings Page
    Verify Web Server Settings Page Is Ready
    Verify Input JWPlayer HTML Tag