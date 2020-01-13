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

Fill System Settings and verify the data saved successfully with given values
    [Documentation]      Verify the values changed by user in System setings page are saved successfully and changes the data back to old values.
    [Tags]  TC_C592
    Login To MC By Admin User
    Wait Until Overview Page Loaded
    Go To System Settings Page
    Verify System Settings Page Is Ready
    Get the System Settings page field values
    Fill the System settings page field values
    Click Save System Settings
    Verify System Settings Page Is Ready
    Verify the System Settings page field values
    Set the System settings page field values
    Click Save System Settings

