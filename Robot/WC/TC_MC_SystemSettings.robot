*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Open Browser in Sandbox Mode
Suite Teardown      Close Browser
Test Setup          Go To               ${URL_MC}
Test Teardown       Logout MC
Force Tags          MC    smk_mc


*** Test Cases ***
Test System Settings
    Login To MC By Admin User
    Wait Until Overview Page Loaded
    Go To System Settings Page
    Verify System Settings Page Is Ready
    Verify Instance To Keep Per Model
    Verify SSL Email Settings
    Verify Default Maximum Export Page Size Is Exist